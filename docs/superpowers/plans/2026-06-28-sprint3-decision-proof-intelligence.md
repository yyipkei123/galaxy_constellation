# Galaxy Constellation Sprint 3 Decision Proof Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Sprint 3 so Galaxy Constellation moves from insight display into governed conversational analytics, closed-loop measurement, scenario planning, cross-lens journey intelligence, deeper activation content, and trust/presenter polish.

**Architecture:** Keep the app backend-free and deterministic. Add pure data/calculation modules under `src/data` and `src/lib`, then compose them through existing Next.js app routes, client state in `src/store/app-store.tsx`, Recharts visual components, and the existing shell/navigation system. The assistant remains a governed local agent: it intent-matches questions, queries a semantic layer built from the app's synthetic data, renders reusable visuals, and exposes an audit trail for every figure.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind, Recharts, Lucide, Vitest, Testing Library, Playwright, existing CDE formatter and Galaxy visual system.

---

## Recommended Sprint Cut

Ship in this order:

1. **Task 1 through Task 4:** Governed Ask CDE AI. This is the flagship differentiator and creates reusable semantic-layer foundations.
2. **Task 5 and Task 6:** Measurement and What-if simulator. This closes the loop from recommendation to proof and executive planning.
3. **Task 7 and Task 8:** Cross-lens journey and content launch linkage. This makes the product read as one platform.
4. **Task 9 and Task 10:** Governance polish, haul-label fixes, presenter mode, and final verification.

The plan covers all backlog epics. The default implementation excludes a live LLM route because the backlog says deterministic local agent is the safest live-demo default. A future real-LLM branch can be planned separately after the governed deterministic behavior is complete.

## File Structure

Create or modify these files:

- Create: `src/data/campaigns.ts`
  Owns deterministic synthetic campaigns, weekly test/control series, campaign content language packs, and campaign builder helpers.
- Modify: `src/data/types.ts`
  Adds Sprint 3 types: `MeasurementCampaign`, `CampaignWeeklyPoint`, `CampaignCreativeDraft`, `SavedScenario`, `ScenarioLever`, `ScenarioImpact`, `SemanticFact`, and expands `CorridorHaul` to `short | medium | long`.
- Modify: `src/data/index.ts`
  Exports new campaign and scenario data helpers.
- Create: `src/lib/measurement.ts`
  Pure lift, indexed revenue, iROI, confidence, and test-design calculations.
- Create: `src/lib/scenario-simulator.ts`
  Pure what-if calculations for recapture, channel shift, pitch-now movement, and constellation deltas.
- Create: `src/lib/journey.ts`
  Pure cross-lens journey stage builder from priority corridors, personas, segments, leakage, and activation plays.
- Create: `src/lib/cde-semantic-layer.ts`
  Builds a governed fact layer and query helpers for the assistant. All returned facts must be CDE-safe.
- Modify: `src/lib/chat-assistant.ts`
  Expands intents, starter prompts, audited evidence, and inline visual kinds.
- Modify: `src/components/assistant/chat-response-visual.tsx`
  Renders richer assistant visual types: bars, metric strips, lead cards, corridor cards, line series, and compact fact tables.
- Modify: `src/components/assistant/chat-assistant-panel.tsx`
  Converts the assistant to a full-height grounded analytics panel with starter chips, typing feel, follow-up chips, and "show the data behind this".
- Modify: `src/components/assistant/chat-assistant-launcher.tsx`
  Passes guests, corridors, campaigns, and launch state into the assistant context.
- Create: `src/components/charts/lift-over-time-chart.tsx`
  Recharts line chart for test/control lift.
- Create: `src/components/charts/scenario-impact-constellation.tsx`
  Lightweight responsive visualization for scenario deltas.
- Create: `src/components/panels/test-learn-card.tsx`
  Measurement result card with lift headline, indexed revenue band, iROI, confidence, and test-design strip.
- Modify: `src/components/panels/content-draft-card.tsx`
  Adds multilingual content tabs, A/B variants, guardrails, version history, and launch action.
- Create: `src/components/panels/governance-summary-panel.tsx`
  Reusable methodology/governance panel for `/governance` and assistant audit copy.
- Create: `src/components/shell/presenter-tour.tsx`
  Deterministic guided-tour overlay with route stops and progress.
- Modify: `src/components/shell/nav.tsx`
  Adds `/measurement`, `/simulate`, `/journey`, and `/governance` while preserving horizontal mobile scrolling.
- Modify: `src/components/shell/app-shell.tsx`
  Mounts presenter tour after the assistant launcher.
- Modify: `src/store/app-store.tsx`
  Adds launched campaigns and saved scenarios; keeps all state local and deterministic.
- Create: `src/app/measurement/page.tsx` and `src/app/measurement/page.test.tsx`
  New Wallet lens measurement route.
- Create: `src/app/simulate/page.tsx` and `src/app/simulate/page.test.tsx`
  New scenario simulator route.
- Create: `src/app/journey/page.tsx` and `src/app/journey/page.test.tsx`
  New cross-lens loop route.
- Create: `src/app/governance/page.tsx` and `src/app/governance/page.test.tsx`
  New data governance route.
- Modify: `src/app/acquisition/page.tsx` and `src/app/acquisition/page.test.tsx`
  Wires content launch into measurement.
- Modify: `src/app/activation/page.tsx` and `src/app/activation/page.test.tsx`
  Adds measurement hook from activation exports.
- Modify: `src/app/corridors/page.test.tsx`, `src/app/corridors/[id]/page.test.tsx`, `src/components/charts/corridor-rank-table.tsx`, and `src/components/panels/corridor-detail-panel.tsx`
  Verifies corrected short/medium/long haul labels.
- Modify: `e2e/compliance.spec.ts`
  Adds CDE-safety, methodology, and responsive checks for the new routes and assistant audit trail.

## Shared CDE Rules

All new code must preserve these rules:

- Enriched values can be shown only as percentages, indices, 0-1 propensities, confidence bands, or `equiv./mo` bands.
- Do not introduce `HKD`, `MOP`, `$`, `元`, or raw spend values in CDE-enriched analytics. Existing Galaxy offer terms inside activation cards remain the only allowed exception.
- Guest records remain synthetic and masked.
- Assistant answers must derive numbers from the semantic layer, never from free-form text.
- New visual labels should say `modelled`, `indexed`, `coverage`, or `CDE-safe` where users may otherwise expect exact spend.

---

### Task 1: Sprint 3 Data Contracts, Campaign Seeds, and Store State

**Files:**
- Modify: `src/data/types.ts`
- Create: `src/data/campaigns.ts`
- Modify: `src/data/index.ts`
- Modify: `src/store/app-store.tsx`
- Test: `src/data/campaigns.test.ts`
- Test: `src/store/app-store.test.tsx`

- [ ] **Step 1: Write failing campaign data tests**

Create `src/data/campaigns.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { campaigns, createLaunchedCampaign, getCampaignById } from './campaigns';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('campaign data', () => {
  it('ships deterministic measurement campaigns with computed weekly test/control series', () => {
    expect(campaigns.length).toBeGreaterThanOrEqual(4);
    const luxury = getCampaignById('promenade-luxury-play');

    expect(luxury).toBeDefined();
    expect(luxury?.audienceName).toMatch(/luxury/i);
    expect(luxury?.weeklySeries).toHaveLength(8);
    expect(luxury?.weeklySeries[0]).toEqual(expect.objectContaining({
      week: 'W1',
      testIndex: expect.any(Number),
      controlIndex: expect.any(Number),
    }));
  });

  it('keeps all CDE campaign values free of banned currency tokens', () => {
    expect(JSON.stringify(campaigns)).not.toMatch(bannedCurrencyPattern);
  });

  it('creates a stable launched campaign from route actions', () => {
    const campaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Top leakage segments',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'Michelin-to-boutique retail path',
    });

    expect(campaign.id).toBe('launched-activation-top-leakage-segments');
    expect(campaign.testDesign.holdoutPct).toBeGreaterThanOrEqual(10);
    expect(campaign.testDesign.durationWeeks).toBe(8);
    expect(campaign.weeklySeries).toHaveLength(8);
    expect(JSON.stringify(campaign)).not.toMatch(bannedCurrencyPattern);
  });
});
```

- [ ] **Step 2: Run the failing campaign tests**

Run:

```bash
npm run test -- src/data/campaigns.test.ts
```

Expected: FAIL because `src/data/campaigns.ts` does not exist.

- [ ] **Step 3: Add Sprint 3 type contracts**

In `src/data/types.ts`, add these exports near the existing campaign and guest types:

```ts
export type CorridorHaul = 'short' | 'medium' | 'long';

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

export interface CampaignCreativeDraft {
  id: string;
  campaignId: string;
  corridorId?: CorridorId;
  languages: Array<'EN' | '繁中' | '한국어'>;
  variants: Array<{
    id: 'A' | 'B';
    language: 'EN' | '繁中' | '한국어';
    subject: string;
    body: string;
    guardrail: string;
  }>;
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
  value: string;
  source: string;
  route: string;
}
```

If `CorridorHaul` already exists in the file, replace its union instead of duplicating it.

- [ ] **Step 4: Add deterministic campaign data**

Create `src/data/campaigns.ts`:

```ts
import type {
  CampaignWeeklyPoint,
  CampaignTestDesign,
  CoreCategory,
  MeasurementCampaign,
} from './types';

interface LaunchCampaignInput {
  source: 'activation' | 'acquisition';
  audienceName: string;
  segmentIds: string[];
  lever: string;
  corridorId?: MeasurementCampaign['corridorId'];
}

const defaultTestDesign: CampaignTestDesign = {
  holdoutPct: 15,
  durationWeeks: 8,
  expectedLiftThresholdPct: 8,
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'campaign';
}

function buildSeries(base: number, liftPct: number): CampaignWeeklyPoint[] {
  return Array.from({ length: defaultTestDesign.durationWeeks }, (_, index) => {
    const week = index + 1;
    const controlIndex = Math.round(base + week * 2 + (index % 2));
    const liftRamp = liftPct * ((week + 1) / (defaultTestDesign.durationWeeks + 1));
    const testIndex = Math.round(controlIndex * (1 + liftRamp / 100));

    return {
      week: `W${week}`,
      testIndex,
      controlIndex,
    };
  });
}

function campaign(
  id: string,
  name: string,
  audienceName: string,
  segmentIds: string[],
  lever: string,
  category: CoreCategory | 'corridor',
  indexedRevenueBand: string,
  confidence: MeasurementCampaign['confidence'],
  liftPct: number,
  corridorId?: MeasurementCampaign['corridorId'],
): MeasurementCampaign {
  return {
    id,
    name,
    source: 'seed',
    audienceName,
    segmentIds,
    corridorId,
    lever,
    category,
    indexedRevenueBand,
    confidence,
    testDesign: defaultTestDesign,
    weeklySeries: buildSeries(108, liftPct),
  };
}

export const campaigns: MeasurementCampaign[] = [
  campaign(
    'promenade-luxury-play',
    'Promenade luxury play',
    'Cosmopolitan Connoisseurs',
    ['cosmopolitan-connoisseurs'],
    'Reservation-linked retail benefit',
    'retailLuxury',
    '18-28k equiv./mo',
    'strong',
    22,
  ),
  campaign(
    'fnb-leakage-recapture',
    'F&B leakage recapture',
    'Diamond High-Rollers',
    ['diamond-high-rollers'],
    'Fine dining pre-arrival concierge',
    'fnb',
    '24-36k equiv./mo',
    'credible',
    18,
  ),
  campaign(
    'family-holiday-certainty',
    'Family holiday certainty',
    'Family Leisure Seekers',
    ['family-leisure-seekers'],
    'Room and attraction packaging',
    'entertainment',
    '8-14k equiv./mo',
    'credible',
    14,
  ),
  campaign(
    'korea-arena-acquisition',
    'Korea arena acquisition',
    'Korea entertainment travelers',
    ['cosmopolitan-connoisseurs'],
    'Arena-first Rewards package',
    'corridor',
    '22-36k equiv./mo',
    'directional',
    16,
    'korea',
  ),
];

export function getCampaignById(campaignId: string) {
  return campaigns.find((item) => item.id === campaignId);
}

export function createLaunchedCampaign(input: LaunchCampaignInput): MeasurementCampaign {
  const id = `launched-${input.source}-${slug(input.audienceName)}`;
  const segmentIds = input.segmentIds.length > 0 ? [...input.segmentIds] : ['cosmopolitan-connoisseurs'];

  return {
    id,
    name: `${input.audienceName} launch`,
    source: input.source,
    audienceName: input.audienceName,
    segmentIds,
    corridorId: input.corridorId,
    lever: input.lever,
    category: input.corridorId ? 'corridor' : 'retailLuxury',
    indexedRevenueBand: input.corridorId ? '18-30k equiv./mo' : '12-22k equiv./mo',
    confidence: 'directional',
    testDesign: defaultTestDesign,
    weeklySeries: buildSeries(104, input.corridorId ? 15 : 12),
  };
}
```

- [ ] **Step 5: Export campaign data**

In `src/data/index.ts`, add:

```ts
export {
  campaigns,
  createLaunchedCampaign,
  getCampaignById,
} from './campaigns';
```

- [ ] **Step 6: Add failing store tests for launched campaigns and scenarios**

