import { clamp, jitter, mulberry32 } from '@/lib/rng';
import { CORE_CATEGORIES, latestSegments } from './generate';
import type {
  CoreCategory,
  GalaxyTier,
  Guest,
  GuestPreferredLanguage,
  GuestProfile,
  GuestPurchaseHistoryItem,
  GuestStayHistoryItem,
  NbaRec,
  Propensities,
  Segment,
} from './types';

export { CORE_CATEGORIES };

const properties = ['Ritz-Carlton', 'Banyan Tree', 'Capella', 'Hotel Okura', 'Galaxy Hotel'];
const tierOrder: GalaxyTier[] = ['Privilege', 'Gold', 'Platinum', 'Diamond'];
const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const givenNames = ['Avery', 'Blair', 'Casey', 'Dana', 'Elliot', 'Hayden', 'Jamie', 'Morgan'];
const zhNames = ['陳雅文', '李卓賢', '王凱琳', '何俊朗', '張曉晴', '林子謙', '黃嘉欣', '趙明軒'];
const originMarkets: GuestProfile['originMarket'][] = [
  'Hong Kong',
  'Guangdong',
  'Taiwan',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Japan',
  'Korea',
];
const languages: GuestPreferredLanguage[] = ['Cantonese', 'Mandarin', 'English', 'Japanese', 'Korean'];
const travelParties: GuestProfile['travelParty'][] = ['Solo', 'Couple', 'Family', 'Business party', 'Friends'];
const contactability: GuestProfile['contactability'][] = ['Host-led', 'Digital opt-in', 'Concierge-led', 'Rewards app'];
const hostTeams: GuestProfile['hostOwner'][] = ['Host Team A', 'Host Team B', 'Host Team C', 'Host Team D'];
const roomTypes: GuestStayHistoryItem['roomType'][] = ['Suite', 'Club room', 'Premium room', 'Family room', 'Business room'];
const satisfactionSignals: GuestStayHistoryItem['satisfactionSignal'][] = ['Positive', 'Neutral', 'Service recovery'];
const purchaseChannels: GuestPurchaseHistoryItem['channel'][] = ['Host', 'Concierge', 'Rewards app', 'On-property', 'Pre-arrival'];

const categoryPurchaseThemes: Record<CoreCategory, Array<{ merchantArea: string; itemLabel: string }>> = {
  hospitality: [
    { merchantArea: 'Hotel tower', itemLabel: 'Suite upgrade interest' },
    { merchantArea: 'Spa concierge', itemLabel: 'Wellness appointment' },
    { merchantArea: 'Club lounge', itemLabel: 'Premium arrival service' },
  ],
  fnb: [
    { merchantArea: 'Fine dining', itemLabel: 'Chef-led dinner' },
    { merchantArea: 'Private dining', itemLabel: 'Celebration table' },
    { merchantArea: 'Nightlife', itemLabel: 'Late-evening lounge visit' },
  ],
  entertainment: [
    { merchantArea: 'Galaxy Arena', itemLabel: 'Premium show access' },
    { merchantArea: 'Family attractions', itemLabel: 'Weekend attraction bundle' },
    { merchantArea: 'Event desk', itemLabel: 'Presale inquiry' },
  ],
  retailLuxury: [
    { merchantArea: 'Promenade', itemLabel: 'Private boutique appointment' },
    { merchantArea: 'Luxury retail', itemLabel: 'Watch and jewellery interest' },
    { merchantArea: 'Beauty retail', itemLabel: 'Curated gifting visit' },
  ],
};

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

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

function profileFor(segment: Segment, index: number, globalIndex: number): GuestProfile {
  const originMarket = pick(originMarkets, globalIndex + segment.name.length);
  const preferredLanguage = originMarket === 'Japan'
    ? 'Japanese'
    : originMarket === 'Korea'
      ? 'Korean'
      : originMarket === 'Taiwan' || originMarket === 'Guangdong'
        ? 'Mandarin'
        : originMarket === 'Hong Kong'
          ? 'Cantonese'
          : 'English';
  const languageIndex = languages.indexOf(preferredLanguage);

  return {
    displayName: `${pick(givenNames, globalIndex)} ${String.fromCharCode(65 + (globalIndex % 20))}.`,
    displayNameZh: pick(zhNames, globalIndex),
    syntheticName: true,
    ageBand: pick(['25-34', '35-44', '45-54', '55-64'] as const, index + segment.name.length),
    originMarket,
    preferredLanguage: pick(languages, languageIndex),
    travelParty: pick(travelParties, index + globalIndex),
    hostOwner: pick(hostTeams, globalIndex),
    contactability: pick(contactability, index + segment.opportunityIndex),
    consentStatus: index % 5 === 0 ? 'service-only' : 'marketable',
    homeProperty: pick(properties, index + globalIndex),
    membershipTenureBand: `${1 + (globalIndex % 4)}-${3 + (globalIndex % 5)} years`,
  };
}

