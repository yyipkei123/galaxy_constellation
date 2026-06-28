import type { CoreCategory, MeasurementCampaign } from './types';

const CAMPAIGN_DURATION_WEEKS = 8;
const CURRENCY_TOKEN_PATTERN = /\b(?:mop|hkd)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/gi;

interface CampaignSeedInput {
  id: string;
  name: string;
  audienceName: string;
  segmentIds: string[];
  corridorId?: MeasurementCampaign['corridorId'];
  lever: string;
  category: MeasurementCampaign['category'];
  indexedRevenueBand: string;
  confidence: MeasurementCampaign['confidence'];
  holdoutPct: number;
  expectedLiftThresholdPct: number;
  baselineIndex: number;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'campaign';
}

function charCodeHash(value: string) {
  const hash = Array.from(value).reduce((sum, char, index) => (
    sum + char.charCodeAt(0) * (index + 1)
  ), 0);

  return String(hash);
}

function audienceSlug(value: string) {
  const slug = slugify(value);

  return slug === 'campaign' ? `${slug}-${charCodeHash(value)}` : slug;
}

function cdeSafeToken(value: string) {
  return value.replace(CURRENCY_TOKEN_PATTERN, 'cde-safe');
}

function weeklySeries(baselineIndex: number, liftThresholdPct: number) {
  return Array.from({ length: CAMPAIGN_DURATION_WEEKS }, (_, index) => {
    const week = index + 1;
    const controlIndex = Math.round(baselineIndex + week * 1.5 + (week % 2));
    const testIndex = Math.round(controlIndex + liftThresholdPct * (0.6 + week / CAMPAIGN_DURATION_WEEKS));

    return {
      week: `Week ${week}`,
      testIndex,
      controlIndex,
    };
  });
}

function campaignFromSeed(seed: CampaignSeedInput): MeasurementCampaign {
  return {
    id: seed.id,
    name: seed.name,
    source: 'seed',
    audienceName: seed.audienceName,
    segmentIds: [...seed.segmentIds],
    corridorId: seed.corridorId,
    lever: seed.lever,
    category: seed.category,
    indexedRevenueBand: seed.indexedRevenueBand,
    confidence: seed.confidence,
    testDesign: {
      holdoutPct: seed.holdoutPct,
      durationWeeks: CAMPAIGN_DURATION_WEEKS,
      expectedLiftThresholdPct: seed.expectedLiftThresholdPct,
    },
    weeklySeries: weeklySeries(seed.baselineIndex, seed.expectedLiftThresholdPct),
  };
}

function categoryForLaunch(lever: string, corridorId?: MeasurementCampaign['corridorId']): CoreCategory | 'corridor' {
  if (corridorId) return 'corridor';
  if (lever === 'hostLift') return 'hospitality';
  if (lever === 'channelShift') return 'entertainment';
  if (lever === 'contentPersonalisation') return 'entertainment';
  return 'retailLuxury';
}

function launchedCampaignId(input: {
  source: 'activation' | 'acquisition';
  audienceName: string;
  segmentIds: string[];
  lever: string;
  corridorId?: MeasurementCampaign['corridorId'];
}) {
  const baseId = `launched-${input.source}-${audienceSlug(input.audienceName)}`;
  const isLegacyPlanPath = input.source === 'activation'
    && input.audienceName === 'Top leakage segments'
    && input.segmentIds.length === 1
    && input.segmentIds[0] === 'cosmopolitan-connoisseurs'
    && input.lever === 'recapture'
    && !input.corridorId;

  if (isLegacyPlanPath) return baseId;

  const signatureParts = [
    input.lever,
    input.corridorId ? `corridor-${input.corridorId}` : '',
    input.segmentIds.length > 0 ? `segments-${input.segmentIds.join('-')}` : 'segments-none',
  ].filter(Boolean);
  const signature = slugify(cdeSafeToken(signatureParts.join('-')));

  return `${baseId}-${signature}`;
}

const campaignSeeds: CampaignSeedInput[] = [
  {
    id: 'promenade-luxury-play',
    name: 'Promenade luxury play',
    audienceName: 'Urban retail connoisseurs',
    segmentIds: ['cosmopolitan-connoisseurs'],
    lever: 'recapture',
    category: 'retailLuxury',
    indexedRevenueBand: '18-28k equiv./mo',
    confidence: 'strong',
    holdoutPct: 12,
    expectedLiftThresholdPct: 5,
    baselineIndex: 112,
  },
  {
    id: 'suite-host-recency-lift',
    name: 'Suite host recency lift',
    audienceName: 'Diamond suite returners',
    segmentIds: ['diamond-high-rollers'],
    lever: 'hostLift',
    category: 'hospitality',
    indexedRevenueBand: '24-36k equiv./mo',
    confidence: 'credible',
    holdoutPct: 10,
    expectedLiftThresholdPct: 4,
    baselineIndex: 121,
  },
  {
    id: 'mobile-itinerary-shift',
    name: 'Mobile itinerary shift',
    audienceName: 'GBA mobile planners',
    segmentIds: ['gba-cross-border-explorers', 'family-leisure-seekers'],
    lever: 'channelShift',
    category: 'entertainment',
    indexedRevenueBand: '8-14k equiv./mo',
    confidence: 'credible',
    holdoutPct: 15,
    expectedLiftThresholdPct: 6,
    baselineIndex: 104,
  },
  {
    id: 'korea-arena-acquisition',
    name: 'Korea arena acquisition',
    audienceName: 'Korea entertainment travellers',
    segmentIds: ['cosmopolitan-connoisseurs', 'mice-business-guests'],
    corridorId: 'korea',
    lever: 'contentPersonalisation',
    category: 'corridor',
    indexedRevenueBand: '22-36k equiv./mo',
    confidence: 'directional',
    holdoutPct: 18,
    expectedLiftThresholdPct: 7,
    baselineIndex: 118,
  },
];

export const campaigns: MeasurementCampaign[] = campaignSeeds.map(campaignFromSeed);

export function getCampaignById(campaignId: string) {
  return campaigns.find((campaign) => campaign.id === campaignId);
}

export function createLaunchedCampaign(input: {
  source: 'activation' | 'acquisition';
  audienceName: string;
  segmentIds: string[];
  lever: string;
  corridorId?: MeasurementCampaign['corridorId'];
}): MeasurementCampaign {
  const audienceName = cdeSafeToken(input.audienceName);
  const lever = cdeSafeToken(input.lever);
  const id = launchedCampaignId({
    source: input.source,
    audienceName,
    segmentIds: input.segmentIds,
    lever,
    corridorId: input.corridorId,
  });
  const liftThreshold = input.source === 'activation' ? 5 : 6;
  const baselineIndex = 100 + input.segmentIds.length * 4 + audienceName.length % 7;

  return {
    id,
    name: `${audienceName} measurement launch`,
    source: input.source,
    audienceName,
    segmentIds: [...input.segmentIds],
    corridorId: input.corridorId,
    lever,
    category: categoryForLaunch(input.lever, input.corridorId),
    indexedRevenueBand: input.corridorId ? '18-30k equiv./mo' : '12-22k equiv./mo',
    confidence: 'directional',
    testDesign: {
      holdoutPct: input.source === 'activation' ? 12 : 15,
      durationWeeks: CAMPAIGN_DURATION_WEEKS,
      expectedLiftThresholdPct: liftThreshold,
    },
    weeklySeries: weeklySeries(baselineIndex, liftThreshold),
  };
}
