# Persona Segmentation Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second-level persona segmentation analysis to `/segments`, with persona universe summaries, filters, persona cards, and a selected-persona recommendation kit grounded in Galaxy first-party behavior plus Mastercard CDE enrichment.

**Architecture:** Keep the current six top-level `Segment` records as the executive layer, then add a deterministic local `SegmentPersona` layer with three personas per top-level segment. Persona data lives in `src/data/personas.ts`, pure selectors and summaries live in `src/lib/personas.ts`, and focused UI panels render the persona universe, cards, filters, and recommendation kit inside the existing `/segments` route. No backend, no runtime AI, no new dependencies.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind, existing Galaxy UI primitives, Vitest + Testing Library, Playwright e2e.

---

## Reference Interpretation

The supplied Prudential reference is used for information architecture only:

- Universe summary cards at the top.
- Stage or group filters plus search.
- Persona cards with counts, gaps, readiness, and tags.
- A selected-persona detail kit with profile, recommended products or offers, selling points, and campaign action.

The Galaxy version must preserve the current luxury visual system and CDE rules:

- Use Galaxy top-level segments instead of insurance life stages.
- Use wallet leakage, channel behavior, propensities, visit share, and indexed wallet intensity instead of protection gaps.
- Use only percentages, indices, modelled `equiv./mo` bands, propensity decimals, and matched-guest counts for CDE-enriched values.
- Do not introduce `HKD`, `MOP`, `$`, `元`, or `澳門幣` in persona CDE findings.

## File Structure

- Create `src/data/personas.ts`
  - Owns static, deterministic persona definitions.
  - Exports `personaClusters`, `personaRecords`, and `personaById`.
  - Contains no React.

- Modify `src/data/types.ts`
  - Adds persona domain types:
    - `PersonaPriority`
    - `PersonaWealthTier`
    - `PersonaActivationChannel`
    - `PersonaRecommendation`
    - `SegmentPersona`
    - `PersonaCluster`

- Modify `src/data/index.ts`
  - Re-exports persona data.

- Create `src/lib/personas.ts`
  - Pure functions for filtering, ranking, summary, and CDE-safe fallback handling.
  - Exports `getPersonaUniverseSummary`, `getPersonasForSegment`, `filterPersonas`, `getPersonaDetail`, and `getPriorityPersona`.

- Create `src/lib/personas.test.ts`
  - Verifies deterministic ranking, filtering, selected-persona lookup, malformed input behavior, and banned currency compliance.

- Create `src/components/panels/persona-universe.tsx`
  - Renders top-level universe summary cards and a generated insight line.

- Create `src/components/panels/persona-filter-bar.tsx`
  - Renders segment chips, wealth chips, search input, sort select, and view mode controls.

- Create `src/components/panels/persona-card.tsx`
  - Renders compact persona cards with matched audience, need, CDE reveal, coverage/readiness bar, and tags.

- Create `src/components/panels/persona-detail-kit.tsx`
  - Renders selected-persona detail view: profile, CDE evidence, recommendations, selling points, and activation handoff.

- Modify `src/app/segments/page.tsx`
  - Adds local state for selected persona, persona filters, and sort mode.
  - Places persona universe below the selected top-level segment insight and above masked CRM append fields.

- Modify `src/app/segments/page.test.tsx`
  - Adds route tests for persona universe, filtering, selected persona detail kit, and CDE-safe rendering.

- Modify `e2e/compliance.spec.ts`
  - Adds rendered checks that `/segments` exposes the new persona analysis and remains currency-compliant.

---

## Task 1: Persona Domain Types And Static Persona Data

**Files:**
- Modify: `src/data/types.ts`
- Create: `src/data/personas.ts`
- Modify: `src/data/index.ts`
- Test: `src/lib/personas.test.ts`

- [ ] **Step 1: Write the failing persona data export test**

Create `src/lib/personas.test.ts` with this initial test:

```ts
import { personaClusters, personaRecords, personaById } from '@/data';

const bannedCurrencyPattern = /\b(?:MOP|HKD)\b|\$|元|澳門幣/i;

describe('persona segmentation data', () => {
  it('exports eighteen second-level personas grouped under the six Galaxy CDE segments', () => {
    expect(personaClusters).toHaveLength(6);
    expect(personaRecords).toHaveLength(18);
    expect(Object.keys(personaById)).toHaveLength(18);

    personaClusters.forEach((cluster) => {
      expect(cluster.personaIds).toHaveLength(3);
      cluster.personaIds.forEach((personaId) => {
        expect(personaById[personaId].segmentId).toBe(cluster.segmentId);
      });
    });
  });

  it('keeps persona copy CDE-compliant without banned currency markers', () => {
    expect(JSON.stringify({ personaClusters, personaRecords })).not.toMatch(bannedCurrencyPattern);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test -- src/lib/personas.test.ts
```

Expected: FAIL because `personaClusters`, `personaRecords`, and `personaById` are not exported from `@/data`.

- [ ] **Step 3: Add persona types**

Append these interfaces to `src/data/types.ts` after the `Segment` interface:

```ts
export type PersonaPriority = 'priority' | 'watch' | 'nurture';
export type PersonaWealthTier = 'VIP' | 'Premium' | 'Mass-Affluent' | 'Mass';
export type PersonaActivationChannel = 'Host' | 'Mini Program' | 'Concierge' | 'Paid Media' | 'CRM';

export interface PersonaRecommendation {
  title: string;
  channel: PersonaActivationChannel;
  action: string;
  rationale: string;
}

export interface SegmentPersona {
  id: string;
  segmentId: string;
  name: string;
  nameZh: string;
  audienceK: number;
  ageBand: string;
  travelMode: string;
  wealthTier: PersonaWealthTier;
  priority: PersonaPriority;
  primaryNeed: string;
  galaxyKnownSignal: string;
  mastercardCdeReveal: string;
  walletGap: string;
  opportunityIndex: number;
  leakagePct: number;
  propensityScore: number;
  readinessScore: number;
  crossPropertyCashBand: string;
  recommendedProducts: string[];
  recommendations: PersonaRecommendation[];
  sellingPoints: string[];
  tags: string[];
}

export interface PersonaCluster {
  segmentId: string;
  label: string;
  personaIds: string[];
}
```

- [ ] **Step 4: Create deterministic persona data**

Create `src/data/personas.ts`:

