import type {
  Corridor,
  CoreCategory,
  Guest,
  MeasurementCampaign,
  Methodology,
  Segment,
  SegmentPersona,
  SemanticFact as DataSemanticFact,
} from '@/data';
import { formatEnriched } from './format';

export type SemanticFact = DataSemanticFact;

export type SemanticIntent =
  | 'luxuryLeakage'
  | 'topLeads'
  | 'fnbHeadroom'
  | 'corridorPriority'
  | 'guestPitch'
  | 'measurement'
  | 'governedFallback';

export type SemanticRoute =
  | '/'
  | '/segments'
  | '/leakage'
  | '/activation'
  | '/guests'
  | '/corridors'
  | '/measurement';

export interface SemanticLayerInput {
  methodology: Methodology;
  segments: Segment[];
  personas: SegmentPersona[];
  guests: Guest[];
  corridors: Corridor[];
  campaigns: MeasurementCampaign[];
}

export interface SemanticVisualItem {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  description: string;
}

export type SemanticVisualKind =
  | 'bar-list'
  | 'metric-strip'
  | 'lead-list'
  | 'corridor-card'
  | 'line-series'
  | 'fact-table';

export interface SemanticVisual {
  kind: SemanticVisualKind;
  title: string;
  items: SemanticVisualItem[];
}

export interface SemanticLink {
  label: string;
  href: SemanticRoute;
}

export interface SemanticQueryResult {
  intent: SemanticIntent;
  title: string;
  answer: string;
  auditFacts: SemanticFact[];
  visual: SemanticVisual;
  followUps: string[];
  links: SemanticLink[];
}

// Source arrays remain internal query inputs and must not be serialized to UI; UI surfaces use facts/results.
export interface CdeSemanticLayer extends SemanticLayerInput {
  facts: SemanticFact[];
}

const CDE_SAFE_BAND = '0-0k equiv./mo';
const CDE_SAFE_REDACTION = 'CDE-safe value';
const NON_FINITE_REDACTION = 'finite CDE value';
const currencyTokenSource = '(?:HKD|MOP|\\$|元|澳門幣)';
const amountSource = '\\d+(?:[.,]\\d+)*(?:\\s*[km])?';
const periodSource = '(?:\\s*(?:monthly|per\\s+month|\\/mo))?';
const tokenBeforeAmountPattern = new RegExp(`${currencyTokenSource}\\s*\\$?\\s*${amountSource}${periodSource}`, 'gi');
const amountBeforeTokenPattern = new RegExp(`${amountSource}\\s*${currencyTokenSource}${periodSource}`, 'gi');
const currencyTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/gi;
const numericFragmentPattern = /\b\d+(?:[.,]\d+)*(?:\s*[km])?\b/gi;
const nonFiniteTextPattern = /NaN|Infinity/gi;
const allowedRoutes = new Set<SemanticRoute>([
  '/',
  '/segments',
  '/leakage',
  '/activation',
  '/guests',
  '/corridors',
  '/measurement',
]);

const CATEGORY_LABELS: Record<CoreCategory, string> = {
  hospitality: 'hospitality',
  fnb: 'F&B',
  entertainment: 'entertainment',
  retailLuxury: 'luxury retail',
};

