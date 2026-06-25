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

export type ChatAssistantVisualKind = 'bar-list' | 'none';

export interface ChatVisualItem {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  detail?: string;
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
  segments?: Segment[];
  selectedSegmentId?: string;
  personas?: SegmentPersona[];
  selectedPersonaId?: string;
}

const DEFAULT_SUGGESTIONS = [
  'Which segment has the largest leakage gap?',
  'Which persona should we target first?',
  'What should activation do next?',
] as const;

const FALLBACK_BAND = 'Indexed band equiv./mo';
const bannedCurrencyPattern = /\b(?:MOP|HKD)\b|\$|元|澳門幣/i;

function finiteNumber(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || bannedCurrencyPattern.test(trimmed)) return fallback;
  return trimmed;
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

function getSegments(context: ChatAssistantContext): Segment[] {
  return (context.segments ?? []).filter((segment): segment is Segment => Boolean(segment));
}

function getPersonas(context: ChatAssistantContext): SegmentPersona[] {
  return (context.personas ?? []).filter((persona): persona is SegmentPersona => Boolean(persona));
}

function sortByOpportunity<T extends { id: string; opportunityIndex: number }>(items: T[]): T[] {
  return [...items].sort((first, second) => {
    const delta = finiteNumber(second.opportunityIndex) - finiteNumber(first.opportunityIndex);
    if (delta !== 0) return delta;
    return first.id.localeCompare(second.id);
  });
}

function getSelectedSegment(context: ChatAssistantContext): Segment | undefined {
  const segments = getSegments(context);
  const explicit = segments.find((segment) => segment.id === context.selectedSegmentId);
  return explicit ?? sortByOpportunity(segments)[0];
}

function getSelectedPersonas(context: ChatAssistantContext, selectedSegment?: Segment): SegmentPersona[] {
  const personas = getPersonas(context);
  const selectedPersona = personas.find((persona) => persona.id === context.selectedPersonaId);
  const scopedPersonas = selectedSegment
    ? personas.filter((persona) => persona.segmentId === selectedSegment.id)
    : personas;
  const candidates = selectedPersona ? [selectedPersona, ...scopedPersonas.filter((persona) => persona.id !== selectedPersona.id)] : scopedPersonas;

  return sortByOpportunity(candidates);
}

function classifyIntent(question: string): ChatAssistantIntent {
  const normalized = normalizeQuestion(question);

  if (!normalized) return 'fallback';
  if (/\b(methodology|raw|exact|spend|source|calculate|calculated|modelled|modeled|basis)\b/.test(normalized)) {
    return 'methodology';
  }
  if (/\b(leak|leakage|gap|outside|recapture|wallet)\b/.test(normalized)) return 'leakage';
  if (/\b(persona|personas|audience|target first|target)\b/.test(normalized)) return 'persona';
  if (/\b(activation|activate|campaign|offer|next)\b/.test(normalized)) return 'activation';
  if (/\b(segment|opportunity|headroom)\b/.test(normalized)) return 'segment';
  if (/\b(overview|summary|portfolio|executive)\b/.test(normalized)) return 'overview';

  return 'fallback';
}

function emptyVisual(kind: ChatAssistantVisualKind = 'none', title = 'No visual data'): ChatAssistantVisual {
  return {
    kind,
    title,
    items: [],
  };
}

function makeResponse(input: Omit<ChatAssistantResponse, 'suggestedQuestions'>): ChatAssistantResponse {
  return {
    ...input,
    suggestedQuestions: [...DEFAULT_SUGGESTIONS],
  };
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
      detail: `${safeIndex(driver.walletIndex)} wallet intensity`,
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
      detail: `${safePct(persona.readinessScore)} readiness`,
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
        detail: `${safePct(segment.metrics?.shareOfWallet)} Galaxy capture`,
      })),
  };
}

function buildOverviewResponse(context: ChatAssistantContext): ChatAssistantResponse {
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

function buildSegmentResponse(context: ChatAssistantContext): ChatAssistantResponse {
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

function buildLeakageResponse(context: ChatAssistantContext): ChatAssistantResponse {
  const segment = getSelectedSegment(context);
  const visual = buildLeakageVisual(segment);
  const topDriver = visual.items[0];
  const name = segmentName(segment);

  return makeResponse({
    id: `chat-leakage-${safeText(segment?.id, 'none')}`,
    intent: 'leakage',
    title: 'Leakage driver ranking',
    answer: segment && topDriver
      ? `Mastercard CDE ranks ${topDriver.label} as the largest leakage driver for ${name}, with ${topDriver.formattedValue} leakage, ${topDriver.detail}, and ${safeBand(segment.crossPropertyCashBand)} modelled headroom.`
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

function buildPersonaResponse(context: ChatAssistantContext): ChatAssistantResponse {
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

function buildActivationResponse(context: ChatAssistantContext): ChatAssistantResponse {
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

function buildMethodologyResponse(context: ChatAssistantContext): ChatAssistantResponse {
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

export function buildChatAssistantResponse(question: string, context: ChatAssistantContext = {}): ChatAssistantResponse {
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
