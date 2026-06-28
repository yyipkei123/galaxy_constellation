import type { CoreCategory, ScenarioImpact, ScenarioLever, Segment } from '@/data';

export interface ScenarioSimulatorInput {
  segments?: Segment[] | null;
  segmentIds?: string[] | null;
  category?: CoreCategory | null;
  recapturePct?: number | null;
  onlineShiftPct?: number | null;
  lever?: ScenarioLever | null;
}

const leverMultipliers: Record<ScenarioLever, number> = {
  recapture: 1,
  channelShift: 1.12,
  hostLift: 1.24,
  contentPersonalisation: 1.38,
};

const validCategories = new Set<CoreCategory>(['hospitality', 'fnb', 'entertainment', 'retailLuxury']);
const validLevers = new Set<ScenarioLever>(['recapture', 'channelShift', 'hostLift', 'contentPersonalisation']);
const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/gi;

const zeroImpact: ScenarioImpact = {
  walletUpliftIndex: 0,
  opportunityIndexDelta: 0,
  pitchNowGuestsK: 0,
  projectedBand: '0-0k equiv./mo',
  constellationShift: [],
};

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function finiteOptional(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rounded(value: number) {
  return Math.round(finiteNumber(value));
}

function roundOne(value: number) {
  return Math.round(finiteNumber(value) * 10) / 10;
}

function safeCategory(category: ScenarioSimulatorInput['category']): CoreCategory | null {
  return typeof category === 'string' && validCategories.has(category) ? category : null;
}

function safeLever(lever: ScenarioSimulatorInput['lever']): ScenarioLever {
  return typeof lever === 'string' && validLevers.has(lever) ? lever : 'recapture';
}

function safeLabel(value: unknown, fallback: string) {
  const label = typeof value === 'string' ? value.trim() : '';
  return (label || fallback).replace(bannedCdeTokenPattern, '').replace(/\s+/g, ' ').trim() || fallback;
}

function safeSegmentId(value: unknown, fallback: string) {
  return safeLabel(value, fallback)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || fallback;
}

function selectedSegments(segments: ScenarioSimulatorInput['segments'], segmentIds: ScenarioSimulatorInput['segmentIds']) {
  const idSet = new Set((segmentIds ?? []).filter((id): id is string => typeof id === 'string' && id.trim() !== ''));

  if (!Array.isArray(segments) || idSet.size === 0) return [];

  return segments.filter((segment) => segment && typeof segment.id === 'string' && idSet.has(segment.id));
}

function categorySignals(segment: Segment, category: CoreCategory) {
  const wallet = segment.categories?.[category];
  const walletIndex = finiteOptional(wallet?.totalWalletIndex);
  const capturePct = finiteOptional(wallet?.capturedSharePct);
  const directLeakagePct = finiteOptional(wallet?.leakagePct);
  const leakagePct = directLeakagePct ?? (capturePct === undefined ? undefined : 100 - capturePct);
  const opportunityIndex = finiteOptional(segment.opportunityIndex);

  if (
    walletIndex === undefined
    || leakagePct === undefined
    || opportunityIndex === undefined
  ) {
    return null;
  }

  return {
    leakagePct: clamp(leakagePct, 0, 100),
    walletIndex: Math.max(0, walletIndex),
    opportunityIndex: Math.max(0, opportunityIndex),
    onlineSharePct: clamp(finiteNumber(segment.metrics?.channelShareOnlinePct), 0, 100),
    sizeHighK: Math.max(0, finiteNumber(segment.sizeHighK)),
  };
}

function projectedBand(walletUpliftIndex: number, pitchNowGuestsK: number) {
  if (walletUpliftIndex <= 0 || pitchNowGuestsK <= 0) return zeroImpact.projectedBand;

  const low = Math.max(1, Math.round((walletUpliftIndex * pitchNowGuestsK) / 38));
  const high = Math.max(low, low + Math.max(3, Math.round(walletUpliftIndex / 6)));

  return `${low}-${high}k equiv./mo`;
}

export function buildScenarioImpact(input: ScenarioSimulatorInput): ScenarioImpact {
  const category = safeCategory(input.category);
  const activeSegments = selectedSegments(input.segments, input.segmentIds);

  if (!category || activeSegments.length === 0) return { ...zeroImpact };

  const recapturePct = clamp(finiteNumber(input.recapturePct), 0, 60);
  const onlineShiftPct = clamp(finiteNumber(input.onlineShiftPct), -20, 30);
  const lever = safeLever(input.lever);
  const multiplier = leverMultipliers[lever];

  const rows = activeSegments
    .map((segment, index) => {
      const signals = categorySignals(segment, category);
      if (!signals) return null;

      const channelReadiness = signals.onlineSharePct / 100;
      const recapturePoints = signals.leakagePct * (recapturePct / 100);
      const onlinePoints = onlineShiftPct * (0.18 + channelReadiness * 0.28);
      const baseUplift = Math.max(0, (recapturePoints + onlinePoints) * (signals.walletIndex / 100) * multiplier);
      const walletUplift = rounded(baseUplift);
      const opportunityDelta = rounded(baseUplift * 0.72);
      const audienceWeight = signals.sizeHighK > 0 ? signals.sizeHighK : 1;
      const pitchNowGuestsK = signals.sizeHighK
        * Math.max(0, (recapturePct / 100) * 0.36 + (Math.max(onlineShiftPct, 0) / 100) * 0.14)
        * multiplier;

      return {
        segmentId: safeSegmentId(segment.id, `segment-${index + 1}`),
        label: safeLabel(segment.name, `Segment ${index + 1}`),
        beforeIndex: rounded(signals.opportunityIndex),
        afterIndex: rounded(signals.opportunityIndex + opportunityDelta),
        walletUplift,
        opportunityDelta,
        pitchNowGuestsK,
        audienceWeight,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) return { ...zeroImpact };

  const totalWeight = rows.reduce((sum, row) => sum + row.audienceWeight, 0) || rows.length;
  const weightedWalletUplift = rows.reduce((sum, row) => sum + row.walletUplift * row.audienceWeight, 0) / totalWeight;
  const weightedOpportunityDelta = rows.reduce((sum, row) => sum + row.opportunityDelta * row.audienceWeight, 0) / totalWeight;
  const pitchNowGuestsK = roundOne(rows.reduce((sum, row) => sum + row.pitchNowGuestsK, 0));
  const walletUpliftIndex = rounded(weightedWalletUplift);
  const opportunityIndexDelta = rounded(weightedOpportunityDelta);

  return {
    walletUpliftIndex,
    opportunityIndexDelta,
    pitchNowGuestsK,
    projectedBand: projectedBand(walletUpliftIndex, pitchNowGuestsK),
    constellationShift: rows.map((row) => ({
      segmentId: row.segmentId,
      label: row.label,
      beforeIndex: row.beforeIndex,
      afterIndex: row.afterIndex,
    })),
  };
}
