# Galaxy Constellation Lens B Corridor Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Lens B, an Acquisition lens for source-market and corridor intelligence, beside the existing Lens A wallet-retention experience.

**Architecture:** Extend the existing seeded data layer with aggregate corridor data, then add a lens switch that changes the shell navigation between Wallet and Corridors. Build the new `/corridors`, `/corridors/[id]`, and `/acquisition` routes using existing Galaxy primitives, deterministic client-side templates, and CDE-safe display helpers. Existing Lens A screens remain unchanged except for shared shell navigation and the final lens-loop cross-link.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind v4, existing Lucide icons, existing Recharts-free simple chart components, Vitest with Testing Library, Playwright e2e.

---

## Spec Read And Scope Boundary

This plan implements `spec/Galaxy_Constellation_Lens_B_DELTA_SPEC.md` as a delta only. Do not re-scaffold, restyle, or replace the Lens A app. Reuse:

- Shell: `src/components/shell/app-shell.tsx`, `src/components/shell/nav.tsx`, `src/components/shell/top-bar.tsx`.
- UI primitives: `Panel`, `PageHeader`, `SectionHeader`, `Overline`, `CdeChip`, `PercentValue`, `IndexValue`, `BandValue`, `MetricTile`.
- Data conventions: `src/data/types.ts`, `src/data/generate.ts`, `src/data/index.ts`, `src/lib/rng.ts`, `src/lib/format.ts`.
- Testing conventions: route tests under `src/app/*/page.test.tsx`, component tests beside components, e2e in `e2e/compliance.spec.ts`.

Implementation guardrails:

- No backend, no API keys, no live LLM calls.
- Lens B data is aggregate inbound panel data only. No PII, no individual records.
- Lens B values render as percentages, indices, ranks, labels, or `equiv./mo` bands.
- No `MOP`, `HKD`, `$`, `元`, or exact money values in Lens B UI.
- Korea must always show `2020 base · refresh pending` wherever it appears as priority/ranking.
- Add methodology fields: `panelSharePct: '10–20%'`, `dataYears: ['2020', '2024']`, `lensBNote: 'aggregate inbound panel, no PII'`.
- Keep Korea as `priorityRank === 1` through computed ranking, not an authored rank.
- Do not implement the stretch map in this pass. Use ranked lists, bars, and heatmaps.

## File Structure

Create data and logic:

- `src/data/corridors.ts`: deterministic corridor inputs, computed priority ranking, exported `corridors`, `priorityCorridor`, `getCorridorById`, `CORRIDOR_YEARS`, `CORRIDOR_METRICS`, and labels.
- `src/data/corridors.test.ts`: invariants and compliance tests for corridor data.
- `src/lib/acquisition-content.ts`: deterministic acquisition content generator, A/B variants, language labels, version list.
- `src/lib/acquisition-content.test.ts`: tests for stable multilingual copy and banned currency avoidance.

Modify data exports:

- `src/data/types.ts`: add corridor, persona affinity, methodology, and acquisition draft types.
- `src/data/generate.ts`: extend `methodology` object only.
- `src/data/index.ts`: export corridor data and types.

Create shell lens switch:

- `src/components/shell/lens-switch.tsx`: Wallet Retention / Corridors Acquisition segmented links.
- `src/components/shell/lens-switch.test.tsx`: active-state and route-target tests.
- `src/components/shell/nav.tsx`: switch nav group from Wallet lens routes to Corridor lens routes based on pathname.
- `src/components/shell/nav.test.tsx`: verify both nav groups and active link behavior.
- `src/components/shell/top-bar.tsx`: render `LensSwitch` beside metadata/quarter selector.
- `src/components/shell/top-bar.test.tsx`: verify switch appears without breaking quarter selector.

Create Lens B chart components:

- `src/components/charts/gaming-split-bar.tsx`: aggregate gaming/non-gaming split.
- `src/components/charts/gaming-split-bar.test.tsx`: validates accessible split text and 100% invariant display.
- `src/components/charts/corridor-rank-table.tsx`: top inbound corridor ranking.
- `src/components/charts/corridor-rank-table.test.tsx`: verifies Korea tag, Taiwan/Singapore contrasts, and year/metric rendering.
- `src/components/charts/seasonality-heatmap.tsx`: month by corridor index heatmap.
- `src/components/charts/seasonality-heatmap.test.tsx`: verifies Japan festival peaks and SEA holiday annotation.
- `src/components/charts/persona-affinity-chart.tsx`: persona mix and co-spend themes.
- `src/components/charts/persona-affinity-chart.test.tsx`: verifies dominant persona, shares, and top categories.

Create Lens B panels:

- `src/components/panels/priority-corridor-tile.tsx`: Korea priority hero tile with refresh tag and acquisition link.
- `src/components/panels/priority-corridor-tile.test.tsx`: Korea #1 route and tag assertions.
- `src/components/panels/corridor-detail-panel.tsx`: corridor persona-to-offer detail panel.
- `src/components/panels/corridor-detail-panel.test.tsx`: detail bridge, offer, and `/acquisition` link assertions.
- `src/components/panels/acquisition-recommendation.tsx`: priority recommendation summary.
- `src/components/panels/acquisition-recommendation.test.tsx`: rationale/index/band/tag assertions.
- `src/components/panels/content-draft-card.tsx`: deterministic multilingual content hand-off.
- `src/components/panels/content-draft-card.test.tsx`: A/B variants, EN/繁中/corridor-language, version list.

Create routes:

- `src/app/corridors/page.tsx`: Source-Market & Corridor board.
- `src/app/corridors/page.test.tsx`: board controls, ranking, methodology, and compliance.
- `src/app/corridors/[id]/page.tsx`: corridor detail route.
- `src/app/corridors/[id]/page.test.tsx`: detail route for Korea and unknown corridor fallback.
- `src/app/acquisition/page.tsx`: priority recommendation and content hand-off.
- `src/app/acquisition/page.test.tsx`: acquisition route default and query-driven rendering.

Modify cross-link and documentation:

- `src/app/segments/page.tsx`: add one small Lens B cross-link panel from Lens A to `/corridors`.
- `src/app/segments/page.test.tsx`: assert the cross-link appears.
- `README.md`: append Lens B demo script and no-live-LLM note.
- `e2e/compliance.spec.ts`: include new routes in rendered compliance and add LensSwitch/acquisition checks.

---

### Task 1: Corridor Data Model, Methodology, And Deterministic Ranking

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/generate.ts`
- Modify: `src/data/index.ts`
- Create: `src/data/corridors.ts`
- Create: `src/data/corridors.test.ts`

- [ ] **Step 1: Add failing corridor data tests**

Create `src/data/corridors.test.ts`:

```ts
import {
  CORRIDOR_YEARS,
  corridors,
  getCorridorById,
  priorityCorridor,
} from './corridors';
import { methodology } from './generate';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('corridor acquisition data', () => {
  it('generates ten aggregate corridors across 2020 and 2024', () => {
    expect(corridors).toHaveLength(10);
    expect(CORRIDOR_YEARS).toEqual(['2020', '2024']);

    for (const corridor of corridors) {
      expect(corridor.seasonality).toHaveLength(12);
      expect(corridor.gamingSharePct + corridor.nonGamingSharePct).toBe(100);
      expect(corridor.priorityRank).toBeGreaterThanOrEqual(1);
      expect(corridor.priorityRank).toBeLessThanOrEqual(10);
      expect(JSON.stringify(corridor)).not.toMatch(bannedCurrencyPattern);
    }
  });

  it('computes Korea as the priority corridor while marking it as refresh pending', () => {
    expect(priorityCorridor.id).toBe('korea');
    expect(priorityCorridor.priorityRank).toBe(1);
    expect(priorityCorridor.dataVintage).toBe('2020');
    expect(priorityCorridor.note).toBe('Merging to the World');
  });

  it('bakes in the required corridor contrasts', () => {
    const taiwan = getCorridorById('taiwan');
    const singapore = getCorridorById('singapore');
    const japan = getCorridorById('japan');
    const hongKong = getCorridorById('hongkong');
    const malaysia = getCorridorById('malaysia');
    const thailand = getCorridorById('thailand');

    expect(taiwan.gamingSharePct).toBeGreaterThan(taiwan.nonGamingSharePct);
    expect(singapore.nonGamingMix.hospitality).toBeGreaterThan(singapore.nonGamingMix.retail);
    expect(Math.max(japan.seasonality[2], japan.seasonality[3])).toBeGreaterThan(130);
    expect(Math.max(japan.seasonality[9], japan.seasonality[10])).toBeGreaterThan(130);
    expect(hongKong.arrivalsIndex['2024']).toBeLessThan(hongKong.arrivalsIndex['2020']);
    expect(malaysia.seasonality[4]).toBeGreaterThanOrEqual(118);
    expect(thailand.seasonality[11]).toBeGreaterThanOrEqual(120);
  });

  it('extends methodology with Lens B aggregate-panel disclosure', () => {
    expect(methodology.panelSharePct).toBe('10–20%');
    expect(methodology.dataYears).toEqual(['2020', '2024']);
    expect(methodology.lensBNote).toBe('aggregate inbound panel, no PII');
  });
});
```

- [ ] **Step 2: Run the data test and confirm it fails**

Run:

```bash
npm run test -- src/data/corridors.test.ts
```

Expected: FAIL because `src/data/corridors.ts` does not exist and `methodology.panelSharePct` is not typed.

- [ ] **Step 3: Extend data types**

In `src/data/types.ts`, add these types after `MarketScanTile`:

```ts
export type CorridorId =
  | 'taiwan'
  | 'hongkong'
  | 'gba_mainland'
  | 'japan'
  | 'korea'
  | 'singapore'
  | 'malaysia'
  | 'thailand'
  | 'indonesia'
  | 'philippines';

export type CorridorYear = '2020' | '2024';
export type CorridorMetric = 'arrivals' | 'spend' | 'txnFrequency' | 'gamingSplit';
export type CorridorHaul = 'short' | 'long';
export type PersonaKey =
  | 'fnb_seeker'
  | 'entertainment_lover'
  | 'travel_lover'
  | 'luxury_shopper'
  | 'family_leisure';

export interface PersonaAffinity {
  persona: PersonaKey;
  label: string;
  sharePct: number;
  topCategories: string[];
  recommendedOffer: string;
  kvBrief: string;
}

