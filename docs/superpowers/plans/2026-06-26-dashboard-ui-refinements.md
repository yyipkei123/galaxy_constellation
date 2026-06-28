# Dashboard UI Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Galaxy Constellation feel more like a polished executive analytics dashboard on iPhone, iPad, and desktop by tightening mobile chrome, adding chart selection/detail states, improving tooltip evidence, and turning Customer 360 into a host-ready briefing view.

**Architecture:** Keep all data local and deterministic. Add small reusable UI helpers for section navigation and snapshot status, then enhance existing route-local panels instead of introducing new routes or backend services. Preserve CDE compliance by rendering only percentages, indices, bands, and synthetic first-party labels in new analytics copy.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Recharts, lucide-react, Vitest with Testing Library, Playwright.

---

## Scope Check

This plan implements the review recommendations as one coherent dashboard UX pass:

- Mobile shell and chatbot placement so the app no longer feels cramped on iPhone.
- Wallet heatmap selected-state analytics, chart-adjacent tooltips, and detail copy.
- Segments and Customer 360 mobile section navigation to reduce long-page friction.
- Customer 360 host briefing summary using existing synthetic guest data.
- Responsive and compliance tests across iPhone, iPad, and desktop.

The plan does not add live AI, new routes, new dependencies, raw wallet values, HKD/MOP/$ display, or real customer PII.

## File Structure

Create these focused files:

- `src/components/ui/section-jump-nav.tsx`
  - Reusable sticky/horizontal section anchor navigation for long analytics pages.
- `src/components/ui/section-jump-nav.test.tsx`
  - Unit tests for section nav labels, links, and current-section accessibility.
- `src/components/ui/snapshot-status-strip.tsx`
  - Reusable status chips for quarter, refresh cadence, CDE basis, and matched coverage.
- `src/components/ui/snapshot-status-strip.test.tsx`
  - Unit tests for snapshot chip rendering and CDE-safe output.
- `src/components/panels/host-briefing-panel.tsx`
  - Customer 360 summary panel with host-facing opportunity, evidence, and next action.
- `src/components/panels/host-briefing-panel.test.tsx`
  - Unit tests for guest briefing behavior and banned currency safety.

Modify these existing files:

- `src/components/shell/app-shell.tsx`
  - Add bottom content padding on mobile so fixed assistant controls do not cover final route content.
- `src/components/shell/nav.tsx`
  - Add mobile scroll affordance and compact route labels without removing accessible full labels.
- `src/components/shell/nav.test.tsx`
  - Assert mobile nav exposes compact labels and preserves full accessible names.
- `src/components/shell/top-bar.tsx`
  - Use a tighter mobile top bar and expose snapshot status text.
- `src/components/shell/top-bar.test.tsx`
  - Assert snapshot status and quarter selector remain accessible.
- `src/components/assistant/chat-assistant-launcher.tsx`
  - Tune fixed launcher safe-area placement and expose a stable test id.
- `src/components/assistant/chat-assistant-launcher.test.tsx`
  - Assert compact mobile launcher classes and safe-area spacing.
- `src/app/wallet/page.tsx`
  - Add heatmap selected state, selected-cell detail panel, and chart tooltip wrappers.
- `src/app/wallet/page.test.tsx`
  - Assert selected heatmap detail updates, pinned details are CDE-safe, and tooltip labels exist.
- `src/app/segments/page.tsx`
  - Add section navigation and move mobile users quickly to persona/detail/action sections.
- `src/app/segments/page.test.tsx`
  - Assert section navigation and segment/persona targets render.
- `src/app/guests/[id]/page.tsx`
  - Add section navigation and host briefing panel near the top of Customer 360.
- `src/app/guests/[id]/page.test.tsx`
  - Assert host briefing, anchors, and CDE-safe text.
- `e2e/compliance.spec.ts`
  - Extend responsive checks for shell chrome, section nav, wallet heatmap detail, and Customer 360 briefing.

---

### Task 1: Shared Section Navigation and Snapshot Status

**Files:**
- Create: `src/components/ui/section-jump-nav.tsx`
- Create: `src/components/ui/section-jump-nav.test.tsx`
- Create: `src/components/ui/snapshot-status-strip.tsx`
- Create: `src/components/ui/snapshot-status-strip.test.tsx`

- [ ] **Step 1: Write failing tests for `SectionJumpNav`**

Create `src/components/ui/section-jump-nav.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { SectionJumpNav } from './section-jump-nav';

describe('SectionJumpNav', () => {
  it('renders section links with a compact analytics navigation label', () => {
    render(
      <SectionJumpNav
        label="Wallet sections"
        items={[
          { id: 'wallet-summary', label: 'Summary' },
          { id: 'wallet-drivers', label: 'Drivers' },
          { id: 'wallet-actions', label: 'Actions' },
        ]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Wallet sections' });

    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Summary' })).toHaveAttribute('href', '#wallet-summary');
    expect(screen.getByRole('link', { name: 'Drivers' })).toHaveAttribute('href', '#wallet-drivers');
    expect(screen.getByRole('link', { name: 'Actions' })).toHaveAttribute('href', '#wallet-actions');
  });

  it('marks the current item when currentId is supplied', () => {
    render(
      <SectionJumpNav
        label="Customer 360 sections"
        currentId="guest-brief"
        items={[
          { id: 'guest-brief', label: 'Brief' },
          { id: 'guest-history', label: 'History' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Brief' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'History' })).not.toHaveAttribute('aria-current');
  });
});
```

- [ ] **Step 2: Run the `SectionJumpNav` test and verify it fails**

Run:

```bash
npm run test -- src/components/ui/section-jump-nav.test.tsx
```

Expected: FAIL with an import error because `src/components/ui/section-jump-nav.tsx` does not exist.

