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
  panelSharePct: '10–20%';
  dataYears: ['2020', '2024'];
  lensBNote: 'aggregate inbound panel, no PII';
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

export type CorridorId =
  | 'taiwan'
  | 'hongkong'
  | 'gba_mainland'
  | 'japan'
  | 'korea'
  | 'singapore'
  | 'malaysia'
  | 'thailand'
  | 'indonesia'
  | 'philippines';

export type CorridorYear = '2020' | '2024';
export type CorridorMetric = 'arrivals' | 'spend' | 'txnFrequency' | 'gamingSplit';
export type CorridorHaul = 'short' | 'medium' | 'long';
export type DraftLanguage =
  | 'EN'
  | '繁中'
  | '简中'
  | '日本語'
  | '한국어'
  | 'English'
  | 'Bahasa Melayu'
  | 'ไทย'
  | 'Bahasa Indonesia'
  | 'Filipino';
export type PersonaKey =
  | 'fnb_seeker'
  | 'entertainment_lover'
  | 'travel_lover'
  | 'luxury_shopper'
  | 'family_leisure';

export interface PersonaAffinity {
  persona: PersonaKey;
  label: string;
  sharePct: number;
  topCategories: string[];
  recommendedOffer: string;
  kvBrief: string;
}

export interface Corridor {
  id: CorridorId;
  name: string;
  nameZh: string;
  language: 'zh-TW' | 'zh-HK' | 'zh-CN' | 'ja' | 'ko' | 'en-SG' | 'ms' | 'th' | 'id' | 'fil';
  languageLabel: string;
  haul: CorridorHaul;
  arrivalsIndex: Record<CorridorYear, number>;
  spendIndex: Record<CorridorYear, number>;
  txnFrequencyIndex: number;
  avgTicketBand: 'mass' | 'upper-mid' | 'premium' | 'luxury';
  projectedValueBand: string;
  gamingSharePct: number;
  nonGamingSharePct: number;
  // Values are category indices, not percentage shares.
  nonGamingMix: { hospitality: number; fnb: number; entertainment: number; retail: number };
  seasonality: number[];
  personas: PersonaAffinity[];
  priorityIndex: number;
  priorityRank: number;
  dataVintage: CorridorYear;
  note?: string;
}

export interface AcquisitionDraftVariant {
  id: 'A' | 'B';
  subject: string;
  body: string;
  kvCaption: string;
}

export interface AcquisitionDraft {
  corridorId: CorridorId;
  persona: PersonaKey;
  languages: DraftLanguage[];
  variants: AcquisitionDraftVariant[];
  versionHistory: string[];
}

export interface CampaignWeeklyPoint {
  week: string;
  testIndex: number;
  controlIndex: number;
}

export interface CampaignTestDesign {
  holdoutPct: number;
  durationWeeks: number;
  expectedLiftThresholdPct: number;
}

export interface MeasurementCampaign {
  id: string;
  name: string;
  source: 'seed' | 'activation' | 'acquisition';
  audienceName: string;
  segmentIds: string[];
  corridorId?: CorridorId;
  lever: string;
  category: CoreCategory | 'corridor';
  indexedRevenueBand: string;
  confidence: 'directional' | 'credible' | 'strong';
  testDesign: CampaignTestDesign;
  weeklySeries: CampaignWeeklyPoint[];
}

export type CampaignCreativeLanguage = 'EN' | '繁中' | '한국어';

export interface CampaignCreativeVariant {
  id: 'A' | 'B';
  language: CampaignCreativeLanguage;
  subject: string;
  body: string;
  guardrail: string;
}

export interface CampaignCreativeDraft {
  id: string;
  campaignId: string;
  corridorId?: CorridorId;
  languages: CampaignCreativeLanguage[];
  variants: CampaignCreativeVariant[];
  versionHistory: string[];
}

export type ScenarioLever = 'recapture' | 'channelShift' | 'hostLift' | 'contentPersonalisation';

export interface SavedScenario {
  id: string;
  name: string;
  segmentIds: string[];
  category: CoreCategory;
  recapturePct: number;
  onlineShiftPct: number;
  lever: ScenarioLever;
  createdAt: string;
}

