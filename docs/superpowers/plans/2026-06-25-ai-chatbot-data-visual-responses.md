# AI Chatbot Data Visual Responses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bottom-right AI-style chatbot assistant that answers user questions about Galaxy + Mastercard CDE data with deterministic narrative and compact visual responses.

**Architecture:** Build a local, deterministic assistant engine that converts user questions into response objects containing answer text, CDE evidence, mini visual data, and route links. Render it as a persistent bottom-right floating icon and slide-up panel in `AppShell`, using the existing app state and synthetic CDE data without backend calls or API keys. Keep all enriched values CDE-compliant by emitting only percentages, indices, and `equiv./mo` bands.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind, Lucide React, existing data utilities, Vitest, Testing Library, Playwright.

---

## Scope And Constraints

- The assistant is a demo-safe “AI-style insight assistant”, not a live LLM.
- No new dependencies.
- No backend route, no API key, no network request.
- The assistant must be available on all current routes through `AppShell`.
- CDE-enriched answers must never emit `HKD`, `MOP`, `$`, `元`, or exact raw spend values.
- Visual responses must be compact enough for a bottom-right panel and must not overlap app navigation or footer content.
- Activation offer terms may still contain `MOP` only in existing activation cards; the assistant must not output `MOP`.
- The first implementation supports these intents:
  - portfolio overview
  - top segment opportunity
  - leakage drivers
  - persona opportunity
  - next activation action
  - methodology/compliance
  - fallback clarification

---

## File Structure

- Create `src/lib/chat-assistant.ts`
  - Pure deterministic answer engine.
  - Exports response types and `buildChatAssistantResponse(question, context)`.
  - Uses existing `Segment`, `Methodology`, `personaRecords`, `buildPortfolioInsightNarrative`, and `buildLeakageDrivers`.

- Create `src/lib/chat-assistant.test.ts`
  - Unit tests for intent routing, deterministic copy, visual payloads, empty data handling, and banned currency prevention.

- Create `src/components/assistant/chat-response-visual.tsx`
  - Pure presentational component for compact bar-list and metric-strip visual responses.

- Create `src/components/assistant/chat-assistant-panel.tsx`
  - Stateful chat panel with message history, prompt input, suggested prompts, close/minimize behavior, and generated response rendering.

- Create `src/components/assistant/chat-assistant-launcher.tsx`
  - Bottom-right floating icon button using Lucide icons.
  - Reads `useAppState()` and passes current data into `ChatAssistantPanel`.

- Create `src/components/assistant/chat-assistant-launcher.test.tsx`
  - Component tests for open/close, suggested prompts, typed questions, visual response rendering, and compliance-safe output.

- Modify `src/components/shell/app-shell.tsx`
  - Mount `<ChatAssistantLauncher />` once inside the root shell.

- Create `src/components/shell/app-shell.test.tsx`
  - Verifies the shell owns the persistent assistant launcher without creating extra main landmarks.

- Modify `e2e/compliance.spec.ts`
  - Add route-level rendered checks that opening the assistant on `/segments` preserves methodology text and avoids banned currency.

---

## Task 1: Deterministic Assistant Engine

**Files:**
- Create: `src/lib/chat-assistant.ts`
- Create: `src/lib/chat-assistant.test.ts`

- [ ] **Step 1: Write failing tests for response generation**

Create `src/lib/chat-assistant.test.ts` with this content:

```ts
import { describe, expect, it } from 'vitest';
import { latestSegments, methodology, personaRecords, type Segment } from '@/data';
import { buildChatAssistantResponse } from './chat-assistant';

const bannedCurrencyPattern = /\b(?:HKD|MOP)\b|\$|元|澳門幣/i;

describe('chat assistant response engine', () => {
  it('answers leakage questions with ranked bar visual data', () => {
    const response = buildChatAssistantResponse('Which segment has the biggest leakage opportunity?', {
      segments: latestSegments,
      selectedSegment: latestSegments[0],
      personas: personaRecords,
      methodology,
    });

    expect(response.intent).toBe('leakage');
    expect(response.title).toMatch(/leakage/i);
    expect(response.visual.kind).toBe('bar-list');
    expect(response.visual.items.length).toBeGreaterThanOrEqual(3);
    expect(response.visual.items[0].value).toBeGreaterThanOrEqual(response.visual.items[1].value);
    expect(response.answer).toMatch(/Mastercard CDE/i);
    expect(response.links.some((link) => link.href === '/leakage')).toBe(true);
  });

  it('answers persona questions with persona visual data and activation link', () => {
    const response = buildChatAssistantResponse('Which persona should we target first?', {
      segments: latestSegments,
      selectedSegment: latestSegments[0],
      personas: personaRecords,
      methodology,
    });

    expect(response.intent).toBe('persona');
    expect(response.visual.kind).toBe('bar-list');
    expect(response.answer).toMatch(/persona/i);
    expect(response.evidence.some((item) => item.label === 'Persona')).toBe(true);
    expect(response.links.some((link) => link.href === '/activation')).toBe(true);
  });

  it('answers methodology questions without route recommendations', () => {
    const response = buildChatAssistantResponse('Can I show raw spend values?', {
      segments: latestSegments,
      selectedSegment: latestSegments[0],
      personas: personaRecords,
      methodology,
    });

    expect(response.intent).toBe('methodology');
    expect(response.answer).toMatch(/indices, percentages, and modelled bands/i);
    expect(response.links).toEqual([]);
  });

  it('returns a stable fallback for unclear questions', () => {
    const response = buildChatAssistantResponse('hello', {
      segments: latestSegments,
      selectedSegment: latestSegments[0],
      personas: personaRecords,
      methodology,
    });

    expect(response.intent).toBe('fallback');
    expect(response.suggestedQuestions).toContain('Which segment has the largest leakage gap?');
  });

  it('handles empty segments without NaN, Infinity, or crashes', () => {
    const response = buildChatAssistantResponse('show overview', {
      segments: [],
      selectedSegment: undefined,
      personas: [],
      methodology,
    });

    const serialized = JSON.stringify(response);
    expect(serialized).not.toMatch(/NaN|Infinity/);
    expect(response.visual.items).toEqual([]);
  });

  it('never emits banned currency patterns for assistant responses', () => {
    const malformedSegment = {
      ...latestSegments[0],
      crossPropertyCashBand: 'HKD $5000 monthly',
    } as Segment;

    const response = buildChatAssistantResponse('show leakage', {
      segments: [malformedSegment],
      selectedSegment: malformedSegment,
      personas: personaRecords,
      methodology,
    });

    expect(JSON.stringify(response)).not.toMatch(bannedCurrencyPattern);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -- src/lib/chat-assistant.test.ts
```

