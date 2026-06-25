import { type Methodology, type Segment, type SegmentPersona } from '@/data';
import { formatEnriched } from './format';
import { buildLeakageDrivers, buildPortfolioInsightNarrative } from './insights';

export type ChatAssistantIntent =
  | 'overview'
  | 'segment'
  | 'leakage'
  | 'persona'
  | 'activation'
  | 'methodology'
  | 'fallback';

export type ChatAssistantVisualKind = 'bar-list' | 'metric-strip';

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

type ChatAssistantHref = '/' | '/segments' | '/leakage' | '/activation' | '/propensity';

export interface ChatAssistantLink {
  label: string;
  href: ChatAssistantHref;
}

export interface ChatAssistantResponse {
  id: string;
  intent: ChatAssistantIntent;
  title: string;
  answer: string;
  evidence: ChatAssistantEvidence[];
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
}

const DEFAULT_SUGGESTIONS = [
  'Which segment has the largest leakage gap?',
  'Which persona should we target first?',
  'What should activation do next?',
] as const;

const FALLBACK_BAND = 'Indexed band equiv./mo';
const CDE_SAFE_REDACTION = 'CDE-safe value';
const NON_FINITE_REDACTION = 'finite CDE value';
const bannedCurrencyPattern = /MOP|HKD|\$|元|澳門幣/i;
const currencyAmountPattern = /(?:MOP|HKD|\$|元|澳門幣)\s*\$?\s*\d+(?:[.,]\d+)*(?:\s*(?:k|m|monthly|per\s+month|\/mo))?|\d+(?:[.,]\d+)*(?:\s*(?:元|澳門幣))/gi;
const currencyTokenPattern = /MOP|HKD|\$|元|澳門幣/gi;
const nonFiniteTextPattern = /\b(?:NaN|Infinity)\b/gi;

function finiteNumber(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return sanitizeOutputText(trimmed) || fallback;
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

function sanitizeOutputText(value: string): string {
  return value
    .replace(currencyAmountPattern, CDE_SAFE_REDACTION)
    .replace(currencyTokenPattern, CDE_SAFE_REDACTION)
    .replace(nonFiniteTextPattern, NON_FINITE_REDACTION)
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
  const candidates = selectedPersona ? [selectedPersona, ...scopedPersonas.filter((persona) => persona.id !== selectedPersona.id)] : scopedPersonas;

  return sortByOpportunity(candidates);
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
    label: sanitizeOutputText(evidence.label),
    value: sanitizeOutputText(evidence.value),
    detail: evidence.detail ? sanitizeOutputText(evidence.detail) : undefined,
  };
}

function sanitizeVisualItem(item: ChatVisualItem): ChatVisualItem {
  return {
    id: sanitizeOutputText(item.id),
    label: sanitizeOutputText(item.label),
    value: finiteNumber(item.value),
    formattedValue: sanitizeOutputText(item.formattedValue),
    description: sanitizeOutputText(item.description),
  };
}

function sanitizeResponse(response: ChatAssistantResponse): ChatAssistantResponse {
  return {
    id: sanitizeOutputText(response.id),
    intent: response.intent,
    title: sanitizeOutputText(response.title),
    answer: sanitizeOutputText(response.answer),
    evidence: response.evidence.map(sanitizeEvidence),
    visual: {
      kind: response.visual.kind,
      title: sanitizeOutputText(response.visual.title),
      items: response.visual.items.map(sanitizeVisualItem),
    },
    links: response.links.map((link) => ({
      label: sanitizeOutputText(link.label),
      href: link.href,
    })),
    suggestedQuestions: response.suggestedQuestions.map(sanitizeOutputText),
  };
}

function makeResponse(input: Omit<ChatAssistantResponse, 'suggestedQuestions'>): ChatAssistantResponse {
  return sanitizeResponse({
    ...input,
    suggestedQuestions: [...DEFAULT_SUGGESTIONS],
  });
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
