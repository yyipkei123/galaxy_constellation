# CDE AI Floating Dock Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current in-layout CDE AI controls with the compact fixed bottom-right chatbot from `Galaxy Constellation Redesign.dc.html` and the provided screenshot.

**Architecture:** Keep the chatbot in `ConstellationRedesignScreen` so every redesigned wallet-lens route gets one CDE AI dock, but render it as a fixed overlay instead of a right-column panel. The dock keeps the existing deterministic CDE-safe answer state and chips, removes route configuration controls from the chatbot, and uses the prototype's panel/toggle layout: header, close `x`, three chips, answer card, input plus Ask button, safety note, and separate Hide/Ask pill.

**Tech Stack:** Next.js App Router, React client components, Tailwind CSS utility classes, Vitest with Testing Library, Playwright e2e compliance tests.

---

## File Structure

- Modify: `src/components/redesign/constellation-redesign-screen.tsx`
  - Responsibility: render the redesigned route body and the CDE AI dock. Move `CdeAiDock` out of layout columns, simplify its props, and restyle it as the fixed floating chatbot from the prototype.
- Modify: `src/components/redesign/constellation-redesign-screen.test.tsx`
  - Responsibility: assert the floating dock structure, collapse/open labels, chip answers, input clearing, and CDE-safety.
- Modify: `e2e/compliance.spec.ts`
  - Responsibility: update Playwright expectations for the new floating dock toggle text and fixed panel behavior.
- Modify: `e2e/smoke.spec.ts`
  - Responsibility: keep smoke coverage aligned if the chatbot landmark/toggle text changes.

## Design Reference

Use this source as the canonical design:

- `spec/UI-update-5:7/galaxy-macau-dashboard-redesign/project/Galaxy Constellation Redesign.dc.html:718-750`

The implementation should match these visible states:

- Open panel fixed at bottom right with width around `392px`, max-width constrained on mobile.
- Panel header contains gold circular star icon, `CDE AI`, subtitle `Governed answers · ranges & indices only`, and an `x` close button.
- Three chips: `Explain the ranking`, `Why trust it?`, `Build a brief`.
- Answer card text defaults to `Ask for an explanation, trust rationale, or a CDE-safe campaign brief for Cosmopolitan Connoisseurs.`
- Text input placeholder is segment-aware: `Ask about Cosmopolitan Connoisseurs...`.
- Gold `Ask` button sits to the right of the input.
- Safety note reads `Answers use modelled CDE ranges, percentages and indices only - never guest-level data.`
- Separate pill toggle below the panel reads `Hide CDE AI` when open and `Ask CDE AI` when collapsed.

### Task 1: Route Layout Contract And Failing Unit Tests

**Files:**
- Modify: `src/components/redesign/constellation-redesign-screen.test.tsx`
- Modify after tests fail: `src/components/redesign/constellation-redesign-screen.tsx`

- [ ] **Step 1: Add a failing unit test for one floating CDE AI dock outside the route grid**

Insert this test after `labels the AI dock as a complementary landmark with collapse state`:

```tsx
  it('renders the CDE AI dock as a fixed floating chatbot outside route layout columns', () => {
    const { container } = renderScreen('overview');

    const aiDock = screen.getByRole('complementary', { name: 'CDE AI' });

    expect(aiDock).toHaveClass('fixed');
    expect(aiDock).toHaveClass('bottom-4');
    expect(aiDock).toHaveClass('right-4');
    expect(aiDock).toHaveClass('z-[60]');
    expect(aiDock).not.toHaveClass('galaxy-glass-panel');
    expect(screen.getAllByRole('complementary', { name: 'CDE AI' })).toHaveLength(1);
    expect(container.querySelector('[data-cde-ai-panel="floating"]')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx -t "fixed floating chatbot"
```

Expected: FAIL because the current dock is an in-layout `galaxy-glass-panel` and does not have `fixed bottom-4 right-4 z-[60]`.

- [ ] **Step 3: Move `CdeAiDock` to one root-level floating render**

In `src/components/redesign/constellation-redesign-screen.tsx`, replace the `return` inside `ConstellationRedesignScreen` with this structure:

```tsx
  return (
    <>
      <section aria-label={model.screenLabel} className="space-y-[18px] pb-28 text-galaxy-cream">
        {pageId === 'overview' ? (
          <Overview
            model={model}
            coveragePct={coveragePct}
            activeMetricCount={activeMetricCount}
            onSelectSegment={selectSegment}
          />
        ) : (
          <section aria-label={model.screenLabel} className="min-w-0 space-y-[18px]">
            {renderRouteBody(model, sharedControls, audienceBriefDrafted, buildAudienceBriefDraft)}
          </section>
        )}
      </section>

      <CdeAiDock
        model={model}
        aiOpen={aiOpen}
        setAiOpen={setAiOpen}
        aiAnswerKey={aiAnswerKey}
        setAiAnswerKey={setAiAnswerKey}
        aiInput={aiInput}
        setAiInput={setAiInput}
      />
    </>
  );
```

Update the `Overview` prop type and destructuring to remove dock-only controls:

```tsx
function Overview({
  model,
  coveragePct,
  activeMetricCount,
  onSelectSegment,
}: {
  model: ConstellationRedesignModel;
  coveragePct: number;
  activeMetricCount: number;
  onSelectSegment: (segmentId: string) => void;
}) {
```

Remove the `<CdeAiDock ... />` call from inside `Overview`. Keep the overview content grid as one column of route content and selected finding content:

```tsx
      <div className="grid min-w-0 gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-[18px]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {model.kpis.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          <ConstellationMap
            nodes={model.constellationNodes}
            segmentRows={model.segmentRows}
            selectedSegmentName={model.selectedSegment.name}
            onSelectSegment={onSelectSegment}
          />
        </div>

        <SelectedFinding model={model} />
      </div>
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx -t "fixed floating chatbot"
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/components/redesign/constellation-redesign-screen.tsx src/components/redesign/constellation-redesign-screen.test.tsx
git commit -m "refactor: float cde ai dock outside route layout"
```

### Task 2: Floating Chatbot Visual Shell

**Files:**
- Modify: `src/components/redesign/constellation-redesign-screen.test.tsx`
- Modify: `src/components/redesign/constellation-redesign-screen.tsx`

- [ ] **Step 1: Add failing tests for screenshot/prototype visible copy and controls**

Replace the current `labels the AI dock as a complementary landmark with collapse state` test with:

```tsx
  it('matches the compact prototype CDE AI dock shell and collapse state', () => {
    renderScreen('overview');

    const aiDock = screen.getByRole('complementary', { name: 'CDE AI' });
    const panel = within(aiDock).getByTestId('cde-ai-panel');
    const closeButton = within(panel).getByRole('button', { name: 'Close CDE AI' });
    const toggle = within(aiDock).getByRole('button', { name: 'Hide CDE AI' });
    const controlledPanelId = toggle.getAttribute('aria-controls');

    expect(panel).toHaveClass('w-[392px]');
    expect(within(panel).getByText('CDE AI')).toBeInTheDocument();
    expect(within(panel).getByText('Governed answers · ranges & indices only')).toBeInTheDocument();
    expect(within(panel).getByText('Explain the ranking')).toBeInTheDocument();
    expect(within(panel).getByText('Why trust it?')).toBeInTheDocument();
    expect(within(panel).getByText('Build a brief')).toBeInTheDocument();
    expect(within(panel).getByText(/Ask for an explanation, trust rationale/i)).toBeInTheDocument();
    expect(within(panel).getByPlaceholderText('Ask about Cosmopolitan Connoisseurs...')).toBeInTheDocument();
    expect(within(panel).getByText(/Answers use modelled CDE ranges/i)).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(controlledPanelId).toBeTruthy();

    fireEvent.click(closeButton);

    expect(within(aiDock).getByRole('button', { name: 'Ask CDE AI' })).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(controlledPanelId ?? '')).toHaveAttribute('hidden');
  });
```

- [ ] **Step 2: Run the shell test and verify it fails**

Run:

```bash
npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx -t "compact prototype CDE AI dock shell"
```

Expected: FAIL because the current dock uses `Collapse`/`Open`, contains channel/window/sliders/export controls, and does not have the prototype visual shell.

- [ ] **Step 3: Replace `CdeAiDock` props with chatbot-only props**

Change the `CdeAiDock` function signature to:

```tsx
function CdeAiDock({
  model,
  aiOpen,
  setAiOpen,
  aiAnswerKey,
  setAiAnswerKey,
  aiInput,
  setAiInput,
}: {
  model: ConstellationRedesignModel;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  aiAnswerKey: 'explain' | 'trust' | 'brief' | null;
  setAiAnswerKey: (key: 'explain' | 'trust' | 'brief' | null) => void;
  aiInput: string;
  setAiInput: (input: string) => void;
}) {
```

- [ ] **Step 4: Replace `CdeAiDock` JSX with the prototype visual shell**

