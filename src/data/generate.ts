import { formatGuestBand } from '@/lib/format';
import { clamp, jitter, mulberry32 } from '@/lib/rng';
import type {
  ColorToken,
  CoreCategory,
  CrmRow,
  CdeMetrics,
  MarketScanTile,
  Methodology,
  Propensities,
  Quarter,
  RecommendedPlay,
  Segment,
} from './types';

export const CORE_CATEGORIES = ['hospitality', 'fnb', 'entertainment', 'retailLuxury'] as const satisfies readonly CoreCategory[];

type CategoryInputs = Record<CoreCategory, { capturedSharePct: number; totalWalletIndex: number; sub?: Record<string, number> }>;

interface BaseSegment {
  id: string;
  name: string;
  nameZh: string;
  colorToken: ColorToken;
  sizeLowK: number;
  sizeHighK: number;
  signatureTrait: string;
  metrics: CdeMetrics;
  propensities: Propensities;
  categories: CategoryInputs;
  gamingContextIndex?: number;
  crossPropertyCashIndex: number;
  crossPropertyCashBand: string;
  recommendedPlays: RecommendedPlay[];
}

const baseSegments: BaseSegment[] = [
  {
    id: 'diamond-high-rollers',
    name: 'Diamond High-Rollers',
    nameZh: '鑽石貴賓',
    colorToken: 'gold',
    sizeLowK: 8,
    sizeHighK: 12,
    signatureTrait: 'Very high hospitality capture with premium gaming and suite-led visitation.',
    metrics: {
      shareOfWallet: 72,
      shareOfVisits: 68,
      avgTxnCountIndex: 162,
      avgTxnSizeIndex: 188,
      avgIndustrySpendIndex: 214,
      channelShareOnlinePct: 24,
      channelVisitsIndex: 132,
    },
    propensities: {
      luxuryHotelSpender: 0.91,
      topTierRewards: 0.88,
      coBrandLookAlike: 0.74,
    },
    categories: {
      hospitality: { capturedSharePct: 72, totalWalletIndex: 218, sub: { suites: 186, spa: 142 } },
      fnb: { capturedSharePct: 61, totalWalletIndex: 176, sub: { fineDining: 191, nightlife: 126 } },
      entertainment: { capturedSharePct: 48, totalWalletIndex: 138, sub: { premiumShows: 151 } },
      retailLuxury: { capturedSharePct: 58, totalWalletIndex: 203, sub: { watchesJewelry: 221, fashion: 184 } },
    },
    gamingContextIndex: 226,
    crossPropertyCashIndex: 192,
    crossPropertyCashBand: '24-36k equiv./mo',
    recommendedPlays: [
      {
        title: 'Suite-hosted luxury trunk weekend',
        lever: 'VIP host invite',
        rationale: 'RetailLuxury and hospitality leakage remains material despite premium spend concentration.',
        offerTerm: 'Private preview plus suite upgrade priority',
        channel: 'Hybrid',
      },
      {
        title: 'Fine dining pre-arrival concierge',
        lever: 'Host-to-WeChat booking',
        rationale: 'High F&B wallet index supports earlier reservation capture.',
        channel: 'Online',
      },
    ],
  },
  {
    id: 'cosmopolitan-connoisseurs',
    name: 'Cosmopolitan Connoisseurs',
    nameZh: '都會鑑賞家',
    colorToken: 'goldLite',
    sizeLowK: 16,
    sizeHighK: 24,
    signatureTrait: 'Food, retail, and boutique-stay guests comparing Macau luxury districts.',
    metrics: {
      shareOfWallet: 55,
      shareOfVisits: 58,
      avgTxnCountIndex: 131,
      avgTxnSizeIndex: 154,
      avgIndustrySpendIndex: 168,
      channelShareOnlinePct: 42,
      channelVisitsIndex: 118,
    },
    propensities: {
      luxuryHotelSpender: 0.82,
      topTierRewards: 0.63,
      coBrandLookAlike: 0.86,
    },
    categories: {
      hospitality: { capturedSharePct: 55, totalWalletIndex: 162, sub: { clubRooms: 152, spa: 133 } },
      fnb: { capturedSharePct: 57, totalWalletIndex: 181, sub: { chefLed: 194, bars: 149 } },
      entertainment: { capturedSharePct: 44, totalWalletIndex: 132, sub: { concerts: 146 } },
      retailLuxury: { capturedSharePct: 46, totalWalletIndex: 187, sub: { beauty: 161, fashion: 197 } },
    },
    gamingContextIndex: 118,
    crossPropertyCashIndex: 156,
    crossPropertyCashBand: '14-22k equiv./mo',
    recommendedPlays: [
      {
        title: 'Michelin-to-boutique retail path',
        lever: 'Reservation-linked retail benefit',
        rationale: 'High F&B intensity can bridge under-captured retailLuxury wallet.',
        offerTerm: 'Chef table access with curated boutique appointment',
        channel: 'Hybrid',
      },
    ],
  },
  {
    id: 'gba-cross-border-explorers',
    name: 'GBA Cross-Border Explorers',
    nameZh: '大灣區跨境客',
    colorToken: 'positive',
    sizeLowK: 38,
    sizeHighK: 52,
    signatureTrait: 'Short-stay, mobile-first guests with frequent regional comparison behavior.',
    metrics: {
      shareOfWallet: 43,
      shareOfVisits: 51,
      avgTxnCountIndex: 118,
      avgTxnSizeIndex: 104,
      avgIndustrySpendIndex: 121,
      channelShareOnlinePct: 67,
      channelVisitsIndex: 144,
    },
    propensities: {
      luxuryHotelSpender: 0.46,
      topTierRewards: 0.41,
      coBrandLookAlike: 0.79,
    },
    categories: {
      hospitality: { capturedSharePct: 43, totalWalletIndex: 124, sub: { shortBreaks: 139, dayPackages: 128 } },
      fnb: { capturedSharePct: 49, totalWalletIndex: 133, sub: { casualDining: 147, cafes: 122 } },
      entertainment: { capturedSharePct: 53, totalWalletIndex: 141, sub: { familyShows: 136, concerts: 151 } },
      retailLuxury: { capturedSharePct: 34, totalWalletIndex: 119, sub: { beauty: 127, accessibleLuxury: 134 } },
    },
    gamingContextIndex: 104,
    crossPropertyCashIndex: 118,
    crossPropertyCashBand: '6-10k equiv./mo',
    recommendedPlays: [
      {
        title: 'Cross-border flash itinerary',
        lever: 'Geo-triggered mini program',
        rationale: 'Online share and visit index point to mobile-led conversion before arrival.',
        offerTerm: 'Same-week stay, dining, and show bundle',
        channel: 'Online',
      },
    ],
  },
  {
    id: 'family-leisure-seekers',
    name: 'Family Leisure Seekers',
    nameZh: '親子度假客',
    colorToken: 'market',
    sizeLowK: 28,
    sizeHighK: 40,
    signatureTrait: 'School-holiday and weekend planners seeking bundled entertainment certainty.',
    metrics: {
      shareOfWallet: 49,
      shareOfVisits: 56,
      avgTxnCountIndex: 109,
      avgTxnSizeIndex: 96,
      avgIndustrySpendIndex: 112,
      channelShareOnlinePct: 58,
      channelVisitsIndex: 127,
    },
    propensities: {
      luxuryHotelSpender: 0.38,
      topTierRewards: 0.34,
      coBrandLookAlike: 0.57,
    },
    categories: {
      hospitality: { capturedSharePct: 49, totalWalletIndex: 118, sub: { connectingRooms: 132, weekendPackages: 125 } },
      fnb: { capturedSharePct: 52, totalWalletIndex: 112, sub: { buffets: 137, casualDining: 119 } },
      entertainment: { capturedSharePct: 64, totalWalletIndex: 151, sub: { familyShows: 168, attractions: 142 } },
      retailLuxury: { capturedSharePct: 29, totalWalletIndex: 94, sub: { kidsLifestyle: 113, beauty: 87 } },
    },
    crossPropertyCashIndex: 86,
    crossPropertyCashBand: '4-7k equiv./mo',
    recommendedPlays: [
      {
        title: 'Holiday certainty bundle',
        lever: 'Room and attraction packaging',
        rationale: 'Entertainment capture is strong while hospitality still leaks to comparable family resorts.',
        offerTerm: 'Flexible room plus guaranteed show seats',
        channel: 'Online',
      },
    ],
  },
  {
    id: 'mice-business-guests',
    name: 'MICE & Business Guests',
    nameZh: '商務會展客',
    colorToken: 'goldDeep',
    sizeLowK: 18,
    sizeHighK: 26,
    signatureTrait: 'Weekday business travelers whose spend can extend into dining and return leisure.',
    metrics: {
      shareOfWallet: 58,
      shareOfVisits: 61,
      avgTxnCountIndex: 126,
      avgTxnSizeIndex: 119,
      avgIndustrySpendIndex: 136,
      channelShareOnlinePct: 36,
      channelVisitsIndex: 113,
    },
    propensities: {
      luxuryHotelSpender: 0.69,
      topTierRewards: 0.58,
      coBrandLookAlike: 0.52,
    },
    categories: {
      hospitality: { capturedSharePct: 58, totalWalletIndex: 142, sub: { weekdayRooms: 154, suites: 119 } },
      fnb: { capturedSharePct: 46, totalWalletIndex: 138, sub: { privateDining: 141, bars: 132 } },
      entertainment: { capturedSharePct: 31, totalWalletIndex: 92, sub: { concerts: 98 } },
      retailLuxury: { capturedSharePct: 36, totalWalletIndex: 121, sub: { gifting: 137, watchesJewelry: 114 } },
    },
    gamingContextIndex: 96,
    crossPropertyCashIndex: 132,
    crossPropertyCashBand: '10-16k equiv./mo',
    recommendedPlays: [
      {
        title: 'Business-to-leisure extension',
        lever: 'Post-event concierge follow-up',
        rationale: 'Hospitality base is strong, but entertainment and retailLuxury are under-captured.',
        offerTerm: 'Partner stay extension and private dining hold',
        channel: 'Hybrid',
      },
    ],
  },
  {
    id: 'aspiring-mass-affluent',
    name: 'Aspiring Mass-Affluent',
    nameZh: '新晉中產客',
    colorToken: 'leak',
    sizeLowK: 44,
    sizeHighK: 62,
    signatureTrait: 'Value-aware guests with rising luxury propensity and broad competitor consideration.',
    metrics: {
      shareOfWallet: 35,
      shareOfVisits: 43,
      avgTxnCountIndex: 96,
      avgTxnSizeIndex: 88,
      avgIndustrySpendIndex: 101,
      channelShareOnlinePct: 63,
      channelVisitsIndex: 121,
    },
    propensities: {
      luxuryHotelSpender: 0.33,
      topTierRewards: 0.29,
      coBrandLookAlike: 0.61,
    },
    categories: {
      hospitality: { capturedSharePct: 35, totalWalletIndex: 104, sub: { entrySuites: 112, weekendPackages: 121 } },
      fnb: { capturedSharePct: 42, totalWalletIndex: 109, sub: { casualDining: 126, bars: 104 } },
      entertainment: { capturedSharePct: 39, totalWalletIndex: 118, sub: { concerts: 132, attractions: 114 } },
      retailLuxury: { capturedSharePct: 24, totalWalletIndex: 106, sub: { beauty: 119, accessibleLuxury: 128 } },
    },
    gamingContextIndex: 82,
    crossPropertyCashIndex: 74,
    crossPropertyCashBand: '3-6k equiv./mo',
    recommendedPlays: [
      {
        title: 'Step-up rewards accelerator',
        lever: 'Tier-progress challenge',
        rationale: 'Large segment size and high leakage create efficient reacquisition headroom.',
        offerTerm: 'Two-visit challenge with dining and retail multipliers',
        channel: 'Online',
      },
    ],
  },
];

