import {
  CORE_CATEGORIES,
  type CategoryWallet,
  type CdeMetrics,
  type ColorToken,
  type CoreCategory,
  type Methodology,
  type Propensities,
  type Quarter,
  type RecommendedPlay,
  type Segment,
} from '@/data';
import { formatEnriched, formatGuestBand, formatPropensity } from '@/lib/format';

export type DashboardTabId = 'opportunity' | 'wallet' | 'segments' | 'activation' | 'workbench';
export type SegmentPriorityStatus = 'priority' | 'watch' | 'nurture';
export type SegmentPriority = SegmentPriorityStatus;
export type AssistantPromptId = 'map' | 'trust' | 'campaign' | 'default';

export interface BuildOpenDesignDashboardViewModelInput {
  selectedQuarter?: Quarter | null;
  segments?: Segment[] | null;
  methodology?: Methodology | null;
  selectedSegmentId?: string | null;
}

export interface BoardroomBrief {
  headline: string;
  title: string;
  description: string;
  body: string;
  action: string;
  audience: string;
  proof: string;
  move: string;
}

export interface ExecutiveMetric {
  label: 'Wallet headroom' | 'Matched guest band' | 'Galaxy wallet capture' | 'Opportunity index';
  value: string;
  delta: string;
  status: string;
  detail: string;
}

export interface ConstellationPoint {
  id: string;
  name: string;
  left: number;
  top: number;
  x: number;
  y: number;
  size: number;
  rank: number;
  opportunity: number;
  leakage: number;
  isSelected: boolean;
  isTop: boolean;
  tone: 'gold' | 'positive' | 'leak' | 'market';
}

export interface WalletRow {
  category: CoreCategory;
  label: string;
  capturedSharePct: number;
  capturedPct: number;
  leakageSharePct: number;
  leakagePct: number;
  walletIndex: number;
  capturedLabel: string;
  leakageLabel: string;
  indexLabel: string;
  opportunityScore: number;
  note: string;
}

export interface SegmentPriorityRow {
  id: string;
  name: string;
  summary: string;
  rank: number;
  sizeBand: string;
  audience: string;
  index: number;
  opportunity: number;
  opportunityLabel: string;
  priority: SegmentPriorityStatus;
  leakage: number;
  leakageLabel: string;
  propensity: number;
  propensityLabel: string;
  channel: RecommendedPlay['channel'];
  action: string;
  status: SegmentPriorityStatus;
}

export interface ActivationPlaybookRow {
  id: string;
  segmentId: string;
  segment: string;
  rank: number;
  title: string;
  summary: string;
  channel: RecommendedPlay['channel'];
  indexLabel: string;
  lever: string;
  nextAction: string;
  cashBand: string;
  offerAction: string;
  rationale: string;
  measurementWindow: string;
  measurementCopy: string;
  guardrail: string;
}

export interface WorkbenchRow {
  id: string;
  segment: string;
  index: string;
  opportunity: number;
  opportunityLabel: string;
  leakage: number;
  leakageLabel: string;
  propensity: number;
  propensityLabel: string;
  confidence: string;
  formula: string;
  decision: string;
  guardrail: string;
}

export interface Guardrail {
  id: 'formula' | 'coverage' | 'privacy' | 'export-measurement';
  title: string;
  body: string;
}

export interface AssistantModel {
  quickPrompts: Array<{
    id: AssistantPromptId;
    label: string;
    prompt: string;
    answer: string;
  }>;
  answers: Record<AssistantPromptId, string>;
}

export interface TopFinding {
  id: string;
  segmentId: string;
  segmentName: string;
  title: string;
  action: string;
  category: CoreCategory;
  categoryLabel: string;
  opportunity: number;
  opportunityLabel: string;
  leakage: number;
  leakageLabel: string;
}

export interface OpenDesignDashboardViewModel {
  tabs: typeof dashboardTabs;
  quarterLabel: string;
  refreshTitle: string;
  coveragePct: number;
  activeMetricCount: number;
  topSegment: Segment;
  topFinding: TopFinding;
  boardroomBrief: BoardroomBrief;
  executiveMetrics: ExecutiveMetric[];
  constellationPoints: ConstellationPoint[];
  walletRows: WalletRow[];
  segmentPriorities: SegmentPriorityRow[];
  activationPlaybookRows: ActivationPlaybookRow[];
  workbenchRows: WorkbenchRow[];
  guardrails: Guardrail[];
  assistant: AssistantModel;
}

