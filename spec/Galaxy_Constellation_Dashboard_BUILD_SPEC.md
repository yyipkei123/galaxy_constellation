# BUILD SPEC — "Galaxy Constellation"
## Guest Wallet Intelligence Dashboard (Galaxy Macau × Mastercard CDE)

**Prepared for:** Galaxy Entertainment Group / Galaxy Macau (first showcase)
**Built by:** Deloitte Digital Foundry — Forward Deployed Engineering
**Data product:** Mastercard Card Data Enrichment (CDE) appended to Galaxy first-party guest data
**Purpose of this file:** A self-contained specification to be fed to **Claude Code / Codex** to build a deployable demo. It is opinionated and implementation-ready. An agent should be able to scaffold and build the showcase from this document alone.

---

## 0. TL;DR for the build agent

Build a **Next.js 14 (App Router) + TypeScript + Tailwind + Recharts** single-page-feel analytics dashboard, deployable to Vercel, styled to mirror **galaxymacau.com** (golden allure on near-black, elegant serif display + clean sans body, "World Class, Asian Heart"). All data is **synthetic and generated locally** — there is **no backend**. The dashboard demonstrates how combining **Galaxy's own property transactions** with **Mastercard CDE enrichment** surfaces *share-of-wallet leakage* and *next-best-action* opportunities that pull guest spend back into Galaxy hotels, F&B, retail, entertainment and gaming.

**Hard rule that defines the whole product:** the CDE data product never exposes absolute per-customer money values. Every enriched figure must be rendered as a **percentage, a banded range, or an index (base = 100)** — never a raw absolute MOP/HKD number at customer level. This constraint is a feature: it is shown explicitly in the UI and is the thing that makes the demo credible to the client. (See §3.)

---

## 1. Business context & the insight thesis

Galaxy Macau is a luxury integrated resort: 9 hotels (Galaxy Hotel, Okura, Banyan Tree, JW Marriott, Ritz-Carlton, Raffles, Andaz, Capella, Broadway), 120+ restaurants, 200+ retail/luxury brands (Galaxy Promenade), Grand Resort Deck, Galaxy Arena (16,000 seats), GICC MICE space, and gaming. Loyalty runs through **Galaxy Rewards** and the **ICBC Galaxy Macau co-brand credit card**.

Galaxy knows a lot about what a guest does **inside** Galaxy. It knows almost nothing about what the same guest does **outside** Galaxy — at competitor resorts, in luxury retail off-property, on dining and entertainment elsewhere, or in cross-border (Greater Bay Area) spend.

**Mastercard CDE** closes that gap. CDE appends category-level spend metrics and propensity scores back onto each Customer ID, imputed from Mastercard's anonymised transaction panel. When Galaxy joins its first-party guest record (left side, keyed on card/customer ID) to the CDE enrichment (right side: category spend, share-of-wallet, propensities), it can answer the question that today it cannot:

> *"This guest spends X with us in hospitality and F&B — but how big is their total wallet in those categories, and how much of it is leaking to competitors?"*

The **hero insight** (straight from the client conversation): a guest may stay at a Galaxy hotel but spend cash at other hotels and venues. That cross-property / off-property spend is **opportunity cost** — quantifiable headroom that Galaxy can win back with the right offer. Example framing to reproduce in the UI: *"This segment leaves an estimated 9,000-equivalent of monthly hospitality wallet on the table at competitors — an index of 'leakage' Galaxy can target."*

**What the dashboard must prove:** combining the two data sources turns Galaxy's CRM from a *record of past spend* into a *map of total addressable guest wallet + a targeting engine* to capture more of it.

---

## 2. Mastercard CDE — the data product (model this faithfully)

CDE = **Card Data Enrichment**. Group propensities and metrics are appended back to the client's CRM file for each Customer ID, based on imputed spending insights from anonymised transaction data. For non-propensity metrics, the value reflects the **average of the demi-decile** the customer falls into (i.e., a banded/grouped figure, not an individual exact figure).

### 2.1 Refresh & volume rules
- Metrics refreshed **quarterly or half-yearly**, based on client needs.
- Up to **7 metrics per analysis** (the standard CDE cap). Models and propensities can be appended **beyond** the 7.
- The build should let the user *see* "7 active metrics this quarter" as a deliberate, finite set — reinforcing the productised nature.

### 2.2 The metric catalogue (from CDE Key Metrics)
Render these as the selectable enrichment fields. Re-themed from the generic CDE examples to Galaxy's world:

| CDE metric | Generic CDE sample | Galaxy-themed instantiation |
|---|---|---|
| **Share of Wallet** | Share of Department Store Spend | Share of guest's **hospitality** wallet captured by Galaxy vs. market |
| **Share of Visits** | Share of Grocery Visits | Share of **F&B / dining visits** at Galaxy vs. elsewhere |
| **Average Transaction #** | Avg transactions in grocery | Avg **dining/retail transactions** per guest per period |
| **Average Transaction Size** | Avg transaction spend in eating places | Avg **ticket size** in F&B / luxury retail (banded) |
| **Average Industry Spend** | Automotive retail spend | Avg **category spend** in hospitality / luxury / entertainment (indexed) |
| **Channel Share** | Channel share – grocery | **Online vs. physical** payment share |
| **Channel Visits #** | Avg online transactions – grocery | Avg **online transactions** per period |

### 2.3 Models & propensities (append beyond the 7)
- **Models (custom & standard):** e.g., *Co-Brand Look-Alike Score* (look-alikes for the ICBC Galaxy co-brand card).
- **Standard propensities:** e.g., *High Spenders in Luxury Hotels*, *Propensity to be a Top-Tier Rewards Card Spender*. Rendered as 0–1 scores.

### 2.4 Spend categories (from the client conversation — use exactly these)
- **Hospitality** (core).
- **F&B** → sub-divisible into **bars/clubs** and **full-service restaurants**. (Do **not** split to cuisine/nationality level — explicitly out of scope.)
- **Entertainment** → concerts, theme parks, arena events (Galaxy Arena is highly relevant).
- **Retail** → sub-divisible, including a **Luxury** sub-category (jewellery, watches, etc.).
- **Cross-property / cross-site cash spending** → flagged as the key opportunity-cost indicator.

---

## 3. COMPLIANCE — the rule that shapes every number on screen

This is non-negotiable and must be visible in the product, because it is what makes the demo authentic to how CDE actually delivers data.

1. **No absolute per-customer money values.** At customer/segment level, money is shown only as:
   - **Percentages** (e.g., share of wallet = 22%),
   - **Banded ranges** (e.g., "monthly luxury spend: 8k–12k band"),
   - **Indices** (base = 100; e.g., "category spend index 143 vs. market 100").
2. **Galaxy can only share its own property transactions.** Off-property merchant transactions (e.g., a luxury boutique, a competitor hotel) are **never** shown as itemised Galaxy-sourced records. They appear only as **CDE-imputed category aggregates** (demi-decile averages).
3. **Match-rate transparency.** Because hotel transactions are infrequent (a guest may transact only 2–3×/year at a hotel), card-level match rates can be low; **transaction-level matching** is more reliable. The UI must carry a **methodology note** stating the matched-base coverage and that figures are modelled estimates, not exact counts.
4. **Demi-decile basis.** Non-propensity metrics are demi-decile averages — i.e., the guest is represented by the average of their banded peer group, not their literal spend.

**Implementation:** create a `formatEnriched()` utility that *refuses* to render a raw absolute customer-level number for any CDE-sourced field — it only emits `%`, `range`, or `index` formats. First-party Galaxy figures (what they already own) may be shown as ranges/indices too for consistency, and the demo should default everything to indexed/% so the screen reads as a real CDE deliverable. Add a persistent footer badge: **"Enriched figures are modelled estimates (demi-decile averages), expressed as indices / ranges / % per Mastercard CDE data-sharing rules."**

**Scope of the no-absolute rule (read carefully — two carve-outs):**
- The rule applies to **CDE-enriched / off-property / guest-wallet** figures. It does **not** apply to **Galaxy's own published offer mechanics** (e.g., "MOP 200 rebate on MOP 500 spend", "up to 20% off", "2× Rewards points"). Those are real promotional terms and should be shown as-is, in **MOP**. Don't band or index offer terms.
- Enriched bands are **unit-light** and carry an `equiv.` suffix (e.g., `"8–12k equiv./mo"`), **never** a currency symbol, to avoid implying an exact off-property amount. Galaxy offers use **MOP**; enriched wallet figures use indices/%/`equiv.` bands. Keep these two number styles visually distinct.

**Illustrative numbers in this spec are placeholders.** Every concrete figure written below (24%, index 176, "9k", 210, etc.) is illustrative only. The **seeded data layer (§7) is the single source of truth** — the agent must drive all on-screen numbers from generated data and must **not** hardcode the example figures from this document. This resolves any apparent inconsistencies between sections.

---

## 4. Users & demo narrative

**Primary audience:** Galaxy marketing / CRM / loyalty leadership + analytics. Secondary: their commercial/IT stakeholders evaluating the data partnership.

**The 5-minute demo arc the UI must support:**
1. **Land** on a cinematic Galaxy-branded overview → "here is your guest base and your *total* wallet, not just the slice you see today."
2. **Reveal the gap** → share-of-wallet by category shows how much guest spend Galaxy is *not* capturing (leakage).
3. **Zoom to a segment** → pick a high-value segment, see its CDE propensities and category indices.
4. **Find the money** → cross-property leakage view quantifies opportunity cost (the "cash spent at other hotels" story).
5. **Act** → next-best-action recommends concrete Galaxy offers (dining rebate, suite upgrade, Promenade luxury privilege, Arena tickets, Galaxy Rewards points, ICBC co-brand acquisition) to recapture spend. Optionally push an audience to "activation."