export const quarters: Quarter[] = [
  { id: '2025-q3', label: '2025 Q3', isCurrent: false },
  { id: '2025-q4', label: '2025 Q4', isCurrent: false },
  { id: '2026-q1', label: '2026 Q1', isCurrent: false },
  { id: '2026-q2', label: '2026 Q2', isCurrent: true },
];

export const methodology: Methodology = {
  matchedCoveragePct: 63,
  basis: 'demi-decile average',
  refresh: 'quarterly',
  activeMetricCount: 7,
  panelSharePct: '10–20%',
  dataYears: ['2020', '2024'],
  lensBNote: 'aggregate inbound panel, no PII',
};

const categoryWeights: Record<CoreCategory, number> = {
  hospitality: 0.35,
  retailLuxury: 0.3,
  fnb: 0.25,
  entertainment: 0.1,
};

function buildOpportunityScore(segment: Segment) {
  return CORE_CATEGORIES.reduce((score, category) => {
    const wallet = segment.categories[category];
    return score + wallet.leakagePct * wallet.totalWalletIndex * categoryWeights[category];
  }, 0);
}

function generateSegment(base: BaseSegment, random: () => number, quarterIndex: number): Segment {
  const maturity = quarterIndex - (quarters.length - 1);
  const trend = maturity * 2;
  const hospitalityCapture = jitter(base.categories.hospitality.capturedSharePct + trend, random, 4, 15, 88);
  const sizeLowK = jitter(base.sizeLowK, random, 3, 4, 80);
  const sizeHighK = jitter(base.sizeHighK, random, 4, 6, 90);

  const categories = CORE_CATEGORIES.reduce(
    (wallets, category) => {
      const baseWallet = base.categories[category];
      const capturedSharePct = category === 'hospitality'
        ? hospitalityCapture
        : jitter(baseWallet.capturedSharePct + trend, random, 5, 12, 86);

      wallets[category] = {
        capturedSharePct,
        leakagePct: 100 - capturedSharePct,
        totalWalletIndex: jitter(baseWallet.totalWalletIndex, random, 12, 70, 260),
        sub: baseWallet.sub,
      };
      return wallets;
    },
    {} as Segment['categories'],
  );

  const metrics: CdeMetrics = {
    shareOfWallet: categories.hospitality.capturedSharePct,
    shareOfVisits: jitter(base.metrics.shareOfVisits + trend, random, 4, 20, 90),
    avgTxnCountIndex: jitter(base.metrics.avgTxnCountIndex, random, 10, 60, 240),
    avgTxnSizeIndex: jitter(base.metrics.avgTxnSizeIndex, random, 10, 60, 260),
    avgIndustrySpendIndex: jitter(base.metrics.avgIndustrySpendIndex, random, 12, 70, 280),
    channelShareOnlinePct: jitter(base.metrics.channelShareOnlinePct, random, 5, 10, 85),
    channelVisitsIndex: jitter(base.metrics.channelVisitsIndex, random, 8, 70, 180),
  };

  return {
    id: base.id,
    name: base.name,
    nameZh: base.nameZh,
    colorToken: base.colorToken,
    sizeLowK,
    sizeHighK,
    sizeBand: formatGuestBand(sizeLowK, sizeHighK),
    signatureTrait: base.signatureTrait,
    metrics,
    propensities: {
      luxuryHotelSpender: Number(clamp(base.propensities.luxuryHotelSpender + (random() - 0.5) * 0.04, 0, 1).toFixed(2)),
      topTierRewards: Number(clamp(base.propensities.topTierRewards + (random() - 0.5) * 0.04, 0, 1).toFixed(2)),
      coBrandLookAlike: Number(clamp(base.propensities.coBrandLookAlike + (random() - 0.5) * 0.04, 0, 1).toFixed(2)),
    },
    categories,
    gamingContextIndex: base.gamingContextIndex ? jitter(base.gamingContextIndex, random, 10, 50, 260) : undefined,
    crossPropertyCashIndex: jitter(base.crossPropertyCashIndex, random, 10, 40, 240),
    crossPropertyCashBand: base.crossPropertyCashBand,
    opportunityIndex: 100,
    recommendedPlays: base.recommendedPlays,
  };
}

