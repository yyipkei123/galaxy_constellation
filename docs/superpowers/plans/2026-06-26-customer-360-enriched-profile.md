# Customer 360 Enriched Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich `/guests/[id]` Customer 360 with synthetic customer identity, demographic, stay, preference, and purchase-history evidence while preserving masked IDs and CDE-safe display rules.

**Architecture:** Extend the deterministic `Guest` model with first-party Galaxy CRM/profile fields and first-party purchase/stay history. Keep Mastercard CDE values separate in the existing fusion panel; the new identity/history panels render only synthetic first-party evidence, bands, counts, labels, and dates. All new copy remains local and deterministic, with no backend, no API keys, and no real PII.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind, existing Galaxy UI primitives, Vitest with Testing Library, Playwright e2e.

---

## Scope Boundary

This plan enriches Customer 360 only. It does not add a backend, live CRM connection, real customer records, raw spend values, email addresses, phone numbers, or exact off-property wallet amounts. Names and demographics are synthetic demo attributes for storytelling and must be labelled as first-party synthetic profile data.

The current review also found missing Lead Board filters and quadrant encoding gaps. Those should be handled in a separate plan because this request is specifically Customer 360 profile enrichment.

## File Structure

- Modify `src/data/types.ts`: add typed synthetic profile, demographic, purchase-history, stay-history, and preference fields to `Guest`.
- Modify `src/data/guests.ts`: generate deterministic synthetic customer profiles, demographics, stay history, purchase history, and preferences for each masked guest.
- Modify `src/data/guests.test.ts`: enforce deterministic enriched fields, no currency leakage, no direct contact identifiers, and minimum history density.
- Create `src/components/panels/guest-identity-panel.tsx`: render synthetic identity, demographics, host ownership, contactability, and preferences.
- Create `src/components/panels/guest-identity-panel.test.tsx`: verify rendering and sanitization.
- Create `src/components/panels/purchase-history-panel.tsx`: render first-party stay and purchase timeline as compact evidence.
- Create `src/components/panels/purchase-history-panel.test.tsx`: verify chronology, category labels, and compliance.
- Modify `src/app/guests/[id]/page.tsx`: place the new identity and history panels into Customer 360.
- Modify `src/app/guests/[id]/page.test.tsx`: assert the enriched Customer 360 evidence appears.
- Modify `e2e/compliance.spec.ts`: assert `/guests/MEM-••••3421` includes enriched profile and purchase-history panels and remains CDE-safe on iPhone, iPad, and desktop.
- Modify `README.md`: add one Customer 360 demo-script line explaining that names and histories are synthetic first-party demo fields.

---

### Task 1: Extend Guest Data Contract

**Files:**
- Modify: `src/data/types.ts`
- Test: `src/data/guests.test.ts`

- [ ] **Step 1: Write failing tests for enriched guest fields**

Add this test block inside `describe('guest lead data', () => { ... })` in `src/data/guests.test.ts`, after the existing `"keeps first-party property history unique per guest"` test:

```ts
  it('generates synthetic profile, demographics, stay history, and purchase history', () => {
    const directContactPattern = /@|\+\d{6,}|(?:\d[\s-]?){8,}/;

    for (const guest of guests) {
      expect(guest.profile.displayName).toMatch(/^[A-Z][a-z]+ [A-Z]\.$/);
      expect(guest.profile.syntheticName).toBe(true);
      expect(guest.profile.ageBand).toMatch(/^\d{2}-\d{2}$/);
      expect(guest.profile.originMarket).toMatch(/Hong Kong|Guangdong|Taiwan|Singapore|Malaysia|Thailand|Japan|Korea/);
      expect(guest.profile.preferredLanguage).toMatch(/English|Cantonese|Mandarin|Korean|Japanese/);
      expect(guest.profile.hostOwner).toMatch(/^Host Team [A-D]$/);
      expect(guest.profile.contactability).toMatch(/Host-led|Digital opt-in|Concierge-led|Rewards app/);
      expect(guest.profile.consentStatus).toMatch(/marketable|service-only/);
      expect(guest.profile.travelParty).toMatch(/Solo|Couple|Family|Business party|Friends/);
      expect(guest.profile.homeProperty).toBeTruthy();
      expect(guest.profile.membershipTenureBand).toMatch(/^\d-\d years$/);
      expect(guest.preferences.favoriteCategories.length).toBeGreaterThanOrEqual(2);
      expect(guest.preferences.servicePreferences.length).toBeGreaterThanOrEqual(2);
      expect(guest.stayHistory).toHaveLength(3);
      expect(guest.purchaseHistory).toHaveLength(5);

      const firstPartyProfileText = JSON.stringify({
        profile: guest.profile,
        preferences: guest.preferences,
        stayHistory: guest.stayHistory,
        purchaseHistory: guest.purchaseHistory,
      });
      expect(firstPartyProfileText).not.toMatch(bannedCurrencyPattern);
      expect(firstPartyProfileText).not.toMatch(directContactPattern);
    }
  });
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test -- src/data/guests.test.ts
```