- [ ] **Step 3: Implement `SectionJumpNav`**

Create `src/components/ui/section-jump-nav.tsx`:

```tsx
import clsx from 'clsx';

export interface SectionJumpNavItem {
  id: string;
  label: string;
}

interface SectionJumpNavProps {
  label: string;
  items: SectionJumpNavItem[];
  currentId?: string;
  className?: string;
}

export function SectionJumpNav({
  label,
  items,
  currentId,
  className,
}: SectionJumpNavProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label={label}
      className={clsx(
        'sticky top-0 z-30 -mx-4 border-y border-galaxy-border bg-galaxy-ink/95 px-4 py-2 backdrop-blur sm:-mx-5 sm:px-5 md:top-0 md:-mx-8 md:px-8 lg:static lg:mx-0 lg:rounded-lg lg:border lg:bg-galaxy-charcoal/60 lg:px-3',
        className,
      )}
    >
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
        {items.map((item) => {
          const isCurrent = item.id === currentId;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={isCurrent ? 'true' : undefined}
              className={clsx(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
                isCurrent
                  ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                  : 'border-galaxy-border bg-galaxy-charcoal/80 text-galaxy-muted hover:border-galaxy-gold/70 hover:text-galaxy-cream',
              )}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run the `SectionJumpNav` test and verify it passes**

Run:

```bash
npm run test -- src/components/ui/section-jump-nav.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write failing tests for `SnapshotStatusStrip`**

Create `src/components/ui/snapshot-status-strip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { methodology } from '@/data';
import { SnapshotStatusStrip } from './snapshot-status-strip';

describe('SnapshotStatusStrip', () => {
  it('renders quarter, refresh, basis, and coverage without currency text', () => {
    const { container } = render(
      <SnapshotStatusStrip
        quarterLabel="2026 Q2"
        methodology={methodology}
        context="Wallet model"
      />,
    );

    expect(screen.getByText('2026 Q2 snapshot')).toBeInTheDocument();
    expect(screen.getByText('Quarterly refresh')).toBeInTheDocument();
    expect(screen.getByText('63% matched coverage')).toBeInTheDocument();
    expect(screen.getByText('Wallet model')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });
});
```

- [ ] **Step 6: Run the `SnapshotStatusStrip` test and verify it fails**

Run:

```bash
npm run test -- src/components/ui/snapshot-status-strip.test.tsx
```

Expected: FAIL with an import error because `src/components/ui/snapshot-status-strip.tsx` does not exist.

- [ ] **Step 7: Implement `SnapshotStatusStrip`**

Create `src/components/ui/snapshot-status-strip.tsx`:

```tsx
import clsx from 'clsx';
import type { Methodology } from '@/data';

interface SnapshotStatusStripProps {
  quarterLabel: string;
  methodology: Methodology;
  context: string;
  className?: string;
}

export function SnapshotStatusStrip({
  quarterLabel,
  methodology,
  context,
  className,
}: SnapshotStatusStripProps) {
  const items = [
    `${quarterLabel} snapshot`,
    `${methodology.refresh[0].toUpperCase()}${methodology.refresh.slice(1)} refresh`,
    `${methodology.matchedCoveragePct}% matched coverage`,
    `${methodology.basis} basis`,
    context,
  ];

  return (
    <div
      aria-label="CDE snapshot status"
      className={clsx(
        'flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3 text-xs text-galaxy-muted',
        className,
      )}
    >
      {items.map((item, index) => (
        <span
          key={item}
          className={clsx(
            'rounded-full border px-2.5 py-1 font-semibold',
            index === 0
              ? 'border-galaxy-gold/50 bg-galaxy-gold/10 text-galaxy-gold'
              : 'border-galaxy-border bg-galaxy-charcoal/60 text-galaxy-muted',
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run the shared UI tests and verify they pass**

Run:

```bash
npm run test -- src/components/ui/section-jump-nav.test.tsx src/components/ui/snapshot-status-strip.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit shared UI helpers**

Run:

```bash
git add src/components/ui/section-jump-nav.tsx src/components/ui/section-jump-nav.test.tsx src/components/ui/snapshot-status-strip.tsx src/components/ui/snapshot-status-strip.test.tsx
git commit -m "feat: add dashboard section and snapshot helpers"
```

Expected: commit succeeds.

---

### Task 2: Mobile Shell Compression and Assistant Safety

**Files:**
- Modify: `src/components/shell/app-shell.tsx`
- Modify: `src/components/shell/nav.tsx`
- Modify: `src/components/shell/nav.test.tsx`
- Modify: `src/components/shell/top-bar.tsx`
- Modify: `src/components/shell/top-bar.test.tsx`
- Modify: `src/components/assistant/chat-assistant-launcher.tsx`
- Modify: `src/components/assistant/chat-assistant-launcher.test.tsx`

- [ ] **Step 1: Write failing tests for compact nav and top bar copy**

Append these tests to `src/components/shell/nav.test.tsx`:

```tsx
it('keeps compact mobile labels while preserving full accessible route names', () => {
  render(<Nav />);

  expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Market Scan' })).toBeInTheDocument();
  expect(screen.getByText('Market')).toHaveAttribute('aria-hidden', 'true');
});
```

Append this test to `src/components/shell/top-bar.test.tsx`:

```tsx
it('describes the current CDE snapshot without adding currency text', () => {
  const { container } = render(
    <AppStateProvider>
      <TopBar />
    </AppStateProvider>,
  );

  expect(screen.getByText('2026 Q2 snapshot')).toBeInTheDocument();
  expect(screen.getByText('Quarterly CDE refresh')).toBeInTheDocument();
  expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
});
```

