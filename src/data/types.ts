export type CoreCategory = 'hospitality' | 'fnb' | 'entertainment' | 'retailLuxury';
export type CategoryKey = CoreCategory | 'gaming' | 'crossPropertyCash';
export type ColorToken = 'gold' | 'positive' | 'leak' | 'market' | 'goldLite' | 'goldDeep';

export interface CategoryWallet {
  capturedSharePct: number;
  leakagePct: number;
  totalWalletIndex: number;
  sub?: Record<string, number>;
}

export interface CdeMetrics {
  shareOfWallet: number;
  shareOfVisits: number;
  avgTxnCountIndex: number;
  avgTxnSizeIndex: number;
  avgIndustrySpendIndex: number;
  channelShareOnlinePct: number;
  channelVisitsIndex: number;
}

export interface Propensities {
  luxuryHotelSpender: number;
  topTierRewards: number;
  coBrandLookAlike: number;
}

export interface RecommendedPlay {
  title: string;
  lever: string;
  rationale: string;
  offerTerm?: string;
  channel: 'Online' | 'Physical' | 'Hybrid';
}

export interface Segment {
  id: string;
  name: string;
  nameZh: string;
  colorToken: ColorToken;
  sizeBand: string;
  sizeLowK: number;
  sizeHighK: number;
  signatureTrait: string;
  metrics: CdeMetrics;
  propensities: Propensities;
  categories: Record<CoreCategory, CategoryWallet>;
  gamingContextIndex?: number;
  crossPropertyCashIndex: number;
  crossPropertyCashBand: string;
  opportunityIndex: number;
  recommendedPlays: RecommendedPlay[];
}

export interface Quarter {
  id: string;
  label: string;
  isCurrent: boolean;
}

export interface Methodology {
  matchedCoveragePct: number;
  basis: 'demi-decile average';
  refresh: 'quarterly';
  activeMetricCount: 7;
}

export interface CrmRow {
  customerId: string;
  segmentId: string;
  categorySharePct: number;
  competitorSpendBand: string;
  luxuryRetailIndex: number;
  propensityScore: number;
}

export interface MarketScanTile {
  title: string;
  sourceType: 'competitor calendar' | 'social sentiment' | 'PR/news' | 'share of voice' | 'footfall signal';
  signal: string;
  implication: string;
}