Expected: FAIL with TypeScript errors that `profile`, `preferences`, `stayHistory`, and `purchaseHistory` do not exist on `Guest`.

- [ ] **Step 3: Add enriched profile types**

In `src/data/types.ts`, insert these types after `export type NbaChannel = 'online' | 'physical' | 'host';`:

```ts
export type GuestPreferredLanguage = 'English' | 'Cantonese' | 'Mandarin' | 'Korean' | 'Japanese';
export type GuestConsentStatus = 'marketable' | 'service-only';
export type GuestTravelParty = 'Solo' | 'Couple' | 'Family' | 'Business party' | 'Friends';
export type GuestPurchaseChannel = 'Host' | 'Concierge' | 'Rewards app' | 'On-property' | 'Pre-arrival';

export interface GuestProfile {
  displayName: string;
  displayNameZh: string;
  syntheticName: true;
  ageBand: '25-34' | '35-44' | '45-54' | '55-64';
  originMarket: 'Hong Kong' | 'Guangdong' | 'Taiwan' | 'Singapore' | 'Malaysia' | 'Thailand' | 'Japan' | 'Korea';
  preferredLanguage: GuestPreferredLanguage;
  travelParty: GuestTravelParty;
  hostOwner: 'Host Team A' | 'Host Team B' | 'Host Team C' | 'Host Team D';
  contactability: 'Host-led' | 'Digital opt-in' | 'Concierge-led' | 'Rewards app';
  consentStatus: GuestConsentStatus;
  homeProperty: string;
  membershipTenureBand: string;
}

export interface GuestPreferences {
  favoriteCategories: string[];
  servicePreferences: string[];
  occasionSignals: string[];
}

export interface GuestStayHistoryItem {
  id: string;
  periodLabel: string;
  property: string;
  nightsBand: string;
  roomType: 'Suite' | 'Club room' | 'Premium room' | 'Family room' | 'Business room';
  occasion: string;
  satisfactionSignal: 'Positive' | 'Neutral' | 'Service recovery';
}

export interface GuestPurchaseHistoryItem {
  id: string;
  periodLabel: string;
  category: GuestCategory;
  merchantArea: string;
  itemLabel: string;
  channel: GuestPurchaseChannel;
  ticketBand: 'entry' | 'premium' | 'ultra';
  galaxyOwned: true;
}
```

Then update the `Guest` interface by adding these fields after `galaxyTier: GalaxyTier;`:

```ts
  profile: GuestProfile;
  preferences: GuestPreferences;
```

And add these fields after the `firstParty` block:

```ts
  stayHistory: GuestStayHistoryItem[];
  purchaseHistory: GuestPurchaseHistoryItem[];
```

- [ ] **Step 4: Run the focused test to verify the remaining failure**

Run:

```bash
npm run test -- src/data/guests.test.ts
```

Expected: FAIL because `src/data/guests.ts` does not populate the new required `Guest` fields.

- [ ] **Step 5: Leave the failing contract state uncommitted**

Do not commit yet. Continue directly to Task 2 so the branch never records a known failing test state.

Expected: `git status -sb` shows `src/data/types.ts` and `src/data/guests.test.ts` modified.

---

### Task 2: Generate Deterministic Synthetic Customer Profiles

**Files:**
- Modify: `src/data/guests.ts`
- Test: `src/data/guests.test.ts`

- [ ] **Step 1: Add generator constants and helper functions**

In `src/data/guests.ts`, change the import at the top to include the new types:

```ts
import type {
  CoreCategory,
  GalaxyTier,
  Guest,
  GuestPreferredLanguage,
  GuestProfile,
  GuestPurchaseHistoryItem,
  GuestStayHistoryItem,
  NbaRec,
  Propensities,
  Segment,
} from './types';
```

After `const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;`, add these deterministic data pools:

```ts
const givenNames = ['Avery', 'Blair', 'Casey', 'Dana', 'Elliot', 'Hayden', 'Jamie', 'Morgan'];
const zhNames = ['陳雅文', '李卓賢', '王凱琳', '何俊朗', '張曉晴', '林子謙', '黃嘉欣', '趙明軒'];
const originMarkets: GuestProfile['originMarket'][] = [
  'Hong Kong',
  'Guangdong',
  'Taiwan',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Japan',
  'Korea',
];
const languages: GuestPreferredLanguage[] = ['Cantonese', 'Mandarin', 'English', 'Japanese', 'Korean'];
const travelParties: GuestProfile['travelParty'][] = ['Solo', 'Couple', 'Family', 'Business party', 'Friends'];
const contactability: GuestProfile['contactability'][] = ['Host-led', 'Digital opt-in', 'Concierge-led', 'Rewards app'];
const hostTeams: GuestProfile['hostOwner'][] = ['Host Team A', 'Host Team B', 'Host Team C', 'Host Team D'];
const roomTypes: GuestStayHistoryItem['roomType'][] = ['Suite', 'Club room', 'Premium room', 'Family room', 'Business room'];
const satisfactionSignals: GuestStayHistoryItem['satisfactionSignal'][] = ['Positive', 'Neutral', 'Service recovery'];
const purchaseChannels: GuestPurchaseHistoryItem['channel'][] = ['Host', 'Concierge', 'Rewards app', 'On-property', 'Pre-arrival'];

const categoryPurchaseThemes: Record<CoreCategory, Array<{ merchantArea: string; itemLabel: string }>> = {
  hospitality: [
    { merchantArea: 'Hotel tower', itemLabel: 'Suite upgrade interest' },
    { merchantArea: 'Spa concierge', itemLabel: 'Wellness appointment' },
    { merchantArea: 'Club lounge', itemLabel: 'Premium arrival service' },
  ],
  fnb: [
    { merchantArea: 'Fine dining', itemLabel: 'Chef-led dinner' },
    { merchantArea: 'Private dining', itemLabel: 'Celebration table' },
    { merchantArea: 'Nightlife', itemLabel: 'Late-evening lounge visit' },
  ],
  entertainment: [
    { merchantArea: 'Galaxy Arena', itemLabel: 'Premium show access' },
    { merchantArea: 'Family attractions', itemLabel: 'Weekend attraction bundle' },
    { merchantArea: 'Event desk', itemLabel: 'Presale inquiry' },
  ],
  retailLuxury: [
    { merchantArea: 'Promenade', itemLabel: 'Private boutique appointment' },
    { merchantArea: 'Luxury retail', itemLabel: 'Watch and jewellery interest' },
    { merchantArea: 'Beauty retail', itemLabel: 'Curated gifting visit' },
  ],
};
```

After `function tierFor(...)`, add these helper functions:

```ts
function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

function profileFor(segment: Segment, index: number, globalIndex: number): GuestProfile {
  const originMarket = pick(originMarkets, globalIndex + segment.name.length);
  const preferredLanguage = originMarket === 'Japan'
    ? 'Japanese'
    : originMarket === 'Korea'
      ? 'Korean'
      : originMarket === 'Taiwan' || originMarket === 'Guangdong'
        ? 'Mandarin'
        : originMarket === 'Hong Kong'
          ? 'Cantonese'
          : 'English';

  return {
    displayName: `${pick(givenNames, globalIndex)} ${String.fromCharCode(65 + (globalIndex % 20))}.`,
    displayNameZh: pick(zhNames, globalIndex),
    syntheticName: true,
    ageBand: pick(['25-34', '35-44', '45-54', '55-64'] as const, index + segment.name.length),
    originMarket,
    preferredLanguage,
    travelParty: pick(travelParties, index + globalIndex),
    hostOwner: pick(hostTeams, globalIndex),
    contactability: pick(contactability, index + segment.opportunityIndex),
    consentStatus: index % 5 === 0 ? 'service-only' : 'marketable',
    homeProperty: pick(properties, index + globalIndex),
    membershipTenureBand: `${1 + (globalIndex % 4)}-${3 + (globalIndex % 5)} years`,
  };
}

function preferencesFor(segment: Segment, primary: CoreCategory, index: number) {
  const secondary = CORE_CATEGORIES.filter((category) => category !== primary)
    .sort((first, second) => (
      segment.categories[second].totalWalletIndex - segment.categories[first].totalWalletIndex
    ))[0];

  return {
    favoriteCategories: [
      categoryPurchaseThemes[primary][0].merchantArea,
      categoryPurchaseThemes[secondary][0].merchantArea,
      segment.signatureTrait,
    ],
    servicePreferences: [
      index % 2 === 0 ? 'Pre-arrival planning' : 'On-property host check-in',
      index % 3 === 0 ? 'Private appointment windows' : 'Rewards app reminders',
    ],
    occasionSignals: [
      index % 2 === 0 ? 'Weekend leisure' : 'Midweek stay',
      index % 3 === 0 ? 'Celebration planning' : 'Return visit prompt',
    ],
  };
}

function stayHistoryFor(profile: GuestProfile, index: number, globalIndex: number): GuestStayHistoryItem[] {
  return Array.from({ length: 3 }, (_, historyIndex) => ({
    id: `${stableDigits(globalIndex)}-stay-${historyIndex + 1}`,
    periodLabel: historyIndex === 0 ? 'Last 30 days' : historyIndex === 1 ? 'Last quarter' : 'Prior half-year',
    property: pick(properties, globalIndex + historyIndex),
    nightsBand: `${1 + ((index + historyIndex) % 3)}-${3 + ((globalIndex + historyIndex) % 4)} nights`,
    roomType: pick(roomTypes, globalIndex + historyIndex),
    occasion: historyIndex === 0 ? profile.travelParty : pick(['Celebration', 'Business trip', 'Short break', 'Family leisure'], index + historyIndex),
    satisfactionSignal: pick(satisfactionSignals, globalIndex + historyIndex),
  }));
}

function purchaseHistoryFor(primary: CoreCategory, index: number, globalIndex: number): GuestPurchaseHistoryItem[] {
  const orderedCategories = [
    primary,
    ...CORE_CATEGORIES.filter((category) => category !== primary),
  ];

  return Array.from({ length: 5 }, (_, historyIndex) => {
    const category = orderedCategories[historyIndex % orderedCategories.length];
    const theme = pick(categoryPurchaseThemes[category], index + historyIndex);

    return {
      id: `${stableDigits(globalIndex)}-purchase-${historyIndex + 1}`,
      periodLabel: historyIndex === 0 ? 'Most recent' : historyIndex === 1 ? 'Last 60 days' : historyIndex === 2 ? 'Last quarter' : historyIndex === 3 ? 'Prior quarter' : 'Earlier signal',
      category,
      merchantArea: theme.merchantArea,
      itemLabel: theme.itemLabel,
      channel: pick(purchaseChannels, globalIndex + historyIndex),
      ticketBand: historyIndex === 0 && primary === 'retailLuxury' ? 'ultra' : historyIndex < 3 ? 'premium' : 'entry',
      galaxyOwned: true,
    };
  });
}
```