Expected: FAIL because `src/lib/chat-assistant.ts` does not exist.

- [ ] **Step 3: Implement the assistant engine**

Create `src/lib/chat-assistant.ts` with this content:

```ts
import {
  type Methodology,
  type Segment,
  type SegmentPersona,
} from '@/data';
import { buildLeakageDrivers, buildPortfolioInsightNarrative } from './insights';
import { formatEnriched } from './format';

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
}

export interface ChatAssistantLink {
  href: '/' | '/segments' | '/leakage' | '/activation' | '/propensity';
  label: string;
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
  segments: Segment[];
  selectedSegment?: Segment;
  personas: SegmentPersona[];
  methodology?: Methodology;
}

const DEFAULT_SUGGESTIONS = [
  'Which segment has the largest leakage gap?',
  'Which persona should we target first?',
  'What should activation do next?',
];

const bannedCurrencyPattern = /(MOP|HKD|\$|元|澳門幣)/i;

function normalizeQuestion(question: string) {
  return question.trim().toLowerCase();
}

function finiteValue(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeBand(value: unknown) {
  if (typeof value !== 'string' || bannedCurrencyPattern.test(value)) return 'Indexed band equiv./mo';

  try {
    return formatEnriched(value, 'band');
  } catch {
    return 'Indexed band equiv./mo';
  }
}

function pct(value: number | undefined) {
  return formatEnriched(finiteValue(value), 'pct');
}

function indexValue(value: number | undefined) {
  return formatEnriched(finiteValue(value), 'index');
}

function scoreSegments(segments: Segment[]) {
  return [...segments].sort((left, right) => (
    finiteValue(right.opportunityIndex) - finiteValue(left.opportunityIndex)
  ));
}

function scorePersonas(personas: SegmentPersona[], segmentId?: string) {
  return personas
    .filter((persona) => !segmentId || persona.segmentId === segmentId)
    .sort((left, right) => finiteValue(right.opportunityIndex) - finiteValue(left.opportunityIndex));
}

function detectIntent(question: string): ChatAssistantIntent {
  const normalized = normalizeQuestion(question);

  if (/method|compliance|raw|spend|currency|cde rule|data rule/.test(normalized)) return 'methodology';
  if (/persona|target first|audience/.test(normalized)) return 'persona';
  if (/activation|campaign|next action|recommend|offer/.test(normalized)) return 'activation';
  if (/leak|gap|outside|competitor|recapture/.test(normalized)) return 'leakage';
  if (/segment|guest group|customer group/.test(normalized)) return 'segment';
  if (/overview|summary|what happened|headline|executive/.test(normalized)) return 'overview';

  return 'fallback';
}

function emptyVisual(kind: ChatAssistantVisualKind, title: string): ChatAssistantVisual {
  return { kind, title, items: [] };
}

function buildOverviewResponse(context: ChatAssistantContext): ChatAssistantResponse {
  const narrative = buildPortfolioInsightNarrative(context.segments, context.methodology);
  const rankedSegments = scoreSegments(context.segments).slice(0, 3);
  const topSegment = rankedSegments[0];

  return {
    id: 'assistant-overview',
    intent: 'overview',
    title: 'Generated assistant overview',
    answer: narrative.summary,
    evidence: [
      { label: 'Matched coverage', value: pct(context.methodology?.matchedCoveragePct) },
      { label: 'Top segment', value: topSegment?.name ?? 'No active segment' },
      { label: 'Top opportunity', value: indexValue(topSegment?.opportunityIndex) },
    ],
    visual: {
      kind: 'bar-list',
      title: 'Top opportunity segments',
      items: rankedSegments.map((segment) => ({
        label: segment.name,
        value: finiteValue(segment.opportunityIndex),
        formattedValue: indexValue(segment.opportunityIndex),
        description: segment.signatureTrait,
      })),
    },
    links: [{ href: '/segments', label: 'Open segments' }],
    suggestedQuestions: DEFAULT_SUGGESTIONS,
  };
}

function buildSegmentResponse(context: ChatAssistantContext): ChatAssistantResponse {
  const segment = context.selectedSegment ?? scoreSegments(context.segments)[0];

  return {
    id: 'assistant-segment',
    intent: 'segment',
    title: 'Selected segment readout',
    answer: segment
      ? `${segment.name} combines Galaxy first-party behavior with Mastercard CDE enrichment. The strongest executive read is ${indexValue(segment.opportunityIndex)} opportunity, ${pct(segment.metrics.shareOfVisits)} share of visits, and ${safeBand(segment.crossPropertyCashBand)} cross-property cash headroom.`
      : 'No active segment is available for this quarter. Select a populated quarter to generate a segment readout.',
    evidence: [
      { label: 'Segment', value: segment?.name ?? 'No active segment' },
      { label: 'Opportunity', value: indexValue(segment?.opportunityIndex) },
      { label: 'Cross-property cash', value: safeBand(segment?.crossPropertyCashBand) },
    ],
    visual: {
      kind: 'metric-strip',
      title: 'Current segment signals',
      items: segment ? [
        {
          label: 'Wallet capture',
          value: finiteValue(segment.metrics.shareOfWallet),
          formattedValue: pct(segment.metrics.shareOfWallet),
          description: 'Galaxy share of wallet signal',
        },
        {
          label: 'Visit share',
          value: finiteValue(segment.metrics.shareOfVisits),
          formattedValue: pct(segment.metrics.shareOfVisits),
          description: 'Galaxy observed visit signal',
        },
        {
          label: 'Opportunity',
          value: finiteValue(segment.opportunityIndex),
          formattedValue: indexValue(segment.opportunityIndex),
          description: 'Joined opportunity score',
        },
      ] : [],
    },
    links: [{ href: '/segments', label: 'Open segment detail' }],
    suggestedQuestions: DEFAULT_SUGGESTIONS,
  };
}

function buildLeakageResponse(context: ChatAssistantContext): ChatAssistantResponse {
  const segment = context.selectedSegment ?? scoreSegments(context.segments)[0];
  const drivers = buildLeakageDrivers(segment).slice(0, 4);
  const topDriver = drivers[0];

  return {
    id: 'assistant-leakage',
    intent: 'leakage',
    title: 'Leakage opportunity answer',
    answer: segment && topDriver
      ? `${segment.name} has the clearest current leakage story. Mastercard CDE points to ${pct(topDriver.leakagePct)} ${topDriver.label} leakage with ${indexValue(topDriver.walletIndex)} wallet intensity, making it the first recapture lane to validate.`
      : 'No active leakage driver is available for this quarter.',
    evidence: [
      { label: 'Segment', value: segment?.name ?? 'No active segment' },
      { label: 'Primary leakage', value: topDriver ? pct(topDriver.leakagePct) : '0%' },
      { label: 'Wallet intensity', value: topDriver ? indexValue(topDriver.walletIndex) : 'Index 0' },
    ],
    visual: {
      kind: 'bar-list',
      title: 'Leakage drivers',
      items: drivers.map((driver) => ({
        label: driver.label,
        value: finiteValue(driver.score),
        formattedValue: pct(driver.leakagePct),
        description: `${indexValue(driver.walletIndex)} wallet intensity`,
      })),
    },
    links: [{ href: '/leakage', label: 'Open leakage' }],
    suggestedQuestions: DEFAULT_SUGGESTIONS,
  };
}

function buildPersonaResponse(context: ChatAssistantContext): ChatAssistantResponse {
  const segmentId = context.selectedSegment?.id;
  const personas = scorePersonas(context.personas, segmentId).slice(0, 3);
  const topPersona = personas[0];

  return {
    id: 'assistant-persona',
    intent: 'persona',
    title: 'Persona targeting answer',
    answer: topPersona
      ? `${topPersona.name} should be the first persona to inspect because it combines ${indexValue(topPersona.opportunityIndex)} opportunity, ${pct(topPersona.leakagePct)} leakage, and readiness ${pct(topPersona.readinessScore)}. The recommendation is ${topPersona.recommendations[0]?.title ?? 'build a focused activation audience'}.`
      : 'No persona is available for the selected segment. Choose another segment or reset persona filters.',
    evidence: [
      { label: 'Persona', value: topPersona?.name ?? 'No active persona' },
      { label: 'Opportunity', value: indexValue(topPersona?.opportunityIndex) },
      { label: 'Readiness', value: pct(topPersona?.readinessScore) },
    ],
    visual: {
      kind: 'bar-list',
      title: 'Top personas',
      items: personas.map((persona) => ({
        label: persona.name,
        value: finiteValue(persona.opportunityIndex),
        formattedValue: indexValue(persona.opportunityIndex),
        description: `${persona.walletGap} · ${pct(persona.readinessScore)} readiness`,
      })),
    },
    links: [
      { href: '/segments', label: 'Open persona explorer' },
      { href: '/activation', label: 'Build activation audience' },
    ],
    suggestedQuestions: DEFAULT_SUGGESTIONS,
  };
}

function buildActivationResponse(context: ChatAssistantContext): ChatAssistantResponse {
  const segment = context.selectedSegment ?? scoreSegments(context.segments)[0];
  const primaryPlay = segment?.recommendedPlays[0];

  return {
    id: 'assistant-activation',
    intent: 'activation',
    title: 'Activation recommendation',
    answer: segment && primaryPlay
      ? `Move ${segment.name} into activation with ${primaryPlay.title}. The reason is ${primaryPlay.rationale} This keeps the recommendation tied to CDE indices and bands rather than raw spend.`
      : 'No activation play is available for the selected segment.',
    evidence: [
      { label: 'Segment', value: segment?.name ?? 'No active segment' },
      { label: 'Lever', value: primaryPlay?.lever ?? 'No active lever' },
      { label: 'Opportunity', value: indexValue(segment?.opportunityIndex) },
    ],
    visual: {
      kind: 'metric-strip',
      title: 'Activation signals',
      items: segment ? [
        {
          label: 'Luxury hotel',
          value: finiteValue(segment.propensities.luxuryHotelSpender),
          formattedValue: segment.propensities.luxuryHotelSpender.toFixed(2),
          description: 'Propensity score',
        },
        {
          label: 'Rewards',
          value: finiteValue(segment.propensities.topTierRewards),
          formattedValue: segment.propensities.topTierRewards.toFixed(2),
          description: 'Propensity score',
        },
        {
          label: 'Look-alike',
          value: finiteValue(segment.propensities.coBrandLookAlike),
          formattedValue: segment.propensities.coBrandLookAlike.toFixed(2),
          description: 'Propensity score',
        },
      ] : [],
    },
    links: [{ href: '/activation', label: 'Open activation' }],
    suggestedQuestions: DEFAULT_SUGGESTIONS,
  };
}

function buildMethodologyResponse(context: ChatAssistantContext): ChatAssistantResponse {
  return {
    id: 'assistant-methodology',
    intent: 'methodology',
    title: 'CDE methodology guardrail',
    answer: `Use indices, percentages, and modelled bands only. This demo should describe Mastercard CDE-enriched wallet values as CDE-compliant signals, never as raw spend or exact currency. Matched coverage is ${pct(context.methodology?.matchedCoveragePct)} and the active metric count is ${context.methodology?.activeMetricCount ?? 7}.`,
    evidence: [
      { label: 'Allowed', value: 'Indices, percentages, equiv./mo bands' },
      { label: 'Refresh', value: context.methodology?.refresh ?? 'quarterly' },
      { label: 'Basis', value: context.methodology?.basis ?? 'demi-decile average' },
    ],
    visual: {
      kind: 'metric-strip',
      title: 'Methodology signals',
      items: [
        {
          label: 'Coverage',
          value: finiteValue(context.methodology?.matchedCoveragePct),
          formattedValue: pct(context.methodology?.matchedCoveragePct),
          description: 'Matched coverage',
        },
        {
          label: 'Metrics',
          value: finiteValue(context.methodology?.activeMetricCount, 7),
          formattedValue: String(context.methodology?.activeMetricCount ?? 7),
          description: 'Active CDE metrics',
        },
      ],
    },
    links: [],
    suggestedQuestions: DEFAULT_SUGGESTIONS,
  };
}

function buildFallbackResponse(): ChatAssistantResponse {
  return {
    id: 'assistant-fallback',
    intent: 'fallback',
    title: 'Ask a Galaxy wallet question',
    answer: 'I can answer questions about segment opportunity, leakage drivers, personas, activation actions, and CDE methodology using the current demo data.',
    evidence: [
      { label: 'Try', value: 'Which segment has the largest leakage gap?' },
      { label: 'Try', value: 'Which persona should we target first?' },
    ],
    visual: emptyVisual('metric-strip', 'Suggested question areas'),
    links: [],
    suggestedQuestions: DEFAULT_SUGGESTIONS,
  };
}

export function buildChatAssistantResponse(
  question: string,
  context: ChatAssistantContext,
): ChatAssistantResponse {
  const intent = detectIntent(question);

  if (intent === 'overview') return buildOverviewResponse(context);
  if (intent === 'segment') return buildSegmentResponse(context);
  if (intent === 'leakage') return buildLeakageResponse(context);
  if (intent === 'persona') return buildPersonaResponse(context);
  if (intent === 'activation') return buildActivationResponse(context);
  if (intent === 'methodology') return buildMethodologyResponse(context);

  return buildFallbackResponse();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm run test -- src/lib/chat-assistant.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/chat-assistant.ts src/lib/chat-assistant.test.ts
git commit -m "Add deterministic chat assistant engine"
```