Replace the full `return` block inside `CdeAiDock` with:

```tsx
  return (
    <aside
      aria-label="CDE AI"
      className="fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 text-galaxy-cream md:bottom-[22px] md:right-[22px]"
    >
      <div
        id={aiPanelId}
        data-cde-ai-panel="floating"
        data-testid="cde-ai-panel"
        hidden={!aiOpen}
        className="w-[392px] max-w-full overflow-hidden rounded-[16px] border border-galaxy-gold/35 bg-[linear-gradient(160deg,#1B1530,#100C1E_70%)] shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-3 border-b border-galaxy-gold/20 bg-galaxy-gold/10 px-[18px] py-3.5">
          <span
            aria-hidden="true"
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#EAD9A9,#D4AF5E_70%)] text-[13px] font-extrabold text-galaxy-ink"
          >
            ✦
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-extrabold leading-tight text-galaxy-cream">CDE AI</span>
            <span className="mt-0.5 block text-[10px] leading-tight tracking-[0.06em] text-galaxy-muted">
              Governed answers · ranges &amp; indices only
            </span>
          </span>
          <button
            type="button"
            aria-label="Close CDE AI"
            aria-controls={aiPanelId}
            aria-expanded={aiOpen}
            onClick={() => setAiOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-base text-galaxy-muted transition hover:bg-white/5 hover:text-galaxy-cream"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 px-[18px] py-4">
          <div className="flex flex-wrap gap-[7px]">
            {model.aiChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                aria-pressed={aiAnswerKey === chip.key}
                onClick={() => setAiAnswerKey(chip.key)}
                className={clsx(
                  'min-h-[33px] rounded-full border px-3 text-[11.5px] font-bold transition',
                  aiAnswerKey === chip.key
                    ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                    : 'border-galaxy-gold/35 bg-galaxy-gold/5 text-galaxy-muted hover:border-galaxy-gold hover:text-galaxy-gold',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="min-h-[88px] rounded-[10px] border border-galaxy-gold/15 bg-galaxy-ink/50 px-4 py-3.5 text-[12.5px] leading-7 text-[#C9C3D2]">
            {aiAnswer}
          </div>

          <form className="flex gap-2" onSubmit={submitAiQuestion}>
            <label className="sr-only" htmlFor="cde-ai-question">
              Ask a CDE-safe question
            </label>
            <input
              id="cde-ai-question"
              type="text"
              value={aiInput}
              onChange={(event) => setAiInput(event.target.value)}
              placeholder={`Ask about ${model.selectedSegment.name}...`}
              className="min-h-[39px] min-w-0 flex-1 rounded-[9px] border border-galaxy-gold/20 bg-white/[0.03] px-3.5 text-[12.5px] text-galaxy-cream outline-none placeholder:text-galaxy-muted/70 focus:border-galaxy-gold"
            />
            <button
              type="submit"
              className="min-h-[39px] rounded-[9px] bg-galaxy-gold px-4 text-[12.5px] font-extrabold text-galaxy-ink transition hover:brightness-110"
            >
              Ask
            </button>
          </form>

          <p className="text-[9.5px] leading-4 text-galaxy-muted">
            Answers use modelled CDE ranges, percentages and indices only - never guest-level data.
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-controls={aiPanelId}
        aria-expanded={aiOpen}
        onClick={() => setAiOpen(!aiOpen)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-galaxy-gold/50 bg-[linear-gradient(120deg,#221A3C,#14101F)] px-5 text-[13px] font-extrabold tracking-[0.02em] text-galaxy-gold shadow-[0_10px_34px_rgba(0,0,0,0.5),0_0_24px_rgba(212,175,94,0.15)] transition hover:shadow-[0_10px_34px_rgba(0,0,0,0.5),0_0_34px_rgba(212,175,94,0.3)]"
      >
        <span aria-hidden="true" className="text-sm text-galaxy-gold">
          ✦
        </span>
        {aiOpen ? 'Hide CDE AI' : 'Ask CDE AI'}
      </button>
    </aside>
  );
```

- [ ] **Step 5: Remove dock-only layout controls from the chatbot**

Inside `CdeAiDock`, remove all JSX that renders:

```tsx
<SegmentChipBar ... />
{model.channels.map(...)}
{model.windows.map(...)}
<input type="range" aria-label="Audience reach" ... />
<input type="range" aria-label="Offer depth" ... />
<button onClick={() => setExported(true)}>...</button>
```

These controls stay in the route bodies where they already exist: Activation and Simulator.

- [ ] **Step 6: Run the shell test and verify it passes**