---

## 5. Information architecture (screens / routes)

Single app, left vertical nav (Galaxy-style), 6 primary views + 1 stretch:

1. `/` **Constellation Overview** — executive hero KPIs (indexed), portfolio pulse, category wallet snapshot, top opportunities.
2. `/wallet` **Share of Wallet** — Galaxy vs. market capture by category (Hospitality, F&B, Entertainment, Retail/Luxury) with leakage callouts.
3. `/segments` **Guest Segments (Customer 360)** — segment explorer; per-segment CDE metric panel + propensity scores + recommended plays.
4. `/leakage` **Cross-Property Leakage** — the hero opportunity-cost view; where guests spend off-property; win-back targets.
5. `/propensity` **Propensity & Audience Builder** — filter guests by propensity/index thresholds to build a target audience; live audience size + estimated upside (indexed).
6. `/activation` **Next-Best-Action** — per-segment/audience recommended offers mapped to real Galaxy levers; "push to campaign" mock.
7. *(stretch)* `/marketscan` **Market Scan** — social/PR/competitor intelligence board (the "analyst spends hours daily" use case).

Add a top-right **"Quarter: Q-current ▾"** selector and a **"7 active CDE metrics ▾"** chip to reinforce the data-product framing.

---

## 6. Screen-by-screen spec

> For every screen: dark luxury canvas, gold accents, generous spacing, large elegant serif section titles, restrained motion (fade/slide on mount). Every CDE-sourced figure carries a small **"CDE"** tag chip and obeys §3. Use Traditional-Chinese secondary labels on key headers (e.g., "客戶錢包洞察 · Guest Wallet Intelligence") for local resonance.

### 6.1 `/` Constellation Overview
**Goal:** instant "wow" + the thesis in one screen.
- **Hero band:** full-bleed dark gradient with subtle gold particle/constellation motif; title *"Galaxy Constellation"*, subtitle *"Guest Wallet Intelligence · Enriched by Mastercard CDE"*, co-brand lockup (Galaxy primary / "Powered by Mastercard CDE" / "Built by Deloitte" small).
- **4 hero KPI cards (all indexed/%):**
  - *Matched guest base* (e.g., "Matched coverage 63% of active members" — methodology-honest).
  - *Galaxy wallet capture* (e.g., "Hospitality share of wallet: 24%" with sparkline).
  - *Estimated wallet headroom* — the leakage index (big gold number, e.g., "Opportunity Index 176").
  - *Top-tier rewards propensity* (avg propensity for the base).
- **Category wallet snapshot:** horizontal stacked bars per category showing *Galaxy captured %* vs *market (leakage) %*. Four categories: Hospitality, F&B, Entertainment, Retail/Luxury.
- **"Top 3 opportunities this quarter"** list cards, each linking to `/leakage` or `/segments` (e.g., "High-roller segment: luxury-retail leakage index 210 → Promenade win-back").
- **Methodology footer** (the §3 badge).

### 6.2 `/wallet` Share of Wallet
**Goal:** show the gap between what Galaxy captures and the guest's total category wallet.
- **Category toggle** (Hospitality / F&B / Entertainment / Retail-Luxury / All).
- **Wallet-capture gauge** per category: Galaxy share % vs market — radial or horizontal "fuel gauge" with the un-captured portion highlighted in a warm "leakage" tone.
- **Share of Wallet vs Share of Visits** scatter (CDE metrics): plot segments by SoW (x) and SoV (y) → quadrants ("loyal & frequent", "loyal but infrequent", "tried us, spends elsewhere", "at risk"). This directly uses two of the 7 CDE metrics.
- **F&B drill:** when F&B selected, split into **bars/clubs** vs **full-service restaurants** (allowed granularity only).
- **Retail drill:** when Retail selected, expose **Luxury** sub-category (jewellery/watches) index.
- **Channel mix** (CDE Channel Share / Channel Visits): online vs physical donut per category.
- Insight caption auto-generated per category, e.g.: *"Galaxy captures ~22% of this base's full-service dining wallet; ~78% leaks to off-property venues — a Share-of-Visits gap of N index points."*

