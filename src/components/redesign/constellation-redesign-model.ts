export type RedesignPageId =
  | 'overview'
  | 'journey'
  | 'wallet'
  | 'segments'
  | 'guests'
  | 'leakage'
  | 'propensity'
  | 'activation'
  | 'simulate'
  | 'measurement'
  | 'marketscan'
  | 'governance';

export type RedesignCategory = 'Hospitality' | 'Dining' | 'Entertainment' | 'Retail/Luxury';

interface RawRedesignSegment {
  id: string;
  name: string;
  short: string;
  idx: number;
  leak: number;
  cat: RedesignCategory;
  wallet: string;
  prop: string;
  matched: string;
  mobile: boolean;
  move: string;
  desc: string;
  offer: string;
  x: number;
  y: number;
  cats: Array<{ name: RedesignCategory; v: number }>;
}

export interface RedesignSegment {
  id: string;
  name: string;
  short: string;
  idx: number;
  leak: number;
  cat: RedesignCategory;
  wallet: string;
  propensityBand: string;
  matched: string;
  mobile: boolean;
  move: string;
  desc: string;
  offer: string;
  x: number;
  y: number;
  cats: Array<{ name: RedesignCategory; v: number }>;
}

export interface RedesignQuarterData {
  headroom: number;
  matched: string;
  capture: number;
  coverage: number;
  shift: number;
}

export interface RedesignBuildInput {
  pageId: RedesignPageId;
  quarterLabel: string;
  selectedSegmentId: string;
  channels: Record<string, boolean>;
  windowWeeks: number;
  reachPct: number;
  depthPct: number;
  exported: boolean;
}

export interface RedesignNavItem {
  section: string | null;
  label: string;
  num: string;
  pageId: RedesignPageId;
  href: string;
}

export interface DeltaModel {
  delta: string;
  deltaColor: string;
}

export const redesignNavItems: RedesignNavItem[] = [
  { section: 'Plan', label: 'Overview', num: '01', pageId: 'overview', href: '/' },
  { section: null, label: 'Journey', num: '02', pageId: 'journey', href: '/journey' },
  { section: null, label: 'Wallet', num: '03', pageId: 'wallet', href: '/wallet' },
  { section: 'Audience', label: 'Segments', num: '04', pageId: 'segments', href: '/segments' },
  { section: null, label: 'Guests', num: '05', pageId: 'guests', href: '/guests' },
  { section: null, label: 'Leakage', num: '06', pageId: 'leakage', href: '/leakage' },
  { section: null, label: 'Propensity', num: '07', pageId: 'propensity', href: '/propensity' },
  { section: 'Act', label: 'Activation', num: '08', pageId: 'activation', href: '/activation' },
  { section: null, label: 'Simulator', num: '09', pageId: 'simulate', href: '/simulate' },
  { section: 'Measure', label: 'Measurement', num: '10', pageId: 'measurement', href: '/measurement' },
  { section: null, label: 'Market Scan', num: '11', pageId: 'marketscan', href: '/marketscan' },
  { section: 'Govern', label: 'Governance', num: '12', pageId: 'governance', href: '/governance' },
];