```ts
import type { PersonaCluster, SegmentPersona } from './types';

export const personaClusters: PersonaCluster[] = [
  {
    segmentId: 'diamond-high-rollers',
    label: 'Diamond High-Rollers',
    personaIds: ['suite-first-patrons', 'private-dining-hosts', 'watch-jewellery-collectors'],
  },
  {
    segmentId: 'cosmopolitan-connoisseurs',
    label: 'Cosmopolitan Connoisseurs',
    personaIds: ['chef-table-seekers', 'boutique-weekenders', 'beauty-retail-curators'],
  },
  {
    segmentId: 'gba-cross-border-explorers',
    label: 'GBA Cross-Border Explorers',
    personaIds: ['same-week-itinerary-builders', 'border-family-daytrippers', 'mobile-deal-optimizers'],
  },
  {
    segmentId: 'family-leisure-seekers',
    label: 'Family Leisure Seekers',
    personaIds: ['holiday-suite-planners', 'show-first-families', 'kids-lifestyle-shoppers'],
  },
  {
    segmentId: 'mice-business-guests',
    label: 'MICE & Business Guests',
    personaIds: ['conference-extension-guests', 'private-dining-conveners', 'corporate-gifting-buyers'],
  },
  {
    segmentId: 'aspiring-mass-affluent',
    label: 'Aspiring Mass-Affluent',
    personaIds: ['tier-challenge-climbers', 'accessible-luxury-samplers', 'concert-led-upgraders'],
  },
];

export const personaRecords: SegmentPersona[] = [
  {
    id: 'suite-first-patrons',
    segmentId: 'diamond-high-rollers',
    name: 'Suite-First Patrons',
    nameZh: '套房優先貴賓',
    audienceK: 4,
    ageBand: '38-62',
    travelMode: 'Hosted premium stay',
    wealthTier: 'VIP',
    priority: 'priority',
    primaryNeed: 'Keep the full luxury stay inside Galaxy before competitors intercept suite demand.',
    galaxyKnownSignal: 'High suite-led visitation, VIP host relationship, and strong on-property hospitality capture.',
    mastercardCdeReveal: 'Modelled wallet shows premium hospitality still leaking outside Galaxy at high wallet intensity.',
    walletGap: 'Hospitality recapture',
    opportunityIndex: 136,
    leakagePct: 28,
    propensityScore: 0.91,
    readinessScore: 82,
    crossPropertyCashBand: '24-36k equiv./mo',
    recommendedProducts: ['Suite upgrade priority', 'VIP host itinerary', 'Private arrival concierge'],
    recommendations: [
      {
        title: 'Host-led suite retention path',
        channel: 'Host',
        action: 'Route to VIP host call list with suite upgrade priority and private arrival hold.',
        rationale: 'The persona already has high Galaxy affinity; the action protects leakage before the next stay decision.',
      },
    ],
    sellingPoints: [
      'Open with the guest history: Galaxy already knows their preferred premium stay pattern.',
      'Anchor the offer on convenience and recognition, not a discount.',
      'Use CDE leakage as a prioritization signal, not a raw spend claim.',
    ],
    tags: ['VIP', 'Host', 'Hospitality'],
  },
  {
    id: 'private-dining-hosts',
    segmentId: 'diamond-high-rollers',
    name: 'Private Dining Hosts',
    nameZh: '私人餐飲主人',
    audienceK: 3,
    ageBand: '35-58',
    travelMode: 'Hosted group dining',
    wealthTier: 'VIP',
    priority: 'watch',
    primaryNeed: 'Convert premium dining occasions into complete Galaxy stay and retail itineraries.',
    galaxyKnownSignal: 'Frequent fine-dining bookings and VIP-hosted arrivals.',
    mastercardCdeReveal: 'F&B wallet index remains elevated while a material share is still captured off property.',
    walletGap: 'F&B bridge to retail',
    opportunityIndex: 124,
    leakagePct: 31,
    propensityScore: 0.88,
    readinessScore: 76,
    crossPropertyCashBand: '18-28k equiv./mo',
    recommendedProducts: ['Chef table access', 'Private room hold', 'Retail preview after dining'],
    recommendations: [
      {
        title: 'Chef-table to promenade path',
        channel: 'Concierge',
        action: 'Pair private dining confirmation with curated retail appointment slots.',
        rationale: 'Dining is the strongest first-party hook and CDE indicates adjacent luxury wallet headroom.',
      },
    ],
    sellingPoints: [
      'Confirm the dining moment first, then add one curated adjacent experience.',
      'Use concierge language around priority access and privacy.',
      'Keep the recommended path short enough for host follow-up.',
    ],
    tags: ['VIP', 'Dining', 'Retail'],
  },
  {
    id: 'watch-jewellery-collectors',
    segmentId: 'diamond-high-rollers',
    name: 'Watch & Jewellery Collectors',
    nameZh: '腕錶珠寶藏家',
    audienceK: 2,
    ageBand: '40-65',
    travelMode: 'Premium retail trip',
    wealthTier: 'VIP',
    priority: 'priority',
    primaryNeed: 'Protect limited-edition retail demand from competing luxury districts.',
    galaxyKnownSignal: 'VIP stay history and high luxury-retail engagement around private launches.',
    mastercardCdeReveal: 'Luxury retail wallet intensity is the strongest external signal for this sub-persona.',
    walletGap: 'Private retail appointment',
    opportunityIndex: 142,
    leakagePct: 42,
    propensityScore: 0.84,
    readinessScore: 86,
    crossPropertyCashBand: '24-36k equiv./mo',
    recommendedProducts: ['Private boutique preview', 'Limited-edition appointment', 'Suite-linked retail itinerary'],
    recommendations: [
      {
        title: 'Limited-edition appointment queue',
        channel: 'Host',
        action: 'Create a host-owned audience for private watch and jewellery previews.',
        rationale: 'High intensity plus leakage makes this the clearest premium retail recapture lane.',
      },
    ],
    sellingPoints: [
      'Lead with availability and appointment access.',
      'Connect boutique timing to their next premium stay.',
      'Use a host-owned follow-up rather than mass messaging.',
    ],
    tags: ['VIP', 'Retail', 'Appointment'],
  },
  {
    id: 'chef-table-seekers',
    segmentId: 'cosmopolitan-connoisseurs',
    name: 'Chef-Table Seekers',
    nameZh: '名廚餐桌客',
    audienceK: 8,
    ageBand: '30-52',
    travelMode: 'Dining-led luxury weekend',
    wealthTier: 'Premium',
    priority: 'priority',
    primaryNeed: 'Use signature dining as the entry point into stay and boutique conversion.',
    galaxyKnownSignal: 'Strong restaurant engagement and boutique-stay browsing.',
    mastercardCdeReveal: 'F&B wallet intensity is high while retail luxury remains under-captured.',
    walletGap: 'Dining-to-retail conversion',
    opportunityIndex: 128,
    leakagePct: 43,
    propensityScore: 0.86,
    readinessScore: 80,
    crossPropertyCashBand: '14-22k equiv./mo',
    recommendedProducts: ['Chef table priority', 'Boutique appointment', 'Weekend room hold'],
    recommendations: [
      {
        title: 'Reservation-linked retail benefit',
        channel: 'Concierge',
        action: 'Attach boutique appointment options to premium dining confirmations.',
        rationale: 'Dining behavior is the strongest Galaxy signal and CDE shows adjacent retail headroom.',
      },
    ],
    sellingPoints: [
      'Start from the restaurant they already value.',
      'Offer curated shopping as a convenience extension.',
      'Position the room as a weekend completion, not the first ask.',
    ],
    tags: ['Premium', 'Dining', 'Retail'],
  },
  {
    id: 'boutique-weekenders',
    segmentId: 'cosmopolitan-connoisseurs',
    name: 'Boutique Weekenders',
    nameZh: '精品週末客',
    audienceK: 7,
    ageBand: '28-48',
    travelMode: 'Short luxury escape',
    wealthTier: 'Premium',
    priority: 'watch',
    primaryNeed: 'Win the comparison moment when guests choose between Macau luxury districts.',
    galaxyKnownSignal: 'Boutique room research and premium dining comparison behavior.',
    mastercardCdeReveal: 'Hospitality and retail indices indicate high consideration outside Galaxy.',
    walletGap: 'Weekend comparison leakage',
    opportunityIndex: 116,
    leakagePct: 45,
    propensityScore: 0.74,
    readinessScore: 68,
    crossPropertyCashBand: '12-18k equiv./mo',
    recommendedProducts: ['Boutique stay bundle', 'Late checkout', 'Retail concierge route'],
    recommendations: [
      {
        title: 'Luxury weekend comparison defense',
        channel: 'CRM',
        action: 'Send a weekend itinerary that connects dining, boutique retail, and stay benefits.',
        rationale: 'The persona is comparison-heavy, so the action should make Galaxy feel complete before booking.',
      },
    ],
    sellingPoints: [
      'Show the whole weekend in one itinerary.',
      'Highlight certainty around table and room access.',
      'Avoid generic resort copy; focus on curated district convenience.',
    ],
    tags: ['Premium', 'Weekend', 'Comparison'],
  },
  {
    id: 'beauty-retail-curators',
    segmentId: 'cosmopolitan-connoisseurs',
    name: 'Beauty Retail Curators',
    nameZh: '美妝精品策展客',
    audienceK: 6,
    ageBand: '26-46',
    travelMode: 'Retail and dining trip',
    wealthTier: 'Mass-Affluent',
    priority: 'nurture',
    primaryNeed: 'Turn accessible luxury browsing into a booked retail appointment.',
    galaxyKnownSignal: 'Dining and boutique browsing with strong online planning behavior.',
    mastercardCdeReveal: 'Beauty and fashion subcategory indices show wallet headroom beyond current Galaxy capture.',
    walletGap: 'Beauty retail appointment',
    opportunityIndex: 104,
    leakagePct: 54,
    propensityScore: 0.69,
    readinessScore: 62,
    crossPropertyCashBand: '8-14k equiv./mo',
    recommendedProducts: ['Beauty preview', 'Dining-linked retail path', 'Member styling session'],
    recommendations: [
      {
        title: 'Beauty preview invite',
        channel: 'Mini Program',
        action: 'Invite to a timed preview with dining reservation add-on.',
        rationale: 'Online planning behavior supports a lower-friction digital handoff.',
      },
    ],
    sellingPoints: [
      'Use product discovery language rather than VIP exclusivity.',
      'Make appointment booking mobile-first.',
      'Pair retail with a dining reason to visit.',
    ],
    tags: ['Mass-Affluent', 'Retail', 'Online'],
  },
  {
    id: 'same-week-itinerary-builders',
    segmentId: 'gba-cross-border-explorers',
    name: 'Same-Week Itinerary Builders',
    nameZh: '即週行程規劃客',
    audienceK: 18,
    ageBand: '25-44',
    travelMode: 'Mobile-first short stay',
    wealthTier: 'Mass-Affluent',
    priority: 'priority',
    primaryNeed: 'Convert same-week regional consideration before arrival.',
    galaxyKnownSignal: 'High online channel share and frequent short-stay visit pattern.',
    mastercardCdeReveal: 'CDE shows cross-property cash headroom and comparison behavior across hospitality and entertainment.',
    walletGap: 'Short-stay bundle leakage',
    opportunityIndex: 118,
    leakagePct: 57,
    propensityScore: 0.79,
    readinessScore: 78,
    crossPropertyCashBand: '6-10k equiv./mo',
    recommendedProducts: ['Same-week room bundle', 'Dining slot', 'Show seat hold'],
    recommendations: [
      {
        title: 'Cross-border flash itinerary',
        channel: 'Mini Program',
        action: 'Trigger mobile itinerary offers for guests entering the same-week booking window.',
        rationale: 'Online share and visit index point to mobile-led conversion before arrival.',
      },
    ],
    sellingPoints: [
      'Lead with time saved: room, table, and show in one itinerary.',
      'Keep copy short for mobile.',
      'Use CDE leakage to prioritize audience rank, not to show spend.',
    ],
    tags: ['Mass-Affluent', 'Mobile', 'Short Stay'],
  },
  {
    id: 'border-family-daytrippers',
    segmentId: 'gba-cross-border-explorers',
    name: 'Border Family Daytrippers',
    nameZh: '跨境家庭即日客',
    audienceK: 13,
    ageBand: '30-48',
    travelMode: 'Family day trip',
    wealthTier: 'Mass',
    priority: 'watch',
    primaryNeed: 'Turn day-trip entertainment intent into pre-booked Galaxy experiences.',
    galaxyKnownSignal: 'Family entertainment visits and weekend-heavy arrivals.',
    mastercardCdeReveal: 'Entertainment index is strong while stay conversion remains under-captured.',
    walletGap: 'Day-trip to stay conversion',
    opportunityIndex: 106,
    leakagePct: 47,
    propensityScore: 0.57,
    readinessScore: 64,
    crossPropertyCashBand: '4-7k equiv./mo',
    recommendedProducts: ['Family show bundle', 'Casual dining slot', 'Weekend room hold'],
    recommendations: [
      {
        title: 'Family day-to-stay bridge',
        channel: 'CRM',
        action: 'Send show-led itineraries with optional stay extension.',
        rationale: 'The persona already visits for entertainment; the gap is extending spend into hospitality.',
      },
    ],
    sellingPoints: [
      'Start with the family activity, not the room.',
      'Make the optional stay feel like convenience.',
      'Use flexible booking language around school and weekend timing.',
    ],
    tags: ['Mass', 'Family', 'Entertainment'],
  },
  {
    id: 'mobile-deal-optimizers',
    segmentId: 'gba-cross-border-explorers',
    name: 'Mobile Deal Optimizers',
    nameZh: '手機優惠比較客',
    audienceK: 16,
    ageBand: '23-40',
    travelMode: 'Value-aware mobile planning',
    wealthTier: 'Mass',
    priority: 'nurture',
    primaryNeed: 'Reduce comparison leakage with a clear mobile-first reason to choose Galaxy.',
    galaxyKnownSignal: 'High online channel share and frequent regional browsing.',
    mastercardCdeReveal: 'Accessible luxury and casual dining indices indicate wallet pockets outside Galaxy.',
    walletGap: 'Mobile comparison leakage',
    opportunityIndex: 96,
    leakagePct: 61,
    propensityScore: 0.61,
    readinessScore: 58,
    crossPropertyCashBand: '3-6k equiv./mo',
    recommendedProducts: ['Mini-program bundle', 'Dining multiplier', 'Two-visit challenge'],
    recommendations: [
      {
        title: 'Mobile comparison intercept',
        channel: 'Mini Program',
        action: 'Show a compact bundle card when the persona enters same-week planning behavior.',
        rationale: 'The audience is large and digital, but requires a simple value cue.',
      },
    ],
    sellingPoints: [
      'Keep the offer easy to compare.',
      'Use benefit stacking rather than luxury language.',
      'Move quickly; the decision window is short.',
    ],
    tags: ['Mass', 'Mobile', 'Value'],
  },
  {
    id: 'holiday-suite-planners',
    segmentId: 'family-leisure-seekers',
    name: 'Holiday Suite Planners',
    nameZh: '假期套房家庭客',
    audienceK: 12,
    ageBand: '34-52',
    travelMode: 'School-holiday stay',
    wealthTier: 'Mass-Affluent',
    priority: 'priority',
    primaryNeed: 'Secure family stay demand before peak holiday inventory compresses.',
    galaxyKnownSignal: 'School-holiday planning, connecting-room interest, and family package engagement.',
    mastercardCdeReveal: 'Hospitality leakage remains visible despite strong entertainment capture.',
    walletGap: 'Holiday room leakage',
    opportunityIndex: 113,
    leakagePct: 51,
    propensityScore: 0.57,
    readinessScore: 74,
    crossPropertyCashBand: '4-7k equiv./mo',
    recommendedProducts: ['Family room hold', 'Guaranteed show seats', 'Flexible cancellation window'],
    recommendations: [
      {
        title: 'Holiday certainty bundle',
        channel: 'CRM',
        action: 'Prioritize early family room holds with show-seat certainty.',
        rationale: 'The persona values certainty and has enough leakage to justify early outreach.',
      },
    ],
    sellingPoints: [
      'Talk about certainty for the family, not generic promotion.',
      'Show room and show availability together.',
      'Push before peak holiday competitor offers launch.',
    ],
    tags: ['Family', 'Holiday', 'Hospitality'],
  },
  {
    id: 'show-first-families',
    segmentId: 'family-leisure-seekers',
    name: 'Show-First Families',
    nameZh: '演出優先家庭客',
    audienceK: 14,
    ageBand: '30-50',
    travelMode: 'Entertainment-led weekend',
    wealthTier: 'Mass',
    priority: 'watch',
    primaryNeed: 'Use entertainment strength to grow dining and stay conversion.',
    galaxyKnownSignal: 'Strong family show and attraction visits.',
    mastercardCdeReveal: 'Entertainment capture is high but F&B and hospitality leakage remain actionable.',
    walletGap: 'Show-to-dining conversion',
    opportunityIndex: 102,
    leakagePct: 36,
    propensityScore: 0.52,
    readinessScore: 70,
    crossPropertyCashBand: '4-7k equiv./mo',
    recommendedProducts: ['Show bundle', 'Casual dining slot', 'Late checkout option'],
    recommendations: [
      {
        title: 'Show-first spend bridge',
        channel: 'CRM',
        action: 'Attach dining and room extension prompts to show booking confirmation.',
        rationale: 'Galaxy owns the entertainment moment; adjacent spend needs a guided bridge.',
      },
    ],
    sellingPoints: [
      'Do not overcomplicate the package.',
      'Attach one dining option and one stay option.',
      'Use family schedule language around arrival and exit times.',
    ],
    tags: ['Family', 'Entertainment', 'Dining'],
  },
  {
    id: 'kids-lifestyle-shoppers',
    segmentId: 'family-leisure-seekers',
    name: 'Kids Lifestyle Shoppers',
    nameZh: '親子生活購物客',
    audienceK: 9,
    ageBand: '32-48',
    travelMode: 'Family retail add-on',
    wealthTier: 'Mass',
    priority: 'nurture',
    primaryNeed: 'Create a retail reason to extend family visits beyond entertainment.',
    galaxyKnownSignal: 'Family visit behavior with light lifestyle retail engagement.',
    mastercardCdeReveal: 'Retail luxury capture is low but kids lifestyle subcategory shows headroom.',
    walletGap: 'Family retail add-on',
    opportunityIndex: 88,
    leakagePct: 71,
    propensityScore: 0.44,
    readinessScore: 52,
    crossPropertyCashBand: '3-5k equiv./mo',
    recommendedProducts: ['Kids lifestyle route', 'Family dining voucher', 'Weekend discovery map'],
    recommendations: [
      {
        title: 'Family retail discovery path',
        channel: 'Mini Program',
        action: 'Add a short family retail route to entertainment booking flows.',
        rationale: 'The opportunity is smaller but can be activated digitally at low friction.',
      },
    ],
    sellingPoints: [
      'Frame retail as a convenient add-on.',
      'Keep the route short and family-friendly.',
      'Use digital discovery rather than host follow-up.',
    ],
    tags: ['Family', 'Retail', 'Nurture'],
  },
  {
    id: 'conference-extension-guests',
    segmentId: 'mice-business-guests',
    name: 'Conference Extension Guests',
    nameZh: '會議延住客',
    audienceK: 10,
    ageBand: '32-58',
    travelMode: 'Business-to-leisure extension',
    wealthTier: 'Premium',
    priority: 'priority',
    primaryNeed: 'Convert weekday business trips into partner or leisure extensions.',
    galaxyKnownSignal: 'Weekday rooms, MICE attendance, and post-event browsing.',
    mastercardCdeReveal: 'Hospitality base is strong while entertainment and retail remain under-captured.',
    walletGap: 'Business-to-leisure extension',
    opportunityIndex: 122,
    leakagePct: 42,
    propensityScore: 0.69,
    readinessScore: 77,
    crossPropertyCashBand: '10-16k equiv./mo',
    recommendedProducts: ['Partner stay extension', 'Private dining hold', 'Weekend entertainment access'],
    recommendations: [
      {
        title: 'Post-event extension concierge',
        channel: 'Concierge',
        action: 'Trigger follow-up offers after event check-in and before departure.',
        rationale: 'The conversion window is tied to event timing and needs concierge support.',
      },
    ],
    sellingPoints: [
      'Ask before departure, not after the trip.',
      'Make the partner or leisure extension easy to confirm.',
      'Bundle dining with the stay extension.',
    ],
    tags: ['Business', 'Premium', 'Concierge'],
  },
  {
    id: 'private-dining-conveners',
    segmentId: 'mice-business-guests',
    name: 'Private Dining Conveners',
    nameZh: '商務私人餐飲客',
    audienceK: 7,
    ageBand: '35-60',
    travelMode: 'Business hosting',
    wealthTier: 'Premium',
    priority: 'watch',
    primaryNeed: 'Capture client-hosting dining demand that leaks to nearby premium venues.',
    galaxyKnownSignal: 'MICE attendance and private-room restaurant interest.',
    mastercardCdeReveal: 'F&B wallet index supports business-hosting conversion.',
    walletGap: 'Business dining leakage',
    opportunityIndex: 111,
    leakagePct: 54,
    propensityScore: 0.58,
    readinessScore: 66,
    crossPropertyCashBand: '8-13k equiv./mo',
    recommendedProducts: ['Private dining room', 'Client-hosting package', 'Corporate concierge callback'],
    recommendations: [
      {
        title: 'Client-hosting dining path',
        channel: 'Concierge',
        action: 'Offer private-room holds to business guests tied to MICE calendar timing.',
        rationale: 'The persona has a specific hosting use case and a visible F&B leakage signal.',
      },
    ],
    sellingPoints: [
      'Lead with privacy and client experience.',
      'Use event timing to make the recommendation relevant.',
      'Offer concierge confirmation instead of self-service only.',
    ],
    tags: ['Business', 'Dining', 'MICE'],
  },
  {
    id: 'corporate-gifting-buyers',
    segmentId: 'mice-business-guests',
    name: 'Corporate Gifting Buyers',
    nameZh: '企業禮贈採購客',
    audienceK: 6,
    ageBand: '34-56',
    travelMode: 'Retail gifting add-on',
    wealthTier: 'Mass-Affluent',
    priority: 'nurture',
    primaryNeed: 'Connect business trips to premium gifting and retail appointments.',
    galaxyKnownSignal: 'Business travel and retail gifting category engagement.',
    mastercardCdeReveal: 'Gifting and luxury retail subcategory indices indicate focused headroom.',
    walletGap: 'Corporate gifting leakage',
    opportunityIndex: 99,
    leakagePct: 64,
    propensityScore: 0.52,
    readinessScore: 55,
    crossPropertyCashBand: '6-10k equiv./mo',
    recommendedProducts: ['Corporate gifting appointment', 'Boutique concierge', 'Post-event retail route'],
    recommendations: [
      {
        title: 'Corporate gifting retail queue',
        channel: 'CRM',
        action: 'Send gifting appointment prompts to MICE guests with retail engagement.',
        rationale: 'The action is narrow enough to test without changing the broader MICE journey.',
      },
    ],
    sellingPoints: [
      'Keep the message practical and time-saving.',
      'Suggest curated options for business gifting.',
      'Make the appointment easy to add around event schedules.',
    ],
    tags: ['Business', 'Retail', 'Gifting'],
  },
  {
    id: 'tier-challenge-climbers',
    segmentId: 'aspiring-mass-affluent',
    name: 'Tier Challenge Climbers',
    nameZh: '會籍升級挑戰客',
    audienceK: 22,
    ageBand: '25-44',
    travelMode: 'Rewards-led repeat visits',
    wealthTier: 'Mass-Affluent',
    priority: 'priority',
    primaryNeed: 'Turn broad competitor consideration into repeat Galaxy visits through tier progress.',
    galaxyKnownSignal: 'Value-aware visits and rising rewards engagement.',
    mastercardCdeReveal: 'Large audience size and high leakage create efficient reacquisition headroom.',
    walletGap: 'Rewards progression leakage',
    opportunityIndex: 131,
    leakagePct: 65,
    propensityScore: 0.61,
    readinessScore: 79,
    crossPropertyCashBand: '3-6k equiv./mo',
    recommendedProducts: ['Two-visit challenge', 'Dining multiplier', 'Accessible luxury bonus'],
    recommendations: [
      {
        title: 'Step-up rewards accelerator',
        channel: 'Mini Program',
        action: 'Launch a two-visit progress challenge with dining and retail multipliers.',
        rationale: 'The persona is large, digital, and motivated by visible progression.',
      },
    ],
    sellingPoints: [
      'Show progress clearly.',
      'Use multipliers rather than premium-only benefits.',
      'Make the second visit feel achievable.',
    ],
    tags: ['Mass-Affluent', 'Rewards', 'Mobile'],
  },
  {
    id: 'accessible-luxury-samplers',
    segmentId: 'aspiring-mass-affluent',
    name: 'Accessible Luxury Samplers',
    nameZh: '輕奢體驗客',
    audienceK: 19,
    ageBand: '24-42',
    travelMode: 'Trial luxury weekend',
    wealthTier: 'Mass-Affluent',
    priority: 'watch',
    primaryNeed: 'Introduce luxury experiences without making the ask feel too premium.',
    galaxyKnownSignal: 'Casual dining, entry suite, and accessible retail interest.',
    mastercardCdeReveal: 'Accessible luxury and beauty indices suggest step-up potential.',
    walletGap: 'Accessible luxury leakage',
    opportunityIndex: 108,
    leakagePct: 76,
    propensityScore: 0.56,
    readinessScore: 63,
    crossPropertyCashBand: '3-6k equiv./mo',
    recommendedProducts: ['Entry suite package', 'Beauty retail preview', 'Casual dining multiplier'],
    recommendations: [
      {
        title: 'First luxury weekend path',
        channel: 'Paid Media',
        action: 'Target comparison audiences with entry luxury itinerary cards.',
        rationale: 'Paid media can reach the broader comparison pool before a direct relationship is deep enough.',
      },
    ],
    sellingPoints: [
      'Use invitation language that feels attainable.',
      'Avoid VIP phrasing that may feel irrelevant.',
      'Pair room, dining, and beauty retail in one simple path.',
    ],
    tags: ['Mass-Affluent', 'Trial', 'Retail'],
  },
  {
    id: 'concert-led-upgraders',
    segmentId: 'aspiring-mass-affluent',
    name: 'Concert-Led Upgraders',
    nameZh: '演唱會升級客',
    audienceK: 17,
    ageBand: '23-40',
    travelMode: 'Event-led visit',
    wealthTier: 'Mass',
    priority: 'nurture',
    primaryNeed: 'Use concert demand to pull dining and stay wallet into Galaxy.',
    galaxyKnownSignal: 'Entertainment interest and digital campaign response.',
    mastercardCdeReveal: 'Entertainment wallet is active but stay and retail capture remain low.',
    walletGap: 'Event-to-stay leakage',
    opportunityIndex: 101,
    leakagePct: 61,
    propensityScore: 0.49,
    readinessScore: 57,
    crossPropertyCashBand: '3-5k equiv./mo',
    recommendedProducts: ['Concert room add-on', 'Casual dining bundle', 'Two-visit rewards prompt'],
    recommendations: [
      {
        title: 'Concert add-on ladder',
        channel: 'Mini Program',
        action: 'Attach dining and stay add-ons to concert-led audience journeys.',
        rationale: 'The event creates intent; the persona needs a simple upgrade ladder.',
      },
    ],
    sellingPoints: [
      'Start with the event they already want.',
      'Offer one dining add-on and one room add-on.',
      'Use rewards progress to encourage the return visit.',
    ],
    tags: ['Mass', 'Entertainment', 'Upgrade'],
  },
];

export const personaById: Record<string, SegmentPersona> = Object.fromEntries(
  personaRecords.map((persona) => [persona.id, persona]),
);
```