- [ ] **Step 2: Populate the new fields in `buildGuest`**

Inside `buildGuest`, after `const primary = primaryOpportunity(categoryCapturePct, categoryWalletIndex);`, add:

```ts
  const profile = profileFor(segment, index, globalIndex);
  const preferences = preferencesFor(segment, primary, index);
  const stayHistory = stayHistoryFor(profile, index, globalIndex);
  const purchaseHistory = purchaseHistoryFor(primary, index, globalIndex);
```

Then add these fields to `baseGuest` after `galaxyTier: tierFor(segment, index),`:

```ts
    profile,
    preferences,
```

Add these fields after the `firstParty` object:

```ts
    stayHistory,
    purchaseHistory,
```

Finally, expand the CDE-safe guard payload near the bottom of `buildGuest`:

```ts
  if (bannedCurrencyPattern.test(JSON.stringify({
    cde: baseGuest.cde,
    englishPitch,
    projectedUpsideBand,
    profile: baseGuest.profile,
    preferences: baseGuest.preferences,
    purchaseHistory: baseGuest.purchaseHistory,
    stayHistory: baseGuest.stayHistory,
    zhPitch,
  }))) {
    throw new Error('Guest data must remain CDE-safe');
  }
```

- [ ] **Step 3: Run the focused guest-data tests**

Run:

```bash
npm run test -- src/data/guests.test.ts
```

Expected: PASS. The new enriched profile test should pass along with the existing six guest-data tests.

- [ ] **Step 4: Run type-aware related tests**

Run:

```bash
npm run test -- src/data/guests.test.ts src/app/guests/[id]/page.test.tsx src/components/panels/guest-profile-header.test.tsx src/components/panels/fusion-panel.test.tsx
```

Expected: PASS. Existing Customer 360 tests should continue to render with the richer `Guest` type.

- [ ] **Step 5: Commit deterministic enriched guest data**

```bash
git add src/data/types.ts src/data/guests.ts src/data/guests.test.ts
git commit -m "Add enriched synthetic guest profiles"
```

Expected: commit succeeds.

---

### Task 3: Add Guest Identity Panel

**Files:**
- Create: `src/components/panels/guest-identity-panel.tsx`
- Create: `src/components/panels/guest-identity-panel.test.tsx`

- [ ] **Step 1: Write the failing identity panel test**

