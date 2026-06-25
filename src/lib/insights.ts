import { CORE_CATEGORIES, type CoreCategory, type Methodology, type Segment } from '@/data';
import { formatEnriched } from './format';

export type InsightSeverity = 'critical' | 'watch' | 'momentum';
export type InsightRoute = '/' | '/segments' | '/leakage' | '/activation' | '/propensity';

export interface InsightEvidence {
  label: string;
  value: string;
}

export interface InsightFinding {
  id: string;
  title: string;
  summary: string;
  action: string;
  href: InsightRoute;
  priority: number;
  severity: InsightSeverity;
  segmentId: string;
  segmentName: string;
  category?: CoreCategory;
  evidence: InsightEvidence[];
}

export interface FusionStep {
  label: string;
  title: string;
  description: string;
  value: string;
}

export interface InsightNarrative {
  title: string;
  eyebrow: string;
  summary: string;
  findings: InsightFinding[];
  fusionSteps: FusionStep[];
  chartCallout: string;
}

export interface LeakageDriver {
  category: CoreCategory;
  label: string;
  leakagePct: number;
  walletIndex: number;
  score: number;
}

const CATEGORY_LABELS: Record<CoreCategory, string> = {
  hospitality: 'hospitality',
  fnb: 'F&B',
  entertainment: 'entertainment',
  retailLuxury: 'luxury retail',
};

const CATEGORY_ACTIONS: Record<CoreCategory, string> = {
  hospitality: 'Open leakage view and build a hospitality win-back audience.',
  fnb: 'Use dining reservation timing to convert off-property F&B demand.',
  entertainment: 'Bundle Galaxy Arena or entertainment access before competitor events pull visits away.',
  retailLuxury: 'Route high-index guests into Promenade privilege and private retail appointments.',
};