function normalizeOpportunity(segments: Segment[]) {
  const scores = segments.map(buildOpportunityScore);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return segments.map((segment, index) => ({
    ...segment,
    opportunityIndex: Math.round((scores[index] / mean) * 100),
  }));
}

export const segmentsByQuarter: Record<string, Segment[]> = Object.fromEntries(
  quarters.map((quarter, quarterIndex) => {
    const random = mulberry32(202602 + quarterIndex * 101);
    const segments = baseSegments.map((segment) => generateSegment(segment, random, quarterIndex));
    return [quarter.id, normalizeOpportunity(segments)];
  }),
);

export const latestQuarter = quarters[quarters.length - 1];
export const latestSegments = segmentsByQuarter[latestQuarter.id];

const crmSegmentOrder = [
  'diamond-high-rollers',
  'cosmopolitan-connoisseurs',
  'gba-cross-border-explorers',
  'family-leisure-seekers',
  'mice-business-guests',
  'aspiring-mass-affluent',
  'gba-cross-border-explorers',
  'cosmopolitan-connoisseurs',
  'family-leisure-seekers',
  'aspiring-mass-affluent',
];

const competitorSpendBands = [
  '24-36k equiv./mo',
  '16-24k equiv./mo',
  '8-12k equiv./mo',
  '6-10k equiv./mo',
  '12-18k equiv./mo',
  '4-7k equiv./mo',
  '7-11k equiv./mo',
  '14-20k equiv./mo',
  '5-8k equiv./mo',
  '3-6k equiv./mo',
];