- [ ] **Step 5: Export persona data**

Modify `src/data/index.ts` to:

```ts
export type * from './types';
export {
  CORE_CATEGORIES,
  crmRows,
  latestQuarter,
  latestSegments,
  marketScanTiles,
  methodology,
  quarters,
  segmentsByQuarter,
} from './generate';
export { personaById, personaClusters, personaRecords } from './personas';
```

- [ ] **Step 6: Run the test to verify it passes**

Run:

```bash
npm run test -- src/lib/personas.test.ts
```

Expected: PASS with 2 tests.

- [ ] **Step 7: Commit**

```bash
git add src/data/types.ts src/data/personas.ts src/data/index.ts src/lib/personas.test.ts
git commit -m "Add persona segmentation data"
```

---

## Task 2: Persona Selectors, Ranking, Filters, And Summaries

**Files:**
- Modify: `src/lib/personas.test.ts`
- Create: `src/lib/personas.ts`

- [ ] **Step 1: Extend tests for selectors and summaries**

Add these tests to `src/lib/personas.test.ts`:

```ts
import {
  filterPersonas,
  getPersonaDetail,
  getPersonasForSegment,
  getPersonaUniverseSummary,
  getPriorityPersona,
} from './personas';

describe('persona segmentation selectors', () => {
  it('summarizes the persona universe by top-level Galaxy segment', () => {
    const summary = getPersonaUniverseSummary();

    expect(summary.totalPersonas).toBe(18);
    expect(summary.totalAudienceK).toBeGreaterThan(0);
    expect(summary.clusters).toHaveLength(6);
    expect(summary.clusters[0]).toMatchObject({
      segmentId: 'diamond-high-rollers',
      label: 'Diamond High-Rollers',
      personaCount: 3,
    });
    expect(summary.generatedInsight).toMatch(/largest second-level persona/i);
  });

  it('returns personas for the selected top-level segment sorted by opportunity by default', () => {
    const personas = getPersonasForSegment('gba-cross-border-explorers');

    expect(personas).toHaveLength(3);
    expect(personas[0].opportunityIndex).toBeGreaterThanOrEqual(personas[1].opportunityIndex);
    expect(personas.every((persona) => persona.segmentId === 'gba-cross-border-explorers')).toBe(true);
  });

  it('filters by segment, wealth tier, priority, and search text', () => {
    const personas = filterPersonas({
      segmentId: 'aspiring-mass-affluent',
      wealthTier: 'Mass-Affluent',
      priority: 'priority',
      query: 'tier',
      sort: 'opportunity',
    });

    expect(personas.map((persona) => persona.id)).toEqual(['tier-challenge-climbers']);
  });

  it('falls back to the priority persona when selected persona id is unavailable', () => {
    const detail = getPersonaDetail('missing-persona', 'diamond-high-rollers');
    const priority = getPriorityPersona('diamond-high-rollers');

    expect(detail.id).toBe(priority.id);
    expect(detail.segmentId).toBe('diamond-high-rollers');
  });

  it('keeps selector output finite and CDE-compliant', () => {
    const summary = getPersonaUniverseSummary();
    const filtered = filterPersonas({ query: 'retail', sort: 'readiness' });
    const serialized = JSON.stringify({ summary, filtered });

    expect(serialized).not.toMatch(/NaN|Infinity/);
    expect(serialized).not.toMatch(bannedCurrencyPattern);
  });
});
```