function preferencesFor(segment: Segment, primary: CoreCategory, index: number) {
  const secondary = CORE_CATEGORIES.filter((category) => category !== primary)
    .sort((first, second) => (
      segment.categories[second].totalWalletIndex - segment.categories[first].totalWalletIndex
    ))[0];

  return {
    favoriteCategories: [
      categoryPurchaseThemes[primary][0].merchantArea,
      categoryPurchaseThemes[secondary][0].merchantArea,
      segment.signatureTrait,
    ],
    servicePreferences: [
      index % 2 === 0 ? 'Pre-arrival planning' : 'On-property host check-in',
      index % 3 === 0 ? 'Private appointment windows' : 'Rewards app reminders',
    ],
    occasionSignals: [
      index % 2 === 0 ? 'Weekend leisure' : 'Midweek stay',
      index % 3 === 0 ? 'Celebration planning' : 'Return visit prompt',
    ],
  };
}

function stayHistoryFor(profile: GuestProfile, index: number, globalIndex: number): GuestStayHistoryItem[] {
  return Array.from({ length: 3 }, (_, historyIndex) => ({
    id: `${stableDigits(globalIndex)}-stay-${historyIndex + 1}`,
    periodLabel: historyIndex === 0 ? 'Last 30 days' : historyIndex === 1 ? 'Last quarter' : 'Prior half-year',
    property: pick(properties, globalIndex + historyIndex),
    nightsBand: `${1 + ((index + historyIndex) % 3)}-${3 + ((globalIndex + historyIndex) % 4)} nights`,
    roomType: pick(roomTypes, globalIndex + historyIndex),
    occasion: historyIndex === 0 ? profile.travelParty : pick(['Celebration', 'Business trip', 'Short break', 'Family leisure'], index + historyIndex),
    satisfactionSignal: pick(satisfactionSignals, globalIndex + historyIndex),
  }));
}

function purchaseHistoryFor(primary: CoreCategory, index: number, globalIndex: number): GuestPurchaseHistoryItem[] {
  const orderedCategories = [
    primary,
    ...CORE_CATEGORIES.filter((category) => category !== primary),
  ];

  return Array.from({ length: 5 }, (_, historyIndex) => {
    const category = orderedCategories[historyIndex % orderedCategories.length];
    const theme = pick(categoryPurchaseThemes[category], index + historyIndex);

    return {
      id: `${stableDigits(globalIndex)}-purchase-${historyIndex + 1}`,
      periodLabel: historyIndex === 0 ? 'Most recent' : historyIndex === 1 ? 'Last 60 days' : historyIndex === 2 ? 'Last quarter' : historyIndex === 3 ? 'Prior quarter' : 'Earlier signal',
      category,
      merchantArea: theme.merchantArea,
      itemLabel: theme.itemLabel,
      channel: pick(purchaseChannels, globalIndex + historyIndex),
      ticketBand: historyIndex === 0 && primary === 'retailLuxury' ? 'ultra' : historyIndex < 3 ? 'premium' : 'entry',
      galaxyOwned: true,
    };
  });
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
  const profile = profileFor(segment, index, globalIndex);
  const preferences = preferencesFor(segment, primary, index);
  const stayHistory = stayHistoryFor(profile, index, globalIndex);
  const purchaseHistory = purchaseHistoryFor(primary, index, globalIndex);
  const primaryPropertyIndex = (index + globalIndex) % properties.length;
  const secondaryPropertyIndex = (primaryPropertyIndex + 1 + (index % (properties.length - 1))) % properties.length;
  const baseGuest: Omit<Guest, 'leadScore'> = {
    id: `MEM-••••${stableDigits(globalIndex)}`,
    segmentId: segment.id,
    persona: segment.name,
    galaxyTier: tierFor(segment, index),
    profile,
    preferences,
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
    stayHistory,
    purchaseHistory,
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
    profile: baseGuest.profile,
    preferences: baseGuest.preferences,
    purchaseHistory: baseGuest.purchaseHistory,
    stayHistory: baseGuest.stayHistory,
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