Create `src/store/app-store.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppStateProvider, useAppState } from './app-store';

function Probe() {
  const {
    launchedCampaigns,
    launchCampaign,
    savedScenarios,
    saveScenario,
  } = useAppState();

  return (
    <div>
      <p>Campaign count {launchedCampaigns.length}</p>
      <p>Scenario count {savedScenarios.length}</p>
      <button type="button" onClick={() => launchCampaign({
        source: 'activation',
        audienceName: 'Top leakage segments',
        segmentIds: ['cosmopolitan-connoisseurs'],
        lever: 'Retail benefit',
      })}>
        Launch
      </button>
      <button type="button" onClick={() => saveScenario({
        name: 'Close F&B leakage',
        segmentIds: ['cosmopolitan-connoisseurs'],
        category: 'fnb',
        recapturePct: 20,
        onlineShiftPct: 5,
        lever: 'recapture',
      })}>
        Save scenario
      </button>
    </div>
  );
}

describe('AppStateProvider Sprint 3 state', () => {
  it('keeps launched campaigns and saved scenarios in local app state', async () => {
    const user = userEvent.setup();

    render(
      <AppStateProvider>
        <Probe />
      </AppStateProvider>,
    );

    expect(screen.getByText('Campaign count 0')).toBeInTheDocument();
    expect(screen.getByText('Scenario count 0')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Launch' }));
    await user.click(screen.getByRole('button', { name: 'Save scenario' }));

    expect(screen.getByText('Campaign count 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario count 1')).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the failing store tests**

Run:

```bash
npm run test -- src/store/app-store.test.tsx
```

Expected: FAIL because `launchedCampaigns`, `launchCampaign`, `savedScenarios`, and `saveScenario` are not in `AppStateValue`.

- [ ] **Step 8: Extend app state with launched campaigns and scenarios**

In `src/store/app-store.tsx`, import the new types and campaign helper:

```ts
import {
  createLaunchedCampaign,
  type CoreCategory,
  type MeasurementCampaign,
  type SavedScenario,
  type ScenarioLever,
} from '@/data';
```

Add these interfaces near the existing state interfaces:

```ts
export interface LaunchCampaignInput {
  source: 'activation' | 'acquisition';
  audienceName: string;
  segmentIds: string[];
  lever: string;
  corridorId?: MeasurementCampaign['corridorId'];
}

export interface SaveScenarioInput {
  name: string;
  segmentIds: string[];
  category: CoreCategory;
  recapturePct: number;
  onlineShiftPct: number;
  lever: ScenarioLever;
}
```

Add these fields to `AppStateValue`:

```ts
launchedCampaigns: MeasurementCampaign[];
launchCampaign: (input: LaunchCampaignInput) => MeasurementCampaign;
savedScenarios: SavedScenario[];
saveScenario: (input: SaveScenarioInput) => SavedScenario;
removeSavedScenario: (scenarioId: string) => void;
```

Inside `AppStateProvider`, add state and callbacks:

```ts
const [launchedCampaigns, setLaunchedCampaigns] = useState<MeasurementCampaign[]>([]);
const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

const launchCampaign = useCallback((input: LaunchCampaignInput) => {
  const campaign = createLaunchedCampaign(input);
  setLaunchedCampaigns((current) => [campaign, ...current.filter((item) => item.id !== campaign.id)]);
  setCampaignToast({
    title: 'Campaign launched into measurement',
    description: `${campaign.name} is ready for Test & Learn readout.`,
  });
  return campaign;
}, []);

const saveScenario = useCallback((input: SaveScenarioInput) => {
  const scenario: SavedScenario = {
    ...input,
    id: `${Date.now()}-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scenario'}`,
    segmentIds: [...input.segmentIds],
    createdAt: new Date().toISOString(),
  };
  setSavedScenarios((current) => [scenario, ...current]);
  return scenario;
}, []);

const removeSavedScenario = useCallback((scenarioId: string) => {
  setSavedScenarios((current) => current.filter((scenario) => scenario.id !== scenarioId));
}, []);
```

Add the new fields to the `value` object and dependency array.

- [ ] **Step 9: Run data and store tests**

Run:

```bash
npm run test -- src/data/campaigns.test.ts src/store/app-store.test.tsx
```

Expected: PASS.

- [ ] **Step 10: Commit Task 1**

```bash
git add src/data/types.ts src/data/campaigns.ts src/data/index.ts src/data/campaigns.test.ts src/store/app-store.tsx src/store/app-store.test.tsx
git commit -m "feat: add sprint 3 campaign and scenario state"
```

---

### Task 2: Governed CDE Semantic Layer

**Files:**
- Create: `src/lib/cde-semantic-layer.ts`
- Test: `src/lib/cde-semantic-layer.test.ts`

- [ ] **Step 1: Write failing semantic-layer tests**

Create `src/lib/cde-semantic-layer.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { campaigns, corridors, guests, latestSegments, methodology, personaRecords } from '@/data';
import {
  buildCdeSemanticLayer,
  queryCdeSemanticLayer,
} from './cde-semantic-layer';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

const layer = buildCdeSemanticLayer({
  methodology,
  segments: latestSegments,
  personas: personaRecords,
  guests,
  corridors,
  campaigns,
});

describe('CDE semantic layer', () => {
  it('normalizes governed facts across wallet, guest, corridor, and campaign data', () => {
    expect(layer.facts.length).toBeGreaterThan(20);
    expect(layer.facts.every((fact) => fact.source.length > 0)).toBe(true);
    expect(layer.facts.every((fact) => fact.route.startsWith('/'))).toBe(true);
    expect(JSON.stringify(layer)).not.toMatch(bannedCurrencyPattern);
  });

  it('answers top luxury leakage questions from real segment facts', () => {
    const result = queryCdeSemanticLayer('Which segment leaks most luxury wallet?', layer);

    expect(result.intent).toBe('luxuryLeakage');
    expect(result.answer).toMatch(/retail luxury|luxury/i);
    expect(result.auditFacts.length).toBeGreaterThanOrEqual(3);
    expect(result.visual.items[0].formattedValue).toMatch(/%|Index/i);
    expect(JSON.stringify(result)).not.toMatch(bannedCurrencyPattern);
  });

  it('answers top lead and guest pitch questions with masked synthetic guest IDs', () => {
    const leads = queryCdeSemanticLayer('Who are my top 10 leads to pitch this quarter?', layer);
    const pitch = queryCdeSemanticLayer('Draft the pitch for guest MEM-••••3421', layer);

    expect(leads.intent).toBe('topLeads');
    expect(leads.visual.items.length).toBe(10);
    expect(leads.visual.items[0].label).toMatch(/MEM-/);
    expect(pitch.intent).toBe('guestPitch');
    expect(pitch.answer).toMatch(/MEM-••••3421|pitch/i);
    expect(JSON.stringify([leads, pitch])).not.toMatch(bannedCurrencyPattern);
  });

  it('returns a governed fallback for unsupported or malformed questions', () => {
    const result = queryCdeSemanticLayer('give me exact spend in HKD', layer);

    expect(result.intent).toBe('governedFallback');
    expect(result.answer).toMatch(/governed CDE semantic layer/i);
    expect(JSON.stringify(result)).not.toMatch(bannedCurrencyPattern);
  });
});
```

- [ ] **Step 2: Run the failing semantic-layer tests**

Run:

```bash
npm run test -- src/lib/cde-semantic-layer.test.ts
```

Expected: FAIL because `src/lib/cde-semantic-layer.ts` does not exist.

- [ ] **Step 3: Implement semantic-layer interfaces and builders**

Create `src/lib/cde-semantic-layer.ts`:

```ts
import type {
  Corridor,
  Guest,
  MeasurementCampaign,
  Methodology,
  Segment,
  SegmentPersona,
  SemanticFact,
} from '@/data';
import { formatEnriched } from './format';
import { buildLeakageDrivers } from './insights';

export type SemanticIntent =
  | 'luxuryLeakage'
  | 'topLeads'
  | 'fnbHeadroom'
  | 'corridorPriority'
  | 'guestPitch'
  | 'measurement'
  | 'governedFallback';

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

export interface SemanticQueryResult {
  intent: SemanticIntent;
  title: string;
  answer: string;
  auditFacts: SemanticFact[];
  visual: {
    kind: 'bar-list' | 'metric-strip' | 'lead-list' | 'corridor-card' | 'line-series' | 'fact-table';
    title: string;
    items: SemanticVisualItem[];
  };
  followUps: string[];
  links: Array<{ label: string; href: '/' | '/segments' | '/leakage' | '/activation' | '/guests' | '/corridors' | '/measurement' }>;
}

export interface CdeSemanticLayer extends SemanticLayerInput {
  facts: SemanticFact[];
}