---

## Task 2: Chat Response Visual Component

**Files:**
- Create: `src/components/assistant/chat-response-visual.tsx`
- Create: `src/components/assistant/chat-response-visual.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `src/components/assistant/chat-response-visual.test.tsx` with this content:

```tsx
import { render, screen, within } from '@testing-library/react';
import { ChatResponseVisual } from './chat-response-visual';
import type { ChatAssistantVisual } from '@/lib/chat-assistant';

describe('ChatResponseVisual', () => {
  it('renders a compact ranked bar list', () => {
    const visual: ChatAssistantVisual = {
      kind: 'bar-list',
      title: 'Leakage drivers',
      items: [
        {
          label: 'luxury retail',
          value: 1200,
          formattedValue: '42%',
          description: 'Index 197 wallet intensity',
        },
        {
          label: 'F&B',
          value: 900,
          formattedValue: '31%',
          description: 'Index 160 wallet intensity',
        },
      ],
    };

    render(<ChatResponseVisual visual={visual} />);

    expect(screen.getByRole('figure', { name: 'Leakage drivers' })).toBeInTheDocument();
    expect(screen.getByText('luxury retail')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByLabelText('luxury retail visual bar')).toHaveStyle({ width: '100%' });
  });

  it('renders a metric strip for small evidence sets', () => {
    const visual: ChatAssistantVisual = {
      kind: 'metric-strip',
      title: 'Activation signals',
      items: [
        {
          label: 'Luxury hotel',
          value: 0.9,
          formattedValue: '0.90',
          description: 'Propensity score',
        },
      ],
    };

    render(<ChatResponseVisual visual={visual} />);

    const figure = screen.getByRole('figure', { name: 'Activation signals' });
    expect(within(figure).getByText('Luxury hotel')).toBeInTheDocument();
    expect(within(figure).getByText('0.90')).toBeInTheDocument();
  });

  it('renders an empty visual state without crashing', () => {
    render(<ChatResponseVisual visual={{ kind: 'bar-list', title: 'No data', items: [] }} />);

    expect(screen.getByText('No visual data available for this answer.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -- src/components/assistant/chat-response-visual.test.tsx
```

Expected: FAIL because `ChatResponseVisual` does not exist.

- [ ] **Step 3: Implement `ChatResponseVisual`**

Create `src/components/assistant/chat-response-visual.tsx` with this content:

```tsx
import { CdeChip } from '@/components/ui/cde-chip';
import type { ChatAssistantVisual } from '@/lib/chat-assistant';

function widthFor(value: number, maxValue: number) {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) return '6%';
  return `${Math.max(6, Math.round((value / maxValue) * 100))}%`;
}

export function ChatResponseVisual({ visual }: { visual: ChatAssistantVisual }) {
  const maxValue = Math.max(0, ...visual.items.map((item) => item.value));

  return (
    <figure
      aria-label={visual.title}
      className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3"
    >
      <figcaption className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
        <span>{visual.title}</span>
        <CdeChip />
      </figcaption>

      {visual.items.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-galaxy-muted">
          No visual data available for this answer.
        </p>
      ) : visual.kind === 'bar-list' ? (
        <div className="mt-4 space-y-3">
          {visual.items.map((item) => (
            <div key={`${item.label}-${item.formattedValue}`}>
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="font-semibold text-galaxy-cream">{item.label}</span>
                <span className="font-semibold text-galaxy-gold">{item.formattedValue}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-galaxy-charcoal">
                <div
                  aria-label={`${item.label} visual bar`}
                  className="h-full rounded-full bg-galaxy-gold"
                  style={{ width: widthFor(item.value, maxValue) }}
                />
              </div>
              <p className="mt-1 text-xs leading-5 text-galaxy-muted">{item.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {visual.items.map((item) => (
            <div
              key={`${item.label}-${item.formattedValue}`}
              className="rounded border border-galaxy-border bg-galaxy-charcoal/55 px-3 py-2"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-galaxy-gold">{item.formattedValue}</p>
              <p className="mt-1 text-xs leading-5 text-galaxy-muted">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm run test -- src/components/assistant/chat-response-visual.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/components/assistant/chat-response-visual.tsx src/components/assistant/chat-response-visual.test.tsx
git commit -m "Add assistant visual response component"
```

---

## Task 3: Floating Chat Assistant UI

**Files:**
- Create: `src/components/assistant/chat-assistant-panel.tsx`
- Create: `src/components/assistant/chat-assistant-launcher.tsx`
- Create: `src/components/assistant/chat-assistant-launcher.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Create `src/components/assistant/chat-assistant-launcher.test.tsx` with this content:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology, quarters } from '@/data';
import { useAppState } from '@/store/app-store';
import { ChatAssistantLauncher } from './chat-assistant-launcher';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();

  return {
    ...actual,
    useAppState: vi.fn(),
  };
});

function mockAppState() {
  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments: latestSegments,
    selectedSegment: latestSegments[0],
    selectedSegmentId: latestSegments[0].id,
    setSelectedSegmentId: vi.fn(),
    methodology,
    filters: {
      segmentIds: latestSegments.map((segment) => segment.id),
      channel: 'all',
      minPropensity: 0,
    },
    setFilters: vi.fn(),
    savedAudiences: [],
    saveAudience: vi.fn(),
    removeSavedAudience: vi.fn(),
    campaignToast: null,
    pushCampaign: vi.fn(),
    clearCampaignToast: vi.fn(),
  });
}

const bannedCurrencyPattern = /\b(?:HKD|MOP)\b|\$|元|澳門幣/i;

describe('ChatAssistantLauncher', () => {
  beforeEach(() => {
    mockAppState();
  });

  it('opens and closes from the fixed AI icon button', () => {
    render(<ChatAssistantLauncher />);

    expect(screen.getByRole('button', { name: 'Open AI insight assistant' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'AI insight assistant' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open AI insight assistant' }));

    expect(screen.getByRole('dialog', { name: 'AI insight assistant' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close AI insight assistant' }));

    expect(screen.queryByRole('dialog', { name: 'AI insight assistant' })).not.toBeInTheDocument();
  });

  it('submits a typed question and renders visual evidence', () => {
    render(<ChatAssistantLauncher />);

    fireEvent.click(screen.getByRole('button', { name: 'Open AI insight assistant' }));
    fireEvent.change(screen.getByPlaceholderText('Ask about leakage, personas, activation, or CDE rules'), {
      target: { value: 'Which segment has the biggest leakage opportunity?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question' }));

    const dialog = screen.getByRole('dialog', { name: 'AI insight assistant' });
    expect(within(dialog).getByText(/Leakage opportunity answer/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('figure', { name: 'Leakage drivers' })).toBeInTheDocument();
    expect(within(dialog).getAllByText('CDE').length).toBeGreaterThanOrEqual(1);
    expect(dialog.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('runs a suggested prompt without typing', () => {
    render(<ChatAssistantLauncher />);

    fireEvent.click(screen.getByRole('button', { name: 'Open AI insight assistant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Which persona should we target first?' }));

    expect(screen.getByText(/Persona targeting answer/i)).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: 'Top personas' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -- src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: FAIL because the assistant UI files do not exist.

- [ ] **Step 3: Implement `ChatAssistantPanel`**

Create `src/components/assistant/chat-assistant-panel.tsx` with this content:

```tsx
'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, Send, X } from 'lucide-react';
import { personaRecords } from '@/data';
import {
  buildChatAssistantResponse,
  type ChatAssistantContext,
  type ChatAssistantResponse,
} from '@/lib/chat-assistant';
import { ChatResponseVisual } from './chat-response-visual';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  response?: ChatAssistantResponse;
}

interface ChatAssistantPanelProps {
  context: ChatAssistantContext;
  onClose: () => void;
}

const starterPrompt = 'Which segment has the largest leakage gap?';

export function ChatAssistantPanel({ context, onClose }: ChatAssistantPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const response = buildChatAssistantResponse(starterPrompt, context);

    return [
      {
        id: 'assistant-welcome',
        role: 'assistant',
        text: 'Generated assistant insight',
        response,
      },
    ];
  });
  const messageCounter = useRef(0);
  const suggestions = useMemo(() => messages[messages.length - 1]?.response?.suggestedQuestions ?? [
    starterPrompt,
    'Which persona should we target first?',
    'What should activation do next?',
  ], [messages]);

  function ask(question: string) {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion) return;

    const response = buildChatAssistantResponse(normalizedQuestion, {
      ...context,
      personas: context.personas.length > 0 ? context.personas : personaRecords,
    });
    const nextId = messageCounter.current + 1;
    messageCounter.current = nextId;

    setMessages((current) => [
      ...current,
      {
        id: `user-${nextId}`,
        role: 'user',
        text: normalizedQuestion,
      },
      {
        id: `assistant-${nextId}`,
        role: 'assistant',
        text: 'Generated assistant insight',
        response,
      },
    ]);
    setInput('');
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(input);
  }

  return (
    <section
      role="dialog"
      aria-label="AI insight assistant"
      className="fixed bottom-24 right-4 z-50 flex max-h-[min(42rem,calc(100vh-7rem))] w-[min(calc(100vw-2rem),26rem)] flex-col rounded-lg border border-galaxy-gold/35 bg-galaxy-charcoal shadow-2xl shadow-black/45"
    >
      <header className="flex items-start justify-between gap-3 border-b border-galaxy-border p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-galaxy-gold/50 bg-galaxy-gold/15 text-galaxy-gold">
            <Bot size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-galaxy-cream">AI insight assistant</p>
            <p className="mt-1 text-xs leading-5 text-galaxy-muted">Generated local narrative using demo CDE data.</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close AI insight assistant"
          onClick={onClose}
          className="rounded border border-galaxy-border p-2 text-galaxy-muted transition hover:border-galaxy-gold hover:text-galaxy-gold focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <article
            key={message.id}
            className={message.role === 'user'
              ? 'ml-8 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-3 text-sm leading-6 text-galaxy-cream'
              : 'rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3'}
          >
            {message.role === 'user' ? (
              <p>{message.text}</p>
            ) : message.response ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
                  {message.text}
                </p>
                <h2 className="text-lg font-semibold text-galaxy-cream">{message.response.title}</h2>
                <p className="text-sm leading-6 text-galaxy-muted">{message.response.answer}</p>
                <div className="flex flex-wrap gap-2">
                  {message.response.evidence.map((item) => (
                    <span
                      key={`${message.id}-${item.label}-${item.value}`}
                      className="rounded border border-galaxy-border bg-galaxy-charcoal/70 px-2 py-1 text-xs font-semibold text-galaxy-muted"
                    >
                      <span className="text-galaxy-gold">{item.label}: </span>
                      <span className="text-galaxy-cream">{item.value}</span>
                    </span>
                  ))}
                </div>
                <ChatResponseVisual visual={message.response.visual} />
                {message.response.links.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {message.response.links.map((link) => (
                      <Link
                        key={`${message.id}-${link.href}`}
                        href={link.href}
                        className="rounded border border-galaxy-gold/60 px-3 py-2 text-xs font-semibold text-galaxy-gold transition hover:bg-galaxy-gold hover:text-galaxy-ink focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="border-t border-galaxy-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => ask(suggestion)}
              className="rounded border border-galaxy-border px-2 py-1 text-left text-xs font-semibold text-galaxy-muted transition hover:border-galaxy-gold hover:text-galaxy-gold focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form onSubmit={submitQuestion} className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about leakage, personas, activation, or CDE rules"
            className="min-w-0 flex-1 rounded border border-galaxy-border bg-galaxy-ink px-3 py-2 text-sm text-galaxy-cream outline-none placeholder:text-galaxy-muted focus:border-galaxy-gold"
          />
          <button
            type="submit"
            aria-label="Send question"
            className="inline-flex items-center justify-center rounded border border-galaxy-gold bg-galaxy-gold px-3 py-2 text-galaxy-ink transition hover:bg-galaxy-cream focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `ChatAssistantLauncher`**

Create `src/components/assistant/chat-assistant-launcher.tsx` with this content:

```tsx
'use client';

import { useState } from 'react';
import { Bot, MessageCircle } from 'lucide-react';
import { personaRecords } from '@/data';
import { useAppState } from '@/store/app-store';
import { ChatAssistantPanel } from './chat-assistant-panel';

export function ChatAssistantLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const { methodology, segments, selectedSegment } = useAppState();

  return (
    <>
      <button
        type="button"
        aria-label="Open AI insight assistant"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full border border-galaxy-gold/60 bg-galaxy-gold text-galaxy-ink shadow-2xl shadow-black/40 transition hover:bg-galaxy-cream focus:outline-none focus:ring-2 focus:ring-galaxy-gold focus:ring-offset-2 focus:ring-offset-galaxy-ink"
      >
        <MessageCircle size={23} aria-hidden="true" />
        <Bot size={14} aria-hidden="true" className="absolute right-3 top-3" />
      </button>

      {isOpen ? (
        <ChatAssistantPanel
          context={{
            methodology,
            personas: personaRecords,
            segments,
            selectedSegment,
          }}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm run test -- src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/assistant/chat-assistant-panel.tsx src/components/assistant/chat-assistant-launcher.tsx src/components/assistant/chat-assistant-launcher.test.tsx
git commit -m "Add floating AI insight assistant"
```

---

## Task 4: Shell Integration

**Files:**
- Modify: `src/components/shell/app-shell.tsx`
- Create: `src/components/shell/app-shell.test.tsx`

- [ ] **Step 1: Write failing shell integration test**

Create `src/components/shell/app-shell.test.tsx` with this content:

```tsx
import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('mounts one persistent AI assistant launcher without adding another main landmark', () => {
    render(
      <AppStateProvider>
        <AppShell>
          <section aria-label="test content">Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open AI insight assistant' })).toBeInTheDocument();
    expect(screen.getByLabelText('test content')).toHaveTextContent('Route content');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- src/components/shell/app-shell.test.tsx
```

Expected: FAIL because `AppShell` does not mount `Open AI insight assistant`.

- [ ] **Step 3: Mount the assistant in `AppShell`**

Modify `src/components/shell/app-shell.tsx` so it matches this content:

```tsx
import type { ReactNode } from 'react';
import { ChatAssistantLauncher } from '@/components/assistant/chat-assistant-launcher';
import { MethodologyNote } from '@/components/ui/methodology-note';
import { CoBrandLockup } from './co-brand-lockup';
import { Nav } from './nav';
import { TopBar } from './top-bar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-galaxy-ink text-galaxy-cream">
      <div className="grid min-h-screen lg:grid-cols-[17rem_1fr]">
        <aside className="border-b border-galaxy-border bg-galaxy-charcoal/88 px-5 py-5 lg:border-b-0 lg:border-r">
          <CoBrandLockup />
          <div className="mt-8">
            <Nav />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <TopBar />
          <main className="min-w-0 flex-1 px-5 py-6 md:px-8">{children}</main>
          <footer className="border-t border-galaxy-border px-5 py-4 md:px-8">
            <MethodologyNote />
          </footer>
        </div>
      </div>
      <ChatAssistantLauncher />
    </div>
  );
}
```

- [ ] **Step 4: Run shell and assistant tests**

Run:

```bash
npm run test -- src/components/shell/app-shell.test.tsx src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/components/shell/app-shell.tsx src/components/shell/app-shell.test.tsx
git commit -m "Mount assistant in app shell"
```

---

## Task 5: Rendered Compliance E2E Coverage

**Files:**
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Add assistant e2e assertions**

In `e2e/compliance.spec.ts`, add a new test inside `test.describe('Galaxy Constellation rendered compliance', () => { ... })`, after the route loop and before the viewport tests:

```ts
  test('AI insight assistant answers with CDE-safe visual evidence', async ({ page }) => {
    await page.goto('/segments');

    await page.getByRole('button', { name: 'Open AI insight assistant' }).click();
    const assistant = page.getByRole('dialog', { name: 'AI insight assistant' });

    await expect(assistant).toBeVisible();
    await expect(assistant.getByText('Generated assistant insight')).toBeVisible();
    await expect(assistant.getByRole('figure', { name: /Leakage drivers/i })).toBeVisible();

    await assistant.getByPlaceholder('Ask about leakage, personas, activation, or CDE rules').fill('Which persona should we target first?');
    await assistant.getByRole('button', { name: 'Send question' }).click();

    await expect(assistant.getByText(/Persona targeting answer/i)).toBeVisible();
    await expect(assistant.getByRole('figure', { name: 'Top personas' })).toBeVisible();
    await expect(assistant).toContainText('CDE');
    await expect(assistant).not.toContainText('HKD');
    await expect(assistant).not.toContainText('MOP');
    await expect(assistant).not.toContainText('$');
  });
```

- [ ] **Step 2: Run focused e2e test**

Run:

```bash
npm run test:e2e -- e2e/compliance.spec.ts --project=chromium --grep "AI insight assistant"
```

Expected: PASS, 1 test.

- [ ] **Step 3: Commit**

Run:

```bash
git add e2e/compliance.spec.ts
git commit -m "Verify assistant compliance"
```

---

## Task 6: Final Verification And Browser QA

**Files:**
- No source edits expected.

- [ ] **Step 1: Run focused unit and component tests**

Run:

```bash
npm run test -- src/lib/chat-assistant.test.ts src/components/assistant/chat-response-visual.test.tsx src/components/assistant/chat-assistant-launcher.test.tsx src/components/shell/app-shell.test.tsx
```

Expected: PASS. Expected test count is 13 if the prior tasks were implemented exactly.

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run verify
```

Expected: PASS for lint, unit tests, production build, and Playwright e2e tests.

- [ ] **Step 3: Browser sanity check**

Start the dev server only after `npm run verify` finishes:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://127.0.0.1:3000/segments
```

Manual checks:
- The bottom-right circular assistant icon is visible and does not overlap the footer methodology note.
- Clicking the icon opens a panel titled `AI insight assistant`.
- The initial answer includes `Generated assistant insight`, a compact visual, and CDE evidence.
- Asking `Which persona should we target first?` renders `Persona targeting answer` and `Top personas`.
- Asking `Can I show raw spend values?` explains the CDE methodology guardrail.
- The assistant panel does not show `HKD`, `MOP`, `$`, `元`, or `澳門幣`.
- Closing the panel returns to the icon-only state.

- [ ] **Step 4: Commit only if browser QA required a fix**

If browser QA required a source fix, stage only the touched source/test files and commit:

```bash
git add src/components/assistant src/components/shell/app-shell.tsx src/components/shell/app-shell.test.tsx e2e/compliance.spec.ts
git commit -m "Polish assistant browser behavior"
```

If browser QA required no source fix, do not create an empty commit.

---

## Self-Review

**Spec coverage:**
- Bottom-right AI icon: Task 3 implements `ChatAssistantLauncher`.
- Chatbot panel: Task 3 implements `ChatAssistantPanel`.
- User can ask questions: Task 3 form submission and suggested prompts.
- Answers use data: Task 1 builds responses from `segments`, `selectedSegment`, `personaRecords`, and methodology.
- Visual response: Task 2 renders `bar-list` and `metric-strip` visuals; Task 5 verifies rendered figures.
- CDE compliance: Task 1 sanitizes bands and tests banned currency; Task 5 adds rendered compliance assertions.
- Persistent app availability: Task 4 mounts in `AppShell`.

**Placeholder scan:**
- The plan contains no deferred-work markers or unspecified test instructions.
- Every code-creation step includes concrete file contents.
- Every verification step includes exact commands and expected results.

**Type consistency:**
- `ChatAssistantContext`, `ChatAssistantResponse`, `ChatAssistantVisual`, and `ChatAssistantIntent` are defined in Task 1 and reused consistently in Tasks 2 and 3.
- Visual kinds are only `bar-list` and `metric-strip`.
- Route links use only existing routes.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-25-ai-chatbot-data-visual-responses.md`. Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