const rawRedesignSegments: RawRedesignSegment[] = [
  {
    id: 'cc',
    name: 'Cosmopolitan Connoisseurs',
    short: 'Connoisseurs',
    idx: 118,
    leak: 55,
    cat: 'Retail/Luxury',
    wallet: '14-22k',
    prop: '0.86',
    matched: '16-26k',
    mobile: true,
    move: 'Michelin-to-boutique retail path',
    desc: 'Food, retail and boutique-stay guests comparing Macau luxury districts. Highest finite opportunity signal this quarter.',
    offer: 'Reservation-linked boutique retail benefit',
    x: 70,
    y: 28,
    cats: [
      { name: 'Retail/Luxury', v: 55 },
      { name: 'Dining', v: 38 },
      { name: 'Hospitality', v: 31 },
      { name: 'Entertainment', v: 24 },
    ],
  },
  {
    id: 'pm',
    name: 'Premium Mass Weekenders',
    short: 'Weekenders',
    idx: 102,
    leak: 48,
    cat: 'Dining',
    wallet: '8-14k',
    prop: '0.74',
    matched: '28-41k',
    mobile: true,
    move: 'Weekend dining ladder to show tickets',
    desc: 'High-frequency weekend visitors who dine on property but book entertainment and late dining off-resort.',
    offer: 'Progressive dining credit unlocking show tickets',
    x: 28,
    y: 26,
    cats: [
      { name: 'Dining', v: 48 },
      { name: 'Entertainment', v: 40 },
      { name: 'Retail/Luxury', v: 29 },
      { name: 'Hospitality', v: 22 },
    ],
  },
  {
    id: 'fr',
    name: 'Family Resort Loyalists',
    short: 'Families',
    idx: 98,
    leak: 41,
    cat: 'Entertainment',
    wallet: '6-10k',
    prop: '0.68',
    matched: '34-52k',
    mobile: false,
    move: 'Waterpark bundle with retail credit',
    desc: 'Repeat family stays with strong hospitality capture but modelled entertainment spend leaking to Cotai neighbours.',
    offer: 'Family entertainment bundle with retail credit',
    x: 78,
    y: 64,
    cats: [
      { name: 'Entertainment', v: 41 },
      { name: 'Dining', v: 33 },
      { name: 'Retail/Luxury', v: 27 },
      { name: 'Hospitality', v: 18 },
    ],
  },
  {
    id: 'rg',
    name: 'Regional Gaming Regulars',
    short: 'Regulars',
    idx: 98,
    leak: 38,
    cat: 'Hospitality',
    wallet: '9-15k',
    prop: '0.71',
    matched: '41-63k',
    mobile: false,
    move: 'Midweek stay upgrade via rewards tier',
    desc: 'Frequent regional visitors splitting midweek stays across competing Cotai properties.',
    offer: 'Rewards-tier midweek suite upgrade',
    x: 22,
    y: 60,
    cats: [
      { name: 'Hospitality', v: 38 },
      { name: 'Dining', v: 34 },
      { name: 'Entertainment', v: 26 },
      { name: 'Retail/Luxury', v: 21 },
    ],
  },
  {
    id: 'mb',
    name: 'MICE & Business Blend',
    short: 'MICE',
    idx: 96,
    leak: 44,
    cat: 'Dining',
    wallet: '7-12k',
    prop: '0.63',
    matched: '12-19k',
    mobile: true,
    move: 'Delegate dining pass with spa cross-sell',
    desc: 'Conference and business guests whose evening dining and wellness wallet flows off property.',
    offer: 'Delegate dining pass with spa cross-sell',
    x: 58,
    y: 80,
    cats: [
      { name: 'Dining', v: 44 },
      { name: 'Hospitality', v: 30 },
      { name: 'Retail/Luxury', v: 26 },
      { name: 'Entertainment', v: 19 },
    ],
  },
  {
    id: 'ts',
    name: 'Transit Samplers',
    short: 'Samplers',
    idx: 88,
    leak: 33,
    cat: 'Retail/Luxury',
    wallet: '3-6k',
    prop: '0.52',
    matched: '55-80k',
    mobile: true,
    move: 'Same-day retail voucher at ferry arrival',
    desc: 'Day visitors sampling the property between ferry connections; broad reach, lower per-guest wallet.',
    offer: 'Same-day arrival retail voucher',
    x: 40,
    y: 45,
    cats: [
      { name: 'Retail/Luxury', v: 33 },
      { name: 'Dining', v: 28 },
      { name: 'Entertainment', v: 17 },
      { name: 'Hospitality', v: 12 },
    ],
  },
];

export const redesignQuarterData = {
  '2025 Q3': { headroom: 49, matched: '138-204k', capture: 49, coverage: 58, shift: -6 },
  '2025 Q4': { headroom: 50, matched: '142-210k', capture: 50, coverage: 60, shift: -4 },
  '2026 Q1': { headroom: 51, matched: '146-216k', capture: 51, coverage: 61, shift: -2 },
  '2026 Q2': { headroom: 53, matched: '150-222k', capture: 52, coverage: 63, shift: 0 },
} satisfies Record<string, RedesignQuarterData>;

export type RedesignQuarterLabel = keyof typeof redesignQuarterData;

export type RedesignModelSegment = RedesignSegment;

