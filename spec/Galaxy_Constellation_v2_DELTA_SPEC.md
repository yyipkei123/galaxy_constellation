# DELTA SPEC v2 — "Wow" pass + **Customer 360 & Lead Prioritization**

**For:** Codex, extending the **live** Galaxy Constellation app (https://galaxy-constellation.vercel.app/).
**Two goals:**
1. **Elevate the visuals** so the Overview lands an immediate "wow" in the room (today it's clean but flat).
2. **Add a Customer 360 + Lead Board** that shows *Galaxy first-party data **+** Mastercard CDE* fused into one guest view → personalized recommendations and a ranked "**who do I pitch, and what do I say**" list.

> This is a delta on the existing codebase. Reuse the shell, palette, fonts, `formatEnriched()`, the CDE chip, the methodology footer, the seeded generator, and existing UI primitives. Don't re-scaffold. Keep it backend-free and Vercel-clean.

---

## PART 1 — Visual elevation (make the Overview WOW)

The current build is competent but reads as "standard dashboard": flat cards, plain bars, little motion, no signature moment. Fixes below, in priority order. Respect `@media (prefers-reduced-motion)` everywhere and pause offscreen animation.

### 1.1 Signature **constellation hero** (the single biggest lever — and it's literally your brand)
Behind the Overview hero, render an animated **constellation**: gold stars drifting on the near-black canvas, faint lines linking nearby stars into shifting constellations, subtle parallax on mouse move. This turns the brand name into a visual.
- Implementation: a lightweight `<canvas>` particle field (hand-rolled or `tsParticles` "links" preset), `next/dynamic` with `{ ssr:false }`, < ~60kb, capped DPR, `requestAnimationFrame` paused when tab/section not visible. Gold (#C9A45C) stars at low opacity over the existing `galaxy.ink`.
- Layer the existing hero copy on top with **kinetic typography**: the title and the headline number animate in (fade + rise, staggered).
- This is the screen people screenshot. Invest here.

### 1.2 **Bento-grid** Overview (hierarchy by size)
Restructure the Overview from uniform cards into a **bento grid** (CSS Grid, consistent gutters, `rounded-2xl`):
- **One dominant hero tile** (2×2 / 3×2): the headline **wallet-headroom** number as a large gold **count-up**, with a one-line "what it means."
- **Tier-2 tiles** (wider, shorter): category wallet snapshot mini, top ranked finding.
- **Tier-3 tiles** (small): the supporting KPIs (matched base, capture %, top-tier propensity).
- Max **1–2 hero tiles per section** — size should signal importance before the user reads a label. Don't make all tiles equal (that's just rounded cards).

### 1.3 **Glass depth** on panels
Upgrade panels to subtle "liquid glass": slight translucency over the dark canvas, `backdrop-filter: blur()`, a hairline top highlight, and soft layered shadows; a faint gold outer glow on the hero/active tile only. Keep it purposeful and performance-aware (it's depth/hierarchy, not decoration). Never pure black behind glass — keep the existing charcoal/slate.

### 1.4 **Motion system**
- **Count-ups** on all headline indices/% (animate on mount + on scroll into view).
- **Staggered reveals** for grids/cards (Framer Motion, 60–80ms stagger).
- **Animated fills** for bars/gauges (grow from 0).
- **Page transitions** between routes (soft fade/slide) and **hover lifts** on interactive tiles.
- A gentle **"live" pulse** on the data-refresh / quarter chip so the screen feels alive on a projector.
- All gated behind `prefers-reduced-motion`.

### 1.5 One **signature data-viz** moment (brand metaphor)
Replace at least one stock chart with a memorable, on-brand visual. Best option: a **"wallet constellation"** — segments (or guests) rendered as stars, **size = value**, **glow/colour = opportunity**, **distance from centre = leakage**; the top targets cluster as the brightest stars. Reuse this metaphor on the Lead Board (Part 2). This is what separates "a dashboard" from "the Galaxy Constellation."

### 1.6 Micro-polish
Bigger display-serif scale for hero numbers; gold gradient on key figures; refined spacing rhythm; consistent hover/active/empty states; lucide icons on tiles; a subtle gradient-mesh accent in the hero corner. Tighten the bilingual (EN/繁中) header treatment.

---

## PART 2 — Customer 360 & Lead Prioritization (the new pitch tool)

**Framing (use this exact narrative — it ties straight back to the original Mastercard CDE slide "metrics appended back to your CRM file for each Customer ID"):**
> *"Galaxy already knows what a guest does inside Galaxy. Mastercard CDE appends what they do **outside**. Fuse them per guest and the platform tells you **who to pitch next, why, and exactly what to offer** — in their language."*

This is the casino **player-development / host** use case: a ranked book of high-value guests with a recommended play for each. (Industry context worth saying in the room: most operators collect rich guest data but **under 40% use it effectively**, and **~71% of guests now expect personalised interactions** — this screen closes that gap.)

### 2.1 New routes (add to nav, under the Wallet/retention lens)
- `/guests` — **Priority Lead Board** ("who to pitch next").
- `/guests/[id]` — **Customer 360** profile (the fused view + recommendations + pitch).
- Cross-link: from `/segments` ("see guests in this segment") and from Lead Board rows.

### 2.2 `/guests` — Priority Lead Board
- **Ranked list/cards** of top priority guests (synthetic, **masked IDs** like `MEM-••••3421`), each showing: persona/segment chip, **Galaxy tier**, **Lead Score** (0–100), **projected upside** (band/index), **primary opportunity** (category), a **one-line recommended pitch**, and a short **"why" driver list** (the factors behind the score — transparency matters).
- **Filters:** segment, tier, propensity threshold, opportunity/leakage threshold, primary category.
- **Sort:** Lead Score (default) / upside / propensity.
- **Signature viz:** a **Priority Quadrant** — plot guests on **value (x)** × **propensity (y)**; bubble size = upside; the top-right "**pitch now**" quadrant glows gold. (Reuse the constellation metaphor.)
- **Actions (mock):** "Assign to host", "Add to audience" → toast.
- **Compliance:** first-party fields (tier, recency, frequency) are Galaxy-owned and may be banded; CDE-derived fields (off-property wallet, propensities, leakage) are **indices / % / 0–1 / bands** only; masked IDs; methodology footer.

### 2.3 `/guests/[id]` — Customer 360 (the fusion view)
- **Header:** masked ID, persona, Galaxy tier badge, **Lead Score gauge**, "matched via CDE" chip.
- **★ Two-source fusion panel** (the hero of this screen — make the data merge *visual*):
  - **LEFT — "What Galaxy sees" (first-party):** stays (nights, which properties — e.g., Ritz-Carlton, Banyan Tree, Capella), dining & entertainment visits, Galaxy Rewards tier/points, recency/frequency. Banded monetary OK (Galaxy owns this).
  - **RIGHT — "What Mastercard CDE adds":** off-property category wallet (indexed), share-of-wallet & leakage per category, propensities (luxury-hotel spender, top-tier rewards, co-brand look-alike), cross-property cash band, channel mix. Each carries the CDE chip.
  - **CENTRE — "Fused opportunity":** the headroom, the single biggest leak, and the Lead Score — visually "merging" left+right into the result (e.g., two streams converging into one highlighted tile).
- **Wallet orbit / radar:** this guest's capture vs total wallet per category (signature radial viz).
- **Personalized recommendations / Next-Best-Action:** 2–4 concrete offers tied to **real Galaxy levers** (Promenade private retail appointment, Capella/Ritz suite upgrade, Galaxy Arena presale, dining privilege, Galaxy Rewards accelerator, ICBC Galaxy co-brand card if high look-alike). Each card: **rationale ("why" — the driver)**, projected uplift (index/band), suggested **channel** (online / physical / host), and a confidence/propensity bar.
- **Suggested pitch script:** a short, presenter-ready blurb a host could actually say, **bilingual EN / 繁中** (e.g., *"This Diamond-tier guest indexes ~2.3× market on luxury retail but captures little with us — invite to a private Promenade appointment paired with a Capella stay."*).
- **Guest journey timeline (optional):** recent touchpoints (stay → dine → event) as a horizontal timeline with a "next best moment" marker.
- **Actions (mock):** "Add to audience", "Assign host".

### 2.4 Data model extension (extend the seeded generator; new file `src/data/guests.ts`)
```ts
type GalaxyTier = 'Privilege'|'Gold'|'Platinum'|'Diamond';

interface NbaRec {
  offer: string;            // tied to a real Galaxy lever
  rationale: string;        // the "why" / driver
  upliftIndex: number;      // projected, indexed
  channel: 'online'|'physical'|'host';
  confidence: number;       // 0–1
}

interface Guest {
  id: string;               // masked, e.g. 'MEM-••••3421'
  segmentId: string;        // ties to an existing segment
  persona: string;
  galaxyTier: GalaxyTier;

  // First-party (Galaxy-owned) — banded/own values OK
  firstParty: {
    lifetimeBand: string;           // 'mid' | 'high' | 'ultra'
    staysL12m: number;
    nightsBand: string;
    properties: string[];           // e.g. ['Ritz-Carlton','Banyan Tree']
    diningVisits: number;
    entertainmentVisits: number;
    recencyDays: number;
    frequencyIndex: number;
    rewardsPoints: number;
    gamingContextIndex?: number;    // OPTIONAL, de-emphasised (see existing gaming note)
  };

  // CDE enrichment — indices / % / 0–1 / band ONLY
  cde: {
    categoryCapturePct: { hospitality:number; fnb:number; entertainment:number; retailLuxury:number };
    categoryLeakagePct:  { hospitality:number; fnb:number; entertainment:number; retailLuxury:number };
    categoryWalletIndex: { hospitality:number; fnb:number; entertainment:number; retailLuxury:number };
    propensities: { luxuryHotelSpender:number; topTierRewards:number; coBrandLookAlike:number };
    crossPropertyCashBand: string;  // e.g. '14–22k equiv./mo'
    channelOnlinePct: number;
  };

  leadScore: number;                // 0–100 composite (computed, see below)
  projectedUpsideBand: string;      // band/index
  primaryOpportunity: 'hospitality'|'fnb'|'entertainment'|'retailLuxury';
  nextBestActions: NbaRec[];
  pitchScript: { en: string; zh: string };
}
```
**Rules:**
- **`leadScore` is computed, not authored**, so the ranking is defensible. Suggested blend (normalise to 0–100):
  ```ts
  leadScore = norm(
    0.30*valueScore(firstParty)            // tier + lifetime + frequency
  + 0.30*opportunityScore(cde)             // leakage% × wallet index across categories
  + 0.25*propensityScore(cde.propensities) // topTierRewards + coBrandLookAlike
  + 0.15*engagementScore(firstParty)       // recency/frequency
  );
  ```
  Tune the seed so a handful of obvious "high-value, high-leakage, high-propensity" guests top the board (great for the demo).
- Generate **~40–60 synthetic guests** across the 6 existing segments, deterministic/seeded, each consistent with its segment's metrics. Invariant: `capturePct + leakagePct = 100` per category.
- `categoryCapturePct.hospitality` etc. should align with the parent segment's averages (with per-guest variation).

### 2.5 New components
- `components/charts/`: `PriorityQuadrant` (value×propensity bubble plot, gold "pitch now" quadrant), `WalletOrbit` (guest radial), `LeadScoreGauge`.
- `components/panels/`: `LeadBoard`, `GuestProfileHeader`, `FusionPanel` (the left/right/centre merge), `NbaCard`, `PitchScriptCard`, `GuestTimeline`.
- `components/ui/`: `TierBadge`, `ScorePill`, `DriverChip`.
- Reuse existing primitives (`Panel`, `Overline`, `IndexValue`, `BandValue`, CDE chip).

### 2.6 Milestones
Keep runnable each step; each ends on a clean `next build`.

- **W1 — Visual elevation.** Constellation hero, bento Overview, glass panels, motion + count-ups, one signature viz. No new data. *(Ship this first — it's the "wow" and it's independent.)*
- **W2 — Guest data layer.** Extend generator with 40–60 guests + computed `leadScore` + NBAs + bilingual pitch scripts.
- **W3 — Lead Board (`/guests`).** Ranked board, filters, Priority Quadrant, mock actions.
- **W4 — Customer 360 (`/guests/[id]`).** Fusion panel, wallet orbit, NBA cards, pitch script, timeline; cross-links from Segments + Lead Board.
- **W5 — Signature viz + polish.** Constellation-metaphor chart, responsive at 1440×900, README demo additions, final build.

### 2.7 Acceptance checks
- Overview reads as a **bento grid with one clear hero**; the **constellation hero animates** and respects reduced-motion; panels have depth; headline numbers **count up**.
- `/guests` ranks guests by **Lead Score**; the **Priority Quadrant** plots value×propensity; each row opens a 360.
- The 360 makes the **two-source fusion explicit** (Galaxy first-party vs CDE add → fused opportunity); NBAs tie to **real Galaxy levers** with a stated "why"; **bilingual pitch script** present.
- **Compliance:** masked IDs; CDE figures are index/%/0–1/band; first-party may be banded; gaming de-emphasised; methodology footer present.
- No backend; NBA/pitch are **templated** (no live LLM/API key); `next build` passes; deploys to Vercel.

### 2.8 Demo-script additions (append to README)
1. **Wow open:** "This is your guest base as a living constellation — every star is a guest, the brightest are your biggest untapped opportunities."
2. **Lead Board:** "The platform tells you *who to pitch* — ranked by value, propensity and untapped wallet. Top-right of the quadrant = call today."
3. **Open a 360:** "Left is what Galaxy already knows. Right is what Mastercard adds. Together: a Diamond-tier guest whose luxury wallet is leaking off-property."
4. **Recommendation + pitch:** "Here's the offer, the projected lift, the channel — and the exact pitch, in their language."
5. **Close the loop:** "From 'who are my guests' to 'who do I call today, and what do I say' — that's Galaxy data plus Mastercard, made actionable."

---

## Out-of-scope / guardrails
- Synthetic guests only; **masked IDs; no real PII**.
- CDE-derived figures stay **index / % / 0–1 / band** — never absolute off-property money. First-party may be banded.
- Gaming stays **de-emphasised** (optional context only), per the existing gaming note.
- Motion/constellation must respect `prefers-reduced-motion` and must not degrade the projector demo (cap DPR, pause offscreen).
- No backend; recommendations and pitch scripts are **templated from data**, not a live LLM. (If wired later, route via a governed layer — Anchor RAG — not a client-side key.)
- Don't restyle existing Lens A screens beyond the bento/glass/motion pass and the new nav entries.

---

*End of v2 delta spec. Suggested order: ship W1 (wow) first, then W2→W5 (Customer 360 & Lead Board).*