export const dashboardTabs: Array<{ id: DashboardTabId; label: string }> = [
  { id: 'opportunity', label: 'Opportunity' },
  { id: 'wallet', label: 'Wallet Split' },
  { id: 'segments', label: 'Segments' },
  { id: 'activation', label: 'Activation' },
  { id: 'workbench', label: 'Workbench' },
];

export const constellationPositions: Record<string, { left: number; top: number; x: number; y: number; size: number; tone: ConstellationPoint['tone'] }> = {
  'cosmopolitan-connoisseurs': { left: 68, top: 31, x: 68, y: 31, size: 56, tone: 'gold' },
  'gba-cross-border-explorers': { left: 77, top: 58, x: 77, y: 58, size: 48, tone: 'positive' },
  'diamond-high-rollers': { left: 40, top: 24, x: 40, y: 24, size: 44, tone: 'gold' },
  'aspiring-mass-affluent': { left: 28, top: 64, x: 28, y: 64, size: 60, tone: 'leak' },
  'family-leisure-seekers': { left: 49, top: 76, x: 49, y: 76, size: 45, tone: 'positive' },
  'mice-business-guests': { left: 26, top: 38, x: 26, y: 38, size: 46, tone: 'gold' },
};

const bannedDisplayPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;
const unsafeCopyPattern = /raw[-\s]?spend|exact\s+spend/i;
const nonFiniteTextPattern = /\b(?:NaN|Infinity)\b/i;

const CATEGORY_LABELS: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail/Luxury',
};

const CATEGORY_NOTES: Record<CoreCategory, string> = {
  hospitality: 'Stay demand is the base layer for a broader Galaxy itinerary.',
  fnb: 'Dining intent is a strong bridge into retail and stay conversion.',
  entertainment: 'Shows create a timed reason to attach room and dining actions.',
  retailLuxury: 'Premium guests still show visible headroom in boutique and lifestyle categories.',
};

const FALLBACK_PLAY: RecommendedPlay = {
  title: 'Governed audience activation',
  lever: 'Governed audience activation',
  rationale: 'Use indexed, percentage, and banded CDE signals to prioritize the cohort.',
  channel: 'Hybrid',
};

function fallbackCategories(): Record<CoreCategory, CategoryWallet> {
  return CORE_CATEGORIES.reduce((categories, category) => ({
    ...categories,
    [category]: {
      capturedSharePct: 0,
      leakagePct: 0,
      totalWalletIndex: 100,
    },
  }), {} as Record<CoreCategory, CategoryWallet>);
}

