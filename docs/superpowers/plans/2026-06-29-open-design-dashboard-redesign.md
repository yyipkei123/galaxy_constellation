# Open Design Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Open Design "Galaxy Dashboard Redesign" cockpit to the existing Galaxy Constellation Next app while keeping the app runnable, tested, CDE-compliant, and multi-route.

**Architecture:** The Open Design artifact is a static `index.html` prototype, while this repo is a Next 15 / React 19 app with shared store, route tests, Playwright compliance coverage, and existing Galaxy/Mastercard assets. Port the visual language and interactions into the current app by updating global tokens, the app shell, the overview dashboard composition, and focused dashboard components; do not replace the app with a static one-page copy. Keep source data in `src/data` and derive all redesigned dashboard copy, metrics, selected audience states, and assistant responses from the existing app state.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, existing `framer-motion`, existing `lucide-react`, Vitest, Testing Library, Playwright.

---

## Source Design Inventory

Open Design project read from:

```text
/Users/keyip/Library/Application Support/Open Design/namespaces/release-stable/data/projects/d3979893-1bbe-4815-a0cd-509019d9bf23
```

Files inspected:

- `brand-spec.md`: confirms dark hospitality canvas, champagne-gold highlights, Cormorant Garamond display, Geist body, Geist Mono labels, translucent charcoal panels, and CDE/wallet/action language.
- `index.html`: complete static design with inline CSS and JavaScript.
- `critique.json`: score 4 across philosophy, hierarchy, execution, specificity, and restraint.
- `source-audit/`: empty captured live files plus JS chunk names; no additional usable assets.

Open Design features to preserve:

- 280px sticky left rail with `G` sigil, tab-like navigation, and current refresh card.
- Constrained app frame, max width around 1680px, with subtle border and backdrop blur.
- Glass/lacquer material: fine borders, translucent charcoal surfaces, inset highlights, restrained gold accents, solid fallback for unsupported backdrop blur.
- Top bar with executive cockpit copy, segmented quarter selector, and "Copy narrative".
- Reading guide strip with two jump actions.
- Boardroom answer ribbon leading with one decision before charts.
- Hero and CDE refresh card with the 63% conic coverage ring.
- Four executive metric cards.
- Decision workspace with tabs: Opportunity, Wallet Split, Segments, Activation, Workbench.
- Opportunity constellation with selectable segment stars and synchronized selected finding card.
- Segment priority filters with live status and empty state.
- Activation playbook and CDE-safe table.
- Workbench explaining ranking formula, trust guardrails, and operating flow.
- In-page "Ask CDE AI" card with prompt validation, quick prompts, generated response state, copy action, and CDE-safe copy.
- Responsive fallbacks at desktop, tablet, and mobile widths.
- Accessibility states: `aria-selected`, `aria-pressed`, roving tab focus, live statuses, focus-visible rings, scrollable table affordance, reduced-motion behavior.

Current app constraints:

- Existing app is already React/Next, so there is no stack conflict. The Open Design handoff target is satisfied by modifying real runnable React code in this repo.
- Keep `AppShell` as the owner of the single `main` landmark; overview route must not render a nested `main`.
- Keep global `MethodologyNote`, `PresenterTour`, and `ChatAssistantLauncher`.
- Keep current route set and CDE compliance rules in `README.md` and `e2e/compliance.spec.ts`.
- Do not add backend calls, live LLM calls, API keys, or raw customer-level CDE values.
- Do not copy files into or modify the Open Design project folder.

## File Structure

- Modify: `src/app/globals.css`  
  Add Open Design tokens, page background layers, focus-visible rings, glass material utilities, table affordances, and backdrop-filter fallback.
- Modify: `src/components/ui/panel.tsx`  
  Update shared panel variants to use the new glass/lacquer material without changing the public API.
- Modify: `src/components/ui/kpi-card.tsx`  
  Update KPI card style to match the Open Design metric cards while preserving existing props.
- Modify: `src/components/shell/co-brand-lockup.tsx`  
  Add the Open Design `G` sigil and tighter brandmark layout.
- Modify: `src/components/shell/app-shell.tsx`  
  Port the constrained app frame, sticky side rail, current-refresh side card, and content padding.
- Create: `src/components/shell/current-refresh-card.tsx`  
  Client side-card that reflects the selected quarter from app state.
- Modify: `src/components/shell/app-shell.test.tsx`  
  Assert the redesigned shell keeps route content, assistant launcher, methodology footer, and current refresh card.
- Modify: `src/components/shell/nav.tsx`  
  Restyle existing route links to match Open Design tab navigation while preserving real route links and lens-aware item sets.
- Modify: `src/components/shell/nav.test.tsx`  
  Preserve existing route/link assertions and add side-rail visual/accessibility contracts.
- Modify: `src/components/shell/top-bar.tsx`  
  Convert quarter selection from a select into segmented buttons, add executive cockpit copy, and add CDE-safe narrative copy feedback.
- Modify: `src/components/shell/top-bar.test.tsx`  
  Update tests from combobox expectations to button group expectations and add copy narrative behavior.
- Create: `src/components/dashboard/open-design-view-model.ts`  
  Pure derivation layer for top segment, boardroom brief, portfolio metrics, quarter deltas, constellation positions, category rows, segment priorities, playbook rows, workbench rows, and assistant answer copy.
- Create: `src/components/dashboard/open-design-view-model.test.ts`  
  Unit tests for all pure derivations, finite fallbacks, and CDE-safe text.
- Create: `src/components/dashboard/reading-guide.tsx`  
  Open Design reading guide strip with workspace/action jump buttons.
- Create: `src/components/dashboard/boardroom-brief.tsx`  
  Boardroom answer ribbon driven by selected quarter and selected segment.
- Create: `src/components/dashboard/executive-metrics.tsx`  
  Four-card metric grid using derived portfolio metrics and quarter deltas.
- Create: `src/components/dashboard/dashboard-hero.tsx`  
  Hero proof block and 63% CDE refresh ring.
- Create: `src/components/dashboard/decision-workspace.tsx`  
  Client component for the five Open Design tabs, segment star selection, segment filters, activation table, workbench, and in-page assistant.
- Create: `src/components/dashboard/decision-workspace.test.tsx`  
  Interaction tests for tabs, star selection, filters, build audience action, prompt validation, quick prompts, and CDE-safe output.
- Modify: `src/app/page.tsx`  
  Replace the current overview composition with the Open Design cockpit sections using existing app state and new dashboard components.
- Modify: `src/app/page.test.tsx`  
  Update overview tests for boardroom answer, reading guide, hero proof, metrics, workspace tabs, CDE-safe content, and no nested `main`.
- Modify: `e2e/compliance.spec.ts`  
  Update overview-route assertions and add desktop/mobile checks for redesigned cockpit behavior.

No new runtime dependency is required.

---

### Task 1: Global Material Tokens And Shared UI Surfaces

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/panel.tsx`
- Modify: `src/components/ui/kpi-card.tsx`

- [ ] **Step 1: Write a failing shared surface test**

Create or update `src/components/ui/panel.test.tsx` with these assertions added to the existing test coverage:

```tsx
import { render, screen } from '@testing-library/react';
import { Panel } from './panel';

describe('Panel', () => {
  it('renders the Open Design glass material classes without changing the section contract', () => {
    render(
      <Panel variant="glass" className="px-4">
        <h2>Glass surface</h2>
      </Panel>,
    );

    const panel = screen.getByText('Glass surface').closest('section');

    expect(panel).not.toBeNull();
    expect(panel).toHaveClass('galaxy-glass-panel');
    expect(panel).toHaveClass('rounded-[20px]');
    expect(panel).toHaveClass('border-white/10');
    expect(panel).not.toHaveClass('p-6');
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test -- src/components/ui/panel.test.tsx
```

Expected: FAIL because `Panel` does not use `galaxy-glass-panel`.

- [ ] **Step 3: Add Open Design tokens and material utilities**

Modify `src/app/globals.css` to this content:

```css
@import "tailwindcss";

@theme {
  --font-display: var(--font-galaxy-display);
  --font-sans: var(--font-galaxy-sans);
  --font-mono: var(--font-galaxy-mono);
  --color-galaxy-ink: #090807;
  --color-galaxy-charcoal: #171510;
  --color-galaxy-slate: #201d16;
  --color-galaxy-border: #3a3324;
  --color-galaxy-gold: #d6b35f;
  --color-galaxy-gold-lite: #f0d77c;
  --color-galaxy-gold-deep: #a8823e;
  --color-galaxy-cream: #f6eddc;
  --color-galaxy-muted: #aaa08d;
  --color-galaxy-capture: #d6b35f;
  --color-galaxy-leak: #b5543f;
  --color-galaxy-market: #3b3529;
  --color-galaxy-positive: #6fa98c;
}

:root {
  color-scheme: dark;
  --galaxy-bg: oklch(12.8% 0.012 82);
  --galaxy-surface: oklch(19.4% 0.018 82);
  --galaxy-fg: oklch(95.2% 0.023 86);
  --galaxy-muted: oklch(72% 0.032 84);
  --galaxy-border: oklch(35% 0.032 82);
  --galaxy-accent: oklch(73.7% 0.101 82.7);
  --galaxy-positive: oklch(68.6% 0.075 161.8);
  --galaxy-leak: oklch(56.3% 0.131 33.6);
  --galaxy-market: oklch(25% 0.016 82);
  --galaxy-ink: oklch(9.8% 0.01 82);
  --galaxy-champagne: oklch(82% 0.13 86);
  --galaxy-glass: color-mix(in oklch, var(--galaxy-surface) 58%, transparent);
  --galaxy-glass-soft: color-mix(in oklch, var(--galaxy-surface) 38%, transparent);
  --galaxy-glass-strong: color-mix(in oklch, var(--galaxy-surface) 74%, transparent);
  --galaxy-glass-edge: color-mix(in oklch, white 20%, var(--galaxy-border));
  --galaxy-glass-highlight: color-mix(in oklch, white 42%, transparent);
  --galaxy-glass-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
  background: var(--galaxy-bg);
}

html {
  min-height: 100%;
  color-scheme: dark;
}

body {
  position: relative;
  min-height: 100vh;
  margin: 0;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 14% -12%, color-mix(in oklch, var(--galaxy-champagne) 12%, transparent), transparent 33rem),
    linear-gradient(145deg, var(--galaxy-bg), oklch(10.5% 0.014 82) 58%, oklch(8.5% 0.01 82));
  color: var(--galaxy-fg);
  text-rendering: optimizeLegibility;
}

body::before,
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

body::before {
  background:
    radial-gradient(48rem 24rem at 22% 18%, color-mix(in oklch, white 5%, transparent), transparent 65%),
    radial-gradient(40rem 26rem at 86% 24%, color-mix(in oklch, var(--galaxy-champagne) 7%, transparent), transparent 68%);
  filter: blur(5px) saturate(1.02);
  opacity: 0.62;
}

body::after {
  background:
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.014) 0 1px, transparent 1px 112px);
  opacity: 0.34;
}

* {
  box-sizing: border-box;
}

::selection {
  background: color-mix(in oklch, var(--galaxy-accent) 45%, transparent);
  color: var(--galaxy-fg);
}

:where(button, a, select, input, textarea, [tabindex]):focus-visible {
  outline: 2px solid color-mix(in oklch, var(--galaxy-accent) 76%, white 8%);
  outline-offset: 3px;
  box-shadow: 0 0 0 5px color-mix(in oklch, var(--galaxy-accent) 18%, transparent);
}

button,
a,
select,
input,
textarea {
  outline-color: #d6b35f;
}

.recharts-wrapper text {
  fill: #aaa08d;
  font-family: var(--font-sans), Inter, sans-serif;
}

.galaxy-glass-panel {
  position: relative;
  overflow: hidden;
  border-color: color-mix(in oklch, var(--galaxy-glass-edge) 42%, transparent);
  background:
    linear-gradient(145deg, color-mix(in oklch, white 7%, transparent), transparent 42%),
    var(--galaxy-glass);
  box-shadow:
    inset 0 1px 0 color-mix(in oklch, white 12%, transparent),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04),
    var(--galaxy-glass-shadow);
  -webkit-backdrop-filter: blur(18px) saturate(1.18);
  backdrop-filter: blur(18px) saturate(1.18);
}