function finite(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function liftPct(testIndex: number | undefined, controlIndex: number | undefined): number {
  const control = finite(controlIndex);
  if (control === 0) return 0;
  return ((finite(testIndex) - control) / control) * 100;
}

function safeText(value: unknown, fallback = 'Governed CDE value'): string {
  const text = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
  if (!text) return fallback;
  const includesCurrency = currencyTokenPattern.test(text)
    || tokenBeforeAmountPattern.test(text)
    || amountBeforeTokenPattern.test(text);

  currencyTokenPattern.lastIndex = 0;
  tokenBeforeAmountPattern.lastIndex = 0;
  amountBeforeTokenPattern.lastIndex = 0;

  const sanitized = text
    .replace(tokenBeforeAmountPattern, CDE_SAFE_REDACTION)
    .replace(amountBeforeTokenPattern, CDE_SAFE_REDACTION)
    .replace(currencyTokenPattern, CDE_SAFE_REDACTION)
    .replace(nonFiniteTextPattern, NON_FINITE_REDACTION);
  const redacted = includesCurrency
    ? sanitized.replace(numericFragmentPattern, CDE_SAFE_REDACTION)
    : sanitized;

  return redacted
    .replace(/\s+/g, ' ')
    .trim() || fallback;
}

function pct(value: number | undefined): string {
  return formatEnriched(finite(value), 'pct');
}

function index(value: number | undefined): string {
  return formatEnriched(finite(value), 'index');
}

function band(value: unknown): string {
  const text = safeText(value, CDE_SAFE_BAND);

  try {
    return formatEnriched(text, 'band');
  } catch {
    return formatEnriched(CDE_SAFE_BAND, 'band');
  }
}

function categoryLabel(category: CoreCategory | 'corridor' | undefined): string {
  if (!category) return 'governed opportunity';
  if (category === 'corridor') return 'corridor';
  return CATEGORY_LABELS[category];
}

function fact(
  id: string,
  label: string,
  value: string,
  source: string,
  route: SemanticRoute,
): SemanticFact {
  return {
    id,
    label: safeText(label),
    value: safeText(value),
    source,
    route,
  };
}

function segmentWalletSource(segment: Segment, category: CoreCategory, field: 'leakagePct' | 'totalWalletIndex') {
  return `segments.${segment.id}.categories.${category}.${field}`;
}

function guestCategorySource(guest: Guest, field: 'categoryLeakagePct' | 'categoryWalletIndex') {
  return `guests.${guest.id}.cde.${field}.${guest.primaryOpportunity}`;
}

function addMethodologyFacts(facts: SemanticFact[], methodology: Methodology) {
  facts.push(
    fact(
      'methodology-matched-coverage',
      'Matched CDE coverage',
      pct(methodology.matchedCoveragePct),
      'methodology.matchedCoveragePct',
      '/measurement',
    ),
    fact(
      'methodology-basis',
      'CDE basis',
      methodology.basis,
      'methodology.basis',
      '/measurement',
    ),
    fact(
      'methodology-refresh',
      'Refresh cadence',
      methodology.refresh,
      'methodology.refresh',
      '/measurement',
    ),
    fact(
      'methodology-active-metrics',
      'Active metric count',
      `${finite(methodology.activeMetricCount)} active CDE metrics`,
      'methodology.activeMetricCount',
      '/measurement',
    ),
    fact(
      'methodology-panel-share',
      'Aggregate panel share',
      methodology.panelSharePct,
      'methodology.panelSharePct',
      '/measurement',
    ),
  );
}

function addSegmentFacts(facts: SemanticFact[], segments: Segment[]) {
  segments.forEach((segment) => {
    const fnb = segment.categories.fnb;
    const retailLuxury = segment.categories.retailLuxury;

    facts.push(
      fact(
        `${segment.id}-opportunity-index`,
        `${segment.name} opportunity index`,
        index(segment.opportunityIndex),
        `segments.${segment.id}.opportunityIndex`,
        '/segments',
      ),
      fact(
        `${segment.id}-luxury-leakage`,
        `${segment.name} luxury retail leakage`,
        pct(retailLuxury.leakagePct),
        segmentWalletSource(segment, 'retailLuxury', 'leakagePct'),
        '/leakage',
      ),
      fact(
        `${segment.id}-luxury-wallet-index`,
        `${segment.name} luxury retail wallet index`,
        index(retailLuxury.totalWalletIndex),
        segmentWalletSource(segment, 'retailLuxury', 'totalWalletIndex'),
        '/leakage',
      ),
      fact(
        `${segment.id}-fnb-leakage`,
        `${segment.name} F&B leakage`,
        pct(fnb.leakagePct),
        segmentWalletSource(segment, 'fnb', 'leakagePct'),
        '/measurement',
      ),
      fact(
        `${segment.id}-fnb-wallet-index`,
        `${segment.name} F&B wallet index`,
        index(fnb.totalWalletIndex),
        segmentWalletSource(segment, 'fnb', 'totalWalletIndex'),
        '/measurement',
      ),
      fact(
        `${segment.id}-headroom-band`,
        `${segment.name} headroom band`,
        band(segment.crossPropertyCashBand),
        `segments.${segment.id}.crossPropertyCashBand`,
        '/measurement',
      ),
      fact(
        `${segment.id}-cross-property-index`,
        `${segment.name} cross-property headroom index`,
        index(segment.crossPropertyCashIndex),
        `segments.${segment.id}.crossPropertyCashIndex`,
        '/segments',
      ),
    );
  });
}

function addPersonaFacts(facts: SemanticFact[], personas: SegmentPersona[]) {
  personas.forEach((persona) => {
    facts.push(
      fact(
        `${persona.id}-opportunity-index`,
        `${persona.name} opportunity index`,
        index(persona.opportunityIndex),
        `personas.${persona.id}.opportunityIndex`,
        '/activation',
      ),
      fact(
        `${persona.id}-leakage`,
        `${persona.name} leakage`,
        pct(persona.leakagePct),
        `personas.${persona.id}.leakagePct`,
        '/activation',
      ),
      fact(
        `${persona.id}-readiness`,
        `${persona.name} readiness`,
        index(persona.readinessScore),
        `personas.${persona.id}.readinessScore`,
        '/activation',
      ),
      fact(
        `${persona.id}-headroom-band`,
        `${persona.name} headroom band`,
        band(persona.crossPropertyCashBand),
        `personas.${persona.id}.crossPropertyCashBand`,
        '/activation',
      ),
    );
  });
}

function addGuestFacts(facts: SemanticFact[], guests: Guest[]) {
  guests.forEach((guest) => {
    facts.push(
      fact(
        `${guest.id}-lead-score`,
        `${guest.id} lead score`,
        index(guest.leadScore),
        `guests.${guest.id}.leadScore`,
        '/guests',
      ),
      fact(
        `${guest.id}-upside-band`,
        `${guest.id} projected upside band`,
        band(guest.projectedUpsideBand),
        `guests.${guest.id}.projectedUpsideBand`,
        '/guests',
      ),
      fact(
        `${guest.id}-primary-opportunity`,
        `${guest.id} primary opportunity`,
        categoryLabel(guest.primaryOpportunity),
        `guests.${guest.id}.primaryOpportunity`,
        '/guests',
      ),
      fact(
        `${guest.id}-primary-leakage`,
        `${guest.id} primary opportunity leakage`,
        pct(guest.cde.categoryLeakagePct[guest.primaryOpportunity]),
        guestCategorySource(guest, 'categoryLeakagePct'),
        '/guests',
      ),
      fact(
        `${guest.id}-primary-wallet-index`,
        `${guest.id} primary opportunity wallet index`,
        index(guest.cde.categoryWalletIndex[guest.primaryOpportunity]),
        guestCategorySource(guest, 'categoryWalletIndex'),
        '/guests',
      ),
    );
  });
}

function addCorridorFacts(facts: SemanticFact[], corridors: Corridor[]) {
  corridors.forEach((corridor) => {
    facts.push(
      fact(
        `${corridor.id}-priority-index`,
        `${corridor.name} priority index`,
        index(corridor.priorityIndex),
        `corridors.${corridor.id}.priorityIndex`,
        '/corridors',
      ),
      fact(
        `${corridor.id}-projected-value-band`,
        `${corridor.name} projected value band`,
        band(corridor.projectedValueBand),
        `corridors.${corridor.id}.projectedValueBand`,
        '/corridors',
      ),
      fact(
        `${corridor.id}-non-gaming-share`,
        `${corridor.name} non-gaming share`,
        pct(corridor.nonGamingSharePct),
        `corridors.${corridor.id}.nonGamingSharePct`,
        '/corridors',
      ),
      fact(
        `${corridor.id}-spend-index-2024`,
        `${corridor.name} 2024 spend index`,
        index(corridor.spendIndex['2024']),
        `corridors.${corridor.id}.spendIndex.2024`,
        '/corridors',
      ),
    );
  });
}

function addCampaignFacts(facts: SemanticFact[], campaigns: MeasurementCampaign[]) {
  campaigns.forEach((campaign) => {
    const firstWeek = campaign.weeklySeries[0];
    const lastWeek = campaign.weeklySeries[campaign.weeklySeries.length - 1];

    facts.push(
      fact(
        `${campaign.id}-indexed-band`,
        `${campaign.name} indexed value band`,
        band(campaign.indexedRevenueBand),
        `campaigns.${campaign.id}.indexedRevenueBand`,
        '/measurement',
      ),
      fact(
        `${campaign.id}-holdout`,
        `${campaign.name} holdout`,
        pct(campaign.testDesign.holdoutPct),
        `campaigns.${campaign.id}.testDesign.holdoutPct`,
        '/measurement',
      ),
      fact(
        `${campaign.id}-expected-lift`,
        `${campaign.name} expected lift threshold`,
        pct(campaign.testDesign.expectedLiftThresholdPct),
        `campaigns.${campaign.id}.testDesign.expectedLiftThresholdPct`,
        '/measurement',
      ),
    );

    if (firstWeek) {
      facts.push(
        fact(
          `${campaign.id}-first-week-test`,
          `${campaign.name} first week test index`,
          index(firstWeek.testIndex),
          `campaigns.${campaign.id}.weeklySeries.0.testIndex`,
          '/measurement',
        ),
        fact(
          `${campaign.id}-first-week-control`,
          `${campaign.name} first week control index`,
          index(firstWeek.controlIndex),
          `campaigns.${campaign.id}.weeklySeries.0.controlIndex`,
          '/measurement',
        ),
      );
    }

    if (lastWeek) {
      const lastIndex = campaign.weeklySeries.length - 1;

      facts.push(
        fact(
          `${campaign.id}-latest-week-test`,
          `${campaign.name} latest week test index`,
          index(lastWeek.testIndex),
          `campaigns.${campaign.id}.weeklySeries.${lastIndex}.testIndex`,
          '/measurement',
        ),
        fact(
          `${campaign.id}-latest-week-control`,
          `${campaign.name} latest week control index`,
          index(lastWeek.controlIndex),
          `campaigns.${campaign.id}.weeklySeries.${lastIndex}.controlIndex`,
          '/measurement',
        ),
      );
    }
  });
}

export function buildCdeSemanticLayer(input: SemanticLayerInput): CdeSemanticLayer {
  const facts: SemanticFact[] = [];

  addMethodologyFacts(facts, input.methodology);
  addSegmentFacts(facts, input.segments);
  addPersonaFacts(facts, input.personas);
  addGuestFacts(facts, input.guests);
  addCorridorFacts(facts, input.corridors);
  addCampaignFacts(facts, input.campaigns);

  return {
    methodology: input.methodology,
    segments: [...input.segments],
    personas: [...input.personas],
    guests: [...input.guests],
    corridors: [...input.corridors],
    campaigns: [...input.campaigns],
    facts,
  };
}

function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase();
}