Create `src/components/panels/guest-identity-panel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { GuestIdentityPanel } from './guest-identity-panel';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('GuestIdentityPanel', () => {
  it('renders synthetic customer identity, demographics, and preferences', () => {
    const { container } = render(<GuestIdentityPanel guest={guests[0]} />);

    expect(screen.getByRole('heading', { name: 'Synthetic CRM identity' })).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.displayName)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.displayNameZh)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.ageBand)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.originMarket)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.preferredLanguage)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.hostOwner)).toBeInTheDocument();
    expect(screen.getByText(guests[0].preferences.servicePreferences[0])).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('sanitizes unsafe identity values without leaking direct contact details', () => {
    const malformedGuest = {
      ...guests[0],
      profile: {
        ...guests[0].profile,
        displayName: 'HKD raw name',
        displayNameZh: '澳門幣姓名',
        originMarket: 'Hong Kong',
        hostOwner: 'Host Team A',
        membershipTenureBand: '99999999',
      },
      preferences: {
        favoriteCategories: ['MOP luxury'],
        servicePreferences: ['Call +853 61234567'],
        occasionSignals: ['Email test@example.com'],
      },
    } as unknown as Guest;

    const { container } = render(<GuestIdentityPanel guest={malformedGuest} />);

    expect(screen.getByText('Synthetic guest')).toBeInTheDocument();
    expect(screen.getByText('姓名未顯示')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣|@\w|\+\d{6,}|61234567/i);
  });
});
```

- [ ] **Step 2: Run the panel test to verify it fails**

Run:

```bash
npm run test -- src/components/panels/guest-identity-panel.test.tsx
```

Expected: FAIL because `GuestIdentityPanel` does not exist.

- [ ] **Step 3: Implement `GuestIdentityPanel`**

Create `src/components/panels/guest-identity-panel.tsx`:

```tsx
import type { Guest, GuestConsentStatus } from '@/data';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/gi;
const directContactPattern = /@|\+\d{6,}|(?:\d[\s-]?){8,}/g;
const nonFinitePattern = /NaN|Infinity/gi;

function safeText(value: unknown, fallback: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const cleaned = String(value)
    .replace(bannedCurrencyPattern, '')
    .replace(directContactPattern, '')
    .replace(nonFinitePattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallback;
}

function safeList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;

  const cleaned = value
    .map((item) => safeText(item, ''))
    .filter(Boolean)
    .slice(0, 4);

  return cleaned.length > 0 ? cleaned : fallback;
}

function consentLabel(value: unknown): GuestConsentStatus {
  return value === 'service-only' ? 'service-only' : 'marketable';
}

export function GuestIdentityPanel({ guest }: { guest: Guest }) {
  const profile = guest?.profile;
  const preferences = guest?.preferences;
  const displayName = safeText(profile?.displayName, 'Synthetic guest');
  const displayNameZh = safeText(profile?.displayNameZh, '姓名未顯示');
  const favoriteCategories = safeList(preferences?.favoriteCategories, ['No favorite category signal']);
  const servicePreferences = safeList(preferences?.servicePreferences, ['No service preference signal']);
  const occasionSignals = safeList(preferences?.occasionSignals, ['No occasion signal']);

  return (
    <section className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            First-party profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-galaxy-cream">Synthetic CRM identity</h2>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">
            Demo-only synthetic identity linked to the masked member ID. No real PII is shown.
          </p>
        </div>
        <span className="rounded border border-galaxy-gold/35 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold text-galaxy-gold">
          Synthetic
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="text-sm font-semibold text-galaxy-cream">{displayName}</p>
          <p className="mt-1 text-sm text-galaxy-muted">{displayNameZh}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-galaxy-muted">Age band</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.ageBand, 'Unknown')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Origin market</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.originMarket, 'Unknown')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Travel party</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.travelParty, 'Unknown')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Language</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.preferredLanguage, 'Unknown')}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-galaxy-muted">Host owner</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.hostOwner, 'Host Team')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Contactability</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.contactability, 'Service channel')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Consent</dt>
              <dd className="font-semibold text-galaxy-cream">{consentLabel(profile?.consentStatus)}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Tenure</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.membershipTenureBand, 'Unknown')}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="font-semibold text-galaxy-gold">Favorite signals</p>
          <ul className="mt-3 space-y-2 text-galaxy-muted">
            {favoriteCategories.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="font-semibold text-galaxy-gold">Service preferences</p>
          <ul className="mt-3 space-y-2 text-galaxy-muted">
            {servicePreferences.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="font-semibold text-galaxy-gold">Occasion signals</p>
          <ul className="mt-3 space-y-2 text-galaxy-muted">
            {occasionSignals.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the identity panel test**

Run:

```bash
npm run test -- src/components/panels/guest-identity-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the identity panel**