- [ ] **Step 2: Run the selector tests to verify they fail**

Run:

```bash
npm run test -- src/lib/personas.test.ts
```

Expected: FAIL because `src/lib/personas.ts` does not exist.

- [ ] **Step 3: Implement pure persona selectors**

Create `src/lib/personas.ts`:

```ts
import { personaById, personaClusters, personaRecords } from '@/data';
import type { PersonaPriority, PersonaWealthTier, SegmentPersona } from '@/data';

export type PersonaSortMode = 'opportunity' | 'audience' | 'readiness';

export interface PersonaFilterInput {
  segmentId?: string;
  wealthTier?: PersonaWealthTier | 'All';
  priority?: PersonaPriority | 'All';
  query?: string;
  sort?: PersonaSortMode;
}

export interface PersonaClusterSummary {
  segmentId: string;
  label: string;
  personaCount: number;
  audienceK: number;
  priorityCount: number;
  highestOpportunityIndex: number;
  largestPersonaName: string;
}

export interface PersonaUniverseSummary {
  totalPersonas: number;
  totalAudienceK: number;
  clusters: PersonaClusterSummary[];
  generatedInsight: string;
}

function finiteNumber(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: string | undefined, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function rankBy(sort: PersonaSortMode) {
  return (first: SegmentPersona, second: SegmentPersona) => {
    if (sort === 'audience') return finiteNumber(second.audienceK) - finiteNumber(first.audienceK);
    if (sort === 'readiness') return finiteNumber(second.readinessScore) - finiteNumber(first.readinessScore);
    return finiteNumber(second.opportunityIndex) - finiteNumber(first.opportunityIndex);
  };
}

function normalizeQuery(query = '') {
  return query.trim().toLowerCase();
}

export function getPersonasForSegment(segmentId: string, sort: PersonaSortMode = 'opportunity') {
  return personaRecords
    .filter((persona) => persona.segmentId === segmentId)
    .slice()
    .sort(rankBy(sort));
}

export function filterPersonas(input: PersonaFilterInput = {}) {
  const query = normalizeQuery(input.query);
  const sort = input.sort ?? 'opportunity';

  return personaRecords
    .filter((persona) => !input.segmentId || persona.segmentId === input.segmentId)
    .filter((persona) => !input.wealthTier || input.wealthTier === 'All' || persona.wealthTier === input.wealthTier)
    .filter((persona) => !input.priority || input.priority === 'All' || persona.priority === input.priority)
    .filter((persona) => {
      if (!query) return true;
      const haystack = [
        persona.name,
        persona.nameZh,
        persona.primaryNeed,
        persona.walletGap,
        persona.tags.join(' '),
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    })
    .slice()
    .sort(rankBy(sort));
}

export function getPriorityPersona(segmentId?: string) {
  const scoped = segmentId ? getPersonasForSegment(segmentId) : personaRecords.slice().sort(rankBy('opportunity'));
  return scoped[0] ?? personaRecords[0];
}

export function getPersonaDetail(personaId: string | undefined, segmentId?: string) {
  if (personaId && personaById[personaId]) return personaById[personaId];
  return getPriorityPersona(segmentId);
}

export function getPersonaUniverseSummary(): PersonaUniverseSummary {
  const clusters = personaClusters.map((cluster) => {
    const personas = cluster.personaIds.map((personaId) => personaById[personaId]).filter(Boolean);
    const sortedByAudience = personas.slice().sort(rankBy('audience'));
    const sortedByOpportunity = personas.slice().sort(rankBy('opportunity'));

    return {
      segmentId: cluster.segmentId,
      label: cluster.label,
      personaCount: personas.length,
      audienceK: personas.reduce((sum, persona) => sum + finiteNumber(persona.audienceK), 0),
      priorityCount: personas.filter((persona) => persona.priority === 'priority').length,
      highestOpportunityIndex: finiteNumber(sortedByOpportunity[0]?.opportunityIndex),
      largestPersonaName: safeText(sortedByAudience[0]?.name, 'No active persona'),
    };
  });

  const totalAudienceK = clusters.reduce((sum, cluster) => sum + cluster.audienceK, 0);
  const largestCluster = clusters.slice().sort((first, second) => second.audienceK - first.audienceK)[0];
  const highestOpportunity = personaRecords.slice().sort(rankBy('opportunity'))[0];

  return {
    totalPersonas: personaRecords.length,
    totalAudienceK,
    clusters,
    generatedInsight: `${safeText(highestOpportunity?.name, 'No active persona')} is the largest second-level persona opportunity to inspect now, while ${safeText(largestCluster?.label, 'the active segment universe')} carries the broadest matched audience at ~${finiteNumber(largestCluster?.audienceK)}k guests.`,
  };
}
```

