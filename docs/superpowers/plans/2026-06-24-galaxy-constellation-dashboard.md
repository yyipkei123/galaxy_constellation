# Galaxy Constellation Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable Galaxy Macau x Mastercard CDE guest wallet intelligence dashboard that turns synthetic first-party and enriched wallet data into share-of-wallet, leakage, propensity, and activation views.

**Architecture:** This is a greenfield Next.js App Router app with no backend: deterministic synthetic data is generated at module import, client state is held in a lightweight React context, and every route renders from the same typed CDE data contract. Compliance is enforced in `src/lib/format.ts`, covered by unit tests, and checked again with rendered Playwright tests so CDE-derived values never appear as raw customer-level currency.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4 CSS-first tokens, Recharts, Framer Motion, lucide-react, Vitest, Testing Library, Playwright.

---

## Scope Check

The spec describes one coherent dashboard product with seven routes. It does not need to be split into separate plans because the data contract, shell, and compliance guardrails are shared across every screen. The stretch `/marketscan` route is included as a final route task because it is synthetic, isolated, and testable without adding a backend.

## Source Spec

Use `spec/Galaxy_Constellation_Dashboard_BUILD_SPEC.md` as the requirements source. Treat the following as non-negotiable:

- CDE-enriched and off-property wallet figures render only as percentages, bands with `equiv.`, or indices.
- Galaxy offer mechanics may show `MOP` values only in activation offer terms.
- The UI must expose matched coverage, demi-decile basis, quarterly refresh, and `7 active CDE metrics`.
- F&B can split only into `bars/clubs` and `full-service restaurants`.
- Retail can split only into `Luxury` plus `Other`.
- Gaming is optional first-party context only, not a leakage category and not a targeting basis.
- No real Galaxy or Mastercard image logo files are used.

## File Structure

Create this structure under `/Users/keyip/Documents/Code/galaxy_constellation`:

```text
.
├─ docs/superpowers/plans/2026-06-24-galaxy-constellation-dashboard.md
├─ e2e/compliance.spec.ts
├─ package.json
├─ playwright.config.ts
├─ postcss.config.mjs
├─ src/
│  ├─ app/
│  │  ├─ activation/page.tsx
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ leakage/page.tsx
│  │  ├─ marketscan/page.tsx
│  │  ├─ page.tsx
│  │  ├─ propensity/page.tsx
│  │  ├─ providers.tsx
│  │  ├─ segments/page.tsx
│  │  └─ wallet/page.tsx
│  ├─ components/
│  │  ├─ charts/
│  │  │  ├─ category-stacked-bar.tsx
│  │  │  ├─ channel-donut.tsx
│  │  │  ├─ leakage-flow.tsx
│  │  │  ├─ propensity-gauge.tsx
│  │  │  ├─ sow-sov-scatter.tsx
│  │  │  ├─ spend-radar.tsx
│  │  │  └─ wallet-gauge.tsx
│  │  ├─ panels/
│  │  │  ├─ audience-builder.tsx
│  │  │  ├─ cde-metric-panel.tsx
│  │  │  ├─ crm-append-table.tsx
│  │  │  ├─ nba-card.tsx
│  │  │  └─ segment-card.tsx
│  │  ├─ shell/
│  │  │  ├─ app-shell.tsx
│  │  │  ├─ co-brand-lockup.tsx
│  │  │  ├─ nav.tsx
│  │  │  └─ top-bar.tsx
│  │  └─ ui/
│  │     ├─ cde-chip.tsx
│  │     ├─ formatted-values.tsx
│  │     ├─ kpi-card.tsx
│  │     ├─ methodology-note.tsx
│  │     ├─ overline.tsx
│  │     └─ panel.tsx
│  ├─ data/
│  │  ├─ generate.ts
│  │  ├─ index.ts
│  │  └─ types.ts
│  ├─ lib/
│  │  ├─ format.ts
│  │  ├─ palette.ts
│  │  └─ rng.ts
│  ├─ store/app-store.tsx
│  └─ test/setup.ts
├─ tsconfig.json
├─ vitest.config.ts
└─ README.md
```

Responsibilities:

- `src/data/types.ts`: canonical CDE, segment, quarter, audience, offer, and CRM row types.
- `src/data/generate.ts`: deterministic seeded data for 6 segments x 4 trailing quarters, methodology, CRM rows, market scan tiles, and recommended plays.
- `src/lib/format.ts`: only legal CDE formatters plus a separate Galaxy offer formatter.
- `src/store/app-store.tsx`: selected quarter, selected segment, audience filters, saved audiences, and campaign toast state.
- `src/components/ui/*`: small reusable visual primitives.
- `src/components/charts/*`: Recharts and SVG chart wrappers that receive already formatted data.
- `src/components/panels/*`: route-level repeated panels for segments, CRM rows, NBA cards, and audience building.
- `src/components/shell/*`: left nav, top bar, lockup, shell frame, and methodology footer.
- `src/app/*/page.tsx`: route composition only; keep business calculations in data/store helpers.
- `e2e/compliance.spec.ts`: rendered route checks for methodology, CDE tags, and banned raw currency patterns.

---

### Task 1: Scaffold The Next.js Workspace

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Test: `src/app/page.test.tsx`

- [ ] **Step 1: Write the scaffold files and smoke test**

Create `package.json`:

```json
{
  "name": "galaxy-constellation",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "verify": "npm run test && npm run build && npm run test:e2e"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.0.0",
    "jsdom": "^25.0.1",
    "playwright": "^1.49.1",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

Create `.gitignore`:

```gitignore
.DS_Store
.next/
node_modules/
coverage/
test-results/
playwright-report/
*.log
.env
.env.*
!.env.example
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next-env.d.ts`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

Create `next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
```

Create `src/app/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('home route smoke test', () => {
  it('renders the Galaxy Constellation entry point', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /Galaxy Constellation/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and the install exits with code 0.

- [ ] **Step 3: Run the smoke test to verify it fails before the app exists**

Run:

```bash
npm run test -- src/app/page.test.tsx
```

Expected: FAIL with an import error for `./page`.

- [ ] **Step 4: Add the minimal app shell that satisfies the smoke test**

Create `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-galaxy-ink: #0b0b0e;
  --color-galaxy-charcoal: #15151b;
  --color-galaxy-slate: #1f1f27;
  --color-galaxy-border: #2c2c36;
  --color-galaxy-gold: #c9a45c;
  --color-galaxy-gold-lite: #e4c988;
  --color-galaxy-gold-deep: #a8823e;
  --color-galaxy-cream: #f4ebd9;
  --color-galaxy-muted: #9a9486;
  --color-galaxy-capture: #c9a45c;
  --color-galaxy-leak: #b5543f;
  --color-galaxy-market: #4a4a57;
  --color-galaxy-positive: #6fa98c;
}

:root {
  color-scheme: dark;
  background: #0b0b0e;
}

body {
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(201, 164, 92, 0.18), transparent 32rem),
    linear-gradient(135deg, #0b0b0e 0%, #15151b 58%, #0b0b0e 100%);
  color: #f4ebd9;
}

* {
  box-sizing: border-box;
}
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Galaxy Constellation',
  description: 'Guest Wallet Intelligence enriched by Mastercard CDE',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen px-8 py-10 text-galaxy-cream">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-galaxy-gold">
        客戶錢包洞察 · Guest Wallet Intelligence
      </p>
      <h1 className="mt-5 font-serif text-6xl text-galaxy-cream">Galaxy Constellation</h1>
      <p className="mt-4 max-w-2xl text-lg text-galaxy-muted">
        Enriched by Mastercard CDE, built for Galaxy Macau commercial leadership.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Verify scaffold passes**

Run:

```bash
npm run test -- src/app/page.test.tsx
npm run build
```

Expected: PASS for the smoke test and a successful Next production build.

- [ ] **Step 6: Initialize git and commit the scaffold**

Run:

```bash
git init -b main
git add .gitignore next-env.d.ts next.config.ts package.json package-lock.json playwright.config.ts postcss.config.mjs src/app/globals.css src/app/layout.tsx src/app/page.test.tsx src/app/page.tsx src/test/setup.ts tsconfig.json vitest.config.ts
git commit -m "chore: scaffold galaxy constellation app"
```

Expected: one initial commit is created on `main`.

---

### Task 2: CDE Data Contract, Seeded Generator, And Format Guardrail

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/generate.ts`
- Create: `src/data/index.ts`
- Create: `src/lib/rng.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/palette.ts`
- Test: `src/lib/format.test.ts`
- Test: `src/data/generate.test.ts`

- [ ] **Step 1: Write failing formatter and data tests**

Create `src/lib/format.test.ts`:

```ts
import { formatEnriched, formatOfferMoney } from './format';

describe('formatEnriched', () => {
  it('formats legal CDE percentages, indices, and bands', () => {
    expect(formatEnriched(63, 'pct')).toBe('63%');
    expect(formatEnriched(176, 'index')).toBe('Index 176');
    expect(formatEnriched('8-12k equiv./mo', 'band')).toBe('8-12k equiv./mo');
  });

  it('rejects CDE bands that look like exact money values', () => {
    expect(() => formatEnriched('MOP 9000', 'band')).toThrow(/CDE bands must not include currency/);
    expect(() => formatEnriched('$9000', 'band')).toThrow(/CDE bands must not include currency/);
    expect(() => formatEnriched('9000', 'band')).toThrow(/equiv/);
  });

  it('keeps Galaxy offer mechanics in a separate formatter', () => {
    expect(formatOfferMoney(200)).toBe('MOP 200');
  });
});
```

Create `src/data/generate.test.ts`:

```ts
import { CORE_CATEGORIES, quarters, segmentsByQuarter, methodology, crmRows } from './index';

describe('synthetic CDE data', () => {
  it('generates four trailing quarters with six segments each', () => {
    expect(quarters).toHaveLength(4);
    for (const quarter of quarters) {
      expect(segmentsByQuarter[quarter.id]).toHaveLength(6);
    }
  });

  it('keeps CDE category share invariant at 100', () => {
    for (const quarter of quarters) {
      for (const segment of segmentsByQuarter[quarter.id]) {
        for (const category of CORE_CATEGORIES) {
          const wallet = segment.categories[category];
          expect(wallet.capturedSharePct + wallet.leakagePct).toBe(100);
        }
      }
    }
  });

  it('derives share of wallet from hospitality capture', () => {
    for (const quarter of quarters) {
      for (const segment of segmentsByQuarter[quarter.id]) {
        expect(segment.metrics.shareOfWallet).toBe(segment.categories.hospitality.capturedSharePct);
      }
    }
  });

  it('normalizes opportunity index around market base 100', () => {
    const latest = segmentsByQuarter[quarters.at(-1)!.id];
    const mean = latest.reduce((sum, segment) => sum + segment.opportunityIndex, 0) / latest.length;
    expect(mean).toBeGreaterThanOrEqual(98);
    expect(mean).toBeLessThanOrEqual(102);
  });

  it('exposes the CDE product framing and masked CRM rows', () => {
    expect(methodology).toMatchObject({
      matchedCoveragePct: 63,
      basis: 'demi-decile average',
      refresh: 'quarterly',
      activeMetricCount: 7,
    });
    expect(crmRows).toHaveLength(10);
    expect(crmRows[0].customerId).toMatch(/^MEM-/);
    expect(crmRows[0].competitorSpendBand).toContain('equiv./mo');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -- src/lib/format.test.ts src/data/generate.test.ts
```

Expected: FAIL with module resolution errors for `src/lib/format.ts` and `src/data/index.ts`.

- [ ] **Step 3: Add formatter, palette, RNG, types, and generated data**

Create `src/lib/format.ts`:

```ts
export type EnrichedFormatKind = 'pct' | 'index' | 'band';

const currencyPattern = /(MOP|HKD|\$|元|澳門幣)/i;

export function formatEnriched(value: number | string, kind: EnrichedFormatKind): string {
  if (kind === 'pct') {
    if (typeof value !== 'number') throw new Error('CDE percentage values must be numeric');
    return `${Math.round(value)}%`;
  }

  if (kind === 'index') {
    if (typeof value !== 'number') throw new Error('CDE index values must be numeric');
    return `Index ${Math.round(value)}`;
  }

  if (typeof value !== 'string') throw new Error('CDE bands must be strings');
  if (currencyPattern.test(value)) throw new Error('CDE bands must not include currency symbols or codes');
  if (!value.includes('equiv.')) throw new Error('CDE bands must include equiv. to mark modelled ranges');
  return value;
}

export function formatPropensity(value: number): string {
  return value.toFixed(2);
}

export function formatOfferMoney(value: number): string {
  return `MOP ${Math.round(value).toLocaleString('en-US')}`;
}

export function formatGuestBand(low: number, high: number): string {
  return `~${low}-${high}k matched guests`;
}
```

Create `src/lib/rng.ts`:

```ts
export function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function jitter(value: number, random: () => number, spread: number, min = 0, max = 999) {
  return Math.round(clamp(value + (random() - 0.5) * spread, min, max));
}
```

Create `src/lib/palette.ts`:

```ts
export const galaxyPalette = {
  ink: '#0B0B0E',
  charcoal: '#15151B',
  slate: '#1F1F27',
  border: '#2C2C36',
  gold: '#C9A45C',
  goldLite: '#E4C988',
  goldDeep: '#A8823E',
  cream: '#F4EBD9',
  muted: '#9A9486',
  capture: '#C9A45C',
  leak: '#B5543F',
  market: '#4A4A57',
  positive: '#6FA98C',
} as const;
```

Create `src/data/types.ts`:

```ts
export type CoreCategory = 'hospitality' | 'fnb' | 'entertainment' | 'retailLuxury';
export type CategoryKey = CoreCategory | 'gaming' | 'crossPropertyCash';
export type ColorToken = 'gold' | 'positive' | 'leak' | 'market' | 'goldLite' | 'goldDeep';

export interface CategoryWallet {
  capturedSharePct: number;
  leakagePct: number;
  totalWalletIndex: number;
  sub?: Record<string, number>;
}

export interface CdeMetrics {
  shareOfWallet: number;
  shareOfVisits: number;
  avgTxnCountIndex: number;
  avgTxnSizeIndex: number;
  avgIndustrySpendIndex: number;
  channelShareOnlinePct: number;
  channelVisitsIndex: number;
}

export interface Propensities {
  luxuryHotelSpender: number;
  topTierRewards: number;
  coBrandLookAlike: number;
}

export interface RecommendedPlay {
  title: string;
  lever: string;
  rationale: string;
  offerTerm?: string;
  channel: 'Online' | 'Physical' | 'Hybrid';
}

export interface Segment {
  id: string;
  name: string;
  nameZh: string;
  colorToken: ColorToken;
  sizeBand: string;
  sizeLowK: number;
  sizeHighK: number;
  signatureTrait: string;
  metrics: CdeMetrics;
  propensities: Propensities;
  categories: Record<CoreCategory, CategoryWallet>;
  gamingContextIndex?: number;
  crossPropertyCashIndex: number;
  crossPropertyCashBand: string;
  opportunityIndex: number;
  recommendedPlays: RecommendedPlay[];
}

export interface Quarter {
  id: string;
  label: string;
  isCurrent: boolean;
}

export interface Methodology {
  matchedCoveragePct: number;
  basis: 'demi-decile average';
  refresh: 'quarterly';
  activeMetricCount: 7;
}

export interface CrmRow {
  customerId: string;
  segmentId: string;
  categorySharePct: number;
  competitorSpendBand: string;
  luxuryRetailIndex: number;
  propensityScore: number;
}

export interface MarketScanTile {
  title: string;
  sourceType: 'competitor calendar' | 'social sentiment' | 'PR/news' | 'share of voice' | 'footfall signal';
  signal: string;
  implication: string;
}
```

Create `src/data/generate.ts`:

```ts
import { clamp, jitter, mulberry32 } from '@/lib/rng';
import type { CoreCategory, CrmRow, MarketScanTile, Methodology, Quarter, Segment } from './types';

export const CORE_CATEGORIES: CoreCategory[] = ['hospitality', 'fnb', 'entertainment', 'retailLuxury'];

const WEIGHTS: Record<CoreCategory, number> = {
  hospitality: 0.35,
  retailLuxury: 0.3,
  fnb: 0.25,
  entertainment: 0.1,
};

const baseSegments: Omit<Segment, 'opportunityIndex'>[] = [
  {
    id: 'diamond-high-rollers',
    name: 'Diamond High-Rollers',
    nameZh: '鑽石貴賓',
    colorToken: 'gold',
    sizeBand: '4-7k',
    sizeLowK: 4,
    sizeHighK: 7,
    signatureTrait: 'Ultra-luxury stays; luxury-retail wallet leaks off-property',
    metrics: { shareOfWallet: 28, shareOfVisits: 41, avgTxnCountIndex: 132, avgTxnSizeIndex: 187, avgIndustrySpendIndex: 168, channelShareOnlinePct: 38, channelVisitsIndex: 121 },
    propensities: { luxuryHotelSpender: 0.91, topTierRewards: 0.88, coBrandLookAlike: 0.93 },
    categories: {
      hospitality: { capturedSharePct: 28, leakagePct: 72, totalWalletIndex: 190 },
      fnb: { capturedSharePct: 34, leakagePct: 66, totalWalletIndex: 150, sub: { bars: 120, fullService: 170 } },
      entertainment: { capturedSharePct: 22, leakagePct: 78, totalWalletIndex: 130 },
      retailLuxury: { capturedSharePct: 12, leakagePct: 88, totalWalletIndex: 215, sub: { luxury: 230, other: 120 } },
    },
    crossPropertyCashIndex: 210,
    crossPropertyCashBand: '9-13k equiv./mo',
    gamingContextIndex: 175,
    recommendedPlays: [
      { title: 'Promenade luxury privilege', lever: 'Galaxy Promenade', rationale: 'Retail-luxury leakage and co-brand look-alike are both elevated.', channel: 'Hybrid' },
      { title: 'Suite upgrade with host follow-up', lever: 'Hotel CRM', rationale: 'Hospitality wallet is large, but captured share remains below headroom.', channel: 'Physical' },
    ],
  },
  {
    id: 'cosmopolitan-connoisseurs',
    name: 'Cosmopolitan Connoisseurs',
    nameZh: '都會鑑賞家',
    colorToken: 'goldLite',
    sizeBand: '9-14k',
    sizeLowK: 9,
    sizeHighK: 14,
    signatureTrait: 'Affluent couples with fine-dining and luxury retail leakage',
    metrics: { shareOfWallet: 31, shareOfVisits: 36, avgTxnCountIndex: 124, avgTxnSizeIndex: 142, avgIndustrySpendIndex: 151, channelShareOnlinePct: 61, channelVisitsIndex: 136 },
    propensities: { luxuryHotelSpender: 0.78, topTierRewards: 0.74, coBrandLookAlike: 0.7 },
    categories: {
      hospitality: { capturedSharePct: 31, leakagePct: 69, totalWalletIndex: 150 },
      fnb: { capturedSharePct: 26, leakagePct: 74, totalWalletIndex: 178, sub: { bars: 132, fullService: 184 } },
      entertainment: { capturedSharePct: 34, leakagePct: 66, totalWalletIndex: 122 },
      retailLuxury: { capturedSharePct: 24, leakagePct: 76, totalWalletIndex: 170, sub: { luxury: 184, other: 118 } },
    },
    crossPropertyCashIndex: 154,
    crossPropertyCashBand: '6-9k equiv./mo',
    recommendedPlays: [
      { title: "Chef's-table dining privilege", lever: 'Galaxy F&B', rationale: 'Full-service dining index is high while F&B capture lags.', offerTerm: 'MOP 200 rebate on MOP 500 spend', channel: 'Online' },
      { title: 'Rewards multiplier for fine dining', lever: 'Galaxy Rewards', rationale: 'High online channel share supports app-led retargeting.', channel: 'Online' },
    ],
  },
  {
    id: 'gba-cross-border-explorers',
    name: 'GBA Cross-Border Explorers',
    nameZh: '大灣區跨境客',
    colorToken: 'positive',
    sizeBand: '15-22k',
    sizeLowK: 15,
    sizeHighK: 22,
    signatureTrait: 'Short-stay GBA visitors with cross-property cash and entertainment curiosity',
    metrics: { shareOfWallet: 22, shareOfVisits: 29, avgTxnCountIndex: 118, avgTxnSizeIndex: 104, avgIndustrySpendIndex: 132, channelShareOnlinePct: 57, channelVisitsIndex: 128 },
    propensities: { luxuryHotelSpender: 0.56, topTierRewards: 0.68, coBrandLookAlike: 0.82 },
    categories: {
      hospitality: { capturedSharePct: 22, leakagePct: 78, totalWalletIndex: 132 },
      fnb: { capturedSharePct: 33, leakagePct: 67, totalWalletIndex: 126, sub: { bars: 118, fullService: 124 } },
      entertainment: { capturedSharePct: 27, leakagePct: 73, totalWalletIndex: 148 },
      retailLuxury: { capturedSharePct: 18, leakagePct: 82, totalWalletIndex: 128, sub: { luxury: 142, other: 112 } },
    },
    crossPropertyCashIndex: 188,
    crossPropertyCashBand: '5-8k equiv./mo',
    recommendedPlays: [
      { title: 'ICBC co-brand acquisition journey', lever: 'Co-brand card', rationale: 'Look-alike score and cross-border cash signal are high.', channel: 'Hybrid' },
      { title: 'Galaxy Arena presale bundle', lever: 'Entertainment', rationale: 'Entertainment leakage remains addressable around event-led trips.', channel: 'Online' },
    ],
  },
  {
    id: 'family-leisure-seekers',
    name: 'Family Leisure Seekers',
    nameZh: '親子度假客',
    colorToken: 'market',
    sizeBand: '12-18k',
    sizeLowK: 12,
    sizeHighK: 18,
    signatureTrait: 'Grand Resort Deck families with casual F&B and entertainment opportunity',
    metrics: { shareOfWallet: 42, shareOfVisits: 48, avgTxnCountIndex: 108, avgTxnSizeIndex: 92, avgIndustrySpendIndex: 116, channelShareOnlinePct: 49, channelVisitsIndex: 111 },
    propensities: { luxuryHotelSpender: 0.44, topTierRewards: 0.58, coBrandLookAlike: 0.52 },
    categories: {
      hospitality: { capturedSharePct: 42, leakagePct: 58, totalWalletIndex: 118 },
      fnb: { capturedSharePct: 45, leakagePct: 55, totalWalletIndex: 116, sub: { bars: 74, fullService: 108 } },
      entertainment: { capturedSharePct: 31, leakagePct: 69, totalWalletIndex: 138 },
      retailLuxury: { capturedSharePct: 29, leakagePct: 71, totalWalletIndex: 94, sub: { luxury: 88, other: 106 } },
    },
    crossPropertyCashIndex: 104,
    crossPropertyCashBand: '3-5k equiv./mo',
    gamingContextIndex: 64,
    recommendedPlays: [
      { title: 'Grand Resort Deck family bundle', lever: 'Family leisure', rationale: 'Entertainment and F&B leakage can be pulled into resort-day itineraries.', channel: 'Hybrid' },
      { title: 'Casual-dining rebate', lever: 'Galaxy F&B', rationale: 'Families show high visit share but still leak casual dining spend.', offerTerm: 'MOP 100 rebate on MOP 300 spend', channel: 'Online' },
    ],
  },
  {
    id: 'mice-business-guests',
    name: 'MICE & Business Guests',
    nameZh: '商務會展客',
    colorToken: 'goldDeep',
    sizeBand: '7-11k',
    sizeLowK: 7,
    sizeHighK: 11,
    signatureTrait: 'GICC-led weekday guests with physical channel and business dining needs',
    metrics: { shareOfWallet: 46, shareOfVisits: 43, avgTxnCountIndex: 101, avgTxnSizeIndex: 126, avgIndustrySpendIndex: 124, channelShareOnlinePct: 32, channelVisitsIndex: 93 },
    propensities: { luxuryHotelSpender: 0.63, topTierRewards: 0.61, coBrandLookAlike: 0.57 },
    categories: {
      hospitality: { capturedSharePct: 46, leakagePct: 54, totalWalletIndex: 134 },
      fnb: { capturedSharePct: 37, leakagePct: 63, totalWalletIndex: 141, sub: { bars: 86, fullService: 156 } },
      entertainment: { capturedSharePct: 51, leakagePct: 49, totalWalletIndex: 88 },
      retailLuxury: { capturedSharePct: 40, leakagePct: 60, totalWalletIndex: 101, sub: { luxury: 108, other: 98 } },
    },
    crossPropertyCashIndex: 122,
    crossPropertyCashBand: '4-6k equiv./mo',
    recommendedPlays: [
      { title: 'MICE loyalty accelerator', lever: 'GICC commercial', rationale: 'Physical channel preference supports venue-led enrollment.', channel: 'Physical' },
      { title: 'Weekday upgrade and business dining', lever: 'Hotel CRM', rationale: 'Hospitality capture is stronger, but F&B full-service leakage remains open.', channel: 'Physical' },
    ],
  },
  {
    id: 'aspiring-mass-affluent',
    name: 'Aspiring Mass-Affluent',
    nameZh: '新晉中產客',
    colorToken: 'leak',
    sizeBand: '20-30k',
    sizeLowK: 20,
    sizeHighK: 30,
    signatureTrait: 'Rising spenders with high headroom and low current Galaxy capture',
    metrics: { shareOfWallet: 18, shareOfVisits: 23, avgTxnCountIndex: 112, avgTxnSizeIndex: 96, avgIndustrySpendIndex: 129, channelShareOnlinePct: 64, channelVisitsIndex: 139 },
    propensities: { luxuryHotelSpender: 0.51, topTierRewards: 0.79, coBrandLookAlike: 0.66 },
    categories: {
      hospitality: { capturedSharePct: 18, leakagePct: 82, totalWalletIndex: 126 },
      fnb: { capturedSharePct: 21, leakagePct: 79, totalWalletIndex: 124, sub: { bars: 130, fullService: 121 } },
      entertainment: { capturedSharePct: 19, leakagePct: 81, totalWalletIndex: 136 },
      retailLuxury: { capturedSharePct: 15, leakagePct: 85, totalWalletIndex: 133, sub: { luxury: 138, other: 119 } },
    },
    crossPropertyCashIndex: 166,
    crossPropertyCashBand: '4-7k equiv./mo',
    recommendedPlays: [
      { title: 'Rewards tier accelerator', lever: 'Galaxy Rewards', rationale: 'Top-tier rewards propensity is high despite low current capture.', channel: 'Online' },
      { title: 'Targeted first-purchase privilege', lever: 'Galaxy Promenade', rationale: 'Retail-luxury leakage is broad and addressable.', channel: 'Online' },
    ],
  },
];

export const quarters: Quarter[] = [
  { id: '2025-q3', label: 'Q3 2025', isCurrent: false },
  { id: '2025-q4', label: 'Q4 2025', isCurrent: false },
  { id: '2026-q1', label: 'Q1 2026', isCurrent: false },
  { id: '2026-q2', label: 'Q2 2026', isCurrent: true },
];

export const methodology: Methodology = {
  matchedCoveragePct: 63,
  basis: 'demi-decile average',
  refresh: 'quarterly',
  activeMetricCount: 7,
};

function rawOpportunity(segment: Omit<Segment, 'opportunityIndex'>) {
  return CORE_CATEGORIES.reduce((sum, category) => {
    const wallet = segment.categories[category];
    return sum + (wallet.leakagePct / 100) * wallet.totalWalletIndex * WEIGHTS[category];
  }, 0);
}

function withQuarterMovement(segment: Omit<Segment, 'opportunityIndex'>, quarterIndex: number): Omit<Segment, 'opportunityIndex'> {
  const random = mulberry32(20260624 + quarterIndex * 97 + segment.id.length);
  const movement = quarterIndex - 3;
  const categories = Object.fromEntries(
    CORE_CATEGORIES.map((category) => {
      const wallet = segment.categories[category];
      const capturedSharePct = jitter(wallet.capturedSharePct + movement, random, 4, 8, 72);
      return [
        category,
        {
          ...wallet,
          capturedSharePct,
          leakagePct: 100 - capturedSharePct,
          totalWalletIndex: jitter(wallet.totalWalletIndex, random, 8, 70, 240),
        },
      ];
    }),
  ) as Segment['categories'];

  return {
    ...segment,
    metrics: {
      shareOfWallet: categories.hospitality.capturedSharePct,
      shareOfVisits: jitter(segment.metrics.shareOfVisits + movement, random, 5, 8, 72),
      avgTxnCountIndex: jitter(segment.metrics.avgTxnCountIndex, random, 8, 70, 220),
      avgTxnSizeIndex: jitter(segment.metrics.avgTxnSizeIndex, random, 8, 70, 240),
      avgIndustrySpendIndex: jitter(segment.metrics.avgIndustrySpendIndex, random, 8, 70, 240),
      channelShareOnlinePct: jitter(segment.metrics.channelShareOnlinePct, random, 5, 15, 85),
      channelVisitsIndex: jitter(segment.metrics.channelVisitsIndex, random, 8, 70, 220),
    },
    categories,
    crossPropertyCashIndex: jitter(segment.crossPropertyCashIndex, random, 8, 70, 240),
    propensities: {
      luxuryHotelSpender: Number(clamp(segment.propensities.luxuryHotelSpender + (random() - 0.5) * 0.04, 0.2, 0.98).toFixed(2)),
      topTierRewards: Number(clamp(segment.propensities.topTierRewards + (random() - 0.5) * 0.04, 0.2, 0.98).toFixed(2)),
      coBrandLookAlike: Number(clamp(segment.propensities.coBrandLookAlike + (random() - 0.5) * 0.04, 0.2, 0.98).toFixed(2)),
    },
  };
}

export const segmentsByQuarter: Record<string, Segment[]> = Object.fromEntries(
  quarters.map((quarter, quarterIndex) => {
    const moved = baseSegments.map((segment) => withQuarterMovement(segment, quarterIndex));
    const raws = moved.map(rawOpportunity);
    const meanRaw = raws.reduce((sum, value) => sum + value, 0) / raws.length;
    return [
      quarter.id,
      moved.map((segment, index) => ({
        ...segment,
        opportunityIndex: Math.round((raws[index] / meanRaw) * 100),
      })),
    ];
  }),
);

export const latestQuarter = quarters.find((quarter) => quarter.isCurrent) ?? quarters[quarters.length - 1];
export const latestSegments = segmentsByQuarter[latestQuarter.id];

export const crmRows: CrmRow[] = latestSegments.flatMap((segment, segmentIndex) =>
  Array.from({ length: segmentIndex < 4 ? 2 : 1 }, (_, rowIndex) => {
    const suffix = `${segmentIndex + 3}${rowIndex + 4}${segment.id.length}${rowIndex + 1}`.slice(0, 4);
    return {
      customerId: `MEM-••••${suffix}`,
      segmentId: segment.id,
      categorySharePct: segment.metrics.shareOfWallet,
      competitorSpendBand: segment.crossPropertyCashBand,
      luxuryRetailIndex: segment.categories.retailLuxury.sub?.luxury ?? segment.categories.retailLuxury.totalWalletIndex,
      propensityScore: segment.propensities.coBrandLookAlike,
    };
  }),
).slice(0, 10);

export const marketScanTiles: MarketScanTile[] = [
  {
    title: 'Arena weekend collision',
    sourceType: 'competitor calendar',
    signal: 'Two rival resort concerts overlap with Galaxy Arena presale windows.',
    implication: 'Prioritize entertainment-propensity guests with early access and dining bundles.',
  },
  {
    title: 'Luxury promenade chatter',
    sourceType: 'social sentiment',
    signal: 'Positive mentions cluster around watches, jewellery, and VIP styling services.',
    implication: 'Use Promenade privilege plays for luxury leakers and high co-brand look-alikes.',
  },
  {
    title: 'GBA short-stay spike',
    sourceType: 'footfall signal',
    signal: 'Cross-border day-trip intent rises around long weekends.',
    implication: 'Bundle ICBC co-brand acquisition with arena and F&B conversion offers.',
  },
  {
    title: 'Share-of-voice gap',
    sourceType: 'share of voice',
    signal: 'Family leisure posts trail competitor resort content during school holidays.',
    implication: 'Lift family bundle creative around Grand Resort Deck and casual dining.',
  },
];
```

Create `src/data/index.ts`:

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
```

- [ ] **Step 4: Verify tests pass**

Run:

```bash
npm run test -- src/lib/format.test.ts src/data/generate.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the data layer**

Run:

```bash
git add src/data/generate.test.ts src/data/generate.ts src/data/index.ts src/data/types.ts src/lib/format.test.ts src/lib/format.ts src/lib/palette.ts src/lib/rng.ts
git commit -m "feat: add compliant CDE data layer"
```

Expected: one commit with the CDE formatter and deterministic data generator.

---

### Task 3: Shared App State, Shell, And UI Primitives

**Files:**
- Create: `src/store/app-store.tsx`
- Create: `src/app/providers.tsx`
- Create: `src/components/ui/cde-chip.tsx`
- Create: `src/components/ui/formatted-values.tsx`
- Create: `src/components/ui/kpi-card.tsx`
- Create: `src/components/ui/methodology-note.tsx`
- Create: `src/components/ui/overline.tsx`
- Create: `src/components/ui/panel.tsx`
- Create: `src/components/shell/app-shell.tsx`
- Create: `src/components/shell/co-brand-lockup.tsx`
- Create: `src/components/shell/nav.tsx`
- Create: `src/components/shell/top-bar.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/components/shell/top-bar.test.tsx`
- Test: `src/components/ui/formatted-values.test.tsx`

- [ ] **Step 1: Write failing shell and formatted value tests**

Create `src/components/ui/formatted-values.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { BandValue, IndexValue, PercentValue } from './formatted-values';

describe('formatted CDE value components', () => {
  it('renders every enriched display with a CDE chip', () => {
    render(
      <div>
        <PercentValue value={63} label="Matched coverage" />
        <IndexValue value={176} label="Opportunity" />
        <BandValue value="8-12k equiv./mo" label="Wallet band" />
      </div>,
    );

    expect(screen.getAllByText('CDE')).toHaveLength(3);
    expect(screen.getByText('63%')).toBeInTheDocument();
    expect(screen.getByText('Index 176')).toBeInTheDocument();
    expect(screen.getByText('8-12k equiv./mo')).toBeInTheDocument();
  });
});
```

Create `src/components/shell/top-bar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import { TopBar } from './top-bar';

describe('TopBar', () => {
  it('shows the current quarter, 7 active metrics, and matched coverage', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByLabelText('Quarter selector')).toHaveTextContent('Q2 2026');
    expect(screen.getByText('7 active CDE metrics')).toBeInTheDocument();
    expect(screen.getByText('Matched coverage 63%')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -- src/components/ui/formatted-values.test.tsx src/components/shell/top-bar.test.tsx
```

Expected: FAIL with module resolution errors for missing UI and shell modules.

- [ ] **Step 3: Add state provider and route wrapper**

Create `src/store/app-store.tsx`:

```tsx
'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { latestQuarter, latestSegments, methodology, quarters, segmentsByQuarter } from '@/data';
import type { Quarter, Segment } from '@/data';

export interface SavedAudience {
  id: string;
  name: string;
  segmentIds: string[];
  sizeBand: string;
  recaptureIndex: number;
  dominantLeakageCategory: string;
}

export interface AudienceFilters {
  luxuryHotelSpender: number;
  topTierRewards: number;
  coBrandLookAlike: number;
  leakageIndex: number;
  segmentIds: string[];
}

interface AppState {
  quarters: Quarter[];
  selectedQuarter: Quarter;
  setSelectedQuarterId: (quarterId: string) => void;
  segments: Segment[];
  selectedSegment: Segment;
  setSelectedSegmentId: (segmentId: string) => void;
  methodology: typeof methodology;
  filters: AudienceFilters;
  setFilters: (filters: AudienceFilters) => void;
  savedAudiences: SavedAudience[];
  saveAudience: (audience: SavedAudience) => void;
  campaignToast: string | null;
  pushCampaign: (audienceName: string) => void;
  clearCampaignToast: () => void;
}

const defaultFilters: AudienceFilters = {
  luxuryHotelSpender: 0.7,
  topTierRewards: 0.7,
  coBrandLookAlike: 0.7,
  leakageIndex: 120,
  segmentIds: latestSegments.map((segment) => segment.id),
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [selectedQuarterId, setSelectedQuarterId] = useState(latestQuarter.id);
  const [selectedSegmentId, setSelectedSegmentId] = useState(latestSegments[0].id);
  const [filters, setFilters] = useState<AudienceFilters>(defaultFilters);
  const [savedAudiences, setSavedAudiences] = useState<SavedAudience[]>([]);
  const [campaignToast, setCampaignToast] = useState<string | null>(null);

  const selectedQuarter = quarters.find((quarter) => quarter.id === selectedQuarterId) ?? latestQuarter;
  const segments = segmentsByQuarter[selectedQuarter.id];
  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId) ?? segments[0];

  const value = useMemo<AppState>(
    () => ({
      quarters,
      selectedQuarter,
      setSelectedQuarterId,
      segments,
      selectedSegment,
      setSelectedSegmentId,
      methodology,
      filters,
      setFilters,
      savedAudiences,
      saveAudience: (audience) =>
        setSavedAudiences((current) => {
          const next = current.filter((item) => item.id !== audience.id);
          return [audience, ...next].slice(0, 5);
        }),
      campaignToast,
      pushCampaign: (audienceName) =>
        setCampaignToast(`Audience exported to Galaxy Rewards CRM / activation platform: ${audienceName}`),
      clearCampaignToast: () => setCampaignToast(null),
    }),
    [campaignToast, filters, savedAudiences, segments, selectedQuarter, selectedSegment],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}
```

Create `src/app/providers.tsx`:

```tsx
'use client';

import { AppStateProvider } from '@/store/app-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
```

- [ ] **Step 4: Add UI primitives**

Create `src/components/ui/cde-chip.tsx`:

```tsx
export function CdeChip() {
  return (
    <span
      title="Mastercard Card Data Enrichment - modelled estimate"
      className="inline-flex items-center rounded-full border border-galaxy-gold/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-galaxy-gold"
    >
      CDE
    </span>
  );
}
```

Create `src/components/ui/formatted-values.tsx`:

```tsx
import { formatEnriched } from '@/lib/format';
import { CdeChip } from './cde-chip';

function ValueFrame({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-galaxy-muted">
        <span>{label}</span>
        <CdeChip />
      </div>
      <div className="font-serif text-3xl font-semibold text-galaxy-gold">{value}</div>
    </div>
  );
}

export function PercentValue({ value, label }: { value: number; label: string }) {
  return <ValueFrame label={label} value={formatEnriched(value, 'pct')} />;
}

export function IndexValue({ value, label }: { value: number; label: string }) {
  return <ValueFrame label={label} value={formatEnriched(value, 'index')} />;
}

export function BandValue({ value, label }: { value: string; label: string }) {
  return <ValueFrame label={label} value={formatEnriched(value, 'band')} />;
}
```

Create `src/components/ui/panel.tsx`:

```tsx
import { clsx } from 'clsx';

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={clsx(
        'rounded-2xl border border-galaxy-border bg-galaxy-charcoal/88 p-5 shadow-2xl shadow-black/20 ring-1 ring-white/5',
        className,
      )}
    >
      {children}
    </section>
  );
}
```

Create `src/components/ui/overline.tsx`:

```tsx
export function Overline({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.28em] text-galaxy-gold">{children}</p>;
}
```

Create `src/components/ui/kpi-card.tsx`:

```tsx
import { Panel } from './panel';

export function KpiCard({
  label,
  value,
  caption,
  chip,
}: {
  label: string;
  value: React.ReactNode;
  caption: string;
  chip?: React.ReactNode;
}) {
  return (
    <Panel className="min-h-40">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-galaxy-muted">{label}</p>
        {chip}
      </div>
      <div className="mt-5">{value}</div>
      <p className="mt-4 text-sm leading-6 text-galaxy-muted">{caption}</p>
    </Panel>
  );
}
```

Create `src/components/ui/methodology-note.tsx`:

```tsx
import { methodology } from '@/data';

export function MethodologyNote() {
  return (
    <div className="border-t border-galaxy-border bg-galaxy-ink/92 px-5 py-3 text-xs leading-5 text-galaxy-muted">
      Enriched figures are modelled estimates ({methodology.basis}s), expressed as indices / ranges / % per Mastercard CDE data-sharing rules. Matched coverage {methodology.matchedCoveragePct}% · {methodology.refresh} refresh · {methodology.activeMetricCount} active CDE metrics.
    </div>
  );
}
```

- [ ] **Step 5: Add shell components and update layout**

Create `src/components/shell/co-brand-lockup.tsx`:

```tsx
export function CoBrandLockup() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-galaxy-muted">
      <span className="font-serif text-lg tracking-[0.18em] text-galaxy-gold">GALAXY MACAU</span>
      <span className="h-4 w-px bg-galaxy-border" />
      <span>Powered by Mastercard CDE</span>
      <span className="h-4 w-px bg-galaxy-border" />
      <span>Built by Deloitte Digital Foundry</span>
    </div>
  );
}
```

Create `src/components/shell/nav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Gem, Home, LineChart, Megaphone, Radar, Target } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { href: '/', label: 'Overview', icon: Home },
  { href: '/wallet', label: 'Wallet', icon: BarChart3 },
  { href: '/segments', label: 'Segments', icon: Radar },
  { href: '/leakage', label: 'Leakage', icon: LineChart },
  { href: '/propensity', label: 'Audience', icon: Target },
  { href: '/activation', label: 'Activation', icon: Megaphone },
  { href: '/marketscan', label: 'Market Scan', icon: Gem },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="w-full border-r border-galaxy-border bg-galaxy-ink/82 px-3 py-5 lg:w-64">
      <Link href="/" className="mb-8 block px-3 font-serif text-2xl text-galaxy-gold">
        Galaxy Constellation
      </Link>
      <div className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition',
                active ? 'bg-galaxy-gold/12 text-galaxy-gold' : 'text-galaxy-muted hover:bg-galaxy-slate hover:text-galaxy-cream',
              )}
            >
              <Icon aria-hidden className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

Create `src/components/shell/top-bar.tsx`:

```tsx
'use client';

import { useAppState } from '@/store/app-store';

export function TopBar() {
  const { quarters, selectedQuarter, setSelectedQuarterId, methodology } = useAppState();

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-end gap-3 border-b border-galaxy-border bg-galaxy-ink/86 px-5 py-3 backdrop-blur">
      <button
        aria-label="7 active CDE metrics"
        className="rounded-full border border-galaxy-gold/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold"
      >
        {methodology.activeMetricCount} active CDE metrics
      </button>
      <span className="rounded-full border border-galaxy-border px-3 py-2 text-xs text-galaxy-muted">
        Matched coverage {methodology.matchedCoveragePct}%
      </span>
      <label className="sr-only" htmlFor="quarter-select">
        Quarter selector
      </label>
      <select
        id="quarter-select"
        aria-label="Quarter selector"
        value={selectedQuarter.id}
        onChange={(event) => setSelectedQuarterId(event.target.value)}
        className="rounded-full border border-galaxy-border bg-galaxy-slate px-3 py-2 text-sm text-galaxy-cream"
      >
        {quarters.map((quarter) => (
          <option key={quarter.id} value={quarter.id}>
            {quarter.label}
          </option>
        ))}
      </select>
    </header>
  );
}
```

Create `src/components/shell/app-shell.tsx`:

```tsx
import { MethodologyNote } from '@/components/ui/methodology-note';
import { CoBrandLockup } from './co-brand-lockup';
import { Nav } from './nav';
import { TopBar } from './top-bar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Nav />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-6 lg:px-8">{children}</main>
        <footer className="px-5 pb-4">
          <CoBrandLockup />
        </footer>
        <MethodologyNote />
      </div>
    </div>
  );
}
```

Modify `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { AppShell } from '@/components/shell/app-shell';
import { Providers } from './providers';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Galaxy Constellation',
  description: 'Guest Wallet Intelligence enriched by Mastercard CDE',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify shell tests and build**