```bash
git add src/components/panels/guest-identity-panel.tsx src/components/panels/guest-identity-panel.test.tsx
git commit -m "Add Customer 360 identity panel"
```

Expected: commit succeeds.

---

### Task 4: Add Purchase And Stay History Panel

**Files:**
- Create: `src/components/panels/purchase-history-panel.tsx`
- Create: `src/components/panels/purchase-history-panel.test.tsx`

- [ ] **Step 1: Write the failing purchase history panel test**

Create `src/components/panels/purchase-history-panel.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { PurchaseHistoryPanel } from './purchase-history-panel';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('PurchaseHistoryPanel', () => {
  it('renders Galaxy-owned stay and purchase history without currency', () => {
    const { container } = render(<PurchaseHistoryPanel guest={guests[0]} />);

    expect(screen.getByRole('heading', { name: 'Galaxy purchase and stay history' })).toBeInTheDocument();
    expect(screen.getByText('Stay history')).toBeInTheDocument();
    expect(screen.getByText('Purchase history')).toBeInTheDocument();
    expect(screen.getAllByText('Galaxy first-party').length).toBeGreaterThan(0);

    const purchaseList = screen.getByRole('list', { name: 'Purchase history' });
    expect(within(purchaseList).getAllByRole('listitem')).toHaveLength(5);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('renders finite empty states for malformed history arrays', () => {
    const malformedGuest = {
      ...guests[0],
      stayHistory: [],
      purchaseHistory: [
        {
          id: 'bad',
          periodLabel: 'HKD now',
          category: 'fnb',
          merchantArea: 'MOP area',
          itemLabel: '$ item',
          channel: 'Host',
          ticketBand: 'premium',
          galaxyOwned: true,
        },
      ],
    } as unknown as Guest;

    const { container } = render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(screen.getByText('No stay history available')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣|NaN|Infinity/i);
  });
});
```

- [ ] **Step 2: Run the panel test to verify it fails**

Run:

```bash
npm run test -- src/components/panels/purchase-history-panel.test.tsx
```

Expected: FAIL because `PurchaseHistoryPanel` does not exist.

- [ ] **Step 3: Implement `PurchaseHistoryPanel`**

Create `src/components/panels/purchase-history-panel.tsx`:

```tsx
import type { CoreCategory, Guest, GuestPurchaseHistoryItem, GuestStayHistoryItem } from '@/data';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/gi;
const nonFinitePattern = /NaN|Infinity/gi;

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

function safeText(value: unknown, fallback: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const cleaned = String(value)
    .replace(bannedCurrencyPattern, '')
    .replace(nonFinitePattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallback;
}

function safeStays(value: unknown): GuestStayHistoryItem[] {
  return Array.isArray(value) ? value.filter(Boolean).slice(0, 3) as GuestStayHistoryItem[] : [];
}

function safePurchases(value: unknown): GuestPurchaseHistoryItem[] {
  return Array.isArray(value) ? value.filter(Boolean).slice(0, 5) as GuestPurchaseHistoryItem[] : [];
}

function categoryLabel(value: unknown) {
  return value === 'hospitality' || value === 'fnb' || value === 'entertainment' || value === 'retailLuxury'
    ? categoryLabels[value]
    : 'Category signal';
}

export function PurchaseHistoryPanel({ guest }: { guest: Guest }) {
  const stayHistory = safeStays(guest?.stayHistory);
  const purchaseHistory = safePurchases(guest?.purchaseHistory);

  return (
    <section className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            First-party history
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-galaxy-cream">
            Galaxy purchase and stay history
          </h2>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">
            Internal Galaxy history is shown as categories, bands, service signals, and dates without exact spend.
          </p>
        </div>
        <span className="rounded border border-galaxy-border px-2 py-1 text-xs font-semibold text-galaxy-muted">
          Galaxy first-party
        </span>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Stay history</h3>
          {stayHistory.length > 0 ? (
            <ol className="mt-3 space-y-3" aria-label="Stay history">
              {stayHistory.map((stay) => (
                <li key={safeText(stay.id, safeText(stay.periodLabel, 'stay'))} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3 text-sm">
                  <p className="font-semibold text-galaxy-cream">{safeText(stay.periodLabel, 'Stay period')}</p>
                  <p className="mt-1 text-galaxy-muted">{safeText(stay.property, 'Galaxy property')}</p>
                  <p className="mt-2 text-galaxy-muted">
                    {safeText(stay.roomType, 'Room')} · {safeText(stay.nightsBand, 'Banded nights')} · {safeText(stay.occasion, 'Occasion')}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-galaxy-gold">{safeText(stay.satisfactionSignal, 'Service signal')}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3 text-sm text-galaxy-muted">
              No stay history available
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Purchase history</h3>
          {purchaseHistory.length > 0 ? (
            <ul className="mt-3 grid gap-3 lg:grid-cols-2" aria-label="Purchase history">
              {purchaseHistory.map((purchase) => (
                <li key={safeText(purchase.id, safeText(purchase.periodLabel, 'purchase'))} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-galaxy-cream">{safeText(purchase.itemLabel, 'Purchase signal')}</p>
                    <span className="rounded border border-galaxy-border px-2 py-0.5 text-xs text-galaxy-muted">
                      {safeText(purchase.ticketBand, 'band')}
                    </span>
                  </div>
                  <p className="mt-1 text-galaxy-muted">{safeText(purchase.periodLabel, 'History period')}</p>
                  <p className="mt-2 text-galaxy-muted">
                    {categoryLabel(purchase.category)} · {safeText(purchase.merchantArea, 'Galaxy area')}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-galaxy-gold">{safeText(purchase.channel, 'Galaxy channel')}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3 text-sm text-galaxy-muted">
              No purchase history available
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the purchase history panel test**

Run:

```bash
npm run test -- src/components/panels/purchase-history-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the history panel**

