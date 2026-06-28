import {
  type Corridor,
  type Guest,
  type MeasurementCampaign,
  type Methodology,
  type Segment,
  type SegmentPersona,
} from '@/data';
import {
  buildCdeSemanticLayer,
  queryCdeSemanticLayer,
  type SemanticFact,
  type SemanticIntent,
  type SemanticQueryResult,
  type SemanticRoute,
  type SemanticVisualKind,
} from '@/lib/cde-semantic-layer';
import { formatEnriched } from './format';
import { buildLeakageDrivers, buildPortfolioInsightNarrative } from './insights';

export type ChatAssistantIntent =
  | 'overview'
  | 'segment'
  | 'leakage'
  | 'persona'
  | 'activation'
  | 'methodology'
  | 'fallback'
  | SemanticIntent;

export type ChatAssistantVisualKind = SemanticVisualKind;

export interface ChatVisualItem {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  description: string;
}

export interface ChatAssistantVisual {
  kind: ChatAssistantVisualKind;
  title: string;
  items: ChatVisualItem[];
}

export interface ChatAssistantEvidence {
  label: string;
  value: string;
  detail?: string;
}

type ChatAssistantHref = SemanticRoute | '/propensity';

export interface ChatAssistantLink {
  label: string;
  href: ChatAssistantHref;
}

export interface ChatAssistantResponse {
  id: string;
  intent: ChatAssistantIntent;
  governanceBadge: 'Grounded · Auditable';
  title: string;
  answer: string;
  evidence: ChatAssistantEvidence[];
  auditFacts: SemanticFact[];
  visual: ChatAssistantVisual;
  links: ChatAssistantLink[];
  suggestedQuestions: string[];
}

export interface ChatAssistantContext {
  methodology?: Methodology;
  segments: Segment[];
  selectedSegment?: Segment;
  selectedSegmentId?: string;
  personas: SegmentPersona[];
  selectedPersonaId?: string;
  guests?: Guest[];
  corridors?: Corridor[];
  campaigns?: MeasurementCampaign[];
}

const DEFAULT_SUGGESTIONS = [
  'Which leakage driver is largest for the selected segment?',
  'Who are my top 10 leads to pitch this quarter?',
  'Draft the pitch for guest MEM-••••3421',
  'Which persona should we target first?',
  'What should activation do next?',
] as const;

const GOVERNANCE_BADGE = 'Grounded · Auditable' as const;
const FALLBACK_BAND = 'Indexed band equiv./mo';
const CDE_SAFE_REDACTION = 'CDE-safe value';
const NON_FINITE_REDACTION = 'finite CDE value';
const bannedCurrencyPattern = /MOP|HKD|\$|元|澳門幣/i;
const currencyTokenSource = '(?:MOP|HKD|\\$|元|澳門幣)';
const amountSource = '\\d+(?:[.,]\\d+)*(?:\\s*[km])?';
const periodSource = '(?:\\s*(?:monthly|per\\s+month|\\/mo))?';
const englishAmountWord = '(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)';
const englishAmountConnectorSource = '(?:[\\s-]+(?:and[\\s-]+)?)';
const englishAmountWordSource = `${englishAmountWord}(?:${englishAmountConnectorSource}${englishAmountWord})*`;
const chineseAmountWordSource = '[零一二三四五六七八九十百千万萬億亿兩两]+';
const amountWordSource = `(?:${englishAmountWordSource}|${chineseAmountWordSource})`;
const tokenBeforeAmountPattern = new RegExp(`${currencyTokenSource}\\s*\\$?\\s*${amountSource}${periodSource}`, 'gi');
const amountBeforeTokenPattern = new RegExp(`${amountSource}\\s*${currencyTokenSource}${periodSource}`, 'gi');
const tokenBeforeWordAmountPattern = new RegExp(`${currencyTokenSource}\\s*${amountWordSource}${periodSource}`, 'gi');
const wordAmountBeforeTokenPattern = new RegExp(`${amountWordSource}\\s*${currencyTokenSource}${periodSource}`, 'gi');
const numericFragmentPattern = /\b\d+(?:[.,]\d+)*(?:\s*[km])?\b/gi;
const englishAmountWordFragmentPattern = new RegExp(`\\b${englishAmountWord}\\b`, 'gi');
const chineseAmountWordFragmentPattern = new RegExp(chineseAmountWordSource, 'gi');
const currencyTokenPattern = /MOP|HKD|\$|元|澳門幣/gi;
const nonFiniteTextPattern = /NaN|Infinity/gi;
const sensitiveAmountPromptPattern = /\b(?:leak|leaking|leakage|gap|outside|recapture|wallet|spend|spending|cash|value|amount|raw|currency|money)\b|MOP|HKD|\$|元|澳門幣/i;
const exactSensitivePromptPattern = /\b(?:exact|raw|actual)\b.*\b(?:spend|spending|amount|value|wallet|money|revenue|leakage)\b/i;
const governedCurrencyPromptPattern = /\b(?:hkd|mop)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;