Update the existing mobile launcher test in `src/components/assistant/chat-assistant-launcher.test.tsx` to expect the tighter placement:

```tsx
it('uses a compact safe-area mobile launcher and a labeled desktop affordance', () => {
  renderLauncher();

  const launcher = screen.getByRole('button', { name: 'Open AI insight assistant' });
  expect(launcher).toHaveAttribute('data-testid', 'ai-assistant-launcher');
  expect(launcher).toHaveClass('bottom-[calc(env(safe-area-inset-bottom)+0.875rem)]');
  expect(launcher).toHaveClass('right-3');
  expect(launcher).toHaveClass('h-11');
  expect(launcher).toHaveClass('w-11');
  expect(launcher).toHaveClass('lg:w-auto');
  expect(launcher).toHaveClass('lg:px-4');
  expect(within(launcher).getByText('Ask CDE AI')).toHaveClass('hidden');
  expect(within(launcher).getByText('Ask CDE AI')).toHaveClass('lg:inline');
});
```

- [ ] **Step 2: Run shell and assistant tests and verify they fail**

Run:

```bash
npm run test -- src/components/shell/nav.test.tsx src/components/shell/top-bar.test.tsx src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: FAIL because the nav compact text, top bar snapshot text, and launcher `data-testid`/classes are not present.

- [ ] **Step 3: Add compact labels to `Nav`**

In `src/components/shell/nav.tsx`, change the nav item type and arrays to include `shortLabel`:

```tsx
const walletNavItems: Array<{ href: string; label: string; shortLabel: string; icon: LucideIcon }> = [
  { href: '/', label: 'Overview', shortLabel: 'Overview', icon: BarChart3 },
  { href: '/wallet', label: 'Wallet', shortLabel: 'Wallet', icon: WalletCards },
  { href: '/segments', label: 'Segments', shortLabel: 'Segments', icon: Gem },
  { href: '/guests', label: 'Guests', shortLabel: 'Guests', icon: UsersRound },
  { href: '/leakage', label: 'Leakage', shortLabel: 'Leakage', icon: Activity },
  { href: '/propensity', label: 'Audience', shortLabel: 'Audience', icon: ScanSearch },
  { href: '/activation', label: 'Activation', shortLabel: 'Act', icon: Megaphone },
  { href: '/marketscan', label: 'Market Scan', shortLabel: 'Market', icon: Radar },
];

const acquisitionNavItems: Array<{ href: string; label: string; shortLabel: string; icon: LucideIcon }> = [
  { href: '/corridors', label: 'Source Markets', shortLabel: 'Markets', icon: Route },
  { href: '/acquisition', label: 'Acquisition', shortLabel: 'Acquire', icon: PlaneTakeoff },
];
```

Then replace the `Link` JSX inside the map with this version:

```tsx
<Link
  key={item.href}
  href={item.href}
  ref={isActive ? activeLinkRef : undefined}
  aria-label={item.label}
  className={clsx(
    'flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors sm:text-sm lg:h-11 lg:gap-3',
    isActive
      ? 'bg-galaxy-gold text-galaxy-ink'
      : 'text-galaxy-muted hover:bg-galaxy-slate hover:text-galaxy-cream',
  )}
  aria-current={isActive ? 'page' : undefined}
>
  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
  <span aria-hidden="true" className="lg:hidden">{item.shortLabel}</span>
  <span className="hidden lg:inline">{item.label}</span>
</Link>
```

Keep the existing `<nav>` element and add scroll affordance classes:

```tsx
<nav
  aria-label="Primary navigation"
  className="relative flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0"
>
```

- [ ] **Step 4: Add snapshot status text to `TopBar`**

In `src/components/shell/top-bar.tsx`, replace the first metadata block inside the returned header with:

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
  <span className="rounded-full border border-galaxy-border bg-galaxy-charcoal/70 px-2.5 py-1 text-xs font-semibold text-galaxy-muted">
    {quarters.find((quarter) => quarter.id === selectedQuarterId)?.label ?? 'Current quarter'} snapshot
  </span>
  <span className="rounded-full border border-galaxy-border bg-galaxy-charcoal/70 px-2.5 py-1 text-xs font-semibold text-galaxy-muted">
    Quarterly CDE refresh
  </span>
</div>
```

- [ ] **Step 5: Add mobile bottom padding in `AppShell`**

In `src/components/shell/app-shell.tsx`, replace the `<main>` class with:

```tsx
<main className="min-w-0 flex-1 px-4 py-5 pb-24 sm:px-5 md:px-8 md:py-6 lg:pb-6">{children}</main>
```

- [ ] **Step 6: Tune assistant launcher placement**

In `src/components/assistant/chat-assistant-launcher.tsx`, replace the launcher button opening tag with:

```tsx
<button
  ref={launcherRef}
  type="button"
  data-testid="ai-assistant-launcher"
  aria-label={launcherLabel}
  aria-controls={CHAT_ASSISTANT_DIALOG_ID}
  aria-expanded={isOpen}
  onClick={toggleAssistant}
  className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.875rem)] right-3 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-galaxy-gold/50 bg-galaxy-gold text-galaxy-ink shadow-xl shadow-black/40 transition hover:bg-galaxy-gold-lite focus-visible:ring-2 focus-visible:ring-galaxy-gold focus-visible:ring-offset-2 focus-visible:ring-offset-galaxy-ink sm:right-5 lg:bottom-[calc(env(safe-area-inset-bottom)+1rem)] lg:h-11 lg:w-auto lg:gap-2 lg:rounded-full lg:px-4"
>
```

- [ ] **Step 7: Run shell and assistant tests and verify they pass**

Run:

```bash
npm run test -- src/components/shell/nav.test.tsx src/components/shell/top-bar.test.tsx src/components/assistant/chat-assistant-launcher.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit shell refinements**

Run:

```bash
git add src/components/shell/app-shell.tsx src/components/shell/nav.tsx src/components/shell/nav.test.tsx src/components/shell/top-bar.tsx src/components/shell/top-bar.test.tsx src/components/assistant/chat-assistant-launcher.tsx src/components/assistant/chat-assistant-launcher.test.tsx
git commit -m "fix: tighten mobile shell and assistant launcher"
```

Expected: commit succeeds.

---

### Task 3: Wallet Selected Heatmap Detail and Evidence Tooltips

**Files:**
- Modify: `src/app/wallet/page.tsx`
- Modify: `src/app/wallet/page.test.tsx`

- [ ] **Step 1: Write failing wallet interaction tests**

Append these tests to `src/app/wallet/page.test.tsx`:

```tsx
it('shows a selected heatmap cell detail and updates it after cell selection', () => {
  renderWallet();

  expect(screen.getByRole('region', { name: 'Selected wallet opportunity detail' })).toBeInTheDocument();
  expect(screen.getByText(/Selected opportunity/i)).toBeInTheDocument();

  const heatmap = screen.getByRole('table', { name: 'Segment opportunity heatmap table' });
  const privateDiningCell = within(heatmap).getByRole('button', {
    name: /Cosmopolitan Connoisseurs F&B relative wallet gap/i,
  });

  fireEvent.click(privateDiningCell);

  const detail = screen.getByRole('region', { name: 'Selected wallet opportunity detail' });
  expect(within(detail).getByText('Cosmopolitan Connoisseurs')).toBeInTheDocument();
  expect(within(detail).getByText('F&B')).toBeInTheDocument();
  expect(within(detail).getByText(/Recommended action/i)).toBeInTheDocument();
  expect(within(detail).queryByText(/HKD|MOP|\$|元|澳門幣/i)).not.toBeInTheDocument();
});