function safeRoute(route: string): SemanticRoute {
  return allowedRoutes.has(route as SemanticRoute) ? route as SemanticRoute : '/';
}

function classifyIntent(question: string): SemanticIntent {
  const normalized = normalizeQuestion(question);

  if (!normalized) return 'governedFallback';
  if (/\b(?:exact|raw|actual)\b.*\b(?:spend|spending|amount|value|wallet|money|revenue)\b/.test(normalized)) {
    return 'governedFallback';
  }
  if (/\b(?:hkd|mop)(?=\b|[\s\d$.,:;/-])|\b(?:currency|cash amount|money amount)\b|\$|元|澳門幣/i.test(question)) {
    return 'governedFallback';
  }
  if (/\b(?:draft|write|compose|pitch)\b/.test(normalized) && /\b(?:guest|mem-)/.test(normalized)) {
    return 'guestPitch';
  }
  if (/\btop\s*10\b/.test(normalized) || (/\btop\b/.test(normalized) && /\bleads?\b/.test(normalized))) {
    return 'topLeads';
  }
  if (/\b(?:luxury|retail)\b/.test(normalized) && /\b(?:leak|leaks|leakage|wallet)\b/.test(normalized)) {
    return 'luxuryLeakage';
  }
  if (/\b(?:f&b|fnb|dining|food)\b/.test(normalized) && /\b(?:headroom|close|leak|leakage)\b/.test(normalized)) {
    return 'fnbHeadroom';
  }
  if (/\bcorridors?\b/.test(normalized) && /\b(?:prioritise|prioritize|priority|why)\b/.test(normalized)) {
    return 'corridorPriority';
  }
  if (/\b(?:measurement|test|control|lift|roi|campaign)\b/.test(normalized) || /did it work/.test(normalized)) {
    return 'measurement';
  }

  return 'governedFallback';
}