export interface Corridor {
  id: CorridorId;
  name: string;
  nameZh: string;
  language: 'zh-TW' | 'zh-HK' | 'zh-CN' | 'ja' | 'ko' | 'en-SG' | 'ms' | 'th' | 'id' | 'fil';
  languageLabel: string;
  haul: CorridorHaul;
  arrivalsIndex: Record<CorridorYear, number>;
  spendIndex: Record<CorridorYear, number>;
  txnFrequencyIndex: number;
  avgTicketBand: 'mass' | 'upper-mid' | 'premium' | 'luxury';
  projectedValueBand: string;
  gamingSharePct: number;
  nonGamingSharePct: number;
  nonGamingMix: { hospitality: number; fnb: number; entertainment: number; retail: number };
  seasonality: number[];
  personas: PersonaAffinity[];
  priorityIndex: number;
  priorityRank: number;
  dataVintage: CorridorYear;
  note?: string;
}

export interface AcquisitionDraftVariant {
  id: 'A' | 'B';
  subject: string;
  body: string;
  kvCaption: string;
}

export interface AcquisitionDraft {
  corridorId: CorridorId;
  persona: PersonaKey;
  languages: Array<'EN' | '繁中' | string>;
  variants: AcquisitionDraftVariant[];
  versionHistory: string[];
}
```

Update the existing `Methodology` interface in `src/data/types.ts` to:

```ts
export interface Methodology {
  matchedCoveragePct: number;
  basis: 'demi-decile average';
  refresh: 'quarterly';
  activeMetricCount: 7;
  panelSharePct: '10–20%';
  dataYears: ['2020', '2024'];
  lensBNote: 'aggregate inbound panel, no PII';
}
```

- [ ] **Step 4: Extend methodology**

In `src/data/generate.ts`, replace `methodology` with:

```ts
export const methodology: Methodology = {
  matchedCoveragePct: 63,
  basis: 'demi-decile average',
  refresh: 'quarterly',
  activeMetricCount: 7,
  panelSharePct: '10–20%',
  dataYears: ['2020', '2024'],
  lensBNote: 'aggregate inbound panel, no PII',
};
```

- [ ] **Step 5: Create deterministic corridor data**

Create `src/data/corridors.ts` with this implementation outline and exact corridor inputs:

```ts
import { mulberry32 } from '@/lib/rng';
import type { Corridor, CorridorId, CorridorMetric, CorridorYear, PersonaAffinity } from './types';

export const CORRIDOR_YEARS = ['2020', '2024'] as const satisfies readonly CorridorYear[];
export const CORRIDOR_METRICS = ['arrivals', 'spend', 'txnFrequency', 'gamingSplit'] as const satisfies readonly CorridorMetric[];

export const CORRIDOR_METRIC_LABELS: Record<CorridorMetric, string> = {
  arrivals: 'Arrivals index',
  spend: 'Spend index',
  txnFrequency: 'Transaction frequency',
  gamingSplit: 'Gaming vs non-gaming',
};

interface CorridorInput extends Omit<Corridor, 'priorityIndex' | 'priorityRank'> {
  nonGamingMomentum: number;
  addressabilityGap: number;
}

function personas(items: PersonaAffinity[]): PersonaAffinity[] {
  return items;
}

