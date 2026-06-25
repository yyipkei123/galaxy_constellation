# Galaxy Constellation

Guest Wallet Intelligence dashboard for the Galaxy Macau x Mastercard CDE showcase.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verification

```bash
npm run test
npm run build
npm run test:e2e
npm run verify
```

## Deployment

Deploy to Vercel as a standard Next.js app. The app has no backend, database, or server environment variables.

## Compliance Rules

- CDE-enriched and off-property wallet values render only as percentages, indices, or equivalent bands.
- Customer-level CDE data never renders exact MOP or HKD values.
- Galaxy offer mechanics may show MOP terms only in next-best-action offer cards.
- The footer methodology note appears on every route and states demi-decile average basis, matched coverage, quarterly refresh, and seven active metrics.

## Demo Script

1. Overview: "Today you see what guests spend inside Galaxy. CDE lets you see their total wallet. Here's your matched base and your real share of it."
2. Wallet: "In full-service dining you capture a share of the wallet; the remainder is spent off-property. That gap is addressable."
3. Segments: "Take Diamond High-Rollers: high luxury-hotel propensity, but their luxury-retail spend is leaking. CDE appended these metrics straight onto masked CRM IDs."
4. Leakage: "This is the headline: this segment leaves a modelled monthly wallet band at competitors, including cross-property cash at other hotels. That's the opportunity cost."
5. Propensity to Activation: "Filter to high look-alike and high leakage, build the audience, and fire the right lever: Promenade privilege, co-brand card, Rewards multiplier."
6. Close on compliance: "Everything here respects Mastercard's data rules: indices, ranges, percentages, demi-decile basis, matched-coverage transparency. Nothing exposes an individual's exact off-property spend."

## Lens B Demo Script

1. Flip to Acquisition lens: "Lens A grew the wallet of the guests you have. Lens B finds the next ones."
2. Corridor board: "Your top inbound markets, 2020 vs 2024. Short-haul dominates; Taiwan skews gaming, Singapore skews hospitality, Japan peaks at festivals."
3. Priority tile: "The standout signal is Korea: Merging to the World. We are validating it against post-2020 data, but this is where acquisition should point first."
4. Corridor to persona to content: "Pick Korea, see personas and co-spend themes, then generate the campaign KV in EN, 繁中, and 한국어 using deterministic compliant templates."
5. Close the loop: "Acquire from the right corridor, then grow their wallet on-property. One platform, one loop."

Lens B content generation is a deterministic client-side template. It uses no live LLM call, no API key, no backend, and no client-side model credential. A future governed model route would need to run through a controlled backend or governance layer, not raw browser keys.
