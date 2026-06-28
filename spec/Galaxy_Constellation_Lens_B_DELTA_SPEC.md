# DELTA SPEC — Galaxy Constellation: add **Lens B (Source-Market & Corridor Intelligence)**

**For:** Codex, extending the **already-built** Galaxy Constellation app.
**Scope:** This is a *delta only*. The existing app (Lens A — Guest Wallet Intelligence) is built and working. Do **not** re-scaffold, restyle, or touch existing screens except to add the lens switch and one cross-link. Add an **Acquisition** lens alongside the existing **Wallet** lens.

---

## 0. Reuse these existing pieces (don't rebuild them)
Before writing code, locate and reuse from the current repo:
- **Shell** — `Nav`, `TopBar`, `Footer`, `CoBrandLockup`, the methodology footer.
- **Palette & fonts** — the `galaxy.*` tokens (ink/charcoal/slate/border/gold/cream/etc.), serif display + Inter body, EN/繁中 header treatment.
- **Guardrail util** — `formatEnriched()` and the `CDE`-style chip; reuse the same number discipline (%, index base 100, band) and the methodology object in `src/data/`.
- **Data layer** — the seeded generator (e.g. `generate.ts` + mulberry32 PRNG) and the `src/data/*` pattern. Extend it; don't fork it.
- **UI primitives** — `Panel`, `KpiCard`, `Overline`, `BandValue`, `IndexValue`, `GoldNumber`, etc.
- **Conventions** — App Router under `src/app`, `@/*` → `src/*`, client-provider pattern for shared state, no backend, Vercel-clean `next build`.

If a named item differs in the actual repo, adapt to what's there — match the existing patterns over these names.

---

## 1. Why this exists (the second question Galaxy asked)
The built app answers a **retention** question — "for guests we already have, how much of their wallet do we capture, and where does it leak?" This delta adds the **acquisition** question — **"which inbound source markets should we target to bring in *new* high-value guests, when, and with what offer?"** — running on Mastercard's **aggregate inbound-transaction panel** (not Galaxy's guest IDs). The two together are one loop: *acquire the right guests (Lens B) → grow their wallet on-property (Lens A).*

---

## 2. Compliance & data rules specific to Lens B (in addition to the existing ones)
- **Aggregate market data, no PII, no individual records.** Express everything as **indices (base 100), %, ranks, or bands** — never absolute MOP, never an individual. Reuse `formatEnriched()`.
- **Panel coverage ~10–20%.** Mastercard sees a slice of transactions. Show a persistent note that corridor figures are **directional, indexed, and best blended with first-party/other sources**. Add `panelSharePct: '10–20%'` to the existing methodology object.
- **Korea is a 2020-based signal.** The priority-corridor finding rests on 2020 data; the refresh is an open client action. Tag it **"2020 base · refresh pending"** everywhere Korea's ranking appears. Present as "strong signal, validating," not settled.
- Corridor **gaming vs non-gaming** split is allowed (aggregate only — never per guest).

---

## 3. Routes + lens switch (the navigation delta)
- Add a **`LensSwitch`** to the existing `TopBar`: **Wallet (Retention) ⇄ Corridors (Acquisition)**. It reroutes and swaps the nav group; both lenses share the same shell.
- New routes under `src/app/`:
  - `/corridors` — **Source-Market & Corridor board** (main Lens B screen).
  - `/corridors/[id]` — **Corridor detail** (persona → affinity → offer). May instead render as an in-page panel on `/corridors`; either is fine.
  - `/acquisition` — **Priority corridor recommendation + content hand-off**.

---

## 4. Screens (same visual language as the existing app)

### 4.1 `/corridors` — Source-Market & Corridor board
- **Controls:** a **2020 ⇄ 2024** toggle and a metric selector (arrivals index / spend index / transaction frequency / gaming-vs-non-gaming).
- **Corridor ranking** (table or horizontal bars), top-10 inbound markets; each row shows arrivals index, spend index, same-card monthly transaction-frequency index, avg-ticket band, and a small **gaming vs non-gaming** split bar. Short-haul (Taiwan, HK, GBA mainland, SEA) dominates volume; Taiwan is the standout *long-haul* presence in the top 10.
- **Seasonality heatmap** (month × corridor, intensity = visit/spend index). Annotate the real patterns: **Japan peaks around festival periods**; **Southeast Asia clusters on long weekends / short holidays**; **Hong Kong volume softening** 2020→2024.
- **Gaming vs non-gaming split** per corridor (stacked bars): **Taiwan skews gaming; Singapore skews hospitality/recreation** — reproduce this contrast, it's a real finding.
- **Priority-corridor tile** (hero): ranked recommendation with **Korea #1 under the "Merging to the World" theme**, carrying the **"2020 base · refresh pending"** tag. Click → `/acquisition`.
- *(stretch)* a simple Asia region map with corridor intensity; a ranked list + bars is sufficient — only attempt the map if everything else is done.
- Keep the methodology footer + add the 10–20% panel note.