export interface ConstellationRedesignModel {
  pageId: RedesignPageId;
  screenLabel: string;
  pageTitle: string;
  quarter: RedesignQuarterData & { label: RedesignQuarterLabel };
  quarterKeys: RedesignQuarterLabel[];
  previousQuarterLabel: RedesignQuarterLabel | null;
  navItems: Array<RedesignNavItem & { active: boolean; headerDisplay: 'block' | 'none' }>;
  quarterPills: Array<{ label: RedesignQuarterLabel; selected: boolean; color: string }>;
  selectedSegment: RedesignModelSegment;
  topSegment: RedesignModelSegment;
  kpis: Array<DeltaModel & { label: string; value: string; sub: string }>;
  constellationNodes: Array<{
    id: string;
    idx: number;
    leak: number;
    mobile: boolean;
    name: string;
    shortName: string;
    x: number;
    y: number;
    size: number;
    fontSize: number;
    orbit: number;
    selected: boolean;
    isSelected: boolean;
    pulse: number;
    border: string;
    color: string;
    labelColor: string;
  }>;
  legend: Array<{ band: string; label: string; sub: string; color: string }>;
  selectedStats: Array<{ label: string; value: string }>;
  segmentRows: Array<{
    rank: string;
    id: string;
    name: string;
    matched: string;
    propensityBand: string;
    idx: number;
    idxColor: string;
    leak: number;
    cat: RedesignCategory;
    wallet: string;
    selected: boolean;
  }>;
  categoryBase: Record<RedesignCategory, number>;
  leakageCategories: Array<{ name: RedesignCategory; v: number; sub: string }>;
  matrixRows: Array<{
    id: string;
    name: string;
    selected: boolean;
    cells: Array<{ category: RedesignCategory; v: number; hot: boolean; bg: string; color: string }>;
  }>;
  audiencePicks: Array<{ id: string; name: string; idx: number; idxColor: string; selected: boolean }>;
  channels: Array<{ label: string; name: string; enabled: boolean; color: string }>;
  activeChannels: string[];
  windows: Array<{ label: string; weeks: number; selected: boolean; color: string }>;
  windowWeeks: number;
  windowNote: string;
  briefFacts: Array<{ label: string; value: string }>;
  briefCopy: string;
  aiAnswers: Record<'explain' | 'trust' | 'brief', string>;
  aiChips: Array<{ key: 'explain' | 'trust' | 'brief'; label: string }>;
  aiAnswer: string;
  segmentChips: Array<{ id: string; label: string; selected: boolean }>;
  journeyStages: Array<{
    num: string;
    name: string;
    cap: number;
    note: string;
    weakDisplay: 'inline-flex' | 'none';
    isWeak: boolean;
  }>;
  weakName: string;
  weakCap: number;
  walletSplit: Array<{ name: RedesignCategory; off: number; on: number }>;
  walletTrend: Array<{ q: RedesignQuarterLabel; band: string; h: number; selected: boolean; qColor: string }>;
  walletCards: Array<{ label: string; value: string; sub: string }>;
  funnel: Array<{ name: string; band: string; widthPct: number; note: string }>;
  guestRows: Array<{
    id: string;
    name: string;
    matched: string;
    cov: string;
    quality: string;
    qColor: string;
    reach: string;
    mColor: string;
    selected: boolean;
  }>;
  propensityRows: Array<{
    id: string;
    name: string;
    propensityBand: string;
    reach: string;
    mColor: string;
    selected: boolean;
  }>;
  selectedPropensityBand: string;
  selectedChannelRecommendation: string;
  readouts: Array<{
    name: string;
    aud: string;
    window: string;
    lift: string;
    liftColor: string;
    status: string;
    sColor: string;
    sBorder: string;
    note: string;
  }>;
  measureCounts: Array<{ v: string; label: string; sub: string; color: string }>;
  reach: number;
  depth: number;
  simulation: {
    liftBand: string;
    recaptureBand: string;
    liftLo: number;
    liftHi: number;
    recLo: number;
    recHi: number;
    reachPct: number;
    depthPct: number;
    windowLabel: string;
    simNote: string;
  };
  demand: Array<{ name: RedesignCategory; v: number; sub: string; color: string; label: string; deltaColor: string }>;
  corridors: Array<{ name: string; band: string; sharePct: number; note: string }>;
  rules: Array<{ t: string; d: string }>;
  refreshLog: Array<{ q: RedesignQuarterLabel; date: string; cov: string; status: string; sColor: string; sBorder: string }>;
  exportLabel: string;
  exportBg: string;
  exportColor: string;
}

const REDESIGN_QUARTER_KEYS = Object.keys(redesignQuarterData) as RedesignQuarterLabel[];
const ACCENT = '#D4AF5E';
const CATEGORY_ORDER: RedesignCategory[] = ['Hospitality', 'Dining', 'Entertainment', 'Retail/Luxury'];
const CHANNEL_ORDER = ['App push', 'CRM email', 'Paid social', 'Concierge / VIP host'];
const WINDOW_OPTIONS = [4, 6, 8];

const catBase: Record<RedesignCategory, number> = {
  Hospitality: 50,
  Dining: 53,
  Entertainment: 52,
  'Retail/Luxury': 57,
};

const pageTitles: Record<RedesignPageId, string> = {
  overview: 'Wallet intelligence cockpit',
  journey: 'Segment journey',
  wallet: 'Wallet intelligence',
  segments: 'Segment rankings',
  guests: 'Matched guest universe',
  leakage: 'Leakage control tower',
  propensity: 'Propensity ladder',
  activation: 'Activation planning',
  simulate: 'Scenario simulator',
  measurement: 'Campaign measurement',
  marketscan: 'Market context',
  governance: 'Governance & CDE rules',
};

const screenLabels: Record<RedesignPageId, string> = {
  overview: 'Overview',
  journey: 'Journey',
  wallet: 'Wallet',
  segments: 'Segments',
  guests: 'Guests',
  leakage: 'Leakage',
  propensity: 'Propensity',
  activation: 'Activation',
  simulate: 'Simulator',
  measurement: 'Measurement',
  marketscan: 'Market Scan',
  governance: 'Governance',
};

function isQuarterLabel(value: string): value is RedesignQuarterLabel {
  return Object.prototype.hasOwnProperty.call(redesignQuarterData, value);
}

function finiteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function selectedWindow(value: number): number {
  const safeValue = finiteNumber(value, 6);
  return WINDOW_OPTIONS.includes(safeValue) ? safeValue : 6;
}

function selectedQuarterLabel(label: string): RedesignQuarterLabel {
  return isQuarterLabel(label) ? label : '2026 Q2';
}

function idxColor(idx: number): string {
  if (idx >= 130) return '#F0C36A';
  if (idx >= 110) return ACCENT;
  if (idx >= 90) return '#B5AFC0';
  return '#7A7488';
}