function finiteNumber(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return sanitizeChatAssistantText(trimmed) || fallback;
}

function safePct(value: number | undefined): string {
  return formatEnriched(finiteNumber(value), 'pct');
}

function safeIndex(value: number | undefined): string {
  return formatEnriched(finiteNumber(value), 'index');
}

function safeBand(value: unknown): string {
  if (typeof value !== 'string' || bannedCurrencyPattern.test(value)) return FALLBACK_BAND;

  try {
    return formatEnriched(value, 'band');
  } catch {
    return FALLBACK_BAND;
  }
}

function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase();
}

export function sanitizeChatAssistantText(value: string): string {
  const includesCurrency = bannedCurrencyPattern.test(value);
  const sanitized = value
    .replace(tokenBeforeAmountPattern, CDE_SAFE_REDACTION)
    .replace(amountBeforeTokenPattern, CDE_SAFE_REDACTION)
    .replace(tokenBeforeWordAmountPattern, CDE_SAFE_REDACTION)
    .replace(wordAmountBeforeTokenPattern, CDE_SAFE_REDACTION)
    .replace(currencyTokenPattern, CDE_SAFE_REDACTION)
    .replace(nonFiniteTextPattern, NON_FINITE_REDACTION);

  return (includesCurrency
    ? sanitized
      .replace(numericFragmentPattern, CDE_SAFE_REDACTION)
      .replace(englishAmountWordFragmentPattern, CDE_SAFE_REDACTION)
      .replace(chineseAmountWordFragmentPattern, CDE_SAFE_REDACTION)
    : sanitized)
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeChatAssistantPromptText(value: string): string {
  const sanitized = sanitizeChatAssistantText(value);

  if (!sensitiveAmountPromptPattern.test(value)) return sanitized;

  return sanitized
    .replace(numericFragmentPattern, CDE_SAFE_REDACTION)
    .replace(englishAmountWordFragmentPattern, CDE_SAFE_REDACTION)
    .replace(chineseAmountWordFragmentPattern, CDE_SAFE_REDACTION)
    .replace(/\s+/g, ' ')
    .trim();
}

function getSegments(context: Partial<ChatAssistantContext>): Segment[] {
  const segments = (context.segments ?? []).filter((segment): segment is Segment => Boolean(segment));

  if (!context.selectedSegment) return segments;
  if (segments.some((segment) => segment.id === context.selectedSegment?.id)) return segments;
  return [context.selectedSegment, ...segments];
}

function getPersonas(context: Partial<ChatAssistantContext>): SegmentPersona[] {
  return (context.personas ?? []).filter((persona): persona is SegmentPersona => Boolean(persona));
}

function sortByOpportunity<T extends { id: string; opportunityIndex: number }>(items: T[]): T[] {
  return [...items].sort((first, second) => {
    const delta = finiteNumber(second.opportunityIndex) - finiteNumber(first.opportunityIndex);
    if (delta !== 0) return delta;
    return first.id.localeCompare(second.id);
  });
}

function getSelectedSegment(context: Partial<ChatAssistantContext>): Segment | undefined {
  if (context.selectedSegment) return context.selectedSegment;

  const segments = getSegments(context);
  const explicit = segments.find((segment) => segment.id === context.selectedSegmentId);
  return explicit ?? sortByOpportunity(segments)[0];
}

function getSelectedPersonas(context: Partial<ChatAssistantContext>, selectedSegment?: Segment): SegmentPersona[] {
  const personas = getPersonas(context);
  const scopedPersonas = selectedSegment
    ? personas.filter((persona) => persona.segmentId === selectedSegment.id)
    : personas;
  const selectedPersona = scopedPersonas.find((persona) => persona.id === context.selectedPersonaId);

  if (!selectedPersona) return sortByOpportunity(scopedPersonas);

  return [
    selectedPersona,
    ...sortByOpportunity(scopedPersonas.filter((persona) => persona.id !== selectedPersona.id)),
  ];
}

function classifyIntent(question: string): ChatAssistantIntent {
  const normalized = normalizeQuestion(question);

  if (!normalized) return 'fallback';
  if (/\b(leak|leaking|leakage|gap|outside|recapture|wallet)\b/.test(normalized)) return 'leakage';
  if (
    /\b(methodology|compliance|source|basis|currency|data[-\s]?rule|raw\s+(?:spend|data)|exact\s+(?:spend|data|value)|calculate|calculated|modelled|modeled)\b/.test(normalized)
  ) {
    return 'methodology';
  }
  if (/\b(persona|personas|audience|target first|target)\b/.test(normalized)) return 'persona';
  if (/\b(activation|activate|campaign|offer|next)\b/.test(normalized)) return 'activation';
  if (/\b(segment|opportunity|headroom)\b/.test(normalized)) return 'segment';
  if (/\b(overview|summary|portfolio|executive)\b/.test(normalized)) return 'overview';

  return 'fallback';
}

function emptyVisual(kind: ChatAssistantVisualKind = 'metric-strip', title = 'No visual data'): ChatAssistantVisual {
  return {
    kind,
    title,
    items: [],
  };
}

function sanitizeEvidence(evidence: ChatAssistantEvidence): ChatAssistantEvidence {
  return {
    label: sanitizeChatAssistantText(evidence.label),
    value: sanitizeChatAssistantText(evidence.value),
    detail: evidence.detail ? sanitizeChatAssistantText(evidence.detail) : undefined,
  };
}

function sanitizeAuditFact(fact: SemanticFact): SemanticFact {
  return {
    id: sanitizeChatAssistantText(fact.id),
    label: sanitizeChatAssistantText(fact.label),
    value: typeof fact.value === 'number'
      ? finiteNumber(fact.value)
      : sanitizeChatAssistantText(String(fact.value)),
    source: sanitizeChatAssistantText(fact.source),
    route: sanitizeChatAssistantText(fact.route),
  };
}

function sanitizeVisualItem(item: ChatVisualItem): ChatVisualItem {
  return {
    id: sanitizeChatAssistantText(item.id),
    label: sanitizeChatAssistantText(item.label),
    value: finiteNumber(item.value),
    formattedValue: sanitizeChatAssistantText(item.formattedValue),
    description: sanitizeChatAssistantText(item.description),
  };
}

function sanitizeResponse(response: ChatAssistantResponse): ChatAssistantResponse {
  return {
    id: sanitizeChatAssistantText(response.id),
    intent: response.intent,
    governanceBadge: GOVERNANCE_BADGE,
    title: sanitizeChatAssistantText(response.title),
    answer: sanitizeChatAssistantText(response.answer),
    evidence: response.evidence.map(sanitizeEvidence),
    auditFacts: response.auditFacts.map(sanitizeAuditFact),
    visual: {
      kind: response.visual.kind,
      title: sanitizeChatAssistantText(response.visual.title),
      items: response.visual.items.map(sanitizeVisualItem),
    },
    links: response.links.map((link) => ({
      label: sanitizeChatAssistantText(link.label),
      href: link.href,
    })),
    suggestedQuestions: response.suggestedQuestions.map(sanitizeChatAssistantText),
  };
}

type ChatAssistantResponseInput = Omit<ChatAssistantResponse, 'governanceBadge' | 'auditFacts' | 'suggestedQuestions'> & {
  auditFacts?: SemanticFact[];
  suggestedQuestions?: string[];
};

function makeResponse(input: ChatAssistantResponseInput): ChatAssistantResponse {
  return sanitizeResponse({
    ...input,
    governanceBadge: GOVERNANCE_BADGE,
    auditFacts: input.auditFacts ?? [],
    suggestedQuestions: input.suggestedQuestions ?? [...DEFAULT_SUGGESTIONS],
  });
}

function hasSemanticLayerInput(context: Partial<ChatAssistantContext>): context is Partial<ChatAssistantContext> & {
  methodology: Methodology;
  segments: Segment[];
  personas: SegmentPersona[];
  guests: Guest[];
  corridors: Corridor[];
  campaigns: MeasurementCampaign[];
} {
  return Boolean(
    context.methodology
    && Array.isArray(context.segments)
    && Array.isArray(context.personas)
    && Array.isArray(context.guests)
    && Array.isArray(context.corridors)
    && Array.isArray(context.campaigns),
  );
}

function requiresGovernedFallback(question: string): boolean {
  return exactSensitivePromptPattern.test(question) || governedCurrencyPromptPattern.test(question);
}

function semanticEvidenceFromFacts(facts: SemanticFact[]): ChatAssistantEvidence[] {
  return facts.slice(0, 3).map((fact) => ({
    label: String(fact.label),
    value: String(fact.value),
    detail: fact.source,
  }));
}

function semanticSuggestedQuestions(result: SemanticQueryResult): string[] {
  if (result.intent !== 'topLeads') return result.followUps.length > 0 ? result.followUps : [...DEFAULT_SUGGESTIONS];

  const specificPitch = 'Draft the pitch for guest MEM-••••3421';

  return result.followUps
    .map((followUp) => (
      followUp === 'Draft a pitch for a masked guest ID' ? specificPitch : followUp
    ))
    .filter((followUp, index, followUps) => followUps.indexOf(followUp) === index);
}

function responseFromSemanticResult(result: SemanticQueryResult): ChatAssistantResponse {
  return makeResponse({
    id: `chat-semantic-${result.intent}`,
    intent: result.intent,
    title: result.title,
    answer: result.answer,
    evidence: semanticEvidenceFromFacts(result.auditFacts),
    auditFacts: result.auditFacts,
    visual: result.visual,
    links: result.links,
    suggestedQuestions: semanticSuggestedQuestions(result),
  });
}

function buildSemanticResponse(
  question: string,
  context: Partial<ChatAssistantContext>,
  legacyIntent: ChatAssistantIntent,
): ChatAssistantResponse | undefined {
  if (!hasSemanticLayerInput(context)) return undefined;

  const result = queryCdeSemanticLayer(question, buildCdeSemanticLayer({
    methodology: context.methodology,
    segments: context.segments,
    personas: context.personas,
    guests: context.guests,
    corridors: context.corridors,
    campaigns: context.campaigns,
  }));

  if (result.intent !== 'governedFallback' || requiresGovernedFallback(question) || legacyIntent === 'fallback') {
    return responseFromSemanticResult(result);
  }

  return undefined;
}

function segmentName(segment: Segment | undefined): string {
  return safeText(segment?.name, 'Selected segment');
}

function personaName(persona: SegmentPersona | undefined): string {
  return safeText(persona?.name, 'Selected persona');
}

function buildLeakageVisual(segment: Segment | undefined): ChatAssistantVisual {
  if (!segment) return emptyVisual('bar-list', 'Leakage drivers');

  const items = buildLeakageDrivers(segment)
    .slice(0, 4)
    .map<ChatVisualItem>((driver) => ({
      id: driver.category,
      label: safeText(driver.label, 'Leakage driver'),
      value: finiteNumber(driver.score),
      formattedValue: safePct(driver.leakagePct),
      description: `${safeIndex(driver.walletIndex)} wallet intensity`,
    }));

  return {
    kind: 'bar-list',
    title: 'Top leakage drivers',
    items,
  };
}

function buildPersonaVisual(personas: SegmentPersona[]): ChatAssistantVisual {
  return {
    kind: 'bar-list',
    title: 'Top personas by opportunity',
    items: personas.slice(0, 3).map<ChatVisualItem>((persona) => ({
      id: safeText(persona.id, 'persona'),
      label: personaName(persona),
      value: finiteNumber(persona.opportunityIndex),
      formattedValue: safeIndex(persona.opportunityIndex),
      description: `${safePct(persona.readinessScore)} readiness`,
    })),
  };
}

function buildSegmentVisual(segment: Segment | undefined): ChatAssistantVisual {
  return buildLeakageVisual(segment);
}

function buildOverviewVisual(segments: Segment[]): ChatAssistantVisual {
  return {
    kind: 'bar-list',
    title: 'Segments by opportunity',
    items: sortByOpportunity(segments)
      .slice(0, 4)
      .map<ChatVisualItem>((segment) => ({
        id: safeText(segment.id, 'segment'),
        label: segmentName(segment),
        value: finiteNumber(segment.opportunityIndex),
        formattedValue: safeIndex(segment.opportunityIndex),
        description: `${safePct(segment.metrics?.shareOfWallet)} Galaxy capture`,
      })),
  };
}

function buildOverviewResponse(context: Partial<ChatAssistantContext>): ChatAssistantResponse {
  const segments = getSegments(context);
  const narrative = buildPortfolioInsightNarrative(segments, context.methodology);
  const topSegment = sortByOpportunity(segments)[0];

  return makeResponse({
    id: 'chat-overview-portfolio',
    intent: 'overview',
    title: 'Portfolio CDE overview',
    answer: narrative.summary,
    evidence: [
      {
        label: 'Matched coverage',
        value: safePct(context.methodology?.matchedCoveragePct),
      },
      {
        label: 'Top opportunity',
        value: topSegment ? safeIndex(topSegment.opportunityIndex) : safeIndex(0),
        detail: topSegment ? segmentName(topSegment) : 'No active segment',
      },
    ],
    visual: buildOverviewVisual(segments),
    links: [
      { label: 'Open segments', href: '/segments' },
      { label: 'Open leakage', href: '/leakage' },
    ],
  });
}

function buildSegmentResponse(context: Partial<ChatAssistantContext>): ChatAssistantResponse {
  const segment = getSelectedSegment(context);
  const name = segmentName(segment);

  return makeResponse({
    id: `chat-segment-${safeText(segment?.id, 'none')}`,
    intent: 'segment',
    title: `${name} CDE brief`,
    answer: segment
      ? `${name} shows ${safePct(segment.metrics?.shareOfWallet)} Galaxy capture, ${safeIndex(segment.opportunityIndex)} opportunity, and ${safeBand(segment.crossPropertyCashBand)} modelled headroom.`
      : 'No active segment is available, so the assistant can only return an empty CDE brief.',
    evidence: [
      { label: 'Galaxy capture', value: safePct(segment?.metrics?.shareOfWallet) },
      { label: 'Opportunity', value: safeIndex(segment?.opportunityIndex) },
      { label: 'Modelled band', value: safeBand(segment?.crossPropertyCashBand) },
    ],
    visual: buildSegmentVisual(segment),
    links: [{ label: 'Open segments', href: '/segments' }],
  });
}

function buildLeakageResponse(context: Partial<ChatAssistantContext>): ChatAssistantResponse {
  const segment = getSelectedSegment(context);
  const visual = buildLeakageVisual(segment);
  const topDriver = visual.items[0];
  const name = segmentName(segment);

  return makeResponse({
    id: `chat-leakage-${safeText(segment?.id, 'none')}`,
    intent: 'leakage',
    title: 'Leakage driver ranking',
    answer: segment && topDriver
      ? `Mastercard CDE ranks ${topDriver.label} as the largest leakage driver for ${name}, with ${topDriver.formattedValue} leakage, ${topDriver.description}, and ${safeBand(segment.crossPropertyCashBand)} modelled headroom.`
      : 'Mastercard CDE has no active segment leakage drivers to rank yet.',
    evidence: [
      {
        label: 'Primary leakage',
        value: topDriver?.formattedValue ?? safePct(0),
        detail: topDriver?.label ?? 'No active driver',
      },
      {
        label: 'Modelled band',
        value: safeBand(segment?.crossPropertyCashBand),
      },
    ],
    visual,
    links: [{ label: 'Open leakage', href: '/leakage' }],
  });
}

function buildPersonaResponse(context: Partial<ChatAssistantContext>): ChatAssistantResponse {
  const segment = getSelectedSegment(context);
  const personas = getSelectedPersonas(context, segment);
  const topPersona = personas[0];

  return makeResponse({
    id: `chat-persona-${safeText(topPersona?.id, safeText(segment?.id, 'none'))}`,
    intent: 'persona',
    title: 'Persona opportunity ranking',
    answer: topPersona
      ? `Persona evidence ranks ${personaName(topPersona)} first for ${segmentName(segment)}, with ${safeIndex(topPersona.opportunityIndex)} opportunity, ${safePct(topPersona.readinessScore)} readiness, and ${safeBand(topPersona.crossPropertyCashBand)} modelled headroom.`
      : 'No active Persona evidence is available for the selected segment yet.',
    evidence: [
      {
        label: 'Persona evidence',
        value: topPersona ? safeIndex(topPersona.opportunityIndex) : safeIndex(0),
        detail: topPersona ? personaName(topPersona) : 'No active persona',
      },
      {
        label: 'Modelled band',
        value: safeBand(topPersona?.crossPropertyCashBand),
      },
    ],
    visual: buildPersonaVisual(personas),
    links: [{ label: 'Open activation', href: '/activation' }],
  });
}

function buildActivationResponse(context: Partial<ChatAssistantContext>): ChatAssistantResponse {
  const segment = getSelectedSegment(context);
  const personas = getSelectedPersonas(context, segment);
  const topPersona = personas[0];
  const primaryPlay = segment?.recommendedPlays?.[0];

  return makeResponse({
    id: `chat-activation-${safeText(topPersona?.id, safeText(segment?.id, 'none'))}`,
    intent: 'activation',
    title: 'Activation next move',
    answer: topPersona
      ? `Activation should start with ${personaName(topPersona)} using ${safeText(primaryPlay?.title, 'the selected recommended play')}. The CDE-safe handoff is ${safeIndex(topPersona.opportunityIndex)} opportunity and ${safeBand(topPersona.crossPropertyCashBand)} modelled headroom.`
      : 'Activation has no active persona queue yet, so the next move is to select a populated segment and rebuild the audience list.',
    evidence: [
      {
        label: 'Activation priority',
        value: topPersona ? safeIndex(topPersona.opportunityIndex) : safeIndex(0),
        detail: topPersona ? personaName(topPersona) : 'No active persona',
      },
      {
        label: 'Modelled band',
        value: safeBand(topPersona?.crossPropertyCashBand),
      },
    ],
    visual: buildPersonaVisual(personas),
    links: [
      { label: 'Open activation', href: '/activation' },
      { label: 'Open propensity', href: '/propensity' },
    ],
  });
}

function buildMethodologyResponse(context: Partial<ChatAssistantContext>): ChatAssistantResponse {
  return makeResponse({
    id: 'chat-methodology-cde-safety',
    intent: 'methodology',
    title: 'CDE-safe methodology',
    answer: `The assistant does not expose raw spend. It summarizes Mastercard CDE enrichment as indices, percentages, and modelled bands such as ${FALLBACK_BAND}.`,
    evidence: [
      {
        label: 'Matched coverage',
        value: safePct(context.methodology?.matchedCoveragePct),
      },
      {
        label: 'Value forms',
        value: 'Indices, percentages, modelled bands',
      },
      {
        label: 'Refresh',
        value: safeText(context.methodology?.refresh, 'quarterly'),
        detail: safeText(context.methodology?.basis, 'demi-decile average'),
      },
    ],
    visual: emptyVisual(),
    links: [],
  });
}

function buildFallbackResponse(): ChatAssistantResponse {
  return makeResponse({
    id: 'chat-fallback',
    intent: 'fallback',
    title: 'Ask a CDE-safe question',
    answer: 'I can answer deterministic questions about leakage, personas, activation, segments, overview, or methodology using only CDE-safe values.',
    evidence: [],
    visual: emptyVisual(),
    links: [],
  });
}

export function buildChatAssistantResponse(question: string, context: Partial<ChatAssistantContext> = {}): ChatAssistantResponse {
  const intent = classifyIntent(question);
  const semanticResponse = buildSemanticResponse(question, context, intent);

  if (semanticResponse) return semanticResponse;

  switch (intent) {
    case 'overview':
      return buildOverviewResponse(context);
    case 'segment':
      return buildSegmentResponse(context);
    case 'leakage':
      return buildLeakageResponse(context);
    case 'persona':
      return buildPersonaResponse(context);
    case 'activation':
      return buildActivationResponse(context);
    case 'methodology':
      return buildMethodologyResponse(context);
    case 'fallback':
    default:
      return buildFallbackResponse();
  }
}