Run:

```bash
npm run test -- src/components/ui/formatted-values.test.tsx src/components/shell/top-bar.test.tsx
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 7: Commit shared shell and primitives**

Run:

```bash
git add src/app/layout.tsx src/app/providers.tsx src/components/shell src/components/ui src/store/app-store.tsx
git commit -m "feat: add Galaxy dashboard shell"
```

Expected: one commit with the shared shell and UI foundation.

---

### Task 4: Chart Components

**Files:**
- Create: `src/components/charts/category-stacked-bar.tsx`
- Create: `src/components/charts/channel-donut.tsx`
- Create: `src/components/charts/leakage-flow.tsx`
- Create: `src/components/charts/propensity-gauge.tsx`
- Create: `src/components/charts/sow-sov-scatter.tsx`
- Create: `src/components/charts/spend-radar.tsx`
- Create: `src/components/charts/wallet-gauge.tsx`
- Test: `src/components/charts/charts.test.tsx`

- [ ] **Step 1: Write failing chart tests**

Create `src/components/charts/charts.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { latestSegments } from '@/data';
import { CategoryStackedBar } from './category-stacked-bar';
import { LeakageFlow } from './leakage-flow';
import { PropensityGauge } from './propensity-gauge';
import { WalletGauge } from './wallet-gauge';