function finiteValue(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function safeBand(value: unknown) {
  const text = safeText(value, 'Indexed band equiv./mo');

  try {
    return formatEnriched(text, 'band');
  } catch {
    return 'Indexed band equiv./mo';
  }
}

function pct(value: number | undefined) {
  return formatEnriched(finiteValue(value), 'pct');
}

function indexValue(value: number | undefined) {
  return formatEnriched(finiteValue(value), 'index');
}

function segmentId(segment: Segment | undefined, index = 0) {
  return safeText(segment?.id, `segment-${index + 1}`);
}

function segmentName(segment: Segment | undefined, index = 0) {
  return safeText(segment?.name, `Segment ${index + 1}`);
}

function segmentSize(segment: Segment | undefined) {
  const size = safeText(segment?.sizeBand, '~0-0k matched guests');
  return size === '~0-0k matched guests' ? '~0k matched audience' : size;
}

function leakageDrivers(segment: Segment | undefined): LeakageDriver[] {
  return CORE_CATEGORIES.map((category) => {
    const wallet = segment?.categories?.[category];
    const leakagePct = finiteValue(wallet?.leakagePct);
    const walletIndex = finiteValue(wallet?.totalWalletIndex, 100);

    return {
      category,
      label: CATEGORY_LABELS[category],
      leakagePct,
      walletIndex,
      score: leakagePct * walletIndex,
    };
  }).sort((first, second) => second.score - first.score);
}

function dominantDriver(segment: Segment | undefined) {
  return leakageDrivers(segment)[0] ?? {
    category: 'hospitality' as CoreCategory,
    label: CATEGORY_LABELS.hospitality,
    leakagePct: 0,
    walletIndex: 100,
    score: 0,
  };
}

function propensityMax(segment: Segment | undefined) {
  return Math.max(
    finiteValue(segment?.propensities?.luxuryHotelSpender),
    finiteValue(segment?.propensities?.topTierRewards),
    finiteValue(segment?.propensities?.coBrandLookAlike),
  );
}

function severityFor(priority: number): InsightSeverity {
  if (priority >= 15000) return 'critical';
  if (priority >= 9000) return 'watch';
  return 'momentum';
}

function priorityFor(segment: Segment | undefined) {
  const driver = dominantDriver(segment);
  return finiteValue(segment?.opportunityIndex) * 100000 + driver.score + finiteValue(segment?.crossPropertyCashIndex);
}

function buildFinding(segment: Segment, index: number): InsightFinding {
  const driver = dominantDriver(segment);
  const priority = priorityFor(segment);
  const name = segmentName(segment, index);

  return {
    id: `${segmentId(segment, index)}-${driver.category}`,
    title: `${name}: ${driver.label} gap is the next wallet move`,
    summary: `${name} shows ${pct(driver.leakagePct)} ${driver.label} leakage with ${indexValue(segment.opportunityIndex)} opportunity headroom.`,
    action: CATEGORY_ACTIONS[driver.category],
    href: '/leakage',
    priority,
    severity: severityFor(priority),
    segmentId: segmentId(segment, index),
    segmentName: name,
    category: driver.category,
    evidence: [
      { label: 'Opportunity', value: indexValue(segment.opportunityIndex) },
      { label: 'Primary leakage', value: pct(driver.leakagePct) },
      { label: 'Cross-property cash', value: safeBand(segment.crossPropertyCashBand) },
    ],
  };
}

function sortedFindings(segments: Segment[]) {
  return segments
    .filter(Boolean)
    .map(buildFinding)
    .sort((first, second) => second.priority - first.priority);
}

function portfolioFallback(): InsightNarrative {
  return {
    title: 'Executive Summary',
    eyebrow: 'Generated insight narrative',
    summary: 'No active CDE segment insights available for this quarter. Select a populated quarter to generate the Galaxy and Mastercard wallet story.',
    findings: [],
    fusionSteps: [
      {
        label: 'Galaxy first-party signal',
        title: 'Observed Galaxy behavior',
        description: 'No active CDE segment is available yet.',
        value: '~0-0k matched guests',
      },
      {
        label: 'Mastercard CDE reveal',
        title: 'Modelled external wallet',
        description: 'Awaiting indexed, percentage, or banded enrichment.',
        value: 'Awaiting CDE signal',
      },
      {
        label: 'Discovered opportunity',
        title: 'Next action',
        description: 'No active CDE segment findings are available.',
        value: 'No active signal',
      },
    ],
    chartCallout: 'No chart insight is generated until an active CDE segment exists for this quarter.',
  };
}

export function buildPortfolioInsightNarrative(
  segments: Segment[] = [],
  methodology?: Methodology,
): InsightNarrative {
  const safeSegments = segments.filter(Boolean);

  if (safeSegments.length === 0) return portfolioFallback();

  const findings = sortedFindings(safeSegments);
  const topFinding = findings[0];
  const topSegment = safeSegments.find((segment) => segmentId(segment) === topFinding.segmentId) ?? safeSegments[0];
  const driver = dominantDriver(topSegment);
  const matchedCoverage = finiteValue(methodology?.matchedCoveragePct);
  const averageCapture = Math.round(
    safeSegments.reduce((sum, segment) => sum + finiteValue(segment.metrics?.shareOfWallet), 0) / safeSegments.length,
  );

  return {
    title: 'Executive Summary',
    eyebrow: 'Generated insight narrative',
    summary: `This quarter's Galaxy and Mastercard CDE join shows matched coverage ${pct(matchedCoverage)} with average Galaxy hospitality capture at ${pct(averageCapture)}. ${topFinding.segmentName} carries the clearest wallet move: ${pct(driver.leakagePct)} ${driver.label} leakage and ${indexValue(topSegment.opportunityIndex)} opportunity headroom. The recommended next step is to open leakage, validate the driver, and move the segment into audience activation.`,
    findings: findings.slice(0, 4),
    fusionSteps: [
      {
        label: 'Galaxy first-party signal',
        title: 'Observed Galaxy behavior',
        description: 'Known stay, visit, rewards, and segment behavior from Galaxy CRM.',
        value: segmentSize(topSegment),
      },
      {
        label: 'Mastercard CDE reveal',
        title: 'Modelled external wallet',
        description: `CDE shows where this segment's category wallet still leaks outside Galaxy.`,
        value: pct(driver.leakagePct),
      },
      {
        label: 'Discovered opportunity',
        title: 'Prioritized win-back',
        description: 'The combined view ranks which guest wallet gaps should become campaign audiences.',
        value: indexValue(topSegment.opportunityIndex),
      },
    ],
    chartCallout: `${topFinding.segmentName} is the first segment to inspect because its opportunity index and ${driver.label} leakage combine into the highest ranked finding.`,
  };
}

export function buildSegmentInsightNarrative(segment: Segment | undefined): InsightNarrative {
  const name = segmentName(segment);
  const driver = dominantDriver(segment);
  const band = safeBand(segment?.crossPropertyCashBand);
  const opportunity = indexValue(segment?.opportunityIndex);
  const maxPropensity = propensityMax(segment);
  const priority = priorityFor(segment);

  return {
    title: 'AI-style insight brief',
    eyebrow: 'Generated insight narrative',
    summary: `${name} combines Galaxy first-party ${pct(segment?.metrics?.shareOfVisits)} visit behavior with Mastercard CDE ${driver.label} leakage at ${pct(driver.leakagePct)}, revealing ${band} cross-property cash headroom and ${opportunity} opportunity.`,
    findings: [
      {
        id: `${segmentId(segment)}-dominant-leakage`,
        title: `${driver.label} is the primary leakage signal`,
        summary: `CDE indicates ${pct(driver.leakagePct)} of this ${driver.label} wallet remains outside Galaxy while total wallet intensity is ${indexValue(driver.walletIndex)}.`,
        action: CATEGORY_ACTIONS[driver.category],
        href: '/leakage',
        priority,
        severity: severityFor(priority),
        segmentId: segmentId(segment),
        segmentName: name,
        category: driver.category,
        evidence: [
          { label: 'Leakage', value: pct(driver.leakagePct) },
          { label: 'Wallet intensity', value: indexValue(driver.walletIndex) },
        ],
      },
      {
        id: `${segmentId(segment)}-activation-readiness`,
        title: 'Propensity supports audience activation',
        summary: `The strongest appended propensity signal is ${maxPropensity.toFixed(2)} on a 0-1 model scale, supporting a targeted activation handoff.`,
        action: 'Open activation and map the top recommended play to the selected audience.',
        href: '/activation',
        priority: priority - 1,
        severity: 'watch',
        segmentId: segmentId(segment),
        segmentName: name,
        evidence: [
          { label: 'Best propensity', value: maxPropensity.toFixed(2) },
          { label: 'Audience size', value: segmentSize(segment) },
        ],
      },
    ],
    fusionSteps: [
      {
        label: 'Galaxy first-party signal',
        title: 'Known relationship',
        description: 'Galaxy sees visits, rewards behavior, segment identity, and owned-property context.',
        value: pct(segment?.metrics?.shareOfVisits),
      },
      {
        label: 'Mastercard CDE reveal',
        title: 'External wallet headroom',
        description: `CDE appends category leakage, wallet indices, and propensities without raw customer spend.`,
        value: band,
      },
      {
        label: 'Discovered opportunity',
        title: 'Segment-level action',
        description: 'The joined view explains which offer should be taken to audience activation.',
        value: opportunity,
      },
    ],
    chartCallout: `${name} should be read by pairing the radar shape with the generated finding: the largest CDE wallet gap is ${driver.label}, not simply the category with the highest Galaxy activity.`,
  };
}

export function buildLeakageInsightNarrative(
  segment: Segment | undefined,
  segments: Segment[] = [],
): InsightNarrative {
  const base = buildSegmentInsightNarrative(segment);
  const name = segmentName(segment);
  const band = safeBand(segment?.crossPropertyCashBand);
  const drivers = leakageDrivers(segment);
  const rankedSegments = sortedFindings(segments.filter(Boolean));
  const topDriver = drivers[0];

  return {
    ...base,
    title: 'Generated opportunity narrative',
    summary: `${name} is the active leakage story: Mastercard CDE estimates ${band} in cross-property cash headroom, with ${topDriver.label} carrying the largest gap at ${pct(topDriver.leakagePct)}. Galaxy can use the joined CRM and CDE view to turn this from a measurement gap into a win-back audience.`,
    findings: [
      ...drivers.slice(0, 4).map((driver, driverIndex) => ({
        id: `${segmentId(segment)}-driver-${driver.category}`,
        title: `${driver.label} leakage ranks #${driverIndex + 1}`,
        summary: `${pct(driver.leakagePct)} leakage and ${indexValue(driver.walletIndex)} wallet intensity make ${driver.label} a concrete recapture lane.`,
        action: CATEGORY_ACTIONS[driver.category],
        href: '/propensity' as InsightRoute,
        priority: driver.score,
        severity: severityFor(driver.score),
        segmentId: segmentId(segment),
        segmentName: name,
        category: driver.category,
        evidence: [
          { label: 'Leakage', value: pct(driver.leakagePct) },
          { label: 'Wallet intensity', value: indexValue(driver.walletIndex) },
        ],
      })),
      ...rankedSegments.slice(0, 1),
    ],
    chartCallout: `The leakage flow should be read as a ranked action queue. Start with ${topDriver.label}, then validate whether the audience builder keeps enough scale for activation.`,
  };
}

export function buildLeakageDrivers(segment: Segment | undefined): LeakageDriver[] {
  return leakageDrivers(segment);
}
