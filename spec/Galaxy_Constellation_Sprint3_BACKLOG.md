# NEXT SPRINT BACKLOG (Sprint 3) — Galaxy Constellation
### From "insight" to "decision + proof + intelligence"

**Context:** The live app (https://galaxy-constellation.vercel.app/) now ships both lenses (Wallet/Retention + Corridors/Acquisition), Customer 360 (`/guests`), the wallet-headroom constellation, brand lockups, and an "Ask CDE AI" entry point. The build is comprehensive and on-brand. This backlog is what to add next to (a) deepen the **WOW**, (b) lead with **Deloitte's GenAI/governance differentiation**, and (c) **close the loop** so it reads as a platform, not a report.

> All epics keep the existing conventions: reuse shell/palette/`formatEnriched()`/CDE chip/methodology footer/seeded generator; backend-free + Vercel-clean; CDE figures stay index/%/0–1/band; gaming de-emphasised; no real PII (masked IDs).

**Recommended sprint cut (if you can't do all):** ship **Epic 1 (Governed Ask CDE AI)** first — it's the flagship and the differentiator — then **Epic 2 (Measurement loop)** and **Epic 3 (What-if simulator)**. Epics 4–6 are fast-follows.

---

## EPIC 1 ★ — "Ask CDE AI" → a **governed conversational analytics + insight agent** (FLAGSHIP)
**Why first:** This is the single biggest "wow" *and* it's your moat. Mastercard's own demo had a "Genie AI" narrative writer; the way to out-position it is **governed + grounded + auditable** — exactly your Anchor RAG / AI-governance IP. It also lands the "ask the data in plain language" expectation that's now standard in 2026 BI.

**What to build:**
- A full-height assistant panel (the entry point already exists) that answers **natural-language questions grounded in the app's own data** (segments, guests, corridors, leakage, propensities). Each answer returns:
  - a **written, grounded answer** (no invented numbers — only values that exist in the dataset),
  - the **relevant chart/component rendered inline** (reuse existing chart components),
  - **2–3 suggested follow-up chips**,
  - a small **"Grounded · Auditable"** badge with a **"show the data behind this"** expander (lists the exact figures/segment rows used).
- **Starter prompt chips:** "Which segment leaks most luxury wallet?", "Who are my top 10 leads to pitch this quarter?", "What's the headroom if we close F&B leakage?", "Which corridor should we prioritise and why?", "Draft the pitch for guest MEM-••••3421".
- **Governance framing (visible):** a one-line "This assistant only answers from the governed CDE semantic layer; figures are traceable, nothing is fabricated" — this is the trust differentiator. (Talking point: ungoverned LLM-to-database approaches collapse on real schemas; grounding + evaluation is the moat — your Anchor framework.)

**Implementation (pick one; default = A, keep it backend-free):**
- **A — Grounded deterministic agent (default, safest for live demo):** intent-match the question to a set of supported "skills" over the in-memory dataset; compose the answer from real values via templates; render the matching chart. Fully client-side, zero key, never hallucinates. Add a typing/streaming effect so it *feels* like an LLM.
- **B — Real LLM via a thin Vercel route (optional, more impressive):** a serverless function with a system prompt **constrained to the dataset** and a function/tool that queries the synthetic data; the model may only return values the tool provides. Requires an API key in Vercel env. If chosen, route through a governed prompt + a post-check that rejects any number not in the dataset. (Decide with Kei — this is the live "Anchor governance" story made real.)

**Acceptance:** answers cite only real dataset values; inline chart matches the question; follow-up chips work; "show data behind this" reveals the exact figures; governance badge present; `next build` clean.

---

## EPIC 2 — Measurement: **"Did it work?"** (Test & Learn loop)
**Why:** Today the app goes opportunity → recommendation → activation, but never **proves impact**. Adding measurement closes the loop and maps directly to Mastercard's **Test & Learn** product — turning the demo from "a report" into "a closed-loop platform."

**What to build (new route `/measurement` under the Wallet lens, or a tab on Activation):**
- For each activated audience/campaign, a **test-vs-control (holdout)** result card:
  - **Incremental lift %** = (test − control) / control, shown as the headline.
  - **Incremental revenue** (indexed/band — not absolute), **incremental ROI**, and a **confidence/significance** indicator.
  - A **lift-over-time** chart (test vs control lines diverging).
  - A small **test-design** strip: holdout %, duration, expected-lift threshold.
- Tie results back to recommendations: e.g., *"Promenade luxury play → +X% incremental luxury capture vs a matched holdout."*
- Honesty note: synthetic, indexed; "models Mastercard Test & Learn methodology — measures causal lift, not attribution."

**Data:** extend the generator with a `campaigns` set (audience, lever, testGroupIndex, controlGroupIndex, liftPct computed, confidence, weeklySeries). Keep lift in a believable 8–30% band.

**Acceptance:** lift = (test−control)/control computed, not authored; diverging time series renders; indexed revenue + iROI + confidence shown; methodology note present.

---

## EPIC 3 — **"What-if" scenario simulator** (decision intelligence)
**Why:** Executives lean in when they can *move the levers themselves*. A slider-driven simulator turns the static opportunity into an interactive planning tool, and reinforces the FDE "we build decision tools, not dashboards" story.

**What to build (new route `/simulate`, or a panel on Overview/Leakage):**
- Sliders: "recapture X% of [category] leakage in [segment(s)]" + "shift channel mix" + "apply [lever]".
- Live outputs (all indexed/band): projected **wallet uplift**, change in **opportunity index**, **# guests** that move into the pitch-now cluster, and the **constellation re-rendering** as values shift (reuse the signature viz — stars brighten/move).
- A "save scenario" → appears as a named scenario; optional compare-two-scenarios.

**Acceptance:** sliders drive recomputed indices live; the constellation/quadrant visibly responds; outputs stay indexed/band; reset works.

---

## EPIC 4 — Close the **cross-lens loop** (Acquire → Convert → Grow)
**Why:** Lens A (retention) and Lens B (acquisition) currently run in parallel. One unifying view that shows the full loop is a powerful closing screen and the literal "one platform, one loop" narrative.

**What to build (new route `/journey`):**
- A left-to-right **funnel/flow**: priority corridor (e.g., Korea) → the **segments** those arrivals become on-property → **wallet captured vs leaked** → **recapture plays**.
- Each stage links to the relevant existing screen (corridor detail → segment → leakage → activation).
- A headline: "Acquire the right guests, then grow their wallet — one connected loop."

**Acceptance:** the four stages render and cross-link; numbers reconcile with the source screens; reads as a single narrative.

---

## EPIC 5 — Content & activation depth (Cadence tie-in) + measurement hook
**Why:** If the acquisition/activation **content generation** is still light, deepening it showcases the Cadence concept and connects creative → campaign → measurement (Epic 2). Also forces the **complement-vs-compete** decision vs Mastercard's content tool.

**What to build:**
- On Acquisition/Activation, a **campaign content** card: multi-language KV/email drafts (**EN / 繁中 / 한국어** for Korea), **A/B variants**, brand-voice + compliance guardrails, version history. (Templated, client-side — no live LLM by default; if wired, route via a governed layer.)
- "Launch campaign" → creates a campaign that then appears in **Measurement** (Epic 2). That linkage is the wow: *brief → audience → creative → launch → proven lift.*

**Acceptance:** multilingual drafts + A/B + versioning render; "launch" produces a measurable campaign in Epic 2.

---

## EPIC 6 — Polish, realism & trust (fast, high-credibility wins)
**Why:** Small things a sharp client will notice; plus a governance page that doubles as a Deloitte differentiation play.

- **Data-realism fix — corridor haul labels.** Currently Korea/Japan/Singapore/Taiwan are tagged "long-haul." From Macau, Taiwan/HK/GBA/SEA are **short-haul** and Korea/Japan are **medium-haul**; a truly long-haul market (Europe/US) isn't in the top 10. Re-tag so the framing is defensible (e.g., short / medium / long), and keep Taiwan's "notable" status as the strongest **medium/long** corridor rather than mislabelling SEA.
- **"How it works / Data governance" page** (`/governance` or a modal): methodology, match-rate/coverage (the ~10–20% panel + 63% matched), demi-decile basis, and a **cross-border data** note (PIPL / HK PDPO / Macau PDPA, role-based access, no PII). This is a trust play for a regulated operator *and* showcases Deloitte governance IP.
- **Confidence/coverage cues** on key figures (a subtle "modelled · coverage 63%" tag), reinforcing the honesty narrative.
- **Presenter "guided tour" mode:** an auto-advancing, narrated walkthrough (or a one-click "executive summary" export to PNG/PDF) for Kei to present hands-free.
- *(stretch)* **Host companion / mobile view** — a phone-optimised "host book": today's priority guests + the recommended pitch, for player-development on the floor (the casino-host use case).

**Acceptance:** haul labels corrected; governance page renders with the cross-border note; presenter mode or export works; mobile host view (if built) is usable at phone widths.

---

## Suggested order
1. **Epic 1** (Governed Ask CDE AI) — flagship, differentiator, biggest wow.
2. **Epic 2** (Measurement) + **Epic 3** (What-if) — close the loop, executive appeal.
3. **Epic 6** quick wins (haul fix + governance page) — credibility, low effort.
4. **Epic 4** (cross-lens loop) and **Epic 5** (content depth) — fast-follows.

*Each epic ends on a clean `next build`; keep everything backend-free, indexed/banded, masked IDs, gaming de-emphasised.*