### 6.3 `/segments` Guest Segments (Customer 360)
**Goal:** make the enrichment tangible at segment level.
- **Segment rail** (cards) — see §8 for the 6 segments. Each card: name, size band, signature trait, mini radar.
- **Selected-segment detail:**
  - **CDE metric panel** — the 7 active metrics as indexed tiles (Share of Wallet, Share of Visits, Avg Transaction #, Avg Transaction Size, Avg Industry Spend, Channel Share, Channel Visits #), each vs market base 100.
  - **Propensity panel** — gauges for *High Spender in Luxury Hotels*, *Top-Tier Rewards Spender*, *Co-Brand Look-Alike* (0–1).
  - **Category spend radar** — Hospitality / F&B / Entertainment / Retail-Luxury / Gaming(first-party) / Cross-property-cash, indexed vs market.
  - **"Why this matters" + recommended plays** → 2–3 next-best-actions (links to `/activation`).
- A subtle table beneath mirroring the CDE "append-to-CRM" slide: columns = Customer ID (masked), Category Share, Spend-with-competitors (indexed/banded), Luxury-retail index, Propensity score — rows shown as **banded/indexed**, never absolute. This visually echoes the Mastercard "appended back to your CRM file" table and is a strong credibility cue.

### 6.4 `/leakage` Cross-Property Leakage  ★ hero screen
**Goal:** quantify opportunity cost — the single most persuasive view.
- **Headline opportunity index** (big): total modelled off-property/cross-property wallet for the selected base, expressed as an index and a banded range (never absolute).
- **Leakage flow / Sankey** (or grouped bars if Sankey is heavy): guest wallet → split into *Captured by Galaxy* vs *Leaked* across categories; leaked branch breaks into *Competitor hospitality (cross-property cash)*, *Off-property luxury retail*, *Off-property F&B*, *Off-property entertainment*.
- **The narrative card** (reproduce the client's own example): *"A guest stays with Galaxy but spends an estimated 9k-equivalent monthly at other hotels in cash. That is opportunity cost Galaxy can recapture."* Render the 9k as a **band**, with an explicit "modelled, indexed" tag.
- **Win-back target table:** segments ranked by leakage index, with the dominant leakage category and a one-click "Build audience" → `/propensity`.
- **Cross-property cash callout:** a dedicated tile for "cross-site cash spend" since the client explicitly values it.

### 6.5 `/propensity` Propensity & Audience Builder
**Goal:** turn insight into a targetable audience.
- **Filter panel:** sliders/thresholds on propensities (Luxury-hotel spender ≥ x, Top-tier rewards ≥ x, Co-brand look-alike ≥ x) + category leakage index ≥ x + segment multiselect.
- **Live audience size** (count shown as a **band**, e.g., "~8k–12k matched guests") + **estimated recapturable wallet** (index + band).
- **Audience composition** mini-charts (segment mix, dominant leakage category, channel preference).
- **"Save audience"** → name it, it appears in `/activation`.

### 6.6 `/activation` Next-Best-Action
**Goal:** prove it ends in action, mapped to *real* Galaxy levers.
- For each saved audience / top segment, show **recommended offers** drawn from Galaxy's actual toolkit:
  - Galaxy Rewards points multiplier; ICBC Galaxy Macau co-brand card acquisition (for high co-brand look-alike); up to 20% off / spending rewards; Galaxy Promenade luxury privilege (for luxury leakers); dining rebate (e.g., "MOP 200 rebate on MOP 500 spend" — real offer terms, shown in MOP per §3 carve-out) for F&B leakers; Galaxy Arena / concert presale (entertainment-propensity); suite upgrade for high-roller hospitality leakers; Skytop / Grand Resort Deck family bundle for family segment.
- Each recommendation card: rationale (which leakage/propensity drove it), target audience size (band), projected recapture (index), suggested channel (online/physical per Channel Share).
- **"Push to campaign"** button → mock success toast ("Audience exported to Galaxy Rewards CRM / activation platform").

### 6.7 `/marketscan` (stretch) Market Scan
**Goal:** the secondary use case the client raised — replace an analyst's daily manual effort combining social + PR + competitor data.
- Tiles: competitor event calendar (e.g., rival resort concerts), social sentiment trend, PR/news feed (mock), share-of-voice vs competitors, "events driving footfall" board.
- Clearly mock/synthetic; label as "illustrative market-scan companion."

---

## 7. Data model & synthetic data generation

No backend. Generate deterministic synthetic data at build/seed time into `/src/data/*.ts` (or a `generate.ts` script run once). Seed the RNG so the demo is stable across reloads.

### 7.1 Entities
```ts
// Market average is the index base = 100 everywhere.
type CoreCategory = 'hospitality' | 'fnb' | 'entertainment' | 'retailLuxury';
type CategoryKey   = CoreCategory | 'gaming' | 'crossPropertyCash';

interface CategoryWallet {
  capturedSharePct: number;    // Share of Wallet captured by Galaxy for this category (0–100)
  leakagePct: number;          // INVARIANT: capturedSharePct + leakagePct === 100
  totalWalletIndex: number;    // size of the guest's TOTAL category wallet vs market = 100
  sub?: Record<string, number>;// allowed splits only — fnb:{bars,fullService}; retailLuxury:{luxury,other}
}

interface Segment {
  id: string;
  name: string;                // see §8
  nameZh: string;              // Traditional Chinese
  colorToken: string;          // palette key (e.g. 'gold','positive',...)
  sizeBand: string;            // guest-count band, e.g. "12–18k" (band, never exact)
  signatureTrait: string;

  // ── The 7 ACTIVE CDE METRICS (segment headline). %/0–1 where noted, else index base 100 ──
  metrics: {
    shareOfWallet: number;        // % (0–100) — DERIVE from categories.hospitality.capturedSharePct (don't double-source)
    shareOfVisits: number;        // % (0–100)
    avgTxnCountIndex: number;     // index
    avgTxnSizeIndex: number;      // index
    avgIndustrySpendIndex: number;// index
    channelShareOnlinePct: number;// %
    channelVisitsIndex: number;   // index
  };

  // ── MODELS & PROPENSITIES (appended beyond the 7) — 0–1 ──
  propensities: { luxuryHotelSpender: number; topTierRewards: number; coBrandLookAlike: number; };

  // ── PER-CATEGORY wallet — drives the wallet bars, leakage view, opportunity index ──
  categories: Record<CoreCategory, CategoryWallet>;

  // ── Indicators that are NOT captured/leaked categories ──
  gamingContextIndex?: number;    // first-party only, indexed, OPTIONAL & de-emphasised (see note below)
  crossPropertyCashIndex: number; // leakage INDICATOR (index) — the "cash at other hotels" story
  crossPropertyCashBand: string;  // e.g. "8–12k equiv./mo" (modelled, unit-light)

  opportunityIndex: number;       // composite leakage — formula below (do NOT hardcode)
}
```

**Invariants & derivations (enforce in the generator):**
- For every core category: `capturedSharePct + leakagePct === 100`.
- `metrics.shareOfWallet === categories.hospitality.capturedSharePct` (derive; never store twice).
- The Overview/Wallet stacked bars are `capturedSharePct` (gold) + `leakagePct` (terracotta) = 100.
- `opportunityIndex` is computed, not authored:
  ```ts
  const W = { hospitality: 0.35, retailLuxury: 0.30, fnb: 0.25, entertainment: 0.10 };
  const raw = CORE.reduce((s,c) => s + (cat[c].leakagePct/100) * cat[c].totalWalletIndex * W[c], 0);
  // index across segments so the cross-segment mean ≈ 100:
  opportunityIndex = Math.round(raw / meanRawAcrossSegments * 100);
  ```
  This makes headline numbers like "176" / "210" fall out of the data and stay consistent across screens.

### 7.2 `gaming` sensitivity note (important)
Gaming spend is regulated and sensitive in Macau, and is **not** what CDE addresses (CDE is card spend *outside* your walls). Treat `gamingContextIndex` as an **optional, de-emphasised first-party context tile only** — never a leakage category, never a targeting basis, labelled "first-party, indexed". The wallet/leakage story should stand entirely on **hospitality, F&B, entertainment, retail-luxury and cross-property cash**. If in doubt, omit gaming from the visible UI; keep the field optional.

### 7.3 Worked example (one segment — generator should produce data like this)
```ts
{
  id: 'diamond-high-rollers', name: 'Diamond High-Rollers', nameZh: '鑽石貴賓',
  colorToken: 'gold', sizeBand: '4–7k', signatureTrait: 'Ultra-luxury stays; luxury-retail wallet leaks off-property',
  metrics: { shareOfWallet: 28, shareOfVisits: 41, avgTxnCountIndex: 132,
             avgTxnSizeIndex: 187, avgIndustrySpendIndex: 168, channelShareOnlinePct: 38, channelVisitsIndex: 121 },
  propensities: { luxuryHotelSpender: 0.91, topTierRewards: 0.88, coBrandLookAlike: 0.93 },
  categories: {
    hospitality:  { capturedSharePct: 28, leakagePct: 72, totalWalletIndex: 190 },
    fnb:          { capturedSharePct: 34, leakagePct: 66, totalWalletIndex: 150, sub:{ bars:120, fullService:170 } },
    entertainment:{ capturedSharePct: 22, leakagePct: 78, totalWalletIndex: 130 },
    retailLuxury: { capturedSharePct: 12, leakagePct: 88, totalWalletIndex: 215, sub:{ luxury:230, other:120 } },
  },
  crossPropertyCashIndex: 210, crossPropertyCashBand: '9–13k equiv./mo',
  gamingContextIndex: 175, // optional; de-emphasise
  opportunityIndex: /* computed by formula */ 176,
}
```

### 7.4 Generation mechanics
- **Deterministic & seeded.** Use a tiny seeded PRNG (e.g., mulberry32) so data is identical on every load. Generate **at module import** and export typed objects — **no separate build step, no JSON files to regenerate**. (Committing a static generated JSON is an acceptable alternative; pick one and stay consistent.)
- Produce **6 segments × 4 trailing quarters**; quarter-over-quarter deltas small (±a few points) so the quarter selector animates believable movement.
- Keep segments internally consistent (high-roller → high `avgTxnSizeIndex`, high `retailLuxury.leakagePct`, high `coBrandLookAlike`, etc.).
- `methodology` object: `{ matchedCoveragePct: 63, basis: 'demi-decile average', refresh: 'quarterly', activeMetricCount: 7 }`.
- **CRM-style rows** (for §6.3 table): ~8–12 rows, masked IDs (`MEM-••••3421`), values as %/index/band only.

### 7.5 `formatEnriched()` guardrail
```ts
// Refuses absolute customer-level money for CDE-sourced fields. Only %, index, or band.
// (Galaxy offer mechanics in MOP are a separate formatter — see §3 carve-out.)
function formatEnriched(value: number | string, kind: 'pct' | 'index' | 'band'): string { /* ... */ }
```
Use it everywhere a CDE figure renders.

---

## 8. Galaxy guest segments (synthetic but plausible)

Create 6 segments (give each EN + ZH name, a colour from the palette, and consistent metrics):

1. **Diamond High-Rollers** · 鑽石貴賓 — ultra-high luxury-hotel & gaming spend; very high luxury-retail leakage off-property; top co-brand look-alike. *Play:* Promenade luxury privilege, suite upgrade, dedicated host.
2. **Cosmopolitan Connoisseurs** · 都會鑑賞家 — affluent couples; high F&B (full-service) + luxury retail; strong online channel; dining visits leak to off-property fine dining. *Play:* chef's-table privilege, dining rebate, Rewards multiplier.
3. **GBA Cross-Border Explorers** · 大灣區跨境客 — Greater Bay Area day-trippers/short-stay; high cross-property cash leakage; entertainment-curious. *Play:* ICBC co-brand acquisition, Arena presale, cross-border package.
4. **Family Leisure Seekers** · 親子度假客 — Grand Resort Deck / Skytop families; mid hospitality, low gaming; entertainment + F&B casual. *Play:* family bundle, theme-park/Deck add-ons, casual-dining rebate.
5. **MICE & Business Guests** · 商務會展客 — GICC-driven; weekday, channel = physical + corporate; F&B full-service, low entertainment. *Play:* MICE loyalty, business-dining privilege, weekday upgrade.
6. **Aspiring Mass-Affluent** · 新晉中產客 — rising spenders, high top-tier-rewards *propensity* but currently low capture; high leakage everywhere = biggest headroom. *Play:* Rewards tier accelerator, targeted first-purchase offers.

---

## 9. Brand & UI design system (mirror galaxymacau.com)

### 9.1 Palette (Tailwind tokens)
```js
// tailwind.config — extend.colors
galaxy: {
  ink:      '#0B0B0E',   // near-black canvas
  charcoal: '#15151B',   // panel
  slate:    '#1F1F27',   // raised panel / card
  border:   '#2C2C36',
  gold:     '#C9A45C',   // primary champagne gold (Galaxy "golden allure")
  goldLite: '#E4C988',
  goldDeep: '#A8823E',
  cream:    '#F4EBD9',   // light text on dark
  muted:    '#9A9486',   // secondary text
  // semantic for analytics
  capture:  '#C9A45C',   // captured-by-Galaxy (gold)
  leak:     '#B5543F',   // leakage (warm terracotta, not alarming red)
  market:   '#4A4A57',   // market baseline neutral
  positive: '#6FA98C',
}
```
Default to **dark theme** everywhere. Gold is for emphasis/accent and key numbers, not large fills. Body text uses `cream`/`muted` for legibility; reserve `gold` for accents, overlines and large hero numbers (gold-on-ink fails contrast at small sizes).

**Tailwind v4 vs v3 — pick one explicitly (this trips agents up):**
- Current `create-next-app` scaffolds **Tailwind v4**, which is **CSS-first**: there is *no* `tailwind.config.ts` by default. Define tokens in `globals.css` with `@import "tailwindcss";` then an `@theme { --color-galaxy-ink: #0B0B0E; --color-galaxy-gold: #C9A45C; ... }` block, and use them as `bg-galaxy-ink text-galaxy-gold`. The JS object above is the **source of truth for the values** — translate each into a `--color-galaxy-*` custom property.
- If the agent prefers the classic JS config, **pin Tailwind v3** (`npm i -D tailwindcss@3 postcss autoprefixer && npx tailwindcss init -p`) and use the `extend.colors.galaxy` object verbatim.
- Do **not** mix the two. Verify a gold element actually renders gold before building screens — a silent token miss here wastes the most time.

### 9.2 Typography
- **Display / headings:** an elegant high-contrast serif — use `"Cormorant Garamond"` or `"Playfair Display"` (Google Fonts) for hero/section titles to evoke luxury.
- **Body / UI / data:** a clean grotesk — `"Inter"` (or `"Manrope"`) for legibility in charts and tables.
- **Traditional Chinese:** `"Noto Serif TC"` for ZH headings, `"Noto Sans TC"` for ZH body.
- Large, airy headings; letter-spacing on overline labels (uppercase, gold, tracked).
- **Font loading (keep it light):** load Latin display + body via `next/font/google` (Cormorant Garamond + Inter, only the 2–3 weights used). Noto Serif/Sans TC are **large** — load TC only if used, with `display: 'swap'` and a minimal weight set, or fall back to system TC (`"PingFang TC","Microsoft JhengHei",sans-serif`) to keep the Vercel bundle lean. TC is for a few headers/labels, not body.

### 9.3 Components & feel
- Rounded-2xl panels on `galaxy.charcoal/slate` with hairline `galaxy.border`, soft shadow, subtle inner top highlight.
- **Overline labels:** uppercase, 11–12px, tracked, `galaxy.gold`.
- Hero uses a faint constellation/particle SVG or CSS gradient mesh (gold on ink). Keep motion subtle (Framer Motion fade/slide, 300–500ms).
- Charts (Recharts): dark grid, gold/terracotta/neutral series per palette, no gaudy colours. Tooltips on `galaxy.slate` with gold accent.
- **CDE chip:** small pill, gold outline, label "CDE", tooltip "Mastercard Card Data Enrichment — modelled estimate".
- **Co-brand lockup** in header/footer: "GALAXY MACAU" wordmark (text-based, gold) · divider · "Powered by Mastercard CDE" · footer "Built by Deloitte Digital Foundry". (Use text/SVG placeholders — do **not** hotlink or embed copyrighted logo image files; recreate wordmarks in styled text.)
- Persistent **methodology footer** (§3 badge) on every screen.

### 9.4 Layout
- Left vertical nav (icon + label), collapsible; gold active indicator.
- Top bar: quarter selector, "7 active CDE metrics" chip, matched-coverage indicator.
- Content max-width ~1400px, generous padding, 12-col grid.
- Fully responsive but **optimise for a laptop/projector demo** (1440×900). Mobile acceptable, not the priority.

---

## 10. Tech stack & architecture

- **Next.js (current 14 or 15) App Router + TypeScript.** Either major is fine; don't fight the scaffolder's default.
- **Tailwind CSS** — see the v4-vs-v3 note in §9.1. Decide at M1.
- **Recharts** for charts; **Framer Motion** for motion; **lucide-react** for icons.
- **No backend / no database.** All data synthetic in `src/data`. Interactive views are client components.
- **State:** lightweight React context **or** Zustand for selected quarter / segment / saved audiences. In App Router, the provider is a **client component** (`'use client'`) that wraps `{children}` inside the **server** `layout.tsx` — don't put hooks directly in the layout.
- **Suggested pins (adjust if scaffolder differs):** `recharts@^2.12`, `framer-motion@^11`, `lucide-react@^0.4xx`, `zustand@^4` (if used).
- **Deploy:** Vercel. `next build` must pass with **no** server env vars. Each milestone should end on a clean `npm run build`.

**Chart realities (Recharts has no native gauge/Sankey — save the agent time):**
- "Wallet-capture gauge" → build with `RadialBarChart` (half-circle) or a styled stacked `BarChart`/SVG. Don't search for a `<Gauge>`.
- "Leakage Sankey" → Recharts' `Sankey` is fiddly and hard to theme. **Default to a custom flow built from a horizontal stacked bar + connector divs, or grouped bars.** Only attempt true Sankey if M6 is otherwise done.
- "Propensity gauge" → half-`RadialBarChart` or a simple SVG arc.
- Lazy-load heavier charts (`next/dynamic`, `{ ssr: false }`) to keep the demo snappy.

---

## 11. Repository structure

```
galaxy-constellation/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx             # server shell: fonts, <Providers>, Nav, TopBar, methodology footer
│  │  ├─ providers.tsx          # 'use client' — context/Zustand provider wrapping {children}
│  │  ├─ page.tsx               # / Overview
│  │  ├─ wallet/page.tsx
│  │  ├─ segments/page.tsx
│  │  ├─ leakage/page.tsx
│  │  ├─ propensity/page.tsx
│  │  ├─ activation/page.tsx
│  │  ├─ marketscan/page.tsx    # stretch
│  │  └─ globals.css            # Tailwind import + @theme tokens (if v4)
│  ├─ components/
│  │  ├─ shell/   (Nav, TopBar, Footer, CoBrandLockup)
│  │  ├─ ui/      (Panel, KpiCard, Overline, CdeChip, BandValue, IndexValue, GoldNumber, MethodologyNote)
│  │  ├─ charts/  (WalletGauge, SowSovScatter, CategoryStackedBar, LeakageFlow, SpendRadar, ChannelDonut, PropensityGauge)
│  │  └─ panels/  (SegmentCard, CdeMetricPanel, CrmAppendTable, NbaCard, AudienceBuilder)
│  ├─ data/   (segments.ts, categories.ts, methodology.ts, quarters.ts, generate.ts)
│  ├─ lib/    (format.ts → formatEnriched(); rng.ts → mulberry32; palette.ts)
│  └─ store/  (context or zustand)
├─ tailwind.config.ts           # ONLY if you pinned Tailwind v3 (see §9.1); omit for v4
├─ package.json
└─ README.md                    # run/deploy + demo script
```
Set the import alias `@/*` → `src/*` (default when you choose the `src/` dir in create-next-app).

---

## 12. Build instructions for the coding agent (milestones)

Build in this order; keep it runnable at each milestone.

**M1 — Scaffold & shell.** `create-next-app` (TS, Tailwind, App Router). Install recharts, framer-motion, lucide-react, (zustand). Implement palette tokens, fonts, layout shell (nav + top bar + methodology footer + co-brand lockup). Placeholder routes.

**M2 — Data layer.** Implement `generate.ts` (seeded), produce 6 segments × 4 quarters, methodology object, CRM-style rows. Implement `format.ts` with `formatEnriched()` guardrail (§3). Export typed data.

**M3 — Overview (`/`).** Hero band + 4 KPI cards + category wallet snapshot + top-3 opportunities + methodology footer. This is the "wow" screen — invest in polish.

**M4 — Share of Wallet (`/wallet`).** Category toggle, wallet gauges, SoW×SoV scatter with quadrants, F&B + Retail drills, channel mix, auto-captions.

**M5 — Segments (`/segments`).** Segment rail, CDE metric panel (7 indexed tiles), propensity gauges, spend radar, CRM-append table, recommended plays.

**M6 — Leakage (`/leakage`).** Opportunity index headline, leakage flow (Sankey or grouped bars), the narrative "9k-equivalent" card (banded), win-back table, cross-property-cash tile.

**M7 — Propensity (`/propensity`) + Activation (`/activation`).** Audience builder with live banded size + recapture index; saved audiences; NBA cards mapped to real Galaxy levers; "push to campaign" toast.

**M8 — Polish & (stretch) Market Scan.** Motion, empty/loading states, responsive checks at 1440×900, README with demo script. Optional `/marketscan`.

**Acceptance checks:**
- No absolute per-customer money value appears anywhere (grep the rendered output; everything money-related is %, index, or band).
- Every CDE figure carries a CDE chip; methodology footer present on all screens.
- 7-metric cap and quarterly refresh visible in UI.
- Galaxy brand reads as luxury/dark/gold and is recognisably Galaxy-adjacent without using copyrighted logo image assets (text/SVG wordmarks only).
- `next build` passes; deploys to Vercel with no backend.

---

## 13. Demo script (put in README for the Galaxy meeting)

1. **Overview:** "Today you see what guests spend *inside* Galaxy. CDE lets you see their *total* wallet. Here's your matched base and your real share of it."
2. **Wallet:** "In full-service dining you capture ~22% — the other ~78% is spent off-property. That gap is addressable."
3. **Segments:** "Take Diamond High-Rollers — high luxury-hotel propensity, but their luxury-retail spend is leaking. CDE appended these metrics straight onto your CRM IDs."
4. **Leakage:** "This is the headline: this segment leaves an estimated [band] of monthly wallet at competitors — including cross-property cash at other hotels. That's the opportunity cost."
5. **Propensity → Activation:** "Filter to high look-alike + high leakage, build the audience, and fire the right lever — Promenade privilege, co-brand card, Rewards multiplier — to pull it back. One click to your activation platform."
6. Close on compliance: "Everything here respects Mastercard's data rules — indices, ranges, percentages, demi-decile basis, matched-coverage transparency. Nothing exposes an individual's exact off-property spend."

---

## 14. Explicit out-of-scope / guardrails for the agent
- No real Galaxy or Mastercard logo image files; recreate wordmarks as styled text/SVG.
- No real customer data; all synthetic and seeded.
- Do not split F&B below bars/clubs vs full-service; do not split retail below the luxury sub-category; do not show cuisine/nationality-level F&B (mirrors the real CDE granularity limits discussed with the client).
- Never render an absolute customer-level currency figure for CDE-sourced data.

---

## 15. Glossary
- **CDE** — Card Data Enrichment (Mastercard): appends category spend metrics + propensity scores to Customer IDs from anonymised transaction data.
- **Share of Wallet (SoW)** — % of a guest's total category spend captured by Galaxy.
- **Share of Visits (SoV)** — % of a guest's category visits at Galaxy.
- **Demi-decile** — the banded peer group whose average represents a guest for non-propensity metrics.
- **Leakage / Opportunity cost** — the portion of guest wallet spent off-property (incl. cross-property cash at other hotels).
- **Propensity** — 0–1 likelihood score (e.g., luxury-hotel spender, top-tier rewards, co-brand look-alike).
- **Index (base 100)** — value relative to market average = 100, used to avoid exposing absolute figures.

---

*End of build spec. Feed this whole file to Claude Code / Codex and build M1→M8.*