```bash
git add src/components/panels/purchase-history-panel.tsx src/components/panels/purchase-history-panel.test.tsx
git commit -m "Add Customer 360 purchase history panel"
```

Expected: commit succeeds.

---

### Task 5: Integrate Enriched Panels Into Customer 360

**Files:**
- Modify: `src/app/guests/[id]/page.tsx`
- Modify: `src/app/guests/[id]/page.test.tsx`

- [ ] **Step 1: Write failing route assertions**

In `src/app/guests/[id]/page.test.tsx`, inside the `"renders Customer 360 fusion, recommendations, and bilingual pitch from an encoded id"` test, add these assertions after the existing Customer 360 heading assertion:

```tsx
    expect(screen.getByRole('heading', { name: 'Synthetic CRM identity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Galaxy purchase and stay history' })).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.displayName)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.originMarket)).toBeInTheDocument();
```

- [ ] **Step 2: Run the route test to verify it fails**

Run:

```bash
npm run test -- src/app/guests/[id]/page.test.tsx
```

Expected: FAIL because the new panel headings are not rendered by the route.

- [ ] **Step 3: Import and render the enriched panels**

In `src/app/guests/[id]/page.tsx`, add these imports:

```tsx
import { GuestIdentityPanel } from '@/components/panels/guest-identity-panel';
import { PurchaseHistoryPanel } from '@/components/panels/purchase-history-panel';
```

Then update the successful route return block to this structure:

```tsx
  return (
    <div className="space-y-6 text-galaxy-cream">
      <GuestProfileHeader guest={guest} />
      <GuestIdentityPanel guest={guest} />
      <FusionPanel guest={guest} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-galaxy-cream">Next-Best-Action</h2>
          {guest.nextBestActions.map((rec) => (
            <NbaRecommendationCard key={rec.offer} rec={rec} />
          ))}
          <PitchScriptCard guest={guest} />
          <PurchaseHistoryPanel guest={guest} />
          <GuestTimeline guest={guest} />
        </div>
        <WalletOrbit guest={guest} />
      </div>
    </div>
  );
```

- [ ] **Step 4: Run the Customer 360 route test**

Run:

```bash
npm run test -- src/app/guests/[id]/page.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run the related panel and route tests**

Run:

```bash
npm run test -- src/app/guests/[id]/page.test.tsx src/components/panels/guest-identity-panel.test.tsx src/components/panels/purchase-history-panel.test.tsx src/components/panels/fusion-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the route integration**

```bash
git add src/app/guests/[id]/page.tsx src/app/guests/[id]/page.test.tsx
git commit -m "Enrich Customer 360 profile view"
```

Expected: commit succeeds.

---

### Task 6: Add Browser Acceptance Coverage And Demo Script

**Files:**
- Modify: `e2e/compliance.spec.ts`
- Modify: `README.md`

- [ ] **Step 1: Add failing e2e assertions for enriched Customer 360**

In `e2e/compliance.spec.ts`, inside the `if (route.startsWith('/guests/')) { ... }` block, add:

```ts
        await expect(page.getByRole('heading', { name: /Synthetic CRM identity/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Galaxy purchase and stay history/i })).toBeVisible();
        await expect(page.getByText(/Demo-only synthetic identity/i)).toBeVisible();
        await expect(page.getByText(/Galaxy first-party/i)).toBeVisible();
```