Run:

```bash
npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx -t "compact prototype CDE AI dock shell"
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/components/redesign/constellation-redesign-screen.tsx src/components/redesign/constellation-redesign-screen.test.tsx
git commit -m "feat: match cde ai prototype dock shell"
```

### Task 3: CDE AI Answer Behavior And Route Interaction Tests

**Files:**
- Modify: `src/components/redesign/constellation-redesign-screen.test.tsx`
- Modify: `src/components/redesign/constellation-redesign-screen.tsx`

- [ ] **Step 1: Update the existing ask-form test for the screenshot placeholder**

Replace the input lookup in `submits a deterministic CDE-safe AI question and clears the input` with:

```tsx
    const input = within(aiDock).getByRole('textbox', { name: /Ask a CDE-safe question/i });

    expect(input).toHaveAttribute('placeholder', 'Ask about Cosmopolitan Connoisseurs...');
```

Keep the rest of the test:

```tsx
    fireEvent.change(input, { target: { value: 'Explain the ranking' } });
    fireEvent.click(within(aiDock).getByRole('button', { name: 'Ask' }));

    expect(input).toHaveValue('');
    expect(within(aiDock).getByText(/Cosmopolitan Connoisseurs: opportunity index 118/i)).toBeInTheDocument();
    expect(within(aiDock).getByText(/14-22k equiv\.\/mo/i)).toBeInTheDocument();
```

- [ ] **Step 2: Add a failing test for segment-aware prompt updates**

Add this test near the other CDE AI tests:

```tsx
  it('updates the floating CDE AI prompt when the selected segment changes', () => {
    renderScreen('overview');

    fireEvent.click(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i }));

    const aiDock = screen.getByRole('complementary', { name: 'CDE AI' });

    expect(within(aiDock).getByPlaceholderText('Ask about Premium Mass Weekenders...')).toBeInTheDocument();
    expect(within(aiDock).getByText(/Ask for an explanation, trust rationale, or a CDE-safe campaign brief for Premium Mass Weekenders/i)).toBeInTheDocument();
  });
```

- [ ] **Step 3: Run the CDE AI behavior tests and verify failures**

Run:

```bash
npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx -t "CDE AI"
```

Expected: FAIL until the default answer and placeholder are segment-aware in the floating dock.

- [ ] **Step 4: Make the default answer segment-aware**

In `CdeAiDock`, replace the `aiAnswer` assignment with:

```tsx
  const defaultAiAnswer =
    `Ask for an explanation, trust rationale, or a CDE-safe campaign brief for ${model.selectedSegment.name}.`;
  const aiAnswer = normalizeModelledWalletBands(aiAnswerKey ? model.aiAnswers[aiAnswerKey] : defaultAiAnswer);
```

- [ ] **Step 5: Preserve deterministic ask behavior**

Keep `submitAiQuestion` as:

```tsx
  function submitAiQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!aiInput.trim()) return;

    setAiAnswerKey('explain');
    setAiInput('');
  }
```

- [ ] **Step 6: Run all CDE AI unit tests and verify they pass**

Run:

```bash
npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx -t "CDE AI"
```

Expected: PASS.

- [ ] **Step 7: Run the full redesign screen test file**

Run:

```bash
npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx
```