- [ ] **Step 4: Run selector tests to verify they pass**

Run:

```bash
npm run test -- src/lib/personas.test.ts
```

Expected: PASS with all persona data and selector tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/personas.ts src/lib/personas.test.ts
git commit -m "Add persona segmentation selectors"
```

---

## Task 3: Persona Universe And Card Components

**Files:**
- Create: `src/components/panels/persona-universe.tsx`
- Create: `src/components/panels/persona-filter-bar.tsx`
- Create: `src/components/panels/persona-card.tsx`
- Modify: `src/app/segments/page.test.tsx`

- [ ] **Step 1: Add route tests for universe, filters, and persona cards**

Add these expectations to `src/app/segments/page.test.tsx` inside `renders six segment buttons and selected segment details` after the existing `Why this segment matters now` assertion:

```ts
    expect(screen.getByRole('heading', { name: /Persona universe/i })).toBeInTheDocument();
    expect(screen.getByText(/18 personas/i)).toBeInTheDocument();
    expect(screen.getByText(/second-level persona opportunity/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Persona explorer/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search persona, need, wallet gap, or tag/i)).toBeInTheDocument();
    expect(screen.getByText('Suite-First Patrons')).toBeInTheDocument();
    expect(screen.getByText('Private Dining Hosts')).toBeInTheDocument();
