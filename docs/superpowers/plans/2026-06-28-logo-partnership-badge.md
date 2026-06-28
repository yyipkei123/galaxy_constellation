# Logo Partnership Badge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved Galaxy Macau and Mastercard logo partnership badge to the app top bar without hurting CDE compliance or responsive layout.

**Architecture:** Runtime logo files live in `public/brand/`. A small shell-only `BrandPartnershipBadge` component owns the image markup and accessibility contract. `TopBar` renders the badge after coverage metadata so the logos read as data partnership proof, while route content and the sidebar product lockup stay unchanged.

**Tech Stack:** Next.js app router, React, TypeScript, Tailwind, `next/image`, Vitest, Testing Library, Playwright.

---

## File Structure

- Create: `public/brand/galaxy-macau-logo.png`  
  Runtime copy of the provided square Galaxy Macau logo.
- Create: `public/brand/mastercard-logo.png`  
  Runtime copy of the provided horizontal Mastercard logo.
- Create: `src/components/shell/brand-partnership-badge.tsx`  
  Reusable informational top-bar badge with stable image dimensions and accessibility labels.
- Create: `src/components/shell/brand-partnership-badge.test.tsx`  
  Component-level test for logo accessibility, compact mobile label behavior, and banned currency absence.
- Modify: `src/components/shell/top-bar.tsx`  
  Render `BrandPartnershipBadge` directly after the coverage metadata.
- Modify: `src/components/shell/top-bar.test.tsx`  
  Cover top-bar integration while preserving current CDE and quarter-selector assertions.
- Modify: `e2e/compliance.spec.ts`  
  Assert the partnership badge renders in the shell and keep responsive no-overflow checks.
- Modify: `.gitignore`  
  Ignore `.superpowers/` visual companion artifacts created during brainstorming.

Do not stage unrelated untracked `docs/superpowers/plans/` files from older work, `spec/`, `tsconfig.tsbuildinfo`, or root logo source files unless a task explicitly names them.

---

### Task 1: Asset Placement And Brainstorm Artifact Hygiene

**Files:**
- Create: `public/brand/galaxy-macau-logo.png`
- Create: `public/brand/mastercard-logo.png`
- Modify: `.gitignore`

- [ ] **Step 1: Verify source logo files exist**

Run:

```bash
test -f Galaxy-Macau-logo.png
test -f mastercard_logo.png
sips -g pixelWidth -g pixelHeight Galaxy-Macau-logo.png mastercard_logo.png
```

Expected:

```text
Galaxy-Macau-logo.png
  pixelWidth: 316
  pixelHeight: 316
mastercard_logo.png
  pixelWidth: 572
  pixelHeight: 108
```

- [ ] **Step 2: Copy logos into public runtime asset paths**

Run:

```bash
mkdir -p public/brand
cp Galaxy-Macau-logo.png public/brand/galaxy-macau-logo.png
cp mastercard_logo.png public/brand/mastercard-logo.png
```

- [ ] **Step 3: Verify runtime asset dimensions**

Run:

```bash
sips -g pixelWidth -g pixelHeight public/brand/galaxy-macau-logo.png public/brand/mastercard-logo.png
```

Expected:

```text
public/brand/galaxy-macau-logo.png
  pixelWidth: 316
  pixelHeight: 316
public/brand/mastercard-logo.png
  pixelWidth: 572
  pixelHeight: 108
```

- [ ] **Step 4: Ignore visual companion artifacts**

