import { clamp, jitter, mulberry32 } from '@/lib/rng';
import { CORE_CATEGORIES, latestSegments } from './generate';
import type { CoreCategory, GalaxyTier, Guest, NbaRec, Propensities, Segment } from './types';

export { CORE_CATEGORIES };

const properties = ['Ritz-Carlton', 'Banyan Tree', 'Capella', 'Hotel Okura', 'Galaxy Hotel'];
const tierOrder: GalaxyTier[] = ['Privilege', 'Gold', 'Platinum', 'Diamond'];
const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

function stableDigits(index: number) {
  return String(3421 + index * 137).slice(-4).padStart(4, '0');
}

function lifetimeBand(segment: Segment, index: number): 'mid' | 'high' | 'ultra' {
  if (segment.opportunityIndex >= 150 && index % 3 === 0) return 'ultra';
  if (segment.opportunityIndex >= 125 || index % 2 === 0) return 'high';
  return 'mid';
}

function tierFor(segment: Segment, index: number): GalaxyTier {
  if (segment.opportunityIndex >= 155 && index % 3 !== 1) return 'Diamond';
  if (segment.opportunityIndex >= 130) return index % 2 === 0 ? 'Platinum' : 'Diamond';
  return tierOrder[(index + segment.name.length) % tierOrder.length];
}

function valueScore(guest: Omit<Guest, 'leadScore'>) {
  const tierScore = { Privilege: 42, Gold: 58, Platinum: 78, Diamond: 94 }[guest.galaxyTier];
  const lifetimeScore = { mid: 52, high: 76, ultra: 96 }[guest.firstParty.lifetimeBand];
  return tierScore * 0.45 + lifetimeScore * 0.35 + clamp(guest.firstParty.frequencyIndex, 70, 180) * 0.2;
}

function opportunityScore(guest: Omit<Guest, 'leadScore'>) {
  const values = CORE_CATEGORIES.map((category) => {
    const leakage = guest.cde.categoryLeakagePct[category];
    const wallet = guest.cde.categoryWalletIndex[category];
    return leakage * (wallet / 100);
  });
  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length, 0, 100);
}

function propensityScore(propensities: Propensities) {
  return (
    propensities.topTierRewards * 0.45
    + propensities.coBrandLookAlike * 0.35
    + propensities.luxuryHotelSpender * 0.2
  ) * 100;
}

function engagementScore(guest: Omit<Guest, 'leadScore'>) {
  const recency = clamp(100 - guest.firstParty.recencyDays * 1.8, 0, 100);
  const frequency = clamp(guest.firstParty.frequencyIndex - 60, 0, 100);
  return recency * 0.45 + frequency * 0.55;
}

function computeLeadScore(guest: Omit<Guest, 'leadScore'>) {
  return Math.round(clamp(
    valueScore(guest) * 0.30
    + opportunityScore(guest) * 0.30
    + propensityScore(guest.cde.propensities) * 0.25
    + engagementScore(guest) * 0.15,
    0,
    100,
  ));
}

function primaryOpportunity(capture: Record<CoreCategory, number>, wallet: Record<CoreCategory, number>) {
  return [...CORE_CATEGORIES].sort((a, b) => (
    (100 - capture[b]) * wallet[b] - (100 - capture[a]) * wallet[a]
  ))[0];
}

function projectedBand(score: number) {
  const low = Math.max(4, Math.round(score / 8));
  const high = low + 6 + Math.round(score / 18);
  return `${low}-${high}k equiv./mo`;
}

function actionFor(category: CoreCategory, propensities: Propensities): NbaRec[] {
  const offerMap: Record<CoreCategory, string> = {
    hospitality: 'Capella or Ritz suite upgrade with host-arranged arrival',
    fnb: 'Chef table dining privilege with pre-arrival concierge',
    entertainment: 'Galaxy Arena presale access with premium dining bundle',
    retailLuxury: 'Promenade private retail appointment paired with suite stay',
  };
  const channel = propensities.topTierRewards > 0.75
    ? 'host'
    : propensities.coBrandLookAlike > 0.72
      ? 'online'
      : 'physical';

  return [
    {
      offer: offerMap[category],
      rationale: `${category} has the clearest capture gap after combining Galaxy behavior with CDE wallet indices.`,
      upliftIndex: Math.round(118 + propensities.coBrandLookAlike * 42),
      channel,
      confidence: Number(clamp(0.62 + propensities.topTierRewards * 0.25, 0, 0.96).toFixed(2)),
    },
  ];
}