function sortByScore<T>(items: T[], score: (item: T) => number, id: (item: T) => string): T[] {
  return [...items].sort((first, second) => {
    const delta = score(second) - score(first);
    if (delta !== 0) return delta;
    return id(first).localeCompare(id(second));
  });
}

function factMap(layer: CdeSemanticLayer): Map<string, SemanticFact> {
  return new Map(layer.facts.map((item) => [item.source, item]));
}

function auditFacts(layer: CdeSemanticLayer, sources: string[]): SemanticFact[] {
  const bySource = factMap(layer);
  return sources
    .map((source) => bySource.get(source))
    .filter((item): item is SemanticFact => Boolean(item));
}

function link(label: string, href: SemanticRoute): SemanticLink {
  return { label: safeText(label), href };
}

function visualItem(
  id: string,
  label: string,
  value: number | undefined,
  formattedValue: string,
  description: string,
): SemanticVisualItem {
  return {
    id: safeText(id),
    label: safeText(label),
    value: finite(value),
    formattedValue: safeText(formattedValue),
    description: safeText(description),
  };
}

function emptyVisual(title = 'Governed CDE visual'): SemanticVisual {
  return { kind: 'fact-table', title, items: [] };
}

function sanitizeFact(item: SemanticFact): SemanticFact {
  return {
    id: item.id,
    label: safeText(item.label),
    value: typeof item.value === 'number' ? finite(item.value) : safeText(item.value),
    source: item.source,
    route: safeRoute(item.route),
  };
}