```

Add this new test to `src/app/segments/page.test.tsx`:

```ts
  it('filters second-level personas by selected top-level segment and search text', () => {
    renderSegments();

    fireEvent.click(screen.getByRole('button', { name: `segment: ${latestSegments[2].name}` }));

    expect(screen.getByText('Same-Week Itinerary Builders')).toBeInTheDocument();
    expect(screen.getByText('Border Family Daytrippers')).toBeInTheDocument();
    expect(screen.queryByText('Suite-First Patrons')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search persona, need, wallet gap, or tag/i), {
      target: { value: 'mobile' },
    });

    expect(screen.getByText('Same-Week Itinerary Builders')).toBeInTheDocument();
    expect(screen.getByText('Mobile Deal Optimizers')).toBeInTheDocument();
    expect(screen.queryByText('Border Family Daytrippers')).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run segment route tests to verify they fail**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
```

Expected: FAIL because persona UI is not rendered.

- [ ] **Step 3: Create the persona universe component**

Create `src/components/panels/persona-universe.tsx`:

```tsx
import { CdeChip } from '@/components/ui/cde-chip';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { PersonaUniverseSummary } from '@/lib/personas';

export function PersonaUniverse({ summary }: { summary: PersonaUniverseSummary }) {
  return (
    <Panel>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Overline>Second-level segmentation</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Persona universe</h2>
        </div>
        <div className="rounded border border-galaxy-gold/35 bg-galaxy-gold/10 px-3 py-2 text-sm font-semibold text-galaxy-gold">
          {summary.totalPersonas} personas · ~{summary.totalAudienceK}k matched guests
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {summary.clusters.map((cluster) => (
          <div key={cluster.segmentId} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">{cluster.label}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="font-serif text-3xl text-galaxy-cream">~{cluster.audienceK}k</p>
                <p className="mt-1 text-xs text-galaxy-muted">{cluster.personaCount} personas</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-galaxy-muted">
                Index {Math.round(cluster.highestOpportunityIndex)}
                <CdeChip />
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">
              Largest persona: <span className="text-galaxy-cream">{cluster.largestPersonaName}</span>
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-4 text-sm leading-6 text-galaxy-muted">
        <span className="font-semibold text-galaxy-gold">Generated persona insight:</span> {summary.generatedInsight}
      </p>
    </Panel>
  );
}
```

- [ ] **Step 4: Create the persona filter bar**

Create `src/components/panels/persona-filter-bar.tsx`:

```tsx
import type { PersonaPriority, PersonaWealthTier } from '@/data';
import type { PersonaSortMode } from '@/lib/personas';

interface PersonaFilterBarProps {
  query: string;
  wealthTier: PersonaWealthTier | 'All';
  priority: PersonaPriority | 'All';
  sort: PersonaSortMode;
  onQueryChange: (query: string) => void;
  onWealthTierChange: (tier: PersonaWealthTier | 'All') => void;
  onPriorityChange: (priority: PersonaPriority | 'All') => void;
  onSortChange: (sort: PersonaSortMode) => void;
}

const wealthTiers: Array<PersonaWealthTier | 'All'> = ['All', 'VIP', 'Premium', 'Mass-Affluent', 'Mass'];
const priorities: Array<PersonaPriority | 'All'> = ['All', 'priority', 'watch', 'nurture'];

export function PersonaFilterBar({
  query,
  wealthTier,
  priority,
  sort,
  onQueryChange,
  onWealthTierChange,
  onPriorityChange,
  onSortChange,
}: PersonaFilterBarProps) {
  return (
    <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/30 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_auto_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-semibold text-galaxy-muted">
          Search personas
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search persona, need, wallet gap, or tag"
            className="h-10 rounded border border-galaxy-border bg-galaxy-charcoal px-3 text-sm text-galaxy-cream outline-none transition placeholder:text-galaxy-muted focus:border-galaxy-gold"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-galaxy-muted">
          Sort
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as PersonaSortMode)}
            className="h-10 rounded border border-galaxy-border bg-galaxy-charcoal px-3 text-sm text-galaxy-cream outline-none transition focus:border-galaxy-gold"
          >
            <option value="opportunity">Opportunity</option>
            <option value="audience">Audience</option>
            <option value="readiness">Readiness</option>
          </select>
        </label>

        <div className="text-sm text-galaxy-muted">Grid view</div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-muted">Wealth</span>
        {wealthTiers.map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => onWealthTierChange(tier)}
            className={tier === wealthTier
              ? 'rounded border border-galaxy-gold bg-galaxy-gold/15 px-3 py-1 text-xs font-semibold text-galaxy-gold'
              : 'rounded border border-galaxy-border bg-galaxy-ink/40 px-3 py-1 text-xs font-semibold text-galaxy-muted hover:border-galaxy-gold/60'}
          >
            {tier}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-muted">Priority</span>
        {priorities.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPriorityChange(item)}
            className={item === priority
              ? 'rounded border border-galaxy-gold bg-galaxy-gold/15 px-3 py-1 text-xs font-semibold capitalize text-galaxy-gold'
              : 'rounded border border-galaxy-border bg-galaxy-ink/40 px-3 py-1 text-xs font-semibold capitalize text-galaxy-muted hover:border-galaxy-gold/60'}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create the persona card component**

Create `src/components/panels/persona-card.tsx`:

```tsx
import clsx from 'clsx';
import { CdeChip } from '@/components/ui/cde-chip';
import type { SegmentPersona } from '@/data';

function priorityLabel(priority: SegmentPersona['priority']) {
  if (priority === 'priority') return 'Priority';
  if (priority === 'watch') return 'Watch';
  return 'Nurture';
}

export function PersonaCard({
  persona,
  isSelected,
  onSelect,
}: {
  persona: SegmentPersona;
  isSelected: boolean;
  onSelect: (personaId: string) => void;
}) {
  return (
    <button
      type="button"
      aria-label={`persona: ${persona.name}`}
      aria-pressed={isSelected}
      onClick={() => onSelect(persona.id)}
      className={clsx(
        'w-full rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
        isSelected
          ? 'border-galaxy-gold bg-galaxy-gold/15 shadow-lg shadow-black/20'
          : 'border-galaxy-border bg-galaxy-ink/35 hover:border-galaxy-gold/70 hover:bg-galaxy-ink/55',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">{priorityLabel(persona.priority)}</p>
          <h3 className="mt-2 text-lg font-semibold text-galaxy-cream">{persona.name}</h3>
          <p className="mt-1 text-xs text-galaxy-muted">{persona.ageBand} · {persona.travelMode}</p>
        </div>
        <p className="text-right text-sm font-semibold text-galaxy-gold">~{persona.audienceK}k</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-galaxy-muted">{persona.primaryNeed}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-galaxy-market">
        <div className="h-full rounded-full bg-galaxy-gold" style={{ width: `${Math.max(6, persona.readinessScore)}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded border border-galaxy-border bg-galaxy-charcoal/70 px-2 py-1 text-xs font-semibold text-galaxy-muted">
          Index {persona.opportunityIndex}
          <CdeChip />
        </span>
        <span className="rounded border border-galaxy-border bg-galaxy-charcoal/70 px-2 py-1 text-xs font-semibold text-galaxy-muted">
          {persona.wealthTier}
        </span>
      </div>
    </button>
  );
}
```

- [ ] **Step 6: Do not run tests yet**

Do not run the route test until Task 4 integrates the components into `/segments`; the components are intentionally unused at this point.

- [ ] **Step 7: Commit**

```bash
git add src/components/panels/persona-universe.tsx src/components/panels/persona-filter-bar.tsx src/components/panels/persona-card.tsx src/app/segments/page.test.tsx
git commit -m "Add persona explorer components"
```

---

## Task 4: Selected Persona Detail Kit

**Files:**
- Create: `src/components/panels/persona-detail-kit.tsx`
- Modify: `src/app/segments/page.test.tsx`

- [ ] **Step 1: Add selected persona detail route test**

Add this test to `src/app/segments/page.test.tsx`:

```ts
  it('renders selected persona recommendation kit and updates after card selection', () => {
    renderSegments();

    expect(screen.getByRole('heading', { name: /Persona recommendation kit/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Suite-First Patrons' })).toBeInTheDocument();
    expect(screen.getByText(/Host-led suite retention path/i)).toBeInTheDocument();
    expect(screen.getByText(/Galaxy first-party signal/i)).toBeInTheDocument();
    expect(screen.getByText(/Mastercard CDE reveal/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'persona: Private Dining Hosts' }));

    expect(screen.getByRole('heading', { name: 'Private Dining Hosts' })).toBeInTheDocument();
    expect(screen.getByText(/Chef-table to promenade path/i)).toBeInTheDocument();
    expect(screen.queryByText(/Host-led suite retention path/i)).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
```

Expected: FAIL because `PersonaDetailKit` is not created or rendered.

- [ ] **Step 3: Create selected persona detail kit**

Create `src/components/panels/persona-detail-kit.tsx`:

```tsx
import Link from 'next/link';
import { CdeChip } from '@/components/ui/cde-chip';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { SegmentPersona } from '@/data';

export function PersonaDetailKit({ persona }: { persona: SegmentPersona }) {
  const primaryRecommendation = persona.recommendations[0];

  return (
    <Panel className="border-galaxy-gold/40 bg-[linear-gradient(135deg,rgba(205,164,92,0.13),rgba(12,23,35,0.82))]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Overline>Persona recommendation kit</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">{persona.name}</h2>
          <p className="mt-2 text-sm text-galaxy-muted">{persona.nameZh} · {persona.ageBand} · {persona.travelMode}</p>
        </div>
        <div className="rounded border border-galaxy-gold/35 bg-galaxy-gold/10 px-3 py-2 text-right text-sm font-semibold text-galaxy-gold">
          ~{persona.audienceK}k matched guests
          <span className="mt-1 block text-xs text-galaxy-muted">Readiness {persona.readinessScore}%</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Galaxy first-party signal</p>
              <p className="mt-3 text-sm leading-6 text-galaxy-muted">{persona.galaxyKnownSignal}</p>
            </div>
            <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Mastercard CDE reveal</p>
              <p className="mt-3 text-sm leading-6 text-galaxy-muted">{persona.mastercardCdeReveal}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-galaxy-cream">
                {persona.crossPropertyCashBand}
                <CdeChip />
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Selling points for follow-up</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {persona.sellingPoints.map((point, index) => (
                <div key={point} className="rounded border border-galaxy-border bg-galaxy-charcoal/60 p-3">
                  <span className="inline-grid size-6 place-items-center rounded-full bg-galaxy-gold text-xs font-bold text-galaxy-charcoal">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-sm leading-6 text-galaxy-muted">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Recommended products</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold text-galaxy-cream">
              {persona.recommendedProducts.map((product) => (
                <li key={product}>• {product}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-galaxy-gold/35 bg-galaxy-gold/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">{primaryRecommendation.channel} action</p>
            <h3 className="mt-3 text-lg font-semibold text-galaxy-cream">{primaryRecommendation.title}</h3>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{primaryRecommendation.action}</p>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{primaryRecommendation.rationale}</p>
            <Link
              href="/activation"
              className="mt-4 inline-flex rounded border border-galaxy-gold bg-galaxy-gold px-3 py-2 text-sm font-semibold text-galaxy-charcoal transition hover:bg-galaxy-gold/90 focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
            >
              Build activation audience
            </Link>
          </div>
        </div>
      </div>
    </Panel>
  );
}
```

- [ ] **Step 4: Do not run tests yet**

Do not run the route test until Task 5 wires the detail kit into `/segments`.

- [ ] **Step 5: Commit**

```bash
git add src/components/panels/persona-detail-kit.tsx src/app/segments/page.test.tsx
git commit -m "Add persona recommendation kit"
```

---

## Task 5: Integrate Persona Analysis Into `/segments`

**Files:**
- Modify: `src/app/segments/page.tsx`
- Modify: `src/app/segments/page.test.tsx`

- [ ] **Step 1: Add imports to `src/app/segments/page.tsx`**

Add these imports with the existing imports:

```tsx
import { PersonaCard } from '@/components/panels/persona-card';
import { PersonaDetailKit } from '@/components/panels/persona-detail-kit';
import { PersonaFilterBar } from '@/components/panels/persona-filter-bar';
import { PersonaUniverse } from '@/components/panels/persona-universe';
import type { PersonaPriority, PersonaWealthTier } from '@/data';
import {
  filterPersonas,
  getPersonaDetail,
  getPersonaUniverseSummary,
  type PersonaSortMode,
} from '@/lib/personas';
```

- [ ] **Step 2: Add persona state inside `SegmentsPage`**

Inside `SegmentsPage`, after `const insightNarrative = ...`, add:

```tsx
  const [selectedPersonaId, setSelectedPersonaId] = useState('');
  const [personaQuery, setPersonaQuery] = useState('');
  const [personaWealthTier, setPersonaWealthTier] = useState<PersonaWealthTier | 'All'>('All');
  const [personaPriority, setPersonaPriority] = useState<PersonaPriority | 'All'>('All');
  const [personaSort, setPersonaSort] = useState<PersonaSortMode>('opportunity');
  const personaSummary = useMemo(() => getPersonaUniverseSummary(), []);
  const filteredPersonas = useMemo(
    () => filterPersonas({
      segmentId: activeSegment?.id,
      wealthTier: personaWealthTier,
      priority: personaPriority,
      query: personaQuery,
      sort: personaSort,
    }),
    [activeSegment?.id, personaPriority, personaQuery, personaSort, personaWealthTier],
  );
  const selectedPersona = getPersonaDetail(selectedPersonaId, activeSegment?.id);
```

- [ ] **Step 3: Reset persona state when top-level segment changes**

Modify `selectSegment` in `src/app/segments/page.tsx` to:

```tsx
  function selectSegment(segmentId: string) {
    setFocusedSegmentId(segmentId);
    setSelectedSegmentId(segmentId);
    setSelectedPersonaId('');
    setPersonaQuery('');
    setPersonaWealthTier('All');
    setPersonaPriority('All');
    setPersonaSort('opportunity');
  }
```

- [ ] **Step 4: Render the persona universe and explorer**

In `src/app/segments/page.tsx`, place this block after the indexed category profile / propensity grid and before the `Recommended plays` panel:

```tsx
          <PersonaUniverse summary={personaSummary} />

          <Panel>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <Overline>Persona drill-down</Overline>
                <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Persona explorer</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-galaxy-muted">
                Second-level personas translate the selected Galaxy segment into audience-sized actions, CDE evidence, and activation recommendations.
              </p>
            </div>

            <PersonaFilterBar
              query={personaQuery}
              wealthTier={personaWealthTier}
              priority={personaPriority}
              sort={personaSort}
              onQueryChange={setPersonaQuery}
              onWealthTierChange={setPersonaWealthTier}
              onPriorityChange={setPersonaPriority}
              onSortChange={setPersonaSort}
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {filteredPersonas.length > 0 ? filteredPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  isSelected={persona.id === selectedPersona.id}
                  onSelect={setSelectedPersonaId}
                />
              )) : (
                <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted lg:col-span-3">
                  No personas match the current filters for this segment.
                </p>
              )}
            </div>
          </Panel>

          <PersonaDetailKit persona={selectedPersona} />
```

- [ ] **Step 5: Run segment route tests**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
```

Expected: PASS. If multiple headings named `Suite-First Patrons` cause an ambiguous role query, scope the detail assertion in the test to `screen.getByRole('heading', { name: /Persona recommendation kit/i }).closest(...)` or change the detail title assertion to `screen.getAllByRole('heading', { name: 'Suite-First Patrons' }).length >= 1`.

- [ ] **Step 6: Commit**

```bash
git add src/app/segments/page.tsx src/app/segments/page.test.tsx
git commit -m "Integrate persona analysis on segments route"
```

---

## Task 6: E2E Compliance And Full Verification

**Files:**
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Add e2e assertions for persona analysis**

Inside the existing `if (route === '/segments')` block in `e2e/compliance.spec.ts`, add:

```ts
        await expect(page.getByRole('heading', { name: /Persona universe/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Persona explorer/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Persona recommendation kit/i })).toBeVisible();
        await expect(page.getByText(/Generated persona insight/i)).toBeVisible();
        await expect(page.getByText(/Suite-First Patrons/i)).toBeVisible();
        await expect(page.getByText(/Mastercard CDE reveal/i)).toBeVisible();
```

- [ ] **Step 2: Run e2e compliance for `/segments`**

Run:

```bash
npm run test:e2e -- e2e/compliance.spec.ts --project=chromium --grep "/segments shows CDE methodology"
```

Expected: PASS. If the command reports that port `3000` is already in use by a stale Next server and the browser shows a Next runtime overlay, stop that server with `lsof -nP -iTCP:3000 -sTCP:LISTEN`, kill only the listed local Next process, and rerun the command.

- [ ] **Step 3: Run all targeted tests**

Run:

```bash
npm run test -- src/lib/personas.test.ts src/app/segments/page.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run full verification**

Run:

```bash
npm run verify
```

Expected:

- `eslint . --max-warnings=0` exits 0.
- `vitest run` passes all unit and route tests.
- `next build` compiles and statically generates routes.
- `playwright test` passes all rendered compliance and smoke tests.

- [ ] **Step 5: Browser sanity check**

Use the in-app browser at `http://127.0.0.1:3000/segments` and verify:

- The page still opens with `Guest Segments`.
- `Persona universe` shows 18 personas and six top-level segment summary cards.
- Selecting `GBA Cross-Border Explorers` changes the persona cards to `Same-Week Itinerary Builders`, `Border Family Daytrippers`, and `Mobile Deal Optimizers`.
- Searching `mobile` hides `Border Family Daytrippers` and keeps the two mobile-oriented personas.
- Selecting `Private Dining Hosts` updates the recommendation kit.
- No CDE-enriched persona panel shows `HKD`, `MOP`, `$`, `元`, or `澳門幣`.

- [ ] **Step 6: Commit**

```bash
git add e2e/compliance.spec.ts
git commit -m "Verify persona segmentation compliance"
```

---

## Self-Review

**Spec coverage:** This plan covers the requested second-level segmentation/persona layer, persona universe summary, filtering, persona cards, detailed selected-persona recommendations, and CDE-compliant rendered checks. It uses the attached reference for structure but preserves Galaxy visual style and current navigation.

**Placeholder scan:** The plan contains concrete file paths, concrete types, complete persona data, executable tests, implementation snippets, and exact verification commands.

**Type consistency:** `SegmentPersona`, `PersonaCluster`, `PersonaPriority`, `PersonaWealthTier`, `PersonaActivationChannel`, `PersonaSortMode`, and all selector names are defined before use and are referenced consistently across data, library, components, route integration, and tests.

**Scope:** This is a single subsystem: `/segments` second-level persona analysis. It intentionally does not add a new route, backend, live AI service, or real campaign launch behavior.