function finite(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function fact(id: string, label: string, value: string, source: string, route: string): SemanticFact {
  return { id, label, value, source, route };
}

function pct(value: number | undefined) {
  return formatEnriched(finite(value), 'pct');
}

function index(value: number | undefined) {
  return formatEnriched(finite(value), 'index');
}

function band(value: string | undefined) {
  return formatEnriched(value ?? '0-0k equiv./mo', 'band');
}

export function buildCdeSemanticLayer(input: SemanticLayerInput): CdeSemanticLayer {
  const facts: SemanticFact[] = [
    fact('methodology-coverage', 'Matched coverage', pct(input.methodology.matchedCoveragePct), 'methodology', '/governance'),
    fact('methodology-panel', 'Panel basis', input.methodology.panelSharePct, 'methodology', '/governance'),
  ];

  input.segments.forEach((segment) => {
    facts.push(
      fact(`${segment.id}-opportunity`, segment.name, index(segment.opportunityIndex), 'segment opportunity index', '/segments'),
      fact(`${segment.id}-wallet-capture`, segment.name, pct(segment.metrics.shareOfWallet), 'Galaxy share of wallet', '/wallet'),
      fact(`${segment.id}-headroom-band`, segment.name, band(segment.crossPropertyCashBand), 'CDE modelled headroom band', '/leakage'),
    );
  });

  input.guests.slice(0, 20).forEach((guest) => {
    facts.push(
      fact(`${guest.id}-lead-score`, guest.id, index(guest.leadScore), 'Customer 360 lead score', `/guests/${guest.id}`),
      fact(`${guest.id}-upside`, guest.id, band(guest.projectedUpsideBand), 'Customer 360 projected upside band', `/guests/${guest.id}`),
    );
  });

  input.corridors.forEach((corridor) => {
    facts.push(
      fact(`${corridor.id}-priority`, corridor.name, index(corridor.priorityIndex), 'corridor priority index', `/corridors/${corridor.id}`),
      fact(`${corridor.id}-nongaming`, corridor.name, pct(corridor.nonGamingSharePct), 'non-gaming share', `/corridors/${corridor.id}`),
    );
  });

  input.campaigns.forEach((campaign) => {
    facts.push(
      fact(`${campaign.id}-band`, campaign.name, band(campaign.indexedRevenueBand), 'campaign indexed revenue band', '/measurement'),
      fact(`${campaign.id}-confidence`, campaign.name, campaign.confidence, 'campaign confidence', '/measurement'),
    );
  });

  return { ...input, facts };
}

function topLuxuryLeakage(layer: CdeSemanticLayer): SemanticQueryResult {
  const rows = layer.segments
    .map((segment) => {
      const retail = segment.categories.retailLuxury;
      return {
        segment,
        leakagePct: finite(retail?.leakagePct),
        score: finite(retail?.leakagePct) * finite(retail?.totalWalletIndex),
      };
    })
    .sort((first, second) => second.score - first.score);
  const top = rows[0];

  return {
    intent: 'luxuryLeakage',
    title: 'Luxury wallet leakage ranking',
    answer: top
      ? `${top.segment.name} is the highest retail luxury leakage opportunity with ${pct(top.leakagePct)} leakage and ${index(top.segment.categories.retailLuxury.totalWalletIndex)} wallet intensity.`
      : 'No segment has enough retail luxury data to rank.',
    auditFacts: top ? [
      fact('top-luxury-leakage-segment', 'Top segment', top.segment.name, 'segment categories.retailLuxury', '/leakage'),
      fact('top-luxury-leakage-pct', 'Retail luxury leakage', pct(top.leakagePct), 'segment categories.retailLuxury.leakagePct', '/leakage'),
      fact('top-luxury-wallet-index', 'Retail luxury wallet index', index(top.segment.categories.retailLuxury.totalWalletIndex), 'segment categories.retailLuxury.totalWalletIndex', '/wallet'),
    ] : [],
    visual: {
      kind: 'bar-list',
      title: 'Retail luxury leakage by segment',
      items: rows.slice(0, 5).map(({ segment, leakagePct, score }) => ({
        id: segment.id,
        label: segment.name,
        value: score,
        formattedValue: pct(leakagePct),
        description: `${index(segment.categories.retailLuxury.totalWalletIndex)} wallet intensity`,
      })),
    },
    followUps: ['Show the data behind this', 'Open the leakage plan', 'What activation play should follow?'],
    links: [{ label: 'Open leakage', href: '/leakage' }],
  };
}

function topLeads(layer: CdeSemanticLayer): SemanticQueryResult {
  const leads = [...layer.guests].sort((first, second) => finite(second.leadScore) - finite(first.leadScore)).slice(0, 10);
  const top = leads[0];

  return {
    intent: 'topLeads',
    title: 'Top pitch-now leads',
    answer: top
      ? `${top.id} leads the pitch-now queue with ${index(top.leadScore)} lead score, ${band(top.projectedUpsideBand)} upside, and ${top.nextBestActions[0]?.offer ?? 'a host-led next best action'}.`
      : 'No synthetic guest leads are available.',
    auditFacts: leads.slice(0, 5).map((guest) => fact(`${guest.id}-lead`, guest.id, index(guest.leadScore), 'guest leadScore', `/guests/${guest.id}`)),
    visual: {
      kind: 'lead-list',
      title: 'Top 10 leads',
      items: leads.map((guest) => ({
        id: guest.id,
        label: guest.id,
        value: finite(guest.leadScore),
        formattedValue: index(guest.leadScore),
        description: `${guest.profile.preferredLanguage} · ${band(guest.projectedUpsideBand)}`,
      })),
    },
    followUps: ['Draft the pitch for guest MEM-••••3421', 'Which segment do these leads belong to?', 'Open Customer 360'],
    links: [{ label: 'Open guests', href: '/guests' }],
  };
}

function fnbHeadroom(layer: CdeSemanticLayer): SemanticQueryResult {
  const rows = layer.segments
    .map((segment) => {
      const fnb = segment.categories.fnb;
      return {
        segment,
        leakagePct: finite(fnb?.leakagePct),
        score: finite(fnb?.leakagePct) * finite(fnb?.totalWalletIndex),
      };
    })
    .sort((first, second) => second.score - first.score);
  const top = rows[0];

  return {
    intent: 'fnbHeadroom',
    title: 'F&B headroom if leakage closes',
    answer: top
      ? `Closing part of ${top.segment.name} F&B leakage is the largest modelled F&B headroom move: ${pct(top.leakagePct)} leakage, ${index(top.segment.categories.fnb.totalWalletIndex)} F&B wallet intensity, and ${band(top.segment.crossPropertyCashBand)} segment headroom.`
      : 'No F&B leakage data is available.',
    auditFacts: top ? [
      fact('fnb-top-segment', 'Top F&B segment', top.segment.name, 'segment categories.fnb', '/wallet'),
      fact('fnb-leakage', 'F&B leakage', pct(top.leakagePct), 'segment categories.fnb.leakagePct', '/wallet'),
      fact('fnb-band', 'Modelled headroom band', band(top.segment.crossPropertyCashBand), 'segment crossPropertyCashBand', '/leakage'),
    ] : [],
    visual: {
      kind: 'bar-list',
      title: 'F&B headroom ranking',
      items: rows.slice(0, 5).map(({ segment, leakagePct, score }) => ({
        id: segment.id,
        label: segment.name,
        value: score,
        formattedValue: pct(leakagePct),
        description: `${index(segment.categories.fnb.totalWalletIndex)} F&B wallet index`,
      })),
    },
    followUps: ['Run this in the simulator', 'Show measurement examples', 'Open wallet analytics'],
    links: [{ label: 'Open measurement', href: '/measurement' }],
  };
}

function corridorPriority(layer: CdeSemanticLayer): SemanticQueryResult {
  const rows = [...layer.corridors].sort((first, second) => finite(second.priorityIndex) - finite(first.priorityIndex));
  const top = rows[0];

  return {
    intent: 'corridorPriority',
    title: 'Priority corridor rationale',
    answer: top
      ? `${top.name} ranks first with ${index(top.priorityIndex)} priority, ${pct(top.nonGamingSharePct)} non-gaming share, and ${band(top.projectedValueBand)} modelled opportunity.`
      : 'No corridor data is available.',
    auditFacts: top ? [
      fact('corridor-top', 'Priority corridor', top.name, 'corridor priorityRank', `/corridors/${top.id}`),
      fact('corridor-priority-index', 'Priority index', index(top.priorityIndex), 'corridor priorityIndex', `/corridors/${top.id}`),
      fact('corridor-nongaming', 'Non-gaming share', pct(top.nonGamingSharePct), 'corridor nonGamingSharePct', `/corridors/${top.id}`),
    ] : [],
    visual: {
      kind: 'corridor-card',
      title: 'Top source-market corridors',
      items: rows.slice(0, 5).map((corridor) => ({
        id: corridor.id,
        label: corridor.name,
        value: finite(corridor.priorityIndex),
        formattedValue: index(corridor.priorityIndex),
        description: `${corridor.haul} haul · ${pct(corridor.nonGamingSharePct)} non-gaming`,
      })),
    },
    followUps: ['Open the corridor journey', 'Generate Korean campaign content', 'Show measurement for acquisition'],
    links: [{ label: 'Open corridors', href: '/corridors' }],
  };
}

function guestPitch(question: string, layer: CdeSemanticLayer): SemanticQueryResult {
  const guestId = question.match(/MEM-[^\s]+/)?.[0] ?? 'MEM-••••3421';
  const guest = layer.guests.find((item) => item.id === guestId) ?? layer.guests[0];
  const action = guest?.nextBestActions[0];

  return {
    intent: 'guestPitch',
    title: 'Governed host pitch',
    answer: guest
      ? `${guest.id}: lead with ${action?.offer ?? 'the recommended host action'} because the synthetic profile shows ${guest.primaryOpportunity} leakage, ${index(guest.leadScore)} lead score, and ${band(guest.projectedUpsideBand)} modelled upside.`
      : 'No synthetic guest is available for a pitch.',
    auditFacts: guest ? [
      fact(`${guest.id}-score`, 'Lead score', index(guest.leadScore), 'guest leadScore', `/guests/${guest.id}`),
      fact(`${guest.id}-category`, 'Primary opportunity', guest.primaryOpportunity, 'guest primaryOpportunity', `/guests/${guest.id}`),
      fact(`${guest.id}-band`, 'Projected upside band', band(guest.projectedUpsideBand), 'guest projectedUpsideBand', `/guests/${guest.id}`),
    ] : [],
    visual: {
      kind: 'metric-strip',
      title: 'Guest pitch evidence',
      items: guest ? [
        { id: 'lead-score', label: 'Lead score', value: finite(guest.leadScore), formattedValue: index(guest.leadScore), description: 'Customer 360 score' },
        { id: 'confidence', label: 'NBA confidence', value: finite(action?.confidence) * 100, formattedValue: pct(finite(action?.confidence) * 100), description: 'Modelled recommendation confidence' },
      ] : [],
    },
    followUps: ['Open Customer 360', 'Who are similar leads?', 'Launch this audience'],
    links: guest ? [{ label: 'Open Customer 360', href: '/guests' }] : [],
  };
}

function measurement(layer: CdeSemanticLayer): SemanticQueryResult {
  const campaign = layer.campaigns[0];

  return {
    intent: 'measurement',
    title: 'Test & Learn proof point',
    answer: campaign
      ? `${campaign.name} is ready for causal readout with ${campaign.confidence} confidence and ${band(campaign.indexedRevenueBand)} indexed revenue band.`
      : 'No campaigns are available for measurement.',
    auditFacts: campaign ? [
      fact(`${campaign.id}-design`, 'Holdout', pct(campaign.testDesign.holdoutPct), 'campaign testDesign.holdoutPct', '/measurement'),
      fact(`${campaign.id}-band`, 'Indexed revenue band', band(campaign.indexedRevenueBand), 'campaign indexedRevenueBand', '/measurement'),
    ] : [],
    visual: {
      kind: 'line-series',
      title: 'Campaign test/control series',
      items: campaign?.weeklySeries.map((point) => ({
        id: point.week,
        label: point.week,
        value: point.testIndex - point.controlIndex,
        formattedValue: index(point.testIndex - point.controlIndex),
        description: `Test ${index(point.testIndex)} vs control ${index(point.controlIndex)}`,
      })) ?? [],
    },
    followUps: ['Open measurement', 'What drove the lift?', 'Which campaign should run next?'],
    links: [{ label: 'Open measurement', href: '/measurement' }],
  };
}

function governedFallback(): SemanticQueryResult {
  return {
    intent: 'governedFallback',
    title: 'Governed CDE answer only',
    answer: 'This assistant only answers from the governed CDE semantic layer. It returns traceable indices, percentages, modelled bands, and masked synthetic records.',
    auditFacts: [],
    visual: { kind: 'fact-table', title: 'No governed facts selected', items: [] },
    followUps: ['Which segment leaks most luxury wallet?', 'Who are my top 10 leads to pitch this quarter?', 'Which corridor should we prioritise and why?'],
    links: [],
  };
}

export function queryCdeSemanticLayer(question: string, layer: CdeSemanticLayer): SemanticQueryResult {
  const normalized = question.toLowerCase();

  if (/top 10 leads|leads|pitch this quarter/.test(normalized)) return topLeads(layer);
  if (/draft.*guest|guest mem-|pitch for guest/.test(normalized)) return guestPitch(question, layer);
  if (/f&b|fnb|food|dining/.test(normalized)) return fnbHeadroom(layer);
  if (/corridor|source market|prioritise|prioritize/.test(normalized)) return corridorPriority(layer);
  if (/measurement|test|control|lift|did it work|roi/.test(normalized)) return measurement(layer);
  if (/luxury|retail|wallet/.test(normalized)) return topLuxuryLeakage(layer);

  return governedFallback();
}
```

- [ ] **Step 4: Run semantic-layer tests**

Run:

```bash
npm run test -- src/lib/cde-semantic-layer.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/lib/cde-semantic-layer.ts src/lib/cde-semantic-layer.test.ts
git commit -m "feat: add governed cde semantic layer"
```

---

### Task 3: Governed Ask CDE AI Engine and Visual Responses

**Files:**
- Modify: `src/lib/chat-assistant.ts`
- Modify: `src/lib/chat-assistant.test.ts`
- Modify: `src/components/assistant/chat-response-visual.tsx`
- Modify: `src/components/assistant/chat-response-visual.test.tsx`
- Modify: `src/components/assistant/chat-assistant-launcher.tsx`

- [ ] **Step 1: Add failing assistant engine tests**

Extend `src/lib/chat-assistant.test.ts` with:

```ts
import { campaigns, corridors, guests, latestSegments, methodology, personaRecords } from '@/data';

const sprint3Context = {
  methodology,
  segments: latestSegments,
  selectedSegment: latestSegments[0],
  personas: personaRecords,
  guests,
  corridors,
  campaigns,
};

it('answers Sprint 3 starter prompts with grounded auditable facts', () => {
  const response = buildChatAssistantResponse('Who are my top 10 leads to pitch this quarter?', sprint3Context);

  expect(response.intent).toBe('topLeads');
  expect(response.governanceBadge).toBe('Grounded · Auditable');
  expect(response.auditFacts.length).toBeGreaterThanOrEqual(3);
  expect(response.visual.kind).toBe('lead-list');
  expect(response.visual.items).toHaveLength(10);
  expect(response.suggestedQuestions).toContain('Draft the pitch for guest MEM-••••3421');
});

it('routes corridor and measurement questions through the semantic layer', () => {
  const corridor = buildChatAssistantResponse('Which corridor should we prioritise and why?', sprint3Context);
  const measurement = buildChatAssistantResponse('Did the luxury play work?', sprint3Context);

  expect(corridor.intent).toBe('corridorPriority');
  expect(corridor.links.some((link) => link.href === '/corridors')).toBe(true);
  expect(measurement.intent).toBe('measurement');
  expect(measurement.links.some((link) => link.href === '/measurement')).toBe(true);
});

it('keeps Sprint 3 assistant responses CDE-safe', () => {
  const prompts = [
    'Which segment leaks most luxury wallet?',
    'Who are my top 10 leads to pitch this quarter?',
    'What is the headroom if we close F&B leakage?',
    'Which corridor should we prioritise and why?',
    'Draft the pitch for guest MEM-••••3421',
    'Show exact HKD 5000 spend',
  ];

  prompts.forEach((prompt) => {
    const response = buildChatAssistantResponse(prompt, sprint3Context);
    expect(JSON.stringify(response)).not.toMatch(/HKD|MOP|\$|元|澳門幣|5000/i);
    expect(JSON.stringify(response)).not.toMatch(/NaN|Infinity/i);
  });
});
```

- [ ] **Step 2: Run failing assistant engine tests**

Run:

```bash
npm run test -- src/lib/chat-assistant.test.ts
```

Expected: FAIL because `topLeads`, `corridorPriority`, `measurement`, `governanceBadge`, and `auditFacts` are not in the current assistant response contract.

- [ ] **Step 3: Extend assistant response types**

In `src/lib/chat-assistant.ts`, change the intent and visual types:

```ts
import {
  buildCdeSemanticLayer,
  queryCdeSemanticLayer,
  type SemanticQueryResult,
} from './cde-semantic-layer';
import type { Corridor, Guest, MeasurementCampaign, SemanticFact } from '@/data';

export type ChatAssistantIntent =
  | 'overview'
  | 'segment'
  | 'leakage'
  | 'persona'
  | 'activation'
  | 'methodology'
  | 'luxuryLeakage'
  | 'topLeads'
  | 'fnbHeadroom'
  | 'corridorPriority'
  | 'guestPitch'
  | 'measurement'
  | 'governedFallback'
  | 'fallback';

export type ChatAssistantVisualKind =
  | 'bar-list'
  | 'metric-strip'
  | 'lead-list'
  | 'corridor-card'
  | 'line-series'
  | 'fact-table';

export interface ChatAssistantResponse {
  id: string;
  intent: ChatAssistantIntent;
  title: string;
  answer: string;
  governanceBadge: 'Grounded · Auditable';
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
```

Update `makeResponse()` so older response builders set the new fields:

```ts
function makeResponse(input: Omit<ChatAssistantResponse, 'suggestedQuestions' | 'governanceBadge' | 'auditFacts'> & {
  auditFacts?: SemanticFact[];
  suggestedQuestions?: string[];
}): ChatAssistantResponse {
  return sanitizeResponse({
    ...input,
    governanceBadge: 'Grounded · Auditable',
    auditFacts: input.auditFacts ?? [],
    suggestedQuestions: input.suggestedQuestions ?? [...DEFAULT_SUGGESTIONS],
  });
}
```

Update `sanitizeResponse()` to sanitize `auditFacts` with the same text sanitizer:

```ts
auditFacts: response.auditFacts.map((item) => ({
  id: sanitizeChatAssistantText(item.id),
  label: sanitizeChatAssistantText(item.label),
  value: sanitizeChatAssistantText(item.value),
  source: sanitizeChatAssistantText(item.source),
  route: sanitizeChatAssistantText(item.route),
})),
```

- [ ] **Step 4: Add semantic query delegation**

In `src/lib/chat-assistant.ts`, add:

```ts
const STARTER_SUGGESTIONS = [
  'Which segment leaks most luxury wallet?',
  'Who are my top 10 leads to pitch this quarter?',
  'What is the headroom if we close F&B leakage?',
  'Which corridor should we prioritise and why?',
  'Draft the pitch for guest MEM-••••3421',
] as const;

function hasSemanticLayerInputs(context: Partial<ChatAssistantContext>) {
  return Boolean(
    context.methodology
      && context.segments?.length
      && context.personas?.length
      && context.guests?.length
      && context.corridors?.length
      && context.campaigns?.length,
  );
}

function semanticResultToResponse(result: SemanticQueryResult): ChatAssistantResponse {
  return makeResponse({
    id: `chat-${result.intent}`,
    intent: result.intent,
    title: result.title,
    answer: result.answer,
    evidence: result.auditFacts.slice(0, 3).map((fact) => ({
      label: fact.label,
      value: fact.value,
      detail: fact.source,
    })),
    auditFacts: result.auditFacts,
    visual: result.visual,
    links: result.links,
    suggestedQuestions: result.followUps,
  });
}

function trySemanticResponse(question: string, context: Partial<ChatAssistantContext>) {
  if (!hasSemanticLayerInputs(context)) return undefined;

  const semanticLayer = buildCdeSemanticLayer({
    methodology: context.methodology!,
    segments: context.segments!,
    personas: context.personas!,
    guests: context.guests!,
    corridors: context.corridors!,
    campaigns: context.campaigns!,
  });
  const result = queryCdeSemanticLayer(question, semanticLayer);

  if (result.intent === 'governedFallback' && classifyIntent(question) !== 'fallback') return undefined;
  return semanticResultToResponse(result);
}
```

At the start of `buildChatAssistantResponse()`, before the existing switch, add:

```ts
const semanticResponse = trySemanticResponse(question, context);
if (semanticResponse) return semanticResponse;
```

- [ ] **Step 5: Pass full semantic context into the assistant launcher**

In `src/components/assistant/chat-assistant-launcher.tsx`, import the new data:

```ts
import { campaigns, corridors, guests, personaRecords } from '@/data';
```

Update the context memo:

```ts
const context = useMemo(() => ({
  methodology,
  personas: personaRecords,
  segments,
  selectedPersonaId,
  selectedSegment,
  guests,
  corridors,
  campaigns: [...campaigns, ...launchedCampaigns],
}), [methodology, segments, selectedPersonaId, selectedSegment, launchedCampaigns]);
```

Also destructure `launchedCampaigns` from `useAppState()`.

- [ ] **Step 6: Add failing visual tests**

Extend `src/components/assistant/chat-response-visual.test.tsx`:

```tsx
it('renders lead-list and fact-table assistant visuals', () => {
  render(
    <ChatResponseVisual
      visual={{
        kind: 'lead-list',
        title: 'Top 10 leads',
        items: [
          { id: 'MEM-••••3421', label: 'MEM-••••3421', value: 184, formattedValue: 'Index 184', description: 'English · 18-28k equiv./mo' },
        ],
      }}
    />,
  );

  expect(screen.getByRole('figure', { name: 'Top 10 leads' })).toBeInTheDocument();
  expect(screen.getByText('MEM-••••3421')).toBeInTheDocument();
  expect(screen.getByText('Index 184')).toBeInTheDocument();
});

it('renders line-series assistant visuals without exposing currency', () => {
  render(
    <ChatResponseVisual
      visual={{
        kind: 'line-series',
        title: 'Campaign test/control series',
        items: [
          { id: 'W1', label: 'W1', value: 4, formattedValue: 'Index 4', description: 'Test Index 112 vs control Index 108' },
        ],
      }}
    />,
  );

  expect(screen.getByRole('figure', { name: 'Campaign test/control series' })).toBeInTheDocument();
  expect(screen.getByText('W1')).toBeInTheDocument();
  expect(screen.queryByText(/HKD|MOP|\$/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 7: Implement richer assistant visual rendering**

In `src/components/assistant/chat-response-visual.tsx`, add cases:

```tsx
function LeadList({ items }: { items: ChatVisualItem[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={getStableItemKey(item)} className="flex items-start justify-between gap-3 rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">#{index + 1} lead</p>
            <p className="mt-1 text-sm font-semibold text-galaxy-cream">{item.label}</p>
            <p className="mt-1 text-xs text-galaxy-muted">{item.description}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-galaxy-gold">{item.formattedValue}</p>
        </div>
      ))}
    </div>
  );
}

function CompactFactTable({ items }: { items: ChatVisualItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-galaxy-muted">Ask a supported CDE-safe question to select governed facts.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-galaxy-border">
      {items.map((item) => (
        <div key={getStableItemKey(item)} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-galaxy-border px-3 py-2 last:border-b-0">
          <span className="text-sm text-galaxy-muted">{item.label}</span>
          <span className="text-sm font-semibold text-galaxy-cream">{item.formattedValue}</span>
        </div>
      ))}
    </div>
  );
}
```

Update the render branch:

```tsx
{!hasItems ? (
  <p className="text-sm text-galaxy-muted">No visual data available for this answer.</p>
) : visual.kind === 'bar-list' || visual.kind === 'corridor-card' || visual.kind === 'line-series' ? (
  <BarList items={visual.items} />
) : visual.kind === 'lead-list' ? (
  <LeadList items={visual.items} />
) : visual.kind === 'fact-table' ? (
  <CompactFactTable items={visual.items} />
) : (
  <MetricStrip items={visual.items} />
)}
```

- [ ] **Step 8: Run assistant tests**

Run:

```bash
npm run test -- src/lib/chat-assistant.test.ts src/components/assistant/chat-response-visual.test.tsx src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit Task 3**

```bash
git add src/lib/chat-assistant.ts src/lib/chat-assistant.test.ts src/components/assistant/chat-response-visual.tsx src/components/assistant/chat-response-visual.test.tsx src/components/assistant/chat-assistant-launcher.tsx src/components/assistant/chat-assistant-launcher.test.tsx
git commit -m "feat: ground ask cde ai in semantic facts"
```

---

### Task 4: Full-Height Assistant Panel, Audit Expander, and Starter Prompts

**Files:**
- Modify: `src/components/assistant/chat-assistant-panel.tsx`
- Modify: `src/components/assistant/chat-assistant-launcher.test.tsx`
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Add failing panel behavior tests**

Extend `src/components/assistant/chat-assistant-launcher.test.tsx`:

```tsx
it('opens a governed full-height assistant with starter prompts and audit trail', async () => {
  const user = userEvent.setup();
  render(<ChatAssistantLauncher />);

  await user.click(screen.getByRole('button', { name: 'Open AI insight assistant' }));

  const dialog = screen.getByRole('dialog', { name: 'AI insight assistant' });
  expect(dialog).toHaveTextContent('Grounded · Auditable');
  expect(dialog).toHaveTextContent('This assistant only answers from the governed CDE semantic layer');
  expect(screen.getByRole('button', { name: 'Which segment leaks most luxury wallet?' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Show the data behind this/i })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /Show the data behind this/i }));

  expect(dialog).toHaveTextContent(/Source/i);
  expect(dialog).toHaveTextContent(/Route/i);
});
```

- [ ] **Step 2: Run the failing panel tests**

Run:

```bash
npm run test -- src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: FAIL because starter prompts and audit expander are not rendered.

- [ ] **Step 3: Update panel layout and starter prompts**

In `src/components/assistant/chat-assistant-panel.tsx`, replace `STARTER_PROMPT` with:

```ts
const STARTER_PROMPTS = [
  'Which segment leaks most luxury wallet?',
  'Who are my top 10 leads to pitch this quarter?',
  'What is the headroom if we close F&B leakage?',
  'Which corridor should we prioritise and why?',
  'Draft the pitch for guest MEM-••••3421',
] as const;

const STARTER_PROMPT = STARTER_PROMPTS[0];
```

Change the panel container class to a full-height right sheet:

```tsx
className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw,30rem)] flex-col overflow-hidden border-l border-galaxy-border bg-galaxy-ink/98 shadow-2xl shadow-black/50 backdrop-blur"
```

In the header body, add the governance framing:

```tsx
<p className="mt-2 text-xs leading-5 text-galaxy-muted">
  This assistant only answers from the governed CDE semantic layer; figures are traceable, nothing is fabricated.
</p>
```

- [ ] **Step 4: Add audit trail rendering**

In `ResponseCard`, add local state:

```tsx
const [showAudit, setShowAudit] = useState(false);
```

Below `<ChatResponseVisual />`, add:

```tsx
<div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3">
  <button
    type="button"
    onClick={() => setShowAudit((current) => !current)}
    className="flex w-full items-center justify-between gap-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold"
  >
    <span>Show the data behind this</span>
    <span aria-hidden="true">{showAudit ? 'Close' : 'Open'}</span>
  </button>
  {showAudit ? (
    response.auditFacts.length > 0 ? (
      <dl className="mt-3 space-y-2">
        {response.auditFacts.map((fact) => (
          <div key={`${fact.id}-${fact.source}`} className="rounded border border-galaxy-border bg-galaxy-charcoal/60 p-2">
            <dt className="text-sm font-semibold text-galaxy-cream">{fact.label}</dt>
            <dd className="mt-1 text-xs text-galaxy-muted">
              Value {fact.value} · Source {fact.source} · Route {fact.route}
            </dd>
          </div>
        ))}
      </dl>
    ) : (
      <p className="mt-3 text-xs text-galaxy-muted">No governed facts were selected for this fallback answer.</p>
    )
  ) : null}
</div>
```

- [ ] **Step 5: Replace bottom suggestion strip with starter and follow-up groups**

In the footer suggestion area, render both starter and response-specific prompts:

```tsx
<div className="border-t border-galaxy-border px-4 py-3">
  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">Starter prompts</p>
  <div className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Starter prompts">
    {STARTER_PROMPTS.map((suggestion) => (
      <button key={suggestion} type="button" onClick={() => submitQuestion(suggestion)} className="shrink-0 rounded-full border border-galaxy-border bg-galaxy-charcoal/80 px-3 py-1.5 text-xs font-semibold text-galaxy-cream transition hover:border-galaxy-gold hover:text-galaxy-gold">
        {suggestion}
      </button>
    ))}
  </div>
  {latestResponse ? (
    <>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">Follow-ups</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Suggested prompts">
        {latestResponse.suggestedQuestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => submitQuestion(suggestion)} className="shrink-0 rounded-full border border-galaxy-gold/35 bg-galaxy-gold/10 px-3 py-1.5 text-xs font-semibold text-galaxy-gold transition hover:border-galaxy-gold">
            {suggestion}
          </button>
        ))}
      </div>
    </>
  ) : null}
</div>
```

- [ ] **Step 6: Add e2e assertions for governed assistant audit behavior**

In `e2e/compliance.spec.ts`, inside the assistant test, add:

```ts
await expect(assistant.getByText(/This assistant only answers from the governed CDE semantic layer/i)).toBeVisible();
await expect(assistant.getByText('Grounded · Auditable')).toBeVisible();
await assistant.getByRole('button', { name: /Show the data behind this/i }).first().click();
await expect(assistant.getByText(/Source/i)).toBeVisible();
await expect(assistant.getByText(/Route/i)).toBeVisible();
await assistant.getByRole('button', { name: 'Who are my top 10 leads to pitch this quarter?' }).click();
await expect(assistant.getByRole('figure', { name: 'Top 10 leads' })).toBeVisible();
await expect(assistant).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
```

- [ ] **Step 7: Run panel and e2e assistant checks**

Run:

```bash
npm run test -- src/components/assistant/chat-assistant-launcher.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "AI insight assistant"
```

Expected: PASS.

- [ ] **Step 8: Commit Task 4**

```bash
git add src/components/assistant/chat-assistant-panel.tsx src/components/assistant/chat-assistant-launcher.test.tsx e2e/compliance.spec.ts
git commit -m "feat: add governed assistant audit panel"
```

---

### Task 5: Measurement Route and Test & Learn Calculations

**Files:**
- Create: `src/lib/measurement.ts`
- Test: `src/lib/measurement.test.ts`
- Create: `src/components/charts/lift-over-time-chart.tsx`
- Test: `src/components/charts/lift-over-time-chart.test.tsx`
- Create: `src/components/panels/test-learn-card.tsx`
- Test: `src/components/panels/test-learn-card.test.tsx`
- Create: `src/app/measurement/page.tsx`
- Test: `src/app/measurement/page.test.tsx`
- Modify: `src/components/shell/nav.tsx`
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Write failing measurement calculation tests**

Create `src/lib/measurement.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { campaigns } from '@/data';
import {
  buildMeasurementReadout,
  calculateIncrementalLiftPct,
} from './measurement';

describe('measurement calculations', () => {
  it('calculates incremental lift as (test-control)/control', () => {
    expect(calculateIncrementalLiftPct(125, 100)).toBe(25);
    expect(calculateIncrementalLiftPct(100, 0)).toBe(0);
  });

  it('builds campaign readouts from weekly series, not authored lift strings', () => {
    const readout = buildMeasurementReadout(campaigns[0]);
    const last = campaigns[0].weeklySeries.at(-1)!;
    const expectedLift = Math.round(((last.testIndex - last.controlIndex) / last.controlIndex) * 100);

    expect(readout.liftPct).toBe(expectedLift);
    expect(readout.incrementalRevenueBand).toMatch(/equiv\.\/mo/);
    expect(readout.iroiIndex).toBeGreaterThan(0);
    expect(readout.testLine).toHaveLength(campaigns[0].weeklySeries.length);
    expect(JSON.stringify(readout)).not.toMatch(/HKD|MOP|\$|元|澳門幣|NaN|Infinity/i);
  });
});
```

- [ ] **Step 2: Run failing measurement calculation tests**

Run:

```bash
npm run test -- src/lib/measurement.test.ts
```

Expected: FAIL because `src/lib/measurement.ts` does not exist.

- [ ] **Step 3: Implement measurement calculations**

Create `src/lib/measurement.ts`:

```ts
import type { CampaignWeeklyPoint, MeasurementCampaign } from '@/data';
import { formatEnriched } from './format';

export interface MeasurementReadout {
  campaignId: string;
  liftPct: number;
  liftLabel: string;
  incrementalRevenueBand: string;
  iroiIndex: number;
  confidenceLabel: string;
  testDesignLabel: string;
  testLine: Array<{ week: string; index: number }>;
  controlLine: Array<{ week: string; index: number }>;
}

function finite(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function calculateIncrementalLiftPct(testIndex: number, controlIndex: number) {
  const safeControl = finite(controlIndex);
  if (safeControl <= 0) return 0;
  return Math.round(((finite(testIndex) - safeControl) / safeControl) * 100);
}

function latestPoint(series: CampaignWeeklyPoint[]) {
  return series.at(-1) ?? { week: 'W0', testIndex: 0, controlIndex: 0 };
}

export function buildMeasurementReadout(campaign: MeasurementCampaign): MeasurementReadout {
  const latest = latestPoint(campaign.weeklySeries);
  const liftPct = calculateIncrementalLiftPct(latest.testIndex, latest.controlIndex);
  const iroiIndex = Math.max(0, Math.round(liftPct * 4.8 + campaign.testDesign.holdoutPct));

  return {
    campaignId: campaign.id,
    liftPct,
    liftLabel: formatEnriched(liftPct, 'pct'),
    incrementalRevenueBand: formatEnriched(campaign.indexedRevenueBand, 'band'),
    iroiIndex,
    confidenceLabel: campaign.confidence,
    testDesignLabel: `${campaign.testDesign.holdoutPct}% holdout · ${campaign.testDesign.durationWeeks} weeks · ${campaign.testDesign.expectedLiftThresholdPct}% lift threshold`,
    testLine: campaign.weeklySeries.map((point) => ({ week: point.week, index: finite(point.testIndex) })),
    controlLine: campaign.weeklySeries.map((point) => ({ week: point.week, index: finite(point.controlIndex) })),
  };
}
```

- [ ] **Step 4: Write chart and card tests**

Create `src/components/charts/lift-over-time-chart.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { campaigns } from '@/data';
import { buildMeasurementReadout } from '@/lib/measurement';
import { LiftOverTimeChart } from './lift-over-time-chart';

it('renders a test versus control lift chart', () => {
  render(<LiftOverTimeChart readout={buildMeasurementReadout(campaigns[0])} />);

  expect(screen.getByRole('figure', { name: /Lift over time/i })).toBeInTheDocument();
  expect(screen.getByText('Test group')).toBeInTheDocument();
  expect(screen.getByText('Control holdout')).toBeInTheDocument();
});
```

Create `src/components/panels/test-learn-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { campaigns } from '@/data';
import { TestLearnCard } from './test-learn-card';

it('renders campaign measurement with lift, confidence, and test design', () => {
  render(<TestLearnCard campaign={campaigns[0]} />);

  expect(screen.getByRole('article', { name: /Promenade luxury play/i })).toBeInTheDocument();
  expect(screen.getByText(/Incremental lift/i)).toBeInTheDocument();
  expect(screen.getByText(/iROI Index/i)).toBeInTheDocument();
  expect(screen.getByText(/holdout/i)).toBeInTheDocument();
  expect(screen.getByText(/models Mastercard Test & Learn methodology/i)).toBeInTheDocument();
  expect(screen.queryByText(/HKD|MOP|\$|元|澳門幣/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 5: Implement measurement chart**

Create `src/components/charts/lift-over-time-chart.tsx`:

```tsx
'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MeasurementReadout } from '@/lib/measurement';

interface LiftOverTimeChartProps {
  readout: MeasurementReadout;
}

export function LiftOverTimeChart({ readout }: LiftOverTimeChartProps) {
  const rows = readout.testLine.map((point, index) => ({
    week: point.week,
    test: point.index,
    control: readout.controlLine[index]?.index ?? 0,
  }));

  return (
    <figure aria-label="Lift over time" className="h-64 min-w-0">
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-galaxy-muted">
        <span><span className="text-galaxy-gold">●</span> Test group</span>
        <span><span className="text-galaxy-muted">●</span> Control holdout</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="week" stroke="rgba(246,239,222,0.55)" tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(246,239,222,0.55)" tickLine={false} axisLine={false} width={42} />
          <Tooltip
            contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.14)', color: '#f6efde' }}
            formatter={(value) => [`Index ${value}`, '']}
          />
          <Line type="monotone" dataKey="control" stroke="rgba(246,239,222,0.45)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="test" stroke="#c9a45c" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
```

- [ ] **Step 6: Implement measurement card**

Create `src/components/panels/test-learn-card.tsx`:

```tsx
import type { MeasurementCampaign } from '@/data';
import { buildMeasurementReadout } from '@/lib/measurement';
import { LiftOverTimeChart } from '@/components/charts/lift-over-time-chart';
import { CdeChip } from '@/components/ui/cde-chip';
import { Panel } from '@/components/ui/panel';

export function TestLearnCard({ campaign }: { campaign: MeasurementCampaign }) {
  const readout = buildMeasurementReadout(campaign);

  return (
    <Panel as="article" aria-label={`${campaign.name} measurement`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">Test & Learn readout</p>
          <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">{campaign.name}</h2>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">{campaign.audienceName} · {campaign.lever}</p>
        </div>
        <CdeChip />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-3">
          <p className="text-xs text-galaxy-muted">Incremental lift</p>
          <p className="mt-2 text-2xl font-semibold text-galaxy-gold">{readout.liftLabel}</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-3">
          <p className="text-xs text-galaxy-muted">Indexed revenue</p>
          <p className="mt-2 text-2xl font-semibold text-galaxy-cream">{readout.incrementalRevenueBand}</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-3">
          <p className="text-xs text-galaxy-muted">iROI Index</p>
          <p className="mt-2 text-2xl font-semibold text-galaxy-cream">Index {readout.iroiIndex}</p>
        </div>
      </div>
      <div className="mt-5">
        <LiftOverTimeChart readout={readout} />
      </div>
      <div className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-charcoal/70 p-3 text-xs leading-5 text-galaxy-muted">
        {readout.testDesignLabel}. Synthetic, indexed readout; models Mastercard Test & Learn methodology and measures causal lift, not attribution.
      </div>
    </Panel>
  );
}
```

- [ ] **Step 7: Write failing measurement route test**

Create `src/app/measurement/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { campaigns, latestQuarter, latestSegments, methodology, quarters } from '@/data';
import { useAppState } from '@/store/app-store';
import MeasurementPage from './page';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();
  return { ...actual, useAppState: vi.fn() };
});

it('renders measurement route with seed and launched campaign readouts', () => {
  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments: latestSegments,
    selectedSegment: latestSegments[0],
    selectedSegmentId: latestSegments[0].id,
    setSelectedSegmentId: vi.fn(),
    selectedPersonaId: '',
    setSelectedPersonaId: vi.fn(),
    methodology,
    filters: { segmentIds: latestSegments.map((segment) => segment.id), channel: 'all', minPropensity: 0 },
    setFilters: vi.fn(),
    savedAudiences: [],
    saveAudience: vi.fn(),
    removeSavedAudience: vi.fn(),
    campaignToast: null,
    pushCampaign: vi.fn(),
    clearCampaignToast: vi.fn(),
    launchedCampaigns: [campaigns[0]],
    launchCampaign: vi.fn(),
    savedScenarios: [],
    saveScenario: vi.fn(),
    removeSavedScenario: vi.fn(),
  });

  render(<MeasurementPage />);

  expect(screen.getByRole('heading', { name: /Measurement Loop/i })).toBeInTheDocument();
  expect(screen.getAllByText(/Incremental lift/i).length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText(/Did it work/i)).toBeInTheDocument();
  expect(screen.getByText(/causal lift, not attribution/i)).toBeInTheDocument();
  expect(screen.queryByText(/HKD|MOP|\$|元|澳門幣/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 8: Implement measurement route and navigation**

Create `src/app/measurement/page.tsx`:

```tsx
'use client';

import { TestLearnCard } from '@/components/panels/test-learn-card';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import { campaigns } from '@/data';
import { useAppState } from '@/store/app-store';

export default function MeasurementPage() {
  const { launchedCampaigns } = useAppState();
  const allCampaigns = [...launchedCampaigns, ...campaigns];

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Did it work"
        title="Measurement Loop"
        description="Close the loop from audience and activation to indexed causal lift using synthetic Test & Learn readouts."
        aside={<p className="font-semibold text-galaxy-gold">Test vs control · indexed proof</p>}
      />
      <Panel>
        <SectionHeader
          eyebrow="Measurement method"
          title="Holdout proof"
          description="Each card computes lift from test and control indices. The output is synthetic, indexed, and designed to model causal lift, not attribution."
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        {allCampaigns.map((campaign) => (
          <TestLearnCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
```

In `src/components/shell/nav.tsx`, import `LineChart` or `TrendingUp` from `lucide-react` and add to `walletNavItems` after Activation:

```ts
{ href: '/measurement', label: 'Measurement', shortLabel: 'Measure', icon: TrendingUp },
```

- [ ] **Step 9: Add measurement e2e route checks**

In `e2e/compliance.spec.ts`, add `/measurement` to `routes` and add route-specific assertions:

```ts
if (route === '/measurement') {
  await expect(page.getByRole('heading', { name: /Measurement Loop/i })).toBeVisible();
  await expect(page.getByText(/causal lift, not attribution/i)).toBeVisible();
  await expect(page.getByRole('figure', { name: /Lift over time/i }).first()).toBeVisible();
}
```

Add `/measurement` to the responsive route loop that checks body width.

- [ ] **Step 10: Run measurement tests**

Run:

```bash
npm run test -- src/lib/measurement.test.ts src/components/charts/lift-over-time-chart.test.tsx src/components/panels/test-learn-card.test.tsx src/app/measurement/page.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "measurement|/measurement"
```

Expected: PASS.

- [ ] **Step 11: Commit Task 5**

```bash
git add src/lib/measurement.ts src/lib/measurement.test.ts src/components/charts/lift-over-time-chart.tsx src/components/charts/lift-over-time-chart.test.tsx src/components/panels/test-learn-card.tsx src/components/panels/test-learn-card.test.tsx src/app/measurement/page.tsx src/app/measurement/page.test.tsx src/components/shell/nav.tsx e2e/compliance.spec.ts
git commit -m "feat: add test and learn measurement loop"
```

---

### Task 6: What-If Scenario Simulator

**Files:**
- Create: `src/lib/scenario-simulator.ts`
- Test: `src/lib/scenario-simulator.test.ts`
- Create: `src/components/charts/scenario-impact-constellation.tsx`
- Test: `src/components/charts/scenario-impact-constellation.test.tsx`
- Create: `src/app/simulate/page.tsx`
- Test: `src/app/simulate/page.test.tsx`
- Modify: `src/components/shell/nav.tsx`
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Write failing simulator tests**

Create `src/lib/scenario-simulator.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { latestSegments } from '@/data';
import { buildScenarioImpact } from './scenario-simulator';

describe('scenario simulator', () => {
  it('recomputes indexed impact from selected segment, category, recapture, channel shift, and lever', () => {
    const impact = buildScenarioImpact({
      segments: latestSegments,
      segmentIds: ['cosmopolitan-connoisseurs'],
      category: 'fnb',
      recapturePct: 20,
      onlineShiftPct: 8,
      lever: 'contentPersonalisation',
    });

    expect(impact.walletUpliftIndex).toBeGreaterThan(0);
    expect(impact.opportunityIndexDelta).toBeGreaterThan(0);
    expect(impact.pitchNowGuestsK).toBeGreaterThan(0);
    expect(impact.projectedBand).toMatch(/equiv\.\/mo/);
    expect(impact.constellationShift[0].afterIndex).toBeGreaterThan(impact.constellationShift[0].beforeIndex);
    expect(JSON.stringify(impact)).not.toMatch(/HKD|MOP|\$|元|澳門幣|NaN|Infinity/i);
  });

  it('returns finite zeroed impact for empty input', () => {
    const impact = buildScenarioImpact({
      segments: [],
      segmentIds: [],
      category: 'fnb',
      recapturePct: Number.NaN,
      onlineShiftPct: Number.POSITIVE_INFINITY,
      lever: 'recapture',
    });

    expect(impact.walletUpliftIndex).toBe(0);
    expect(impact.opportunityIndexDelta).toBe(0);
    expect(impact.pitchNowGuestsK).toBe(0);
    expect(impact.constellationShift).toEqual([]);
    expect(JSON.stringify(impact)).not.toMatch(/NaN|Infinity/i);
  });
});
```

- [ ] **Step 2: Run failing simulator tests**

Run:

```bash
npm run test -- src/lib/scenario-simulator.test.ts
```

Expected: FAIL because `src/lib/scenario-simulator.ts` does not exist.

- [ ] **Step 3: Implement scenario calculations**

Create `src/lib/scenario-simulator.ts`:

```ts
import type { CoreCategory, ScenarioImpact, ScenarioLever, Segment } from '@/data';
import { formatEnriched } from './format';

export interface ScenarioInput {
  segments: Segment[];
  segmentIds: string[];
  category: CoreCategory;
  recapturePct: number;
  onlineShiftPct: number;
  lever: ScenarioLever;
}

function finite(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, finite(value)));
}

function leverMultiplier(lever: ScenarioLever) {
  switch (lever) {
    case 'contentPersonalisation':
      return 1.18;
    case 'hostLift':
      return 1.14;
    case 'channelShift':
      return 1.1;
    case 'recapture':
    default:
      return 1;
  }
}

export function buildScenarioImpact(input: ScenarioInput): ScenarioImpact {
  const segmentIdSet = new Set(input.segmentIds);
  const selectedSegments = input.segments.filter((segment) => segmentIdSet.has(segment.id));
  const recapturePct = clamp(input.recapturePct, 0, 60);
  const onlineShiftPct = clamp(input.onlineShiftPct, -20, 30);
  const multiplier = leverMultiplier(input.lever);

  if (selectedSegments.length === 0) {
    return {
      walletUpliftIndex: 0,
      opportunityIndexDelta: 0,
      pitchNowGuestsK: 0,
      projectedBand: formatEnriched('0-0k equiv./mo', 'band'),
      constellationShift: [],
    };
  }

  const categoryScores = selectedSegments.map((segment) => {
    const category = segment.categories[input.category];
    const leakagePct = finite(category?.leakagePct);
    const walletIndex = finite(category?.totalWalletIndex);
    const channelBoost = 1 + onlineShiftPct / 200;
    return Math.round((leakagePct * walletIndex * recapturePct * multiplier * channelBoost) / 100);
  });
  const walletUpliftIndex = Math.round(categoryScores.reduce((sum, value) => sum + value, 0) / selectedSegments.length);
  const opportunityIndexDelta = Math.round(walletUpliftIndex / 8);
  const pitchNowGuestsK = Math.round(selectedSegments.reduce((sum, segment) => sum + finite(segment.sizeLowK), 0) * (recapturePct / 100));

  return {
    walletUpliftIndex,
    opportunityIndexDelta,
    pitchNowGuestsK,
    projectedBand: formatEnriched(`${Math.max(1, Math.round(walletUpliftIndex / 9))}-${Math.max(2, Math.round(walletUpliftIndex / 5))}k equiv./mo`, 'band'),
    constellationShift: selectedSegments.map((segment, index) => ({
      segmentId: segment.id,
      label: segment.name,
      beforeIndex: finite(segment.opportunityIndex),
      afterIndex: finite(segment.opportunityIndex) + opportunityIndexDelta + Math.round(categoryScores[index] / 20),
    })),
  };
}
```

- [ ] **Step 4: Add route and chart tests**

Create `src/components/charts/scenario-impact-constellation.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { latestSegments } from '@/data';
import { buildScenarioImpact } from '@/lib/scenario-simulator';
import { ScenarioImpactConstellation } from './scenario-impact-constellation';

it('renders scenario before and after index shifts', () => {
  const impact = buildScenarioImpact({
    segments: latestSegments,
    segmentIds: ['cosmopolitan-connoisseurs'],
    category: 'fnb',
    recapturePct: 20,
    onlineShiftPct: 8,
    lever: 'contentPersonalisation',
  });

  render(<ScenarioImpactConstellation impact={impact} />);

  expect(screen.getByRole('figure', { name: /Scenario constellation shift/i })).toBeInTheDocument();
  expect(screen.getByText(/Cosmopolitan Connoisseurs/i)).toBeInTheDocument();
  expect(screen.getByText(/Before/i)).toBeInTheDocument();
  expect(screen.getByText(/After/i)).toBeInTheDocument();
});
```

Create `src/app/simulate/page.test.tsx` with a mocked `useAppState` mirroring Task 5 and assert:

```tsx
expect(screen.getByRole('heading', { name: /What-if Scenario Simulator/i })).toBeInTheDocument();
expect(screen.getByRole('slider', { name: /Recapture leakage/i })).toBeInTheDocument();
expect(screen.getByRole('slider', { name: /Shift online channel mix/i })).toBeInTheDocument();
expect(screen.getByRole('button', { name: /Save scenario/i })).toBeInTheDocument();
expect(screen.queryByText(/HKD|MOP|\$|元|澳門幣|NaN|Infinity/i)).not.toBeInTheDocument();
```

- [ ] **Step 5: Implement scenario chart**

Create `src/components/charts/scenario-impact-constellation.tsx`:

```tsx
import type { ScenarioImpact } from '@/data';

export function ScenarioImpactConstellation({ impact }: { impact: ScenarioImpact }) {
  return (
    <figure aria-label="Scenario constellation shift" className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
      <figcaption className="text-sm font-semibold text-galaxy-cream">Scenario constellation shift</figcaption>
      <div className="mt-4 grid gap-3">
        {impact.constellationShift.map((item) => {
          const width = Math.min(100, Math.max(8, (item.afterIndex / 240) * 100));
          return (
            <div key={item.segmentId} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-galaxy-cream">{item.label}</span>
                <span className="text-galaxy-gold">After Index {Math.round(item.afterIndex)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-galaxy-border/50">
                <div className="h-full rounded-full bg-galaxy-gold" style={{ width: `${width}%` }} />
              </div>
              <p className="text-xs text-galaxy-muted">Before Index {Math.round(item.beforeIndex)} · After Index {Math.round(item.afterIndex)}</p>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
```

- [ ] **Step 6: Implement simulator route**

Create `src/app/simulate/page.tsx` as a client route with sliders:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { ScenarioImpactConstellation } from '@/components/charts/scenario-impact-constellation';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { buildScenarioImpact } from '@/lib/scenario-simulator';
import { useAppState } from '@/store/app-store';
import type { CoreCategory, ScenarioLever } from '@/data';

const categoryOptions: Array<{ value: CoreCategory; label: string }> = [
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'fnb', label: 'F&B' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'retailLuxury', label: 'Retail luxury' },
];

export default function SimulatePage() {
  const { segments, selectedSegment, saveScenario } = useAppState();
  const [category, setCategory] = useState<CoreCategory>('fnb');
  const [recapturePct, setRecapturePct] = useState(20);
  const [onlineShiftPct, setOnlineShiftPct] = useState(8);
  const [lever, setLever] = useState<ScenarioLever>('contentPersonalisation');
  const [savedName, setSavedName] = useState('');
  const segmentIds = [selectedSegment.id];
  const impact = useMemo(() => buildScenarioImpact({
    segments,
    segmentIds,
    category,
    recapturePct,
    onlineShiftPct,
    lever,
  }), [category, lever, onlineShiftPct, recapturePct, segmentIds, segments]);

  function saveCurrentScenario() {
    const scenario = saveScenario({
      name: `${selectedSegment.name} ${category} recapture`,
      segmentIds,
      category,
      recapturePct,
      onlineShiftPct,
      lever,
    });
    setSavedName(scenario.name);
  }

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Decision intelligence"
        title="What-if Scenario Simulator"
        description="Move CDE-safe levers and see how indexed wallet uplift, opportunity, pitch-now volume, and constellation position respond."
      />
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <Panel>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted" htmlFor="scenario-category">Category</label>
          <select id="scenario-category" value={category} onChange={(event) => setCategory(event.target.value as CoreCategory)} className="mt-2 w-full rounded-lg border border-galaxy-border bg-galaxy-ink p-2 text-sm">
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <label className="mt-5 block text-sm font-semibold text-galaxy-cream" htmlFor="recapture">Recapture leakage {recapturePct}%</label>
          <input id="recapture" aria-label="Recapture leakage" type="range" min={0} max={60} value={recapturePct} onChange={(event) => setRecapturePct(Number(event.target.value))} className="mt-2 w-full" />
          <label className="mt-5 block text-sm font-semibold text-galaxy-cream" htmlFor="channel-shift">Shift online channel mix {onlineShiftPct}%</label>
          <input id="channel-shift" aria-label="Shift online channel mix" type="range" min={-20} max={30} value={onlineShiftPct} onChange={(event) => setOnlineShiftPct(Number(event.target.value))} className="mt-2 w-full" />
          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted" htmlFor="scenario-lever">Lever</label>
          <select id="scenario-lever" value={lever} onChange={(event) => setLever(event.target.value as ScenarioLever)} className="mt-2 w-full rounded-lg border border-galaxy-border bg-galaxy-ink p-2 text-sm">
            <option value="contentPersonalisation">Content personalisation</option>
            <option value="hostLift">Host lift</option>
            <option value="channelShift">Channel shift</option>
            <option value="recapture">Recapture only</option>
          </select>
          <button type="button" onClick={saveCurrentScenario} className="mt-5 w-full rounded-lg border border-galaxy-gold bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink">Save scenario</button>
          {savedName ? <p role="status" className="mt-3 text-sm text-galaxy-gold">{savedName} saved</p> : null}
        </Panel>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Panel><p className="text-xs text-galaxy-muted">Wallet uplift</p><p className="mt-2 text-2xl font-semibold text-galaxy-gold">Index {impact.walletUpliftIndex}</p></Panel>
            <Panel><p className="text-xs text-galaxy-muted">Opportunity delta</p><p className="mt-2 text-2xl font-semibold text-galaxy-cream">+{impact.opportunityIndexDelta}</p></Panel>
            <Panel><p className="text-xs text-galaxy-muted">Pitch-now movement</p><p className="mt-2 text-2xl font-semibold text-galaxy-cream">{impact.pitchNowGuestsK}k</p></Panel>
          </div>
          <ScenarioImpactConstellation impact={impact} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Add simulator navigation and e2e checks**

In `src/components/shell/nav.tsx`, import `SlidersHorizontal` and add:

```ts
{ href: '/simulate', label: 'Simulator', shortLabel: 'Simulate', icon: SlidersHorizontal },
```

In `e2e/compliance.spec.ts`, add `/simulate` to routes and assert:

```ts
if (route === '/simulate') {
  await expect(page.getByRole('heading', { name: /What-if Scenario Simulator/i })).toBeVisible();
  await expect(page.getByRole('slider', { name: /Recapture leakage/i })).toBeVisible();
}
```

- [ ] **Step 8: Run simulator tests**

Run:

```bash
npm run test -- src/lib/scenario-simulator.test.ts src/components/charts/scenario-impact-constellation.test.tsx src/app/simulate/page.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "simulate|Simulator"
```

Expected: PASS.

- [ ] **Step 9: Commit Task 6**

```bash
git add src/lib/scenario-simulator.ts src/lib/scenario-simulator.test.ts src/components/charts/scenario-impact-constellation.tsx src/components/charts/scenario-impact-constellation.test.tsx src/app/simulate/page.tsx src/app/simulate/page.test.tsx src/components/shell/nav.tsx e2e/compliance.spec.ts
git commit -m "feat: add wallet what-if simulator"
```

---

### Task 7: Cross-Lens Journey Route

**Files:**
- Create: `src/lib/journey.ts`
- Test: `src/lib/journey.test.ts`
- Create: `src/app/journey/page.tsx`
- Test: `src/app/journey/page.test.tsx`
- Modify: `src/components/shell/nav.tsx`
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Write failing journey tests**

Create `src/lib/journey.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { corridors, latestSegments } from '@/data';
import { buildCrossLensJourney } from './journey';

describe('cross-lens journey', () => {
  it('builds an acquire-convert-grow loop from source data', () => {
    const journey = buildCrossLensJourney({ corridors, segments: latestSegments });

    expect(journey.headline).toMatch(/Acquire the right guests/i);
    expect(journey.stages).toHaveLength(4);
    expect(journey.stages.map((stage) => stage.href)).toEqual(['/corridors/korea', '/segments', '/leakage', '/activation']);
    expect(journey.stages.every((stage) => stage.metric.length > 0)).toBe(true);
    expect(JSON.stringify(journey)).not.toMatch(/HKD|MOP|\$|元|澳門幣|NaN|Infinity/i);
  });
});
```

- [ ] **Step 2: Implement journey builder**

Create `src/lib/journey.ts`:

```ts
import type { Corridor, Segment } from '@/data';
import { formatEnriched } from './format';

export interface JourneyStage {
  id: 'acquire' | 'convert' | 'capture' | 'grow';
  title: string;
  description: string;
  metric: string;
  href: '/corridors/korea' | '/segments' | '/leakage' | '/activation';
}

export interface CrossLensJourney {
  headline: string;
  stages: JourneyStage[];
}

function finite(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function buildCrossLensJourney({ corridors, segments }: { corridors: Corridor[]; segments: Segment[] }): CrossLensJourney {
  const topCorridor = [...corridors].sort((first, second) => finite(second.priorityIndex) - finite(first.priorityIndex))[0];
  const topSegment = [...segments].sort((first, second) => finite(second.opportunityIndex) - finite(first.opportunityIndex))[0];
  const topLeakage = topSegment
    ? Object.values(topSegment.categories).reduce((max, category) => Math.max(max, finite(category.leakagePct)), 0)
    : 0;

  return {
    headline: 'Acquire the right guests, then grow their wallet - one connected loop.',
    stages: [
      {
        id: 'acquire',
        title: `Acquire: ${topCorridor?.name ?? 'Priority corridor'}`,
        description: 'Start with aggregate inbound corridor demand and non-gaming intent.',
        metric: topCorridor ? formatEnriched(topCorridor.priorityIndex, 'index') : formatEnriched(0, 'index'),
        href: '/corridors/korea',
      },
      {
        id: 'convert',
        title: `Convert: ${topSegment?.name ?? 'Priority segment'}`,
        description: 'Map arrivals into wallet/persona segments with Galaxy first-party and Mastercard CDE signals.',
        metric: topSegment ? formatEnriched(topSegment.opportunityIndex, 'index') : formatEnriched(0, 'index'),
        href: '/segments',
      },
      {
        id: 'capture',
        title: 'Capture: wallet leakage',
        description: 'Quantify where comparable off-property wallet remains outside Galaxy.',
        metric: formatEnriched(topLeakage, 'pct'),
        href: '/leakage',
      },
      {
        id: 'grow',
        title: 'Grow: activation and proof',
        description: 'Turn the segment into activation, then measure incremental lift.',
        metric: topSegment ? formatEnriched(topSegment.crossPropertyCashBand, 'band') : formatEnriched('0-0k equiv./mo', 'band'),
        href: '/activation',
      },
    ],
  };
}
```

- [ ] **Step 3: Add route test**

Create `src/app/journey/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import JourneyPage from './page';

it('renders cross-lens acquire-convert-grow journey with source links', () => {
  render(<JourneyPage />);

  expect(screen.getByRole('heading', { name: /Acquire, Convert, Grow/i })).toBeInTheDocument();
  expect(screen.getByText(/one connected loop/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Acquire/i })).toHaveAttribute('href', '/corridors/korea');
  expect(screen.getByRole('link', { name: /Convert/i })).toHaveAttribute('href', '/segments');
  expect(screen.getByRole('link', { name: /Capture/i })).toHaveAttribute('href', '/leakage');
  expect(screen.getByRole('link', { name: /Grow/i })).toHaveAttribute('href', '/activation');
  expect(screen.queryByText(/HKD|MOP|\$|元|澳門幣/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 4: Implement journey route**

Create `src/app/journey/page.tsx`:

```tsx
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { corridors, latestSegments } from '@/data';
import { buildCrossLensJourney } from '@/lib/journey';

export default function JourneyPage() {
  const journey = buildCrossLensJourney({ corridors, segments: latestSegments });

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Cross-lens loop"
        title="Acquire, Convert, Grow"
        description={journey.headline}
      />
      <div className="grid gap-4 lg:grid-cols-4">
        {journey.stages.map((stage, index) => (
          <Link key={stage.id} href={stage.href} aria-label={stage.title}>
            <Panel className="h-full transition hover:border-galaxy-gold">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">Stage {index + 1}</p>
              <h2 className="mt-3 text-xl font-semibold text-galaxy-cream">{stage.title}</h2>
              <p className="mt-3 text-2xl font-semibold text-galaxy-gold">{stage.metric}</p>
              <p className="mt-3 text-sm leading-6 text-galaxy-muted">{stage.description}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Add navigation and e2e checks**

In `src/components/shell/nav.tsx`, import `Workflow` and add:

```ts
{ href: '/journey', label: 'Journey', shortLabel: 'Journey', icon: Workflow },
```

`/journey` can live in the wallet nav because it is the cross-lens closing screen. Keep `isAcquisitionLens()` unchanged.

In `e2e/compliance.spec.ts`, add `/journey` to routes and assert:

```ts
if (route === '/journey') {
  await expect(page.getByRole('heading', { name: /Acquire, Convert, Grow/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Acquire/i })).toBeVisible();
}
```

- [ ] **Step 6: Run journey tests**

Run:

```bash
npm run test -- src/lib/journey.test.ts src/app/journey/page.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "journey|Acquire, Convert, Grow"
```

Expected: PASS.

- [ ] **Step 7: Commit Task 7**

```bash
git add src/lib/journey.ts src/lib/journey.test.ts src/app/journey/page.tsx src/app/journey/page.test.tsx src/components/shell/nav.tsx e2e/compliance.spec.ts
git commit -m "feat: add cross-lens journey loop"
```

---

### Task 8: Content Depth, Multilingual Variants, and Launch-to-Measurement Hook

**Files:**
- Modify: `src/lib/acquisition-content.ts`
- Modify: `src/lib/acquisition-content.test.ts`
- Modify: `src/components/panels/content-draft-card.tsx`
- Modify: `src/components/panels/content-draft-card.test.tsx`
- Modify: `src/app/acquisition/page.tsx`
- Modify: `src/app/acquisition/page.test.tsx`
- Modify: `src/app/activation/page.tsx`
- Modify: `src/app/activation/page.test.tsx`

- [ ] **Step 1: Add failing content generation tests**

Extend `src/lib/acquisition-content.test.ts`:

```ts
it('builds multilingual EN Traditional Chinese and Korean A/B content with guardrails', () => {
  const draft = buildAcquisitionDraft(priorityCorridor, 'entertainment_lover');

  expect(draft.languages).toEqual(expect.arrayContaining(['EN', '繁中', '한국어']));
  expect(draft.variants.filter((variant) => variant.id === 'A').length).toBeGreaterThanOrEqual(3);
  expect(draft.variants.filter((variant) => variant.id === 'B').length).toBeGreaterThanOrEqual(3);
  expect(JSON.stringify(draft)).toMatch(/brand voice|compliance|guardrail/i);
  expect(JSON.stringify(draft)).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
});
```

- [ ] **Step 2: Extend draft data generation**

In `src/lib/acquisition-content.ts`, keep the same function name and return `AcquisitionDraft` with language-specific variants. Use this structure inside `buildAcquisitionDraft()`:

```ts
const languageVariants: AcquisitionDraft['variants'] = [
  {
    id: 'A',
    language: 'EN',
    subject: `${corridor.name} ${persona.label}: ${theme}`,
    body: `Invite ${corridor.name} ${persona.label} travellers with ${persona.recommendedOffer}. Keep the message indexed, directional, and grounded in CDE corridor signals.`,
    guardrail: 'brand voice: premium and concise · compliance: no raw spend, no PII',
  },
  {
    id: 'B',
    language: 'EN',
    subject: `${persona.label} escape for ${corridor.name}`,
    body: `Position Galaxy Rewards around ${persona.topCategories.join(', ')} with ${projectedValueBand} modelled opportunity bands only.`,
    guardrail: 'brand voice: invitation-led · compliance: CDE-safe bands only',
  },
  {
    id: 'A',
    language: '繁中',
    subject: `${corridor.nameZh} ${persona.label} 精選禮遇`,
    body: `以${persona.recommendedOffer}邀請${corridor.nameZh}旅客，訊息只使用指數、百分比及模型化區間。`,
    guardrail: 'brand voice: 尊貴清晰 · compliance: 不展示原始消費或個人資料',
  },
  {
    id: 'B',
    language: '繁中',
    subject: `${persona.label} 澳門週末靈感`,
    body: `圍繞${persona.topCategories.join('、')}建立行程亮點，並標註為CDE模型化洞察。`,
    guardrail: 'brand voice: 行程導向 · compliance: 只用CDE安全數值',
  },
  {
    id: 'A',
    language: '한국어',
    subject: `${corridor.name} ${persona.label} 갤럭시 초대`,
    body: `${persona.recommendedOffer} 중심으로 ${corridor.name} 고객에게 프리미엄 여정을 제안합니다. 수치는 지수와 모델 밴드만 사용합니다.`,
    guardrail: 'brand voice: premium and service-led · compliance: no raw spend, no PII',
  },
  {
    id: 'B',
    language: '한국어',
    subject: `${persona.label} 코타이 주말 제안`,
    body: `${persona.topCategories.join(', ')} 관심사를 중심으로 Galaxy Rewards 혜택을 구성합니다.`,
    guardrail: 'brand voice: concise and curated · compliance: CDE-safe values only',
  },
];
```

Return:

```ts
languages: uniqueLanguages(['EN', '繁中', '한국어']),
variants: languageVariants,
versionHistory: ['v1 corridor signal', 'v2 persona offer', 'v3 multilingual guardrails', 'v4 measurement-ready launch'],
```

- [ ] **Step 3: Add failing content card test**

Extend `src/components/panels/content-draft-card.test.tsx`:

```tsx
it('renders language tabs, guardrails, version history, and launch action', async () => {
  const user = userEvent.setup();
  const onLaunch = vi.fn();
  render(<ContentDraftCard draft={buildAcquisitionDraft(priorityCorridor, 'entertainment_lover')} onLaunch={onLaunch} />);

  expect(screen.getByRole('tab', { name: 'EN' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: '繁中' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: '한국어' })).toBeInTheDocument();
  expect(screen.getByText(/guardrail/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /Launch campaign/i }));

  expect(onLaunch).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 4: Update content card UI**

Change `ContentDraftCard` props:

```tsx
export function ContentDraftCard({ draft, onLaunch }: { draft: AcquisitionDraft; onLaunch?: () => void }) {
```

Add language state:

```tsx
const [language, setLanguage] = useState<AcquisitionDraft['languages'][number]>(draft.languages[0]);
const visibleVariants = draft.variants.filter((variant) => variant.language === language);
```

Render language tabs:

```tsx
<div role="tablist" aria-label="Draft languages" className="mt-4 flex gap-2 overflow-x-auto">
  {draft.languages.map((item) => (
    <button
      key={item}
      type="button"
      role="tab"
      aria-selected={language === item}
      onClick={() => setLanguage(item)}
      className={language === item ? 'rounded border border-galaxy-gold bg-galaxy-gold px-3 py-1 text-xs font-semibold text-galaxy-ink' : 'rounded border border-galaxy-border px-3 py-1 text-xs font-semibold text-galaxy-muted'}
    >
      {item}
    </button>
  ))}
</div>
```

Render `visibleVariants` and include `variant.guardrail`. Add the launch button:

```tsx
{onLaunch ? (
  <button
    type="button"
    onClick={onLaunch}
    className="mt-5 rounded-lg border border-galaxy-gold bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink"
  >
    Launch campaign
  </button>
) : null}
```

- [ ] **Step 5: Wire acquisition launch into app state**

In `src/app/acquisition/page.tsx`, import `useAppState` and call `launchCampaign`:

```tsx
const { launchCampaign } = useAppState();

function handleLaunchCampaign() {
  launchCampaign({
    source: 'acquisition',
    audienceName: `${corridor.name} ${draft.persona}`,
    segmentIds: ['cosmopolitan-connoisseurs'],
    corridorId: corridor.id,
    lever: draft.variants[0]?.subject ?? 'Corridor acquisition content',
  });
}
```

Pass to the card:

```tsx
<ContentDraftCard draft={draft} onLaunch={handleLaunchCampaign} />
```

- [ ] **Step 6: Wire activation launch into measurement**

In `src/app/activation/page.tsx`, replace `pushCampaign` in state destructuring with `launchCampaign` and update `pushAudienceCampaign()`:

```ts
const { segments, savedAudiences, campaignToast, launchCampaign } = useAppState();

function pushAudienceCampaign() {
  launchCampaign({
    source: 'activation',
    audienceName: activeAudience.name,
    segmentIds: activeAudience.segmentIds,
    lever: cards[0]?.play.lever ?? 'Galaxy Rewards activation',
  });
}
```

Keep the existing toast rendering because `launchCampaign()` sets `campaignToast`.

- [ ] **Step 7: Update acquisition and activation route tests**

In `src/app/acquisition/page.test.tsx`, assert:

```tsx
expect(screen.getByRole('button', { name: /Launch campaign/i })).toBeInTheDocument();
expect(screen.getByRole('tab', { name: '한국어' })).toBeInTheDocument();
expect(screen.getByText(/measurement-ready launch/i)).toBeInTheDocument();
```

In `src/app/activation/page.test.tsx`, mock `launchCampaign` and assert the primary card invokes it:

```tsx
await user.click(screen.getAllByRole('button', { name: /Push to Galaxy Rewards/i })[0]);
expect(launchCampaign).toHaveBeenCalledWith(expect.objectContaining({
  source: 'activation',
  audienceName: expect.any(String),
  segmentIds: expect.any(Array),
}));
```

- [ ] **Step 8: Run content and activation tests**

Run:

```bash
npm run test -- src/lib/acquisition-content.test.ts src/components/panels/content-draft-card.test.tsx src/app/acquisition/page.test.tsx src/app/activation/page.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit Task 8**

```bash
git add src/lib/acquisition-content.ts src/lib/acquisition-content.test.ts src/components/panels/content-draft-card.tsx src/components/panels/content-draft-card.test.tsx src/app/acquisition/page.tsx src/app/acquisition/page.test.tsx src/app/activation/page.tsx src/app/activation/page.test.tsx
git commit -m "feat: connect campaign content to measurement"
```

---

### Task 9: Governance Page, Haul Labels, Confidence Cues, and Presenter Tour

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/corridors.ts`
- Modify: `src/data/corridors.test.ts`
- Create: `src/components/panels/governance-summary-panel.tsx`
- Test: `src/components/panels/governance-summary-panel.test.tsx`
- Create: `src/app/governance/page.tsx`
- Test: `src/app/governance/page.test.tsx`
- Create: `src/components/shell/presenter-tour.tsx`
- Test: `src/components/shell/presenter-tour.test.tsx`
- Modify: `src/components/shell/app-shell.tsx`
- Modify: `src/components/shell/nav.tsx`
- Modify: `src/components/ui/cde-chip.tsx` or create `src/components/ui/confidence-cue.tsx`
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Write failing corridor haul tests**

Modify `src/data/corridors.test.ts`:

```ts
it('uses defensible Macau corridor haul labels', () => {
  const byId = Object.fromEntries(corridors.map((corridor) => [corridor.id, corridor.haul]));

  expect(byId.hongkong).toBe('short');
  expect(byId.gba_mainland).toBe('short');
  expect(byId.singapore).toBe('short');
  expect(byId.malaysia).toBe('short');
  expect(byId.thailand).toBe('short');
  expect(byId.indonesia).toBe('short');
  expect(byId.philippines).toBe('short');
  expect(byId.korea).toBe('medium');
  expect(byId.japan).toBe('medium');
  expect(byId.taiwan).toBe('medium');
  expect(corridors.some((corridor) => corridor.haul === 'long')).toBe(false);
});
```

- [ ] **Step 2: Update haul labels**

In `src/data/types.ts`, ensure:

```ts
export type CorridorHaul = 'short' | 'medium' | 'long';
```

In `src/data/corridors.ts`, set:

```ts
taiwan.haul = 'medium'
japan.haul = 'medium'
korea.haul = 'medium'
hongkong.haul = 'short'
gba_mainland.haul = 'short'
singapore.haul = 'short'
malaysia.haul = 'short'
thailand.haul = 'short'
indonesia.haul = 'short'
philippines.haul = 'short'
```

Do this by editing each object literal, not by mutating at runtime.

- [ ] **Step 3: Write governance panel tests**

Create `src/components/panels/governance-summary-panel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { methodology } from '@/data';
import { GovernanceSummaryPanel } from './governance-summary-panel';

it('renders methodology, coverage, cross-border governance, and no PII claims', () => {
  render(<GovernanceSummaryPanel methodology={methodology} />);

  expect(screen.getByText(/Data governance/i)).toBeInTheDocument();
  expect(screen.getByText(/10–20% panel/i)).toBeInTheDocument();
  expect(screen.getByText(/63% matched/i)).toBeInTheDocument();
  expect(screen.getByText(/PIPL/i)).toBeInTheDocument();
  expect(screen.getByText(/HK PDPO/i)).toBeInTheDocument();
  expect(screen.getByText(/Macau PDPA/i)).toBeInTheDocument();
  expect(screen.getByText(/no PII/i)).toBeInTheDocument();
});
```

- [ ] **Step 4: Implement governance panel and route**

Create `src/components/panels/governance-summary-panel.tsx`:

```tsx
import type { Methodology } from '@/data';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';

export function GovernanceSummaryPanel({ methodology }: { methodology: Methodology }) {
  return (
    <Panel>
      <SectionHeader
        eyebrow="Governed CDE layer"
        title="Data governance"
        description="Galaxy first-party signals and Mastercard CDE enrichment stay masked, indexed, auditable, and role-aware."
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-3">
          <p className="text-xs text-galaxy-muted">Coverage</p>
          <p className="mt-2 text-xl font-semibold text-galaxy-gold">{methodology.matchedCoveragePct}% matched</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-3">
          <p className="text-xs text-galaxy-muted">Panel</p>
          <p className="mt-2 text-xl font-semibold text-galaxy-cream">{methodology.panelSharePct} panel</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-3">
          <p className="text-xs text-galaxy-muted">Basis</p>
          <p className="mt-2 text-xl font-semibold text-galaxy-cream">{methodology.basis}</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-3">
          <p className="text-xs text-galaxy-muted">Refresh</p>
          <p className="mt-2 text-xl font-semibold text-galaxy-cream">{methodology.refresh}</p>
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-4 text-sm leading-6 text-galaxy-cream">
        Cross-border governance note: PIPL, HK PDPO, and Macau PDPA controls are represented as role-based access, masked IDs, aggregate corridor data, no PII exposure, and CDE-safe values only.
      </div>
    </Panel>
  );
}
```

Create `src/app/governance/page.tsx`:

```tsx
import { GovernanceSummaryPanel } from '@/components/panels/governance-summary-panel';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { methodology } from '@/data';

export default function GovernancePage() {
  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="How it works"
        title="Data Governance"
        description="The demo uses a governed, CDE-safe semantic layer: masked synthetic records, aggregate corridor data, and auditable assistant facts."
      />
      <GovernanceSummaryPanel methodology={methodology} />
      <Panel>
        <h2 className="text-xl font-semibold text-galaxy-cream">Assistant grounding</h2>
        <p className="mt-3 text-sm leading-6 text-galaxy-muted">
          Ask CDE AI answers only from deterministic app data. The audit expander lists the source field and route behind each figure.
        </p>
      </Panel>
    </div>
  );
}
```

Create `src/app/governance/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import GovernancePage from './page';

it('renders governance route with cross-border controls', () => {
  render(<GovernancePage />);

  expect(screen.getByRole('heading', { name: /Data Governance/i })).toBeInTheDocument();
  expect(screen.getByText(/PIPL/i)).toBeInTheDocument();
  expect(screen.getByText(/HK PDPO/i)).toBeInTheDocument();
  expect(screen.getByText(/Macau PDPA/i)).toBeInTheDocument();
  expect(screen.getByText(/Assistant grounding/i)).toBeInTheDocument();
});
```

- [ ] **Step 5: Add presenter tour tests**

Create `src/components/shell/presenter-tour.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresenterTour } from './presenter-tour';

it('renders guided tour stops and advances deterministically', async () => {
  const user = userEvent.setup();
  render(<PresenterTour />);

  await user.click(screen.getByRole('button', { name: /Open presenter tour/i }));

  expect(screen.getByRole('dialog', { name: /Presenter tour/i })).toBeInTheDocument();
  expect(screen.getByText(/1 of/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /Next stop/i }));

  expect(screen.getByText(/2 of/i)).toBeInTheDocument();
});
```

- [ ] **Step 6: Implement presenter tour**

Create `src/components/shell/presenter-tour.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Presentation, X } from 'lucide-react';

const tourStops = [
  { href: '/', title: 'Executive overview', script: 'Start with the Galaxy and Mastercard data-fusion thesis.' },
  { href: '/segments', title: 'Segmentation', script: 'Show personas and wallet leakage discovery.' },
  { href: '/guests', title: 'Customer 360', script: 'Move from segment to host-ready synthetic customer evidence.' },
  { href: '/measurement', title: 'Measurement', script: 'Prove impact through test versus control lift.' },
  { href: '/governance', title: 'Governance', script: 'Close with grounded, auditable AI and cross-border governance.' },
] as const;

export function PresenterTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const stop = tourStops[index];

  return (
    <>
      <button
        type="button"
        aria-label="Open presenter tour"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.25rem)] left-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-galaxy-border bg-galaxy-charcoal text-galaxy-gold shadow-lg lg:left-auto lg:right-5"
      >
        <Presentation aria-hidden="true" size={18} />
      </button>
      {isOpen ? (
        <section role="dialog" aria-label="Presenter tour" className="fixed bottom-[calc(env(safe-area-inset-bottom)+6.75rem)] left-3 right-3 z-50 rounded-lg border border-galaxy-border bg-galaxy-ink p-4 shadow-2xl lg:left-auto lg:right-5 lg:w-96">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">{index + 1} of {tourStops.length}</p>
              <h2 className="mt-1 text-lg font-semibold text-galaxy-cream">{stop.title}</h2>
            </div>
            <button type="button" aria-label="Close presenter tour" onClick={() => setIsOpen(false)} className="text-galaxy-muted hover:text-galaxy-gold"><X size={16} /></button>
          </div>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{stop.script}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={stop.href} className="rounded border border-galaxy-gold bg-galaxy-gold px-3 py-2 text-xs font-semibold text-galaxy-ink">Open stop</Link>
            <button type="button" onClick={() => setIndex((current) => Math.min(tourStops.length - 1, current + 1))} className="rounded border border-galaxy-border px-3 py-2 text-xs font-semibold text-galaxy-cream">Next stop</button>
          </div>
        </section>
      ) : null}
    </>
  );
}
```

Mount in `src/components/shell/app-shell.tsx`:

```tsx
import { PresenterTour } from './presenter-tour';
...
<PresenterTour />
```

- [ ] **Step 7: Add navigation and e2e checks**

In `src/components/shell/nav.tsx`, import `ShieldCheck` and add:

```ts
{ href: '/governance', label: 'Governance', shortLabel: 'Gov', icon: ShieldCheck },
```

In `e2e/compliance.spec.ts`, add `/governance` to `routes` and assert:

```ts
if (route === '/governance') {
  await expect(page.getByRole('heading', { name: /Data Governance/i })).toBeVisible();
  await expect(page.getByText(/PIPL/i)).toBeVisible();
  await expect(page.getByText(/no PII/i)).toBeVisible();
}
```

Add a focused presenter check:

```ts
test('presenter tour opens and stays within mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /Open presenter tour/i }).click();
  await expect(page.getByRole('dialog', { name: /Presenter tour/i })).toBeVisible();
  expect(await documentScrollWidth(page)).toBeLessThanOrEqual(390);
});
```

- [ ] **Step 8: Run governance and presenter tests**

Run:

```bash
npm run test -- src/data/corridors.test.ts src/components/panels/governance-summary-panel.test.tsx src/app/governance/page.test.tsx src/components/shell/presenter-tour.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "governance|presenter"
```

Expected: PASS.

- [ ] **Step 9: Commit Task 9**

```bash
git add src/data/types.ts src/data/corridors.ts src/data/corridors.test.ts src/components/panels/governance-summary-panel.tsx src/components/panels/governance-summary-panel.test.tsx src/app/governance/page.tsx src/app/governance/page.test.tsx src/components/shell/presenter-tour.tsx src/components/shell/presenter-tour.test.tsx src/components/shell/app-shell.tsx src/components/shell/nav.tsx e2e/compliance.spec.ts
git commit -m "feat: add governance page and presenter tour"
```

---

### Task 10: Full Sprint Verification, Responsive QA, and Publish Prep

**Files:**
- Modify: `e2e/compliance.spec.ts`
- No code files should be modified unless verification exposes a concrete defect.

- [ ] **Step 1: Add final all-new-routes responsive checks**

In `e2e/compliance.spec.ts`, add this loop:

```ts
for (const viewport of [
  { label: 'iPhone', width: 390, height: 844 },
  { label: 'iPad', width: 820, height: 1180 },
  { label: 'desktop', width: 1440, height: 900 },
]) {
  test(`Sprint 3 routes remain CDE-safe and responsive on ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const route of ['/measurement', '/simulate', '/journey', '/governance']) {
      await gotoStableRoute(page, route);
      await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
      expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);
    }
  });
}
```

- [ ] **Step 2: Run targeted route tests**

Run:

```bash
npm run test -- src/app/measurement/page.test.tsx src/app/simulate/page.test.tsx src/app/journey/page.test.tsx src/app/governance/page.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run full unit suite**

Run:

```bash
npm run test
```

Expected: PASS with all Vitest files passing.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: PASS; the route list includes `/measurement`, `/simulate`, `/journey`, and `/governance`.

- [ ] **Step 5: Run full e2e suite**

Run:

```bash
npm run test:e2e
```

Expected: PASS; all new Sprint 3 route checks are green on Chromium and mobile Safari projects.

- [ ] **Step 6: Run final verification**

Run:

```bash
npm run verify
```

Expected: PASS: lint, unit tests, build, and Playwright all complete successfully.

- [ ] **Step 7: Inspect working tree before publish**

Run:

```bash
git status -sb
git diff --check
```

Expected:

```text
## <branch-name>
```

plus only intended Sprint 3 tracked changes. `git diff --check` prints no whitespace errors.

- [ ] **Step 8: Commit final e2e additions if Task 10 changed only test files**

```bash
git add e2e/compliance.spec.ts
git commit -m "test: cover sprint 3 responsive compliance"
```

If `e2e/compliance.spec.ts` was already committed in earlier tasks and there is no diff, skip this commit and record that the branch is clean.

- [ ] **Step 9: Push the branch after verification**

```bash
git push -u origin "$(git branch --show-current)"
```

Expected: remote branch updates successfully. If GitHub authentication fails, use the existing repository credential flow already configured on this machine and do not print tokens.

---

## Self-Review

**Spec coverage**

- Epic 1 Governed Ask CDE AI: Tasks 2, 3, and 4 implement the semantic layer, grounded answers, inline visuals, starter prompts, follow-ups, and audit expander.
- Epic 2 Measurement loop: Task 1 creates campaign data/state; Task 5 implements calculation, route, visual, and Test & Learn note; Task 8 links launch into measurement.
- Epic 3 What-if simulator: Task 6 implements sliders, recomputed outputs, saved scenarios, and responsive visual response.
- Epic 4 Cross-lens loop: Task 7 implements `/journey` with corridor to segment to leakage to activation links.
- Epic 5 Content and activation depth: Task 8 implements multilingual A/B variants, guardrails, version history, and launch-to-measurement handoff.
- Epic 6 Polish, realism, and trust: Task 9 fixes haul labels, adds `/governance`, confidence/governance cues, and presenter tour; Task 10 verifies responsive/CDE safety.

**Placeholder scan**

- The plan uses concrete file paths, commands, expected outcomes, and code snippets for each implementation area.
- Every new function referenced in a later task is defined in an earlier task or in the same task.

**Type consistency**

- `MeasurementCampaign`, `CampaignWeeklyPoint`, `SavedScenario`, `ScenarioImpact`, and `SemanticFact` are defined in Task 1 before use.
- Assistant intents added in Task 3 match `SemanticIntent` values from Task 2.
- Store fields introduced in Task 1 are used by Measurement, Simulator, Acquisition, Activation, and the Assistant.