.galaxy-glass-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(118deg, var(--galaxy-glass-highlight), transparent 26%),
    radial-gradient(26rem 12rem at 88% -12%, color-mix(in oklch, var(--galaxy-champagne) 8%, transparent), transparent 70%);
  opacity: 0.2;
}

.galaxy-glass-panel > * {
  position: relative;
  z-index: 1;
}

.galaxy-table-wrap {
  overflow: auto;
  border: 1px solid color-mix(in oklch, var(--galaxy-glass-edge) 36%, transparent);
  border-radius: 16px;
  background: var(--galaxy-glass-soft);
  box-shadow: inset 0 1px 0 color-mix(in oklch, white 12%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
  backdrop-filter: blur(18px) saturate(1.25);
}

.galaxy-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  background: transparent;
}

.galaxy-table th,
.galaxy-table td {
  padding: 14px 15px;
  border-bottom: 1px solid color-mix(in oklch, var(--galaxy-glass-edge) 22%, transparent);
  text-align: left;
}

.galaxy-table th {
  color: #aaa08d;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.galaxy-table td {
  color: #aaa08d;
  font-size: 13px;
  line-height: 1.45;
}

.galaxy-table tbody tr:last-child td {
  border-bottom: 0;
}

.galaxy-table th:first-child,
.galaxy-table td:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  background: color-mix(in oklch, var(--galaxy-surface) 88%, var(--galaxy-bg));
}

.galaxy-table th:first-child {
  z-index: 2;
}

.galaxy-table td:first-child {
  color: #f6eddc;
  font-weight: 650;
}