function delta(cur: number, previous: number | null | undefined, suffix = ''): DeltaModel {
  if (previous == null) return { delta: 'baseline', deltaColor: '#6A6478' };
  const diff = cur - previous;

  if (diff > 0) return { delta: `up +${diff}${suffix}`, deltaColor: '#6FBF8F' };
  if (diff < 0) return { delta: `down ${diff}${suffix}`, deltaColor: '#C96A5A' };
  return { delta: 'flat', deltaColor: '#6A6478' };
}

function shiftedSegments(shift: number): RawRedesignSegment[] {
  return rawRedesignSegments.map((segment) => ({
    ...segment,
    idx: segment.idx + shift,
    cats: segment.cats.map((category) => ({ ...category })),
  }));
}

function parseBand(wallet: string): [number, number] {
  const match = wallet.match(/(\d+)-(\d+)k/);
  if (!match) return [8, 14];

  const low = Number.parseInt(match[1], 10);
  const high = Number.parseInt(match[2], 10);
  return [finiteNumber(low, 8), finiteNumber(high, 14)];
}

function shiftedWalletBand(wallet: string, quarterShift: number, anchorShift: number): string {
  const [low, high] = parseBand(wallet);
  const shiftOffset = Math.round((quarterShift - anchorShift) / 2);
  const shiftedLow = Math.max(0, low + shiftOffset);
  const shiftedHigh = Math.max(shiftedLow, high + shiftOffset);

  return `${shiftedLow}-${shiftedHigh}k`;
}

function walletTrendHeight(segment: RawRedesignSegment, quarter: RedesignQuarterData): number {
  const height = Math.round(48 + (segment.idx - 88) * 1.2 + (quarter.headroom - 49) * 2);

  return Math.max(44, Math.min(96, height));
}

function decileOf(value: number): string {
  if (value >= 0.8) return 'Top demi-decile';
  if (value >= 0.7) return 'Demi-deciles 2-3';
  if (value >= 0.6) return 'Demi-deciles 3-4';
  return 'Demi-deciles 5+';
}

function toPublicSegment(segment: RawRedesignSegment): RedesignSegment {
  const { prop, ...displaySegment } = segment;
  const propensityScore = finiteNumber(Number.parseFloat(prop), 0);

  return {
    ...displaySegment,
    cats: segment.cats.map((category) => ({ ...category })),
    propensityBand: decileOf(propensityScore),
  };
}

export const redesignSegments: RedesignSegment[] = rawRedesignSegments.map(toPublicSegment);

function toModelSegment(segment: RawRedesignSegment): RedesignModelSegment {
  return toPublicSegment(segment);
}

function selectedChannels(channels: Record<string, boolean>): string[] {
  return CHANNEL_ORDER.filter((channel) => channels[channel]);
}