Modify `.gitignore` so it includes `.superpowers/`:

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
.superpowers/
```

- [ ] **Step 5: Check staged scope before committing**

Run:

```bash
git status --short
git diff -- .gitignore
```

Expected staged candidates for this task are only:

```text
.gitignore
public/brand/galaxy-macau-logo.png
public/brand/mastercard-logo.png
```

- [ ] **Step 6: Commit asset placement**

Run:

```bash
git add .gitignore public/brand/galaxy-macau-logo.png public/brand/mastercard-logo.png
git commit -m "chore: add brand partnership logo assets"
```

Expected: commit succeeds with the two PNG assets and `.gitignore`.

---

### Task 2: Brand Partnership Badge Component

**Files:**
- Create: `src/components/shell/brand-partnership-badge.test.tsx`
- Create: `src/components/shell/brand-partnership-badge.tsx`

- [ ] **Step 1: Write the failing component test**

Create `src/components/shell/brand-partnership-badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { BrandPartnershipBadge } from './brand-partnership-badge';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('BrandPartnershipBadge', () => {
  it('renders a compact accessible data partnership badge without currency text', () => {
    const { container } = render(<BrandPartnershipBadge />);

    const badge = screen.getByLabelText('Galaxy Macau and Mastercard data partnership');
    const galaxyLogo = screen.getByRole('img', { name: 'Galaxy Macau' });
    const mastercardLogo = screen.getByRole('img', { name: 'Mastercard' });

    expect(badge).toBeInTheDocument();
    expect(badge).not.toHaveAttribute('href');
    expect(screen.getByText('Data partnership')).toHaveClass('hidden');
    expect(screen.getByText('Data partnership')).toHaveClass('sm:inline');
    expect(galaxyLogo).toHaveAttribute('alt', 'Galaxy Macau');
    expect(mastercardLogo).toHaveAttribute('alt', 'Mastercard');
    expect(galaxyLogo).toHaveAttribute('width', '28');
    expect(mastercardLogo).toHaveAttribute('width', '96');
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });
});
```

- [ ] **Step 2: Run the component test to verify it fails**

Run:

```bash
npm run test -- src/components/shell/brand-partnership-badge.test.tsx
```

Expected: FAIL because `./brand-partnership-badge` does not exist.

- [ ] **Step 3: Implement the badge component**

Create `src/components/shell/brand-partnership-badge.tsx`:

```tsx
import Image from 'next/image';
import clsx from 'clsx';

interface BrandPartnershipBadgeProps {
  className?: string;
}