In the `Customer 360 routes remain CDE-safe and responsive on ${viewport.label}` test, after the methodology assertion, add:

```ts
        if (route.startsWith('/guests/')) {
          await expect(page.getByRole('heading', { name: /Synthetic CRM identity/i })).toBeVisible();
          await expect(page.getByRole('heading', { name: /Galaxy purchase and stay history/i })).toBeVisible();
        }
```

- [ ] **Step 2: Run the focused e2e test**

Run:

```bash
npm run test:e2e -- e2e/compliance.spec.ts --project=chromium --grep "MEM-••••3421"
```

Expected: PASS after Task 5. If it fails, the failure should point to a missing heading or text in `/guests/MEM-••••3421`.

- [ ] **Step 3: Add README demo-script line**

In `README.md`, under `## V2 Demo Script`, add this new line after the current Customer 360 line:

```md
4. Enriched 360: "The name, demographic band, preferences, stay history and purchase history are synthetic Galaxy first-party demo fields. Mastercard CDE remains separate as indices, percentages and bands."
```

Renumber the following V2 script lines so the sequence remains ordered.

- [ ] **Step 4: Run docs and e2e checks**

Run:

```bash
npm run test:e2e -- e2e/compliance.spec.ts --project=chromium
```

Expected: PASS with all Chromium compliance tests passing.

- [ ] **Step 5: Commit browser coverage and README**

```bash
git add e2e/compliance.spec.ts README.md
git commit -m "Document enriched Customer 360 demo flow"
```

Expected: commit succeeds.

---

### Task 7: Final Verification And Review

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run verify
```

Expected: PASS for lint, unit tests, production build, and Playwright e2e.

- [ ] **Step 2: Check CDE and PII guardrails with search**

Run:

```bash
rg -n "HKD|MOP|\\$|元|澳門幣|@|\\+\\d{6,}|(?:\\d[\\s-]?){8,}" src/app/guests src/components/panels/guest-identity-panel.tsx src/components/panels/purchase-history-panel.tsx src/data/guests.ts
```

Expected: only sanitizer regex definitions or intentional test fixture strings should appear. No production render string should expose currency, email, phone, or long direct-contact digits.

- [ ] **Step 3: Request code review**

Use the `superpowers:requesting-code-review` skill with this review brief:

```md
Review the Customer 360 enriched profile changes. Focus on synthetic PII boundaries, CDE/currency compliance, deterministic guest data generation, Customer 360 responsive layout, and whether the route clearly separates Galaxy first-party identity/history from Mastercard CDE enrichment.
```

Expected: reviewer reports no Critical issues. Fix Important issues before merge.

- [ ] **Step 4: Final commit if review fixes were needed**

If review fixes changed files, run:

```bash
git add src/data/types.ts src/data/guests.ts src/data/guests.test.ts src/components/panels/guest-identity-panel.tsx src/components/panels/guest-identity-panel.test.tsx src/components/panels/purchase-history-panel.tsx src/components/panels/purchase-history-panel.test.tsx src/app/guests/[id]/page.tsx src/app/guests/[id]/page.test.tsx e2e/compliance.spec.ts README.md
git commit -m "Polish enriched Customer 360 profile"
```

Expected: commit succeeds if review fixes were made. If no review fixes were made, `git status -sb` should show no tracked changes.

---

## Self-Review

Spec coverage:
- Customer name: Task 1 defines `displayName` and `displayNameZh`; Task 2 generates synthetic names; Task 3 renders them.
- Demographic fields: Task 1 defines age band, origin market, language, travel party, host ownership, consent, contactability, tenure, and home property; Task 3 renders them.
- Purchase history: Task 1 defines `GuestPurchaseHistoryItem`; Task 2 generates five records per guest; Task 4 renders them; Task 6 checks browser rendering.
- Stay history and preferences: Task 1 defines stay and preference fields; Task 2 generates them; Tasks 3 and 4 render them.
- Compliance: Tasks 1, 2, 3, 4, 6, and 7 include banned currency and direct-contact checks.
- No backend/live AI: no task adds network calls, API routes, environment variables, or runtime LLM dependencies.

Placeholder scan:
- Placeholder scan passed; all helper names and component responsibilities are defined in the task steps.
- Each code-editing step includes exact code blocks or exact insertion text.

Type consistency:
- `GuestProfile`, `GuestPreferences`, `GuestStayHistoryItem`, and `GuestPurchaseHistoryItem` are defined in Task 1 and used consistently in Tasks 2-6.
- `GuestPurchaseChannel`, `GuestPreferredLanguage`, and `GuestConsentStatus` are defined before use.
- The route imports match the exact component filenames created in Tasks 3 and 4.