function buildGuest(segment: Segment, index: number, globalIndex: number): Guest {
  const random = mulberry32(9000 + globalIndex * 19);
  const categoryCapturePct = Object.fromEntries(CORE_CATEGORIES.map((category) => {
    const base = segment.categories[category].capturedSharePct;
    return [category, clamp(jitter(base, random, 18, 18, 86), 0, 100)];
  })) as Record<CoreCategory, number>;
  const categoryLeakagePct = Object.fromEntries(CORE_CATEGORIES.map((category) => (
    [category, 100 - categoryCapturePct[category]]
  ))) as Record<CoreCategory, number>;
  const categoryWalletIndex = Object.fromEntries(CORE_CATEGORIES.map((category) => (
    [category, clamp(jitter(segment.categories[category].totalWalletIndex, random, 34, 70, 260), 0, 999)]
  ))) as Record<CoreCategory, number>;
  const propensities: Propensities = {
    luxuryHotelSpender: Number(clamp(segment.propensities.luxuryHotelSpender + (random() - 0.5) * 0.18, 0, 1).toFixed(2)),
    topTierRewards: Number(clamp(segment.propensities.topTierRewards + (random() - 0.5) * 0.18, 0, 1).toFixed(2)),
    coBrandLookAlike: Number(clamp(segment.propensities.coBrandLookAlike + (random() - 0.5) * 0.18, 0, 1).toFixed(2)),
  };
  const primary = primaryOpportunity(categoryCapturePct, categoryWalletIndex);
  const primaryPropertyIndex = (index + globalIndex) % properties.length;
  const secondaryPropertyIndex = (primaryPropertyIndex + 1 + (index % (properties.length - 1))) % properties.length;
  const baseGuest: Omit<Guest, 'leadScore'> = {
    id: `MEM-••••${stableDigits(globalIndex)}`,
    segmentId: segment.id,
    persona: segment.name,
    galaxyTier: tierFor(segment, index),
    firstParty: {
      lifetimeBand: lifetimeBand(segment, index),
      staysL12m: Math.max(1, Math.round(2 + segment.metrics.shareOfVisits / 18 + random() * 4)),
      nightsBand: `${2 + (index % 3)}-${5 + (index % 4)} nights`,
      properties: [properties[primaryPropertyIndex], properties[secondaryPropertyIndex]],
      diningVisits: Math.round(2 + segment.categories.fnb.capturedSharePct / 12 + random() * 5),
      entertainmentVisits: Math.round(1 + segment.categories.entertainment.capturedSharePct / 16 + random() * 3),
      recencyDays: Math.round(5 + random() * 42),
      frequencyIndex: clamp(jitter(segment.metrics.avgTxnCountIndex, random, 28, 70, 210), 0, 999),
      rewardsPoints: Math.round(1800 + segment.metrics.avgTxnSizeIndex * 72 + random() * 4200),
      gamingContextIndex: segment.gamingContextIndex,
    },
    cde: {
      categoryCapturePct,
      categoryLeakagePct,
      categoryWalletIndex,
      propensities,
      crossPropertyCashBand: segment.crossPropertyCashBand,
      channelOnlinePct: clamp(jitter(segment.metrics.channelShareOnlinePct, random, 18, 12, 92), 0, 100),
    },
    projectedUpsideBand: '0-0k equiv./mo',
    primaryOpportunity: primary,
    scoreDrivers: [
      `${primary} leakage ${categoryLeakagePct[primary]}%`,
      `wallet ${Math.round(categoryWalletIndex[primary])} index`,
      `${tierFor(segment, index)} tier`,
    ],
    nextBestActions: actionFor(primary, propensities),
    pitchScript: {
      en: '',
      zh: '',
    },
  };
  const leadScore = computeLeadScore(baseGuest);
  const projectedUpsideBand = projectedBand(leadScore);
  const leadLabel = `${baseGuest.galaxyTier}-tier guest`;
  const englishPitch = `${leadLabel} indexes high on ${primary} opportunity. Invite them to ${baseGuest.nextBestActions[0].offer} through ${baseGuest.nextBestActions[0].channel} outreach.`;
  const zhPitch = `${baseGuest.galaxyTier} 會員在 ${primary} 機會指數偏高，建議以${baseGuest.nextBestActions[0].channel}渠道邀請體驗：${baseGuest.nextBestActions[0].offer}。`;

  if (bannedCurrencyPattern.test(JSON.stringify({
    cde: baseGuest.cde,
    englishPitch,
    projectedUpsideBand,
    zhPitch,
  }))) {
    throw new Error('Guest data must remain CDE-safe');
  }

  return {
    ...baseGuest,
    leadScore,
    projectedUpsideBand,
    pitchScript: {
      en: englishPitch,
      zh: zhPitch,
    },
  };
}

export const guests: Guest[] = latestSegments.flatMap((segment, segmentIndex) => (
  Array.from({ length: 8 }, (_, index) => buildGuest(segment, index, segmentIndex * 8 + index))
));

export const topPriorityGuests = [...guests].sort((a, b) => b.leadScore - a.leadScore).slice(0, 12);

export function getGuestById(id: string) {
  return guests.find((guest) => guest.id === id);
}

export function getGuestsBySegmentId(segmentId: string) {
  return guests.filter((guest) => guest.segmentId === segmentId);
}