export function buildConstellationRedesignModel(input: RedesignBuildInput): ConstellationRedesignModel {
  const quarterLabel = selectedQuarterLabel(input.quarterLabel);
  const qd = redesignQuarterData[quarterLabel];
  const qi = REDESIGN_QUARTER_KEYS.indexOf(quarterLabel);
  const prevLabel = qi > 0 ? REDESIGN_QUARTER_KEYS[qi - 1] : null;
  const prev = prevLabel ? redesignQuarterData[prevLabel] : null;
  const segs = shiftedSegments(qd.shift);
  const selectedSegment = segs.find((segment) => segment.id === input.selectedSegmentId) ?? segs[0];
  const selectedSegmentId = selectedSegment.id;
  const topSegment = segs[0];
  const pageId = input.pageId;
  const reachPct = Math.max(0, Math.min(100, Math.round(finiteNumber(input.reachPct, 40))));
  const depthPct = Math.max(0, Math.min(100, Math.round(finiteNumber(input.depthPct, 15))));
  const windowWeeks = selectedWindow(input.windowWeeks);
  const activeChannels = selectedChannels(input.channels);
  const [walletLow, walletHigh] = parseBand(selectedSegment.wallet);

  const previousTopIndex = prev ? topSegment.idx - (qd.shift - prev.shift) : null;
  const kpis = [
    {
      label: 'Wallet headroom',
      value: `${qd.headroom}%`,
      ...delta(qd.headroom, prev?.headroom, 'pp'),
      sub: 'Avg addressable leakage across hospitality, dining, entertainment and retail/luxury.',
    },
    {
      label: 'Matched guest band',
      value: qd.matched,
      ...delta(qd.coverage, prev?.coverage, 'pp cov.'),
      sub: `${qd.coverage}% matched coverage; 7 active CDE metrics. Governed cohort range.`,
    },
    {
      label: 'Galaxy wallet capture',
      value: `${qd.capture}%`,
      ...delta(qd.capture, prev?.capture, 'pp'),
      sub: 'Average hospitality capture across current-quarter segments.',
    },
    {
      label: 'Top opportunity index',
      value: String(topSegment.idx),
      ...delta(topSegment.idx, previousTopIndex),
      sub: `${topSegment.name} carries the strongest recapture signal this view.`,
    },
  ];

  const constellationNodes = segs.map((segment) => {
    const selected = segment.id === selectedSegmentId;
    const size = Math.round(36 + (segment.idx - (88 + qd.shift)) * 1.15);

    return {
      id: segment.id,
      idx: segment.idx,
      leak: segment.leak,
      mobile: segment.mobile,
      name: segment.name,
      shortName: segment.short,
      x: segment.x,
      y: segment.y,
      size,
      fontSize: Math.round(size * 0.34),
      orbit: Math.round(segment.leak * 2.9),
      selected,
      isSelected: selected,
      pulse: size + 18,
      border: selected ? ACCENT : segment.mobile ? '#6FBF8F' : '#8B8598',
      color: selected ? '#14101F' : '#EAD9A9',
      labelColor: selected ? '#EAD9A9' : '#7A7488',
    };
  });

  const selectedStats = [
    { label: 'Opportunity', value: `Index ${selectedSegment.idx}` },
    { label: 'Top leakage', value: `${selectedSegment.leak}% ${selectedSegment.cat}` },
    { label: 'Wallet band', value: `${selectedSegment.wallet} /mo` },
    { label: 'Matched guests', value: selectedSegment.matched },
  ];

  const segmentRows = segs.map((segment, index) => {
    const propensityScore = finiteNumber(Number.parseFloat(segment.prop), 0);

    return {
      rank: `0${index + 1}`,
      id: segment.id,
      name: segment.name,
      matched: segment.matched,
      propensityBand: decileOf(propensityScore),
      idx: segment.idx,
      idxColor: idxColor(segment.idx),
      leak: segment.leak,
      cat: segment.cat,
      wallet: segment.wallet,
      selected: segment.id === selectedSegmentId,
    };
  });

  const legend = [
    { band: '<90', label: 'Low signal', sub: 'Below matched-cohort baseline', color: '#7A7488' },
    { band: '90-109', label: 'Near baseline', sub: 'Close to cohort average', color: '#B5AFC0' },
    { band: '110-129', label: 'Elevated opportunity', sub: 'Above cohort baseline', color: ACCENT },
    { band: '130+', label: 'High priority', sub: 'Strongest action signal', color: '#F0C36A' },
  ];

  const leakCats = CATEGORY_ORDER.map((category) => ({
    name: category,
    v: catBase[category],
    sub:
      category === 'Retail/Luxury'
        ? `Widest recapture lane led by ${topSegment.short}.`
        : category === 'Dining'
          ? 'Best converted via reservation-linked offers.'
          : category === 'Entertainment'
            ? 'Family cohorts drive most of this gap.'
            : 'Strongest existing capture; defend without discounting.',
  }));

  const matrixRows = segs.map((segment) => ({
    id: segment.id,
    name: segment.name,
    selected: segment.id === selectedSegmentId,
    cells: CATEGORY_ORDER.map((category) => {
      const v = segment.cats.find((cat) => cat.name === category)?.v ?? 0;
      const hot = v >= 45;

      return {
        category,
        v,
        hot,
        bg: `rgba(212,175,94,${((v / 100) * 0.5).toFixed(2)})`,
        color: hot ? '#14101F' : '#EAD9A9',
      };
    }),
  }));

  const audiencePicks = segs.slice(0, 3).map((segment) => ({
    id: segment.id,
    name: segment.name,
    idx: segment.idx,
    idxColor: idxColor(segment.idx),
    selected: segment.id === selectedSegmentId,
  }));

  const channelStates = CHANNEL_ORDER.map((channel) => {
    const on = Boolean(input.channels[channel]);

    return {
      label: on ? `[x] ${channel}` : channel,
      name: channel,
      enabled: on,
      color: on ? '#EAD9A9' : '#8B8598',
    };
  });

  const windows = WINDOW_OPTIONS.map((weeks) => ({
    label: `${weeks} weeks`,
    weeks,
    selected: weeks === windowWeeks,
    color: weeks === windowWeeks ? '#EAD9A9' : '#8B8598',
  }));

  const windowNote =
    windowWeeks === 4
      ? 'A 4-week window fits arrival-triggered offers.'
      : windowWeeks === 6
        ? 'A 6-week window balances read speed with cohort stability.'
        : 'An 8-week window suits stay-cycle offers with slower repeat rates.';

  const channelSummary = activeChannels.length ? activeChannels.join(' and ') : 'selected channels';
  const selectedPropensityScore = finiteNumber(Number.parseFloat(selectedSegment.prop), 0);
  const selectedPropensityBand = decileOf(selectedPropensityScore);
  const briefFacts = [
    { label: 'Audience', value: selectedSegment.name },
    { label: 'Cohort band', value: `${selectedSegment.matched} matched guests` },
    { label: 'Offer', value: selectedSegment.offer },
    { label: 'Channels', value: activeChannels.length ? activeChannels.join(' / ') : 'Select at least one channel' },
    { label: 'Window', value: `${windowWeeks} weeks vs matched holdout` },
    { label: 'Proof', value: `Index ${selectedSegment.idx} / ${selectedSegment.leak}% ${selectedSegment.cat} leakage` },
  ];
  const briefCopy =
    `Target the ${selectedSegment.matched} matched ${selectedSegment.name} cohort with a ` +
    `${selectedSegment.offer.toLowerCase()}, delivered via ${channelSummary}. Success is a capture-index lift vs ` +
    `holdout over ${windowWeeks} weeks, reported as banded ranges and indices only. Modelled wallet band: ` +
    `${selectedSegment.wallet} /mo; propensity band ${selectedPropensityBand}.`;

  const aiAnswers = {
    explain:
      `The ${quarterLabel} ranking leads with ${selectedSegment.name}: opportunity index ${selectedSegment.idx} ` +
      `vs the matched-cohort baseline of 100, ${selectedSegment.leak}% ${selectedSegment.cat} leakage, ` +
      `${selectedPropensityBand.toLowerCase()} propensity and a ${selectedSegment.wallet} /mo wallet band. Ring width shows ` +
      'leakage; point size shows the index.',
    trust:
      `Figures come from the matched Galaxy and Mastercard CDE cohort (${qd.coverage}% coverage and demi-decile ` +
      'metric bands), refreshed quarterly. Every readout is expressed as indices, ranges and percentages.',
    brief:
      `Draft brief for ${selectedSegment.name}: ${selectedSegment.offer.toLowerCase()} to the ${selectedSegment.matched} ` +
      `matched cohort via ${activeChannels.join(' and ') || 'CRM'}, measured as capture-index lift vs holdout in ` +
      `the selected window. Proof points: index ${selectedSegment.idx}, ${selectedSegment.leak}% ${selectedSegment.cat} ` +
      'leakage. Validate against the next CDE refresh before scaling.',
  };

  const aiChips: ConstellationRedesignModel['aiChips'] = [
    { key: 'explain', label: 'Explain the ranking' },
    { key: 'trust', label: 'Why trust it?' },
    { key: 'brief', label: 'Build a brief' },
  ];

  const segmentChips = rawRedesignSegments.map((segment) => ({
    id: segment.id,
    label: segment.short,
    selected: segment.id === selectedSegmentId,
  }));

  const pv = selectedPropensityScore;
  const hospLeak = selectedSegment.cats.find((category) => category.name === 'Hospitality')?.v ?? 20;
  const stagesRaw = [
    { num: '01', name: 'Discover & Book', cap: Math.round(50 + pv * 20), note: 'Direct booking vs OTA and pre-trip travel retail.' },
    { num: '02', name: 'Arrival Day', cap: Math.round(58 + pv * 16), note: 'Ferry, airport and transfer spend window.' },
    { num: '03', name: 'On-Property Stay', cap: 100 - hospLeak, note: 'Room, dining and rewards-linked spend.' },
    { num: '04', name: 'Evening & Excursion', cap: 100 - selectedSegment.leak, note: `Off-property ${selectedSegment.cat} pull is strongest here.` },
    { num: '05', name: 'Post-Stay Rebook', cap: Math.round(pv * 62), note: 'Rebook and advocacy window before the signal decays.' },
  ];
  const minCap = Math.min(...stagesRaw.map((stage) => stage.cap));
  const journeyStages = stagesRaw.map((stage) => ({
    ...stage,
    weakDisplay: stage.cap === minCap ? 'inline-flex' as const : 'none' as const,
    isWeak: stage.cap === minCap,
  }));
  const weakStage = stagesRaw.find((stage) => stage.cap === minCap) ?? stagesRaw[0];

  const walletSplit = selectedSegment.cats.map((category) => ({
    name: category.name,
    off: category.v,
    on: 100 - category.v,
  }));
  const walletTrend = REDESIGN_QUARTER_KEYS.map((key) => {
    const trendQuarter = redesignQuarterData[key];
    const trendSegments = shiftedSegments(trendQuarter.shift);
    const trendSegment = trendSegments.find((segment) => segment.id === selectedSegmentId) ?? trendSegments[0];

    return {
      q: key,
      band: shiftedWalletBand(trendSegment.wallet, trendQuarter.shift, qd.shift),
      h: walletTrendHeight(trendSegment, trendQuarter),
      selected: key === quarterLabel,
      qColor: key === quarterLabel ? '#EAD9A9' : '#6A6478',
    };
  });
  const onAvg = Math.round(walletSplit.reduce((total, item) => total + item.on, 0) / walletSplit.length);
  const walletCards = [
    { label: 'Addressable wallet band', value: `${selectedSegment.wallet} /mo`, sub: `Modelled band across the ${selectedSegment.matched} matched cohort.` },
    { label: 'Average on-property share', value: `${onAvg}%`, sub: 'Weighted across hospitality, dining, entertainment and retail/luxury.' },
    { label: 'Widest category gap', value: `${selectedSegment.leak}% ${selectedSegment.cat}`, sub: `The first lane the ${selectedSegment.short} recapture play should target.` },
  ];

  const funnel = [
    { name: 'Active resort guests', band: '380-520k', widthPct: 100, note: 'Rolling 12-month stay, dining or rewards activity.' },
    { name: 'Card-active matched universe', band: '240-330k', widthPct: 64, note: 'Guests with modelled card activity inside the CDE window.' },
    { name: 'CDE matched cohorts', band: qd.matched, widthPct: 43, note: `${qd.coverage}% matched coverage; 7 active CDE metrics.` },
    { name: 'Activation-ready', band: '96-140k', widthPct: 27, note: 'Consented, channel-reachable, above governed cohort minimums.' },
  ];
  const coverageOffsets: Record<string, number> = { cc: 3, pm: 1, fr: -2, rg: -1, mb: 2, ts: -4 };
  const guestRows = segs.map((segment) => ({
    id: segment.id,
    name: segment.name,
    matched: segment.matched,
    cov: `${qd.coverage + (coverageOffsets[segment.id] ?? 0)}%`,
    quality: Number.parseFloat(segment.prop) >= 0.7 ? 'High' : 'Medium',
    qColor: Number.parseFloat(segment.prop) >= 0.7 ? '#6FBF8F' : '#B5AFC0',
    reach: segment.mobile ? 'Mobile-ready' : 'CRM / desk',
    mColor: segment.mobile ? '#6FBF8F' : '#8B8598',
    selected: segment.id === selectedSegmentId,
  }));

  const propensityRows = [...segs]
    .sort((first, second) => Number.parseFloat(second.prop) - Number.parseFloat(first.prop))
    .map((segment) => {
      const propensityScore = finiteNumber(Number.parseFloat(segment.prop), 0);

      return {
        id: segment.id,
        name: segment.name,
        propensityBand: decileOf(propensityScore),
        reach: segment.mobile ? 'Mobile-ready' : 'CRM / desk',
        mColor: segment.mobile ? '#6FBF8F' : '#8B8598',
        selected: segment.id === selectedSegmentId,
      };
    });
  const selectedChannelRecommendation = selectedSegment.mobile
    ? 'App push first, CRM email as reinforcement; this cohort is mobile-ready with strong in-stay engagement.'
    : 'CRM email first with concierge follow-up; this cohort under-indexes on app engagement.';

  const readouts = [
    {
      name: 'Michelin retail cross-sell pilot',
      aud: 'Cosmopolitan Connoisseurs',
      window: '6 wks',
      lift: '+9 idx',
      liftColor: '#6FBF8F',
      status: 'READ COMPLETE',
      sColor: '#6FBF8F',
      sBorder: 'rgba(111,191,143,0.4)',
      note: 'Lift confirmed above the holdout band; scale candidate.',
    },
    {
      name: 'Weekend dining ladder',
      aud: 'Premium Mass Weekenders',
      window: '6 wks',
      lift: '+4 idx',
      liftColor: '#6FBF8F',
      status: 'READ COMPLETE',
      sColor: '#6FBF8F',
      sBorder: 'rgba(111,191,143,0.4)',
      note: 'Within band; retest with revised offer depth.',
    },
    {
      name: 'Ferry arrival retail voucher',
      aud: 'Transit Samplers',
      window: '4 wks',
      lift: 'pending',
      liftColor: '#EAD9A9',
      status: 'IN FLIGHT',
      sColor: '#EAD9A9',
      sBorder: 'rgba(212,175,94,0.4)',
      note: 'Read lands at the next CDE refresh.',
    },
    {
      name: 'Midweek suite upgrade',
      aud: 'Regional Gaming Regulars',
      window: '8 wks',
      lift: 'pending',
      liftColor: '#8B8598',
      status: 'QUEUED',
      sColor: '#8B8598',
      sBorder: 'rgba(139,133,152,0.4)',
      note: 'Launches after governance sign-off.',
    },
  ];
  const measureCounts = [
    { v: '2', label: 'Reads complete', sub: 'Both above or within the holdout band', color: '#6FBF8F' },
    { v: '1', label: 'In flight', sub: 'Read lands at next refresh', color: '#EAD9A9' },
    { v: '1', label: 'Queued', sub: 'Awaiting governance sign-off', color: '#8B8598' },
  ];

  const liftLo = Math.max(1, Math.round(selectedSegment.leak * (reachPct / 100) * (depthPct / 100) * 1.6));
  const liftHi = liftLo + Math.max(2, Math.round(liftLo * 0.7));
  const recLo = Math.max(1, Math.round(walletLow * (reachPct / 100) * (depthPct / 100) * 4));
  const recHi = Math.max(recLo + 1, Math.round(walletHigh * (reachPct / 100) * (depthPct / 100) * 6));
  const simNote =
    depthPct >= 22
      ? 'Deep offers move the band fastest but risk margin; pilot in one channel before scaling.'
      : reachPct >= 70
        ? 'Broad reach dilutes per-guest impact; consider narrowing to top propensity demi-deciles.'
        : 'Balanced scenario. Narrow reach to top demi-deciles or deepen the offer to widen the projected band.';
  const simulation = {
    liftBand: `+${liftLo} to +${liftHi}`,
    recaptureBand: `${recLo}-${recHi}k equiv./mo`,
    liftLo,
    liftHi,
    recLo,
    recHi,
    reachPct,
    depthPct,
    windowLabel: `${windowWeeks} weeks`,
    simNote,
  };

  const demandDefs = [
    { name: 'Hospitality' as const, base: 104, sub: 'Stay demand near market pace.' },
    { name: 'Dining' as const, base: 112, sub: 'Broad demand across corridors.' },
    { name: 'Entertainment' as const, base: 97, sub: 'Slightly below market baseline.' },
    { name: 'Retail/Luxury' as const, base: 121, sub: 'Highest demand vs baseline; matches the top-ranked gap.' },
  ];
  const demand = demandDefs.map((item) => {
    const v = item.base;

    return {
      name: item.name,
      v,
      sub: item.sub,
      color: v >= 110 ? ACCENT : v >= 100 ? '#B5AFC0' : '#7A7488',
      label: `${v >= 100 ? '+' : '-'}${Math.abs(v - 100)} vs market`,
      deltaColor: v >= 100 ? '#6FBF8F' : '#C96A5A',
    };
  });
  const corridors = [
    { name: 'Greater Bay Area', band: '38-46%', sharePct: 42, note: 'Volume engine; weekend-skewed visitation.' },
    { name: 'Hong Kong', band: '24-30%', sharePct: 27, note: 'Premium corridor; highest retail/luxury wallet.' },
    { name: 'Southeast Asia', band: '12-16%', sharePct: 14, note: 'Growing; entertainment-led trips.' },
    { name: 'International long-haul', band: '8-12%', sharePct: 10, note: 'Longest stays; MICE and connoisseur mix.' },
  ];

  const rules = [
    { t: 'Ranges & indices only', d: 'Enriched figures never surface raw counts or payment amounts.' },
    { t: 'Cohort floors', d: 'No audience below the governed cohort floor is ever exported.' },
    { t: 'Category averages only', d: 'Category demi-decile averages only; no venue identifiers.' },
    { t: 'Quarterly refresh', d: 'Signals expire at refresh; stale audiences auto-retire.' },
    { t: 'Holdout measurement', d: 'Every campaign reads as index lift vs a matched holdout.' },
    { t: 'Consent & channel scope', d: 'Activation is limited to consented, reachable guests.' },
  ];
  const refreshDates: Record<RedesignQuarterLabel, string> = {
    '2025 Q3': 'Jul 14, 2025',
    '2025 Q4': 'Oct 13, 2025',
    '2026 Q1': 'Jan 12, 2026',
    '2026 Q2': 'Apr 13, 2026',
  };
  const refreshLog = REDESIGN_QUARTER_KEYS.map((key) => ({
    q: key,
    date: refreshDates[key],
    cov: `${redesignQuarterData[key].coverage}%`,
    status: key === '2026 Q2' ? 'CURRENT' : 'ARCHIVED',
    sColor: key === '2026 Q2' ? '#6FBF8F' : '#8B8598',
    sBorder: key === '2026 Q2' ? 'rgba(111,191,143,0.4)' : 'rgba(139,133,152,0.3)',
  }));

  return {
    pageId,
    screenLabel: screenLabels[pageId],
    pageTitle: pageTitles[pageId],
    quarter: { label: quarterLabel, ...qd },
    quarterKeys: [...REDESIGN_QUARTER_KEYS],
    previousQuarterLabel: prevLabel,
    navItems: redesignNavItems.map((item) => ({
      section: item.section,
      label: item.label,
      num: item.num,
      pageId: item.pageId,
      href: item.href,
      active: item.pageId === pageId,
      headerDisplay: item.section ? 'block' : 'none',
    })),
    quarterPills: REDESIGN_QUARTER_KEYS.map((label) => ({
      label,
      selected: label === quarterLabel,
      color: label === quarterLabel ? '#EAD9A9' : '#8B8598',
    })),
    selectedSegment: toModelSegment(selectedSegment),
    topSegment: toModelSegment(topSegment),
    kpis,
    constellationNodes,
    legend,
    selectedStats,
    segmentRows,
    categoryBase: { ...catBase },
    leakageCategories: leakCats,
    matrixRows,
    audiencePicks,
    channels: channelStates,
    activeChannels,
    windows,
    windowWeeks,
    windowNote,
    briefFacts,
    briefCopy,
    aiAnswers,
    aiChips,
    aiAnswer: 'Choose a guided chip or ask a question for a CDE-safe answer.',
    segmentChips,
    journeyStages,
    weakName: weakStage.name,
    weakCap: weakStage.cap,
    walletSplit,
    walletTrend,
    walletCards,
    funnel,
    guestRows,
    propensityRows,
    selectedPropensityBand,
    selectedChannelRecommendation,
    readouts,
    measureCounts,
    reach: reachPct,
    depth: depthPct,
    simulation,
    demand,
    corridors,
    rules,
    refreshLog,
    exportLabel: input.exported ? 'Brief handed to Marketing' : 'Export campaign brief',
    exportBg: input.exported ? '#6FBF8F' : ACCENT,
    exportColor: '#14101F',
  };
}