export function BrandPartnershipBadge({ className }: BrandPartnershipBadgeProps) {
  return (
    <div
      aria-label="Galaxy Macau and Mastercard data partnership"
      className={clsx(
        'inline-flex min-h-8 shrink-0 items-center gap-2 rounded-full border border-galaxy-border bg-galaxy-charcoal/70 px-2 py-1',
        className,
      )}
    >
      <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-galaxy-muted sm:inline">
        Data partnership
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1">
        <Image
          src="/brand/galaxy-macau-logo.png"
          alt="Galaxy Macau"
          width={28}
          height={28}
          sizes="28px"
          className="h-full w-full object-contain"
        />
      </span>
      <span className="flex h-7 w-[4.8rem] shrink-0 items-center sm:w-[5.4rem]">
        <Image
          src="/brand/mastercard-logo.png"
          alt="Mastercard"
          width={96}
          height={18}
          sizes="96px"
          className="h-auto max-h-5 w-full object-contain"
        />
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Run the component test to verify it passes**

Run:

```bash
npm run test -- src/components/shell/brand-partnership-badge.test.tsx
```

Expected: PASS with 1 test.

- [ ] **Step 5: Run lint for the new component files**

Run:

```bash
npx eslint src/components/shell/brand-partnership-badge.tsx src/components/shell/brand-partnership-badge.test.tsx
```

Expected: no output and exit code 0.

- [ ] **Step 6: Commit the badge component**

Run:

```bash
git add src/components/shell/brand-partnership-badge.tsx src/components/shell/brand-partnership-badge.test.tsx
git commit -m "feat: add brand partnership badge"
```

Expected: commit succeeds with only the component and its test.

---

### Task 3: Top-Bar Integration And Route Coverage

**Files:**
- Modify: `src/components/shell/top-bar.tsx`
- Modify: `src/components/shell/top-bar.test.tsx`
- Modify: `e2e/compliance.spec.ts`

- [ ] **Step 1: Add failing top-bar integration assertions**

In `src/components/shell/top-bar.test.tsx`, update the test named `shows compact CDE methodology metrics and defaults the quarter selector to Q2 2026` so it contains these assertions after `Coverage 63%`:

```tsx
expect(screen.getByLabelText('Galaxy Macau and Mastercard data partnership')).toBeInTheDocument();
expect(screen.getByRole('img', { name: 'Galaxy Macau' })).toBeInTheDocument();
expect(screen.getByRole('img', { name: 'Mastercard' })).toBeInTheDocument();
expect(screen.getByText('Data partnership')).toHaveClass('hidden');
expect(screen.getByText('Data partnership')).toHaveClass('sm:inline');
```

The full test should be:

```tsx
it('shows compact CDE methodology metrics and defaults the quarter selector to Q2 2026', () => {
  render(
    <AppStateProvider>
      <TopBar />
    </AppStateProvider>,
  );

  expect(screen.getByText('7 CDE metrics')).toBeInTheDocument();
  expect(screen.getByText('Coverage 63%')).toBeInTheDocument();
  expect(screen.getByLabelText('Galaxy Macau and Mastercard data partnership')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Galaxy Macau' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Mastercard' })).toBeInTheDocument();
  expect(screen.getByText('Data partnership')).toHaveClass('hidden');
  expect(screen.getByText('Data partnership')).toHaveClass('sm:inline');
  expect(screen.getByRole('combobox', { name: /quarter selector/i })).toHaveValue('2026-q2');
  expect(screen.getByRole('option', { name: '2026 Q2' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the top-bar test to verify it fails**

Run:

```bash
npm run test -- src/components/shell/top-bar.test.tsx
```

Expected: FAIL because the top bar does not yet render `Galaxy Macau and Mastercard data partnership`.

- [ ] **Step 3: Add failing e2e shell assertions**

In `e2e/compliance.spec.ts`, inside the route loop test immediately after:

```ts
await expect(banner.locator('[aria-label="7 active CDE metrics"]')).toBeVisible();
```

add:

```ts
const partnershipBadge = banner.getByLabel('Galaxy Macau and Mastercard data partnership');
await expect(partnershipBadge).toBeVisible();
await expect(partnershipBadge.getByRole('img', { name: 'Galaxy Macau' })).toBeVisible();
await expect(partnershipBadge.getByRole('img', { name: 'Mastercard' })).toBeVisible();
```

In the `refined shell and decision visuals fit ${viewport.label}` test, add this assertion after the existing banner CDE metrics assertion:

```ts
await expect(page.getByRole('banner').getByLabel('Galaxy Macau and Mastercard data partnership')).toBeVisible();
```

In the `desktop projector viewport has visible nav, top bar, and main hero` test, add this assertion after the quarter selector assertion:

```ts
await expect(page.getByRole('banner').getByLabel('Galaxy Macau and Mastercard data partnership')).toBeVisible();
```

- [ ] **Step 4: Run a targeted e2e test to verify it fails**

Run:

```bash
npm run test:e2e -- --project=chromium -g "desktop projector viewport has visible nav"
```

Expected: FAIL because the badge is not visible in the banner.

- [ ] **Step 5: Integrate the badge into `TopBar`**

Modify `src/components/shell/top-bar.tsx`:

```tsx
'use client';

import { useAppState } from '@/store/app-store';
import { BrandPartnershipBadge } from './brand-partnership-badge';
import { LensSwitch } from './lens-switch';

export function TopBar() {
  const { methodology, quarters, selectedQuarterId, setSelectedQuarterId } = useAppState();

  return (
    <header className="flex flex-col gap-3 border-b border-galaxy-border bg-galaxy-ink/82 px-4 py-3 backdrop-blur sm:px-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-4">
      <div className="flex flex-wrap items-center gap-3">
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
          <BrandPartnershipBadge />
          <span className="hidden rounded-full border border-galaxy-border bg-galaxy-charcoal/70 px-2.5 py-1 text-xs font-semibold text-galaxy-muted md:inline-flex">
            {quarters.find((quarter) => quarter.id === selectedQuarterId)?.label ?? 'Current quarter'} snapshot
          </span>
          <span className="hidden rounded-full border border-galaxy-border bg-galaxy-charcoal/70 px-2.5 py-1 text-xs font-semibold text-galaxy-muted md:inline-flex">
            Quarterly CDE refresh
          </span>
        </div>
        <LensSwitch />
      </div>

      <label className="flex flex-wrap items-center gap-2 text-sm text-galaxy-muted sm:gap-3">
        <span className="font-medium text-galaxy-cream">Quarter selector</span>
        <select
          aria-label="Quarter selector"
          className="h-10 rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 text-sm font-semibold text-galaxy-cream outline-none ring-galaxy-gold/30 focus:ring-2"
          value={selectedQuarterId}
          onChange={(event) => setSelectedQuarterId(event.target.value)}
        >
          {quarters.map((quarter) => (
            <option key={quarter.id} value={quarter.id}>
              {quarter.label}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
```

- [ ] **Step 6: Run unit tests for badge and top bar**

Run:

```bash
npm run test -- src/components/shell/brand-partnership-badge.test.tsx src/components/shell/top-bar.test.tsx
```

Expected: PASS with the badge test and existing top-bar tests.

- [ ] **Step 7: Run targeted e2e coverage**

Run:

```bash
npm run test:e2e -- --project=chromium -g "/ shows CDE methodology"
npm run test:e2e -- --project=chromium -g "refined shell and decision visuals fit desktop"
npm run test:e2e -- --project=mobile-safari -g "refined shell and decision visuals fit iPhone"
```

Expected: all targeted Playwright tests pass, with no horizontal overflow failures.

- [ ] **Step 8: Run lint and diff checks**

Run:

```bash
npx eslint src/components/shell/brand-partnership-badge.tsx src/components/shell/brand-partnership-badge.test.tsx src/components/shell/top-bar.tsx src/components/shell/top-bar.test.tsx e2e/compliance.spec.ts
git diff --check -- src/components/shell/brand-partnership-badge.tsx src/components/shell/brand-partnership-badge.test.tsx src/components/shell/top-bar.tsx src/components/shell/top-bar.test.tsx e2e/compliance.spec.ts
```

Expected: both commands exit 0.

- [ ] **Step 9: Commit top-bar integration and e2e coverage**

Run:

```bash
git add src/components/shell/top-bar.tsx src/components/shell/top-bar.test.tsx e2e/compliance.spec.ts
git commit -m "feat: show brand partnership badge in top bar"
```

Expected: commit succeeds with only the top-bar and e2e integration files.

---

### Task 4: Full Verification And Browser QA

**Files:**
- No expected source changes unless verification exposes a defect.

- [ ] **Step 1: Check working tree before final verification**

Run:

```bash
git status -sb
```

Expected: no modified tracked files. Untracked root logo source files may still exist if they were not intentionally deleted; they should not be staged.

- [ ] **Step 2: Run the full project gate**

Run:

```bash
npm run verify
```

Expected:

```text
eslint . --max-warnings=0
Vitest test files pass
next build completes successfully
Playwright tests pass
```

If Playwright times out waiting for port 3000, check for a stale server with:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN || true
```

If it shows a stale `next dev` or `next-server` from this repo, stop it and rerun the exact `npm run verify` command:

```bash
PIDS=$(lsof -t -nP -iTCP:3000 -sTCP:LISTEN || true)
if [ -n "$PIDS" ]; then
  kill $PIDS
fi
npm run verify
```

- [ ] **Step 3: Browser-check the active route**

Open `http://localhost:3000/segments` or use the in-app browser if a dev server is already running.

Check:

- Top bar shows `7 CDE metrics`, `Coverage 63%`, the Galaxy Macau logo, the Mastercard logo, and the quarter selector.
- On a narrow mobile viewport, `Data partnership` text is hidden but both logos remain visible.
- The body has no horizontal overflow at iPhone width.
- The sidebar still reads `Galaxy Constellation`.

- [ ] **Step 4: Confirm final git scope**

Run:

```bash
git status -sb
git log --oneline -4
```

Expected: the latest commits are:

```text
feat: show brand partnership badge in top bar
feat: add brand partnership badge
chore: add brand partnership logo assets
docs: specify logo partnership badge placement
```

Untracked files outside this implementation should remain unstaged.

---

## Self-Review Checklist

- Spec coverage: logo assets, top-bar placement, component boundary, responsive behavior, accessibility, tests, and final `npm run verify` are covered.
- No placeholders: every code step includes exact paths, code snippets, commands, and expected outcomes.
- Type consistency: the component is named `BrandPartnershipBadge`, uses `className?: string`, and the accessible label is exactly `Galaxy Macau and Mastercard data partnership` everywhere.
- Scope: one focused implementation pass; no route, hero, methodology, dependency, or chart changes.