function fallbackSegment(): Segment {
  return {
    id: 'no-active-segment',
    name: 'No active segment',
    nameZh: '',
    colorToken: 'market',
    sizeBand: formatGuestBand(0, 0),
    sizeLowK: 0,
    sizeHighK: 0,
    signatureTrait: 'No active CDE segment is available.',
    metrics: {
      shareOfWallet: 0,
      shareOfVisits: 0,
      avgTxnCountIndex: 100,
      avgTxnSizeIndex: 100,
      avgIndustrySpendIndex: 100,
      channelShareOnlinePct: 0,
      channelVisitsIndex: 100,
    },
    propensities: {
      luxuryHotelSpender: 0,
      topTierRewards: 0,
      coBrandLookAlike: 0,
    },
    categories: fallbackCategories(),
    crossPropertyCashIndex: 0,
    crossPropertyCashBand: '0-0k equiv./mo',
    opportunityIndex: 0,
    recommendedPlays: [FALLBACK_PLAY],
  };
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeInteger(value: unknown, fallback = 0) {
  return Math.max(0, Math.round(finiteNumber(value, fallback)));
}

function pctValue(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function safePct(value: unknown, fallback = 0) {
  return pctValue(value) ?? fallback;
}

function safeRatio(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function average(values: number[]) {
  const finiteValues = values.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) return 0;
  return Math.round(finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length);
}

function safeCopy(value: unknown, fallback: string) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (
    !text
    || bannedDisplayPattern.test(text)
    || unsafeCopyPattern.test(text)
    || nonFiniteTextPattern.test(text)
  ) {
    return fallback;
  }

  return text;
}

function safeId(value: unknown, fallback: string) {
  const text = safeCopy(value, fallback);
  return /^[a-z0-9-]+$/i.test(text) ? text : fallback;
}

function safeChannel(value: unknown): RecommendedPlay['channel'] {
  return value === 'Online' || value === 'Physical' || value === 'Hybrid' ? value : 'Hybrid';
}

function safeColorToken(value: unknown): ColorToken {
  if (
    value === 'gold'
    || value === 'positive'
    || value === 'leak'
    || value === 'market'
    || value === 'goldLite'
    || value === 'goldDeep'
  ) {
    return value;
  }

  return 'market';
}

function formatPct(value: number) {
  return formatEnriched(safePct(value), 'pct');
}

function formatIndex(value: number) {
  return formatEnriched(safeInteger(value), 'index');
}

function compactIndex(value: number) {
  return `Index ${safeInteger(value)}`;
}

function safeBand(value: unknown) {
  const text = safeCopy(value, '0-0k equiv./mo');

  try {
    return formatEnriched(text, 'band');
  } catch {
    return formatEnriched('0-0k equiv./mo', 'band');
  }
}

function displayGuestBand(segment: Segment) {
  return segment.sizeBand.replace(/^~/, '');
}

function categoryWallet(segment: Segment | undefined, category: CoreCategory): CategoryWallet {
  const rawWallet = segment?.categories?.[category];
  const captured = pctValue(rawWallet?.capturedSharePct);
  const leakage = pctValue(rawWallet?.leakagePct);
  const capturedSharePct = captured ?? (leakage === undefined ? 0 : 100 - leakage);
  const leakagePct = leakage ?? (captured === undefined ? 0 : 100 - captured);

  return {
    capturedSharePct,
    leakagePct,
    totalWalletIndex: safeInteger(rawWallet?.totalWalletIndex, 100),
  };
}

function normalizeMetrics(segment: Segment | undefined, categories: Record<CoreCategory, CategoryWallet>): CdeMetrics {
  return {
    shareOfWallet: safePct(segment?.metrics?.shareOfWallet, categories.hospitality.capturedSharePct),
    shareOfVisits: safePct(segment?.metrics?.shareOfVisits),
    avgTxnCountIndex: safeInteger(segment?.metrics?.avgTxnCountIndex, 100),
    avgTxnSizeIndex: safeInteger(segment?.metrics?.avgTxnSizeIndex, 100),
    avgIndustrySpendIndex: safeInteger(segment?.metrics?.avgIndustrySpendIndex, 100),
    channelShareOnlinePct: safePct(segment?.metrics?.channelShareOnlinePct),
    channelVisitsIndex: safeInteger(segment?.metrics?.channelVisitsIndex, 100),
  };
}

function normalizePropensities(segment: Segment | undefined): Propensities {
  return {
    luxuryHotelSpender: safeRatio(segment?.propensities?.luxuryHotelSpender),
    topTierRewards: safeRatio(segment?.propensities?.topTierRewards),
    coBrandLookAlike: safeRatio(segment?.propensities?.coBrandLookAlike),
  };
}

function normalizePlay(play: RecommendedPlay | undefined): RecommendedPlay {
  return {
    title: safeCopy(play?.title, FALLBACK_PLAY.title),
    lever: safeCopy(play?.lever, FALLBACK_PLAY.lever),
    rationale: safeCopy(play?.rationale, FALLBACK_PLAY.rationale),
    offerTerm: play?.offerTerm ? safeCopy(play.offerTerm, '') || undefined : undefined,
    channel: safeChannel(play?.channel),
  };
}

function normalizeSegment(segment: Segment | undefined, index = 0): Segment {
  if (!segment) return fallbackSegment();

  const categories = CORE_CATEGORIES.reduce((wallets, category) => ({
    ...wallets,
    [category]: categoryWallet(segment, category),
  }), {} as Record<CoreCategory, CategoryWallet>);
  const sizeLowK = safeInteger(segment.sizeLowK);
  const sizeHighK = Math.max(sizeLowK, safeInteger(segment.sizeHighK, sizeLowK));
  const rawPlays = Array.isArray(segment.recommendedPlays) ? segment.recommendedPlays : [];
  const recommendedPlays = rawPlays.map(normalizePlay);

  return {
    id: safeId(segment.id, `segment-${index + 1}`),
    name: safeCopy(segment.name, `Segment ${index + 1}`),
    nameZh: safeCopy(segment.nameZh, ''),
    colorToken: safeColorToken(segment.colorToken),
    sizeLowK,
    sizeHighK,
    sizeBand: formatGuestBand(sizeLowK, sizeHighK),
    signatureTrait: safeCopy(segment.signatureTrait, 'CDE-governed segment signal.'),
    metrics: normalizeMetrics(segment, categories),
    propensities: normalizePropensities(segment),
    categories,
    gamingContextIndex: segment.gamingContextIndex === undefined ? undefined : safeInteger(segment.gamingContextIndex),
    crossPropertyCashIndex: safeInteger(segment.crossPropertyCashIndex),
    crossPropertyCashBand: safeBand(segment.crossPropertyCashBand),
    opportunityIndex: safeInteger(segment.opportunityIndex),
    recommendedPlays: recommendedPlays.length > 0 ? recommendedPlays : [FALLBACK_PLAY],
  };
}

function normalizeSegments(segments: Segment[] | null | undefined) {
  if (!Array.isArray(segments)) return [];
  return segments.filter(Boolean).map((segment, index) => normalizeSegment(segment, index));
}

function firstPlay(segment: Segment) {
  return normalizePlay(segment.recommendedPlays[0]);
}

function topPropensity(segment: Segment) {
  return Math.max(
    safeRatio(segment.propensities.luxuryHotelSpender),
    safeRatio(segment.propensities.topTierRewards),
    safeRatio(segment.propensities.coBrandLookAlike),
  );
}

function primaryLeakageScore(segment: Segment, category: CoreCategory) {
  const wallet = segment.categories[category];
  return safePct(wallet.leakagePct) * safeInteger(wallet.totalWalletIndex, 100);
}

function rankedSegments(segments: Segment[] | null | undefined) {
  return normalizeSegments(segments).sort((first, second) => (
    second.opportunityIndex - first.opportunityIndex
    || getAverageLeakage(second) - getAverageLeakage(first)
    || first.name.localeCompare(second.name)
  ));
}

function quarterLabel(quarter: Quarter | null | undefined) {
  return safeCopy(quarter?.label, 'No active quarter');
}

function safeCoverage(methodology: Methodology | null | undefined) {
  return safePct(methodology?.matchedCoveragePct);
}

function safeActiveMetricCount(methodology: Methodology | null | undefined) {
  return safeInteger(methodology?.activeMetricCount);
}

function selectedId(value: string | null | undefined) {
  return value && !bannedDisplayPattern.test(value) ? value.trim() : '';
}

function fallbackFinding(): TopFinding {
  return {
    id: 'no-active-finding',
    segmentId: 'no-active-segment',
    segmentName: 'No active segment',
    title: 'No active CDE finding',
    action: FALLBACK_PLAY.lever,
    category: 'hospitality',
    categoryLabel: CATEGORY_LABELS.hospitality,
    opportunity: 0,
    opportunityLabel: compactIndex(0),
    leakage: 0,
    leakageLabel: formatPct(0),
  };
}

export function getAverageLeakage(segment: Segment | undefined) {
  const safeSegment = normalizeSegment(segment);
  return average(CORE_CATEGORIES.map((category) => safeSegment.categories[category].leakagePct));
}

export function getTopSegment(segments: Segment[] | null | undefined) {
  return rankedSegments(segments)[0] ?? fallbackSegment();
}

export function getPrimaryLeakage(segment: Segment | undefined) {
  const safeSegment = normalizeSegment(segment);
  const category = [...CORE_CATEGORIES].sort((first, second) => (
    primaryLeakageScore(safeSegment, second) - primaryLeakageScore(safeSegment, first)
    || CATEGORY_LABELS[first].localeCompare(CATEGORY_LABELS[second])
  ))[0] ?? 'hospitality';
  const leakagePct = safePct(safeSegment.categories[category].leakagePct);
  const walletIndex = safeInteger(safeSegment.categories[category].totalWalletIndex, 100);

  return {
    category,
    label: CATEGORY_LABELS[category],
    leakagePct,
    leakageLabel: formatPct(leakagePct),
    walletIndex,
    indexLabel: formatIndex(walletIndex),
    score: leakagePct * walletIndex,
  };
}

export function priorityForSegment(segment: Segment | undefined): SegmentPriorityStatus {
  const safeSegment = normalizeSegment(segment);
  const leakage = getAverageLeakage(safeSegment);
  const propensity = topPropensity(safeSegment);

  if (safeSegment.opportunityIndex >= 110 || leakage >= 55) return 'priority';
  if (safeSegment.opportunityIndex >= 95 || propensity >= 0.6 || safeSegment.metrics.channelShareOnlinePct >= 55) return 'watch';
  return 'nurture';
}

export function buildBoardroomBrief(quarter: Quarter | null | undefined, segment: Segment | undefined): BoardroomBrief {
  const safeQuarterLabel = quarterLabel(quarter);
  const safeSegment = normalizeSegment(segment);
  const play = firstPlay(safeSegment);
  const leakage = getPrimaryLeakage(safeSegment);
  const description = 'Open the meeting with a decision, not a dashboard tour. The page then proves the recommendation through CDE-ranked opportunity, wallet leakage, and a governed campaign handoff.';

  if (safeSegment.id === 'no-active-segment') {
    const title = `${safeQuarterLabel}: hold activation until CDE segment coverage is ready.`;

    return {
      headline: title,
      title,
      description,
      body: 'No active CDE segment is available for this quarter. Keep the overview in read-only mode until governed cohort signals are refreshed.',
      action: FALLBACK_PLAY.lever,
      audience: displayGuestBand(safeSegment),
      proof: `${compactIndex(0)} / ${formatPct(0)} leakage`,
      move: FALLBACK_PLAY.title,
    };
  }

  const title = `${safeQuarterLabel}: pitch ${safeSegment.name} first.`;

  return {
    headline: title,
    title,
    description,
    body: `${safeSegment.name} is the first decision: ${formatIndex(safeSegment.opportunityIndex)} opportunity, ${leakage.leakageLabel} ${leakage.label} leakage, and ${safeSegment.crossPropertyCashBand} modelled wallet band. Keep the move at cohort level and validate through the next CDE refresh.`,
    action: play.lever,
    audience: displayGuestBand(safeSegment),
    proof: `${compactIndex(safeSegment.opportunityIndex)} / ${leakage.leakageLabel} ${leakage.label} leakage`,
    move: play.title,
  };
}

export function buildExecutiveMetrics(
  segments: Segment[] | null | undefined,
  methodology?: Methodology | null,
): ExecutiveMetric[] {
  const safeSegments = normalizeSegments(segments);
  const topSegment = getTopSegment(safeSegments);
  const walletHeadroom = average(safeSegments.flatMap((segment) => (
    CORE_CATEGORIES.map((category) => segment.categories[category].leakagePct)
  )));
  const matchedGuestLowK = safeSegments.reduce((sum, segment) => sum + segment.sizeLowK, 0);
  const matchedGuestHighK = safeSegments.reduce((sum, segment) => sum + segment.sizeHighK, 0);
  const walletCapture = average(safeSegments.map((segment) => segment.metrics.shareOfWallet));
  const coverage = safeCoverage(methodology);
  const activeMetrics = safeActiveMetricCount(methodology);

  return [
    {
      label: 'Wallet headroom',
      value: formatPct(walletHeadroom),
      delta: walletHeadroom > 0 ? 'Modelled headroom to convert' : 'Awaiting CDE signal',
      status: walletHeadroom >= 45 ? 'Prioritize' : 'Monitor',
      detail: 'Average addressable leakage across hospitality, dining, entertainment, and retail/luxury categories.',
    },
    {
      label: 'Matched guest band',
      value: `${matchedGuestLowK}-${matchedGuestHighK}k`,
      delta: 'Governed cohort range',
      status: coverage > 0 ? 'Covered' : 'Pending coverage',
      detail: `${formatPct(coverage)} matched coverage with ${activeMetrics} active CDE metrics.`,
    },
    {
      label: 'Galaxy wallet capture',
      value: formatPct(walletCapture),
      delta: walletCapture > 0 ? 'Hospitality capture baseline' : 'Awaiting capture signal',
      status: walletCapture >= 50 ? 'Defend' : 'Grow',
      detail: 'Average Galaxy hospitality capture across current-quarter segments.',
    },
    {
      label: 'Opportunity index',
      value: compactIndex(topSegment.opportunityIndex),
      delta: topSegment.id === 'no-active-segment' ? 'No active leader' : 'Top ranked finding',
      status: topSegment.id === 'no-active-segment' ? 'Pending' : 'Lead segment',
      detail: `${topSegment.name} carries the highest finite opportunity signal for this view.`,
    },
  ];
}

export function buildWalletRows(segments: Segment[] | null | undefined): WalletRow[] {
  const safeSegments = normalizeSegments(segments);
  const segmentCount = Math.max(safeSegments.length, 1);

  return CORE_CATEGORIES.map((category) => {
    const capturedPct = average(safeSegments.map((segment) => segment.categories[category].capturedSharePct));
    const leakagePct = average(safeSegments.map((segment) => segment.categories[category].leakagePct));
    const walletIndex = average(safeSegments.map((segment) => segment.categories[category].totalWalletIndex)) || 100;
    const opportunityScore = Math.round(
      safeSegments.reduce((sum, segment) => sum + primaryLeakageScore(segment, category), 0) / segmentCount,
    );

    return {
      category,
      label: CATEGORY_LABELS[category],
      capturedSharePct: capturedPct,
      capturedPct,
      leakageSharePct: leakagePct,
      leakagePct,
      walletIndex,
      capturedLabel: formatPct(capturedPct),
      leakageLabel: formatPct(leakagePct),
      indexLabel: formatIndex(walletIndex),
      opportunityScore,
      note: CATEGORY_NOTES[category],
    };
  });
}

export const buildCategoryRows = buildWalletRows;

export function buildSegmentPriorityRows(segments: Segment[] | null | undefined): SegmentPriorityRow[] {
  return rankedSegments(segments).map((segment, index) => {
    const leakage = getPrimaryLeakage(segment);
    const propensity = topPropensity(segment);
    const play = firstPlay(segment);

    return {
      id: segment.id,
      name: segment.name,
      summary: segment.signatureTrait,
      rank: index + 1,
      sizeBand: displayGuestBand(segment),
      audience: displayGuestBand(segment),
      index: segment.opportunityIndex,
      opportunity: segment.opportunityIndex,
      opportunityLabel: compactIndex(segment.opportunityIndex),
      priority: priorityForSegment(segment),
      leakage: leakage.leakagePct,
      leakageLabel: `${leakage.leakageLabel} ${leakage.label}`,
      propensity,
      propensityLabel: formatPropensity(propensity),
      channel: play.channel,
      action: play.lever,
      status: priorityForSegment(segment),
    };
  });
}

export function buildActivationPlaybookRows(segments: Segment[] | null | undefined): ActivationPlaybookRow[] {
  const topSegment = getTopSegment(segments);

  return topSegment.recommendedPlays.map((play, index) => {
    const safePlay = normalizePlay(play);

    return {
      id: `${topSegment.id}-play-${index + 1}`,
      segmentId: topSegment.id,
      segment: topSegment.name,
      rank: index + 1,
      title: safePlay.title,
      summary: safePlay.rationale,
      channel: safePlay.channel,
      indexLabel: compactIndex(topSegment.opportunityIndex),
      lever: safePlay.lever,
      nextAction: safePlay.lever,
      cashBand: topSegment.crossPropertyCashBand,
      offerAction: safePlay.offerTerm ?? safePlay.lever,
      rationale: safePlay.rationale,
      measurementWindow: 'Next quarterly CDE refresh',
      measurementCopy: 'Measure aggregate conversion lift with a governed holdout readout.',
      guardrail: 'Use cohort-level CDE fields only; keep customer-level values outside the export.',
    };
  });
}

export const buildPlaybookRows = buildActivationPlaybookRows;

function confidenceForRow(index: number, row: SegmentPriorityRow) {
  if (index === 0) return 'Strong coverage';
  if (row.status === 'watch' || row.channel === 'Online') return 'Mobile-ready';
  if (row.status === 'priority') return 'Broad sample';
  return 'High value, smaller base';
}

function decisionForRow(index: number, status: SegmentPriorityStatus) {
  if (index === 0) return 'Pitch first';
  if (status === 'priority') return 'Queue for activation';
  if (status === 'watch') return 'Package into itinerary';
  return 'Hold for nurture';
}

export function buildWorkbenchRows(segments: Segment[] | null | undefined): WorkbenchRow[] {
  const rows = buildSegmentPriorityRows(segments);
  const visibleRows = rows.length > 0 ? rows.slice(0, 4) : [{
    id: 'no-active-segment',
    name: 'No active segment',
    summary: 'No active CDE segment is available.',
    rank: 1,
    sizeBand: '0-0k matched guests',
    audience: '0-0k matched guests',
    index: 0,
    opportunity: 0,
    opportunityLabel: compactIndex(0),
    priority: 'nurture' as const,
    leakage: 0,
    leakageLabel: `${formatPct(0)} Hospitality`,
    propensity: 0,
    propensityLabel: formatPropensity(0),
    channel: 'Hybrid' as const,
    action: FALLBACK_PLAY.lever,
    status: 'nurture' as const,
  }];

  return visibleRows.map((row, index) => ({
    id: `${row.id}-workbench`,
    segment: row.name,
    index: String(row.opportunity),
    opportunity: row.opportunity,
    opportunityLabel: row.opportunityLabel,
    leakage: row.leakage,
    leakageLabel: row.leakageLabel,
    propensity: row.propensity,
    propensityLabel: row.propensityLabel,
    confidence: row.id === 'no-active-segment' ? 'Awaiting coverage' : confidenceForRow(index, row),
    formula: 'Opportunity index + primary category leakage + propensity + channel readiness.',
    decision: row.id === 'no-active-segment' ? 'Await governed segment' : decisionForRow(index, row.status),
    guardrail: 'Use the score to pick the next cohort action, then measure with holdout at refresh.',
  }));
}

export function buildGuardrails(methodology?: Methodology | null): Guardrail[] {
  const coverage = safeCoverage(methodology);
  const activeMetrics = safeActiveMetricCount(methodology);

  return [
    {
      id: 'formula',
      title: 'Ranking formula',
      body: 'Rank = opportunity index, primary category leakage, propensity, and channel readiness. The score is directional and buyer-facing.',
    },
    {
      id: 'coverage',
      title: 'Coverage',
      body: `${formatPct(coverage)} matched coverage and ${activeMetrics} active CDE metrics define where the cockpit can recommend action.`,
    },
    {
      id: 'privacy',
      title: 'Privacy',
      body: 'Outputs stay at cohort level with no PII or customer-level values in the dashboard.',
    },
    {
      id: 'export-measurement',
      title: 'Export and measurement',
      body: 'Export audience definitions, keep the offer/action text governed, and measure lift through the next refresh.',
    },
  ];
}

function buildTopFinding(segments: Segment[] | null | undefined): TopFinding {
  const topSegment = getTopSegment(segments);
  if (topSegment.id === 'no-active-segment') return fallbackFinding();

  const leakage = getPrimaryLeakage(topSegment);
  const play = firstPlay(topSegment);

  return {
    id: `${topSegment.id}-${leakage.category}`,
    segmentId: topSegment.id,
    segmentName: topSegment.name,
    title: `${topSegment.name}: ${leakage.label} leakage is the next wallet move`,
    action: play.lever,
    category: leakage.category,
    categoryLabel: leakage.label,
    opportunity: topSegment.opportunityIndex,
    opportunityLabel: compactIndex(topSegment.opportunityIndex),
    leakage: leakage.leakagePct,
    leakageLabel: leakage.leakageLabel,
  };
}

export function buildConstellationPoints(
  segments: Segment[] | null | undefined,
  selectedSegmentId?: string | null,
): ConstellationPoint[] {
  const selected = selectedId(selectedSegmentId);
  const ranked = rankedSegments(segments);
  const topId = ranked[0]?.id ?? '';
  const selectedExists = selected ? ranked.some((segment) => segment.id === selected) : false;

  return ranked.map((segment, index) => {
    const position = constellationPositions[segment.id];
    const leakage = getPrimaryLeakage(segment);
    const generatedLeft = 18 + ((index * 29) % 64);
    const generatedTop = 22 + ((index * 37) % 58);
    const left = position?.left ?? generatedLeft;
    const top = position?.top ?? generatedTop;
    const generatedSize = Math.min(64, Math.max(32, 32 + Math.round(segment.opportunityIndex / 4)));

    return {
      id: segment.id,
      name: segment.name,
      left,
      top,
      x: position?.x ?? left,
      y: position?.y ?? top,
      size: position?.size ?? generatedSize,
      rank: index + 1,
      opportunity: segment.opportunityIndex,
      leakage: leakage.leakagePct,
      isSelected: selectedExists ? segment.id === selected : segment.id === topId,
      isTop: segment.id === topId,
      tone: position?.tone ?? (priorityForSegment(segment) === 'priority' ? 'gold' : 'market'),
    };
  });
}

function assistantAnswers(segment: Segment | undefined, methodology?: Methodology | null): Record<AssistantPromptId, string> {
  const safeSegment = normalizeSegment(segment);
  const leakage = getPrimaryLeakage(safeSegment);
  const play = firstPlay(safeSegment);
  const propensity = topPropensity(safeSegment);
  const coverage = safeCoverage(methodology);
  const activeMetrics = safeActiveMetricCount(methodology);

  return {
    map: `The opportunity map should lead with ${safeSegment.name}: ${compactIndex(safeSegment.opportunityIndex)} opportunity, ${leakage.leakageLabel} ${leakage.label} leakage, ${formatPropensity(propensity)} propensity, and ${safeSegment.crossPropertyCashBand} modelled wallet band.`,
    trust: `This answer is CDE-safe: ${formatPct(coverage)} matched coverage, ${activeMetrics} active metrics, aggregate cohort logic, no PII, and no customer-level values.`,
    campaign: `Launch ${play.title} for ${safeSegment.name} through ${play.channel}. Use ${play.lever}; offer/action is ${play.offerTerm ?? play.lever}. Measure at the next quarterly CDE refresh with aggregate conversion and holdout readout.`,
    default: `Start with ${safeSegment.name}, then compare wallet split, segment priority, activation readiness, and workbench guardrails before export.`,
  };
}

function assistantPromptKind(prompt: string): AssistantPromptId {
  const normalized = prompt.toLowerCase();

  if (/\b(map|audience|where|first|opportunity)\b/.test(normalized)) return 'map';
  if (/\b(trust|method|coverage|privacy|safe|cde|source)\b/.test(normalized)) return 'trust';
  if (/\b(campaign|activation|play|offer|launch|measure)\b/.test(normalized)) return 'campaign';
  return 'default';
}

export function buildAssistantAnswer(
  prompt: string,
  segment: Segment | undefined,
  methodology?: Methodology | null,
) {
  const answers = assistantAnswers(segment, methodology);
  return answers[assistantPromptKind(prompt)];
}

export function buildAssistantModel(segment: Segment | undefined, methodology?: Methodology | null): AssistantModel {
  const answers = assistantAnswers(segment, methodology);

  return {
    quickPrompts: [
      {
        id: 'map',
        label: 'Map the opportunity',
        prompt: 'Show me the opportunity map',
        answer: answers.map,
      },
      {
        id: 'trust',
        label: 'Explain trust',
        prompt: 'Why should I trust this CDE answer?',
        answer: answers.trust,
      },
      {
        id: 'campaign',
        label: 'Build campaign',
        prompt: 'Build the campaign activation',
        answer: answers.campaign,
      },
      {
        id: 'default',
        label: 'Recommend next',
        prompt: 'What should I do next?',
        answer: answers.default,
      },
    ],
    answers,
  };
}

export function buildOpenDesignDashboardViewModel({
  selectedQuarter,
  segments,
  methodology,
  selectedSegmentId,
}: BuildOpenDesignDashboardViewModelInput): OpenDesignDashboardViewModel {
  const safeSegments = normalizeSegments(segments);
  const topSegment = getTopSegment(safeSegments);
  const safeQuarterLabel = quarterLabel(selectedQuarter);

  return {
    tabs: dashboardTabs,
    quarterLabel: safeQuarterLabel,
    refreshTitle: safeQuarterLabel === 'No active quarter' ? 'No active CDE refresh' : `${safeQuarterLabel} CDE refresh`,
    coveragePct: safeCoverage(methodology),
    activeMetricCount: safeActiveMetricCount(methodology),
    topSegment,
    topFinding: buildTopFinding(safeSegments),
    boardroomBrief: buildBoardroomBrief(selectedQuarter, topSegment),
    executiveMetrics: buildExecutiveMetrics(safeSegments, methodology),
    constellationPoints: buildConstellationPoints(safeSegments, selectedSegmentId),
    walletRows: buildWalletRows(safeSegments),
    segmentPriorities: buildSegmentPriorityRows(safeSegments),
    activationPlaybookRows: buildActivationPlaybookRows(safeSegments),
    workbenchRows: buildWorkbenchRows(safeSegments),
    guardrails: buildGuardrails(methodology),
    assistant: buildAssistantModel(topSegment, methodology),
  };
}