function sanitizeResult(result: SemanticQueryResult): SemanticQueryResult {
  return {
    intent: result.intent,
    title: safeText(result.title),
    answer: safeText(result.answer),
    auditFacts: result.auditFacts.map(sanitizeFact),
    visual: {
      kind: result.visual.kind,
      title: safeText(result.visual.title),
      items: result.visual.items.map((item) => visualItem(
        item.id,
        item.label,
        item.value,
        item.formattedValue,
        item.description,
      )),
    },
    followUps: result.followUps.map((item) => safeText(item)),
    links: result.links.map((item) => link(item.label, item.href)),
  };
}

function luxuryLeakage(layer: CdeSemanticLayer): SemanticQueryResult {
  const ranked = sortByScore(
    layer.segments,
    (segment) => finite(segment.categories.retailLuxury.leakagePct) * finite(segment.categories.retailLuxury.totalWalletIndex),
    (segment) => segment.id,
  );
  const top = ranked[0];

  if (!top) return governedFallback(layer);

  const leakage = top.categories.retailLuxury.leakagePct;
  const wallet = top.categories.retailLuxury.totalWalletIndex;

  return sanitizeResult({
    intent: 'luxuryLeakage',
    title: 'Luxury Retail Leakage',
    answer: `${top.name} leaks the most luxury retail wallet: ${pct(leakage)} leakage with ${index(wallet)} wallet intensity. Use the leakage view to validate the segment and move the governed audience into activation.`,
    auditFacts: auditFacts(layer, [
      segmentWalletSource(top, 'retailLuxury', 'leakagePct'),
      segmentWalletSource(top, 'retailLuxury', 'totalWalletIndex'),
      `segments.${top.id}.opportunityIndex`,
      'methodology.matchedCoveragePct',
    ]),
    visual: {
      kind: 'bar-list',
      title: 'Ranked luxury retail leakage',
      items: ranked.map((segment) => {
        const segmentLeakage = segment.categories.retailLuxury.leakagePct;
        const segmentWallet = segment.categories.retailLuxury.totalWalletIndex;

        return visualItem(
          segment.id,
          segment.name,
          finite(segmentLeakage) * finite(segmentWallet),
          `${pct(segmentLeakage)} / ${index(segmentWallet)}`,
          `Source ${segmentWalletSource(segment, 'retailLuxury', 'leakagePct')} and ${segmentWalletSource(segment, 'retailLuxury', 'totalWalletIndex')}.`,
        );
      }),
    },
    followUps: [
      'Open leakage by segment',
      'Compare luxury retail against F&B headroom',
      'Move the top segment into activation',
    ],
    links: [link('Open leakage', '/leakage')],
  });
}