### 4.2 `/corridors/[id]` — Corridor detail (insight → activation bridge)
- **Persona mix** for the corridor (F&B Seeker, Entertainment Lover, Travel Lover, Luxury Shopper, Family Leisure) with **affinity analysis** — the co-spend categories / top merchant-category themes that define each persona (e.g. "F&B Seeker also indexes high on bars/clubs + entertainment").
- Corridor **seasonality** and **gaming/non-gaming + channel** mini-charts.
- **Recommended offer + KV (key-visual) brief** per dominant persona → button "Generate campaign content" → `/acquisition`. (This is the bridge the client reached for: "how do we quickly produce 10 KVs per promotion.")

### 4.3 `/acquisition` — Priority recommendation + content hand-off
- **Recommendation panel:** the priority corridor (Korea) with rationale (why #1), "what to offer," and projected value as an **index + band** (never absolute). Keep the refresh-pending tag.
- **Target personas** summary for that corridor (size %, affinity, recommended offer).
- **Content draft card** (the Cadence-concept hand-off): from a chosen persona/corridor, produce a **bilingual/multilingual draft** (EN / 繁中, plus the corridor language, e.g. 한국어 for Korea) of a marketing email or KV caption, with **A/B variants** and a **version-history** nod.
  - **Default implementation = deterministic templated generator** (string templates filled from corridor/persona data). **No LLM call, no API key, no backend** — must deploy clean on Vercel. (If a live LLM is wired later, it routes through a governed layer — Anchor RAG / governance — not a raw client-side key. Note this in the README; don't build it now.)

---

## 5. Data model (extend the existing seeded generator)
Add to `src/data/` (new file `corridors.ts`, generated by the existing seeded generator):

```ts
type CorridorId =
  'taiwan'|'hongkong'|'gba_mainland'|'japan'|'korea'|'singapore'|'malaysia'|'thailand'|'indonesia'|'philippines';

type PersonaKey = 'fnb_seeker'|'entertainment_lover'|'travel_lover'|'luxury_shopper'|'family_leisure';

interface PersonaAffinity {
  persona: PersonaKey;
  sharePct: number;            // % of the corridor
  topCategories: string[];     // affinity co-spend themes (e.g. 'bars/clubs','luxury retail')
  recommendedOffer: string;    // tied to a real Galaxy lever (Rewards, ICBC co-brand, Promenade, Arena, GICC)
  kvBrief: string;             // one-line creative brief
}

interface Corridor {
  id: CorridorId;
  name: string; nameZh: string;
  haul: 'short'|'long';
  arrivalsIndex: { '2020': number; '2024': number };  // base 100 = market avg
  spendIndex:    { '2020': number; '2024': number };
  txnFrequencyIndex: number;          // same-card monthly frequency, indexed
  avgTicketBand: string;              // e.g. 'mid' or a band string
  gamingSharePct: number;            // % of corridor spend that is gaming
  nonGamingSharePct: number;         // INVARIANT: gamingSharePct + nonGamingSharePct === 100
  nonGamingMix: { hospitality: number; fnb: number; entertainment: number; retail: number }; // indices
  seasonality: number[];             // 12 values, index (100 = corridor avg)
  personas: PersonaAffinity[];
  priorityIndex: number;             // corridor attractiveness → ranking (computed, see below)
  priorityRank: number;              // 1..10
  dataVintage: '2020'|'2024';        // drives the "refresh pending" tag (Korea = '2020')
  note?: string;                     // Korea → 'Merging to the World'
}
```

**Invariants & generation rules (seeded, deterministic):**
- `gamingSharePct + nonGamingSharePct === 100` per corridor.
- Bake in the real contrasts: **Taiwan** high `gamingSharePct`; **Singapore** high `nonGamingMix.hospitality`/recreation; **Japan** `seasonality` peaking at festival months (e.g. spikes ~Mar–Apr and Oct–Nov); **Hong Kong** `arrivalsIndex['2024'] < arrivalsIndex['2020']`; short-haul corridors carry the highest arrivals.
- `priorityIndex` is **computed, not authored**, so Korea's #1 rank is defensible. Suggested blend:
  ```ts
  // higher = more attractive acquisition target
  priorityIndex = Math.round(
    0.35*nonGamingMomentum + 0.25*arrivalsGrowth + 0.20*txnFrequencyIndex + 0.20*addressabilityGap
  );
  // tune the seed so Korea tops the ranking; set Korea dataVintage:'2020', note:'Merging to the World'
  ```
  (The session's underlying metric was a correlation *index*; we abstract it to a clean attractiveness score for demo coherence, while staying honest with the "2020 base · refresh pending" tag.)
- Extend the methodology object: `panelSharePct: '10–20%'`, `dataYears: ['2020','2024']`, `lensBNote: 'aggregate inbound panel, no PII'`.

---

## 6. New components
- `components/charts/`: `CorridorRankTable` (or `CorridorBars`), `SeasonalityHeatmap`, `GamingSplitBar`, `PersonaAffinityChart`, `PriorityCorridorTile`, *(stretch)* `CorridorMap`.
- `components/panels/`: `CorridorDetailPanel`, `AcquisitionRecommendation`, `ContentDraftCard` (bilingual KV/email mock with A/B + version list).
- `components/shell/`: `LensSwitch` (Wallet ⇄ Corridors toggle in `TopBar`).

Reuse existing primitives (`Panel`, `Overline`, `IndexValue`, `BandValue`, chip, etc.) — don't duplicate them.

---

## 7. Build milestones (the delta)
Keep it runnable at each step; each ends on a clean `next build`.

**D1 — Corridor data + lens switch.** Extend the seeded generator with 10 corridors × (2020/2024), personas/affinity, seasonality, computed priority ranking. Add `LensSwitch` to `TopBar` and the "Acquisition" nav group. Routes stubbed and reachable.

**D2 — `/corridors` board.** Ranking with 2020⇄2024 toggle, gaming/non-gaming split bars, seasonality heatmap, priority-corridor tile (Korea + "Merging to the World" + "2020 base · refresh pending"). Panel/methodology note.

**D3 — Corridor detail + `/acquisition`.** Persona/affinity, corridor→persona→offer flow, acquisition recommendation, and `ContentDraftCard` (templated bilingual/multilingual draft, A/B, version nod). No LLM/API.

**D4 — Cross-link + polish.** One hop linking the lenses (e.g. from a corridor, "these arrivals become these on-property segments" → existing `/segments`), README demo-script additions, responsive at 1440×900, clean build.

**Acceptance checks:**
- `LensSwitch` toggles cleanly; both lenses share shell + palette; existing Lens A screens untouched (besides the switch + one cross-link).
- All corridor values are indices / % / ranks / bands — no absolute MOP, no PII; the ~10–20% panel note is visible.
- Korea ranks #1 with the theme label and the "2020 base · refresh pending" tag.
- Corridor contrasts visible: Taiwan gaming-heavy, Singapore non-gaming-heavy, Japan festival seasonality peaks, HK arrivals softening 2020→2024.
- `ContentDraftCard` runs fully client-side (no key, no backend); `next build` passes; deploys to Vercel.

---

## 8. Demo-script additions (append to README)
1. **Flip to Acquisition lens:** "Lens A grew the wallet of the guests you have. Lens B finds the next ones."
2. **Corridor board:** "Your top inbound markets, 2020 vs 2024 — short-haul dominates; Taiwan skews gaming, Singapore skews hospitality, Japan peaks at festivals."
3. **Priority tile:** "The standout signal is Korea — 'Merging to the World.' We're validating it against post-2020 data, but it's where we'd point acquisition first."
4. **Corridor → persona → content:** "Pick Korea, see the personas and what they co-spend on, then generate the campaign KV in their language — tuned to your brand and compliance."
5. **Close the loop:** "Acquire from the right corridor, then grow their wallet on-property. One platform, one loop."

---

## 9. Out-of-scope / guardrails for this delta
- Don't re-scaffold, restyle, or modify existing Lens A screens beyond adding the `LensSwitch` and one cross-link.
- Corridor data is **aggregate, no PII** — indices/%/ranks/bands only; gaming split at corridor aggregate level only.
- Always tag Korea "2020 base · refresh pending" — never present it as settled.
- The content generator is a **client-side templated mock** — do not wire a live LLM or API key into the Vercel build.
- No real Galaxy/Mastercard logo image files; styled text/SVG wordmarks only (match the existing app).

---

*End of delta spec. Point Codex at the existing repo and build D1→D4.*