export interface ScenarioImpact {
  walletUpliftIndex: number;
  opportunityIndexDelta: number;
  pitchNowGuestsK: number;
  projectedBand: string;
  constellationShift: Array<{
    segmentId: string;
    label: string;
    beforeIndex: number;
    afterIndex: number;
  }>;
}

export interface SemanticFact {
  id: string;
  label: string;
  value: string | number;
  source: string;
  route: string;
}

export type GalaxyTier = 'Privilege' | 'Gold' | 'Platinum' | 'Diamond';
export type GuestCategory = CoreCategory;
export type NbaChannel = 'online' | 'physical' | 'host';

export type GuestPreferredLanguage = 'English' | 'Cantonese' | 'Mandarin' | 'Korean' | 'Japanese';
export type GuestConsentStatus = 'marketable' | 'service-only';
export type GuestTravelParty = 'Solo' | 'Couple' | 'Family' | 'Business party' | 'Friends';
export type GuestPurchaseChannel = 'Host' | 'Concierge' | 'Rewards app' | 'On-property' | 'Pre-arrival';

export interface GuestProfile {
  displayName: string;
  displayNameZh: string;
  syntheticName: true;
  ageBand: '25-34' | '35-44' | '45-54' | '55-64';
  originMarket: 'Hong Kong' | 'Guangdong' | 'Taiwan' | 'Singapore' | 'Malaysia' | 'Thailand' | 'Japan' | 'Korea';
  preferredLanguage: GuestPreferredLanguage;
  travelParty: GuestTravelParty;
  hostOwner: 'Host Team A' | 'Host Team B' | 'Host Team C' | 'Host Team D';
  contactability: 'Host-led' | 'Digital opt-in' | 'Concierge-led' | 'Rewards app';
  consentStatus: GuestConsentStatus;
  homeProperty: string;
  membershipTenureBand: string;
}

export interface GuestPreferences {
  favoriteCategories: string[];
  servicePreferences: string[];
  occasionSignals: string[];
}

export interface GuestStayHistoryItem {
  id: string;
  periodLabel: string;
  property: string;
  nightsBand: string;
  roomType: 'Suite' | 'Club room' | 'Premium room' | 'Family room' | 'Business room';
  occasion: string;
  satisfactionSignal: 'Positive' | 'Neutral' | 'Service recovery';
}

export interface GuestPurchaseHistoryItem {
  id: string;
  periodLabel: string;
  category: GuestCategory;
  merchantArea: string;
  itemLabel: string;
  channel: GuestPurchaseChannel;
  ticketBand: 'entry' | 'premium' | 'ultra';
  galaxyOwned: true;
}

export interface NbaRec {
  offer: string;
  rationale: string;
  upliftIndex: number;
  channel: NbaChannel;
  confidence: number;
}

export interface Guest {
  id: string;
  segmentId: string;
  persona: string;
  galaxyTier: GalaxyTier;
  profile: GuestProfile;
  preferences: GuestPreferences;
  firstParty: {
    lifetimeBand: 'mid' | 'high' | 'ultra';
    staysL12m: number;
    nightsBand: string;
    properties: string[];
    diningVisits: number;
    entertainmentVisits: number;
    recencyDays: number;
    frequencyIndex: number;
    rewardsPoints: number;
    gamingContextIndex?: number;
  };
  stayHistory: GuestStayHistoryItem[];
  purchaseHistory: GuestPurchaseHistoryItem[];
  cde: {
    categoryCapturePct: Record<GuestCategory, number>;
    categoryLeakagePct: Record<GuestCategory, number>;
    categoryWalletIndex: Record<GuestCategory, number>;
    propensities: Propensities;
    crossPropertyCashBand: string;
    channelOnlinePct: number;
  };
  leadScore: number;
  projectedUpsideBand: string;
  primaryOpportunity: GuestCategory;
  scoreDrivers: string[];
  nextBestActions: NbaRec[];
  pitchScript: { en: string; zh: string };
}