.galaxy-number {
  color: #f6eddc;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .galaxy-glass-panel,
  .galaxy-table-wrap {
    background: color-mix(in oklch, var(--galaxy-surface) 86%, var(--galaxy-bg));
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Update the shared Panel component**

Modify `src/components/ui/panel.tsx`:

```tsx
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'hero';
}

const paddingClassPattern = /(?:^|\s)(?:[a-z0-9-]+:)*(?:p|px|py|pt|pr|pb|pl)-/;

const variantClasses = {
  default: 'galaxy-glass-panel rounded-[18px] border border-white/10 bg-galaxy-charcoal/70',
  glass: 'galaxy-glass-panel rounded-[20px] border border-white/10 bg-galaxy-charcoal/60 shadow-2xl shadow-black/30 backdrop-blur',
  hero: 'galaxy-glass-panel rounded-[20px] border border-galaxy-gold/30 bg-galaxy-charcoal/62 shadow-[0_0_44px_rgba(214,179,95,0.14)] backdrop-blur',
};

export function Panel({ children, className, variant = 'default' }: PanelProps) {
  const hasPaddingOverride = paddingClassPattern.test(className ?? '');

  return (
    <section
      className={clsx(
        variantClasses[variant],
        hasPaddingOverride ? null : 'p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}
```

This keeps the app from assigning generic region landmarks to every panel.

- [ ] **Step 5: Update KPI card material**

Modify `src/components/ui/kpi-card.tsx`:

```tsx
import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}

export function KpiCard({ label, value, detail }: KpiCardProps) {
  return (
    <article className="galaxy-glass-panel min-h-[152px] rounded-[18px] border border-white/10 p-[18px] shadow-2xl shadow-black/20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">{label}</p>
      <div className="mt-[18px] font-serif text-[clamp(2.5rem,4vw,3.875rem)] font-semibold leading-[0.9] tracking-normal text-galaxy-cream">
        {value}
      </div>
      {detail ? <div className="mt-3 text-[13px] leading-6 text-galaxy-muted">{detail}</div> : null}
    </article>
  );
}
```

- [ ] **Step 6: Run shared UI tests**

Run:

```bash
npm run test -- src/components/ui/panel.test.tsx src/components/ui/metric-tile.test.tsx
```

Expected: both test files PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/app/globals.css src/components/ui/panel.tsx src/components/ui/panel.test.tsx src/components/ui/kpi-card.tsx
git commit -m "style: add Open Design glass material system"
```

Expected: commit succeeds with only the shared style files.

---

### Task 2: Shell And Navigation Redesign

**Files:**
- Modify: `src/components/shell/co-brand-lockup.tsx`
- Create: `src/components/shell/current-refresh-card.tsx`
- Modify: `src/components/shell/app-shell.tsx`
- Modify: `src/components/shell/app-shell.test.tsx`
- Modify: `src/components/shell/nav.tsx`
- Modify: `src/components/shell/nav.test.tsx`

- [ ] **Step 1: Update shell test first**

Modify `src/components/shell/app-shell.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AppStateProvider } from '@/store/app-store';
import { AppShell } from './app-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('AppShell', () => {
  it('keeps route content in the main landmark and mounts global affordances', () => {
    render(
      <AppStateProvider>
        <AppShell>
          <section aria-label="test content">Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open AI insight assistant' })).toBeInTheDocument();
    expect(screen.getByLabelText('test content')).toHaveTextContent('Route content');
    expect(screen.getByLabelText('Current CDE refresh')).toHaveTextContent('2026 Q2');
    expect(screen.getByText('Galaxy Constellation')).toBeInTheDocument();
    expect(screen.getByText('Galaxy Macau x Mastercard CDE')).toBeInTheDocument();
    expect(screen.getByText(/Enriched figures are modelled estimates/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run shell test to verify it fails**

Run:

```bash
npm run test -- src/components/shell/app-shell.test.tsx
```

Expected: FAIL because the current shell does not render the Open Design current refresh side card.

- [ ] **Step 3: Add Open Design brandmark**

Modify `src/components/shell/co-brand-lockup.tsx`:

```tsx
export function CoBrandLockup() {
  return (
    <div className="flex min-w-0 items-center gap-3.5">
      <div
        aria-hidden="true"
        className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[14px] border border-galaxy-gold/50 bg-[radial-gradient(circle_at_34%_18%,rgba(255,255,255,0.28),transparent_38%),linear-gradient(145deg,rgba(214,179,95,0.28),rgba(23,21,16,0.66))] font-serif text-[26px] leading-none text-galaxy-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_12px_28px_rgba(0,0,0,0.24)]"
      >
        G
      </div>
      <div className="min-w-0">
        <span className="block font-serif text-[25px] font-semibold leading-[1.05] tracking-normal text-galaxy-cream">
          Galaxy Constellation
        </span>
        <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">
          Galaxy Macau x Mastercard CDE
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add current refresh card component**

Create `src/components/shell/current-refresh-card.tsx`:

```tsx
'use client';

import { useAppState } from '@/store/app-store';

export function CurrentRefreshCard() {
  const { methodology, selectedQuarter } = useAppState();

  return (
    <div aria-label="Current CDE refresh" className="galaxy-glass-panel mt-8 rounded-2xl border border-white/10 p-4 lg:mt-[34px]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">
        Current refresh
      </div>
      <div className="mt-2.5 font-serif text-[38px] leading-none text-galaxy-cream">
        {selectedQuarter.label}
      </div>
      <p className="mt-3 text-[13px] leading-6 text-galaxy-muted">
        Matched coverage is shown as a modelled CDE estimate at {methodology.matchedCoveragePct}% and refreshed quarterly for campaign planning.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Apply constrained shell frame**

Modify `src/components/shell/app-shell.tsx`:

```tsx
import type { ReactNode } from 'react';
import { ChatAssistantLauncher } from '@/components/assistant/chat-assistant-launcher';
import { MethodologyNote } from '@/components/ui/methodology-note';
import { CoBrandLockup } from './co-brand-lockup';
import { CurrentRefreshCard } from './current-refresh-card';
import { Nav } from './nav';
import { PresenterTour } from './presenter-tour';
import { TopBar } from './top-bar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-[1] min-h-screen text-galaxy-cream">
      <div className="mx-auto grid min-h-screen w-full max-w-[1680px] min-w-0 border-x border-white/10 bg-galaxy-ink/30 backdrop-blur-[6px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="galaxy-glass-panel min-w-0 border-b border-white/10 px-[18px] py-[18px] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-[22px] lg:py-7">
          <CoBrandLockup />
          <div className="mt-[18px] min-w-0 lg:mt-9">
            <Nav />
          </div>
          <div className="hidden lg:block">
            <CurrentRefreshCard />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col pb-24 lg:pb-0">
          <div className="min-w-0 px-3 pt-3 sm:px-5 md:px-[26px] md:pt-[26px]">
            <TopBar />
          </div>
          <main className="min-w-0 flex-1 px-3 py-[18px] sm:px-5 md:px-[26px]">{children}</main>
          <footer className="border-t border-white/10 px-5 py-4 md:px-[26px]">
            <MethodologyNote />
          </footer>
        </div>
      </div>
      <PresenterTour />
      <ChatAssistantLauncher />
    </div>
  );
}
```

- [ ] **Step 6: Update navigation styles without changing routes**

Modify only the returned classes in `src/components/shell/nav.tsx`; keep `walletNavItems`, `acquisitionNavItems`, and `isAcquisitionLens` unchanged:

```tsx
return (
  <nav
    aria-label="Primary navigation"
    className="relative flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:grid lg:gap-2 lg:overflow-visible lg:pb-0"
  >
    {navItems.map((item, index) => {
      const Icon = item.icon;
      const isActive = item.href === '/'
        ? pathname === '/'
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
      const navIndex = String(index + 1).padStart(2, '0');

      return (
        <Link
          key={item.href}
          href={item.href}
          ref={isActive ? activeLinkRef : undefined}
          aria-label={item.label}
          className={clsx(
            'group flex h-11 shrink-0 items-center justify-between gap-3 rounded-xl border px-3 text-left text-xs font-semibold transition sm:text-sm lg:w-full',
            isActive
              ? 'border-galaxy-gold/40 bg-galaxy-gold/12 text-galaxy-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
              : 'border-transparent text-galaxy-muted hover:border-galaxy-gold/40 hover:bg-galaxy-slate/60 hover:text-galaxy-cream',
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 lg:hidden" />
            <span aria-hidden="true" className="lg:hidden">{item.shortLabel}</span>
            <span className="hidden truncate lg:inline">{item.label}</span>
          </span>
          <span aria-hidden="true" className="hidden font-mono text-[11px] text-galaxy-muted/70 lg:inline">
            {navIndex}
          </span>
        </Link>
      );
    })}
    <div className="mt-4 hidden items-center gap-2 rounded-xl border border-white/10 bg-galaxy-charcoal/50 px-3 py-2 text-xs text-galaxy-muted lg:flex">
      <Map aria-hidden="true" className="h-4 w-4 text-galaxy-gold" />
      {isAcquisitionLens(pathname) ? 'Inbound corridor view' : 'Cotai wallet view'}
    </div>
  </nav>
);
```

- [ ] **Step 7: Update navigation tests for index labels**

Add this test to `src/components/shell/nav.test.tsx`:

```tsx
it('renders Open Design numeric nav indexes on desktop labels', () => {
  render(<Nav />);

  expect(screen.getByRole('link', { name: 'Overview' })).toHaveTextContent('01');
  expect(screen.getByRole('link', { name: 'Wallet' })).toHaveTextContent('03');
  expect(screen.getByText('Cotai wallet view')).toBeInTheDocument();
});
```

- [ ] **Step 8: Run shell and nav tests**

Run:

```bash
npm run test -- src/components/shell/app-shell.test.tsx src/components/shell/nav.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add src/components/shell/co-brand-lockup.tsx src/components/shell/current-refresh-card.tsx src/components/shell/app-shell.tsx src/components/shell/app-shell.test.tsx src/components/shell/nav.tsx src/components/shell/nav.test.tsx
git commit -m "style: apply Open Design shell navigation"
```

Expected: commit succeeds with shell and nav files only.

---

### Task 3: Open Design Top Bar And Quarter Controls

**Files:**
- Modify: `src/components/shell/top-bar.tsx`
- Modify: `src/components/shell/top-bar.test.tsx`

- [ ] **Step 1: Replace quarter select expectations with segmented buttons**

In `src/components/shell/top-bar.test.tsx`, change the "shows compact CDE methodology metrics..." test to:

```tsx
it('shows cockpit metadata and defaults the segmented quarter selector to Q2 2026', () => {
  render(
    <AppStateProvider>
      <TopBar />
    </AppStateProvider>,
  );

  expect(screen.getByRole('banner')).toHaveTextContent('Executive wallet intelligence cockpit');
  expect(screen.getByText('7 CDE metrics')).toBeInTheDocument();
  expect(screen.getByText('Coverage 63%')).toBeInTheDocument();
  expect(screen.getByLabelText('Galaxy Macau and Mastercard data partnership')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Open CDE signal guide/i })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: /Quarter selector/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '2026 Q2' })).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 2: Update the quarter mutation test**

Replace the combobox quarter mutation test with:

```tsx
it('updates the selected reporting quarter from the accessible segmented selector', async () => {
  render(
    <AppStateProvider>
      <TopBar />
    </AppStateProvider>,
  );

  fireEvent.click(screen.getByRole('button', { name: '2026 Q1' }));

  expect(screen.getByRole('button', { name: '2026 Q1' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: '2026 Q2' })).toHaveAttribute('aria-pressed', 'false');
});
```

- [ ] **Step 3: Add copy narrative behavior test**

Add this test to `src/components/shell/top-bar.test.tsx`:

```tsx
it('copies a CDE-safe executive narrative for the selected segment', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });

  render(
    <AppStateProvider>
      <TopBar />
    </AppStateProvider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Copy narrative' }));

  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  expect(writeText.mock.calls[0][0]).toContain('Galaxy Constellation combines Galaxy first-party behavior with Mastercard CDE');
  expect(writeText.mock.calls[0][0]).toContain('2026 Q2');
  expect(writeText.mock.calls[0][0]).not.toMatch(/\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i);
  expect(screen.getByRole('status')).toHaveTextContent('Narrative copied');
});
```

- [ ] **Step 4: Run top bar tests to verify failure**

Run:

```bash
npm run test -- src/components/shell/top-bar.test.tsx
```

Expected: FAIL because `TopBar` still renders a select and no copy narrative button.

- [ ] **Step 5: Implement segmented top bar**

Modify `src/components/shell/top-bar.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useAppState } from '@/store/app-store';
import { BrandPartnershipBadge } from './brand-partnership-badge';
import { CdeSignalGuide } from './cde-signal-guide';
import { LensSwitch } from './lens-switch';

function segmentNarrative(quarterLabel: string, segmentName: string, opportunityIndex: number, leakagePct: number, cashBand: string) {
  return `Galaxy Constellation combines Galaxy first-party behavior with Mastercard CDE to rank wallet headroom by segment. For ${quarterLabel}, ${segmentName} leads the current briefing with Index ${Math.round(opportunityIndex)} opportunity headroom, ${Math.round(leakagePct)}% leakage, and ${cashBand} cross-property cash.`;
}

export function TopBar() {
  const {
    methodology,
    quarters,
    selectedQuarter,
    selectedQuarterId,
    selectedSegment,
    setSelectedQuarterId,
  } = useAppState();
  const [copyStatus, setCopyStatus] = useState('');
  const primaryLeakagePct = selectedSegment.categories.retailLuxury.leakagePct;

  async function copyNarrative() {
    const narrative = segmentNarrative(
      selectedQuarter.label,
      selectedSegment.name,
      selectedSegment.opportunityIndex,
      primaryLeakagePct,
      selectedSegment.crossPropertyCashBand,
    );

    try {
      await navigator.clipboard.writeText(narrative);
      setCopyStatus('Narrative copied');
    } catch {
      setCopyStatus('Copy unavailable in this preview');
    }
  }

  return (
    <header className="galaxy-glass-panel flex min-h-16 flex-col gap-4 rounded-[18px] border border-white/10 px-[18px] py-3.5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="m-0 text-sm font-semibold leading-tight text-galaxy-cream">
          Executive wallet intelligence cockpit
        </h1>
        <p className="mt-1 max-w-[62ch] text-[13px] leading-5 text-galaxy-muted">
          Turn Galaxy first-party behavior plus Mastercard CDE into a ranked marketing action plan for each quarter.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            aria-label={`${methodology.activeMetricCount} active CDE metrics`}
            className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-galaxy-gold"
          >
            {methodology.activeMetricCount} CDE metrics
          </span>
          <span className="text-sm font-medium text-galaxy-cream">
            Coverage {methodology.matchedCoveragePct}%
          </span>
          <BrandPartnershipBadge />
          <CdeSignalGuide />
          <LensSwitch />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <div
          role="group"
          aria-label="Quarter selector"
          className="flex max-w-full gap-1 overflow-x-auto rounded-[14px] border border-white/10 bg-galaxy-ink/50 p-1"
        >
          {quarters.map((quarter) => {
            const selected = quarter.id === selectedQuarterId;

            return (
              <button
                key={quarter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedQuarterId(quarter.id)}
                className="min-h-[34px] shrink-0 rounded-xl border border-transparent px-3 text-xs font-semibold tracking-normal text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream aria-pressed:border-galaxy-gold/40 aria-pressed:bg-galaxy-gold/12 aria-pressed:text-galaxy-cream"
              >
                {quarter.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={copyNarrative}
          className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-white/10 bg-galaxy-ink/45 px-4 text-[13px] font-semibold tracking-normal text-galaxy-cream transition hover:border-galaxy-gold/40 hover:text-galaxy-gold active:translate-y-px"
        >
          Copy narrative
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {copyStatus}
        </span>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Run top bar tests**

Run:

```bash
npm run test -- src/components/shell/top-bar.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/shell/top-bar.tsx src/components/shell/top-bar.test.tsx
git commit -m "feat: add Open Design cockpit top bar"
```

Expected: commit succeeds with top bar files only.

---

### Task 4: Dashboard View Model

**Files:**
- Create: `src/components/dashboard/open-design-view-model.test.ts`
- Create: `src/components/dashboard/open-design-view-model.ts`

- [ ] **Step 1: Write the failing view-model tests**

Create `src/components/dashboard/open-design-view-model.test.ts`:

```ts
import { latestQuarter, latestSegments, methodology } from '@/data';
import {
  buildAssistantAnswer,
  buildBoardroomBrief,
  buildCategoryRows,
  buildExecutiveMetrics,
  buildPlaybookRows,
  buildSegmentPriorityRows,
  buildWorkbenchRows,
  getPrimaryLeakage,
  getTopSegment,
} from './open-design-view-model';

const bannedCurrencyPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;

describe('open design dashboard view model', () => {
  it('selects the highest opportunity segment and derives the boardroom brief', () => {
    const topSegment = getTopSegment(latestSegments);
    const brief = buildBoardroomBrief(latestQuarter, topSegment);

    expect(topSegment.name).toBe('Cosmopolitan Connoisseurs');
    expect(brief.headline).toBe('2026 Q2: pitch Cosmopolitan Connoisseurs first.');
    expect(brief.audience).toBe('16-24k matched guests');
    expect(brief.proof).toContain('Index 118');
    expect(brief.proof).toContain('55% leak');
    expect(brief.move).toBe('Michelin-to-boutique retail path');
  });

  it('derives executive metrics with finite CDE-safe values', () => {
    const metrics = buildExecutiveMetrics(latestSegments, methodology);

    expect(metrics.map((metric) => metric.label)).toEqual([
      'Wallet headroom',
      'Matched guest base',
      'Galaxy wallet capture',
      'Top opportunity',
    ]);
    expect(metrics[0].value).toMatch(/^\d+%$/);
    expect(metrics[1].value).toMatch(/^\d+-\d+k$/);
    expect(metrics[2].value).toMatch(/^\d+%$/);
    expect(metrics[3].value).toMatch(/^Index \d+$/);
    expect(metrics.map((metric) => `${metric.value} ${metric.detail}`).join(' ')).not.toMatch(/NaN|Infinity/);
    expect(metrics.map((metric) => `${metric.value} ${metric.detail}`).join(' ')).not.toMatch(bannedCurrencyPattern);
  });

  it('derives category, segment, playbook, and workbench rows', () => {
    const rows = buildCategoryRows(latestSegments);
    const segmentRows = buildSegmentPriorityRows(latestSegments);
    const playbookRows = buildPlaybookRows(latestSegments);
    const workbenchRows = buildWorkbenchRows(latestSegments);

    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({ label: 'Hospitality' });
    expect(segmentRows[0]).toMatchObject({ name: 'Cosmopolitan Connoisseurs', priority: 'priority' });
    expect(playbookRows[0].title).toBe('Michelin-to-boutique retail path');
    expect(workbenchRows[0]).toMatchObject({ segment: 'Cosmopolitan Connoisseurs', decision: 'Pitch first' });
  });

  it('builds deterministic CDE-safe assistant answers', () => {
    const topSegment = getTopSegment(latestSegments);
    const primaryLeakage = getPrimaryLeakage(topSegment);
    const answer = buildAssistantAnswer('Which audience should Galaxy Marketing pitch first this quarter?', topSegment);

    expect(primaryLeakage.label).toBe('Retail/Luxury');
    expect(answer).toContain('recommend Cosmopolitan Connoisseurs first');
    expect(answer).toContain('Index 118');
    expect(answer).toContain('55% leakage');
    expect(answer).toContain('14-22k equiv./mo');
    expect(answer).not.toMatch(bannedCurrencyPattern);
  });
});
```

- [ ] **Step 2: Run view-model tests to verify failure**

Run:

```bash
npm run test -- src/components/dashboard/open-design-view-model.test.ts
```

Expected: FAIL because the view-model file does not exist.

- [ ] **Step 3: Implement the view model**

Create `src/components/dashboard/open-design-view-model.ts`:

```ts
import { CORE_CATEGORIES, type CoreCategory, type Methodology, type Quarter, type Segment } from '@/data';

export type DashboardTabId = 'opportunity' | 'wallet' | 'segments' | 'activation' | 'workbench';
export type SegmentPriority = 'priority' | 'watch' | 'nurture';

export const dashboardTabs: Array<{ id: DashboardTabId; label: string }> = [
  { id: 'opportunity', label: 'Opportunity' },
  { id: 'wallet', label: 'Wallet Split' },
  { id: 'segments', label: 'Segments' },
  { id: 'activation', label: 'Activation' },
  { id: 'workbench', label: 'Workbench' },
];

export const constellationPositions: Record<string, { size: number; left: number; top: number; tone: 'gold' | 'positive' | 'leak' }> = {
  'cosmopolitan-connoisseurs': { size: 56, left: 68, top: 31, tone: 'gold' },
  'gba-cross-border-explorers': { size: 48, left: 77, top: 58, tone: 'positive' },
  'diamond-high-rollers': { size: 44, left: 40, top: 24, tone: 'gold' },
  'aspiring-mass-affluent': { size: 60, left: 28, top: 64, tone: 'leak' },
  'family-leisure-seekers': { size: 45, left: 49, top: 76, tone: 'positive' },
  'mice-business-guests': { size: 46, left: 26, top: 38, tone: 'gold' },
};

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail/Luxury',
};

const categoryNotes: Record<CoreCategory, string> = {
  hospitality: 'Strong base, still enough off-property stay leakage to justify targeted win-back.',
  fnb: 'Chef-led dining and reservation moments can bridge into retail and stay conversion.',
  entertainment: 'Shows create intent; the next move is attaching dining and room extension prompts.',
  retailLuxury: 'The biggest visible gap for premium guests, especially boutique retail and accessible luxury.',
};

function finiteNumber(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function average(values: number[]) {
  const finiteValues = values.filter(Number.isFinite);

  if (finiteValues.length === 0) return 0;
  return Math.round(finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length);
}

function rangeLabel(low: number, high: number) {
  return `${Math.round(low)}-${Math.round(high)}k`;
}

function firstRecommendedPlay(segment: Segment) {
  return segment.recommendedPlays[0] ?? {
    title: 'Governed audience activation',
    lever: 'CDE-safe campaign brief',
    rationale: 'Use modelled ranges, percentages, and indices to prioritize the audience.',
    channel: 'Hybrid' as const,
  };
}

export function getAverageLeakage(segment: Segment) {
  return average(CORE_CATEGORIES.map((category) => finiteNumber(segment.categories[category]?.leakagePct)));
}

export function getTopSegment(segments: Segment[]) {
  return [...segments].sort((first, second) => (
    finiteNumber(second.opportunityIndex) - finiteNumber(first.opportunityIndex)
  ))[0] ?? segments[0];
}

export function getPrimaryLeakage(segment: Segment) {
  const category = [...CORE_CATEGORIES].sort((first, second) => (
    finiteNumber(segment.categories[second]?.leakagePct) - finiteNumber(segment.categories[first]?.leakagePct)
  ))[0] ?? 'retailLuxury';

  return {
    category,
    label: categoryLabels[category],
    leakagePct: finiteNumber(segment.categories[category]?.leakagePct),
  };
}

export function priorityForSegment(segment: Segment): SegmentPriority {
  const leakage = getAverageLeakage(segment);
  const opportunityIndex = finiteNumber(segment.opportunityIndex);

  if (opportunityIndex >= 110 || leakage >= 70) return 'priority';
  if (opportunityIndex >= 100 || finiteNumber(segment.metrics.channelShareOnlinePct) >= 55) return 'watch';
  return 'nurture';
}

export function buildBoardroomBrief(quarter: Quarter, segment: Segment) {
  const leakage = getPrimaryLeakage(segment);
  const play = firstRecommendedPlay(segment);

  return {
    headline: `${quarter.label}: pitch ${segment.name} first.`,
    audience: `${segment.sizeBand} matched guests`,
    proof: `Index ${Math.round(segment.opportunityIndex)} / ${Math.round(leakage.leakagePct)}% leak`,
    move: play.title,
    description: 'Open the meeting with a decision, not a dashboard tour. The page then proves the recommendation through CDE-ranked opportunity, wallet leakage, and a governed campaign handoff.',
  };
}

export function buildExecutiveMetrics(segments: Segment[], methodology: Methodology) {
  const matchedGuestLowK = segments.reduce((sum, segment) => sum + finiteNumber(segment.sizeLowK), 0);
  const matchedGuestHighK = segments.reduce((sum, segment) => sum + finiteNumber(segment.sizeHighK), 0);
  const walletCapturePct = average(segments.map((segment) => finiteNumber(segment.metrics.shareOfWallet)));
  const walletHeadroomPct = average(segments.flatMap((segment) => (
    CORE_CATEGORIES.map((category) => finiteNumber(segment.categories[category]?.leakagePct))
  )));
  const topOpportunityIndex = segments.length > 0
    ? Math.max(...segments.map((segment) => finiteNumber(segment.opportunityIndex)))
    : 0;

  return [
    {
      label: 'Wallet headroom',
      value: `${walletHeadroomPct}%`,
      detail: 'Average modelled leakage still addressable across hospitality, dining, entertainment and retail-luxury categories.',
      delta: '+1 pt vs Q1',
    },
    {
      label: 'Matched guest base',
      value: rangeLabel(matchedGuestLowK, matchedGuestHighK),
      detail: `Matched active segments modelled from CDE coverage of ${methodology.matchedCoveragePct}%.`,
      delta: '+2-4k vs Q1',
    },
    {
      label: 'Galaxy wallet capture',
      value: `${walletCapturePct}%`,
      detail: 'Average hospitality share across current-quarter segments.',
      delta: '-1 pt vs Q1',
    },
    {
      label: 'Top opportunity',
      value: `Index ${Math.round(topOpportunityIndex)}`,
      detail: 'Highest current-quarter segment opportunity index.',
      delta: '+2 index pts',
    },
  ];
}

export function buildCategoryRows(segments: Segment[]) {
  return CORE_CATEGORIES.map((category) => {
    const capturedSharePct = average(segments.map((segment) => finiteNumber(segment.categories[category]?.capturedSharePct)));
    const leakagePct = average(segments.map((segment) => finiteNumber(segment.categories[category]?.leakagePct)));

    return {
      category,
      label: categoryLabels[category],
      capturedSharePct,
      leakagePct,
      note: categoryNotes[category],
    };
  });
}

export function buildSegmentPriorityRows(segments: Segment[]) {
  return [...segments]
    .sort((first, second) => finiteNumber(second.opportunityIndex) - finiteNumber(first.opportunityIndex))
    .map((segment) => ({
      id: segment.id,
      name: segment.name,
      summary: segment.signatureTrait,
      audience: segment.sizeBand,
      index: Math.round(finiteNumber(segment.opportunityIndex)),
      leakage: `${Math.round(getPrimaryLeakage(segment).leakagePct)}%`,
      priority: priorityForSegment(segment),
    }));
}

export function buildPlaybookRows(segments: Segment[]) {
  return buildSegmentPriorityRows(segments).slice(0, 3).map((row) => {
    const segment = segments.find((item) => item.id === row.id) ?? segments[0];
    const play = firstRecommendedPlay(segment);

    return {
      segmentId: row.id,
      title: play.title,
      summary: play.rationale,
      channel: play.channel,
      indexLabel: row.id === 'diamond-high-rollers' ? segment.crossPropertyCashBand : `Index ${row.index}`,
      leakageLabel: getPrimaryLeakage(segment).label,
      cashBand: segment.crossPropertyCashBand,
      nextAction: play.lever,
    };
  });
}

export function buildWorkbenchRows(segments: Segment[]) {
  return buildSegmentPriorityRows(segments).slice(0, 4).map((row, index) => ({
    segment: row.name,
    index: String(row.index),
    leakage: row.leakage,
    confidence: index === 0 ? 'Strong coverage' : index === 1 ? 'Mobile-ready' : index === 2 ? 'Broad sample' : 'High value, smaller base',
    decision: index === 0 ? 'Pitch first' : index === 1 ? 'Package into itinerary' : index === 2 ? 'Test rewards accelerator' : 'Use VIP host path',
  }));
}

export function buildAssistantAnswer(prompt: string, segment: Segment) {
  const leakage = getPrimaryLeakage(segment);
  const play = firstRecommendedPlay(segment);

  return `For "${prompt}", recommend ${segment.name} first. The segment has Index ${Math.round(segment.opportunityIndex)} opportunity headroom, ${Math.round(leakage.leakagePct)}% leakage, and ${segment.crossPropertyCashBand} cross-property cash. The next best action is ${play.lever.toLowerCase()}, then measure conversion against the next CDE refresh.`;
}
```

- [ ] **Step 4: Run view-model tests**

Run:

```bash
npm run test -- src/components/dashboard/open-design-view-model.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/components/dashboard/open-design-view-model.ts src/components/dashboard/open-design-view-model.test.ts
git commit -m "feat: derive Open Design dashboard view model"
```

Expected: commit succeeds with the view-model files only.

---

### Task 5: Static Overview Sections

**Files:**
- Create: `src/components/dashboard/reading-guide.tsx`
- Create: `src/components/dashboard/boardroom-brief.tsx`
- Create: `src/components/dashboard/executive-metrics.tsx`
- Create: `src/components/dashboard/dashboard-hero.tsx`

- [ ] **Step 1: Create ReadingGuide**

Create `src/components/dashboard/reading-guide.tsx`:

```tsx
import type { DashboardTabId } from './open-design-view-model';

interface ReadingGuideProps {
  onJump: (tabId: DashboardTabId) => void;
}

export function ReadingGuide({ onJump }: ReadingGuideProps) {
  return (
    <section className="galaxy-glass-panel grid gap-4 rounded-[18px] border border-galaxy-gold/20 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" aria-label="How to read Galaxy Constellation">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">How to read this dashboard</div>
        <h2 className="mt-2 max-w-[28ch] font-serif text-[clamp(1.625rem,2.7vw,2.375rem)] font-semibold leading-[1.04] tracking-normal text-galaxy-cream">
          Start with the ranking, then prove the reason, then build the campaign.
        </h2>
        <p className="mt-2 max-w-[74ch] text-sm leading-6 text-galaxy-muted">
          Use the page as a boardroom readout: identify the largest wallet gap, inspect the CDE evidence, and leave with an activation brief Marketing can test.
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <div className="border-t border-white/10 pt-3"><b className="block text-[13px] text-galaxy-cream">1. What changed?</b><span className="mt-1.5 block text-xs leading-5 text-galaxy-muted">Quarter deltas show whether wallet headroom, matched guests, and capture improved or deteriorated.</span></div>
          <div className="border-t border-white/10 pt-3"><b className="block text-[13px] text-galaxy-cream">2. Why this audience?</b><span className="mt-1.5 block text-xs leading-5 text-galaxy-muted">The map, table, and scoring view expose the same ranking from different levels of detail.</span></div>
          <div className="border-t border-white/10 pt-3"><b className="block text-[13px] text-galaxy-cream">3. What action follows?</b><span className="mt-1.5 block text-xs leading-5 text-galaxy-muted">Activation translates the top finding into channel, offer, measurement window, and CDE-safe copy.</span></div>
        </div>
      </div>
      <div className="grid gap-2 lg:min-w-[220px]">
        <button type="button" onClick={() => onJump('workbench')} className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-galaxy-gold/40 bg-galaxy-gold px-4 text-[13px] font-semibold text-galaxy-ink shadow-lg shadow-black/20 transition hover:bg-galaxy-gold-lite active:translate-y-px">
          Open analytics workbench
        </button>
        <button type="button" onClick={() => onJump('activation')} className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-white/10 bg-galaxy-ink/45 px-4 text-[13px] font-semibold text-galaxy-cream transition hover:border-galaxy-gold/40 hover:text-galaxy-gold active:translate-y-px">
          Jump to campaign action
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create BoardroomBrief**

Create `src/components/dashboard/boardroom-brief.tsx`:

```tsx
import type { Quarter, Segment } from '@/data';
import { buildBoardroomBrief } from './open-design-view-model';

interface BoardroomBriefProps {
  quarter: Quarter;
  segment: Segment;
}

export function BoardroomBrief({ quarter, segment }: BoardroomBriefProps) {
  const brief = buildBoardroomBrief(quarter, segment);

  return (
    <section className="galaxy-glass-panel grid gap-6 rounded-[20px] border border-galaxy-gold/20 p-[clamp(18px,2.4vw,28px)] xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" aria-label="Boardroom answer">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">Boardroom answer</div>
        <h2 className="mt-2 max-w-[14ch] font-serif text-[clamp(2.375rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-normal text-galaxy-cream">
          <span className="text-galaxy-gold-lite">{quarter.label}:</span> pitch <span className="text-galaxy-gold-lite">{segment.name}</span> first.
        </h2>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-7 text-galaxy-muted">{brief.description}</p>
      </div>
      <div className="grid border-y border-white/10 md:grid-cols-3">
        <div className="grid min-h-[188px] content-between gap-4 border-b border-white/10 p-[18px] md:border-b-0 md:border-r"><span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">Audience</span><div><b className="block text-[clamp(1.25rem,2vw,1.75rem)] leading-tight text-galaxy-cream">{brief.audience}</b><small className="mt-2 block text-xs leading-5 text-galaxy-muted">Premium dining, boutique-retail, and luxury stay signals converge into one targetable cohort.</small></div></div>
        <div className="grid min-h-[188px] content-between gap-4 border-b border-white/10 p-[18px] md:border-b-0 md:border-r"><span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">Proof</span><div><b className="block text-[clamp(1.25rem,2vw,1.75rem)] leading-tight text-galaxy-cream">{brief.proof}</b><small className="mt-2 block text-xs leading-5 text-galaxy-muted">CDE shows stronger-than-baseline opportunity with retail-luxury wallet still outside Galaxy.</small></div></div>
        <div className="grid min-h-[188px] content-between gap-4 p-[18px]"><span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">Move</span><div><b className="block text-[clamp(1.25rem,2vw,1.75rem)] leading-tight text-galaxy-cream">{brief.move}</b><small className="mt-2 block text-xs leading-5 text-galaxy-muted">Use chef-led reservation intent to trigger Promenade privilege and private retail appointments.</small></div></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create DashboardHero**

Create `src/components/dashboard/dashboard-hero.tsx`:

```tsx
import type { Methodology, Quarter } from '@/data';

interface DashboardHeroProps {
  methodology: Methodology;
  quarter: Quarter;
}

export function DashboardHero({ methodology, quarter }: DashboardHeroProps) {
  return (
    <section className="grid gap-[18px] lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]" aria-label="Guest wallet intelligence hero">
      <div className="galaxy-glass-panel min-h-[382px] rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_80%_22%,rgba(214,179,95,0.08),transparent_27rem),linear-gradient(135deg,rgba(23,21,16,0.68),rgba(9,8,7,0.62))] p-[clamp(26px,4vw,46px)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Guest wallet intelligence</div>
        <h2 className="mt-[18px] max-w-[760px] font-serif text-[clamp(3.5rem,7vw,7rem)] font-semibold leading-[0.92] tracking-normal text-galaxy-cream">
          Find the wallet gap Galaxy can win next.
        </h2>
        <p className="mt-6 max-w-[68ch] text-[clamp(1rem,1.4vw,1.1875rem)] leading-8 text-galaxy-muted">
          Galaxy already knows stay, dining and rewards behavior. Mastercard CDE adds modelled off-property wallet, leakage and propensity so each quarter starts with a clear pitch priority.
        </p>
        <div className="mt-[34px] grid max-w-[760px] gap-3 md:grid-cols-3" aria-label="Methodology proof points">
          <div className="rounded-2xl border border-white/10 bg-galaxy-ink/50 p-[15px]"><b className="block font-mono text-2xl text-galaxy-cream">{methodology.matchedCoveragePct}%</b><span className="mt-2 block text-xs leading-5 text-galaxy-muted">Matched CDE coverage across active wallet cohorts.</span></div>
          <div className="rounded-2xl border border-white/10 bg-galaxy-ink/50 p-[15px]"><b className="block font-mono text-2xl text-galaxy-cream">{methodology.activeMetricCount}</b><span className="mt-2 block text-xs leading-5 text-galaxy-muted">Active CDE metrics used by the ranked findings.</span></div>
          <div className="rounded-2xl border border-white/10 bg-galaxy-ink/50 p-[15px]"><b className="block font-mono text-2xl text-galaxy-cream">Quarterly</b><span className="mt-2 block text-xs leading-5 text-galaxy-muted">Refresh rhythm for segment planning and campaign readout.</span></div>
        </div>
      </div>

      <aside className="galaxy-glass-panel grid rounded-[20px] border border-white/10 p-[22px]" aria-label="Mastercard CDE refresh">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Mastercard CDE refresh</div>
          <h2 className="mt-2.5 font-serif text-4xl font-semibold leading-tight text-galaxy-cream">{quarter.label} snapshot</h2>
          <p className="mt-3 text-sm leading-7 text-galaxy-muted">Demi-decile average, matched coverage, and modelled estimates expressed as ranges, indices, and percentages.</p>
        </div>
        <div className="relative mx-auto mt-6 grid h-[190px] w-[190px] place-items-center rounded-full bg-[conic-gradient(var(--galaxy-accent)_0deg_226deg,rgba(255,255,255,0.07)_226deg_360deg)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" aria-label={`${methodology.matchedCoveragePct} percent matched CDE coverage`}>
          <div className="absolute inset-3 rounded-full border border-white/10 bg-galaxy-charcoal" />
          <div className="relative z-[1] text-center">
            <strong className="block font-serif text-[58px] font-semibold leading-none text-galaxy-cream">{methodology.matchedCoveragePct}</strong>
            <span className="mx-auto block max-w-[11ch] text-[11px] font-semibold uppercase tracking-[0.08em] leading-tight text-galaxy-muted">matched coverage</span>
          </div>
        </div>
      </aside>
    </section>
  );
}
```

- [ ] **Step 4: Create ExecutiveMetrics**

Create `src/components/dashboard/executive-metrics.tsx`:

```tsx
import type { Methodology, Segment } from '@/data';
import { buildExecutiveMetrics } from './open-design-view-model';

interface ExecutiveMetricsProps {
  methodology: Methodology;
  segments: Segment[];
}

export function ExecutiveMetrics({ methodology, segments }: ExecutiveMetricsProps) {
  const metrics = buildExecutiveMetrics(segments, methodology);

  return (
    <section className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4" aria-label="Executive summary">
      {metrics.map((metric) => (
        <article key={metric.label} className="galaxy-glass-panel min-h-[152px] rounded-[18px] border border-white/10 p-[18px]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">{metric.label}</div>
          <strong className="mt-[18px] block font-serif text-[clamp(2.5rem,4vw,3.875rem)] font-semibold leading-[0.9] tracking-normal text-galaxy-cream">{metric.value}</strong>
          <p className="mt-3.5 text-[13px] leading-5 text-galaxy-muted">{metric.detail}</p>
          <span className="mt-3.5 inline-flex min-h-[26px] items-center rounded-full border border-galaxy-positive/30 bg-galaxy-positive/10 px-2.5 font-mono text-[11px] font-semibold text-galaxy-positive">{metric.delta}</span>
        </article>
      ))}
    </section>
  );
}
```

- [ ] **Step 5: Typecheck created sections**

Run:

```bash
npm run lint -- src/components/dashboard/reading-guide.tsx src/components/dashboard/boardroom-brief.tsx src/components/dashboard/dashboard-hero.tsx src/components/dashboard/executive-metrics.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/dashboard/reading-guide.tsx src/components/dashboard/boardroom-brief.tsx src/components/dashboard/dashboard-hero.tsx src/components/dashboard/executive-metrics.tsx
git commit -m "feat: add Open Design overview sections"
```

Expected: commit succeeds with the four dashboard section files.

---

### Task 6: Interactive Decision Workspace

**Files:**
- Create: `src/components/dashboard/decision-workspace.test.tsx`
- Create: `src/components/dashboard/decision-workspace.tsx`

- [ ] **Step 1: Write interaction tests**

Create `src/components/dashboard/decision-workspace.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology } from '@/data';
import { DecisionWorkspace } from './decision-workspace';

const bannedCurrencyPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;

function renderWorkspace() {
  return render(
    <DecisionWorkspace
      methodology={methodology}
      quarter={latestQuarter}
      segments={latestSegments}
      selectedSegmentId="cosmopolitan-connoisseurs"
      onSelectedSegmentChange={vi.fn()}
    />,
  );
}

describe('DecisionWorkspace', () => {
  it('renders the opportunity constellation and switches tabs accessibly', () => {
    renderWorkspace();

    expect(screen.getByRole('tab', { name: /Opportunity/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: /Opportunity map/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Workbench/i }));

    expect(screen.getByRole('tab', { name: /Workbench/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: /Ranking evidence/i })).toBeInTheDocument();
  });

  it('updates selected finding when a constellation star is selected', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: /Select Aspiring Mass-Affluent/i }));

    expect(screen.getByRole('button', { name: /Select Aspiring Mass-Affluent/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Selected audience: Aspiring Mass-Affluent/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Ask CDE AI')).toHaveTextContent('Aspiring Mass-Affluent');
  });

  it('filters segment priority board and shows live status', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: /Segments/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Watch' }));

    expect(screen.getByRole('button', { name: 'Watch' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status', { name: /Segment filter status/i })).toHaveTextContent(/watch audience/);
  });

  it('builds an audience brief and keeps generated assistant copy CDE-safe', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: /Build audience brief/i }));

    expect(screen.getByRole('tab', { name: /Activation/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Ask CDE AI')).toHaveTextContent('Audience brief built');
    expect(screen.getByLabelText('Ask CDE AI')).not.toHaveTextContent(bannedCurrencyPattern);
  });

  it('validates assistant prompts and supports quick prompts', () => {
    renderWorkspace();

    const assistant = screen.getByLabelText('Ask CDE AI');
    const prompt = within(assistant).getByRole('textbox', { name: /CDE assistant prompt/i });

    fireEvent.change(prompt, { target: { value: '' } });
    fireEvent.click(within(assistant).getByRole('button', { name: /Generate answer/i }));

    expect(prompt).toHaveAttribute('aria-invalid', 'true');
    expect(assistant).toHaveTextContent('Prompt required');

    fireEvent.click(within(assistant).getByRole('button', { name: 'Why trust it?' }));

    expect(prompt).toHaveAttribute('aria-invalid', 'false');
    expect(assistant).toHaveTextContent('Trust rationale');
    expect(assistant).not.toHaveTextContent(bannedCurrencyPattern);
  });
});
```

- [ ] **Step 2: Run interaction tests to verify failure**

Run:

```bash
npm run test -- src/components/dashboard/decision-workspace.test.tsx
```

Expected: FAIL because `decision-workspace.tsx` does not exist.

- [ ] **Step 3: Implement DecisionWorkspace**

Create `src/components/dashboard/decision-workspace.tsx`:

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import type { Methodology, Quarter, Segment } from '@/data';
import {
  buildAssistantAnswer,
  buildCategoryRows,
  buildPlaybookRows,
  buildSegmentPriorityRows,
  buildWorkbenchRows,
  constellationPositions,
  dashboardTabs,
  getPrimaryLeakage,
  getTopSegment,
  type DashboardTabId,
  type SegmentPriority,
} from './open-design-view-model';

interface DecisionWorkspaceProps {
  methodology: Methodology;
  quarter: Quarter;
  segments: Segment[];
  selectedSegmentId: string;
  onSelectedSegmentChange: (segmentId: string) => void;
}

function selectedSegmentFrom(segments: Segment[], selectedSegmentId: string) {
  return segments.find((segment) => segment.id === selectedSegmentId) ?? getTopSegment(segments);
}

function tabPanelName(tabId: DashboardTabId) {
  if (tabId === 'opportunity') return 'Opportunity map';
  if (tabId === 'wallet') return 'Category capture';
  if (tabId === 'segments') return 'Audience ranking';
  if (tabId === 'activation') return 'Campaign action';
  return 'Ranking evidence';
}

export function DecisionWorkspace({
  methodology,
  quarter,
  segments,
  selectedSegmentId,
  onSelectedSegmentChange,
}: DecisionWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>('opportunity');
  const [filter, setFilter] = useState<SegmentPriority | 'all'>('all');
  const [localSelectedSegmentId, setLocalSelectedSegmentId] = useState(selectedSegmentId);
  const [prompt, setPrompt] = useState('Which audience should Galaxy Marketing pitch first this quarter?');
  const [promptError, setPromptError] = useState('');
  const selectedSegment = selectedSegmentFrom(segments, localSelectedSegmentId);
  const [assistantAnswer, setAssistantAnswer] = useState(
    buildAssistantAnswer('Which audience should Galaxy Marketing pitch first this quarter?', selectedSegment),
  );
  const [assistantStatus, setAssistantStatus] = useState('CDE-safe ranges only');
  const segmentRows = useMemo(() => buildSegmentPriorityRows(segments), [segments]);
  const filteredSegments = filter === 'all' ? segmentRows : segmentRows.filter((segment) => segment.priority === filter);
  const categoryRows = useMemo(() => buildCategoryRows(segments), [segments]);
  const playbookRows = useMemo(() => buildPlaybookRows(segments), [segments]);
  const workbenchRows = useMemo(() => buildWorkbenchRows(segments), [segments]);
  const selectedLeakage = getPrimaryLeakage(selectedSegment);

  useEffect(() => {
    setLocalSelectedSegmentId(selectedSegmentId);
  }, [selectedSegmentId]);

  function selectSegment(segment: Segment) {
    setLocalSelectedSegmentId(segment.id);
    onSelectedSegmentChange(segment.id);
    setAssistantAnswer(`Selected audience: ${segment.name}. Use ${segment.recommendedPlays[0]?.lever.toLowerCase() ?? 'a governed audience activation'} because the segment shows ${Math.round(getPrimaryLeakage(segment).leakagePct)}% leakage, Index ${Math.round(segment.opportunityIndex)} opportunity headroom, and ${segment.crossPropertyCashBand} cross-property cash.`);
    setAssistantStatus('Audience selection updated');
  }

  function activateTab(tabId: DashboardTabId) {
    setActiveTab(tabId);
  }

  function buildAudienceBrief() {
    setActiveTab('activation');
    setAssistantAnswer(`Audience brief built: prioritize ${selectedSegment.name} with ${selectedSegment.recommendedPlays[0]?.lever.toLowerCase() ?? 'a governed campaign brief'}. Keep the proof chain visible: Index ${Math.round(selectedSegment.opportunityIndex)}, ${Math.round(selectedLeakage.leakagePct)}% leakage, ${selectedSegment.crossPropertyCashBand} cross-property cash, and CDE-safe ranges only.`);
    setAssistantStatus('Audience brief ready');
  }

  function generateAnswer() {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setPromptError('Enter a question or use a quick prompt before generating.');
      setAssistantStatus('Prompt required');
      return;
    }

    setPromptError('');
    setAssistantAnswer(buildAssistantAnswer(trimmedPrompt, selectedSegment));
    setAssistantStatus('Generated from current quarter');
  }

  function loadQuickPrompt(nextPrompt: string) {
    setPrompt(nextPrompt);
    setPromptError('');

    if (nextPrompt.includes('trust')) {
      setAssistantAnswer('Trust rationale: the ranking uses matched CDE coverage, modelled ranges, percentages, and indices. It does not expose customer-level card data, and the workbench shows why the top segment is ranked first.');
      setAssistantStatus('Governance answer ready');
      return;
    }

    if (nextPrompt.includes('constellation')) {
      setAssistantAnswer('Plain-English reading: each point is a guest segment. The number is the CDE opportunity index, the distance from Galaxy capture shows leakage, and the largest high-index point is where Marketing should start the discussion.');
      setAssistantStatus('Chart explained');
      return;
    }

    setAssistantAnswer(`CDE-safe campaign brief: target ${selectedSegment.name} with ${selectedSegment.recommendedPlays[0]?.lever.toLowerCase() ?? 'a governed audience activation'}. Use the selected segment insight as the trigger and the next quarterly CDE refresh as the measurement window.`);
    setAssistantStatus('Campaign brief ready');
  }

  return (
    <section className="grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_360px]" aria-label="Decision workspace">
      <div className="galaxy-glass-panel min-w-0 rounded-[20px] border border-white/10 p-5">
        <div role="tablist" aria-label="Dashboard workspace tabs" className="mb-[18px] flex gap-2 overflow-x-auto pb-1">
          {dashboardTabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`dashboard-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`dashboard-panel-${tab.id}`}
              onClick={() => activateTab(tab.id)}
              className="inline-flex min-h-[42px] shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-semibold text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream aria-selected:border-galaxy-gold/40 aria-selected:bg-galaxy-gold/12 aria-selected:text-galaxy-cream"
            >
              <span>{tab.label}</span>
              <span aria-hidden="true" className="font-mono text-[11px] text-galaxy-muted/70">{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        <section
          id="dashboard-panel-opportunity"
          role="tabpanel"
          aria-labelledby="dashboard-tab-opportunity"
          aria-label={tabPanelName('opportunity')}
          hidden={activeTab !== 'opportunity'}
        >
          <div className="mb-[18px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Opportunity map</div>
            <h2 className="mt-2 font-serif text-[38px] font-semibold leading-tight text-galaxy-cream">Wallet headroom constellation</h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">Point size signals value, distance from centre signals leakage, and the number shows the opportunity index. The selected quarter controls the ranking.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="relative min-h-[430px] overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(214,179,95,0.07),transparent_32%),linear-gradient(135deg,rgba(9,8,7,0.48),rgba(23,21,16,0.62))]" aria-label="Segment opportunity constellation">
              <div className="absolute right-3.5 top-3.5 z-[2] max-w-[220px] rounded-[14px] border border-white/10 bg-galaxy-ink/75 p-3 text-xs leading-5 text-galaxy-muted"><b className="mb-1 block text-galaxy-cream">Reading model</b>Start with the largest numbered point. Larger number means stronger CDE opportunity index; farther from the Galaxy core means more wallet leakage to win back.</div>
              <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 grid h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-galaxy-gold/30 bg-galaxy-gold/10 text-center text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-galaxy-muted">Galaxy<br />capture</div>
              {segments.map((segment) => {
                const position = constellationPositions[segment.id] ?? { size: 48, left: 50, top: 50, tone: 'gold' as const };
                const pressed = selectedSegment.id === segment.id;
                const toneClass = position.tone === 'positive'
                  ? 'border-galaxy-positive/50 bg-galaxy-positive text-galaxy-ink'
                  : position.tone === 'leak'
                    ? 'border-galaxy-leak/60 bg-galaxy-leak text-galaxy-cream'
                    : 'border-galaxy-gold/50 bg-galaxy-gold text-galaxy-ink';

                return (
                  <button
                    key={segment.id}
                    type="button"
                    aria-label={`Select ${segment.name}, opportunity index ${Math.round(segment.opportunityIndex)}`}
                    aria-pressed={pressed}
                    onClick={() => selectSegment(segment)}
                    className={clsx('absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-[11px] font-bold shadow-lg shadow-black/30 transition aria-pressed:outline aria-pressed:outline-2 aria-pressed:outline-offset-4 aria-pressed:outline-galaxy-gold', toneClass)}
                    style={{ width: position.size, height: position.size, left: `${position.left}%`, top: `${position.top}%` }}
                  >
                    {Math.round(segment.opportunityIndex)}
                  </button>
                );
              })}
              <div className="absolute bottom-4 left-4 grid gap-2 rounded-[14px] border border-white/10 bg-galaxy-ink/75 p-3 text-xs text-galaxy-muted">
                <span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-galaxy-gold" />Index label shows opportunity score</span>
                <span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-galaxy-leak" />Larger orbit means more leakage</span>
                <span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-galaxy-positive" />Green points indicate mobile-ready cohorts</span>
              </div>
            </div>
            <article className="galaxy-glass-panel grid min-h-[430px] content-between rounded-[18px] border border-galaxy-gold/25 p-[18px]">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Selected finding</div>
                <h3 className="mt-2.5 font-serif text-[34px] font-semibold leading-tight text-galaxy-cream">{selectedSegment.name}: {selectedSegment.recommendedPlays[0]?.title ?? 'Governed audience activation'}</h3>
                <p className="mt-3.5 text-sm leading-6 text-galaxy-muted">{selectedSegment.signatureTrait} The CDE view shows {Math.round(selectedLeakage.leakagePct)}% primary leakage with Index {Math.round(selectedSegment.opportunityIndex)} opportunity headroom.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-xl border border-white/10 bg-galaxy-ink/45 px-2.5 py-1.5 text-xs font-semibold text-galaxy-muted">Opportunity <b className="text-galaxy-cream">Index {Math.round(selectedSegment.opportunityIndex)}</b></span>
                  <span className="rounded-xl border border-white/10 bg-galaxy-ink/45 px-2.5 py-1.5 text-xs font-semibold text-galaxy-muted">Primary leakage <b className="text-galaxy-cream">{Math.round(selectedLeakage.leakagePct)}%</b></span>
                  <span className="rounded-xl border border-white/10 bg-galaxy-ink/45 px-2.5 py-1.5 text-xs font-semibold text-galaxy-muted">Cross-property cash <b className="text-galaxy-cream">{selectedSegment.crossPropertyCashBand}</b></span>
                </div>
                <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-galaxy-muted" role="status" aria-live="polite">Selected audience: {selectedSegment.name}. Use the workbench to inspect the proof chain before exporting a brief.</p>
              </div>
              <button type="button" onClick={buildAudienceBrief} className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-xl border border-galaxy-gold/40 bg-galaxy-gold px-4 text-[13px] font-semibold text-galaxy-ink transition hover:bg-galaxy-gold-lite active:translate-y-px">Build audience brief</button>
            </article>
          </div>
        </section>

        <section id="dashboard-panel-wallet" role="tabpanel" aria-labelledby="dashboard-tab-wallet" aria-label={tabPanelName('wallet')} hidden={activeTab !== 'wallet'}>
          <div className="mb-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Category capture</div><h2 className="mt-2 font-serif text-[38px] font-semibold text-galaxy-cream">Where Galaxy owns wallet share</h2><p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">Average category capture across selected segments, with the market remainder shown as CDE-modelled leakage.</p></div>
          <div className="grid gap-4">
            {categoryRows.map((row) => (
              <div key={row.category} className="rounded-2xl border border-white/10 bg-galaxy-ink/40 p-4">
                <div className="mb-2 flex justify-between gap-4 text-sm font-semibold text-galaxy-cream"><span>{row.label}</span><span className="font-mono text-xs text-galaxy-muted">{row.capturedSharePct}% captured / {row.leakagePct}% leakage</span></div>
                <div className="h-4 overflow-hidden rounded-full bg-galaxy-market"><div className="h-full rounded-full bg-galaxy-gold" style={{ width: `${row.capturedSharePct}%` }} /></div>
                <p className="mt-2 text-xs leading-5 text-galaxy-muted">{row.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="dashboard-panel-segments" role="tabpanel" aria-labelledby="dashboard-tab-segments" aria-label={tabPanelName('segments')} hidden={activeTab !== 'segments'}>
          <div className="mb-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Audience ranking</div><h2 className="mt-2 font-serif text-[38px] font-semibold text-galaxy-cream">Segment priority board</h2><p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">Each segment card connects Galaxy-known behavior to the CDE wallet reveal, so marketing can move from insight to audience selection.</p></div>
          <div className="mb-2 flex flex-wrap gap-2" aria-label="Segment priority filters">
            {(['all', 'priority', 'watch', 'nurture'] as const).map((item) => (
              <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className="min-h-9 rounded-full border border-white/10 bg-galaxy-ink/45 px-3 text-xs font-semibold text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream aria-pressed:border-galaxy-gold/40 aria-pressed:bg-galaxy-gold/12 aria-pressed:text-galaxy-cream">{item === 'all' ? 'All segments' : item[0].toUpperCase() + item.slice(1)}</button>
            ))}
          </div>
          <p aria-label="Segment filter status" role="status" aria-live="polite" className="text-xs leading-5 text-galaxy-muted">Showing {filteredSegments.length} {filter === 'all' ? 'all' : filter} audience {filteredSegments.length === 1 ? 'segment' : 'segments'}.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3" role="list" aria-live="polite">
            {filteredSegments.map((segment) => (
              <article key={segment.id} role="listitem" className="galaxy-glass-panel grid min-h-[242px] content-between rounded-[18px] border border-white/10 p-4">
                <div><span className="inline-flex min-h-[30px] items-center rounded-full border border-white/10 px-2.5 text-xs font-semibold capitalize text-galaxy-muted">{segment.priority}</span><h3 className="mt-2 text-lg font-semibold leading-tight text-galaxy-cream">{segment.name}</h3><p className="mt-2.5 text-[13px] leading-6 text-galaxy-muted">{segment.summary}</p></div>
                <div className="grid gap-2 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-galaxy-charcoal/60 p-2.5"><span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-galaxy-muted">Audience</span><b className="mt-1.5 block font-mono text-[13px] text-galaxy-cream">{segment.audience}</b></div><div className="rounded-xl border border-white/10 bg-galaxy-charcoal/60 p-2.5"><span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-galaxy-muted">Index</span><b className="mt-1.5 block font-mono text-[13px] text-galaxy-cream">{segment.index}</b></div><div className="rounded-xl border border-white/10 bg-galaxy-charcoal/60 p-2.5"><span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-galaxy-muted">Leakage</span><b className="mt-1.5 block font-mono text-[13px] text-galaxy-cream">{segment.leakage}</b></div></div>
              </article>
            ))}
          </div>
        </section>

        <section id="dashboard-panel-activation" role="tabpanel" aria-labelledby="dashboard-tab-activation" aria-label={tabPanelName('activation')} hidden={activeTab !== 'activation'}>
          <div className="mb-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Campaign action</div><h2 className="mt-2 font-serif text-[38px] font-semibold text-galaxy-cream">Recommended activation plays</h2><p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">Top findings convert into channel, offer, and audience instructions that a Galaxy Marketing team can actually test.</p></div>
          <div className="grid gap-3">{playbookRows.map((row) => (<article key={row.segmentId} className="grid gap-4 rounded-2xl border border-white/10 bg-galaxy-ink/40 p-4 md:grid-cols-[1fr_150px_120px] md:items-center"><div><h3 className="m-0 text-base font-semibold text-galaxy-cream">{row.title}</h3><p className="mt-2 text-[13px] leading-6 text-galaxy-muted">{row.summary}</p></div><span className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 px-2.5 text-xs font-semibold text-galaxy-muted">{row.channel}</span><span className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 px-2.5 text-xs font-semibold text-galaxy-muted">{row.indexLabel}</span></article>))}</div>
          <div className="galaxy-table-wrap mt-4" tabIndex={0} aria-label="Recommended activation plays table"><table className="galaxy-table"><caption className="sr-only">Recommended activation plays by segment</caption><thead><tr><th scope="col">Finding</th><th scope="col">Primary leakage</th><th scope="col">Cross-property cash</th><th scope="col">Next action</th></tr></thead><tbody>{playbookRows.map((row) => (<tr key={row.segmentId}><td>{segments.find((segment) => segment.id === row.segmentId)?.name}</td><td>{row.leakageLabel}</td><td className="galaxy-number">{row.cashBand}</td><td>{row.nextAction}</td></tr>))}</tbody></table></div>
        </section>

        <section id="dashboard-panel-workbench" role="tabpanel" aria-labelledby="dashboard-tab-workbench" aria-label={tabPanelName('workbench')} hidden={activeTab !== 'workbench'}>
          <div className="mb-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Ranking evidence</div><h2 className="mt-2 font-serif text-[38px] font-semibold text-galaxy-cream">Why the dashboard ranks this audience first</h2><p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">The scoring view shows the formula inputs, confidence boundaries, and governed handoff from evidence to campaign action.</p></div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="rounded-2xl border border-white/10 bg-galaxy-ink/40 p-4"><h3 className="text-base font-semibold text-galaxy-cream">Ranking formula in buyer language</h3><div className="mt-3 grid gap-2 text-[13px] leading-6 text-galaxy-muted"><div className="grid gap-3 sm:grid-cols-[112px_1fr]"><b className="font-mono text-xs text-galaxy-cream">Index {Math.round(selectedSegment.opportunityIndex)}</b><span>Opportunity signal above the matched-cohort baseline of 100.</span></div><div className="grid gap-3 sm:grid-cols-[112px_1fr]"><b className="font-mono text-xs text-galaxy-cream">{Math.round(selectedLeakage.leakagePct)}% leak</b><span>Primary wallet still outside Galaxy, expressed as a modelled CDE percentage.</span></div><div className="grid gap-3 sm:grid-cols-[112px_1fr]"><b className="font-mono text-xs text-galaxy-cream">{selectedSegment.crossPropertyCashBand}</b><span>Cross-property cash range that can justify a campaign test without exposing raw card-level data.</span></div></div><div className="galaxy-table-wrap mt-4" tabIndex={0} aria-label="Opportunity ranking formula table"><table className="galaxy-table"><caption className="sr-only">Opportunity ranking formula by segment</caption><thead><tr><th scope="col">Segment</th><th scope="col">Index</th><th scope="col">Leakage</th><th scope="col">Confidence</th><th scope="col">Decision</th></tr></thead><tbody>{workbenchRows.map((row) => (<tr key={row.segment}><td>{row.segment}</td><td className="galaxy-number">{row.index}</td><td className="galaxy-number">{row.leakage}</td><td>{row.confidence}</td><td>{row.decision}</td></tr>))}</tbody></table></div></div>
            <div className="rounded-2xl border border-white/10 bg-galaxy-ink/40 p-4"><h3 className="text-base font-semibold text-galaxy-cream">Trust and interpretation guardrails</h3><div className="mt-3 grid gap-2 text-[13px] leading-6 text-galaxy-muted"><div className="grid gap-3 border-t border-white/10 pt-2 sm:grid-cols-[96px_1fr]"><b className="text-galaxy-cream">Coverage</b><span>{methodology.matchedCoveragePct}% matched CDE coverage. Keep every figure as a range, percentage, or index.</span></div><div className="grid gap-3 border-t border-white/10 pt-2 sm:grid-cols-[96px_1fr]"><b className="text-galaxy-cream">Refresh</b><span>{quarter.label} snapshot. New leaders and deteriorating capture are flagged each quarter.</span></div><div className="grid gap-3 border-t border-white/10 pt-2 sm:grid-cols-[96px_1fr]"><b className="text-galaxy-cream">Suppression</b><span>No customer-level export. Output campaign segments and CDE-safe rationale only.</span></div><div className="grid gap-3 border-t border-white/10 pt-2 sm:grid-cols-[96px_1fr]"><b className="text-galaxy-cream">Measure</b><span>Each activation returns to the next refresh with capture, leakage, and conversion change.</span></div></div></div>
          </div>
        </section>
      </div>

      <aside className="galaxy-glass-panel sticky top-[18px] grid gap-4 rounded-[20px] border border-white/10 p-5" aria-label="Ask CDE AI">
        <div><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">Ask CDE AI</div><h2 className="mt-2 font-serif text-[34px] font-semibold leading-tight text-galaxy-cream">Explain the next best audience.</h2><p className="mt-2 text-[13px] leading-6 text-galaxy-muted">Generate an executive-safe answer using only modelled ranges, percentages, and indices.</p></div>
        <div className="grid gap-2.5">
          <input aria-label="CDE assistant prompt" aria-invalid={Boolean(promptError)} value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-[46px] w-full rounded-[13px] border border-white/10 bg-galaxy-ink/55 px-3 text-galaxy-cream aria-invalid:border-galaxy-leak" />
          <p className={clsx('min-h-[18px] text-xs leading-5', promptError ? 'text-galaxy-leak' : 'text-galaxy-muted')}>{promptError || 'Ask for an explanation, trust rationale, or CDE-safe campaign brief.'}</p>
          <button type="button" onClick={generateAnswer} className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-galaxy-gold/40 bg-galaxy-gold px-4 text-[13px] font-semibold text-galaxy-ink transition hover:bg-galaxy-gold-lite active:translate-y-px">Generate answer</button>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Assistant quick prompts">
          <button type="button" onClick={() => loadQuickPrompt('Explain the constellation in plain English.')} className="min-h-8 rounded-full border border-white/10 bg-galaxy-ink/45 px-2.5 text-xs font-semibold text-galaxy-muted">Explain chart</button>
          <button type="button" onClick={() => loadQuickPrompt('Why should Galaxy trust this ranking?')} className="min-h-8 rounded-full border border-white/10 bg-galaxy-ink/45 px-2.5 text-xs font-semibold text-galaxy-muted">Why trust it?</button>
          <button type="button" onClick={() => loadQuickPrompt('Write a CDE-safe campaign brief for the top segment.')} className="min-h-8 rounded-full border border-white/10 bg-galaxy-ink/45 px-2.5 text-xs font-semibold text-galaxy-muted">Build brief</button>
        </div>
        <div className="min-h-[190px] rounded-2xl border border-white/10 bg-galaxy-ink/50 p-4 text-sm leading-7 text-galaxy-cream" aria-live="polite">
          {assistantAnswer}
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-galaxy-muted" role="status" aria-live="polite"><span>{assistantStatus}</span><button type="button" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-galaxy-cream">Copy answer</button></div>
      </aside>
    </section>
  );
}
```

- [ ] **Step 4: Run interaction tests**

Run:

```bash
npm run test -- src/components/dashboard/decision-workspace.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/components/dashboard/decision-workspace.tsx src/components/dashboard/decision-workspace.test.tsx
git commit -m "feat: add Open Design decision workspace"
```

Expected: commit succeeds with the workspace files only.

---

### Task 7: Compose The Redesigned Overview Route

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

- [ ] **Step 1: Update overview tests**

Modify the first test in `src/app/page.test.tsx` to assert the Open Design route contract:

```tsx
it('renders the Open Design executive cockpit overview', () => {
  renderHome();

  expect(screen.getByRole('heading', { name: /2026 Q2: pitch Cosmopolitan Connoisseurs first/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Find the wallet gap Galaxy can win next/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Wallet headroom constellation/i })).toBeInTheDocument();
  expect(screen.getByLabelText('How to read Galaxy Constellation')).toHaveTextContent('Start with the ranking');
  expect(screen.getByLabelText('Boardroom answer')).toHaveTextContent('Index 118');
  expect(screen.getByLabelText('Executive summary')).toHaveTextContent('Wallet headroom');
  expect(screen.getByLabelText('Decision workspace')).toHaveTextContent('Opportunity');
  expect(screen.getByLabelText('Ask CDE AI')).toHaveTextContent('Explain the next best audience');
  expect(screen.getAllByText(/Mastercard CDE/i).length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText(/modelled off-property wallet/i)).toBeInTheDocument();
  expect(screen.queryByText(/NaN|Infinity/i)).not.toBeInTheDocument();
});
```

Keep these existing tests and update their selectors only when needed:

```tsx
it('does not surface non-finite aggregate values from unexpected segment data', () => {
  const malformedSegment = {
    ...latestSegments[0],
    sizeLowK: Number.NaN,
    sizeHighK: Number.POSITIVE_INFINITY,
    metrics: {
      ...latestSegments[0].metrics,
      shareOfWallet: Number.NaN,
    },
    propensities: {
      ...latestSegments[0].propensities,
      topTierRewards: Number.POSITIVE_INFINITY,
    },
    categories: latestSegments[0].categories,
    opportunityIndex: Number.POSITIVE_INFINITY,
  };

  expect(() => {
    mockAppState([malformedSegment as unknown as Segment]);
    render(<Home />);
  }).not.toThrow();
  expect(screen.queryByText(/NaN|Infinity/i)).not.toBeInTheDocument();
});

it('does not render its own main landmark because the shell owns it', () => {
  renderHome();
  expect(screen.queryByRole('main')).not.toBeInTheDocument();
});
```

Remove the old test that expects three overview links to `/leakage`; the new Open Design workspace uses in-page tabs and the global nav owns cross-route movement.

- [ ] **Step 2: Run overview tests to verify failure**

Run:

```bash
npm run test -- src/app/page.test.tsx
```

Expected: FAIL because `page.tsx` still renders the old overview surface.

- [ ] **Step 3: Replace overview route composition**

Modify `src/app/page.tsx`:

```tsx
'use client';

import { BoardroomBrief } from '@/components/dashboard/boardroom-brief';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { DecisionWorkspace } from '@/components/dashboard/decision-workspace';
import { ExecutiveMetrics } from '@/components/dashboard/executive-metrics';
import { getTopSegment, type DashboardTabId } from '@/components/dashboard/open-design-view-model';
import { ReadingGuide } from '@/components/dashboard/reading-guide';
import { useAppState } from '@/store/app-store';

export default function Home() {
  const {
    methodology,
    selectedQuarter,
    selectedSegmentId,
    segments,
    setSelectedSegmentId,
  } = useAppState();
  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId) ?? getTopSegment(segments);

  function jumpToWorkspace(tabId: DashboardTabId) {
    const tab = document.getElementById(`dashboard-tab-${tabId}`);
    tab?.click();
    document.querySelector('[aria-label="Decision workspace"]')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  return (
    <div className="space-y-[18px] text-galaxy-cream">
      <ReadingGuide onJump={jumpToWorkspace} />
      <BoardroomBrief quarter={selectedQuarter} segment={selectedSegment} />
      <DashboardHero methodology={methodology} quarter={selectedQuarter} />
      <ExecutiveMetrics methodology={methodology} segments={segments} />
      <DecisionWorkspace
        methodology={methodology}
        quarter={selectedQuarter}
        segments={segments}
        selectedSegmentId={selectedSegment.id}
        onSelectedSegmentChange={setSelectedSegmentId}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run overview tests**

Run:

```bash
npm run test -- src/app/page.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: compose Open Design overview cockpit"
```

Expected: commit succeeds with overview route files only.

---

### Task 8: Playwright Compliance And Responsive Verification

**Files:**
- Modify: `e2e/compliance.spec.ts`
- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Update overview e2e assertions**

In `e2e/compliance.spec.ts`, replace the `route === '/'` assertions with:

```ts
if (route === '/') {
  await expect(page.getByRole('heading', { name: /2026 Q2: pitch Cosmopolitan Connoisseurs first/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Find the wallet gap Galaxy can win next/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Wallet headroom constellation/i })).toBeVisible();
  await expect(page.getByLabel('How to read Galaxy Constellation')).toBeVisible();
  await expect(page.getByLabel('Ask CDE AI')).toBeVisible();
}
```

- [ ] **Step 2: Update desktop projector viewport assertions**

In `e2e/compliance.spec.ts`, update the desktop projector test:

```ts
test('desktop projector viewport has visible nav, cockpit top bar, and Open Design hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await expect(page.getByRole('link', { name: /Overview/i })).toBeVisible();
  await expect(page.getByRole('group', { name: /Quarter selector/i })).toBeVisible();
  await expect(page.getByRole('banner').getByLabel('Galaxy Macau and Mastercard data partnership')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Find the wallet gap Galaxy can win next/i })).toBeVisible();
  await expect(page.getByLabel('Boardroom answer')).toBeVisible();
});
```

- [ ] **Step 3: Add mobile overview no-overflow check**

Add this test to `e2e/compliance.spec.ts`:

```ts
test('mobile overview keeps cockpit content readable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /2026 Q2: pitch Cosmopolitan Connoisseurs first/i })).toBeVisible();
  await expect(page.getByLabel('How to read Galaxy Constellation')).toBeVisible();
  await expect(page.getByLabel('Decision workspace')).toBeVisible();
  await expect(await documentScrollWidth(page)).toBeLessThanOrEqual(390);
});
```

- [ ] **Step 4: Update smoke test heading**

Modify `e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('renders the Galaxy Constellation Open Design cockpit heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Find the wallet gap Galaxy can win next/i })).toBeVisible();
});
```

- [ ] **Step 5: Run unit tests and lint**

Run:

```bash
npm run lint
npm run test
```

Expected: both PASS.

- [ ] **Step 6: Build**

Run:

```bash
npm run build
```

Expected: PASS with Next build completing successfully.

- [ ] **Step 7: Run Playwright**

Run:

```bash
npm run test:e2e
```

Expected: PASS across all routes. The `/activation` route remains the only allowed route to show the existing offer-term `MOP` copy inside `data-testid="activation-offer-term"`.

- [ ] **Step 8: Capture visual evidence**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3100
npx playwright screenshot http://127.0.0.1:3100 /tmp/galaxy-open-design-applied-desktop.png --viewport-size=1440,1000 --full-page
npx playwright screenshot http://127.0.0.1:3100 /tmp/galaxy-open-design-applied-mobile.png --viewport-size=390,844 --full-page
```

Expected:

- Desktop screenshot shows sticky side rail, Open Design top bar, reading guide, boardroom answer, hero, metrics, workspace, and assistant.
- Mobile screenshot has no horizontal overflow, top route content remains readable, and button text does not overlap.

Stop the dev server with `Ctrl-C` after screenshots.

- [ ] **Step 9: Commit e2e updates**

Run:

```bash
git add e2e/compliance.spec.ts e2e/smoke.spec.ts
git commit -m "test: verify Open Design cockpit experience"
```

Expected: commit succeeds with e2e files only.

---

## Final Verification Commands

Run from `/Users/keyip/Documents/Code/galaxy_constellation`:

```bash
npm install
npm run lint
npm run test
npm run build
npm run test:e2e
```

Preview:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://127.0.0.1:3000
```

Full repo verification:

```bash
npm run verify
```

## Self-Review

Spec coverage:

- Open Design static source was read and mapped to React components.
- Existing Next stack conflict was resolved by keeping the Next app runnable instead of copying static HTML.
- Visual design, layout, interactions, and assets are preserved through shell, top bar, reading guide, boardroom brief, hero, metrics, decision workspace, and assistant.
- CDE compliance remains covered by unit tests and Playwright.
- Run, preview, and verification commands are included.

Filler-marker scan:

- No banned filler markers or deferred implementation steps remain.
- Each code-changing step includes concrete code or exact edits.

Type consistency:

- `DashboardTabId`, `SegmentPriority`, view-model function names, and component prop names are defined before use.
- Tests reference the same component names and accessibility labels as the implementation steps.