const segment = latestSegments[0];

describe('dashboard chart components', () => {
  it('renders captured and leakage labels for category bars', () => {
    render(<CategoryStackedBar segments={[segment]} category="hospitality" />);
    expect(screen.getByText('Hospitality')).toBeInTheDocument();
    expect(screen.getByText(/captured/i)).toBeInTheDocument();
    expect(screen.getByText(/leakage/i)).toBeInTheDocument();
  });

  it('renders wallet gauge with a CDE chip', () => {
    render(<WalletGauge label="Hospitality wallet capture" capturedPct={28} />);
    expect(screen.getByText('Hospitality wallet capture')).toBeInTheDocument();
    expect(screen.getByText('CDE')).toBeInTheDocument();
  });

  it('renders propensity gauge score', () => {
    render(<PropensityGauge label="Co-Brand Look-Alike" value={0.93} />);
    expect(screen.getByText('Co-Brand Look-Alike')).toBeInTheDocument();
    expect(screen.getByText('0.93')).toBeInTheDocument();
  });

  it('renders leakage flow branches without a raw currency symbol', () => {
    render(<LeakageFlow segment={segment} />);
    expect(screen.getByText(/Captured by Galaxy/i)).toBeInTheDocument();
    expect(screen.getByText(/Competitor hospitality/i)).toBeInTheDocument();
    expect(screen.queryByText(/MOP|HKD|\$/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -- src/components/charts/charts.test.tsx
```

Expected: FAIL with module resolution errors for chart components.

- [ ] **Step 3: Add the stacked bar, wallet gauge, propensity gauge, and leakage flow**

Create `src/components/charts/category-stacked-bar.tsx`:

```tsx
import type { CoreCategory, Segment } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';

const labels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail/Luxury',
};

export function CategoryStackedBar({ segments, category }: { segments: Segment[]; category: CoreCategory }) {
  const capture = Math.round(segments.reduce((sum, segment) => sum + segment.categories[category].capturedSharePct, 0) / segments.length);
  const leak = 100 - capture;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-galaxy-cream">
          <span>{labels[category]}</span>
          <CdeChip />
        </div>
        <span className="text-xs text-galaxy-muted">
          {capture}% captured · {leak}% leakage
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-galaxy-market">
        <div className="h-full bg-galaxy-capture" style={{ width: `${capture}%` }} aria-label={`${labels[category]} captured ${capture}%`} />
      </div>
      <div className="mt-1 text-xs text-galaxy-muted">Captured by Galaxy vs market leakage</div>
    </div>
  );
}
```

Create `src/components/charts/wallet-gauge.tsx`:

```tsx
import { CdeChip } from '@/components/ui/cde-chip';

export function WalletGauge({ label, capturedPct }: { label: string; capturedPct: number }) {
  const leakPct = 100 - capturedPct;
  return (
    <div className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-galaxy-cream">{label}</p>
        <CdeChip />
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-galaxy-market">
        <div className="h-full bg-galaxy-capture" style={{ width: `${capturedPct}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-galaxy-muted">
        <span>{capturedPct}% captured</span>
        <span>{leakPct}% leakage</span>
      </div>
    </div>
  );
}
```

Create `src/components/charts/propensity-gauge.tsx`:

```tsx
import { formatPropensity } from '@/lib/format';
import { CdeChip } from '@/components/ui/cde-chip';

export function PropensityGauge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-galaxy-cream">{label}</p>
        <CdeChip />
      </div>
      <div className="mt-5 flex items-end gap-3">
        <div className="font-serif text-4xl text-galaxy-gold">{formatPropensity(value)}</div>
        <div className="mb-2 text-xs text-galaxy-muted">{pct}th percentile signal</div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-galaxy-market">
        <div className="h-2 rounded-full bg-galaxy-positive" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

Create `src/components/charts/leakage-flow.tsx`:

```tsx
import type { Segment } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';
import { formatEnriched } from '@/lib/format';

export function LeakageFlow({ segment }: { segment: Segment }) {
  const branches = [
    { label: 'Competitor hospitality', value: segment.categories.hospitality.leakagePct },
    { label: 'Off-property luxury retail', value: segment.categories.retailLuxury.leakagePct },
    { label: 'Off-property F&B', value: segment.categories.fnb.leakagePct },
    { label: 'Off-property entertainment', value: segment.categories.entertainment.leakagePct },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-galaxy-muted">Guest wallet split</span>
        <CdeChip />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-galaxy-border bg-galaxy-slate p-4">
          <p className="text-sm text-galaxy-muted">Captured by Galaxy</p>
          <p className="mt-3 font-serif text-4xl text-galaxy-gold">{formatEnriched(segment.metrics.shareOfWallet, 'pct')}</p>
        </div>
        <div className="space-y-3">
          {branches.map((branch) => (
            <div key={branch.label} className="rounded-xl border border-galaxy-border bg-galaxy-slate p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-galaxy-cream">{branch.label}</span>
                <span className="text-galaxy-leak">{formatEnriched(branch.value, 'pct')}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-galaxy-market">
                <div className="h-2 rounded-full bg-galaxy-leak" style={{ width: `${branch.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add scatter, radar, and channel donut chart wrappers**

Create `src/components/charts/sow-sov-scatter.tsx`:

```tsx
'use client';

import { Scatter, ScatterChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import type { Segment } from '@/data';
import { galaxyPalette } from '@/lib/palette';

export function SowSovScatter({ segments }: { segments: Segment[] }) {
  const data = segments.map((segment) => ({
    name: segment.name,
    sow: segment.metrics.shareOfWallet,
    sov: segment.metrics.shareOfVisits,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 16, bottom: 24, left: 8 }}>
          <CartesianGrid stroke={galaxyPalette.border} />
          <XAxis dataKey="sow" name="Share of Wallet" stroke={galaxyPalette.muted} unit="%" />
          <YAxis dataKey="sov" name="Share of Visits" stroke={galaxyPalette.muted} unit="%" />
          <ReferenceLine x={35} stroke={galaxyPalette.market} strokeDasharray="4 4" />
          <ReferenceLine y={35} stroke={galaxyPalette.market} strokeDasharray="4 4" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: galaxyPalette.slate, border: `1px solid ${galaxyPalette.border}`, color: galaxyPalette.cream }} />
          <Scatter data={data} fill={galaxyPalette.gold} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
```

Create `src/components/charts/spend-radar.tsx`:

```tsx
'use client';

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import type { Segment } from '@/data';
import { galaxyPalette } from '@/lib/palette';

export function SpendRadar({ segment }: { segment: Segment }) {
  const data = [
    { label: 'Hospitality', value: segment.categories.hospitality.totalWalletIndex },
    { label: 'F&B', value: segment.categories.fnb.totalWalletIndex },
    { label: 'Entertainment', value: segment.categories.entertainment.totalWalletIndex },
    { label: 'Retail-Luxury', value: segment.categories.retailLuxury.totalWalletIndex },
    { label: 'Gaming context', value: segment.gamingContextIndex ?? 100 },
    { label: 'Cross-property cash', value: segment.crossPropertyCashIndex },
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke={galaxyPalette.border} />
          <PolarAngleAxis dataKey="label" stroke={galaxyPalette.muted} tick={{ fontSize: 11 }} />
          <Radar dataKey="value" stroke={galaxyPalette.gold} fill={galaxyPalette.gold} fillOpacity={0.22} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

Create `src/components/charts/channel-donut.tsx`:

```tsx
'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { galaxyPalette } from '@/lib/palette';

export function ChannelDonut({ onlinePct }: { onlinePct: number }) {
  const data = [
    { name: 'Online', value: onlinePct, color: galaxyPalette.gold },
    { name: 'Physical', value: 100 - onlinePct, color: galaxyPalette.market },
  ];

  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={36} outerRadius={52} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 text-sm text-galaxy-muted">
        <p><span className="text-galaxy-gold">{onlinePct}%</span> online payment share</p>
        <p><span className="text-galaxy-cream">{100 - onlinePct}%</span> physical payment share</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify chart tests and build**

Run:

```bash
npm run test -- src/components/charts/charts.test.tsx
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 6: Commit charts**

Run:

```bash
git add src/components/charts
git commit -m "feat: add dashboard chart components"
```

Expected: one commit with reusable chart components.

---

### Task 5: Overview Route

**Files:**
- Modify: `src/app/page.tsx`
- Test: `src/app/page.test.tsx`

- [ ] **Step 1: Replace the smoke test with overview requirements**

Modify `src/app/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import Home from './page';
import { AppStateProvider } from '@/store/app-store';

describe('Constellation Overview route', () => {
  it('renders the executive thesis, KPI cards, wallet snapshot, and top opportunities', () => {
    render(
      <AppStateProvider>
        <Home />
      </AppStateProvider>,
    );

    expect(screen.getByRole('heading', { name: /Galaxy Constellation/i })).toBeInTheDocument();
    expect(screen.getByText(/Guest Wallet Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Matched guest base/i)).toBeInTheDocument();
    expect(screen.getByText(/Galaxy wallet capture/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated wallet headroom/i)).toBeInTheDocument();
    expect(screen.getByText(/Top-tier rewards propensity/i)).toBeInTheDocument();
    expect(screen.getByText(/Category wallet snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/Top 3 opportunities this quarter/i)).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run the overview test to verify it fails**

Run:

```bash
npm run test -- src/app/page.test.tsx
```

Expected: FAIL because the current page lacks KPI cards and opportunity sections.

- [ ] **Step 3: Implement the overview route**

Modify `src/app/page.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CategoryStackedBar } from '@/components/charts/category-stacked-bar';
import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { KpiCard } from '@/components/ui/kpi-card';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES } from '@/data';
import { formatPropensity } from '@/lib/format';
import { useAppState } from '@/store/app-store';

export default function Home() {
  const { segments, methodology } = useAppState();
  const avgHospitalityShare = Math.round(segments.reduce((sum, segment) => sum + segment.metrics.shareOfWallet, 0) / segments.length);
  const avgOpportunity = Math.round(segments.reduce((sum, segment) => sum + segment.opportunityIndex, 0) / segments.length);
  const avgTopTier = segments.reduce((sum, segment) => sum + segment.propensities.topTierRewards, 0) / segments.length;
  const topOpportunities = [...segments].sort((a, b) => b.opportunityIndex - a.opportunityIndex).slice(0, 3);

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-galaxy-border bg-galaxy-charcoal px-6 py-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(201,164,92,0.24),transparent_24rem),radial-gradient(circle_at_82%_10%,rgba(228,201,136,0.12),transparent_18rem)]" />
        <div className="relative">
          <Overline>客戶錢包洞察 · Guest Wallet Intelligence</Overline>
          <h1 className="mt-5 font-serif text-6xl text-galaxy-cream lg:text-7xl">Galaxy Constellation</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-galaxy-muted">
            Guest Wallet Intelligence · Enriched by Mastercard CDE. See Galaxy's captured wallet and the modelled off-property headroom that can be won back through Rewards, Promenade, Arena, and co-brand levers.
          </p>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Matched guest base" value={<PercentValue value={methodology.matchedCoveragePct} label="Matched coverage" />} caption="Transaction-level matching basis shown openly for methodology confidence." />
        <KpiCard label="Galaxy wallet capture" value={<PercentValue value={avgHospitalityShare} label="Hospitality share" />} caption="Average hospitality wallet captured across the current selected base." />
        <KpiCard label="Estimated wallet headroom" value={<IndexValue value={avgOpportunity} label="Opportunity" />} caption="Composite leakage opportunity normalized to market base 100." />
        <KpiCard label="Top-tier rewards propensity" value={<div className="flex items-center gap-2"><span className="font-serif text-3xl text-galaxy-gold">{formatPropensity(avgTopTier)}</span><CdeChip /></div>} caption="Average appended propensity score across the current base." />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <Overline>Portfolio pulse</Overline>
              <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Category wallet snapshot</h2>
            </div>
            <CdeChip />
          </div>
          <div className="space-y-5">
            {CORE_CATEGORIES.map((category) => (
              <CategoryStackedBar key={category} segments={segments} category={category} />
            ))}
          </div>
        </Panel>

        <Panel>
          <Overline>Action thesis</Overline>
          <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Top 3 opportunities this quarter</h2>
          <div className="mt-5 space-y-3">
            {topOpportunities.map((segment) => (
              <Link key={segment.id} href="/leakage" className="block rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4 transition hover:border-galaxy-gold/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-galaxy-cream">{segment.name}</p>
                    <p className="mt-1 text-xs text-galaxy-muted">{segment.signatureTrait}</p>
                  </div>
                  <span className="font-serif text-2xl text-galaxy-gold">Index {segment.opportunityIndex}</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verify overview and build**

Run:

```bash
npm run test -- src/app/page.test.tsx
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 5: Commit overview**

Run:

```bash
git add src/app/page.test.tsx src/app/page.tsx
git commit -m "feat: build constellation overview"
```

Expected: one commit with the overview route.

---

### Task 6: Share Of Wallet Route

**Files:**
- Create: `src/app/wallet/page.tsx`
- Test: `src/app/wallet/page.test.tsx`

- [ ] **Step 1: Write failing wallet route test**

Create `src/app/wallet/page.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import WalletPage from './page';

describe('Share of Wallet route', () => {
  it('renders wallet gauges, scatter, legal F&B drill, retail luxury drill, and channel mix', () => {
    render(
      <AppStateProvider>
        <WalletPage />
      </AppStateProvider>,
    );

    expect(screen.getByRole('heading', { name: /Share of Wallet/i })).toBeInTheDocument();
    expect(screen.getByText(/Share of Wallet vs Share of Visits/i)).toBeInTheDocument();
    expect(screen.getByText(/Channel mix/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'F&B' }));
    expect(screen.getByText(/bars\/clubs/i)).toBeInTheDocument();
    expect(screen.getByText(/full-service restaurants/i)).toBeInTheDocument();
    expect(screen.queryByText(/cuisine/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retail-Luxury' }));
    expect(screen.getByText(/Luxury sub-category/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the wallet test to verify it fails**

Run:

```bash
npm run test -- src/app/wallet/page.test.tsx
```

Expected: FAIL because `/wallet` has not been created.

- [ ] **Step 3: Implement the wallet route**

Create `src/app/wallet/page.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { ChannelDonut } from '@/components/charts/channel-donut';
import { SowSovScatter } from '@/components/charts/sow-sov-scatter';
import { WalletGauge } from '@/components/charts/wallet-gauge';
import { CdeChip } from '@/components/ui/cde-chip';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { CoreCategory } from '@/data';
import { useAppState } from '@/store/app-store';

const categoryButtons: Array<{ key: CoreCategory | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'hospitality', label: 'Hospitality' },
  { key: 'fnb', label: 'F&B' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'retailLuxury', label: 'Retail-Luxury' },
];

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

export default function WalletPage() {
  const { segments } = useAppState();
  const [selected, setSelected] = useState<CoreCategory | 'all'>('all');
  const visibleCategories = selected === 'all' ? (categoryButtons.filter((item) => item.key !== 'all').map((item) => item.key) as CoreCategory[]) : [selected];

  const selectedSegment = segments[0];
  const avgOnline = Math.round(segments.reduce((sum, segment) => sum + segment.metrics.channelShareOnlinePct, 0) / segments.length);
  const insight = useMemo(() => {
    const category = selected === 'all' ? 'hospitality' : selected;
    const capture = Math.round(segments.reduce((sum, segment) => sum + segment.categories[category].capturedSharePct, 0) / segments.length);
    return `Galaxy captures ${capture}% of this base's ${categoryLabels[category]} wallet; ${100 - capture}% leaks to off-property venues.`;
  }, [segments, selected]);

  return (
    <div className="space-y-6">
      <div>
        <Overline>Reveal the gap</Overline>
        <h1 className="mt-2 font-serif text-5xl text-galaxy-cream">Share of Wallet</h1>
        <p className="mt-3 max-w-3xl text-galaxy-muted">Galaxy vs market capture by category, expressed as CDE-compliant percentages and indices.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categoryButtons.map((item) => (
          <button key={item.key} onClick={() => setSelected(item.key)} className={`rounded-full border px-4 py-2 text-sm ${selected === item.key ? 'border-galaxy-gold text-galaxy-gold' : 'border-galaxy-border text-galaxy-muted'}`}>
            {item.label}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleCategories.map((category) => {
          const capture = Math.round(segments.reduce((sum, segment) => sum + segment.categories[category].capturedSharePct, 0) / segments.length);
          return <WalletGauge key={category} label={`${categoryLabels[category]} wallet capture`} capturedPct={capture} />;
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="font-serif text-3xl text-galaxy-cream">Share of Wallet vs Share of Visits</h2>
            <CdeChip />
          </div>
          <SowSovScatter segments={segments} />
          <div className="grid gap-2 text-xs text-galaxy-muted md:grid-cols-4">
            <span>Loyal & frequent</span>
            <span>Loyal but infrequent</span>
            <span>Tried us, spends elsewhere</span>
            <span>At risk</span>
          </div>
        </Panel>

        <Panel>
          <h2 className="font-serif text-3xl text-galaxy-cream">Channel mix</h2>
          <ChannelDonut onlinePct={avgOnline} />
          <p className="mt-4 text-sm leading-6 text-galaxy-muted">{insight}</p>

          {selected === 'fnb' && (
            <div className="mt-5 rounded-xl border border-galaxy-border p-4 text-sm text-galaxy-muted">
              <p className="text-galaxy-cream">F&B drill</p>
              <p>bars/clubs index {selectedSegment.categories.fnb.sub?.bars}</p>
              <p>full-service restaurants index {selectedSegment.categories.fnb.sub?.fullService}</p>
            </div>
          )}

          {selected === 'retailLuxury' && (
            <div className="mt-5 rounded-xl border border-galaxy-border p-4 text-sm text-galaxy-muted">
              <p className="text-galaxy-cream">Luxury sub-category</p>
              <p>Jewellery and watches index {selectedSegment.categories.retailLuxury.sub?.luxury}</p>
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verify wallet route and build**

Run:

```bash
npm run test -- src/app/wallet/page.test.tsx
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 5: Commit wallet route**

Run:

```bash
git add src/app/wallet
git commit -m "feat: build share of wallet route"
```

Expected: one commit with the wallet route.

---

### Task 7: Segments Customer 360 Route

**Files:**
- Create: `src/components/panels/segment-card.tsx`
- Create: `src/components/panels/cde-metric-panel.tsx`
- Create: `src/components/panels/crm-append-table.tsx`
- Create: `src/app/segments/page.tsx`
- Test: `src/app/segments/page.test.tsx`

- [ ] **Step 1: Write failing segments test**

Create `src/app/segments/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import SegmentsPage from './page';

describe('Segments route', () => {
  it('renders six segments, seven active metrics, propensities, spend radar, and CRM append table', () => {
    render(
      <AppStateProvider>
        <SegmentsPage />
      </AppStateProvider>,
    );

    expect(screen.getByRole('heading', { name: /Guest Segments/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /segment:/i })).toHaveLength(6);
    expect(screen.getByText(/7 active CDE metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/High Spender in Luxury Hotels/i)).toBeInTheDocument();
    expect(screen.getByText(/Top-Tier Rewards Spender/i)).toBeInTheDocument();
    expect(screen.getByText(/Co-Brand Look-Alike/i)).toBeInTheDocument();
    expect(screen.getByText(/append-to-CRM/i)).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(7);
    expect(screen.queryByText(/HKD|\$/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the segments test to verify it fails**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
```

Expected: FAIL because `/segments` and the panels have not been created.

- [ ] **Step 3: Add segment panels**

Create `src/components/panels/segment-card.tsx`:

```tsx
import type { Segment } from '@/data';

export function SegmentCard({ segment, active, onSelect }: { segment: Segment; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-label={`segment: ${segment.name}`}
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition ${active ? 'border-galaxy-gold bg-galaxy-gold/10' : 'border-galaxy-border bg-galaxy-slate/70 hover:border-galaxy-gold/50'}`}
    >
      <p className="font-medium text-galaxy-cream">{segment.name}</p>
      <p className="mt-1 text-sm text-galaxy-gold">{segment.nameZh}</p>
      <p className="mt-3 text-xs leading-5 text-galaxy-muted">{segment.signatureTrait}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-galaxy-muted">{segment.sizeBand} matched guest band</p>
    </button>
  );
}
```

Create `src/components/panels/cde-metric-panel.tsx`:

```tsx
import type { Segment } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';
import { formatEnriched } from '@/lib/format';

const metricRows = [
  ['Share of Wallet', 'shareOfWallet', 'pct'],
  ['Share of Visits', 'shareOfVisits', 'pct'],
  ['Avg Transaction #', 'avgTxnCountIndex', 'index'],
  ['Avg Transaction Size', 'avgTxnSizeIndex', 'index'],
  ['Avg Industry Spend', 'avgIndustrySpendIndex', 'index'],
  ['Channel Share', 'channelShareOnlinePct', 'pct'],
  ['Channel Visits #', 'channelVisitsIndex', 'index'],
] as const;

export function CdeMetricPanel({ segment }: { segment: Segment }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-serif text-3xl text-galaxy-cream">7 active CDE metrics</h2>
        <CdeChip />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metricRows.map(([label, key, kind]) => (
          <div key={key} className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-galaxy-muted">
              <span>{label}</span>
              <CdeChip />
            </div>
            <p className="font-serif text-3xl text-galaxy-gold">{formatEnriched(segment.metrics[key], kind)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create `src/components/panels/crm-append-table.tsx`:

```tsx
import { crmRows, latestSegments } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';
import { formatEnriched, formatPropensity } from '@/lib/format';

export function CrmAppendTable() {
  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-serif text-3xl text-galaxy-cream">CDE append-to-CRM table</h2>
        <CdeChip />
      </div>
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.18em] text-galaxy-muted">
          <tr>
            <th className="py-3 pr-5">Customer ID</th>
            <th className="py-3 pr-5">Category Share</th>
            <th className="py-3 pr-5">Spend-with-competitors</th>
            <th className="py-3 pr-5">Luxury-retail index</th>
            <th className="py-3 pr-5">Propensity score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-galaxy-border text-galaxy-cream">
          {crmRows.map((row) => {
            const segment = latestSegments.find((item) => item.id === row.segmentId);
            return (
              <tr key={row.customerId}>
                <td className="py-3 pr-5 text-galaxy-muted">{row.customerId}</td>
                <td className="py-3 pr-5">{formatEnriched(row.categorySharePct, 'pct')}</td>
                <td className="py-3 pr-5">{formatEnriched(row.competitorSpendBand, 'band')}</td>
                <td className="py-3 pr-5">{formatEnriched(row.luxuryRetailIndex, 'index')}</td>
                <td className="py-3 pr-5">{formatPropensity(row.propensityScore)}</td>
                <td className="sr-only">{segment?.name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Implement the segments route**

Create `src/app/segments/page.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { PropensityGauge } from '@/components/charts/propensity-gauge';
import { SpendRadar } from '@/components/charts/spend-radar';
import { CdeMetricPanel } from '@/components/panels/cde-metric-panel';
import { CrmAppendTable } from '@/components/panels/crm-append-table';
import { SegmentCard } from '@/components/panels/segment-card';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { useAppState } from '@/store/app-store';

export default function SegmentsPage() {
  const { segments, selectedSegment, setSelectedSegmentId } = useAppState();

  return (
    <div className="space-y-6">
      <div>
        <Overline>Zoom to a segment</Overline>
        <h1 className="mt-2 font-serif text-5xl text-galaxy-cream">Guest Segments</h1>
        <p className="mt-3 max-w-3xl text-galaxy-muted">Customer 360 with CDE metrics appended back to masked CRM records.</p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          {segments.map((segment) => (
            <SegmentCard key={segment.id} segment={segment} active={segment.id === selectedSegment.id} onSelect={() => setSelectedSegmentId(segment.id)} />
          ))}
        </div>

        <div className="space-y-5">
          <Panel>
            <Overline>{selectedSegment.nameZh}</Overline>
            <h2 className="mt-2 font-serif text-4xl text-galaxy-cream">{selectedSegment.name}</h2>
            <p className="mt-3 text-galaxy-muted">{selectedSegment.signatureTrait}</p>
          </Panel>

          <Panel>
            <CdeMetricPanel segment={selectedSegment} />
          </Panel>

          <section className="grid gap-5 xl:grid-cols-2">
            <Panel>
              <h2 className="font-serif text-3xl text-galaxy-cream">Propensity panel</h2>
              <div className="mt-4 space-y-3">
                <PropensityGauge label="High Spender in Luxury Hotels" value={selectedSegment.propensities.luxuryHotelSpender} />
                <PropensityGauge label="Top-Tier Rewards Spender" value={selectedSegment.propensities.topTierRewards} />
                <PropensityGauge label="Co-Brand Look-Alike" value={selectedSegment.propensities.coBrandLookAlike} />
              </div>
            </Panel>

            <Panel>
              <h2 className="font-serif text-3xl text-galaxy-cream">Category spend radar</h2>
              <SpendRadar segment={selectedSegment} />
              <p className="text-xs text-galaxy-muted">Gaming context is first-party and indexed only; it is not used as a leakage category.</p>
            </Panel>
          </section>

          <Panel>
            <h2 className="font-serif text-3xl text-galaxy-cream">Why this matters</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {selectedSegment.recommendedPlays.map((play) => (
                <Link key={play.title} href="/activation" className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4 hover:border-galaxy-gold/60">
                  <p className="text-galaxy-cream">{play.title}</p>
                  <p className="mt-2 text-sm leading-6 text-galaxy-muted">{play.rationale}</p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <Panel>
        <CrmAppendTable />
      </Panel>
    </div>
  );
}
```

- [ ] **Step 5: Verify segments route and build**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 6: Commit segments route**

Run:

```bash
git add src/app/segments src/components/panels/cde-metric-panel.tsx src/components/panels/crm-append-table.tsx src/components/panels/segment-card.tsx
git commit -m "feat: build guest segments route"
```

Expected: one commit with Customer 360 segment exploration.

---

### Task 8: Cross-Property Leakage Route

**Files:**
- Create: `src/app/leakage/page.tsx`
- Test: `src/app/leakage/page.test.tsx`

- [ ] **Step 1: Write failing leakage test**

Create `src/app/leakage/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import LeakagePage from './page';

describe('Cross-Property Leakage route', () => {
  it('renders opportunity index, modelled band narrative, leakage flow, target table, and cash callout', () => {
    render(
      <AppStateProvider>
        <LeakagePage />
      </AppStateProvider>,
    );

    expect(screen.getByRole('heading', { name: /Cross-Property Leakage/i })).toBeInTheDocument();
    expect(screen.getByText(/Headline opportunity index/i)).toBeInTheDocument();
    expect(screen.getByText(/stays with Galaxy but spends an estimated/i)).toBeInTheDocument();
    expect(screen.getByText(/equiv\.\/mo/i)).toBeInTheDocument();
    expect(screen.getByText(/cross-site cash spend/i)).toBeInTheDocument();
    expect(screen.getByText(/Win-back target table/i)).toBeInTheDocument();
    expect(screen.queryByText(/MOP|HKD|\$/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the leakage test to verify it fails**

Run:

```bash
npm run test -- src/app/leakage/page.test.tsx
```

Expected: FAIL because `/leakage` has not been created.

- [ ] **Step 3: Implement the leakage route**

Create `src/app/leakage/page.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { LeakageFlow } from '@/components/charts/leakage-flow';
import { BandValue, IndexValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { formatEnriched } from '@/lib/format';
import { useAppState } from '@/store/app-store';

export default function LeakagePage() {
  const { segments, selectedSegment, setSelectedSegmentId } = useAppState();
  const ranked = [...segments].sort((a, b) => b.opportunityIndex - a.opportunityIndex);
  const dominantCategory = Object.entries(selectedSegment.categories).sort(([, a], [, b]) => b.leakagePct - a.leakagePct)[0];

  return (
    <div className="space-y-6">
      <div>
        <Overline>Find the money</Overline>
        <h1 className="mt-2 font-serif text-5xl text-galaxy-cream">Cross-Property Leakage</h1>
        <p className="mt-3 max-w-3xl text-galaxy-muted">The opportunity-cost view: modelled off-property wallet, cross-site cash signals, and segment-level win-back priority.</p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <p className="text-xs uppercase tracking-[0.2em] text-galaxy-muted">Headline opportunity index</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <IndexValue value={selectedSegment.opportunityIndex} label="Opportunity" />
            <BandValue value={selectedSegment.crossPropertyCashBand} label="Modelled cash band" />
          </div>
          <div className="mt-6 rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4 text-sm leading-7 text-galaxy-muted">
            A guest stays with Galaxy but spends an estimated <span className="text-galaxy-gold">{selectedSegment.crossPropertyCashBand}</span> at other hotels in cash. That is opportunity cost Galaxy can recapture with a segment-specific offer.
          </div>
        </Panel>

        <Panel>
          <LeakageFlow segment={selectedSegment} />
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <h2 className="font-serif text-3xl text-galaxy-cream">Win-back target table</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-galaxy-muted">
                <tr>
                  <th className="py-3 pr-4">Segment</th>
                  <th className="py-3 pr-4">Leakage index</th>
                  <th className="py-3 pr-4">Dominant leakage</th>
                  <th className="py-3 pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-galaxy-border">
                {ranked.map((segment) => {
                  const topCategory = Object.entries(segment.categories).sort(([, a], [, b]) => b.leakagePct - a.leakagePct)[0][0];
                  return (
                    <tr key={segment.id}>
                      <td className="py-3 pr-4 text-galaxy-cream">{segment.name}</td>
                      <td className="py-3 pr-4 text-galaxy-gold">{formatEnriched(segment.opportunityIndex, 'index')}</td>
                      <td className="py-3 pr-4 text-galaxy-muted">{topCategory}</td>
                      <td className="py-3 pr-4">
                        <Link href="/propensity" onClick={() => setSelectedSegmentId(segment.id)} className="text-galaxy-gold hover:underline">
                          Build audience
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <Overline>Key indicator</Overline>
          <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">cross-site cash spend</h2>
          <p className="mt-4 text-sm leading-7 text-galaxy-muted">
            {selectedSegment.name} shows {formatEnriched(selectedSegment.crossPropertyCashIndex, 'index')} for cross-property cash and highest leakage in {dominantCategory[0]}. This is a modelled indicator, not an itemised merchant record.
          </p>
        </Panel>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verify leakage route and build**

Run:

```bash
npm run test -- src/app/leakage/page.test.tsx
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 5: Commit leakage route**

Run:

```bash
git add src/app/leakage
git commit -m "feat: build cross-property leakage route"
```

Expected: one commit with the leakage hero screen.

---

### Task 9: Propensity Audience Builder And Activation Route

**Files:**
- Create: `src/components/panels/audience-builder.tsx`
- Create: `src/components/panels/nba-card.tsx`
- Create: `src/app/propensity/page.tsx`
- Create: `src/app/activation/page.tsx`
- Test: `src/app/propensity/page.test.tsx`
- Test: `src/app/activation/page.test.tsx`

- [ ] **Step 1: Write failing propensity and activation tests**

Create `src/app/propensity/page.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import PropensityPage from './page';

describe('Propensity route', () => {
  it('builds and saves a compliant audience', () => {
    render(
      <AppStateProvider>
        <PropensityPage />
      </AppStateProvider>,
    );

    expect(screen.getByRole('heading', { name: /Propensity & Audience Builder/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Luxury-hotel spender/i)).toBeInTheDocument();
    expect(screen.getByText(/Live audience size/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated recapturable wallet/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Audience name'), { target: { value: 'Luxury win-back Q2' } });
    fireEvent.click(screen.getByRole('button', { name: /Save audience/i }));
    expect(screen.getByText(/Saved: Luxury win-back Q2/i)).toBeInTheDocument();
  });
});
```

Create `src/app/activation/page.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import ActivationPage from './page';

describe('Activation route', () => {
  it('renders next-best-action cards with allowed Galaxy MOP offer mechanics and campaign export toast', () => {
    render(
      <AppStateProvider>
        <ActivationPage />
      </AppStateProvider>,
    );

    expect(screen.getByRole('heading', { name: /Next-Best-Action/i })).toBeInTheDocument();
    expect(screen.getByText(/Galaxy Rewards/i)).toBeInTheDocument();
    expect(screen.getByText(/MOP 200 rebate on MOP 500 spend/i)).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getAllByRole('button', { name: /Push to campaign/i })[0]);
    expect(screen.getByText(/Audience exported to Galaxy Rewards CRM/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -- src/app/propensity/page.test.tsx src/app/activation/page.test.tsx
```

Expected: FAIL because the audience and activation modules have not been created.

- [ ] **Step 3: Add audience builder and NBA card panels**

Create `src/components/panels/audience-builder.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/store/app-store';
import { formatEnriched, formatGuestBand } from '@/lib/format';
import { CdeChip } from '@/components/ui/cde-chip';

export function AudienceBuilder() {
  const { segments, filters, setFilters, saveAudience } = useAppState();
  const [name, setName] = useState('High leakage win-back');
  const [saved, setSaved] = useState<string | null>(null);

  const matched = useMemo(
    () =>
      segments.filter(
        (segment) =>
          filters.segmentIds.includes(segment.id) &&
          segment.propensities.luxuryHotelSpender >= filters.luxuryHotelSpender &&
          segment.propensities.topTierRewards >= filters.topTierRewards &&
          segment.propensities.coBrandLookAlike >= filters.coBrandLookAlike &&
          segment.opportunityIndex >= filters.leakageIndex,
      ),
    [filters, segments],
  );

  const low = matched.reduce((sum, segment) => sum + segment.sizeLowK, 0);
  const high = matched.reduce((sum, segment) => sum + segment.sizeHighK, 0);
  const recaptureIndex = matched.length ? Math.round(matched.reduce((sum, segment) => sum + segment.opportunityIndex, 0) / matched.length) : 0;
  const sizeBand = formatGuestBand(low, high);

  function updateNumber(key: keyof typeof filters, value: number) {
    setFilters({ ...filters, [key]: value });
  }

  function onSave() {
    const audience = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      segmentIds: matched.map((segment) => segment.id),
      sizeBand,
      recaptureIndex,
      dominantLeakageCategory: 'retailLuxury',
    };
    saveAudience(audience);
    setSaved(name);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-galaxy-muted">
          Luxury-hotel spender >= {filters.luxuryHotelSpender.toFixed(2)}
          <input aria-label="Luxury-hotel spender" type="range" min="0.2" max="0.95" step="0.01" value={filters.luxuryHotelSpender} onChange={(event) => updateNumber('luxuryHotelSpender', Number(event.target.value))} className="mt-2 w-full" />
        </label>
        <label className="text-sm text-galaxy-muted">
          Top-tier rewards >= {filters.topTierRewards.toFixed(2)}
          <input aria-label="Top-tier rewards" type="range" min="0.2" max="0.95" step="0.01" value={filters.topTierRewards} onChange={(event) => updateNumber('topTierRewards', Number(event.target.value))} className="mt-2 w-full" />
        </label>
        <label className="text-sm text-galaxy-muted">
          Co-brand look-alike >= {filters.coBrandLookAlike.toFixed(2)}
          <input aria-label="Co-brand look-alike" type="range" min="0.2" max="0.95" step="0.01" value={filters.coBrandLookAlike} onChange={(event) => updateNumber('coBrandLookAlike', Number(event.target.value))} className="mt-2 w-full" />
        </label>
        <label className="text-sm text-galaxy-muted">
          Category leakage index >= {filters.leakageIndex}
          <input aria-label="Category leakage index" type="range" min="80" max="180" step="1" value={filters.leakageIndex} onChange={(event) => updateNumber('leakageIndex', Number(event.target.value))} className="mt-2 w-full" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-galaxy-muted">
            <span>Live audience size</span>
            <CdeChip />
          </div>
          <p className="font-serif text-3xl text-galaxy-gold">{sizeBand}</p>
        </div>
        <div className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-galaxy-muted">
            <span>estimated recapturable wallet</span>
            <CdeChip />
          </div>
          <p className="font-serif text-3xl text-galaxy-gold">{formatEnriched(recaptureIndex, 'index')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="min-w-64 flex-1 text-sm text-galaxy-muted">
          Audience name
          <input aria-label="Audience name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border border-galaxy-border bg-galaxy-slate px-3 py-2 text-galaxy-cream" />
        </label>
        <button type="button" onClick={onSave} className="self-end rounded-lg bg-galaxy-gold px-4 py-2 font-semibold text-galaxy-ink">
          Save audience
        </button>
      </div>

      {saved && <p className="text-sm text-galaxy-positive">Saved: {saved}</p>}
    </div>
  );
}
```

Create `src/components/panels/nba-card.tsx`:

```tsx
'use client';

import type { RecommendedPlay, Segment } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';
import { formatEnriched } from '@/lib/format';

export function NbaCard({ segment, play, onPush }: { segment: Segment; play: RecommendedPlay; onPush: () => void }) {
  return (
    <article className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-galaxy-muted">{play.lever}</p>
          <h3 className="mt-2 font-serif text-2xl text-galaxy-cream">{play.title}</h3>
        </div>
        <CdeChip />
      </div>
      <p className="mt-4 text-sm leading-6 text-galaxy-muted">{play.rationale}</p>
      {play.offerTerm && <p className="mt-3 rounded-lg bg-galaxy-gold/12 px-3 py-2 text-sm text-galaxy-gold">{play.offerTerm}</p>}
      <div className="mt-4 grid gap-3 text-sm text-galaxy-muted md:grid-cols-3">
        <span>Audience {segment.sizeBand}</span>
        <span>{formatEnriched(segment.opportunityIndex, 'index')}</span>
        <span>{play.channel}</span>
      </div>
      <button type="button" onClick={onPush} className="mt-5 rounded-lg border border-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-gold">
        Push to campaign
      </button>
    </article>
  );
}
```

- [ ] **Step 4: Add propensity and activation routes**

Create `src/app/propensity/page.tsx`:

```tsx
'use client';

import { AudienceBuilder } from '@/components/panels/audience-builder';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { useAppState } from '@/store/app-store';

export default function PropensityPage() {
  const { segments } = useAppState();
  const mix = segments.map((segment) => `${segment.name}: ${segment.sizeBand}`).join(' · ');

  return (
    <div className="space-y-6">
      <div>
        <Overline>Turn insight into a targetable audience</Overline>
        <h1 className="mt-2 font-serif text-5xl text-galaxy-cream">Propensity & Audience Builder</h1>
        <p className="mt-3 max-w-3xl text-galaxy-muted">Filter appended propensities, leakage index, and segment membership to create a Galaxy Rewards activation audience.</p>
      </div>
      <Panel>
        <AudienceBuilder />
      </Panel>
      <Panel>
        <h2 className="font-serif text-3xl text-galaxy-cream">Audience composition</h2>
        <p className="mt-3 text-sm leading-7 text-galaxy-muted">{mix}</p>
      </Panel>
    </div>
  );
}
```

Create `src/app/activation/page.tsx`:

```tsx
'use client';

import { NbaCard } from '@/components/panels/nba-card';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { useAppState } from '@/store/app-store';

export default function ActivationPage() {
  const { segments, savedAudiences, campaignToast, pushCampaign } = useAppState();
  const audiences = savedAudiences.length ? savedAudiences : [{ id: 'top-segments', name: 'Top leakage segments' }];

  return (
    <div className="space-y-6">
      <div>
        <Overline>Act</Overline>
        <h1 className="mt-2 font-serif text-5xl text-galaxy-cream">Next-Best-Action</h1>
        <p className="mt-3 max-w-3xl text-galaxy-muted">Recommended Galaxy levers based on leakage, propensity, and channel preference.</p>
      </div>

      {campaignToast && <div className="rounded-xl border border-galaxy-positive bg-galaxy-positive/10 p-4 text-galaxy-positive">{campaignToast}</div>}

      <Panel>
        <h2 className="font-serif text-3xl text-galaxy-cream">Saved audiences</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {audiences.map((audience) => (
            <span key={audience.id} className="rounded-full border border-galaxy-border px-3 py-2 text-sm text-galaxy-muted">{audience.name}</span>
          ))}
        </div>
      </Panel>

      <section className="grid gap-4 xl:grid-cols-2">
        {segments.flatMap((segment) =>
          segment.recommendedPlays.map((play) => (
            <NbaCard key={`${segment.id}-${play.title}`} segment={segment} play={play} onPush={() => pushCampaign(`${segment.name} - ${play.title}`)} />
          )),
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Verify propensity, activation, and build**

Run:

```bash
npm run test -- src/app/propensity/page.test.tsx src/app/activation/page.test.tsx
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 6: Commit propensity and activation**

Run:

```bash
git add src/app/activation src/app/propensity src/components/panels/audience-builder.tsx src/components/panels/nba-card.tsx src/store/app-store.tsx
git commit -m "feat: add audience builder and activation"
```

Expected: one commit with audience building, saved audiences, and NBA cards.

---

### Task 10: Market Scan Route And README Demo Script

**Files:**
- Create: `src/app/marketscan/page.tsx`
- Create: `src/app/marketscan/page.test.tsx`
- Create: `README.md`

- [ ] **Step 1: Write failing market scan test**

Create `src/app/marketscan/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import MarketScanPage from './page';

describe('Market Scan route', () => {
  it('renders the illustrative companion board', () => {
    render(
      <AppStateProvider>
        <MarketScanPage />
      </AppStateProvider>,
    );

    expect(screen.getByRole('heading', { name: /Market Scan/i })).toBeInTheDocument();
    expect(screen.getByText(/illustrative market-scan companion/i)).toBeInTheDocument();
    expect(screen.getByText(/competitor calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/social sentiment/i)).toBeInTheDocument();
    expect(screen.getByText(/share of voice/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the market scan test to verify it fails**

Run:

```bash
npm run test -- src/app/marketscan/page.test.tsx
```

Expected: FAIL because `/marketscan` has not been created.

- [ ] **Step 3: Implement market scan route**

Create `src/app/marketscan/page.tsx`:

```tsx
import { marketScanTiles } from '@/data';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';

export default function MarketScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <Overline>Illustrative companion</Overline>
        <h1 className="mt-2 font-serif text-5xl text-galaxy-cream">Market Scan</h1>
        <p className="mt-3 max-w-3xl text-galaxy-muted">A clearly synthetic board for competitor, social, PR/news, share-of-voice, and footfall signals. This is an illustrative market-scan companion.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {marketScanTiles.map((tile) => (
          <Panel key={tile.title}>
            <p className="text-xs uppercase tracking-[0.18em] text-galaxy-gold">{tile.sourceType}</p>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">{tile.title}</h2>
            <p className="mt-4 text-sm leading-6 text-galaxy-muted">{tile.signal}</p>
            <p className="mt-4 rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4 text-sm leading-6 text-galaxy-cream">{tile.implication}</p>
          </Panel>
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Add README with run, deploy, compliance, and demo script**

Create `README.md`:

````md
# Galaxy Constellation

Guest Wallet Intelligence dashboard for the Galaxy Macau x Mastercard CDE showcase.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verify

```bash
npm run test
npm run build
npm run test:e2e
```

## Deployment

Deploy to Vercel as a standard Next.js app. The app has no backend, database, or server environment variables.

## Compliance Rules

- CDE-enriched and off-property wallet values render only as `%`, `Index`, or `equiv.` bands.
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
````

- [ ] **Step 5: Verify market scan and build**

Run:

```bash
npm run test -- src/app/marketscan/page.test.tsx
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 6: Commit market scan and README**

Run:

```bash
git add README.md src/app/marketscan
git commit -m "feat: add market scan and demo script"
```

Expected: one commit with market scan and README.

---

### Task 11: Rendered Compliance And Responsive Verification

**Files:**
- Create: `e2e/compliance.spec.ts`
- Modify: any route/component file that fails this test

- [ ] **Step 1: Write rendered compliance tests**

Create `e2e/compliance.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const routes = ['/', '/wallet', '/segments', '/leakage', '/propensity', '/activation', '/marketscan'];

test.describe('Galaxy Constellation rendered compliance', () => {
  for (const route of routes) {
    test(`${route} shows CDE methodology and avoids banned CDE currency patterns`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
      await expect(page.getByText(/7 active CDE metrics/i)).toBeVisible();
      await expect(page.locator('body')).not.toContainText('HKD');
      await expect(page.locator('body')).not.toContainText('$');

      if (route !== '/activation') {
        await expect(page.locator('body')).not.toContainText('MOP');
      }
    });
  }

  test('desktop projector viewport has visible nav, top bar, and main hero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Overview/i })).toBeVisible();
    await expect(page.getByLabel('Quarter selector')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Galaxy Constellation/i })).toBeVisible();
  });

  test('mobile viewport keeps core navigation and methodology accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/leakage');
    await expect(page.getByRole('heading', { name: /Cross-Property Leakage/i })).toBeVisible();
    await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run rendered tests to verify failures**

Run:

```bash
npm run test:e2e
```

Expected before route polish: FAIL if any route misses the methodology note, uses a banned currency pattern, hides the top bar at 1440x900, or lacks the seven-metric chip.

- [ ] **Step 3: Fix the specific rendered failures**

Apply only targeted changes. Use these exact fixes based on the failure class:

```tsx
// If a CDE value renders without a chip, replace the local value with:
<IndexValue value={segment.opportunityIndex} label="Opportunity" />

// If an enriched band includes a currency code, replace the band data with:
crossPropertyCashBand: '8-12k equiv./mo'

// If a non-activation route includes MOP, move the offer term into an activation-only NbaCard.

// If the methodology note is missing, ensure the route is inside src/components/shell/app-shell.tsx through src/app/layout.tsx.
```

- [ ] **Step 4: Run full verification**

Run:

```bash
npm run test
npm run build
npm run test:e2e
```

Expected: all unit tests pass, Next production build succeeds, and Playwright passes for desktop and mobile projects.

- [ ] **Step 5: Commit compliance verification**

Run:

```bash
git add e2e/compliance.spec.ts src
git commit -m "test: add rendered CDE compliance checks"
```

Expected: one commit with Playwright compliance coverage and any targeted fixes.

---

### Task 12: Final Product Polish Pass

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/shell/nav.tsx`
- Modify: `src/components/ui/*`
- Modify: route files only where visual QA shows crowding or missing responsive behavior

- [ ] **Step 1: Run the app locally for visual QA**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Expected: dev server starts at `http://127.0.0.1:3000`.

- [ ] **Step 2: Inspect required routes at projector size**

Open these routes at 1440x900:

```text
http://127.0.0.1:3000/
http://127.0.0.1:3000/wallet
http://127.0.0.1:3000/segments
http://127.0.0.1:3000/leakage
http://127.0.0.1:3000/propensity
http://127.0.0.1:3000/activation
http://127.0.0.1:3000/marketscan
```

Expected:

- Nav and top bar are visible.
- No text overlaps inside cards, buttons, charts, or tables.
- Gold is used for accents and hero numbers, not as large filled backgrounds.
- Every screen reads as dark luxury Galaxy-adjacent, with text wordmarks only.
- The methodology footer remains visible after scrolling to the bottom.

- [ ] **Step 3: Apply exact CSS polish if visual QA shows cramped route spacing**

Modify `src/app/globals.css` by appending:

```css
.recharts-wrapper text {
  fill: #9a9486;
  font-family: var(--font-sans), Inter, sans-serif;
}

button,
a,
select,
input {
  outline-color: #c9a45c;
}

@media (max-width: 1024px) {
  nav {
    border-right: 0;
    border-bottom: 1px solid #2c2c36;
  }
}
```

- [ ] **Step 4: Stop the dev server and run final verification**

Stop the dev server with `Ctrl-C`, then run:

```bash
npm run verify
git status -sb
```

Expected:

- `npm run verify` passes.
- `git status -sb` shows only the final polish files modified.

- [ ] **Step 5: Commit polish**

Run:

```bash
git add src/app/globals.css src/app src/components README.md
git commit -m "polish: finalize Galaxy demo experience"
```

Expected: one final polish commit. If Step 3 made no file changes, skip this commit and record in the execution notes that no polish commit was needed.

---

## Acceptance Checklist

- [ ] `npm run test` passes.
- [ ] `npm run build` passes with no server env vars.
- [ ] `npm run test:e2e` passes at 1440x900 and mobile viewport.
- [ ] CDE/off-property/customer-wallet figures render only as `%`, `Index`, or `equiv.` bands.
- [ ] `MOP` appears only in activation offer mechanics such as `MOP 200 rebate on MOP 500 spend`.
- [ ] No `HKD` or `$` appears in rendered UI.
- [ ] Every route includes the persistent methodology footer.
- [ ] Top bar shows current quarter, `7 active CDE metrics`, and matched coverage.
- [ ] `/wallet` does not split F&B below bars/clubs and full-service restaurants.
- [ ] `/segments` CRM table uses masked IDs and no exact money values.
- [ ] `/leakage` uses modelled band and index language for cross-property cash.
- [ ] `/activation` maps recommendations to real Galaxy levers and shows a mock export toast.
- [ ] `/marketscan` is clearly labelled as an illustrative market-scan companion.
- [ ] The UI uses text-based wordmarks only and no real logo image files.

## Self-Review

Spec coverage:

- Business thesis, CDE product framing, compliance rules, and methodology transparency are covered in Tasks 2, 3, 5, and 11.
- All six primary routes plus `/marketscan` are covered in Tasks 5 through 10.
- Synthetic deterministic data, six segments, four quarters, seven active metrics, propensities, CRM rows, and opportunity index derivation are covered in Task 2.
- Galaxy dark/gold design, typography, shell, nav, top bar, and methodology footer are covered in Tasks 1, 3, and 12.
- Acceptance and deploy readiness are covered in Tasks 10 through 12.

Placeholder scan:

- The restricted placeholder phrases are absent from implementation steps.
- Each code-writing step names the exact files and provides concrete code or a targeted replacement pattern.

Type consistency:

- `Segment`, `CoreCategory`, `CategoryWallet`, `CdeMetrics`, `Propensities`, and `RecommendedPlay` are defined once in `src/data/types.ts`.
- Route and component code uses the same `opportunityIndex`, `crossPropertyCashBand`, `metrics.shareOfWallet`, and `propensities.coBrandLookAlike` names from the data contract.
- `formatEnriched()` accepts only `pct`, `index`, and `band`; activation offer terms use separate `offerTerm` strings and `formatOfferMoney()` where numeric MOP rendering is needed.