export const crmRows: CrmRow[] = crmSegmentOrder.map((segmentId, index) => {
  const segment = latestSegments.find((item) => item.id === segmentId) ?? latestSegments[0];
  const maskedSuffix = String(3421 + index * 173).slice(-4);

  return {
    customerId: `MEM-••••${maskedSuffix}`,
    segmentId,
    categorySharePct: segment.metrics.shareOfWallet,
    competitorSpendBand: competitorSpendBands[index],
    luxuryRetailIndex: segment.categories.retailLuxury.totalWalletIndex,
    propensityScore: Number(segment.propensities.coBrandLookAlike.toFixed(2)),
  };
});

export const marketScanTiles: MarketScanTile[] = [
  {
    title: 'Summer concert clustering',
    sourceType: 'competitor calendar',
    signal: 'Three Cotai properties have announced July headline events.',
    implication: 'Protect entertainment-led visitation with earlier show and room bundling.',
  },
  {
    title: 'Chef-led dining share lift',
    sourceType: 'social sentiment',
    signal: 'Premium dining mentions are rising around tasting menus and private rooms.',
    implication: 'Use F&B affinity to bridge retailLuxury and hospitality leakage.',
  },
  {
    title: 'Luxury watch launch window',
    sourceType: 'PR/news',
    signal: 'Regional boutiques are promoting limited-edition appointment drops.',
    implication: 'Prioritize high-index guests for private retail preview invitations.',
  },
  {
    title: 'Share-of-voice gap watch',
    sourceType: 'share of voice',
    signal: 'Galaxy luxury hospitality conversation trails newer competitor resort packages in regional media.',
    implication: 'Rebalance premium storytelling toward suite, dining, and rewards proof points before peak weekends.',
  },
  {
    title: 'GBA weekend footfall pulse',
    sourceType: 'footfall signal',
    signal: 'Border-adjacent weekend arrivals remain above the quarterly baseline.',
    implication: 'Keep mobile-first same-week itineraries live for cross-border explorers.',
  },
];