it('exposes chart evidence tooltips for wallet analytics metrics', () => {
  renderWallet();

  expect(screen.getByLabelText(/Wallet intensity index/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Relative wallet gap priority/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the wallet route test and verify it fails**

Run:

```bash
npm run test -- src/app/wallet/page.test.tsx
```

Expected: FAIL because heatmap cells are not buttons and selected opportunity detail is not rendered.

- [ ] **Step 3: Add `InsightTooltip` import and selected-cell types**

In `src/app/wallet/page.tsx`, update imports:

```tsx
import { InsightTooltip } from '@/components/ui/insight-tooltip';
```

Add these types and helpers below `type CategorySelection = CoreCategory | 'all';`:

```tsx
interface SelectedWalletCell {
  segmentId: string;
  category: CoreCategory;
}

function selectedCellKey(cell: SelectedWalletCell) {
  return `${cell.segmentId}:${cell.category}`;
}

function defaultSelectedWalletCell(analytics: WalletAnalytics): SelectedWalletCell | null {
  const topSegment = analytics.segments[0];
  const topCategory = analytics.categories[0];

  if (!topSegment || !topCategory) return null;

  return {
    segmentId: topSegment.id,
    category: topCategory.category,
  };
}
```

- [ ] **Step 4: Replace `SegmentOpportunityHeatmap` with selectable buttons**

Replace the full `SegmentOpportunityHeatmap` function in `src/app/wallet/page.tsx` with:

```tsx
function SegmentOpportunityHeatmap({
  analytics,
  hasSegments,
  selectedCell,
  onSelectCell,
}: {
  analytics: WalletAnalytics;
  hasSegments: boolean;
  selectedCell: SelectedWalletCell | null;
  onSelectCell: (cell: SelectedWalletCell) => void;
}) {
  const maxScore = Math.max(
    ...analytics.segments.flatMap((segment) => Object.values(segment.categoryLeakageScores).map((score) => score ?? 0)),
    0,
  );
  const gridTemplateColumns = {
    gridTemplateColumns: `minmax(11rem,1.35fr) repeat(${Math.max(analytics.categories.length, 1)}, minmax(6rem,1fr))`,
  };

  function renderCell(segment: WalletAnalytics['segments'][number], category: WalletAnalytics['categories'][number]) {
    const score = segment.categoryLeakageScores[category.category] ?? 0;
    const relative = relativeScorePct(score, maxScore);
    const cell = { segmentId: segment.id, category: category.category };
    const isSelected = selectedCell ? selectedCellKey(selectedCell) === selectedCellKey(cell) : false;

    return (
      <button
        key={category.category}
        type="button"
        aria-pressed={isSelected}
        onClick={() => onSelectCell(cell)}
        className={clsx(
          'rounded-lg border p-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
          heatmapCellClass(score, maxScore),
          isSelected ? 'ring-2 ring-galaxy-gold' : '',
        )}
        aria-label={`${segment.name} ${category.label} relative wallet gap ${relative}%`}
      >
        <InsightTooltip
          title="Relative wallet gap priority"
          lines={[
            `${segment.name} x ${category.label}`,
            `${relative}% relative priority within the visible CDE cut.`,
            'Higher values combine leakage percentage with wallet intensity index.',
          ]}
          block
        >
          <span className="flex items-center justify-between gap-2">
            <span className="md:hidden">{category.label}</span>
            <span>{relative}%</span>
          </span>
        </InsightTooltip>
      </button>
    );
  }

  return (
    <Panel id="wallet-heatmap" className="scroll-mt-24 p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Overline>Segment x category</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Segment opportunity heatmap</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-galaxy-muted">
          Heat shows relative wallet-gap priority by segment and visible category, using only CDE percentages and indices.
        </p>
      </div>
      {hasSegments ? (
        <>
          <div className="grid gap-3 md:hidden">
            {analytics.segments.map((segment) => (
              <article key={segment.id} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-galaxy-cream">{segment.name}</h3>
                    <p className="mt-1 text-xs text-galaxy-muted">{segment.leadingCategoryLabel} leads the gap</p>
                  </div>
                  <CdeChip />
                </div>
                <div className="mt-4 grid gap-2">
                  {analytics.categories.map((category) => renderCell(segment, category))}
                </div>
              </article>
            ))}
          </div>
          <div className="hidden md:block" role="table" aria-label="Segment opportunity heatmap table">
            <div
              role="row"
              className="grid gap-2 border-b border-galaxy-border pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted"
              style={gridTemplateColumns}
            >
              <span role="columnheader">Segment</span>
              {analytics.categories.map((category) => (
                <span key={category.category} role="columnheader">{category.label}</span>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {analytics.segments.map((segment) => (
                <div key={segment.id} role="row" className="grid gap-2" style={gridTemplateColumns}>
                  <div role="cell" className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3">
                    <p className="text-sm font-semibold text-galaxy-cream">{segment.name}</p>
                    <p className="mt-1 text-xs text-galaxy-muted">{segment.leadingCategoryLabel} leads the gap</p>
                  </div>
                  {analytics.categories.map((category) => renderCell(segment, category))}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
          No segment-level heatmap available for this quarter.
        </p>
      )}
    </Panel>
  );
}
```

- [ ] **Step 5: Add selected opportunity detail panel**

Add this function below `SegmentOpportunityHeatmap`:

```tsx
function SelectedWalletOpportunityDetail({
  analytics,
  selectedCell,
}: {
  analytics: WalletAnalytics;
  selectedCell: SelectedWalletCell | null;
}) {
  const selectedSegment = analytics.segments.find((segment) => segment.id === selectedCell?.segmentId) ?? analytics.segments[0];
  const selectedCategory = analytics.categories.find((category) => category.category === selectedCell?.category) ?? analytics.categories[0];

  if (!selectedSegment || !selectedCategory) {
    return (
      <Panel id="wallet-selected-detail" className="scroll-mt-24 p-4 sm:p-6">
        <section role="region" aria-label="Selected wallet opportunity detail">
          <Overline>Selected opportunity</Overline>
          <h2 className="mt-3 text-xl font-semibold text-galaxy-cream">No selected wallet gap</h2>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            Select a segment and category cell after CDE segment data is available.
          </p>
        </section>
      </Panel>
    );
  }

  const relative = relativeScorePct(
    selectedSegment.categoryLeakageScores[selectedCategory.category] ?? 0,
    Math.max(...analytics.segments.flatMap((segment) => Object.values(segment.categoryLeakageScores).map((score) => score ?? 0)), 0),
  );

  return (
    <Panel id="wallet-selected-detail" className="scroll-mt-24 border-galaxy-gold/40 bg-galaxy-gold/10 p-4 sm:p-6">
      <section role="region" aria-label="Selected wallet opportunity detail">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Overline>Selected opportunity</Overline>
            <h2 className="mt-3 font-serif text-2xl text-galaxy-cream">
              {selectedSegment.name} x {selectedCategory.label}
            </h2>
          </div>
          <CdeChip />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MetricTile
            label="Relative priority"
            value={<PercentValue value={relative} />}
            detail="Within visible heatmap."
          />
          <MetricTile
            label="Category leakage"
            value={<PercentValue value={selectedCategory.leakagePct} />}
            detail="CDE percentage signal."
          />
          <MetricTile
            label="Wallet intensity"
            value={(
              <InsightTooltip
                title="Wallet intensity index"
                lines={[
                  'Index 100 is the CDE segment baseline.',
                  `${selectedCategory.label} currently reads Index ${selectedCategory.walletIndex}.`,
                  'Values are indexed and do not expose raw spend.',
                ]}
              >
                <IndexValue value={selectedCategory.walletIndex} />
              </InsightTooltip>
            )}
            detail="Mastercard CDE index."
          />
        </div>
        <p className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
          Recommended action: send this segment to leakage review and attach a {selectedCategory.label} offer path before activation.
          The evidence combines Galaxy visit behavior with CDE wallet intensity and leakage percentages.
        </p>
      </section>
    </Panel>
  );
}
```

- [ ] **Step 6: Wire wallet selected state and section navigation**

In `src/app/wallet/page.tsx`, add imports:

```tsx
import { SectionJumpNav } from '@/components/ui/section-jump-nav';
import { SnapshotStatusStrip } from '@/components/ui/snapshot-status-strip';
```

Inside `WalletPage`, after `const hasSegments = safeSegments.length > 0;`, add:

```tsx
const [selectedCell, setSelectedCell] = useState<SelectedWalletCell | null>(null);
const resolvedSelectedCell = selectedCell ?? defaultSelectedWalletCell(walletAnalytics);
```

After the category filter block and before the heatmap, add:

```tsx
<SectionJumpNav
  label="Wallet dashboard sections"
  currentId="wallet-heatmap"
  items={[
    { id: 'wallet-heatmap', label: 'Heatmap' },
    { id: 'wallet-selected-detail', label: 'Detail' },
    { id: 'wallet-drivers', label: 'Drivers' },
    { id: 'wallet-evidence', label: 'Evidence' },
  ]}
/>

<SnapshotStatusStrip
  quarterLabel={selectedQuarter.label}
  methodology={useAppState().methodology}
  context="Wallet model"
/>
```

Update the heatmap call:

```tsx
<SegmentOpportunityHeatmap
  analytics={walletAnalytics}
  hasSegments={hasSegments}
  selectedCell={resolvedSelectedCell}
  onSelectCell={setSelectedCell}
/>
<SelectedWalletOpportunityDetail analytics={walletAnalytics} selectedCell={resolvedSelectedCell} />
```

Add `id="wallet-drivers"` to the grid wrapping `RankedCategoryLeakage` and `SegmentGapLadder`:

```tsx
<div id="wallet-drivers" className="grid scroll-mt-24 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
```

Add `id="wallet-evidence"` to the lower scatter/channel grid:

```tsx
<div id="wallet-evidence" className="grid scroll-mt-24 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
```

- [ ] **Step 7: Fix the `useAppState` destructure for methodology**

Change the `WalletPage` destructure from:

```tsx
const { selectedQuarter, segments } = useAppState();
```

to:

```tsx
const { methodology, selectedQuarter, segments } = useAppState();
```

Then change the `SnapshotStatusStrip` call to:

```tsx
<SnapshotStatusStrip
  quarterLabel={selectedQuarter.label}
  methodology={methodology}
  context="Wallet model"
/>
```

- [ ] **Step 8: Run wallet tests and verify they pass**

Run:

```bash
npm run test -- src/app/wallet/page.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit wallet refinements**

Run:

```bash
git add src/app/wallet/page.tsx src/app/wallet/page.test.tsx
git commit -m "feat: add wallet selected opportunity detail"
```

Expected: commit succeeds.

---

### Task 4: Segments Mobile Section Flow

**Files:**
- Modify: `src/app/segments/page.tsx`
- Modify: `src/app/segments/page.test.tsx`

- [ ] **Step 1: Write failing segment section navigation test**

Append this test to `src/app/segments/page.test.tsx`:

```tsx
it('provides mobile section navigation for long segmentation analysis', () => {
  renderSegments();

  const nav = screen.getByRole('navigation', { name: 'Segmentation sections' });

  expect(within(nav).getByRole('link', { name: 'Brief' })).toHaveAttribute('href', '#segment-brief');
  expect(within(nav).getByRole('link', { name: 'Personas' })).toHaveAttribute('href', '#segment-personas');
  expect(within(nav).getByRole('link', { name: 'Kit' })).toHaveAttribute('href', '#segment-persona-kit');
  expect(within(nav).getByRole('link', { name: 'Actions' })).toHaveAttribute('href', '#segment-actions');
});
```

- [ ] **Step 2: Run segments tests and verify the new test fails**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
```

Expected: FAIL because the segmentation section nav does not exist.

- [ ] **Step 3: Add section navigation imports**

In `src/app/segments/page.tsx`, add:

```tsx
import { SectionJumpNav } from '@/components/ui/section-jump-nav';
import { SnapshotStatusStrip } from '@/components/ui/snapshot-status-strip';
```

Update the store destructure to include `methodology` and `selectedQuarter`:

```tsx
const {
  methodology,
  selectedQuarter,
  segments,
  selectedSegment,
  selectedPersonaId,
  setSelectedPersonaId,
  setSelectedSegmentId,
} = useAppState();
```

- [ ] **Step 4: Add section nav and snapshot strip after the close-the-loop panel**

After the close-the-loop `Panel`, insert:

```tsx
<SectionJumpNav
  label="Segmentation sections"
  currentId="segment-brief"
  items={[
    { id: 'segment-brief', label: 'Brief' },
    { id: 'segment-personas', label: 'Personas' },
    { id: 'segment-persona-kit', label: 'Kit' },
    { id: 'segment-actions', label: 'Actions' },
  ]}
/>

<SnapshotStatusStrip
  quarterLabel={selectedQuarter.label}
  methodology={methodology}
  context="Segment and persona model"
/>
```

- [ ] **Step 5: Add target ids and scroll offsets to segment sections**

Change the first selected segment grid opening tag from:

```tsx
<div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
```

to:

```tsx
<div id="segment-brief" className="grid scroll-mt-24 gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
```

Wrap `PersonaUniverse` and the persona explorer panel in a section:

```tsx
<section id="segment-personas" className="scroll-mt-24 space-y-6" aria-label="Segment persona analysis">
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
</section>
```

Wrap the detail kit with a target:

```tsx
{selectedPersona ? (
  <section id="segment-persona-kit" className="scroll-mt-24">
    <PersonaDetailKit persona={selectedPersona} />
  </section>
) : null}
```

Add `id="segment-actions"` to the recommended plays `Panel`:

```tsx
<Panel id="segment-actions" className="scroll-mt-24">
```

- [ ] **Step 6: Run segments tests and verify they pass**

Run:

```bash
npm run test -- src/app/segments/page.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit segments refinements**

Run:

```bash
git add src/app/segments/page.tsx src/app/segments/page.test.tsx
git commit -m "feat: add segment section navigation"
```

Expected: commit succeeds.

---

### Task 5: Customer 360 Host Briefing Panel

**Files:**
- Create: `src/components/panels/host-briefing-panel.tsx`
- Create: `src/components/panels/host-briefing-panel.test.tsx`
- Modify: `src/app/guests/[id]/page.tsx`
- Modify: `src/app/guests/[id]/page.test.tsx`

- [ ] **Step 1: Write failing host briefing panel tests**

Create `src/components/panels/host-briefing-panel.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { guests } from '@/data';
import { HostBriefingPanel } from './host-briefing-panel';

const categoryLabels = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

describe('HostBriefingPanel', () => {
  it('summarizes a synthetic guest for host action without banned currency', () => {
    const { container } = render(<HostBriefingPanel guest={guests[0]} />);

    const briefing = screen.getByRole('region', { name: 'Host briefing summary' });

    expect(within(briefing).getByRole('heading', { name: 'Host briefing' })).toBeInTheDocument();
    expect(within(briefing).getByText(guests[0].profile.displayName)).toBeInTheDocument();
    expect(within(briefing).getByText(guests[0].profile.originMarket)).toBeInTheDocument();
    expect(within(briefing).getByText(categoryLabels[guests[0].primaryOpportunity])).toBeInTheDocument();
    expect(within(briefing).getByText(/Reason to contact now/i)).toBeInTheDocument();
    expect(within(briefing).getByText(/Next action/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });
});
```

- [ ] **Step 2: Run host briefing tests and verify they fail**

Run:

```bash
npm run test -- src/components/panels/host-briefing-panel.test.tsx
```

Expected: FAIL because `host-briefing-panel.tsx` does not exist.

- [ ] **Step 3: Implement `HostBriefingPanel`**

Create `src/components/panels/host-briefing-panel.tsx`:

```tsx
import { ArrowRight, CalendarClock, Sparkles } from 'lucide-react';
import type { Guest } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';
import { PercentValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';

const categoryLabels: Record<Guest['primaryOpportunity'], string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

export function HostBriefingPanel({ guest }: { guest: Guest }) {
  const primaryLabel = categoryLabels[guest.primaryOpportunity];
  const primaryLeakage = guest.cde.categoryLeakagePct[guest.primaryOpportunity];
  const primaryCapture = guest.cde.categoryCapturePct[guest.primaryOpportunity];
  const action = guest.nextBestActions[0];

  return (
    <Panel id="guest-brief" className="scroll-mt-24 border-galaxy-gold/40 bg-galaxy-gold/10">
      <section role="region" aria-label="Host briefing summary">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Overline>Host-ready summary</Overline>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Host briefing</h2>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              {guest.profile.displayName} · {guest.profile.originMarket} · {guest.profile.travelParty}
            </p>
          </div>
          <CdeChip />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-4">
            <div className="flex items-center gap-2 text-galaxy-gold">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Primary opportunity</p>
            </div>
            <p className="mt-3 text-xl font-semibold text-galaxy-cream">{primaryLabel}</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Captured <PercentValue value={primaryCapture} /> with <PercentValue value={primaryLeakage} /> remaining leakage.
            </p>
          </article>

          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-4">
            <div className="flex items-center gap-2 text-galaxy-gold">
              <CalendarClock aria-hidden="true" className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Reason to contact now</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">
              Last signal is {guest.firstParty.recencyDays} days old, with {guest.profile.contactability.toLowerCase()} contactability and {guest.cde.crossPropertyCashBand} cross-property headroom.
            </p>
          </article>

          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-4">
            <div className="flex items-center gap-2 text-galaxy-gold">
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Next action</p>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-galaxy-cream">
              {action?.offer ?? `Route to ${primaryLabel} activation`}
            </p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Confidence <PercentValue value={Math.round((action?.confidence ?? 0) * 100)} /> · {action?.channel ?? 'host'} channel.
            </p>
          </article>
        </div>
      </section>
    </Panel>
  );
}
```

- [ ] **Step 4: Run host briefing panel test and verify it passes**

Run:

```bash
npm run test -- src/components/panels/host-briefing-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write failing Customer 360 route test**

Append this test to `src/app/guests/[id]/page.test.tsx`:

```tsx
it('places a host briefing and section navigation near the top of Customer 360', async () => {
  render(await GuestDetailPage({ params: Promise.resolve({ id: guests[0].id }) }));

  const nav = screen.getByRole('navigation', { name: 'Customer 360 sections' });
  const briefing = screen.getByRole('region', { name: 'Host briefing summary' });

  expect(within(nav).getByRole('link', { name: 'Brief' })).toHaveAttribute('href', '#guest-brief');
  expect(within(nav).getByRole('link', { name: 'Evidence' })).toHaveAttribute('href', '#guest-evidence');
  expect(within(nav).getByRole('link', { name: 'Actions' })).toHaveAttribute('href', '#guest-actions');
  expect(within(nav).getByRole('link', { name: 'History' })).toHaveAttribute('href', '#guest-history');
  expect(within(briefing).getByText(/Reason to contact now/i)).toBeInTheDocument();
  expect(within(briefing).getByText(/Next action/i)).toBeInTheDocument();
});
```

- [ ] **Step 6: Run Customer 360 route test and verify it fails**

Run:

```bash
npm run test -- 'src/app/guests/[id]/page.test.tsx'
```

Expected: FAIL because Customer 360 does not render the section nav or host briefing.

- [ ] **Step 7: Wire host briefing into Customer 360**

In `src/app/guests/[id]/page.tsx`, add imports:

```tsx
import { HostBriefingPanel } from '@/components/panels/host-briefing-panel';
import { SectionJumpNav } from '@/components/ui/section-jump-nav';
```

Then replace the successful guest return body with:

```tsx
return (
  <div className="space-y-6 text-galaxy-cream">
    <GuestProfileHeader guest={guest} />
    <SectionJumpNav
      label="Customer 360 sections"
      currentId="guest-brief"
      items={[
        { id: 'guest-brief', label: 'Brief' },
        { id: 'guest-evidence', label: 'Evidence' },
        { id: 'guest-actions', label: 'Actions' },
        { id: 'guest-history', label: 'History' },
      ]}
    />
    <HostBriefingPanel guest={guest} />
    <section id="guest-evidence" className="scroll-mt-24 space-y-6" aria-label="Customer evidence">
      <GuestIdentityPanel guest={guest} />
      <FusionPanel guest={guest} />
    </section>
    <div id="guest-actions" className="grid scroll-mt-24 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-4">
        <h2 className="font-serif text-3xl text-galaxy-cream">Next-Best-Action</h2>
        {guest.nextBestActions.map((rec) => (
          <NbaRecommendationCard key={rec.offer} rec={rec} />
        ))}
        <PitchScriptCard guest={guest} />
        <GuestTimeline guest={guest} />
      </div>
      <WalletOrbit guest={guest} />
    </div>
    <section id="guest-history" className="scroll-mt-24">
      <PurchaseHistoryPanel guest={guest} />
    </section>
  </div>
);
```

- [ ] **Step 8: Run Customer 360 tests and verify they pass**

Run:

```bash
npm run test -- src/components/panels/host-briefing-panel.test.tsx 'src/app/guests/[id]/page.test.tsx'
```

Expected: PASS.

- [ ] **Step 9: Commit Customer 360 refinements**

Run:

```bash
git add src/components/panels/host-briefing-panel.tsx src/components/panels/host-briefing-panel.test.tsx 'src/app/guests/[id]/page.tsx' 'src/app/guests/[id]/page.test.tsx'
git commit -m "feat: add customer host briefing"
```

Expected: commit succeeds.

---

### Task 6: Responsive E2E and Final Verification

**Files:**
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Add failing Playwright checks for the refined dashboard experience**

Append this block inside `test.describe('Galaxy Constellation rendered compliance', () => { ... })` in `e2e/compliance.spec.ts`, after the existing responsive loops:

```ts
for (const viewport of [
  { label: 'iPhone', width: 390, height: 844 },
  { label: 'iPad', width: 820, height: 1180 },
  { label: 'desktop', width: 1440, height: 900 },
]) {
  test(`dashboard refinements stay usable on ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    await gotoStableRoute(page, '/wallet');
    await expect(page.getByRole('navigation', { name: 'Wallet dashboard sections' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Selected wallet opportunity detail' })).toBeVisible();
    await page.getByRole('button', { name: /Cosmopolitan Connoisseurs F&B relative wallet gap/i }).click();
    await expect(page.getByRole('region', { name: 'Selected wallet opportunity detail' })).toContainText('Cosmopolitan Connoisseurs');
    await expect(page.getByRole('region', { name: 'Selected wallet opportunity detail' })).toContainText('F&B');
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);

    await gotoStableRoute(page, '/segments');
    await expect(page.getByRole('navigation', { name: 'Segmentation sections' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Kit' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);

    await gotoStableRoute(page, '/guests/MEM-••••3421');
    await expect(page.getByRole('navigation', { name: 'Customer 360 sections' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Host briefing summary' })).toBeVisible();
    await expect(page.getByText(/Reason to contact now/i)).toBeVisible();
    await expect(page.getByTestId('ai-assistant-launcher')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);
  });
}
```

- [ ] **Step 2: Run the new E2E checks and verify they fail before all route work is present**

Run:

```bash
npm run test:e2e -- e2e/compliance.spec.ts --grep "dashboard refinements stay usable"
```

Expected: PASS if Tasks 1-5 were completed before this task. If running Step 1 before Tasks 1-5, expected FAIL on missing section navigation or selected detail.

- [ ] **Step 3: Run targeted unit tests**

Run:

```bash
npm run test -- src/components/ui/section-jump-nav.test.tsx src/components/ui/snapshot-status-strip.test.tsx src/components/shell/nav.test.tsx src/components/shell/top-bar.test.tsx src/components/assistant/chat-assistant-launcher.test.tsx src/app/wallet/page.test.tsx src/app/segments/page.test.tsx src/components/panels/host-briefing-panel.test.tsx 'src/app/guests/[id]/page.test.tsx'
```

Expected: PASS.

- [ ] **Step 4: Run full verification**

Run:

```bash
npm run verify
```

Expected: PASS for lint, Vitest, Next build, and Playwright.

- [ ] **Step 5: Manually verify rendered routes**

Run the dev server if it is not already running:

```bash
npm run dev
```

Open these routes and verify:

```text
http://127.0.0.1:3000/wallet
http://127.0.0.1:3000/segments
http://127.0.0.1:3000/guests/MEM-••••3421
```

Expected:

- iPhone width: no horizontal body overflow, section nav visible, chatbot does not hide final content, and selected wallet detail is readable.
- iPad width: two-column layouts remain readable and section nav does not cover headings.
- Desktop width: left nav, top bar, heatmap, detail panels, and Customer 360 briefing render without crowding.
- No route renders `HKD`, `MOP`, `$`, `元`, or `澳門幣` in CDE-enriched content.

- [ ] **Step 6: Commit E2E refinements**

Run:

```bash
git add e2e/compliance.spec.ts
git commit -m "test: cover responsive dashboard refinements"
```

Expected: commit succeeds.

---

## Self-Review

**Spec coverage**

- Mobile nav and shell compression: Task 2.
- Chatbot safer bottom-right behavior: Task 2 and Task 6.
- Long-page mobile section navigation: Tasks 1, 3, 4, 5, and 6.
- Wallet heatmap selected detail and richer chart evidence: Task 3.
- Segments mobile comprehension: Task 4.
- Customer 360 host briefing with identity, demographic, opportunity, history access, and next action: Task 5.
- iPhone, iPad, desktop verification: Task 6.
- CDE-safe output: Tasks 1, 3, 5, and 6.

**Placeholder scan**

No blocked placeholder wording, open-ended validation instruction, or undefined file path is present in this plan.

**Type consistency**

- `SectionJumpNavItem` uses `id` and `label`; all route calls use those names.
- `SnapshotStatusStrip` uses `quarterLabel`, `methodology`, and `context`; Wallet and Segments pass those props.
- `SelectedWalletCell` uses `segmentId` and `category`; all Wallet helpers use the same keys.
- `HostBriefingPanel` accepts `guest: Guest`; route and tests pass `Guest` objects from `src/data`.