const inputs: CorridorInput[] = [
  {
    id: 'taiwan',
    name: 'Taiwan',
    nameZh: '台灣',
    language: 'zh-TW',
    languageLabel: '繁中',
    haul: 'long',
    arrivalsIndex: { '2020': 128, '2024': 132 },
    spendIndex: { '2020': 144, '2024': 153 },
    txnFrequencyIndex: 136,
    avgTicketBand: 'luxury',
    projectedValueBand: '20-32k equiv./mo',
    gamingSharePct: 62,
    nonGamingSharePct: 38,
    nonGamingMix: { hospitality: 126, fnb: 118, entertainment: 112, retail: 132 },
    seasonality: [98, 104, 112, 116, 108, 101, 118, 121, 110, 115, 119, 107],
    personas: personas([
      { persona: 'luxury_shopper', label: 'Luxury Shopper', sharePct: 26, topCategories: ['watches/jewelry', 'premium fashion'], recommendedOffer: 'Promenade private preview with Rewards accelerator', kvBrief: 'Gaming weekend with a luxury retail appointment' },
      { persona: 'fnb_seeker', label: 'F&B Seeker', sharePct: 22, topCategories: ['bars/clubs', 'fine dining'], recommendedOffer: 'Chef table plus nightlife credit', kvBrief: 'Late-night dining itinerary around a premium stay' },
      { persona: 'entertainment_lover', label: 'Entertainment Lover', sharePct: 18, topCategories: ['arena shows', 'clubs'], recommendedOffer: 'Arena package with hosted transfer', kvBrief: 'Show-led weekend that keeps spend on-property' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 124,
    addressabilityGap: 118,
  },
  {
    id: 'hongkong',
    name: 'Hong Kong',
    nameZh: '香港',
    language: 'zh-HK',
    languageLabel: '繁中',
    haul: 'short',
    arrivalsIndex: { '2020': 176, '2024': 139 },
    spendIndex: { '2020': 121, '2024': 114 },
    txnFrequencyIndex: 142,
    avgTicketBand: 'upper-mid',
    projectedValueBand: '12-20k equiv./mo',
    gamingSharePct: 44,
    nonGamingSharePct: 56,
    nonGamingMix: { hospitality: 116, fnb: 122, entertainment: 126, retail: 108 },
    seasonality: [112, 98, 101, 105, 118, 103, 109, 113, 94, 100, 106, 121],
    personas: personas([
      { persona: 'travel_lover', label: 'Travel Lover', sharePct: 28, topCategories: ['short-stay hotels', 'transport'], recommendedOffer: 'Same-week mini program itinerary', kvBrief: 'One-night escape from Hong Kong to Cotai' },
      { persona: 'fnb_seeker', label: 'F&B Seeker', sharePct: 24, topCategories: ['casual dining', 'bars/clubs'], recommendedOffer: 'Dining stamps with Rewards multiplier', kvBrief: 'Dining-led day trip with a return-stay hook' },
      { persona: 'family_leisure', label: 'Family Leisure', sharePct: 17, topCategories: ['family attractions', 'buffets'], recommendedOffer: 'Family show and buffet bundle', kvBrief: 'Weekend family package with guaranteed seats' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 96,
    addressabilityGap: 102,
  },
  {
    id: 'gba_mainland',
    name: 'GBA Mainland',
    nameZh: '大灣區內地',
    language: 'zh-CN',
    languageLabel: '简中',
    haul: 'short',
    arrivalsIndex: { '2020': 188, '2024': 196 },
    spendIndex: { '2020': 112, '2024': 119 },
    txnFrequencyIndex: 154,
    avgTicketBand: 'upper-mid',
    projectedValueBand: '10-18k equiv./mo',
    gamingSharePct: 41,
    nonGamingSharePct: 59,
    nonGamingMix: { hospitality: 118, fnb: 130, entertainment: 136, retail: 112 },
    seasonality: [104, 117, 109, 106, 111, 115, 122, 118, 108, 124, 112, 119],
    personas: personas([
      { persona: 'travel_lover', label: 'Travel Lover', sharePct: 31, topCategories: ['mobile travel', 'short breaks'], recommendedOffer: 'Cross-border itinerary bundle', kvBrief: 'Mobile-first short break with room, dining, show' },
      { persona: 'family_leisure', label: 'Family Leisure', sharePct: 22, topCategories: ['family attractions', 'casual dining'], recommendedOffer: 'Family leisure pass', kvBrief: 'Parent-friendly weekend package' },
      { persona: 'entertainment_lover', label: 'Entertainment Lover', sharePct: 19, topCategories: ['concerts', 'cinema'], recommendedOffer: 'Arena early-access package', kvBrief: 'Event-first trip with Rewards earn' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 118,
    addressabilityGap: 109,
  },
  {
    id: 'japan',
    name: 'Japan',
    nameZh: '日本',
    language: 'ja',
    languageLabel: '日本語',
    haul: 'long',
    arrivalsIndex: { '2020': 116, '2024': 126 },
    spendIndex: { '2020': 138, '2024': 146 },
    txnFrequencyIndex: 128,
    avgTicketBand: 'premium',
    projectedValueBand: '18-28k equiv./mo',
    gamingSharePct: 37,
    nonGamingSharePct: 63,
    nonGamingMix: { hospitality: 134, fnb: 126, entertainment: 142, retail: 119 },
    seasonality: [92, 96, 136, 142, 104, 98, 101, 108, 114, 138, 144, 106],
    personas: personas([
      { persona: 'entertainment_lover', label: 'Entertainment Lover', sharePct: 25, topCategories: ['festival travel', 'arena shows'], recommendedOffer: 'Festival-period show and stay', kvBrief: 'Festival timing with premium entertainment' },
      { persona: 'fnb_seeker', label: 'F&B Seeker', sharePct: 21, topCategories: ['chef dining', 'bars/clubs'], recommendedOffer: 'Chef-led discovery menu', kvBrief: 'Culinary Macau weekend for festival travelers' },
      { persona: 'luxury_shopper', label: 'Luxury Shopper', sharePct: 18, topCategories: ['beauty', 'watches/jewelry'], recommendedOffer: 'Retail preview with concierge translation', kvBrief: 'Festival trip extended through luxury retail' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 128,
    addressabilityGap: 116,
  },
  {
    id: 'korea',
    name: 'Korea',
    nameZh: '韓國',
    language: 'ko',
    languageLabel: '한국어',
    haul: 'long',
    arrivalsIndex: { '2020': 121, '2024': 128 },
    spendIndex: { '2020': 151, '2024': 158 },
    txnFrequencyIndex: 148,
    avgTicketBand: 'premium',
    projectedValueBand: '22-36k equiv./mo',
    gamingSharePct: 34,
    nonGamingSharePct: 66,
    nonGamingMix: { hospitality: 146, fnb: 138, entertainment: 151, retail: 129 },
    seasonality: [96, 101, 118, 122, 108, 104, 113, 119, 127, 132, 124, 117],
    personas: personas([
      { persona: 'entertainment_lover', label: 'Entertainment Lover', sharePct: 28, topCategories: ['K-pop adjacent events', 'arena shows'], recommendedOffer: 'Arena-first Rewards package', kvBrief: 'Merging to the World entertainment weekend' },
      { persona: 'travel_lover', label: 'Travel Lover', sharePct: 23, topCategories: ['premium hotels', 'short holidays'], recommendedOffer: 'Korea-to-Cotai flight and stay bundle', kvBrief: 'Short-haul luxury escape with multilingual service' },
      { persona: 'fnb_seeker', label: 'F&B Seeker', sharePct: 19, topCategories: ['bars/clubs', 'signature dining'], recommendedOffer: 'Dining and nightlife path with ICBC co-brand earn', kvBrief: 'Premium nightlife itinerary in Korean' },
    ]),
    dataVintage: '2020',
    note: 'Merging to the World',
    nonGamingMomentum: 156,
    addressabilityGap: 149,
  },
  {
    id: 'singapore',
    name: 'Singapore',
    nameZh: '新加坡',
    language: 'en-SG',
    languageLabel: 'English',
    haul: 'long',
    arrivalsIndex: { '2020': 104, '2024': 118 },
    spendIndex: { '2020': 132, '2024': 145 },
    txnFrequencyIndex: 126,
    avgTicketBand: 'premium',
    projectedValueBand: '18-30k equiv./mo',
    gamingSharePct: 29,
    nonGamingSharePct: 71,
    nonGamingMix: { hospitality: 154, fnb: 132, entertainment: 148, retail: 122 },
    seasonality: [91, 95, 102, 110, 126, 119, 101, 98, 107, 113, 117, 129],
    personas: personas([
      { persona: 'travel_lover', label: 'Travel Lover', sharePct: 27, topCategories: ['premium hotels', 'spa'], recommendedOffer: 'Suite and wellness escape', kvBrief: 'Hospitality-led Macau luxury without gaming emphasis' },
      { persona: 'entertainment_lover', label: 'Entertainment Lover', sharePct: 21, topCategories: ['arena shows', 'recreation'], recommendedOffer: 'Show plus recreation pass', kvBrief: 'Entertainment weekend for Singapore couples' },
      { persona: 'fnb_seeker', label: 'F&B Seeker', sharePct: 20, topCategories: ['fine dining', 'bars/clubs'], recommendedOffer: 'Chef table pre-booking', kvBrief: 'Food-led stay with premium recreation' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 142,
    addressabilityGap: 126,
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    nameZh: '馬來西亞',
    language: 'ms',
    languageLabel: 'Bahasa Melayu',
    haul: 'short',
    arrivalsIndex: { '2020': 111, '2024': 123 },
    spendIndex: { '2020': 108, '2024': 116 },
    txnFrequencyIndex: 118,
    avgTicketBand: 'upper-mid',
    projectedValueBand: '9-16k equiv./mo',
    gamingSharePct: 39,
    nonGamingSharePct: 61,
    nonGamingMix: { hospitality: 122, fnb: 128, entertainment: 124, retail: 109 },
    seasonality: [96, 99, 104, 112, 120, 118, 106, 101, 108, 116, 111, 124],
    personas: personas([
      { persona: 'family_leisure', label: 'Family Leisure', sharePct: 26, topCategories: ['school holidays', 'buffets'], recommendedOffer: 'Family leisure bundle', kvBrief: 'Long-weekend family escape' },
      { persona: 'fnb_seeker', label: 'F&B Seeker', sharePct: 24, topCategories: ['casual dining', 'night markets'], recommendedOffer: 'Dining discovery passport', kvBrief: 'Food-first short holiday' },
      { persona: 'travel_lover', label: 'Travel Lover', sharePct: 20, topCategories: ['OTA travel', 'premium rooms'], recommendedOffer: 'Short-holiday Rewards package', kvBrief: 'Macau getaway around public holidays' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 119,
    addressabilityGap: 111,
  },
  {
    id: 'thailand',
    name: 'Thailand',
    nameZh: '泰國',
    language: 'th',
    languageLabel: 'ไทย',
    haul: 'short',
    arrivalsIndex: { '2020': 109, '2024': 121 },
    spendIndex: { '2020': 103, '2024': 113 },
    txnFrequencyIndex: 112,
    avgTicketBand: 'upper-mid',
    projectedValueBand: '8-14k equiv./mo',
    gamingSharePct: 36,
    nonGamingSharePct: 64,
    nonGamingMix: { hospitality: 120, fnb: 121, entertainment: 133, retail: 107 },
    seasonality: [101, 96, 103, 118, 111, 106, 98, 104, 109, 117, 115, 123],
    personas: personas([
      { persona: 'entertainment_lover', label: 'Entertainment Lover', sharePct: 25, topCategories: ['clubs', 'shows'], recommendedOffer: 'Nightlife and show bundle', kvBrief: 'Short holiday built around entertainment' },
      { persona: 'travel_lover', label: 'Travel Lover', sharePct: 23, topCategories: ['short holidays', 'premium hotels'], recommendedOffer: 'Holiday flight and stay package', kvBrief: 'Public-holiday Macau escape' },
      { persona: 'fnb_seeker', label: 'F&B Seeker', sharePct: 20, topCategories: ['bars/clubs', 'signature dining'], recommendedOffer: 'Dining plus nightlife Rewards path', kvBrief: 'Night dining itinerary with rewards earn' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 116,
    addressabilityGap: 108,
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    nameZh: '印尼',
    language: 'id',
    languageLabel: 'Bahasa Indonesia',
    haul: 'short',
    arrivalsIndex: { '2020': 96, '2024': 108 },
    spendIndex: { '2020': 101, '2024': 112 },
    txnFrequencyIndex: 106,
    avgTicketBand: 'upper-mid',
    projectedValueBand: '7-13k equiv./mo',
    gamingSharePct: 32,
    nonGamingSharePct: 68,
    nonGamingMix: { hospitality: 118, fnb: 124, entertainment: 121, retail: 104 },
    seasonality: [98, 102, 106, 114, 119, 122, 112, 105, 101, 109, 116, 120],
    personas: personas([
      { persona: 'family_leisure', label: 'Family Leisure', sharePct: 29, topCategories: ['family travel', 'buffets'], recommendedOffer: 'Family stay plus attraction guarantee', kvBrief: 'Family-first Macau short holiday' },
      { persona: 'fnb_seeker', label: 'F&B Seeker', sharePct: 23, topCategories: ['halal-friendly dining', 'cafes'], recommendedOffer: 'Dining itinerary with concierge support', kvBrief: 'Food-led Macau itinerary' },
      { persona: 'travel_lover', label: 'Travel Lover', sharePct: 18, topCategories: ['OTA travel', 'premium rooms'], recommendedOffer: 'Rewards member room upgrade path', kvBrief: 'Premium but accessible Macau escape' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 112,
    addressabilityGap: 104,
  },
  {
    id: 'philippines',
    name: 'Philippines',
    nameZh: '菲律賓',
    language: 'fil',
    languageLabel: 'Filipino',
    haul: 'short',
    arrivalsIndex: { '2020': 101, '2024': 112 },
    spendIndex: { '2020': 98, '2024': 107 },
    txnFrequencyIndex: 109,
    avgTicketBand: 'mass',
    projectedValueBand: '6-11k equiv./mo',
    gamingSharePct: 35,
    nonGamingSharePct: 65,
    nonGamingMix: { hospitality: 113, fnb: 119, entertainment: 125, retail: 99 },
    seasonality: [103, 99, 104, 111, 116, 121, 110, 106, 104, 112, 118, 126],
    personas: personas([
      { persona: 'entertainment_lover', label: 'Entertainment Lover', sharePct: 28, topCategories: ['arena shows', 'clubs'], recommendedOffer: 'Entertainment-led Rewards offer', kvBrief: 'Show weekend for groups of friends' },
      { persona: 'family_leisure', label: 'Family Leisure', sharePct: 23, topCategories: ['family attractions', 'buffets'], recommendedOffer: 'Family dining and show pack', kvBrief: 'Family leisure trip with fixed costs' },
      { persona: 'travel_lover', label: 'Travel Lover', sharePct: 19, topCategories: ['short breaks', 'online booking'], recommendedOffer: 'Mini-program booking bonus', kvBrief: 'Easy short-break conversion path' },
    ]),
    dataVintage: '2024',
    nonGamingMomentum: 108,
    addressabilityGap: 101,
  },
];

function arrivalsGrowth(input: CorridorInput) {
  return Math.round((input.arrivalsIndex['2024'] / input.arrivalsIndex['2020']) * 100);
}

function computePriorityIndex(input: CorridorInput, random: () => number) {
  const rawScore =
    0.35 * input.nonGamingMomentum
    + 0.25 * arrivalsGrowth(input)
    + 0.2 * input.txnFrequencyIndex
    + 0.2 * input.addressabilityGap;
  return Math.round(rawScore + random() * 0.01);
}

export const corridors: Corridor[] = inputs
  .map((input, index) => {
    const random = mulberry32(202602 + index * 37);
    const priorityIndex = computePriorityIndex(input, random);
    const { nonGamingMomentum, addressabilityGap, ...corridor } = input;
    return { ...corridor, priorityIndex, priorityRank: 0 };
  })
  .sort((first, second) => second.priorityIndex - first.priorityIndex)
  .map((corridor, index) => ({ ...corridor, priorityRank: index + 1 }));

export const priorityCorridor = corridors[0];

export function getCorridorById(id: string): Corridor {
  return corridors.find((corridor) => corridor.id === id) ?? priorityCorridor;
}

export function koreaRefreshTag(corridor: Corridor): string | null {
  return corridor.id === 'korea' ? '2020 base · refresh pending' : null;
}
```

- [ ] **Step 6: Export corridor data**

In `src/data/index.ts`, add:

```ts
export {
  CORRIDOR_METRIC_LABELS,
  CORRIDOR_METRICS,
  CORRIDOR_YEARS,
  corridors,
  getCorridorById,
  koreaRefreshTag,
  priorityCorridor,
} from './corridors';
```

- [ ] **Step 7: Run data tests**

Run:

```bash
npm run test -- src/data/corridors.test.ts src/data/generate.test.ts src/lib/format.test.ts
```

Expected: PASS.

- [ ] **Step 8: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit Task 1**

Run:

```bash
git add src/data/types.ts src/data/generate.ts src/data/index.ts src/data/corridors.ts src/data/corridors.test.ts
git commit -m "Add corridor acquisition data"
```

---

### Task 2: Lens Switch, Nav Groups, And Reachable Route Stubs

**Files:**
- Create: `src/components/shell/lens-switch.tsx`
- Create: `src/components/shell/lens-switch.test.tsx`
- Modify: `src/components/shell/top-bar.tsx`
- Modify: `src/components/shell/top-bar.test.tsx`
- Modify: `src/components/shell/nav.tsx`
- Modify: `src/components/shell/nav.test.tsx`
- Create: `src/app/corridors/page.tsx`
- Create: `src/app/corridors/page.test.tsx`
- Create: `src/app/corridors/[id]/page.tsx`
- Create: `src/app/corridors/[id]/page.test.tsx`
- Create: `src/app/acquisition/page.tsx`
- Create: `src/app/acquisition/page.test.tsx`

- [ ] **Step 1: Add failing LensSwitch tests**

Create `src/components/shell/lens-switch.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { LensSwitch } from './lens-switch';

let mockPathname = '/wallet';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('LensSwitch', () => {
  beforeEach(() => {
    mockPathname = '/wallet';
  });

  it('links to Wallet retention and Corridors acquisition lenses', () => {
    render(<LensSwitch />);

    expect(screen.getByRole('link', { name: /Wallet Retention/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Corridors Acquisition/i })).toHaveAttribute('href', '/corridors');
  });

  it('marks the corridors lens active for acquisition routes', () => {
    mockPathname = '/acquisition';

    render(<LensSwitch />);

    expect(screen.getByRole('link', { name: /Corridors Acquisition/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Wallet Retention/i })).not.toHaveAttribute('aria-current');
  });
});
```

- [ ] **Step 2: Add failing nav and route tests**

Append to `src/components/shell/nav.test.tsx`:

```tsx
  it('swaps to acquisition nav links on corridor routes', () => {
    mockPathname = '/corridors';

    render(<Nav />);

    expect(screen.getByRole('link', { name: /Source Markets/i })).toHaveAttribute('href', '/corridors');
    expect(screen.getByRole('link', { name: /Acquisition/i })).toHaveAttribute('href', '/acquisition');
    expect(screen.queryByRole('link', { name: /^Wallet$/i })).not.toBeInTheDocument();
  });
```

Create `src/app/corridors/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import CorridorsPage from './page';

describe('corridors route stub', () => {
  it('renders the Lens B route header and aggregate panel note', () => {
    render(<CorridorsPage />);

    expect(screen.getByRole('heading', { name: 'Source-Market & Corridor Intelligence', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/10–20% panel/i)).toBeInTheDocument();
    expect(screen.getByText(/aggregate inbound panel, no PII/i)).toBeInTheDocument();
  });
});
```

Create `src/app/corridors/[id]/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import CorridorDetailPage from './page';

describe('corridor detail route stub', () => {
  it('renders the Korea corridor detail header from params', () => {
    render(<CorridorDetailPage params={{ id: 'korea' }} />);

    expect(screen.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeInTheDocument();
    expect(screen.getByText(/2020 base · refresh pending/i)).toBeInTheDocument();
  });
});
```

Create `src/app/acquisition/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import AcquisitionPage from './page';

describe('acquisition route stub', () => {
  it('renders the priority recommendation route header', () => {
    render(<AcquisitionPage />);

    expect(screen.getByRole('heading', { name: 'Priority Corridor Acquisition', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Korea/i)).toBeInTheDocument();
    expect(screen.getByText(/2020 base · refresh pending/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the shell and route tests and confirm they fail**

Run:

```bash
npm run test -- src/components/shell/lens-switch.test.tsx src/components/shell/nav.test.tsx src/app/corridors/page.test.tsx src/app/corridors/[id]/page.test.tsx src/app/acquisition/page.test.tsx
```

Expected: FAIL because the LensSwitch and new routes do not exist.

- [ ] **Step 4: Implement LensSwitch**

Create `src/components/shell/lens-switch.tsx`:

```tsx
'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function isCorridorLens(pathname: string) {
  return pathname.startsWith('/corridors') || pathname.startsWith('/acquisition');
}

export function LensSwitch() {
  const pathname = usePathname();
  const acquisitionActive = isCorridorLens(pathname);

  const links = [
    { href: '/', label: 'Wallet Retention', active: !acquisitionActive },
    { href: '/corridors', label: 'Corridors Acquisition', active: acquisitionActive },
  ];

  return (
    <nav aria-label="Lens switch" className="inline-flex rounded-lg border border-galaxy-border bg-galaxy-charcoal/70 p-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.active ? 'page' : undefined}
          className={clsx(
            'rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
            link.active
              ? 'bg-galaxy-gold text-galaxy-ink'
              : 'text-galaxy-muted hover:bg-galaxy-slate hover:text-galaxy-cream',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: Add LensSwitch to TopBar**

In `src/components/shell/top-bar.tsx`, import and render the switch between metadata and quarter selector:

```tsx
import { LensSwitch } from './lens-switch';
```

Replace the top-level header children with this structure:

```tsx
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            aria-label={`${methodology.activeMetricCount} active CDE metrics`}
            className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-galaxy-gold sm:px-2.5 sm:text-xs sm:tracking-[0.18em]"
          >
            {methodology.activeMetricCount} CDE metrics
          </span>
          <span className="text-sm font-medium text-galaxy-cream">
            Coverage {methodology.matchedCoveragePct}%
          </span>
        </div>
        <LensSwitch />
      </div>
```

Keep the existing quarter selector label and select unchanged.

- [ ] **Step 6: Swap nav groups by lens**

In `src/components/shell/nav.tsx`, add `PlaneTakeoff` and `Route` imports from `lucide-react`, split nav arrays, and choose based on `pathname`:

```tsx
const walletNavItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/wallet', label: 'Wallet', icon: WalletCards },
  { href: '/segments', label: 'Segments', icon: Gem },
  { href: '/leakage', label: 'Leakage', icon: Activity },
  { href: '/propensity', label: 'Audience', icon: ScanSearch },
  { href: '/activation', label: 'Activation', icon: Megaphone },
  { href: '/marketscan', label: 'Market Scan', icon: Radar },
];

const acquisitionNavItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/corridors', label: 'Source Markets', icon: Route },
  { href: '/acquisition', label: 'Acquisition', icon: PlaneTakeoff },
];

function isAcquisitionLens(pathname: string) {
  return pathname.startsWith('/corridors') || pathname.startsWith('/acquisition');
}
```

Inside `Nav`, use:

```tsx
  const navItems = isAcquisitionLens(pathname) ? acquisitionNavItems : walletNavItems;
```

Change the static bottom helper text to:

```tsx
        {isAcquisitionLens(pathname) ? 'Inbound corridor view' : 'Cotai wallet view'}
```

- [ ] **Step 7: Add route stubs**

Create `src/app/corridors/page.tsx`:

```tsx
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { priorityCorridor, methodology } from '@/data';

export default function CorridorsPage() {
  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Corridors acquisition"
        title="Source-Market & Corridor Intelligence"
        description="Rank inbound source markets using aggregate Mastercard panel signals for acquisition planning."
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">{methodology.panelSharePct} panel</p>
            <p className="mt-2">{methodology.lensBNote}. Directional, indexed, and blended with first-party context.</p>
          </>
        )}
      />
      <Panel>
        <p className="text-sm font-semibold text-galaxy-gold">Priority corridor</p>
        <p className="mt-3 text-2xl font-semibold text-galaxy-cream">{priorityCorridor.name}</p>
        <p className="mt-2 text-sm text-galaxy-muted">2020 base · refresh pending</p>
      </Panel>
    </div>
  );
}
```

Create `src/app/corridors/[id]/page.tsx`:

```tsx
import { PageHeader } from '@/components/ui/page-header';
import { getCorridorById, koreaRefreshTag } from '@/data';

export default function CorridorDetailPage({ params }: { params: { id: string } }) {
  const corridor = getCorridorById(params.id);
  const tag = koreaRefreshTag(corridor);

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Corridor detail"
        title={`${corridor.name} Corridor Detail`}
        description="Persona, affinity, seasonality, and offer bridge for aggregate acquisition planning."
        aside={tag ? <p className="font-semibold text-galaxy-gold">{tag}</p> : <p>{corridor.languageLabel} content ready</p>}
      />
    </div>
  );
}
```

Create `src/app/acquisition/page.tsx`:

```tsx
import { PageHeader } from '@/components/ui/page-header';
import { priorityCorridor } from '@/data';

export default function AcquisitionPage() {
  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Acquisition hand-off"
        title="Priority Corridor Acquisition"
        description={`Turn ${priorityCorridor.name} corridor intelligence into persona-led campaign content without live AI calls.`}
        aside={<p className="font-semibold text-galaxy-gold">2020 base · refresh pending</p>}
      />
    </div>
  );
}
```

- [ ] **Step 8: Update TopBar tests**

Append to `src/components/shell/top-bar.test.tsx`:

```tsx
  it('renders the lens switch beside methodology metadata', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByRole('navigation', { name: /Lens switch/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Wallet Retention/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Corridors Acquisition/i })).toHaveAttribute('href', '/corridors');
  });
```

- [ ] **Step 9: Run focused tests and build**

Run:

```bash
npm run test -- src/components/shell/lens-switch.test.tsx src/components/shell/nav.test.tsx src/components/shell/top-bar.test.tsx src/app/corridors/page.test.tsx src/app/corridors/[id]/page.test.tsx src/app/acquisition/page.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 10: Commit Task 2**

Run:

```bash
git add src/components/shell/lens-switch.tsx src/components/shell/lens-switch.test.tsx src/components/shell/top-bar.tsx src/components/shell/top-bar.test.tsx src/components/shell/nav.tsx src/components/shell/nav.test.tsx src/app/corridors/page.tsx src/app/corridors/page.test.tsx src/app/corridors/[id]/page.tsx src/app/corridors/[id]/page.test.tsx src/app/acquisition/page.tsx src/app/acquisition/page.test.tsx
git commit -m "Add acquisition lens shell routes"
```

---

### Task 3: Reusable Corridor Visual Components

**Files:**
- Create: `src/components/charts/gaming-split-bar.tsx`
- Create: `src/components/charts/gaming-split-bar.test.tsx`
- Create: `src/components/charts/corridor-rank-table.tsx`
- Create: `src/components/charts/corridor-rank-table.test.tsx`
- Create: `src/components/charts/seasonality-heatmap.tsx`
- Create: `src/components/charts/seasonality-heatmap.test.tsx`
- Create: `src/components/charts/persona-affinity-chart.tsx`
- Create: `src/components/charts/persona-affinity-chart.test.tsx`
- Create: `src/components/panels/priority-corridor-tile.tsx`
- Create: `src/components/panels/priority-corridor-tile.test.tsx`

- [ ] **Step 1: Add failing visual component tests**

Create `src/components/charts/gaming-split-bar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { getCorridorById } from '@/data';
import { GamingSplitBar } from './gaming-split-bar';

describe('GamingSplitBar', () => {
  it('renders aggregate gaming and non-gaming percentages', () => {
    render(<GamingSplitBar corridor={getCorridorById('taiwan')} />);

    expect(screen.getByText('Gaming 62%')).toBeInTheDocument();
    expect(screen.getByText('Non-gaming 38%')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Taiwan gaming split/i })).toBeInTheDocument();
  });
});
```

Create `src/components/charts/corridor-rank-table.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { corridors } from '@/data';
import { CorridorRankTable } from './corridor-rank-table';

describe('CorridorRankTable', () => {
  it('renders Korea as rank one with the refresh-pending tag', () => {
    render(<CorridorRankTable corridors={corridors} year="2024" metric="spend" />);

    expect(screen.getByRole('row', { name: /#1 Korea/i })).toHaveTextContent('2020 base · refresh pending');
    expect(screen.getByRole('row', { name: /Taiwan/i })).toHaveTextContent('Gaming 62%');
    expect(screen.getByRole('row', { name: /Singapore/i })).toHaveTextContent('Non-gaming 71%');
  });
});
```

Create `src/components/charts/seasonality-heatmap.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { corridors } from '@/data';
import { SeasonalityHeatmap } from './seasonality-heatmap';

describe('SeasonalityHeatmap', () => {
  it('renders month cells and required pattern annotations', () => {
    render(<SeasonalityHeatmap corridors={corridors} />);

    expect(screen.getByRole('table', { name: /Corridor seasonality heatmap/i })).toBeInTheDocument();
    expect(screen.getByText(/Japan peaks around festival periods/i)).toBeInTheDocument();
    expect(screen.getByText(/Southeast Asia clusters on long weekends/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Japan Mar index 136')).toBeInTheDocument();
  });
});
```

Create `src/components/charts/persona-affinity-chart.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { getCorridorById } from '@/data';
import { PersonaAffinityChart } from './persona-affinity-chart';

describe('PersonaAffinityChart', () => {
  it('renders persona shares and co-spend themes', () => {
    render(<PersonaAffinityChart corridor={getCorridorById('korea')} />);

    expect(screen.getByText('Entertainment Lover')).toBeInTheDocument();
    expect(screen.getByText('28%')).toBeInTheDocument();
    expect(screen.getByText(/K-pop adjacent events/i)).toBeInTheDocument();
    expect(screen.getByText(/arena shows/i)).toBeInTheDocument();
  });
});
```

Create `src/components/panels/priority-corridor-tile.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { priorityCorridor } from '@/data';
import { PriorityCorridorTile } from './priority-corridor-tile';

describe('PriorityCorridorTile', () => {
  it('links Korea recommendation to acquisition with the required tag', () => {
    render(<PriorityCorridorTile corridor={priorityCorridor} />);

    expect(screen.getByRole('heading', { name: /Korea/i })).toBeInTheDocument();
    expect(screen.getByText('Merging to the World')).toBeInTheDocument();
    expect(screen.getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open acquisition recommendation/i })).toHaveAttribute('href', '/acquisition?corridor=korea');
  });
});
```

- [ ] **Step 2: Run component tests and confirm they fail**

Run:

```bash
npm run test -- src/components/charts/gaming-split-bar.test.tsx src/components/charts/corridor-rank-table.test.tsx src/components/charts/seasonality-heatmap.test.tsx src/components/charts/persona-affinity-chart.test.tsx src/components/panels/priority-corridor-tile.test.tsx
```

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement GamingSplitBar**

Create `src/components/charts/gaming-split-bar.tsx`:

```tsx
import type { Corridor } from '@/data';
import { PercentValue } from '@/components/ui/formatted-values';

export function GamingSplitBar({ corridor }: { corridor: Corridor }) {
  return (
    <div>
      <div
        role="img"
        aria-label={`${corridor.name} gaming split`}
        className="flex h-3 overflow-hidden rounded-full bg-galaxy-ink"
      >
        <span className="bg-galaxy-gold" style={{ width: `${corridor.gamingSharePct}%` }} />
        <span className="bg-galaxy-slate" style={{ width: `${corridor.nonGamingSharePct}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-galaxy-muted">
        <span>Gaming <PercentValue value={corridor.gamingSharePct} /></span>
        <span>Non-gaming <PercentValue value={corridor.nonGamingSharePct} /></span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement CorridorRankTable**

Create `src/components/charts/corridor-rank-table.tsx`:

```tsx
import Link from 'next/link';
import { GamingSplitBar } from '@/components/charts/gaming-split-bar';
import { IndexValue } from '@/components/ui/formatted-values';
import type { Corridor, CorridorMetric, CorridorYear } from '@/data';
import { koreaRefreshTag } from '@/data';

function metricValue(corridor: Corridor, year: CorridorYear, metric: CorridorMetric) {
  if (metric === 'arrivals') return corridor.arrivalsIndex[year];
  if (metric === 'spend') return corridor.spendIndex[year];
  if (metric === 'txnFrequency') return corridor.txnFrequencyIndex;
  return corridor.nonGamingSharePct;
}

export function CorridorRankTable({
  corridors,
  year,
  metric,
}: {
  corridors: Corridor[];
  year: CorridorYear;
  metric: CorridorMetric;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[54rem] text-left text-sm">
        <caption className="sr-only">Inbound corridor ranking</caption>
        <thead className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">
          <tr>
            <th className="py-3 pr-4">Rank</th>
            <th className="py-3 pr-4">Corridor</th>
            <th className="py-3 pr-4">Selected metric</th>
            <th className="py-3 pr-4">Arrivals</th>
            <th className="py-3 pr-4">Spend</th>
            <th className="py-3 pr-4">Txn frequency</th>
            <th className="py-3 pr-4">Avg ticket</th>
            <th className="py-3">Split</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-galaxy-border">
          {corridors.map((corridor) => {
            const tag = koreaRefreshTag(corridor);
            return (
              <tr key={corridor.id} className="align-top" aria-label={`#${corridor.priorityRank} ${corridor.name}`}>
                <td className="py-4 pr-4 font-mono text-galaxy-gold">#{corridor.priorityRank}</td>
                <td className="py-4 pr-4">
                  <Link className="font-semibold text-galaxy-cream hover:text-galaxy-gold" href={`/corridors/${corridor.id}`}>
                    {corridor.name}
                  </Link>
                  <p className="mt-1 text-xs text-galaxy-muted">{corridor.nameZh} · {corridor.haul}-haul</p>
                  {tag ? <p className="mt-2 text-xs font-semibold text-galaxy-gold">{tag}</p> : null}
                </td>
                <td className="py-4 pr-4"><IndexValue value={metricValue(corridor, year, metric)} /></td>
                <td className="py-4 pr-4"><IndexValue value={corridor.arrivalsIndex[year]} /></td>
                <td className="py-4 pr-4"><IndexValue value={corridor.spendIndex[year]} /></td>
                <td className="py-4 pr-4"><IndexValue value={corridor.txnFrequencyIndex} /></td>
                <td className="py-4 pr-4 capitalize">{corridor.avgTicketBand}</td>
                <td className="py-4"><GamingSplitBar corridor={corridor} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Implement SeasonalityHeatmap**

Create `src/components/charts/seasonality-heatmap.tsx`:

```tsx
import type { Corridor } from '@/data';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function heatClass(value: number) {
  if (value >= 132) return 'bg-galaxy-gold text-galaxy-ink';
  if (value >= 118) return 'bg-galaxy-gold/35 text-galaxy-cream';
  if (value >= 104) return 'bg-galaxy-gold/15 text-galaxy-cream';
  return 'bg-galaxy-ink text-galaxy-muted';
}

export function SeasonalityHeatmap({ corridors }: { corridors: Corridor[] }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table role="table" aria-label="Corridor seasonality heatmap" className="w-full min-w-[52rem] text-left text-xs">
          <thead className="uppercase tracking-[0.16em] text-galaxy-muted">
            <tr>
              <th className="py-2 pr-3">Corridor</th>
              {months.map((month) => <th key={month} className="py-2 px-2">{month}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-galaxy-border">
            {corridors.map((corridor) => (
              <tr key={corridor.id}>
                <th className="py-2 pr-3 text-galaxy-cream">{corridor.name}</th>
                {corridor.seasonality.map((value, index) => (
                  <td key={months[index]} className="py-1 px-1">
                    <span
                      aria-label={`${corridor.name} ${months[index]} index ${value}`}
                      className={`block rounded px-2 py-2 text-center font-mono ${heatClass(value)}`}
                    >
                      {value}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-galaxy-muted md:grid-cols-3">
        <p>Japan peaks around festival periods in Mar-Apr and Oct-Nov.</p>
        <p>Southeast Asia clusters on long weekends and short holidays.</p>
        <p>Hong Kong volume softening is visible from 2020 to 2024.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Implement PersonaAffinityChart**

Create `src/components/charts/persona-affinity-chart.tsx`:

```tsx
import type { Corridor } from '@/data';
import { PercentValue } from '@/components/ui/formatted-values';

export function PersonaAffinityChart({ corridor }: { corridor: Corridor }) {
  return (
    <div className="space-y-3">
      {corridor.personas.map((persona) => (
        <article key={persona.persona} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-galaxy-cream">{persona.label}</p>
              <p className="mt-1 text-xs text-galaxy-muted">{persona.topCategories.join(' + ')}</p>
            </div>
            <span className="font-mono text-galaxy-gold"><PercentValue value={persona.sharePct} /></span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-galaxy-slate">
            <div className="h-2 rounded-full bg-galaxy-gold" style={{ width: `${persona.sharePct}%` }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{persona.recommendedOffer}</p>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Implement PriorityCorridorTile**

Create `src/components/panels/priority-corridor-tile.tsx`:

```tsx
import Link from 'next/link';
import { IndexValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { Corridor } from '@/data';
import { koreaRefreshTag } from '@/data';

export function PriorityCorridorTile({ corridor }: { corridor: Corridor }) {
  const tag = koreaRefreshTag(corridor);

  return (
    <Panel className="bg-[linear-gradient(135deg,rgba(205,164,92,0.16),rgba(8,18,30,0.82))]">
      <Overline>Priority corridor</Overline>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-sans text-3xl font-semibold text-galaxy-cream">{corridor.name}</h2>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">{corridor.note ?? 'Acquisition priority'}</p>
          {tag ? <p className="mt-3 inline-flex rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold text-galaxy-gold">{tag}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Priority score</p>
          <div className="mt-2 text-2xl font-semibold"><IndexValue value={corridor.priorityIndex} /></div>
        </div>
      </div>
      <Link
        href={`/acquisition?corridor=${corridor.id}`}
        className="mt-5 inline-flex rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink hover:bg-galaxy-gold-lite"
      >
        Open acquisition recommendation
      </Link>
    </Panel>
  );
}
```

- [ ] **Step 8: Run component tests**

Run:

```bash
npm run test -- src/components/charts/gaming-split-bar.test.tsx src/components/charts/corridor-rank-table.test.tsx src/components/charts/seasonality-heatmap.test.tsx src/components/charts/persona-affinity-chart.test.tsx src/components/panels/priority-corridor-tile.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit Task 3**

Run:

```bash
git add src/components/charts/gaming-split-bar.tsx src/components/charts/gaming-split-bar.test.tsx src/components/charts/corridor-rank-table.tsx src/components/charts/corridor-rank-table.test.tsx src/components/charts/seasonality-heatmap.tsx src/components/charts/seasonality-heatmap.test.tsx src/components/charts/persona-affinity-chart.tsx src/components/charts/persona-affinity-chart.test.tsx src/components/panels/priority-corridor-tile.tsx src/components/panels/priority-corridor-tile.test.tsx
git commit -m "Add corridor intelligence visuals"
```

---

### Task 4: `/corridors` Board

**Files:**
- Modify: `src/app/corridors/page.tsx`
- Modify: `src/app/corridors/page.test.tsx`

- [ ] **Step 1: Replace route stub test with board behavior test**

Replace `src/app/corridors/page.test.tsx` with:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import CorridorsPage from './page';

describe('corridors route', () => {
  it('renders source-market board controls, ranking, priority tile, and methodology note', () => {
    render(<CorridorsPage />);

    expect(screen.getByRole('heading', { name: 'Source-Market & Corridor Intelligence', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2024' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('combobox', { name: /Corridor metric/i })).toHaveValue('arrivals');
    expect(screen.getByRole('row', { name: /#1 Korea/i })).toHaveTextContent('2020 base · refresh pending');
    expect(screen.getByText('Merging to the World')).toBeInTheDocument();
    expect(screen.getByText(/10–20% panel/i)).toBeInTheDocument();
    expect(screen.getByText(/directional, indexed/i)).toBeInTheDocument();
  });

  it('updates year and metric controls without losing corridor contrasts', () => {
    render(<CorridorsPage />);

    fireEvent.click(screen.getByRole('button', { name: '2020' }));
    fireEvent.change(screen.getByRole('combobox', { name: /Corridor metric/i }), {
      target: { value: 'spend' },
    });

    expect(screen.getByRole('button', { name: '2020' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('combobox', { name: /Corridor metric/i })).toHaveValue('spend');
    expect(screen.getByRole('row', { name: /Taiwan/i })).toHaveTextContent('Gaming 62%');
    expect(screen.getByRole('row', { name: /Singapore/i })).toHaveTextContent('Non-gaming 71%');
    expect(screen.getByText(/Japan peaks around festival periods/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run route test and confirm it fails**

Run:

```bash
npm run test -- src/app/corridors/page.test.tsx
```

Expected: FAIL because the route is still a stub.

- [ ] **Step 3: Implement the board route**

Replace `src/app/corridors/page.tsx` with:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { CorridorRankTable } from '@/components/charts/corridor-rank-table';
import { SeasonalityHeatmap } from '@/components/charts/seasonality-heatmap';
import { PriorityCorridorTile } from '@/components/panels/priority-corridor-tile';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import {
  CORRIDOR_METRIC_LABELS,
  CORRIDOR_METRICS,
  CORRIDOR_YEARS,
  corridors,
  methodology,
  priorityCorridor,
  type CorridorMetric,
  type CorridorYear,
} from '@/data';

export default function CorridorsPage() {
  const [year, setYear] = useState<CorridorYear>('2024');
  const [metric, setMetric] = useState<CorridorMetric>('arrivals');
  const rankedCorridors = useMemo(() => [...corridors].sort((first, second) => first.priorityRank - second.priorityRank), []);

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Corridors acquisition"
        title="Source-Market & Corridor Intelligence"
        description="Rank inbound source markets using aggregate Mastercard panel signals for acquisition planning."
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">{methodology.panelSharePct} panel</p>
            <p className="mt-2">{methodology.lensBNote}. Corridor figures are directional, indexed, and best blended with first-party and other sources.</p>
          </>
        )}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Top inbound markets"
              title="Corridor ranking"
              description="Top source markets ranked by computed acquisition attractiveness using only aggregate indices, percentages, ranks, and bands."
            />
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-1">
                {CORRIDOR_YEARS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={year === item}
                    className={year === item ? 'rounded-md bg-galaxy-gold px-3 py-1.5 text-sm font-semibold text-galaxy-ink' : 'rounded-md px-3 py-1.5 text-sm font-semibold text-galaxy-muted'}
                    onClick={() => setYear(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <label className="text-sm text-galaxy-muted">
                <span className="sr-only">Corridor metric</span>
                <select
                  aria-label="Corridor metric"
                  className="h-10 rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 font-semibold text-galaxy-cream"
                  value={metric}
                  onChange={(event) => setMetric(event.target.value as CorridorMetric)}
                >
                  {CORRIDOR_METRICS.map((item) => (
                    <option key={item} value={item}>{CORRIDOR_METRIC_LABELS[item]}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <CorridorRankTable corridors={rankedCorridors} year={year} metric={metric} />
        </Panel>

        <PriorityCorridorTile corridor={priorityCorridor} />
      </div>

      <Panel>
        <div className="mb-5">
          <SectionHeader
            eyebrow="Seasonality"
            title="Month x corridor intensity"
            description="Heat shows directional visit/spend intensity by corridor month, indexed to each corridor average."
          />
        </div>
        <SeasonalityHeatmap corridors={rankedCorridors} />
      </Panel>
    </div>
  );
}
```

- [ ] **Step 4: Run board route tests**

Run:

```bash
npm run test -- src/app/corridors/page.test.tsx src/components/charts/corridor-rank-table.test.tsx src/components/charts/seasonality-heatmap.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add src/app/corridors/page.tsx src/app/corridors/page.test.tsx
git commit -m "Build corridor intelligence board"
```

---

### Task 5: Corridor Detail Route And Activation Bridge

**Files:**
- Create: `src/components/panels/corridor-detail-panel.tsx`
- Create: `src/components/panels/corridor-detail-panel.test.tsx`
- Modify: `src/app/corridors/[id]/page.tsx`
- Modify: `src/app/corridors/[id]/page.test.tsx`

- [ ] **Step 1: Add failing detail panel tests**

Create `src/components/panels/corridor-detail-panel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { getCorridorById } from '@/data';
import { CorridorDetailPanel } from './corridor-detail-panel';

describe('CorridorDetailPanel', () => {
  it('bridges corridor persona, affinity, and offer to acquisition', () => {
    render(<CorridorDetailPanel corridor={getCorridorById('korea')} />);

    expect(screen.getByRole('heading', { name: /Persona mix/i })).toBeInTheDocument();
    expect(screen.getByText('Entertainment Lover')).toBeInTheDocument();
    expect(screen.getByText(/K-pop adjacent events/i)).toBeInTheDocument();
    expect(screen.getByText(/Arena-first Rewards package/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Generate campaign content/i })).toHaveAttribute(
      'href',
      '/acquisition?corridor=korea&persona=entertainment_lover',
    );
    expect(screen.getByRole('link', { name: /View on-property segments/i })).toHaveAttribute('href', '/segments');
  });
});
```

Replace `src/app/corridors/[id]/page.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';
import CorridorDetailPage from './page';

describe('corridor detail route', () => {
  it('renders Korea detail with required refresh tag and activation bridge', () => {
    render(<CorridorDetailPage params={{ id: 'korea' }} />);

    expect(screen.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeInTheDocument();
    expect(screen.getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Persona mix/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Seasonality and channel signals/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Generate campaign content/i })).toHaveAttribute('href', '/acquisition?corridor=korea&persona=entertainment_lover');
  });

  it('falls back to the priority corridor for an unknown id', () => {
    render(<CorridorDetailPage params={{ id: 'unknown' }} />);

    expect(screen.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run detail tests and confirm they fail**

Run:

```bash
npm run test -- src/components/panels/corridor-detail-panel.test.tsx src/app/corridors/[id]/page.test.tsx
```

Expected: FAIL because `CorridorDetailPanel` does not exist and the detail route is still a stub.

- [ ] **Step 3: Implement CorridorDetailPanel**

Create `src/components/panels/corridor-detail-panel.tsx`:

```tsx
import Link from 'next/link';
import { GamingSplitBar } from '@/components/charts/gaming-split-bar';
import { PersonaAffinityChart } from '@/components/charts/persona-affinity-chart';
import { SeasonalityHeatmap } from '@/components/charts/seasonality-heatmap';
import { IndexValue } from '@/components/ui/formatted-values';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import type { Corridor } from '@/data';

export function CorridorDetailPanel({ corridor }: { corridor: Corridor }) {
  const dominantPersona = corridor.personas[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel>
          <SectionHeader
            eyebrow="Affinity analysis"
            title="Persona mix"
            description="Aggregate co-spend themes translate each corridor into targetable acquisition messages."
          />
          <div className="mt-5">
            <PersonaAffinityChart corridor={corridor} />
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            eyebrow="Offer bridge"
            title="Recommended offer + KV brief"
            description={dominantPersona.kvBrief}
          />
          <p className="mt-5 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-4 text-sm font-semibold leading-6 text-galaxy-cream">
            {dominantPersona.recommendedOffer}
          </p>
          <Link
            href={`/acquisition?corridor=${corridor.id}&persona=${dominantPersona.persona}`}
            className="mt-5 inline-flex rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink hover:bg-galaxy-gold-lite"
          >
            Generate campaign content
          </Link>
          <Link
            href="/segments"
            className="mt-3 inline-flex rounded-md border border-galaxy-border px-4 py-2 text-sm font-semibold text-galaxy-cream hover:border-galaxy-gold"
          >
            View on-property segments
          </Link>
        </Panel>
      </div>

      <Panel>
        <SectionHeader
          eyebrow="Corridor signals"
          title="Seasonality and channel signals"
          description="Aggregate seasonality, gaming/non-gaming split, and frequency indices support timing and offer design."
        />
        <div className="mt-5 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="space-y-5">
            <GamingSplitBar corridor={corridor} />
            <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Same-card frequency</p>
              <div className="mt-3 text-2xl font-semibold text-galaxy-cream">
                <IndexValue value={corridor.txnFrequencyIndex} />
              </div>
            </div>
          </div>
          <SeasonalityHeatmap corridors={[corridor]} />
        </div>
      </Panel>
    </div>
  );
}
```

- [ ] **Step 4: Implement detail route**

Replace `src/app/corridors/[id]/page.tsx` with:

```tsx
import { CorridorDetailPanel } from '@/components/panels/corridor-detail-panel';
import { PageHeader } from '@/components/ui/page-header';
import { getCorridorById, koreaRefreshTag } from '@/data';

export default function CorridorDetailPage({ params }: { params: { id: string } }) {
  const corridor = getCorridorById(params.id);
  const tag = koreaRefreshTag(corridor);

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Corridor detail"
        title={`${corridor.name} Corridor Detail`}
        description="Move from aggregate source-market signal into persona affinity, timing, offer design, and content hand-off."
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">{tag ?? `${corridor.languageLabel} content ready`}</p>
            <p className="mt-2">No individual records. Corridor insight stays indexed, ranked, percent-based, or banded.</p>
          </>
        )}
      />
      <CorridorDetailPanel corridor={corridor} />
    </div>
  );
}
```

- [ ] **Step 5: Run detail tests**

Run:

```bash
npm run test -- src/components/panels/corridor-detail-panel.test.tsx src/app/corridors/[id]/page.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 5**

Run:

```bash
git add src/components/panels/corridor-detail-panel.tsx src/components/panels/corridor-detail-panel.test.tsx src/app/corridors/[id]/page.tsx src/app/corridors/[id]/page.test.tsx
git commit -m "Add corridor detail activation bridge"
```

---

### Task 6: Acquisition Recommendation And Deterministic Content Hand-Off

**Files:**
- Create: `src/lib/acquisition-content.ts`
- Create: `src/lib/acquisition-content.test.ts`
- Create: `src/components/panels/acquisition-recommendation.tsx`
- Create: `src/components/panels/acquisition-recommendation.test.tsx`
- Create: `src/components/panels/content-draft-card.tsx`
- Create: `src/components/panels/content-draft-card.test.tsx`
- Modify: `src/app/acquisition/page.tsx`
- Modify: `src/app/acquisition/page.test.tsx`

- [ ] **Step 1: Add failing acquisition content tests**

Create `src/lib/acquisition-content.test.ts`:

```ts
import { getCorridorById } from '@/data';
import { buildAcquisitionDraft } from './acquisition-content';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('buildAcquisitionDraft', () => {
  it('generates deterministic multilingual A/B variants without backend or currency', () => {
    const corridor = getCorridorById('korea');
    const draft = buildAcquisitionDraft(corridor, 'entertainment_lover');

    expect(draft.languages).toEqual(['EN', '繁中', '한국어']);
    expect(draft.variants).toHaveLength(2);
    expect(draft.variants[0].subject).toContain('Korea');
    expect(draft.variants[0].body).toContain('Merging to the World');
    expect(draft.variants[1].kvCaption).toContain('Arena-first Rewards package');
    expect(draft.versionHistory).toEqual(['v1 corridor signal', 'v2 persona offer', 'v3 compliance copy']);
    expect(JSON.stringify(draft)).not.toMatch(bannedCurrencyPattern);
  });
});
```

Create `src/components/panels/acquisition-recommendation.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { priorityCorridor } from '@/data';
import { AcquisitionRecommendation } from './acquisition-recommendation';

describe('AcquisitionRecommendation', () => {
  it('renders Korea rationale, index, band, and refresh-pending tag', () => {
    render(<AcquisitionRecommendation corridor={priorityCorridor} />);

    expect(screen.getByRole('heading', { name: /Korea/i })).toBeInTheDocument();
    expect(screen.getByText(/Merging to the World/i)).toBeInTheDocument();
    expect(screen.getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByText(/22-36k equiv.\/mo/i)).toBeInTheDocument();
    expect(screen.getByText(/strong signal, validating/i)).toBeInTheDocument();
  });
});
```

Create `src/components/panels/content-draft-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { getCorridorById } from '@/data';
import { buildAcquisitionDraft } from '@/lib/acquisition-content';
import { ContentDraftCard } from './content-draft-card';

describe('ContentDraftCard', () => {
  it('renders deterministic multilingual campaign draft variants', () => {
    const corridor = getCorridorById('korea');
    const draft = buildAcquisitionDraft(corridor, 'entertainment_lover');

    render(<ContentDraftCard draft={draft} />);

    expect(screen.getByRole('heading', { name: /Content draft/i })).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('繁中')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText(/Variant A/i)).toBeInTheDocument();
    expect(screen.getByText(/Variant B/i)).toBeInTheDocument();
    expect(screen.getByText(/v3 compliance copy/i)).toBeInTheDocument();
  });
});
```

Replace `src/app/acquisition/page.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AcquisitionPage from './page';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('corridor=korea&persona=entertainment_lover'),
}));

describe('acquisition route', () => {
  it('renders priority corridor recommendation and templated content hand-off', () => {
    render(<AcquisitionPage />);

    expect(screen.getByRole('heading', { name: 'Priority Corridor Acquisition', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Korea/i)).toBeInTheDocument();
    expect(screen.getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Target personas/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Content draft/i })).toBeInTheDocument();
    expect(screen.getByText(/No live model call/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run acquisition tests and confirm they fail**

Run:

```bash
npm run test -- src/lib/acquisition-content.test.ts src/components/panels/acquisition-recommendation.test.tsx src/components/panels/content-draft-card.test.tsx src/app/acquisition/page.test.tsx
```

Expected: FAIL because the content generator and panels do not exist.

- [ ] **Step 3: Implement deterministic content generator**

Create `src/lib/acquisition-content.ts`:

```ts
import type { AcquisitionDraft, Corridor, PersonaKey } from '@/data';

function findPersona(corridor: Corridor, personaKey: PersonaKey) {
  return corridor.personas.find((persona) => persona.persona === personaKey) ?? corridor.personas[0];
}

export function buildAcquisitionDraft(corridor: Corridor, personaKey: PersonaKey): AcquisitionDraft {
  const persona = findPersona(corridor, personaKey);
  const theme = corridor.note ?? `${corridor.name} acquisition`;

  return {
    corridorId: corridor.id,
    persona: persona.persona,
    languages: ['EN', '繁中', corridor.languageLabel],
    variants: [
      {
        id: 'A',
        subject: `${corridor.name} ${persona.label}: ${theme}`,
        body: `Invite ${corridor.name} ${persona.label} travelers with ${persona.recommendedOffer}. Use aggregate corridor indices and ${corridor.projectedValueBand} opportunity bands only.`,
        kvCaption: `${theme}: ${persona.kvBrief}`,
      },
      {
        id: 'B',
        subject: `${persona.label} escape for ${corridor.name}`,
        body: `Position Galaxy Rewards around ${persona.topCategories.join(', ')} and keep the message indexed, directional, and refresh-aware.`,
        kvCaption: `${persona.recommendedOffer} · ${corridor.languageLabel} ready`,
      },
    ],
    versionHistory: ['v1 corridor signal', 'v2 persona offer', 'v3 compliance copy'],
  };
}
```

- [ ] **Step 4: Implement AcquisitionRecommendation**

Create `src/components/panels/acquisition-recommendation.tsx`:

```tsx
import { BandValue, IndexValue } from '@/components/ui/formatted-values';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import type { Corridor } from '@/data';
import { koreaRefreshTag } from '@/data';

export function AcquisitionRecommendation({ corridor }: { corridor: Corridor }) {
  const tag = koreaRefreshTag(corridor);
  const topPersona = corridor.personas[0];

  return (
    <Panel className="bg-[linear-gradient(135deg,rgba(205,164,92,0.14),rgba(8,18,30,0.82))]">
      <SectionHeader
        eyebrow="Priority recommendation"
        title={`${corridor.name}: ${corridor.note ?? 'Acquisition priority'}`}
        description="Strong signal, validating. Use this as the first acquisition corridor while refreshing the post-2020 panel."
      />
      {tag ? <p className="mt-4 inline-flex rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold text-galaxy-gold">{tag}</p> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Why #1</p>
          <p className="mt-2 text-sm leading-6 text-galaxy-cream">High non-gaming momentum, strong frequency, and clear entertainment-led addressability.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Priority index</p>
          <div className="mt-2 text-xl font-semibold"><IndexValue value={corridor.priorityIndex} /></div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Projected value band</p>
          <div className="mt-2 text-xl font-semibold"><BandValue value={corridor.projectedValueBand} /></div>
        </div>
      </div>
      <p className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
        Offer first: {topPersona.recommendedOffer}
      </p>
    </Panel>
  );
}
```

- [ ] **Step 5: Implement ContentDraftCard**

Create `src/components/panels/content-draft-card.tsx`:

```tsx
import type { AcquisitionDraft } from '@/data';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';

export function ContentDraftCard({ draft }: { draft: AcquisitionDraft }) {
  return (
    <Panel>
      <SectionHeader
        eyebrow="Deterministic template"
        title="Content draft"
        description="No live model call. This client-side draft is generated from corridor and persona data only."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {draft.languages.map((language) => (
          <span key={language} className="rounded border border-galaxy-border bg-galaxy-ink/40 px-2 py-1 text-xs font-semibold text-galaxy-gold">
            {language}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {draft.variants.map((variant) => (
          <article key={variant.id} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Variant {variant.id}</p>
            <h3 className="mt-3 font-sans text-lg font-semibold text-galaxy-cream">{variant.subject}</h3>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{variant.body}</p>
            <p className="mt-4 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-3 text-sm font-semibold leading-6 text-galaxy-cream">
              {variant.kvCaption}
            </p>
          </article>
        ))}
      </div>
      <ol className="mt-5 flex flex-wrap gap-2 text-xs text-galaxy-muted">
        {draft.versionHistory.map((item) => (
          <li key={item} className="rounded border border-galaxy-border px-2 py-1">{item}</li>
        ))}
      </ol>
    </Panel>
  );
}
```

- [ ] **Step 6: Implement acquisition page**

Replace `src/app/acquisition/page.tsx` with:

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { AcquisitionRecommendation } from '@/components/panels/acquisition-recommendation';
import { ContentDraftCard } from '@/components/panels/content-draft-card';
import { PersonaAffinityChart } from '@/components/charts/persona-affinity-chart';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import { getCorridorById, koreaRefreshTag, priorityCorridor, type PersonaKey } from '@/data';
import { buildAcquisitionDraft } from '@/lib/acquisition-content';

export default function AcquisitionPage() {
  const searchParams = useSearchParams();
  const corridor = getCorridorById(searchParams.get('corridor') ?? priorityCorridor.id);
  const persona = (searchParams.get('persona') ?? corridor.personas[0].persona) as PersonaKey;
  const draft = buildAcquisitionDraft(corridor, persona);
  const tag = koreaRefreshTag(corridor);

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Acquisition hand-off"
        title="Priority Corridor Acquisition"
        description={`Turn ${corridor.name} corridor intelligence into persona-led campaign content without live AI calls or client-side keys.`}
        aside={tag ? <p className="font-semibold text-galaxy-gold">{tag}</p> : <p>{corridor.languageLabel} draft ready</p>}
      />

      <AcquisitionRecommendation corridor={corridor} />

      <Panel>
        <SectionHeader
          eyebrow="Target personas"
          title="Target personas"
          description="Persona share, affinity, and recommended offer are generated from aggregate corridor signals."
        />
        <div className="mt-5">
          <PersonaAffinityChart corridor={corridor} />
        </div>
      </Panel>

      <ContentDraftCard draft={draft} />
    </div>
  );
}
```

- [ ] **Step 7: Run acquisition tests**

Run:

```bash
npm run test -- src/lib/acquisition-content.test.ts src/components/panels/acquisition-recommendation.test.tsx src/components/panels/content-draft-card.test.tsx src/app/acquisition/page.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 6**

Run:

```bash
git add src/lib/acquisition-content.ts src/lib/acquisition-content.test.ts src/components/panels/acquisition-recommendation.tsx src/components/panels/acquisition-recommendation.test.tsx src/components/panels/content-draft-card.tsx src/components/panels/content-draft-card.test.tsx src/app/acquisition/page.tsx src/app/acquisition/page.test.tsx
git commit -m "Add acquisition content handoff"
```

---

### Task 7: Lens Loop Cross-Link, README, And Compliance E2E

**Files:**
- Modify: `src/app/segments/page.tsx`
- Modify: `src/app/segments/page.test.tsx`
- Modify: `README.md`
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Add failing Lens B cross-link and README/e2e tests**

Append to `src/app/segments/page.test.tsx`:

```tsx
  it('offers a cross-link from retained segments to acquisition corridors', () => {
    renderSegments();

    expect(screen.getByRole('link', { name: /Explore acquisition corridors/i })).toHaveAttribute('href', '/corridors');
  });
```

Append to `e2e/compliance.spec.ts` route list:

```ts
const routes = ['/', '/wallet', '/segments', '/leakage', '/propensity', '/activation', '/marketscan', '/corridors', '/corridors/korea', '/acquisition'];
```

Append this e2e test inside the describe block:

```ts
  test('acquisition lens keeps corridor data aggregate and CDE-safe', async ({ page }) => {
    await page.goto('/corridors');

    await expect(page.getByRole('navigation', { name: /Lens switch/i }).getByText(/Corridors Acquisition/i)).toBeVisible();
    await expect(page.getByText(/10–20% panel/i)).toBeVisible();
    await expect(page.getByText(/aggregate inbound panel, no PII/i)).toBeVisible();
    await expect(page.getByText('2020 base · refresh pending')).toBeVisible();
    await expect(page.getByRole('row', { name: /#1 Korea/i })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);

    await page.getByRole('link', { name: /Open acquisition recommendation/i }).click();
    await expect(page).toHaveURL(/\/acquisition\?corridor=korea/);
    await expect(page.getByRole('heading', { name: /Content draft/i })).toBeVisible();
    await expect(page.getByText(/No live model call/i)).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
  });
```

- [ ] **Step 2: Run focused tests and confirm failures**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "acquisition lens"
```

Expected: segment unit test FAILS because cross-link is missing. The e2e may fail until new routes are included in compliance logic and full pages are in place.

- [ ] **Step 3: Add one Lens A cross-link to segments**

In `src/app/segments/page.tsx`, import `Link` from `next/link` if not already present.

Add this `Panel` after the compact `PageHeader` and before the existing active segment branch:

```tsx
      <Panel className="border-galaxy-gold/30 bg-galaxy-gold/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Close the loop</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Lens A grows wallet from known guests. Lens B finds the next source markets to acquire.
            </p>
          </div>
          <Link
            href="/corridors"
            className="inline-flex rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink hover:bg-galaxy-gold-lite"
          >
            Explore acquisition corridors
          </Link>
        </div>
      </Panel>
```

- [ ] **Step 4: Append README demo script**

Append to `README.md`:

```md

## Lens B Demo Script

1. Flip to Acquisition lens: "Lens A grew the wallet of the guests you have. Lens B finds the next ones."
2. Corridor board: "Your top inbound markets, 2020 vs 2024. Short-haul dominates; Taiwan skews gaming, Singapore skews hospitality, Japan peaks at festivals."
3. Priority tile: "The standout signal is Korea: Merging to the World. We are validating it against post-2020 data, but this is where acquisition should point first."
4. Corridor to persona to content: "Pick Korea, see personas and co-spend themes, then generate the campaign KV in EN, 繁中, and 한국어 using deterministic compliant templates."
5. Close the loop: "Acquire from the right corridor, then grow their wallet on-property. One platform, one loop."

Lens B content generation is a deterministic client-side template. It uses no live LLM call, no API key, no backend, and no client-side model credential. A future governed model route would need to run through a controlled backend or governance layer, not raw browser keys.
```

- [ ] **Step 5: Update e2e route-specific checks**

In `e2e/compliance.spec.ts`, keep the existing activation exception for MOP offer terms. Add route-specific Lens B checks in the existing route loop:

```ts
      if (route === '/corridors') {
        await expect(page.getByRole('heading', { name: /Source-Market & Corridor Intelligence/i })).toBeVisible();
        await expect(page.getByText(/10–20% panel/i)).toBeVisible();
        await expect(page.getByText(/aggregate inbound panel, no PII/i)).toBeVisible();
        await expect(page.getByRole('row', { name: /#1 Korea/i })).toBeVisible();
      }

      if (route === '/corridors/korea') {
        await expect(page.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeVisible();
        await expect(page.getByText('2020 base · refresh pending')).toBeVisible();
        await expect(page.getByRole('link', { name: /Generate campaign content/i })).toBeVisible();
      }

      if (route === '/acquisition') {
        await expect(page.getByRole('heading', { name: /Priority Corridor Acquisition/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Content draft/i })).toBeVisible();
        await expect(page.getByText(/No live model call/i)).toBeVisible();
      }
```

- [ ] **Step 6: Run focused unit and e2e tests**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "acquisition lens|shows CDE methodology"
```

Expected: PASS.

- [ ] **Step 7: Commit Task 7**

Run:

```bash
git add src/app/segments/page.tsx src/app/segments/page.test.tsx README.md e2e/compliance.spec.ts
git commit -m "Add acquisition lens demo loop"
```

---

### Task 8: Final Verification And Browser Review

**Files:**
- No source files unless verification exposes a bug.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run verify
```

Expected: PASS for lint, unit tests, production build, and Playwright e2e.

- [ ] **Step 2: Start the dev server for visual review**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Expected: server ready at `http://127.0.0.1:3000`.

- [ ] **Step 3: Capture responsive screenshots**

Run this script in another terminal while the dev server is active:

```bash
node <<'NODE'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = '/tmp/galaxy-lens-b-review';
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const viewports = [
    { label: 'iphone', width: 390, height: 844 },
    { label: 'ipad', width: 820, height: 1180 },
    { label: 'desktop', width: 1440, height: 900 },
  ];
  const routes = ['/corridors', '/corridors/korea', '/acquisition', '/segments'];

  const browser = await chromium.launch();
  const failures = [];
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(600);
      const slug = route === '/corridors/korea' ? 'corridors-korea' : route.slice(1);
      await page.screenshot({ path: path.join(outDir, `${viewport.label}-${slug}.png`), fullPage: false });

      const scrollWidth = await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth));
      if (scrollWidth > viewport.width) failures.push(`${viewport.label} ${route}: scrollWidth ${scrollWidth} > viewport ${viewport.width}`);

      const text = await page.locator('body').innerText();
      if (!/Enriched figures are modelled estimates/i.test(text)) failures.push(`${viewport.label} ${route}: methodology text missing`);
      if (/HKD|MOP|\$|元|澳門幣/i.test(text) && route !== '/segments') failures.push(`${viewport.label} ${route}: banned currency found`);
    }
    await page.close();
  }
  await browser.close();

  console.log(JSON.stringify({ outDir, failures }, null, 2));
  if (failures.length > 0) process.exit(1);
})();
NODE
```

Expected: PASS with `failures: []` and screenshots in `/tmp/galaxy-lens-b-review`.

- [ ] **Step 4: Manually inspect required screenshots**

Open these files:

```bash
open /tmp/galaxy-lens-b-review/iphone-corridors.png
open /tmp/galaxy-lens-b-review/ipad-corridors.png
open /tmp/galaxy-lens-b-review/desktop-corridors.png
open /tmp/galaxy-lens-b-review/desktop-corridors-korea.png
open /tmp/galaxy-lens-b-review/desktop-acquisition.png
```

Confirm:

- LensSwitch is visible and does not crowd the top bar.
- `/corridors` shows controls, ranking, Korea priority tile, and seasonality heatmap.
- Korea displays `2020 base · refresh pending`.
- Taiwan gaming-heavy and Singapore non-gaming-heavy splits are visible.
- `/corridors/korea` shows persona mix and `Generate campaign content`.
- `/acquisition` shows recommendation, target personas, multilingual content draft, A/B variants, and version list.
- No horizontal overflow on iPhone or iPad.

- [ ] **Step 5: Final git check**

Run:

```bash
git status -sb
git log --oneline --decorate -8
```

Expected:

- Only intended committed changes are present.
- Pre-existing untracked `docs/` and `spec/` stay untracked unless the plan file is intentionally untracked before commit.

- [ ] **Step 6: Commit verification-only fixes if needed**

If verification exposes a bug, write a focused failing test first, implement the smallest fix, rerun focused tests and `npm run verify`, then commit:

```bash
git add <changed-files>
git commit -m "Fix Lens B verification issue"
```

If no verification-only fix is needed, skip this step.

---

## Self-Review

Spec coverage:

- Lens switch and swapped nav group: Task 2.
- New `/corridors`, `/corridors/[id]`, `/acquisition` routes: Tasks 2, 4, 5, 6.
- Aggregate corridor data, seeded deterministic generation, priority ranking, Korea #1: Task 1.
- Panel share `10–20%`, aggregate/no-PII note, methodology footer continuity: Tasks 1, 4, 7.
- Corridor board controls, ranking, split bars, seasonality, priority tile: Tasks 3 and 4.
- Corridor detail persona mix, affinity, offer, KV bridge: Task 5.
- Acquisition recommendation and deterministic multilingual content hand-off: Task 6.
- Cross-lens close-the-loop link and README demo script: Task 7.
- Compliance and responsive checks: Tasks 7 and 8.

Placeholder scan:

- No unresolved marker terms remain.
- Stretch Asia map is explicitly out of scope for this pass.
- The route tests and component tests contain exact assertions and commands.

Type consistency:

- `CorridorId`, `CorridorYear`, `CorridorMetric`, `PersonaKey`, `Corridor`, and `AcquisitionDraft` are defined in Task 1 and reused consistently.
- `buildAcquisitionDraft(corridor, personaKey)` is defined in Task 6 and used by `/acquisition`.
- `koreaRefreshTag(corridor)` is defined in Task 1 and reused by visual panels/routes.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-26-lens-b-corridor-intelligence.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
