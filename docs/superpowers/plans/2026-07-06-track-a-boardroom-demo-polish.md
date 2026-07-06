# Track A Boardroom Demo Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first Track A demo-polish pass: guided executive story mode, richer governed CDE AI answers, and a visible activation-to-measurement handoff.

**Architecture:** Keep the work inside the current redesign renderer and model. Add deterministic, client-side data structures to `constellation-redesign-model.ts`, render them in `constellation-redesign-screen.tsx`, and cover behavior in the existing focused component/e2e tests.

**Tech Stack:** Next.js App Router, React state, TypeScript, Tailwind utility classes, Vitest, Testing Library, Playwright.

---

### Task 1: Guided Executive Story Mode

**Files:**
- Modify: `src/components/redesign/constellation-redesign-model.ts`
- Modify: `src/components/redesign/constellation-redesign-screen.tsx`
- Test: `src/components/redesign/constellation-redesign-screen.test.tsx`

- [ ] **Step 1: Write failing tests**

Add a test that renders the overview, expects a collapsed `Executive demo guide`, clicks `Start demo`, verifies `1 of 5`, verifies the first presenter note, and verifies `Next stop` advances to the Wallet stop.

- [ ] **Step 2: Run red test**

Run: `npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx`

Expected: FAIL because the executive demo guide does not exist.

- [ ] **Step 3: Implement demo guide**

Add `demoStops` to the redesign model and render an `ExecutiveDemoGuide` component above every redesigned route. It should be collapsed by default, expose `Start demo`, render presenter notes and route links, and advance locally with `Next stop`.

- [ ] **Step 4: Run green test**

Run: `npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx`

Expected: PASS.

### Task 2: Richer Governed CDE AI

**Files:**
- Modify: `src/components/redesign/constellation-redesign-model.ts`
- Modify: `src/components/redesign/constellation-redesign-screen.tsx`
- Test: `src/components/redesign/constellation-redesign-screen.test.tsx`
- Test: `e2e/compliance.spec.ts`

- [ ] **Step 1: Write failing tests**

Add tests that open CDE AI, verify starter prompt chips, click `Show data behind this`, and verify a bounded data-source list that names the selected segment, opportunity index, leakage, wallet band, and matched coverage.

- [ ] **Step 2: Run red tests**

Run: `npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx`

Expected: FAIL because starter prompts and the data expander do not exist.

- [ ] **Step 3: Implement deterministic AI polish**

Extend the model with `aiStarterPrompts` and `aiEvidenceRows`. Render starter prompt chips in `CdeAiDock`; clicking a starter maps to the existing deterministic answer keys. Add a `details` expander labelled `Show data behind this` with only governed indices, percentages, ranges, and coverage values.

- [ ] **Step 4: Run green tests**

Run: `npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx`

Expected: PASS.

### Task 3: Activation-To-Measurement Loop

**Files:**
- Modify: `src/components/redesign/constellation-redesign-model.ts`
- Modify: `src/components/redesign/constellation-redesign-screen.tsx`
- Test: `src/components/redesign/constellation-redesign-screen.test.tsx`

- [ ] **Step 1: Write failing tests**

Add tests that export a campaign brief on Activation and verify a `Measurement handoff queued` status plus a link to `/measurement`. Add a Measurement test that verifies a `Latest activation handoff` card explains how the selected campaign enters matched-holdout reading.

- [ ] **Step 2: Run red test**

Run: `npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx`

Expected: FAIL because the handoff status and Measurement handoff card do not exist.

- [ ] **Step 3: Implement handoff cards**

Extend the model with `activationHandoff`. On Activation, after export, show a status card with the selected audience, read window, and `/measurement` link. On Measurement, show a top card describing the latest handoff and its matched-holdout read design.

- [ ] **Step 4: Run green tests**

Run: `npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx`

Expected: PASS.

### Task 4: Browser And Regression Verification

**Files:**
- Test: `e2e/smoke.spec.ts`
- Test: `e2e/compliance.spec.ts`

- [ ] **Step 1: Update targeted e2e expectations**

Assert the default overview includes the collapsed demo guide entry and that the CDE AI dock still defaults closed.

- [ ] **Step 2: Run targeted browser tests**

Run: `npx playwright test e2e/smoke.spec.ts e2e/compliance.spec.ts -g "renders the redesigned wallet intelligence cockpit|CDE AI dock answers with deterministic CDE-safe brief controls"`

Expected: PASS.

- [ ] **Step 3: Run formatting whitespace check**

Run: `git diff --check`

Expected: PASS.

## Self-Review

- Spec coverage: covers Track A client demo polish by adding guided story mode, richer governed CDE AI, and activation-to-measurement loop.
- Scope: no backend, no live LLM, no route refactor, no unrelated design-system changes.
- Test strategy: component tests prove stateful UI behavior; targeted Playwright checks prove the overview and CDE AI remain usable in browser.
