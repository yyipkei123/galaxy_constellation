import type { CoreCategory } from '@/data';
import { formatEnriched } from './format';

export type JourneyStageKey = 'acquire' | 'convert' | 'capture' | 'grow';

export interface CrossLensJourneyStage {
  key: JourneyStageKey;
  title: string;
  href: string;
  metricLabel: string;
  metricValue: string;
  description: string;
  secondaryCopy?: string;
}

export interface CrossLensJourney {
  headline: string;
  stages: CrossLensJourneyStage[];
}

interface JourneyCorridorInput {
  id?: unknown;
  name?: unknown;
  priorityIndex?: unknown;
}

interface JourneySegmentInput {
  name?: unknown;
  opportunityIndex?: unknown;
  categories?: Partial<Record<CoreCategory, { leakagePct?: unknown } | null | undefined>> | null;
  crossPropertyCashBand?: unknown;
}

export interface CrossLensJourneyInput {
  corridors?: Array<JourneyCorridorInput | null | undefined> | null;
  segments?: Array<JourneySegmentInput | null | undefined> | null;
}

const categoryKeys = ['hospitality', 'fnb', 'entertainment', 'retailLuxury'] as const satisfies readonly CoreCategory[];
const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;
const unsafeValuePattern = /NaN|Infinity/i;

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'hospitality',
  fnb: 'F&B',
  entertainment: 'entertainment',
  retailLuxury: 'luxury retail',
};

interface SafeCorridor {
  id: string;
  name: string;
  priorityIndex: number;
}

interface SafeSegment {
  name: string;
  opportunityIndex: number;
  leakagePct: number;
  leakageCategory: CoreCategory;
  crossPropertyCashBand: string;
}

function isUnsafeText(value: string) {
  return bannedCdeTokenPattern.test(value) || unsafeValuePattern.test(value);
}

function safeText(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;

  const normalizedValue = value.trim();
  if (!normalizedValue || isUnsafeText(normalizedValue)) return fallback;

  return normalizedValue;
}

function safeSlug(value: unknown, fallback: string) {
  const slug = safeText(value, fallback);

  return /^[a-z0-9_-]+$/i.test(slug) ? slug : fallback;
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function nonNegativeNumber(value: unknown, fallback = 0) {
  return Math.max(0, finiteNumber(value, fallback));
}

function percentNumber(value: unknown, fallback = 0) {
  return Math.min(100, Math.max(0, finiteNumber(value, fallback)));
}

function safeBand(value: unknown) {
  const fallback = '0-0k equiv./mo';

  if (typeof value !== 'string' || isUnsafeText(value)) return fallback;

  try {
    return formatEnriched(value, 'band');
  } catch {
    return fallback;
  }
}

function normalizeCorridor(corridor: JourneyCorridorInput | null | undefined): SafeCorridor {
  return {
    id: safeSlug(corridor?.id, 'korea'),
    name: safeText(corridor?.name, 'Korea'),
    priorityIndex: nonNegativeNumber(corridor?.priorityIndex),
  };
}

function normalizeSegment(segment: JourneySegmentInput | null | undefined): SafeSegment {
  const leakageByCategory = categoryKeys.map((category) => ({
    category,
    leakagePct: percentNumber(segment?.categories?.[category]?.leakagePct),
  }));
  const dominantLeakage = leakageByCategory.reduce(
    (dominant, current) => (current.leakagePct > dominant.leakagePct ? current : dominant),
    leakageByCategory[0],
  );

  return {
    name: safeText(segment?.name, 'Priority segment'),
    opportunityIndex: nonNegativeNumber(segment?.opportunityIndex),
    leakagePct: dominantLeakage.leakagePct,
    leakageCategory: dominantLeakage.category,
    crossPropertyCashBand: safeBand(segment?.crossPropertyCashBand),
  };
}

function pickTopByIndex<T>(items: T[], getIndex: (item: T) => number, fallback: T) {
  return items.reduce(
    (topItem, item) => (getIndex(item) > getIndex(topItem) ? item : topItem),
    fallback,
  );
}

export function buildCrossLensJourney({ corridors, segments }: CrossLensJourneyInput): CrossLensJourney {
  const safeCorridors = (corridors ?? []).map(normalizeCorridor);
  const safeSegments = (segments ?? []).map(normalizeSegment);
  const topCorridor = pickTopByIndex(
    safeCorridors,
    (corridor) => corridor.priorityIndex,
    normalizeCorridor(null),
  );
  const topSegment = pickTopByIndex(
    safeSegments,
    (segment) => segment.opportunityIndex,
    normalizeSegment(null),
  );

  return {
    headline: [
      `Acquire ${topCorridor.name}`,
      `convert ${topSegment.name}`,
      'capture leakage',
      'and grow through activation as one connected loop across decision lenses.',
    ].join(', '),
    stages: [
      {
        key: 'acquire',
        title: 'Acquire',
        href: `/corridors/${topCorridor.id}`,
        metricLabel: 'Corridor priority',
        metricValue: formatEnriched(topCorridor.priorityIndex, 'index'),
        description: `Prioritize ${topCorridor.name} demand, then hand the audience to segment conversion.`,
      },
      {
        key: 'convert',
        title: 'Convert',
        href: '/segments',
        metricLabel: 'Segment opportunity',
        metricValue: formatEnriched(topSegment.opportunityIndex, 'index'),
        description: `Match the next best audience to ${topSegment.name} and its conversion-ready profile.`,
      },
      {
        key: 'capture',
        title: 'Capture',
        href: '/leakage',
        metricLabel: `${categoryLabels[topSegment.leakageCategory]} leakage`,
        metricValue: formatEnriched(topSegment.leakagePct, 'pct'),
        description: 'Recover off-property headroom before the next activation decision.',
      },
      {
        key: 'grow',
        title: 'Grow',
        href: '/activation',
        metricLabel: 'Growth band',
        metricValue: formatEnriched(topSegment.crossPropertyCashBand, 'band'),
        description: 'Activate the best play, then use measurement as the secondary proof loop.',
        secondaryCopy: 'Measurement confirms lift after activation scales.',
      },
    ],
  };
}