function topLeads(layer: CdeSemanticLayer): SemanticQueryResult {
  const ranked = sortByScore(layer.guests, (guest) => finite(guest.leadScore), (guest) => guest.id);
  const topTen = ranked.slice(0, 10);
  const first = topTen[0];

  return sanitizeResult({
    intent: 'topLeads',
    title: 'Top Pitch Leads',
    answer: first
      ? `${first.id} leads the governed pitch queue at ${index(first.leadScore)}, with ${band(first.projectedUpsideBand)} upside and ${categoryLabel(first.primaryOpportunity)} as the primary opportunity.`
      : 'No governed guest leads are available in the current CDE layer.',
    auditFacts: auditFacts(
      layer,
      topTen.flatMap((guest) => [
        `guests.${guest.id}.leadScore`,
        `guests.${guest.id}.projectedUpsideBand`,
        `guests.${guest.id}.primaryOpportunity`,
      ]),
    ),
    visual: {
      kind: 'lead-list',
      title: 'Top 10 governed leads',
      items: topTen.map((guest) => visualItem(
        guest.id,
        guest.id,
        guest.leadScore,
        index(guest.leadScore),
        `${guest.persona} | ${categoryLabel(guest.primaryOpportunity)} | ${band(guest.projectedUpsideBand)}`,
      )),
    },
    followUps: [
      'Draft a pitch for a masked guest ID',
      'Filter leads by primary opportunity',
      'Open the guest workbench',
    ],
    links: [link('Open guests', '/guests')],
  });
}

function fnbHeadroom(layer: CdeSemanticLayer): SemanticQueryResult {
  const ranked = sortByScore(
    layer.segments,
    (segment) => finite(segment.categories.fnb.leakagePct) * finite(segment.categories.fnb.totalWalletIndex),
    (segment) => segment.id,
  );
  const top = ranked[0];

  if (!top) return governedFallback(layer);

  return sanitizeResult({
    intent: 'fnbHeadroom',
    title: 'F&B Headroom',
    answer: `${top.name} has the clearest F&B headroom: ${pct(top.categories.fnb.leakagePct)} leakage, ${index(top.categories.fnb.totalWalletIndex)} wallet intensity, and ${band(top.crossPropertyCashBand)} modelled headroom. Measurement should validate this before scale-up.`,
    auditFacts: auditFacts(layer, [
      segmentWalletSource(top, 'fnb', 'leakagePct'),
      segmentWalletSource(top, 'fnb', 'totalWalletIndex'),
      `segments.${top.id}.crossPropertyCashBand`,
      'methodology.matchedCoveragePct',
    ]),
    visual: {
      kind: 'bar-list',
      title: 'Ranked F&B leakage headroom',
      items: ranked.map((segment) => visualItem(
        segment.id,
        segment.name,
        finite(segment.categories.fnb.leakagePct) * finite(segment.categories.fnb.totalWalletIndex),
        `${pct(segment.categories.fnb.leakagePct)} / ${index(segment.categories.fnb.totalWalletIndex)} / ${band(segment.crossPropertyCashBand)}`,
        `Source ${segmentWalletSource(segment, 'fnb', 'leakagePct')}, ${segmentWalletSource(segment, 'fnb', 'totalWalletIndex')}, and segments.${segment.id}.crossPropertyCashBand.`,
      )),
    },
    followUps: [
      'Open measurement',
      'Compare F&B to luxury retail leakage',
      'Build a campaign holdout',
    ],
    links: [link('Open measurement', '/measurement')],
  });
}

