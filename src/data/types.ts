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

export type PersonaPriority = 'priority' | 'watch' | 'nurture';
export type PersonaWealthTier = 'VIP' | 'Premium' | 'Mass-Affluent' | 'Mass';
export type PersonaActivationChannel = 'Host' | 'Mini Program' | 'Concierge' | 'Paid Media' | 'CRM';

export interface PersonaRecommendation {
  title: string;
  channel: PersonaActivationChannel;
  action: string;
  rationale: string;
}

export interface SegmentPersona {
  id: string;
  segmentId: string;
  name: string;
  nameZh: string;
  audienceK: number;
  ageBand: string;
  travelMode: string;
  wealthTier: PersonaWealthTier;
  priority: PersonaPriority;
  primaryNeed: string;
  galaxyKnownSignal: string;
  mastercardCdeReveal: string;
  walletGap: string;
  opportunityIndex: number;
  leakagePct: number;
  propensityScore: number;
  readinessScore: number;
  crossPropertyCashBand: string;
  recommendedProducts: string[];
  recommendations: PersonaRecommendation[];
  sellingPoints: string[];
  tags: string[];
}

export interface PersonaCluster {
  segmentId: string;
  label: string;
  personaIds: string[];
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
