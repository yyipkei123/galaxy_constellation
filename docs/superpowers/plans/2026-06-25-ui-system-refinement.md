# Galaxy UI System Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the current Galaxy Constellation frontend into a more executive, analytical, and mobile-efficient product UI while preserving the luxury dark brand and all CDE compliance rules.

**Architecture:** Add a small layer of shared dashboard primitives, then migrate routes toward compact analytical headers and decision-first content ordering. Keep the overview route more expressive, but make `/wallet`, `/segments`, `/leakage`, `/propensity`, `/activation`, and `/marketscan` feel like focused dashboard workspaces instead of repeated presentation slides. Preserve all current routes, data, state management, CDE-safe formatting, and assistant behavior.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind v4 theme tokens, existing Recharts, existing Lucide icons, Vitest with Testing Library, Playwright e2e.

---

## Design Read And Guardrails

Reading this as: executive B2B analytics demo for Galaxy/Mastercard stakeholders, with a luxury dark dashboard language, leaning toward a custom Tailwind product UI system.

Recommended dials:
- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 2`
- `VISUAL_DENSITY: 8`

Execution guardrails:
- No new dependencies.
- No new routes.
- No backend or live AI service.
- No change to CDE compliance rules.
- No `HKD`, `MOP`, `$`, `元`, or raw spend values in CDE-enriched analytics outside the existing Galaxy activation offer term.
- Keep the dark Galaxy theme, gold accent, and compliance copy visible.
- Use serif type only where it carries brand presence: brand lockup and top route titles. Use sans/mono for analytical sections, KPIs, charts, cards, and labels.
- Reduce repeated small uppercase labels. Keep them for route-level context, compliance labels, and critical analytical grouping only.
- Preserve keyboard accessibility, visible focus states, and current e2e coverage.

## File Structure

Create these shared UI primitives:
- `src/components/ui/page-header.tsx`: shared route header with `hero` and `compact` variants.
- `src/components/ui/page-header.test.tsx`: tests for visual variant classes and semantic heading behavior.
- `src/components/ui/section-header.tsx`: section title and optional description primitive that defaults to sans dashboard type.
- `src/components/ui/section-header.test.tsx`: tests for heading levels and optional overline behavior.
- `src/components/ui/metric-tile.tsx`: dense KPI tile primitive with tabular number styling and optional CDE-safe detail.
- `src/components/ui/metric-tile.test.tsx`: tests for labels, values, and optional detail rendering.

Modify typography tokens:
- `src/app/layout.tsx`: rename font CSS variables and introduce Geist/Geist Mono via `next/font/google`.
- `src/app/globals.css`: map Tailwind `font-display`, `font-sans`, and `font-mono` to the Next font variables.

Modify shell and assistant:
- `src/components/shell/top-bar.tsx`: compact mobile metadata row, shorter label text on small screens, same accessible quarter selector.
- `src/components/shell/top-bar.test.tsx`: preserve current behavior and add compact metadata assertions.
- `src/components/assistant/chat-assistant-launcher.tsx`: smaller mobile FAB with safe-area bottom spacing and desktop label rail.
- `src/components/assistant/chat-assistant-launcher.test.tsx`: verify accessible names and responsive class contract.

Modify route files:
- `src/app/page.tsx`: keep expressive overview header, but use shared `PageHeader`.
- `src/app/wallet/page.tsx`: compact header, decision visual first, KPI snapshot as supporting context.
- `src/app/wallet/page.test.tsx`: assert compact header and decision-first ordering.
- `src/app/segments/page.tsx`: compact header, move persona universe and persona recommendation kit above technical charts.
- `src/app/segments/page.test.tsx`: assert persona decision content appears before technical chart content.
- `src/app/leakage/page.tsx`: compact header and less repeated serif/overline usage.
- `src/app/propensity/page.tsx`: compact header and immediate builder focus.
- `src/app/activation/page.tsx`: compact header, safe assistant overlap, preserved activation offer term.
- `src/app/marketscan/page.tsx`: compact header and denser tile rhythm.
- Existing route tests under `src/app/*/page.test.tsx`: adjust expected copy only where header copy changes.
- `e2e/compliance.spec.ts`: extend responsive checks for active nav visibility, assistant overlap buffer, and no horizontal overflow across key routes.

---

### Task 1: Shared UI Primitives And Typography Tokens

**Files:**
- Create: `src/components/ui/page-header.tsx`
- Create: `src/components/ui/page-header.test.tsx`
- Create: `src/components/ui/section-header.tsx`
- Create: `src/components/ui/section-header.test.tsx`
- Create: `src/components/ui/metric-tile.tsx`
- Create: `src/components/ui/metric-tile.test.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing tests for the new primitives**

Create `src/components/ui/page-header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders a compact analytical header with sans title styling', () => {
    render(
      <PageHeader
        variant="compact"
        eyebrow="Wallet analytics"
        title="Share of Wallet"
        description="Prioritize wallet gaps by segment, category, and channel signal."
        aside={<p>2026 Q2</p>}
      />,
    );

    const region = screen.getByRole('region', { name: 'Share of Wallet' });
    expect(region).toHaveAttribute('data-variant', 'compact');
    expect(screen.getByRole('heading', { name: 'Share of Wallet', level: 1 })).toHaveClass('font-sans');
    expect(screen.getByText('Wallet analytics')).toBeInTheDocument();
    expect(screen.getByText('2026 Q2')).toBeInTheDocument();
  });

  it('renders the hero variant with display title styling for overview only', () => {
    render(
      <PageHeader
        variant="hero"
        eyebrow="Guest wallet intelligence"
        title="Galaxy Constellation"
        description="Reveal captured wallet and CDE-modeled headroom."
      />,
    );

    const region = screen.getByRole('region', { name: 'Galaxy Constellation' });
    expect(region).toHaveAttribute('data-variant', 'hero');
    expect(screen.getByRole('heading', { name: 'Galaxy Constellation', level: 1 })).toHaveClass('font-display');
  });
});
```

Create `src/components/ui/section-header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { SectionHeader } from './section-header';

describe('SectionHeader', () => {
  it('renders a sans dashboard heading and optional description', () => {
    render(
      <SectionHeader
        eyebrow="Segment x category"
        title="Segment opportunity heatmap"
        description="Heat shows wallet-gap priority by segment and visible category."
      />,
    );

    expect(screen.getByText('Segment x category')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Segment opportunity heatmap', level: 2 })).toHaveClass('font-sans');
    expect(screen.getByText(/wallet-gap priority/i)).toBeInTheDocument();
  });

  it('supports h3 for nested analytical sections', () => {
    render(<SectionHeader as="h3" title="Channel mix" />);

    expect(screen.getByRole('heading', { name: 'Channel mix', level: 3 })).toBeInTheDocument();
  });
});
```

Create `src/components/ui/metric-tile.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MetricTile } from './metric-tile';

describe('MetricTile', () => {
  it('renders label, value, and detail using dense dashboard styling', () => {
    render(
      <MetricTile
        label="Average leakage"
        value="53%"
        detail="Market remainder visible through CDE enrichment."
      />,
    );

    expect(screen.getByText('Average leakage')).toBeInTheDocument();
    expect(screen.getByText('53%')).toHaveClass('font-mono');
    expect(screen.getByText(/Market remainder/i)).toBeInTheDocument();
  });

  it('omits the detail node when no detail is provided', () => {
    render(<MetricTile label="Top wallet gap" value="Retail-Luxury" />);

    expect(screen.getByText('Top wallet gap')).toBeInTheDocument();
    expect(screen.queryByText(/undefined|null/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the primitive tests and confirm they fail**

Run:

```bash
npm run test -- src/components/ui/page-header.test.tsx src/components/ui/section-header.test.tsx src/components/ui/metric-tile.test.tsx
```

Expected: FAIL because `page-header`, `section-header`, and `metric-tile` modules do not exist.

- [ ] **Step 3: Add the shared primitives**

Create `src/components/ui/page-header.tsx`:

```tsx
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Overline } from './overline';

interface PageHeaderProps {
  title: string;
  description: ReactNode;
  eyebrow?: ReactNode;
  aside?: ReactNode;
  variant?: 'hero' | 'compact';
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  aside,
  variant = 'compact',
  className,
}: PageHeaderProps) {
  const isHero = variant === 'hero';

  return (
    <section
      aria-labelledby="page-title"
      data-variant={variant}
      className={clsx(
        'rounded-lg border border-galaxy-border bg-[linear-gradient(135deg,rgba(31,27,24,0.9),rgba(8,18,30,0.9))] shadow-2xl shadow-black/20',
        isHero ? 'px-5 py-7 sm:px-6 md:px-8 md:py-8' : 'px-4 py-5 sm:px-5 md:px-6',
        className,
      )}
    >
      <div className={clsx('grid gap-4', aside ? 'lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end' : '')}>
        <div>
          {eyebrow ? <Overline>{eyebrow}</Overline> : null}
          <h1
            id="page-title"
            className={clsx(
              'mt-3 text-galaxy-cream',
              isHero
                ? 'font-display text-4xl leading-[1.02] sm:text-5xl md:text-6xl'
                : 'font-sans text-3xl font-semibold leading-tight tracking-normal sm:text-4xl',
            )}
          >
            {title}
          </h1>
          <div
            className={clsx(
              'mt-3 max-w-3xl text-galaxy-muted',
              isHero ? 'text-base leading-8 md:text-lg' : 'text-sm leading-6 md:text-base md:leading-7',
            )}
          >
            {description}
          </div>
        </div>
        {aside ? (
          <div className="rounded-lg border border-galaxy-gold/30 bg-galaxy-ink/45 p-4 text-sm leading-6 text-galaxy-muted">
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}
```

Create `src/components/ui/section-header.tsx`:

```tsx
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Overline } from './overline';

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
}

export function SectionHeader({
  title,
  description,
  eyebrow,
  as: Heading = 'h2',
  className,
}: SectionHeaderProps) {
  return (
    <div className={clsx('min-w-0', className)}>
      {eyebrow ? <Overline>{eyebrow}</Overline> : null}
      <Heading className="mt-2 font-sans text-2xl font-semibold leading-tight tracking-normal text-galaxy-cream md:text-3xl">
        {title}
      </Heading>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted md:text-base md:leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}
```

Create `src/components/ui/metric-tile.tsx`:

```tsx
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface MetricTileProps {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  className?: string;
}

export function MetricTile({ label, value, detail, className }: MetricTileProps) {
  return (
    <article className={clsx('rounded-lg border border-galaxy-border bg-galaxy-charcoal/72 p-4', className)}>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-galaxy-muted">{label}</p>
      <div className="mt-3 font-mono text-2xl font-semibold tabular-nums text-galaxy-cream md:text-3xl">
        {value}
      </div>
      {detail ? <div className="mt-3 text-sm leading-6 text-galaxy-muted">{detail}</div> : null}
    </article>
  );
}
```

- [ ] **Step 4: Update font tokens**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, Geist, Geist_Mono } from 'next/font/google';
import { AppShell } from '@/components/shell/app-shell';
import { Providers } from './providers';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-galaxy-display',
});

const sans = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-galaxy-sans',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-galaxy-mono',
});

export const metadata: Metadata = {
  title: 'Galaxy Constellation',
  description: 'Guest Wallet Intelligence enriched by Mastercard CDE',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
```

Update the `@theme` block in `src/app/globals.css` by adding these three font tokens after `@theme {`:

```css
  --font-display: var(--font-galaxy-display);
  --font-sans: var(--font-galaxy-sans);
  --font-mono: var(--font-galaxy-mono);
```

- [ ] **Step 5: Run primitive tests and build type check**

Run:

```bash
npm run test -- src/components/ui/page-header.test.tsx src/components/ui/section-header.test.tsx src/components/ui/metric-tile.test.tsx
npm run build
```

Expected: PASS for tests and build.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/app/layout.tsx src/app/globals.css src/components/ui/page-header.tsx src/components/ui/page-header.test.tsx src/components/ui/section-header.tsx src/components/ui/section-header.test.tsx src/components/ui/metric-tile.tsx src/components/ui/metric-tile.test.tsx
git commit -m "Add dashboard UI primitives"
```

---

### Task 2: Wallet Route Decision-First Layout

**Files:**
- Modify: `src/app/wallet/page.tsx`
- Modify: `src/app/wallet/page.test.tsx`

- [ ] **Step 1: Add failing wallet layout tests**

Append this test inside `describe('share of wallet route', ...)` in `src/app/wallet/page.test.tsx`:

```tsx
  it('uses a compact analytical header and leads with decision visuals before KPI support', () => {
    renderWallet();

    expect(screen.queryByText('Reveal the gap')).not.toBeInTheDocument();
    expect(screen.getByText('Wallet analytics')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Share of Wallet', level: 1 })).toHaveClass('font-sans');

    const heatmapHeading = screen.getByRole('heading', { name: 'Segment opportunity heatmap' });
    const snapshotHeading = screen.getByRole('heading', { name: 'Wallet analytics snapshot' });
    const rankingHeading = screen.getByRole('heading', { name: 'Ranked category leakage' });

    expect(Boolean(heatmapHeading.compareDocumentPosition(snapshotHeading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean(rankingHeading.compareDocumentPosition(snapshotHeading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });
```

- [ ] **Step 2: Run the wallet route test and confirm it fails**

Run:

```bash
npm run test -- src/app/wallet/page.test.tsx
```

Expected: FAIL because the route still renders `Reveal the gap`, the H1 is still serif, and the KPI snapshot appears before decision visuals.

- [ ] **Step 3: Update wallet imports**

In `src/app/wallet/page.tsx`, add these imports:

```tsx
import { PageHeader } from '@/components/ui/page-header';
import { SectionHeader } from '@/components/ui/section-header';
import { MetricTile } from '@/components/ui/metric-tile';
```

Keep existing imports that are still used. Remove `KpiCard` after replacing `AnalyticsSnapshot`.

- [ ] **Step 4: Replace the route hero with a compact PageHeader**

Replace the first `<section ...>` in the `return` of `WalletPage` with:

```tsx
      <PageHeader
        variant="compact"
        eyebrow="Wallet analytics"
        title="Share of Wallet"
        description={(
          <>
            Prioritize Galaxy wallet gaps by segment, category, and channel signal. CDE-enriched values remain indexed,
            percentage-based, or banded.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">{selectedQuarter.label}</p>
            <p className="mt-2">
              Wallet and visit signals are modelled from Mastercard CDE segment behavior.
            </p>
          </>
        )}
      />
```

- [ ] **Step 5: Replace AnalyticsSnapshot cards with MetricTile and SectionHeader**

Replace the header block inside `AnalyticsSnapshot` with:

```tsx
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Executive wallet view"
          title="Wallet analytics snapshot"
          description="Supporting KPI context for the visible category and segment wallet-gap analysis."
        />
      </div>
```

Replace the four `<KpiCard />` elements with:

```tsx
        <MetricTile
          label="Average capture"
          value={<PercentValue value={summary.averageCapturePct} />}
          detail="Across visible wallet categories."
        />
        <MetricTile
          label="Average leakage"
          value={<PercentValue value={summary.averageLeakagePct} />}
          detail="Market remainder visible through CDE enrichment."
        />
        <MetricTile
          label="Highest leakage"
          value={summary.highestLeakageCategory.label}
          detail={<PercentValue value={summary.highestLeakageCategory.leakagePct} />}
        />
        <MetricTile
          label="Top wallet gap"
          value={hasSegments ? summary.topWalletSegment.name : 'No active segment'}
          detail={summary.channelSkew}
        />
```

- [ ] **Step 6: Reorder the wallet body so decision visuals come first**

In the `return` of `WalletPage`, after the category filter block, order the major sections exactly like this:

```tsx
      <SegmentOpportunityHeatmap analytics={walletAnalytics} hasSegments={hasSegments} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <RankedCategoryLeakage analytics={walletAnalytics} hasSegments={hasSegments} />
        <SegmentGapLadder analytics={walletAnalytics} hasSegments={hasSegments} />
      </div>

      <AnalyticsSnapshot analytics={walletAnalytics} hasSegments={hasSegments} />
```

Leave `Visible category capture`, scatter, and channel sections after these blocks.

- [ ] **Step 7: Run wallet tests and compliance e2e for `/wallet`**

Run:

```bash
npm run test -- src/app/wallet/page.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "/wallet remains CDE-safe"
```

Expected: PASS. The route remains CDE-safe, responsive, and decision-first.

- [ ] **Step 8: Commit Task 2**

Run:

```bash
git add src/app/wallet/page.tsx src/app/wallet/page.test.tsx
git commit -m "Refine wallet decision layout"
```

---

### Task 3: Segments Route Persona-First Layout

**Files:**
- Modify: `src/app/segments/page.tsx`
- Modify: `src/app/segments/page.test.tsx`

- [ ] **Step 1: Add failing segments layout tests**

Append this test inside `describe('segments route', ...)` in `src/app/segments/page.test.tsx`:

```tsx
  it('uses a compact header and places persona decisions before technical charts', () => {
    renderSegments();

    expect(screen.queryByText('Zoom to a segment')).not.toBeInTheDocument();
    expect(screen.getByText('Guest segmentation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Guest Segments', level: 1 })).toHaveClass('font-sans');

    const personaUniverseHeading = screen.getByRole('heading', { name: /Persona universe/i });
    const personaKitHeading = screen.getByRole('heading', { name: /Persona recommendation kit/i });
    const categoryProfileHeading = screen.getByRole('heading', { name: /Indexed category profile/i });

    expect(Boolean(personaUniverseHeading.compareDocumentPosition(categoryProfileHeading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean(personaKitHeading.compareDocumentPosition(categoryProfileHeading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });
```

- [ ] **Step 2: Run the segments test and confirm it fails**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
```

Expected: FAIL because the route still renders `Zoom to a segment`, the H1 is serif, and persona decision content appears after technical chart content.

- [ ] **Step 3: Update segments imports**

In `src/app/segments/page.tsx`, add:

```tsx
import { PageHeader } from '@/components/ui/page-header';
import { SectionHeader } from '@/components/ui/section-header';
```

Keep `Overline` only for nested labels that remain intentionally small and compliance-oriented.

- [ ] **Step 4: Replace the segments hero with PageHeader**

Replace the opening hero `<section ...>` with:

```tsx
      <PageHeader
        variant="compact"
        eyebrow="Guest segmentation"
        title="Guest Segments"
        description={(
          <>
            Move from top-level CDE segments into second-level personas, recommendation kits, and activation-ready
            audience decisions without exposing raw spend values.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">CDE-compliant profile</p>
            <p className="mt-2">
              Segment cards, propensity scores, and CRM append fields stay indexed, percentage-based, or banded.
            </p>
          </>
        )}
      />
```

- [ ] **Step 5: Reorder active segment, persona universe, and persona kit**

Inside the `activeSegment ? (...)` branch, use this top-level order:

```tsx
          <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
            <div role="group" className="space-y-3" aria-label="Segment rail">
              {safeSegments.map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  isSelected={segment.id === activeSegment.id}
                  onSelect={selectSegment}
                />
              ))}
            </div>

            <div className="space-y-6">
              <Panel className="bg-[linear-gradient(135deg,rgba(205,164,92,0.12),rgba(12,23,35,0.78))]">
                <SectionHeader
                  eyebrow={activeSegment.nameZh}
                  title={activeSegment.name}
                  description={activeSegment.signatureTrait}
                />
              </Panel>

              {insightNarrative ? (
                <>
                  <ExecutiveSummaryPanel narrative={insightNarrative} />
                  <EvidenceStrip steps={insightNarrative.fusionSteps} />
                  <HeadlineFindings title="Why this segment matters now" findings={insightNarrative.findings} />
                </>
              ) : null}
            </div>
          </div>

          <PersonaUniverse summary={personaSummary} />

          <Panel>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <SectionHeader
                eyebrow="Persona drill-down"
                title="Persona explorer"
                description="Second-level personas translate the selected Galaxy segment into audience-sized actions, CDE evidence, and activation recommendations."
              />
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
              {filteredPersonas.length > 0 && selectedPersona ? filteredPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  isSelected={persona.id === selectedPersona.id}
                  onSelect={selectPersona}
                />
              )) : (
                <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted lg:col-span-3">
                  No personas match the current filters for this segment.
                </p>
              )}
            </div>
          </Panel>

          {selectedPersona ? <PersonaDetailKit persona={selectedPersona} /> : null}
```

Then keep the technical content after that in this order:

```tsx
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <Panel>
              <div className="mb-5">
                <SectionHeader eyebrow="Category spend radar" title="Indexed category profile" />
              </div>
              <SpendRadar segment={activeSegment} />
              {insightNarrative ? (
                <div className="mt-5">
                  <ChartCallout>{insightNarrative.chartCallout}</ChartCallout>
                </div>
              ) : null}
              <p className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
                Gaming context is first-party indexed only and not a leakage category.
              </p>
            </Panel>

            <Panel>
              <SectionHeader eyebrow="Propensity" title="Activation signals" />
              <div className="mt-5 space-y-4">
                <PropensityGauge label="High Spender in Luxury Hotels" value={activeSegment.propensities.luxuryHotelSpender} />
                <PropensityGauge label="Top-Tier Rewards Spender" value={activeSegment.propensities.topTierRewards} />
                <PropensityGauge label="Co-Brand Look-Alike" value={activeSegment.propensities.coBrandLookAlike} />
              </div>
            </Panel>
          </div>

          <CdeMetricPanel metrics={activeSegment.metrics} />
```

- [ ] **Step 6: Run segments tests and route compliance**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "/segments shows CDE methodology"
```

Expected: PASS. The persona decision flow appears before technical charts and the route remains CDE-safe.

- [ ] **Step 7: Commit Task 3**

Run:

```bash
git add src/app/segments/page.tsx src/app/segments/page.test.tsx
git commit -m "Refine segments persona flow"
```

---

### Task 4: Compact Headers For Secondary Routes

**Files:**
- Modify: `src/app/leakage/page.tsx`
- Modify: `src/app/propensity/page.tsx`
- Modify: `src/app/activation/page.tsx`
- Modify: `src/app/marketscan/page.tsx`
- Modify: `src/app/leakage/page.test.tsx`
- Modify: `src/app/propensity/page.test.tsx`
- Modify: `src/app/activation/page.test.tsx`
- Modify: `src/app/marketscan/page.test.tsx`

- [ ] **Step 1: Add compact header assertions to secondary route tests**

In each route test file, add the relevant assertion.

For `src/app/leakage/page.test.tsx`:

```tsx
expect(screen.getByText('Leakage review')).toBeInTheDocument();
expect(screen.getByRole('heading', { name: 'Cross-Property Leakage', level: 1 })).toHaveClass('font-sans');
```

For `src/app/propensity/page.test.tsx`:

```tsx
expect(screen.getByText('Audience build')).toBeInTheDocument();
expect(screen.getByRole('heading', { name: 'Propensity & Audience Builder', level: 1 })).toHaveClass('font-sans');
```

For `src/app/activation/page.test.tsx`:

```tsx
expect(screen.getByText('Activation planning')).toBeInTheDocument();
expect(screen.getByRole('heading', { name: 'Next-Best-Action', level: 1 })).toHaveClass('font-sans');
```

For `src/app/marketscan/page.test.tsx`:

```tsx
expect(screen.getByText('Market context')).toBeInTheDocument();
expect(screen.getByRole('heading', { name: 'Market Scan', level: 1 })).toHaveClass('font-sans');
```

- [ ] **Step 2: Run the secondary route tests and confirm they fail**

Run:

```bash
npm run test -- src/app/leakage/page.test.tsx src/app/propensity/page.test.tsx src/app/activation/page.test.tsx src/app/marketscan/page.test.tsx
```

Expected: FAIL because the routes still use the previous hero labels and serif H1 styling.

- [ ] **Step 3: Replace each route hero with PageHeader**

In `src/app/leakage/page.tsx`, import `PageHeader` and replace the hero with:

```tsx
      <PageHeader
        variant="compact"
        eyebrow="Leakage review"
        title="Cross-Property Leakage"
        description={(
          <>
            Track where visible wallet leaves Galaxy, rank leakage drivers, and move validated segment priorities into
            audience activation.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">CDE-safe opportunity view</p>
            <p className="mt-2">Only percentages, indices, and equiv./mo bands are shown for enriched wallet signals.</p>
          </>
        )}
      />
```

In `src/app/propensity/page.tsx`, import `PageHeader` and replace the hero with:

```tsx
      <PageHeader
        variant="compact"
        eyebrow="Audience build"
        title="Propensity & Audience Builder"
        description={(
          <>
            Build a CDE-compliant target audience from segment-level luxury hotel, rewards, look-alike, and leakage
            signals.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">CDE activation guardrail</p>
            <p className="mt-2">Audience sizing and wallet potential stay at banded or indexed levels only.</p>
          </>
        )}
      />
```

In `src/app/activation/page.tsx`, import `PageHeader` and replace the hero with:

```tsx
      <PageHeader
        variant="compact"
        eyebrow="Activation planning"
        title="Next-Best-Action"
        description={(
          <>
            Move saved propensity audiences into Galaxy Rewards activation with segment-level rationale, compliant CDE
            sizing, and a suggested campaign channel.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">Galaxy Rewards</p>
            <p className="mt-2">Campaign mechanics can include offer terms while CDE estimates remain indexed or banded.</p>
          </>
        )}
      />
```

In `src/app/marketscan/page.tsx`, import `PageHeader` and replace the hero with:

```tsx
      <PageHeader
        variant="compact"
        eyebrow="Market context"
        title="Market Scan"
        description={(
          <>
            Review synthetic competitor calendar, social sentiment, PR/news, share-of-voice, and footfall signals
            alongside CDE opportunity sizing.
          </>
        )}
      />
```

- [ ] **Step 4: Run secondary route tests and compliance e2e**

Run:

```bash
npm run test -- src/app/leakage/page.test.tsx src/app/propensity/page.test.tsx src/app/activation/page.test.tsx src/app/marketscan/page.test.tsx
npm run test:e2e -- e2e/compliance.spec.ts --grep "shows CDE methodology"
```

Expected: PASS. All modified routes preserve methodology text and avoid banned CDE currency patterns.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add src/app/leakage/page.tsx src/app/propensity/page.tsx src/app/activation/page.tsx src/app/marketscan/page.tsx src/app/leakage/page.test.tsx src/app/propensity/page.test.tsx src/app/activation/page.test.tsx src/app/marketscan/page.test.tsx
git commit -m "Compact secondary route headers"
```

---

### Task 5: Mobile Shell And Assistant Refinement

**Files:**
- Modify: `src/components/shell/top-bar.tsx`
- Modify: `src/components/shell/top-bar.test.tsx`
- Modify: `src/components/assistant/chat-assistant-launcher.tsx`
- Modify: `src/components/assistant/chat-assistant-launcher.test.tsx`
- Modify: `src/components/assistant/chat-assistant-panel.tsx`

- [ ] **Step 1: Add failing top bar compact metadata test**

Append this test to `src/components/shell/top-bar.test.tsx`:

```tsx
  it('renders compact mobile metadata without losing the full accessible metric text', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByText('7 CDE metrics')).toBeInTheDocument();
    expect(screen.getByText('7 CDE metrics')).toHaveAttribute('aria-label', '7 active CDE metrics');
    expect(screen.getByText('Coverage 63%')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /quarter selector/i })).toHaveValue('2026-q2');
  });
```

- [ ] **Step 2: Add failing assistant launcher layout test**

Append this test to `src/components/assistant/chat-assistant-launcher.test.tsx`:

```tsx
  it('uses a smaller safe-area mobile launcher and a labeled desktop affordance', () => {
    renderLauncher();

    const launcher = screen.getByRole('button', { name: 'Open AI insight assistant' });
    expect(launcher).toHaveClass('bottom-[calc(env(safe-area-inset-bottom)+1rem)]');
    expect(launcher).toHaveClass('h-12');
    expect(launcher).toHaveClass('w-12');
    expect(within(launcher).getByText('Ask CDE AI')).toHaveClass('hidden');
  });
```

- [ ] **Step 3: Run shell and assistant tests and confirm they fail**

Run:

```bash
npm run test -- src/components/shell/top-bar.test.tsx src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: FAIL because the top bar still shows the longer mobile metadata text and the assistant launcher still uses a 56px icon-only button on all widths.

- [ ] **Step 4: Update the top bar compact mobile copy**

Replace the first metadata row in `src/components/shell/top-bar.tsx` with:

```tsx
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
```

Keep the existing `<label>` and `<select>` unchanged.

- [ ] **Step 5: Update assistant launcher responsive sizing**

Replace the launcher button class in `src/components/assistant/chat-assistant-launcher.tsx` with:

```tsx
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-galaxy-gold/50 bg-galaxy-gold text-galaxy-ink shadow-xl shadow-black/40 transition hover:bg-galaxy-gold-lite focus-visible:ring-2 focus-visible:ring-galaxy-gold focus-visible:ring-offset-2 focus-visible:ring-offset-galaxy-ink sm:right-6 lg:h-11 lg:w-auto lg:gap-2 lg:rounded-full lg:px-4"
```

Replace the icon-only content with:

```tsx
        <MessageCircle aria-hidden="true" size={22} />
        <span className="hidden text-sm font-semibold lg:inline">Ask CDE AI</span>
```

- [ ] **Step 6: Adjust the assistant panel bottom offset**

In `src/components/assistant/chat-assistant-panel.tsx`, replace the root dialog class segment:

```tsx
fixed bottom-24 right-4
```

with:

```tsx
fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4
```

Keep the existing `max-h`, width, border, and backdrop classes.

- [ ] **Step 7: Run shell and assistant tests**

Run:

```bash
npm run test -- src/components/shell/top-bar.test.tsx src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 5**

Run:

```bash
git add src/components/shell/top-bar.tsx src/components/shell/top-bar.test.tsx src/components/assistant/chat-assistant-launcher.tsx src/components/assistant/chat-assistant-launcher.test.tsx src/components/assistant/chat-assistant-panel.tsx
git commit -m "Refine mobile shell and assistant affordance"
```

---

### Task 6: Visual Regression E2E Coverage

**Files:**
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Add failing visual refinement e2e checks**

Append this test block to `e2e/compliance.spec.ts`:

```ts
  for (const viewport of [
    { label: 'iPhone', width: 390, height: 844 },
    { label: 'iPad', width: 820, height: 1180 },
    { label: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`refined shell and decision visuals fit ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of ['/wallet', '/segments', '/activation']) {
        await page.goto(route);
        await expect(page.getByRole('banner')).toContainText(/CDE metrics/i);
        await expect(page.getByRole('button', { name: /Open AI insight assistant/i })).toBeVisible();

        const activeNav = await page.locator('nav a[aria-current="page"]').boundingBox();
        expect(activeNav).not.toBeNull();
        expect(activeNav!.x).toBeGreaterThanOrEqual(-1);
        expect(activeNav!.x + activeNav!.width).toBeLessThanOrEqual(viewport.width + 1);

        const launcher = await page.getByRole('button', { name: /Open AI insight assistant/i }).boundingBox();
        expect(launcher).not.toBeNull();
        expect(launcher!.bottom).toBeLessThanOrEqual(viewport.height);

        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(scrollWidth).toBeLessThanOrEqual(viewport.width);
      }
    });
  }
```

- [ ] **Step 2: Run the new e2e checks and confirm they fail before prior tasks**

Run this only if Tasks 1-5 have not been implemented in the current worktree:

```bash
npm run test:e2e -- e2e/compliance.spec.ts --grep "refined shell"
```

Expected before Tasks 1-5: FAIL because the compact shell and assistant sizing contract is not present.

Expected after Tasks 1-5: PASS.

- [ ] **Step 3: Run the refined shell e2e checks after Tasks 1-5**

Run:

```bash
npm run test:e2e -- e2e/compliance.spec.ts --grep "refined shell"
```

Expected: PASS across iPhone, iPad, and desktop.

- [ ] **Step 4: Commit Task 6**

Run:

```bash
git add e2e/compliance.spec.ts
git commit -m "Add refined responsive visual checks"
```

---

### Task 7: Final Verification And Browser Review

**Files:**
- No source files unless verification exposes a bug.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run verify
```

Expected: PASS for lint, unit tests, production build, and Playwright e2e.

- [ ] **Step 2: Capture visual review screenshots**

Run:

```bash
node <<'NODE'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = '/tmp/galaxy-ui-refinement-review';
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const viewports = [
    { label: 'iphone', width: 390, height: 844 },
    { label: 'ipad', width: 820, height: 1180 },
    { label: 'desktop', width: 1440, height: 900 },
  ];
  const routes = ['/', '/wallet', '/segments', '/leakage', '/propensity', '/activation', '/marketscan'];

  const browser = await chromium.launch();
  const failures = [];
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(600);
      const slug = route === '/' ? 'overview' : route.slice(1);
      const screenshot = path.join(outDir, `${viewport.label}-${slug}.png`);
      await page.screenshot({ path: screenshot, fullPage: false });

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      if (scrollWidth > viewport.width) {
        failures.push(`${viewport.label} ${route}: body scrollWidth ${scrollWidth} > viewport ${viewport.width}`);
      }

      const text = await page.locator('body').innerText();
      if (!/Enriched figures are modelled estimates/i.test(text)) {
        failures.push(`${viewport.label} ${route}: methodology text missing`);
      }
    }
    await page.close();
  }
  await browser.close();

  console.log(JSON.stringify({ outDir, failures }, null, 2));
  if (failures.length > 0) process.exit(1);
})();
NODE
```

Expected: PASS with `failures: []` and screenshots in `/tmp/galaxy-ui-refinement-review`.

- [ ] **Step 3: Inspect key screenshots manually**

Open these files and confirm:
- `/tmp/galaxy-ui-refinement-review/iphone-wallet.png`: wallet decision visual appears earlier, assistant does not cover the header.
- `/tmp/galaxy-ui-refinement-review/iphone-segments.png`: persona/segment content begins quickly after compact header.
- `/tmp/galaxy-ui-refinement-review/ipad-wallet.png`: two-column dashboard rhythm is preserved.
- `/tmp/galaxy-ui-refinement-review/desktop-wallet.png`: wallet heatmap/ranking lead the page, KPI snapshot supports the decision flow.
- `/tmp/galaxy-ui-refinement-review/desktop-segments.png`: persona universe and recommendation kit appear before technical charts.

- [ ] **Step 4: Final git check**

Run:

```bash
git status -sb
git log --oneline --decorate -5
```

Expected:
- Only intended files are modified or committed.
- Pre-existing untracked `docs/` and `spec/` folders remain untouched unless this plan file is intentionally untracked before commit.

- [ ] **Step 5: Commit any verification-only fixes if needed**

If Step 1 or Step 2 exposes a bug, write the failing focused test first, implement the smallest fix, rerun the focused test, rerun `npm run verify`, then commit:

```bash
git add <focused-test-file> <fixed-source-file>
git commit -m "Fix UI refinement verification issue"
```

If no verification-only fix is needed, skip this step.

---

## Self-Review

Spec coverage:
- Shared design primitives: Task 1.
- Reduced serif and repeated presentation style: Tasks 1-4.
- Compact route headers: Tasks 2-4.
- Decision-first wallet visuals: Task 2.
- Persona-first segment flow: Task 3.
- Mobile topbar and assistant refinement: Task 5.
- iPhone, iPad, and desktop visual checks: Tasks 6-7.
- CDE compliance preservation: Tasks 2-7.

Plan hygiene scan:
- Every created file has concrete code.
- Every behavior change has a failing test step before implementation.
- Every task has a focused pass command.
- Every task ends with a scoped commit command.

Type consistency:
- `PageHeader`, `SectionHeader`, and `MetricTile` names are introduced in Task 1 and reused consistently in later tasks.
- Route copy strings in tests match the route implementation snippets.
- E2E assertions use existing Playwright and Testing Library conventions already present in the repo.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-25-ui-system-refinement.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.