function corridorPriority(layer: CdeSemanticLayer): SemanticQueryResult {
  const ranked = sortByScore(layer.corridors, (corridor) => finite(corridor.priorityIndex), (corridor) => corridor.id);
  const top = ranked[0];

  if (!top) return governedFallback(layer);

  return sanitizeResult({
    intent: 'corridorPriority',
    title: 'Corridor Priority',
    answer: `${top.name} should be prioritised first because it ranks #${top.priorityRank} with ${index(top.priorityIndex)} priority, ${pct(top.nonGamingSharePct)} non-gaming share, and ${band(top.projectedValueBand)} modelled corridor value.`,
    auditFacts: auditFacts(layer, [
      `corridors.${top.id}.priorityIndex`,
      `corridors.${top.id}.nonGamingSharePct`,
      `corridors.${top.id}.projectedValueBand`,
      `corridors.${top.id}.spendIndex.2024`,
    ]),
    visual: {
      kind: 'corridor-card',
      title: 'Corridor priority queue',
      items: ranked.map((corridor) => visualItem(
        corridor.id,
        corridor.name,
        corridor.priorityIndex,
        index(corridor.priorityIndex),
        `${pct(corridor.nonGamingSharePct)} non-gaming share with ${band(corridor.projectedValueBand)} modelled value.`,
      )),
    },
    followUps: [
      'Open corridor acquisition',
      'Review corridor persona mix',
      'Launch a measurement campaign',
    ],
    links: [link('Open corridors', '/corridors')],
  });
}

function extractGuestId(question: string): string | undefined {
  return question.match(/MEM-[^\s,.;:!?]+/i)?.[0];
}

function guestPitch(question: string, layer: CdeSemanticLayer): SemanticQueryResult {
  const requestedId = extractGuestId(question);
  const ranked = sortByScore(layer.guests, (guest) => finite(guest.leadScore), (guest) => guest.id);
  const requestedGuest = requestedId
    ? ranked.find((item) => item.id.toLowerCase() === requestedId.toLowerCase())
    : undefined;
  const guest = requestedId ? requestedGuest : ranked[0];

  if (!guest) return governedFallback(layer);

  const primaryLeakage = guest.cde.categoryLeakagePct[guest.primaryOpportunity];
  const primaryWallet = guest.cde.categoryWalletIndex[guest.primaryOpportunity];

  return sanitizeResult({
    intent: 'guestPitch',
    title: 'Governed Guest Pitch',
    answer: `Pitch for ${guest.id}: ${guest.pitchScript.en} Evidence: lead score ${index(guest.leadScore)}, upside ${band(guest.projectedUpsideBand)}, and ${categoryLabel(guest.primaryOpportunity)} with ${pct(primaryLeakage)} leakage at ${index(primaryWallet)} wallet intensity.`,
    auditFacts: auditFacts(layer, [
      `guests.${guest.id}.leadScore`,
      `guests.${guest.id}.projectedUpsideBand`,
      `guests.${guest.id}.primaryOpportunity`,
      guestCategorySource(guest, 'categoryLeakagePct'),
      guestCategorySource(guest, 'categoryWalletIndex'),
    ]),
    visual: {
      kind: 'metric-strip',
      title: `${guest.id} pitch evidence`,
      items: [
        visualItem(`${guest.id}-lead`, 'Lead score', guest.leadScore, index(guest.leadScore), 'Governed lead ranking.'),
        visualItem(`${guest.id}-upside`, 'Upside band', guest.leadScore, band(guest.projectedUpsideBand), 'Modelled CDE upside band.'),
        visualItem(`${guest.id}-leakage`, 'Primary leakage', primaryLeakage, pct(primaryLeakage), categoryLabel(guest.primaryOpportunity)),
        visualItem(`${guest.id}-wallet`, 'Wallet intensity', primaryWallet, index(primaryWallet), categoryLabel(guest.primaryOpportunity)),
      ],
    },
    followUps: [
      'Open the guest profile',
      'Compare with the top 10 lead queue',
      'Send to activation after consent review',
    ],
    links: [link('Open guests', '/guests')],
  });
}

