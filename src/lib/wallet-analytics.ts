import { CORE_CATEGORIES, type CoreCategory, type Segment } from '@/data';

export interface WalletCategoryAnalytic {
  category: CoreCategory;
  label: string;
  capturePct: number;
  leakagePct: number;
  walletIndex: number;
  opportunityScore: number;
  leadingSegmentId: string;
  leadingSegmentName: string;
}

export interface WalletSegmentAnalytic {
  id: string;
  name: string;
  shareOfWalletPct: number;
  shareOfVisitsPct: number;
  channelOnlinePct: number;
  opportunityScore: number;
  leadingCategory: CoreCategory;
  leadingCategoryLabel: string;
  categoryLeakageScores: Partial<Record<CoreCategory, number>>;
}

export interface WalletAnalyticsSummary {
  averageCapturePct: number;
  averageLeakagePct: number;
  highestLeakageCategory: WalletCategoryAnalytic;
  topWalletSegment: WalletSegmentAnalytic;
  channelSkew: 'Online skew' | 'Physical skew' | 'Balanced';
}

export interface WalletAnalytics {
  categories: WalletCategoryAnalytic[];
  segments: WalletSegmentAnalytic[];
  summary: WalletAnalyticsSummary;
}

const CATEGORY_LABELS: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

const FALLBACK_SEGMENT: WalletSegmentAnalytic = {
  id: 'no-active-segment',
  name: 'No active segment',
  shareOfWalletPct: 0,
  shareOfVisitsPct: 0,
  channelOnlinePct: 0,
  opportunityScore: 0,
  leadingCategory: 'hospitality',
  leadingCategoryLabel: CATEGORY_LABELS.hospitality,
  categoryLeakageScores: {},
};

function finiteNumber(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampPct(value: number | undefined, fallback = 0) {
  return Math.min(100, Math.max(0, Math.round(finiteNumber(value, fallback))));
}

function safeIndex(value: number | undefined, fallback = 100) {
  return Math.max(0, Math.round(finiteNumber(value, fallback)));
}

function safeSegmentName(segment: Segment | undefined, index = 0) {
  const name = typeof segment?.name === 'string' ? segment.name.trim() : '';
  return name || `Segment ${index + 1}`;
}

function safeSegmentId(segment: Segment | undefined, index = 0) {
  const id = typeof segment?.id === 'string' ? segment.id.trim() : '';
  return id || `segment-${index + 1}`;
}

function categoryCapture(segment: Segment | undefined, category: CoreCategory) {
  return clampPct(segment?.categories?.[category]?.capturedSharePct);
}

function categoryLeakage(segment: Segment | undefined, category: CoreCategory) {
  const wallet = segment?.categories?.[category];
  const capture = categoryCapture(segment, category);
  return clampPct(wallet?.leakagePct, 100 - capture);
}

function categoryWalletIndex(segment: Segment | undefined, category: CoreCategory) {
  return safeIndex(segment?.categories?.[category]?.totalWalletIndex);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function categoryScore(segment: Segment | undefined, category: CoreCategory) {
  return categoryLeakage(segment, category) * categoryWalletIndex(segment, category);
}

function normalizeCategories(categories: CoreCategory[] | undefined): CoreCategory[] {
  const requested = categories?.filter((category): category is CoreCategory => (
    CORE_CATEGORIES.includes(category)
  ));

  return requested && requested.length > 0 ? requested : [...CORE_CATEGORIES];
}

function buildCategoryAnalytic(
  segments: Segment[],
  category: CoreCategory,
): WalletCategoryAnalytic {
  const scoredSegments = segments.map((segment, index) => ({
    id: safeSegmentId(segment, index),
    name: safeSegmentName(segment, index),
    score: categoryScore(segment, category),
  })).sort((first, second) => second.score - first.score || first.name.localeCompare(second.name));
  const leadingSegment = scoredSegments[0] ?? FALLBACK_SEGMENT;
  const segmentCount = Math.max(segments.length, 1);

  return {
    category,
    label: CATEGORY_LABELS[category],
    capturePct: average(segments.map((segment) => categoryCapture(segment, category))),
    leakagePct: average(segments.map((segment) => categoryLeakage(segment, category))),
    walletIndex: average(segments.map((segment) => categoryWalletIndex(segment, category))) || 100,
    opportunityScore: Math.round(
      segments.reduce((sum, segment) => sum + categoryScore(segment, category), 0) / segmentCount,
    ),
    leadingSegmentId: leadingSegment.id,
    leadingSegmentName: leadingSegment.name,
  };
}

function buildSegmentAnalytic(
  segment: Segment,
  index: number,
  categories: CoreCategory[],
): WalletSegmentAnalytic {
  const categoryLeakageScores = categories.reduce<Partial<Record<CoreCategory, number>>>((scores, category) => ({
    ...scores,
    [category]: categoryScore(segment, category),
  }), {});
  const leadingCategory = [...categories].sort((first, second) => (
    finiteNumber(categoryLeakageScores[second]) - finiteNumber(categoryLeakageScores[first])
    || CATEGORY_LABELS[first].localeCompare(CATEGORY_LABELS[second])
  ))[0] ?? 'hospitality';
  const leadingCategoryScore = finiteNumber(categoryLeakageScores[leadingCategory]);

  return {
    id: safeSegmentId(segment, index),
    name: safeSegmentName(segment, index),
    shareOfWalletPct: clampPct(segment.metrics?.shareOfWallet),
    shareOfVisitsPct: clampPct(segment.metrics?.shareOfVisits),
    channelOnlinePct: clampPct(segment.metrics?.channelShareOnlinePct),
    opportunityScore: leadingCategoryScore + safeIndex(segment.opportunityIndex, 0),
    leadingCategory,
    leadingCategoryLabel: CATEGORY_LABELS[leadingCategory],
    categoryLeakageScores,
  };
}

function channelSkew(segments: WalletSegmentAnalytic[]): WalletAnalyticsSummary['channelSkew'] {
  const onlinePct = average(segments.map((segment) => segment.channelOnlinePct));

  if (onlinePct >= 55) return 'Online skew';
  if (onlinePct <= 35) return 'Physical skew';
  return 'Balanced';
}

export function buildWalletAnalytics(
  segments: Segment[] = [],
  categories?: CoreCategory[],
): WalletAnalytics {
  const safeSegments = segments.filter(Boolean);
  const visibleCategories = normalizeCategories(categories);
  const categoryAnalytics = visibleCategories
    .map((category) => buildCategoryAnalytic(safeSegments, category))
    .sort((first, second) => (
      second.opportunityScore - first.opportunityScore
      || first.label.localeCompare(second.label)
    ));
  const segmentAnalytics = safeSegments
    .map((segment, index) => buildSegmentAnalytic(segment, index, visibleCategories))
    .sort((first, second) => (
      second.opportunityScore - first.opportunityScore
      || first.name.localeCompare(second.name)
    ));
  const highestLeakageCategory = categoryAnalytics[0] ?? buildCategoryAnalytic([], 'hospitality');
  const topWalletSegment = segmentAnalytics[0] ?? FALLBACK_SEGMENT;

  return {
    categories: categoryAnalytics,
    segments: segmentAnalytics,
    summary: {
      averageCapturePct: average(categoryAnalytics.map((category) => category.capturePct)),
      averageLeakagePct: average(categoryAnalytics.map((category) => category.leakagePct)),
      highestLeakageCategory,
      topWalletSegment,
      channelSkew: channelSkew(segmentAnalytics),
    },
  };
}