Expected: PASS for all tests in the file.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/components/redesign/constellation-redesign-screen.tsx src/components/redesign/constellation-redesign-screen.test.tsx
git commit -m "fix: keep cde ai prompt segment aware"
```

### Task 4: Playwright Compliance Update

**Files:**
- Modify: `e2e/compliance.spec.ts`
- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Update Playwright CDE AI dock expectations**

In `e2e/compliance.spec.ts`, replace the CDE AI dock test body with:

```ts
  test('CDE AI dock matches the compact prototype and stays CDE-safe', async ({ page }) => {
    await page.goto('/');

    const aiDock = page.getByRole('complementary', { name: 'CDE AI' });
    await expect(aiDock).toBeVisible();
    await expect(aiDock.locator('[data-cde-ai-panel="floating"]')).toBeVisible();
    await expect(aiDock.getByText('Governed answers · ranges & indices only')).toBeVisible();
    await expect(aiDock.getByText(/Ask for an explanation, trust rationale, or a CDE-safe campaign brief/i)).toBeVisible();
    await expect(aiDock.getByPlaceholder('Ask about Cosmopolitan Connoisseurs...')).toBeVisible();

    const briefChip = aiDock.getByRole('button', { name: 'Build a brief' });
    await briefChip.click();

    await expect(briefChip).toHaveAttribute('aria-pressed', 'true');
    await expect(aiDock.getByText(/Draft brief for Cosmopolitan Connoisseurs/i)).toBeVisible();
    await expect(aiDock).not.toContainText(bannedCdeTokenOrUnsafeAmountPattern);

    const input = aiDock.getByRole('textbox', { name: /Ask a CDE-safe question/i });
    await input.fill('Show HKD 5000 leakage');
    await aiDock.getByRole('button', { name: 'Ask' }).click();

    await expect(input).toHaveValue('');
    await expect(aiDock.getByText(/Cosmopolitan Connoisseurs: opportunity index 118/i)).toBeVisible();
    await expect(aiDock).not.toContainText(bannedCdeTokenOrUnsafeAmountPattern);

    await aiDock.getByRole('button', { name: 'Hide CDE AI' }).click();
    await expect(aiDock.getByRole('button', { name: 'Ask CDE AI' })).toHaveAttribute('aria-expanded', 'false');
    await expect(aiDock.locator('[data-cde-ai-panel="floating"]')).toBeHidden();

    await aiDock.getByRole('button', { name: 'Ask CDE AI' }).click();
    await expect(aiDock.getByRole('button', { name: 'Hide CDE AI' })).toHaveAttribute('aria-expanded', 'true');
    await expect(aiDock.locator('[data-cde-ai-panel="floating"]')).toBeVisible();
  });
```

- [ ] **Step 2: Update any smoke assertion that depends on old collapse labels**

In `e2e/smoke.spec.ts`, keep the existing `CDE AI` landmark assertion and add the visible prototype toggle:

```ts
  await expect(page.getByRole('complementary', { name: 'CDE AI' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide CDE AI' })).toBeVisible();
```

- [ ] **Step 3: Run the updated Playwright files**

Run:

```bash
npx playwright test e2e/smoke.spec.ts e2e/compliance.spec.ts
```

Expected: PASS for Chromium and mobile-safari projects.

- [ ] **Step 4: Commit Task 4**

```bash
git add e2e/compliance.spec.ts e2e/smoke.spec.ts
git commit -m "test: cover compact cde ai dock"
```

### Task 5: Final Verification

**Files:**
- Verify only unless a command exposes a real regression.

- [ ] **Step 1: Run targeted lint for changed files**

Run:

```bash
npx eslint src/components/redesign/constellation-redesign-screen.tsx src/components/redesign/constellation-redesign-screen.test.tsx e2e/compliance.spec.ts e2e/smoke.spec.ts --max-warnings=0
```

Expected: PASS with exit code 0.

- [ ] **Step 2: Run relevant unit tests**

Run:

```bash
npm run test -- src/components/redesign/constellation-redesign-screen.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS. The output should include `Compiled successfully`.

- [ ] **Step 4: Run full Playwright**

Run:

```bash
npm run test:e2e
```

Expected: PASS for all Playwright tests.

- [ ] **Step 5: Confirm no whitespace errors**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 6: Document full lint caveat if it remains unchanged**

Run:

```bash
npm run lint
```

Expected if `spec/UI-update-5:7/` is still untracked: FAIL only from `spec/UI-update-5:7/galaxy-macau-dashboard-redesign/project/support.js`. Do not edit the prototype fixture to satisfy lint.

- [ ] **Step 7: Commit any verification-only fixes**

If a command exposes a real tracked-code regression and a fix was required, commit only those tracked files:

```bash
git add src/components/redesign/constellation-redesign-screen.tsx src/components/redesign/constellation-redesign-screen.test.tsx e2e/compliance.spec.ts e2e/smoke.spec.ts
git commit -m "fix: stabilize compact cde ai dock"
```

If no fixes were required, do not create an empty commit.

## Self-Review

**Spec coverage:** The plan maps the screenshot and `Galaxy Constellation Redesign.dc.html:718-750` to a fixed bottom-right CDE AI dock, matching the panel header, chips, answer card, segment-aware input, safety note, close button, and Hide/Ask pill. It also keeps existing deterministic CDE-safe answer behavior and route-level controls outside the chatbot.

**Placeholder scan:** The plan contains no forbidden placeholder markers and no deferred implementation steps. Each code-changing step includes concrete code or exact removals.

**Type consistency:** The simplified `CdeAiDock` props use existing `ConstellationRedesignModel`, `aiOpen`, `aiAnswerKey`, and setter types. The route-level `SharedRouteControls` remains available for Activation/Simulator and no longer leaks into the chatbot.