function measurement(layer: CdeSemanticLayer): SemanticQueryResult {
  const campaign = layer.campaigns.find((item) => item.source !== 'seed') ?? layer.campaigns[0];

  if (!campaign) return governedFallback(layer);

  const latest = campaign.weeklySeries[campaign.weeklySeries.length - 1];
  const latestLiftPct = liftPct(latest?.testIndex, latest?.controlIndex);

  return sanitizeResult({
    intent: 'measurement',
    title: `${campaign.name} Measurement Readout`,
    answer: `${campaign.name} is measured with a ${pct(campaign.testDesign.holdoutPct)} holdout across ${campaign.testDesign.durationWeeks} weeks. The latest test read is ${index(latest?.testIndex)} versus control ${index(latest?.controlIndex)}, giving ${pct(latestLiftPct)} lift against a ${pct(campaign.testDesign.expectedLiftThresholdPct)} threshold.`,
    auditFacts: auditFacts(layer, [
      `campaigns.${campaign.id}.testDesign.holdoutPct`,
      `campaigns.${campaign.id}.testDesign.expectedLiftThresholdPct`,
      `campaigns.${campaign.id}.weeklySeries.${campaign.weeklySeries.length - 1}.testIndex`,
      `campaigns.${campaign.id}.weeklySeries.${campaign.weeklySeries.length - 1}.controlIndex`,
    ]),
    visual: {
      kind: 'line-series',
      title: `${campaign.name} weekly test/control`,
      items: campaign.weeklySeries.map((point) => visualItem(
        `${campaign.id}-${point.week}`,
        point.week,
        liftPct(point.testIndex, point.controlIndex),
        pct(liftPct(point.testIndex, point.controlIndex)),
        `Source campaigns.${campaign.id}.weeklySeries.${campaign.weeklySeries.indexOf(point)}.`,
      )),
    },
    followUps: [
      'Open measurement',
      'Compare lift against the holdout design',
      'Check the activation audience',
    ],
    links: [link('Open measurement', '/measurement')],
  });
}

function governedFallback(layer: CdeSemanticLayer): SemanticQueryResult {
  return sanitizeResult({
    intent: 'governedFallback',
    title: 'Governed CDE Fallback',
    answer: 'This assistant only answers from the governed CDE semantic layer. Ask about luxury leakage, top leads, F&B headroom, corridor priority, guest pitch, or measurement using percentages, indices, modelled bands, and masked guest IDs.',
    auditFacts: auditFacts(layer, [
      'methodology.basis',
      'methodology.refresh',
      'methodology.matchedCoveragePct',
    ]),
    visual: emptyVisual('Governed CDE scope'),
    followUps: [
      'Which segment leaks most luxury wallet?',
      'Who are my top 10 leads to pitch this quarter?',
      'Did the measurement campaign work?',
    ],
    links: [link('Open dashboard', '/')],
  });
}

export function queryCdeSemanticLayer(question: string, layer: CdeSemanticLayer): SemanticQueryResult {
  const intent = classifyIntent(question);

  if (intent === 'luxuryLeakage') return luxuryLeakage(layer);
  if (intent === 'topLeads') return topLeads(layer);
  if (intent === 'fnbHeadroom') return fnbHeadroom(layer);
  if (intent === 'corridorPriority') return corridorPriority(layer);
  if (intent === 'guestPitch') return guestPitch(question, layer);
  if (intent === 'measurement') return measurement(layer);

  return governedFallback(layer);
}
