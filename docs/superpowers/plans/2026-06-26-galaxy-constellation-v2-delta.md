# Galaxy Constellation V2 Delta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v2 "wow" Overview plus Customer 360 and Priority Lead Board described in `spec/Galaxy_Constellation_v2_DELTA_SPEC.md`.

**Architecture:** Keep the current backend-free Next.js App Router app and add deterministic local data, templated recommendations, and client-side visual components. The work is split into W1 visual elevation first, then W2 guest data, W3 `/guests`, W4 `/guests/[id]`, and W5 compliance/demo hardening. CDE-enriched fields stay index, percentage, propensity, or `equiv./mo` bands; first-party Galaxy fields are visibly separated from Mastercard CDE fields.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind v4, Framer Motion, Recharts where useful, Lucide icons, seeded local data, Vitest with Testing Library, Playwright e2e.

---

## Spec Read And Scope Boundary

This plan implements `spec/Galaxy_Constellation_v2_DELTA_SPEC.md` as a delta on the current app. Do not re-scaffold the project, add a backend, add API keys, or add a runtime LLM. Reuse the current shell, quarter selector, CDE methodology treatment, formatters, seeded data style, and existing UI primitives.

The spec has two streams:

- W1 visual elevation: Overview constellation hero, bento hierarchy, glass depth, motion, and one signature wallet constellation visual.
- W2-W4 pitch tool: synthetic Customer 360 data, `/guests` Priority Lead Board, `/guests/[id]` profile, lead scoring, templated bilingual pitch, mock host/audience actions.

Guardrails:

- Masked guest IDs only, for example `MEM-••••3421`.
- CDE-derived values render only as indices, percentages, probabilities, or `8-12k equiv./mo` style bands.
- Do not render `HKD`, `MOP`, `$`, `元`, or `澳門幣` in new CDE or guest screens.
- First-party Galaxy values may be banded or counts, but keep exact money off the screen.
- Gaming remains de-emphasised and never drives the hero narrative.
- Respect `prefers-reduced-motion`; canvas animation must pause when hidden or offscreen.
- Keep mobile body width within viewport at 390px, iPad 820px, and desktop 1440px.

## File Structure

Visual foundation:

- Create `src/components/visuals/constellation-canvas.tsx`: client-only canvas star field with reduced-motion and visibility pause.
- Create `src/components/ui/animated-count.tsx`: count-up wrapper for percentages, indices, and plain numbers.
- Modify `src/components/ui/panel.tsx`: add glass-depth variant while keeping default API compatible.
- Create `src/components/charts/wallet-constellation.tsx`: signature segment star map for Overview.
- Modify `src/app/page.tsx`: restructure Overview into hero plus bento grid and add the wallet constellation.
- Modify `src/app/page.test.tsx`: verify hero, bento labels, motion-safe fallback text, and empty-state behavior.

Guest data layer:

- Modify `src/data/types.ts`: add `GalaxyTier`, `Guest`, `NbaRec`, category score, and lead-board filter types.
- Create `src/data/guests.ts`: deterministic 48-guest generator, computed lead scores, drivers, NBAs, and bilingual pitch scripts.
- Create `src/data/guests.test.ts`: score ranking, category capture/leakage invariant, masked IDs, CDE compliance, deterministic generation.
- Modify `src/data/index.ts`: export guests and guest helpers.

Guest UI primitives and charts:

- Create `src/components/ui/tier-badge.tsx`: Galaxy tier badge.
- Create `src/components/ui/score-pill.tsx`: score chip with priority tone.
- Create `src/components/ui/driver-chip.tsx`: driver explanation chip.
- Create `src/components/charts/lead-score-gauge.tsx`: score gauge.
- Create `src/components/charts/priority-quadrant.tsx`: value x propensity bubble chart.
- Create `src/components/charts/wallet-orbit.tsx`: guest category capture/leakage radial.
- Create tests beside each component.

Lead Board route:

- Create `src/components/panels/lead-board.tsx`: filterable, sortable ranked lead cards/table with mock actions.
- Create `src/app/guests/page.tsx`: Priority Lead Board route.
- Create `src/app/guests/page.test.tsx`: ranking, filters, sort, masked IDs, action toasts.
- Modify `src/components/shell/nav.tsx`: add `/guests` under the Wallet/retention lens.
- Modify `src/components/shell/nav.test.tsx`: verify `/guests` active link and wallet lens grouping.

Customer 360 route:

- Create `src/components/panels/guest-profile-header.tsx`.
- Create `src/components/panels/fusion-panel.tsx`.
- Create `src/components/panels/nba-recommendation-card.tsx`.
- Create `src/components/panels/pitch-script-card.tsx`.
- Create `src/components/panels/guest-timeline.tsx`.
- Create tests beside each panel.
- Create `src/app/guests/[id]/page.tsx`.
- Create `src/app/guests/[id]/page.test.tsx`.
- Modify `src/app/segments/page.tsx`: add "see guests in this segment" cross-link.
- Modify `src/app/segments/page.test.tsx`: assert cross-link.

Final hardening:

- Modify `e2e/compliance.spec.ts`: add `/guests`, `/guests/{top-id}`, viewport checks, compliance checks, mock action checks.
- Modify `README.md`: append v2 demo script.
- Run `npm run verify`.

---

### Task 1: Motion-Safe Visual Foundation

**Files:**
- Create: `src/components/ui/animated-count.tsx`
- Create: `src/components/ui/animated-count.test.tsx`
- Create: `src/components/visuals/constellation-canvas.tsx`
- Create: `src/components/visuals/constellation-canvas.test.tsx`
- Modify: `src/components/ui/panel.tsx`
- Modify: `src/components/ui/panel.test.tsx`

- [ ] **Step 1: Write failing tests for count-up, canvas fallback, and glass panel variant**

Create `src/components/ui/animated-count.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { AnimatedCount } from './animated-count';

describe('AnimatedCount', () => {
  it('renders the final value immediately for accessible text', () => {
    render(<AnimatedCount value={64} suffix="%" ariaLabel="Wallet headroom" />);

    expect(screen.getByLabelText('Wallet headroom')).toHaveTextContent('64%');
  });

  it('formats index values without currency text', () => {
    render(<AnimatedCount value={128} prefix="Index " ariaLabel="Opportunity index" />);

    expect(screen.getByLabelText('Opportunity index')).toHaveTextContent('Index 128');
    expect(screen.getByLabelText('Opportunity index')).not.toHaveTextContent(/HKD|MOP|\$|元|澳門幣/i);
  });
});
```

Create `src/components/visuals/constellation-canvas.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { ConstellationCanvas } from './constellation-canvas';

describe('ConstellationCanvas', () => {
  it('renders an aria-hidden canvas and a text fallback for tests and reduced-motion contexts', () => {
    render(<ConstellationCanvas />);

    expect(screen.getByTestId('constellation-canvas')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Animated constellation background')).toHaveClass('sr-only');
  });
});
```

Update `src/components/ui/panel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Panel } from './panel';

describe('Panel', () => {
  it('renders default panel content', () => {
    render(<Panel>Wallet panel</Panel>);

    expect(screen.getByText('Wallet panel')).toBeInTheDocument();
  });

  it('supports glass depth without removing caller classes', () => {
    render(
      <Panel variant="glass" className="border-galaxy-gold/40">
        Glass panel
      </Panel>,
    );

    const panel = screen.getByText('Glass panel').closest('section');
    expect(panel).toHaveClass('backdrop-blur');
    expect(panel).toHaveClass('border-galaxy-gold/40');
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
npm run test -- src/components/ui/animated-count.test.tsx src/components/visuals/constellation-canvas.test.tsx src/components/ui/panel.test.tsx
```

Expected: FAIL because `animated-count.tsx` and `constellation-canvas.tsx` do not exist, and `Panel` has no `variant` prop.

- [ ] **Step 3: Implement `AnimatedCount`**

Create `src/components/ui/animated-count.tsx`:

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AnimatedCountProps {
  value: number;
  prefix?: string;
  suffix?: string;
  ariaLabel: string;
  durationMs?: number;
  className?: string;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function formatCount(value: number, prefix = '', suffix = '') {
  return `${prefix}${Math.round(value)}${suffix}`;
}

export function AnimatedCount({
  value,
  prefix = '',
  suffix = '',
  ariaLabel,
  durationMs = 900,
  className,
}: AnimatedCountProps) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef<number | null>(null);
  const safeValue = Number.isFinite(value) ? value : 0;

  useEffect(() => {
    if (shouldReduceMotion || typeof window === 'undefined') {
      setDisplayValue(safeValue);
      return;
    }

    const start = performance.now();
    setDisplayValue(0);

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplayValue(safeValue * easeOutCubic(progress));

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    }

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [durationMs, safeValue, shouldReduceMotion]);

  const accessibleText = useMemo(
    () => formatCount(safeValue, prefix, suffix),
    [prefix, safeValue, suffix],
  );

  return (
    <span aria-label={ariaLabel} className={className}>
      <span aria-hidden="true">{formatCount(displayValue, prefix, suffix)}</span>
      <span className="sr-only">{accessibleText}</span>
    </span>
  );
}
```

- [ ] **Step 4: Implement the constellation canvas**

Create `src/components/visuals/constellation-canvas.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

const STAR_COUNT = 72;
const LINK_DISTANCE = 132;
const GOLD = '201, 164, 92';

function createStars(width: number, height: number): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const seed = (index + 1) * 97;
    const x = ((seed * 37) % Math.max(width, 1));
    const y = ((seed * 53) % Math.max(height, 1));

    return {
      x,
      y,
      vx: ((seed % 7) - 3) * 0.018,
      vy: ((seed % 11) - 5) * 0.014,
      radius: 0.8 + (seed % 4) * 0.24,
      alpha: 0.24 + (seed % 6) * 0.06,
    };
  });
}

export function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper || reduceMotion) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let stars: Star[] = [];
    let animationFrame = 0;
    let visible = true;

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(rect.width, rect.height);
    }

    function draw() {
      const rect = wrapper.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = 'rgba(11, 11, 14, 0.2)';
      context.fillRect(0, 0, rect.width, rect.height);

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0 || star.x > rect.width) star.vx *= -1;
        if (star.y < 0 || star.y > rect.height) star.vy *= -1;
      });

      for (let i = 0; i < stars.length; i += 1) {
        for (let j = i + 1; j < stars.length; j += 1) {
          const first = stars[i];
          const second = stars[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance < LINK_DISTANCE) {
            context.strokeStyle = `rgba(${GOLD}, ${0.12 * (1 - distance / LINK_DISTANCE)})`;
            context.lineWidth = 0.6;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
          }
        }
      }

      stars.forEach((star) => {
        context.fillStyle = `rgba(${GOLD}, ${star.alpha})`;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      });

      if (visible && document.visibilityState === 'visible') {
        animationFrame = window.requestAnimationFrame(draw);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        animationFrame = window.requestAnimationFrame(draw);
      } else {
        window.cancelAnimationFrame(animationFrame);
      }
    });

    resize();
    observer.observe(wrapper);
    window.addEventListener('resize', resize);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [reduceMotion]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-testid="constellation-canvas"
        className="h-full w-full opacity-90"
      />
      <span className="sr-only">Animated constellation background</span>
    </div>
  );
}
```

- [ ] **Step 5: Add glass variant to `Panel`**

Replace `src/components/ui/panel.tsx` with:

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
  default: 'rounded-lg border border-galaxy-border bg-galaxy-charcoal/78',
  glass: 'rounded-2xl border border-white/10 bg-galaxy-charcoal/60 shadow-2xl shadow-black/30 backdrop-blur',
  hero: 'rounded-2xl border border-galaxy-gold/30 bg-galaxy-charcoal/62 shadow-[0_0_44px_rgba(201,164,92,0.15)] backdrop-blur',
};

export function Panel({ children, className, variant = 'default' }: PanelProps) {
  const hasPaddingOverride = paddingClassPattern.test(className ?? '');

  return (
    <section
      className={clsx(
        variantClasses[variant],
        'relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/20',
        hasPaddingOverride ? null : 'p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}
```

- [ ] **Step 6: Run focused tests and commit**

Run:

```bash
npm run test -- src/components/ui/animated-count.test.tsx src/components/visuals/constellation-canvas.test.tsx src/components/ui/panel.test.tsx
npm run lint
```

Expected: all focused tests pass; lint exits 0.

Commit:

```bash
git add src/components/ui/animated-count.tsx src/components/ui/animated-count.test.tsx src/components/visuals/constellation-canvas.tsx src/components/visuals/constellation-canvas.test.tsx src/components/ui/panel.tsx src/components/ui/panel.test.tsx
git commit -m "Add motion-safe visual foundation"
```

---

### Task 2: Overview Bento Grid And Wallet Constellation

**Files:**
- Create: `src/components/charts/wallet-constellation.tsx`
- Create: `src/components/charts/wallet-constellation.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

- [ ] **Step 1: Write failing wallet constellation test**

Create `src/components/charts/wallet-constellation.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { latestSegments } from '@/data';
import { WalletConstellation } from './wallet-constellation';

describe('WalletConstellation', () => {
  it('renders each segment as a star with opportunity evidence', () => {
    render(<WalletConstellation segments={latestSegments} />);

    expect(screen.getByRole('figure', { name: /Wallet constellation/i })).toBeInTheDocument();
    expect(screen.getByText('Pitch-now cluster')).toBeInTheDocument();
    expect(screen.getByText(latestSegments[0].name)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/opportunity star/i).length).toBeGreaterThanOrEqual(latestSegments.length);
  });

  it('keeps CDE values in index and percentage form', () => {
    render(<WalletConstellation segments={latestSegments} />);

    expect(screen.getByRole('figure', { name: /Wallet constellation/i })).toHaveTextContent(/Index|%/);
    expect(screen.getByRole('figure', { name: /Wallet constellation/i })).not.toHaveTextContent(/HKD|MOP|\$|元|澳門幣/i);
  });
});
```

Update `src/app/page.test.tsx` inside the first overview test:

```tsx
expect(screen.getByTestId('overview-constellation-hero')).toBeInTheDocument();
expect(screen.getByRole('heading', { name: /Wallet headroom constellation/i })).toBeInTheDocument();
expect(screen.getByRole('figure', { name: /Wallet constellation/i })).toBeInTheDocument();
expect(screen.getByText(/Pitch-now cluster/i)).toBeInTheDocument();
expect(screen.getByText(/Galaxy already knows stay, dining and rewards behavior/i)).toBeInTheDocument();
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
npm run test -- src/components/charts/wallet-constellation.test.tsx src/app/page.test.tsx
```

Expected: FAIL because `WalletConstellation` and the new Overview hero content do not exist.

- [ ] **Step 3: Implement `WalletConstellation`**

Create `src/components/charts/wallet-constellation.tsx`:

```tsx
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import type { Segment } from '@/data';

function starPosition(index: number, total: number, leakagePct: number) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const distance = 22 + Math.min(42, leakagePct * 0.55);

  return {
    left: 50 + Math.cos(angle) * distance,
    top: 50 + Math.sin(angle) * distance,
  };
}

function opportunityTone(value: number) {
  if (value >= 150) return 'bg-galaxy-gold shadow-[0_0_28px_rgba(201,164,92,0.62)]';
  if (value >= 125) return 'bg-galaxy-gold-lite shadow-[0_0_18px_rgba(228,201,136,0.42)]';
  return 'bg-galaxy-positive shadow-[0_0_14px_rgba(111,169,140,0.28)]';
}

export function WalletConstellation({ segments }: { segments: Segment[] }) {
  const safeSegments = segments.filter((segment) => Number.isFinite(segment.opportunityIndex));
  const topSegment = [...safeSegments].sort((a, b) => b.opportunityIndex - a.opportunityIndex)[0];

  return (
    <figure
      aria-label="Wallet constellation"
      className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-galaxy-border bg-[radial-gradient(circle_at_center,rgba(201,164,92,0.14),transparent_58%),linear-gradient(135deg,rgba(11,11,14,0.94),rgba(21,21,27,0.92))] p-5"
    >
      <figcaption>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Signature visual</p>
        <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Wallet headroom constellation</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-galaxy-muted">
          Size signals value, glow signals opportunity, and distance from centre signals leakage.
        </p>
      </figcaption>

      <div className="relative mt-5 h-64 rounded-xl border border-galaxy-border/70 bg-galaxy-ink/50">
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-galaxy-gold/30 bg-galaxy-gold/10" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[0.65rem] uppercase tracking-[0.16em] text-galaxy-muted">
          Galaxy capture
        </div>
        {safeSegments.map((segment, index) => {
          const averageLeakage = Math.round(
            Object.values(segment.categories).reduce((sum, category) => sum + category.leakagePct, 0)
            / Object.values(segment.categories).length,
          );
          const position = starPosition(index, safeSegments.length, averageLeakage);
          const size = 14 + Math.min(26, segment.sizeHighK / 2);

          return (
            <div
              key={segment.id}
              aria-label={`${segment.name} opportunity star`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position.left}%`, top: `${position.top}%` }}
            >
              <span
                className={`block rounded-full ${opportunityTone(segment.opportunityIndex)}`}
                style={{ width: size, height: size }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/60 p-3">
          <p className="text-galaxy-muted">Pitch-now cluster</p>
          <p className="mt-1 font-semibold text-galaxy-cream">{topSegment?.name ?? 'No segment'}</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/60 p-3">
          <p className="text-galaxy-muted">Opportunity</p>
          <p className="mt-1 font-semibold text-galaxy-cream">
            <IndexValue value={topSegment?.opportunityIndex ?? 0} />
          </p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/60 p-3">
          <p className="text-galaxy-muted">Wallet capture</p>
          <p className="mt-1 font-semibold text-galaxy-cream">
            <PercentValue value={topSegment?.metrics.shareOfWallet ?? 0} />
          </p>
        </div>
      </div>
    </figure>
  );
}
```

- [ ] **Step 4: Restructure the Overview hero and bento**

Modify `src/app/page.tsx`:

1. Add imports:

```tsx
import dynamic from 'next/dynamic';
import { WalletConstellation } from '@/components/charts/wallet-constellation';
import { AnimatedCount } from '@/components/ui/animated-count';

const ConstellationCanvas = dynamic(
  () => import('@/components/visuals/constellation-canvas').then((mod) => mod.ConstellationCanvas),
  { ssr: false },
);
```

2. Replace the opening `motion.section` in `OverviewRoute` with:

```tsx
<motion.section
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45, ease: 'easeOut' }}
  data-testid="overview-constellation-hero"
  className="relative overflow-hidden rounded-2xl border border-galaxy-gold/25 bg-galaxy-ink px-6 py-8 shadow-[0_0_60px_rgba(201,164,92,0.16)] md:px-8"
>
  <ConstellationCanvas />
  <div className="relative z-10">
    <Overline>客戶錢包洞察 · Guest Wallet Intelligence</Overline>
    <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="font-serif text-5xl text-galaxy-cream md:text-7xl"
        >
          Galaxy Constellation
        </motion.h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
          Galaxy already knows stay, dining and rewards behavior. Mastercard CDE adds modelled off-property wallet,
          leakage and propensity so each quarter starts with a clear pitch priority.
        </p>
      </div>
      <div className="rounded-2xl border border-galaxy-gold/30 bg-galaxy-charcoal/55 p-5 backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-semibold text-galaxy-gold">
          {selectedQuarter.label}
          <CdeChip />
        </div>
        <p className="mt-3 text-sm leading-6 text-galaxy-muted">
          Mastercard CDE refresh, {methodology.basis}, matched coverage{' '}
          <span className="text-galaxy-cream">{methodology.matchedCoveragePct}%</span>.
        </p>
      </div>
    </div>
  </div>
</motion.section>
```

3. Replace the KPI card section with this bento grid:

```tsx
<section className="grid auto-rows-[minmax(11rem,auto)] gap-4 lg:grid-cols-4">
  <Panel variant="hero" className="lg:col-span-2 lg:row-span-2">
    <Overline>Wallet headroom</Overline>
    <div className="mt-5 font-serif text-6xl text-galaxy-gold md:text-7xl">
      <AnimatedCount value={walletHeadroomPct} suffix="%" ariaLabel="Estimated wallet headroom" />
    </div>
    <p className="mt-5 max-w-xl text-sm leading-6 text-galaxy-muted">
      Average modelled leakage still addressable across hospitality, dining, entertainment and retail-luxury categories.
    </p>
  </Panel>
  <KpiCard
    label="Matched guest base"
    value={<EnrichedTextValue>{`~${matchedGuestLowK}-${matchedGuestHighK}k`}</EnrichedTextValue>}
    detail="Matched active segments modelled from CDE coverage."
  />
  <KpiCard
    label="Galaxy wallet capture"
    value={<PercentValue value={walletCapturePct} />}
    detail="Average hospitality share across current-quarter segments."
  />
  <Panel variant="glass" className="lg:col-span-2">
    <Overline>Top ranked finding</Overline>
    <p className="mt-3 text-lg font-semibold leading-7 text-galaxy-cream">
      {topFindings[0]?.title ?? 'No active CDE segment insights available for this quarter.'}
    </p>
    <p className="mt-3 text-sm leading-6 text-galaxy-muted">
      {topFindings[0]?.finding ?? 'Refresh the segment feed to generate ranked findings.'}
    </p>
  </Panel>
  <KpiCard
    label="Top-tier rewards propensity"
    value={<EnrichedTextValue>{formatPropensity(topTierRewardsPropensity)}</EnrichedTextValue>}
    detail="Mean likelihood signal for premium rewards activation."
  />
  <KpiCard
    label="Opportunity benchmark"
    value={<IndexValue value={topOpportunityIndex} />}
    detail="Highest current-quarter segment opportunity index."
  />
</section>
```

4. Insert `<WalletConstellation segments={safeSegments} />` before `<EvidenceStrip steps={insightNarrative.fusionSteps} />`.

- [ ] **Step 5: Run focused Overview tests and commit**

Run:

```bash
npm run test -- src/components/charts/wallet-constellation.test.tsx src/app/page.test.tsx
npm run lint
```

Expected: all focused tests pass; lint exits 0.

Commit:

```bash
git add src/components/charts/wallet-constellation.tsx src/components/charts/wallet-constellation.test.tsx src/app/page.tsx src/app/page.test.tsx
git commit -m "Elevate overview with constellation bento"
```

---

### Task 3: Deterministic Guest Data And Lead Scoring

**Files:**
- Modify: `src/data/types.ts`
- Create: `src/data/guests.ts`
- Create: `src/data/guests.test.ts`
- Modify: `src/data/index.ts`

- [ ] **Step 1: Write failing guest data tests**

Create `src/data/guests.test.ts`:

```ts
import { CORE_CATEGORIES, guests, getGuestById, getGuestsBySegmentId, topPriorityGuests } from './guests';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const maskedIdPattern = /^MEM-••••\d{4}$/;

describe('guest lead data', () => {
  it('generates deterministic masked guests across existing segments', () => {
    expect(guests.length).toBeGreaterThanOrEqual(40);
    expect(guests.length).toBeLessThanOrEqual(60);
    expect(guests.every((guest) => maskedIdPattern.test(guest.id))).toBe(true);
    expect(new Set(guests.map((guest) => guest.id)).size).toBe(guests.length);
  });

  it('computes finite lead scores and returns descending top priorities', () => {
    expect(topPriorityGuests).toHaveLength(12);
    topPriorityGuests.forEach((guest, index) => {
      expect(guest.leadScore).toBeGreaterThanOrEqual(0);
      expect(guest.leadScore).toBeLessThanOrEqual(100);
      if (index > 0) {
        expect(topPriorityGuests[index - 1].leadScore).toBeGreaterThanOrEqual(guest.leadScore);
      }
    });
  });

  it('keeps CDE capture and leakage balanced by category', () => {
    for (const guest of guests) {
      for (const category of CORE_CATEGORIES) {
        const total = guest.cde.categoryCapturePct[category] + guest.cde.categoryLeakagePct[category];
        expect(total).toBe(100);
      }
    }
  });

  it('keeps enriched guest fields CDE-safe', () => {
    for (const guest of guests) {
      expect(JSON.stringify(guest.cde)).not.toMatch(bannedCurrencyPattern);
      expect(guest.cde.crossPropertyCashBand).toMatch(/^\d+-\d+k equiv\.\/mo$/);
      expect(guest.projectedUpsideBand).toMatch(/^\d+-\d+k equiv\.\/mo$/);
      expect(guest.pitchScript.en).not.toMatch(bannedCurrencyPattern);
      expect(guest.pitchScript.zh).not.toMatch(bannedCurrencyPattern);
    }
  });

  it('looks up guests by id and segment id', () => {
    const first = guests[0];

    expect(getGuestById(first.id)).toEqual(first);
    expect(getGuestsBySegmentId(first.segmentId).every((guest) => guest.segmentId === first.segmentId)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
npm run test -- src/data/guests.test.ts
```

Expected: FAIL because `src/data/guests.ts` does not exist.

- [ ] **Step 3: Add guest types**

Append to `src/data/types.ts`:

```ts
export type GalaxyTier = 'Privilege' | 'Gold' | 'Platinum' | 'Diamond';
export type GuestCategory = CoreCategory;
export type NbaChannel = 'online' | 'physical' | 'host';

export interface NbaRec {
  offer: string;
  rationale: string;
  upliftIndex: number;
  channel: NbaChannel;
  confidence: number;
}

export interface Guest {
  id: string;
  segmentId: string;
  persona: string;
  galaxyTier: GalaxyTier;
  firstParty: {
    lifetimeBand: 'mid' | 'high' | 'ultra';
    staysL12m: number;
    nightsBand: string;
    properties: string[];
    diningVisits: number;
    entertainmentVisits: number;
    recencyDays: number;
    frequencyIndex: number;
    rewardsPoints: number;
    gamingContextIndex?: number;
  };
  cde: {
    categoryCapturePct: Record<GuestCategory, number>;
    categoryLeakagePct: Record<GuestCategory, number>;
    categoryWalletIndex: Record<GuestCategory, number>;
    propensities: Propensities;
    crossPropertyCashBand: string;
    channelOnlinePct: number;
  };
  leadScore: number;
  projectedUpsideBand: string;
  primaryOpportunity: GuestCategory;
  scoreDrivers: string[];
  nextBestActions: NbaRec[];
  pitchScript: { en: string; zh: string };
}
```

- [ ] **Step 4: Implement deterministic guest generator**

Create `src/data/guests.ts`:

```ts
import { clamp, jitter, mulberry32 } from '@/lib/rng';
import { CORE_CATEGORIES, latestSegments } from './generate';
import type { CoreCategory, GalaxyTier, Guest, NbaRec, Propensities, Segment } from './types';

export { CORE_CATEGORIES };

const properties = ['Ritz-Carlton', 'Banyan Tree', 'Capella', 'Hotel Okura', 'Galaxy Hotel'];
const tierOrder: GalaxyTier[] = ['Privilege', 'Gold', 'Platinum', 'Diamond'];
const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

function stableDigits(index: number) {
  return String(3421 + index * 137).slice(-4).padStart(4, '0');
}

function lifetimeBand(segment: Segment, index: number): 'mid' | 'high' | 'ultra' {
  if (segment.opportunityIndex >= 150 && index % 3 === 0) return 'ultra';
  if (segment.opportunityIndex >= 125 || index % 2 === 0) return 'high';
  return 'mid';
}

function tierFor(segment: Segment, index: number): GalaxyTier {
  if (segment.opportunityIndex >= 155 && index % 3 !== 1) return 'Diamond';
  if (segment.opportunityIndex >= 130) return index % 2 === 0 ? 'Platinum' : 'Diamond';
  return tierOrder[(index + segment.name.length) % tierOrder.length];
}

function valueScore(guest: Omit<Guest, 'leadScore'>) {
  const tierScore = { Privilege: 42, Gold: 58, Platinum: 78, Diamond: 94 }[guest.galaxyTier];
  const lifetimeScore = { mid: 52, high: 76, ultra: 96 }[guest.firstParty.lifetimeBand];
  return tierScore * 0.45 + lifetimeScore * 0.35 + clamp(guest.firstParty.frequencyIndex, 70, 180) * 0.2;
}

function opportunityScore(guest: Omit<Guest, 'leadScore'>) {
  const values = CORE_CATEGORIES.map((category) => {
    const leakage = guest.cde.categoryLeakagePct[category];
    const wallet = guest.cde.categoryWalletIndex[category];
    return leakage * (wallet / 100);
  });
  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length, 0, 100);
}

function propensityScore(propensities: Propensities) {
  return (propensities.topTierRewards * 0.45 + propensities.coBrandLookAlike * 0.35 + propensities.luxuryHotelSpender * 0.2) * 100;
}

function engagementScore(guest: Omit<Guest, 'leadScore'>) {
  const recency = clamp(100 - guest.firstParty.recencyDays * 1.8, 0, 100);
  const frequency = clamp(guest.firstParty.frequencyIndex - 60, 0, 100);
  return recency * 0.45 + frequency * 0.55;
}

function computeLeadScore(guest: Omit<Guest, 'leadScore'>) {
  return Math.round(clamp(
    valueScore(guest) * 0.30
    + opportunityScore(guest) * 0.30
    + propensityScore(guest.cde.propensities) * 0.25
    + engagementScore(guest) * 0.15,
    0,
    100,
  ));
}

function primaryOpportunity(capture: Record<CoreCategory, number>, wallet: Record<CoreCategory, number>) {
  return [...CORE_CATEGORIES].sort((a, b) => (
    (100 - capture[b]) * wallet[b] - (100 - capture[a]) * wallet[a]
  ))[0];
}

function projectedBand(score: number) {
  const low = Math.max(4, Math.round(score / 8));
  const high = low + 6 + Math.round(score / 18);
  return `${low}-${high}k equiv./mo`;
}

function actionFor(category: CoreCategory, propensities: Propensities): NbaRec[] {
  const offerMap: Record<CoreCategory, string> = {
    hospitality: 'Capella or Ritz suite upgrade with host-arranged arrival',
    fnb: 'Chef table dining privilege with pre-arrival concierge',
    entertainment: 'Galaxy Arena presale access with premium dining bundle',
    retailLuxury: 'Promenade private retail appointment paired with suite stay',
  };
  const channel = propensities.topTierRewards > 0.75 ? 'host' : propensities.coBrandLookAlike > 0.72 ? 'online' : 'physical';

  return [
    {
      offer: offerMap[category],
      rationale: `${category} has the clearest capture gap after combining Galaxy behavior with CDE wallet indices.`,
      upliftIndex: Math.round(118 + propensities.coBrandLookAlike * 42),
      channel,
      confidence: Number(clamp(0.62 + propensities.topTierRewards * 0.25, 0, 0.96).toFixed(2)),
    },
  ];
}

function buildGuest(segment: Segment, index: number, globalIndex: number): Guest {
  const random = mulberry32(9000 + globalIndex * 19);
  const categoryCapturePct = Object.fromEntries(CORE_CATEGORIES.map((category) => {
    const base = segment.categories[category].capturedSharePct;
    return [category, clamp(jitter(base, random, 18, 18, 86), 0, 100)];
  })) as Record<CoreCategory, number>;
  const categoryLeakagePct = Object.fromEntries(CORE_CATEGORIES.map((category) => (
    [category, 100 - categoryCapturePct[category]]
  ))) as Record<CoreCategory, number>;
  const categoryWalletIndex = Object.fromEntries(CORE_CATEGORIES.map((category) => (
    [category, clamp(jitter(segment.categories[category].totalWalletIndex, random, 34, 70, 260), 0, 999)]
  ))) as Record<CoreCategory, number>;
  const propensities: Propensities = {
    luxuryHotelSpender: Number(clamp(segment.propensities.luxuryHotelSpender + (random() - 0.5) * 0.18, 0, 1).toFixed(2)),
    topTierRewards: Number(clamp(segment.propensities.topTierRewards + (random() - 0.5) * 0.18, 0, 1).toFixed(2)),
    coBrandLookAlike: Number(clamp(segment.propensities.coBrandLookAlike + (random() - 0.5) * 0.18, 0, 1).toFixed(2)),
  };
  const primary = primaryOpportunity(categoryCapturePct, categoryWalletIndex);
  const baseGuest: Omit<Guest, 'leadScore'> = {
    id: `MEM-••••${stableDigits(globalIndex)}`,
    segmentId: segment.id,
    persona: segment.name,
    galaxyTier: tierFor(segment, index),
    firstParty: {
      lifetimeBand: lifetimeBand(segment, index),
      staysL12m: Math.max(1, Math.round(2 + segment.metrics.shareOfVisits / 18 + random() * 4)),
      nightsBand: `${2 + (index % 3)}-${5 + (index % 4)} nights`,
      properties: [properties[(index + globalIndex) % properties.length], properties[(index + 2) % properties.length]],
      diningVisits: Math.round(2 + segment.categories.fnb.capturedSharePct / 12 + random() * 5),
      entertainmentVisits: Math.round(1 + segment.categories.entertainment.capturedSharePct / 16 + random() * 3),
      recencyDays: Math.round(5 + random() * 42),
      frequencyIndex: clamp(jitter(segment.metrics.avgTxnCountIndex, random, 28, 70, 210), 0, 999),
      rewardsPoints: Math.round(1800 + segment.metrics.avgTxnSizeIndex * 72 + random() * 4200),
      gamingContextIndex: segment.gamingContextIndex,
    },
    cde: {
      categoryCapturePct,
      categoryLeakagePct,
      categoryWalletIndex,
      propensities,
      crossPropertyCashBand: segment.crossPropertyCashBand,
      channelOnlinePct: clamp(jitter(segment.metrics.channelShareOnlinePct, random, 18, 12, 92), 0, 100),
    },
    projectedUpsideBand: '0-0k equiv./mo',
    primaryOpportunity: primary,
    scoreDrivers: [
      `${primary} leakage ${categoryLeakagePct[primary]}%`,
      `wallet ${Math.round(categoryWalletIndex[primary])} index`,
      `${tierFor(segment, index)} tier`,
    ],
    nextBestActions: actionFor(primary, propensities),
    pitchScript: {
      en: '',
      zh: '',
    },
  };
  const leadScore = computeLeadScore(baseGuest);
  const projectedUpsideBand = projectedBand(leadScore);
  const leadLabel = `${baseGuest.galaxyTier}-tier guest`;
  const englishPitch = `${leadLabel} indexes high on ${primary} opportunity. Invite them to ${baseGuest.nextBestActions[0].offer} through ${baseGuest.nextBestActions[0].channel} outreach.`;
  const zhPitch = `${baseGuest.galaxyTier} 會員在 ${primary} 機會指數偏高，建議以${baseGuest.nextBestActions[0].channel}渠道邀請體驗：${baseGuest.nextBestActions[0].offer}。`;

  if (bannedCurrencyPattern.test(JSON.stringify({ baseGuest, englishPitch, zhPitch, projectedUpsideBand }))) {
    throw new Error('Guest data must remain CDE-safe');
  }

  return {
    ...baseGuest,
    leadScore,
    projectedUpsideBand,
    pitchScript: {
      en: englishPitch,
      zh: zhPitch,
    },
  };
}

export const guests: Guest[] = latestSegments.flatMap((segment, segmentIndex) => (
  Array.from({ length: 8 }, (_, index) => buildGuest(segment, index, segmentIndex * 8 + index))
));

export const topPriorityGuests = [...guests].sort((a, b) => b.leadScore - a.leadScore).slice(0, 12);

export function getGuestById(id: string) {
  return guests.find((guest) => guest.id === id);
}

export function getGuestsBySegmentId(segmentId: string) {
  return guests.filter((guest) => guest.segmentId === segmentId);
}
```

- [ ] **Step 5: Export guests**

Modify `src/data/index.ts`:

```ts
export {
  guests,
  getGuestById,
  getGuestsBySegmentId,
  topPriorityGuests,
} from './guests';
```

- [ ] **Step 6: Run guest data tests and commit**

Run:

```bash
npm run test -- src/data/guests.test.ts
npm run lint
```

Expected: guest tests pass; lint exits 0.

Commit:

```bash
git add src/data/types.ts src/data/guests.ts src/data/guests.test.ts src/data/index.ts
git commit -m "Add deterministic guest lead data"
```

---

### Task 4: Guest UI Primitives And Charts

**Files:**
- Create: `src/components/ui/tier-badge.tsx`
- Create: `src/components/ui/tier-badge.test.tsx`
- Create: `src/components/ui/score-pill.tsx`
- Create: `src/components/ui/score-pill.test.tsx`
- Create: `src/components/ui/driver-chip.tsx`
- Create: `src/components/ui/driver-chip.test.tsx`
- Create: `src/components/charts/lead-score-gauge.tsx`
- Create: `src/components/charts/lead-score-gauge.test.tsx`
- Create: `src/components/charts/priority-quadrant.tsx`
- Create: `src/components/charts/priority-quadrant.test.tsx`
- Create: `src/components/charts/wallet-orbit.tsx`
- Create: `src/components/charts/wallet-orbit.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `src/components/ui/tier-badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { TierBadge } from './tier-badge';

describe('TierBadge', () => {
  it('renders Galaxy tier labels', () => {
    render(<TierBadge tier="Diamond" />);

    expect(screen.getByText('Diamond')).toBeInTheDocument();
  });
});
```

Create `src/components/ui/score-pill.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { ScorePill } from './score-pill';

describe('ScorePill', () => {
  it('renders a finite lead score', () => {
    render(<ScorePill score={88} label="Lead Score" />);

    expect(screen.getByLabelText('Lead Score 88 out of 100')).toHaveTextContent('88');
  });
});
```

Create `src/components/ui/driver-chip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { DriverChip } from './driver-chip';

describe('DriverChip', () => {
  it('renders a transparent scoring driver', () => {
    render(<DriverChip>retailLuxury leakage 54%</DriverChip>);

    expect(screen.getByText('retailLuxury leakage 54%')).toBeInTheDocument();
  });
});
```

Create `src/components/charts/lead-score-gauge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { LeadScoreGauge } from './lead-score-gauge';

describe('LeadScoreGauge', () => {
  it('renders an accessible lead score gauge', () => {
    render(<LeadScoreGauge score={91} />);

    expect(screen.getByRole('meter', { name: /Lead Score/i })).toHaveAttribute('aria-valuenow', '91');
    expect(screen.getByText('91')).toBeInTheDocument();
  });
});
```

Create `src/components/charts/priority-quadrant.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { topPriorityGuests } from '@/data';
import { PriorityQuadrant } from './priority-quadrant';

describe('PriorityQuadrant', () => {
  it('plots guest bubbles and labels the pitch-now quadrant', () => {
    render(<PriorityQuadrant guests={topPriorityGuests} />);

    expect(screen.getByRole('figure', { name: /Priority quadrant/i })).toBeInTheDocument();
    expect(screen.getByText('Pitch now')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/guest priority bubble/i).length).toBeGreaterThan(0);
  });
});
```

Create `src/components/charts/wallet-orbit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { guests } from '@/data';
import { WalletOrbit } from './wallet-orbit';

describe('WalletOrbit', () => {
  it('renders capture and leakage by category without currency text', () => {
    render(<WalletOrbit guest={guests[0]} />);

    expect(screen.getByRole('figure', { name: /Wallet orbit/i })).toBeInTheDocument();
    expect(screen.getByText(/hospitality/i)).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /Wallet orbit/i })).not.toHaveTextContent(/HKD|MOP|\$|元|澳門幣/i);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
npm run test -- src/components/ui/tier-badge.test.tsx src/components/ui/score-pill.test.tsx src/components/ui/driver-chip.test.tsx src/components/charts/lead-score-gauge.test.tsx src/components/charts/priority-quadrant.test.tsx src/components/charts/wallet-orbit.test.tsx
```

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement UI primitives**

Create `src/components/ui/tier-badge.tsx`:

```tsx
import clsx from 'clsx';
import type { GalaxyTier } from '@/data';

const tierClasses: Record<GalaxyTier, string> = {
  Privilege: 'border-galaxy-border bg-galaxy-slate text-galaxy-muted',
  Gold: 'border-galaxy-gold/30 bg-galaxy-gold/10 text-galaxy-gold',
  Platinum: 'border-galaxy-positive/40 bg-galaxy-positive/10 text-galaxy-positive',
  Diamond: 'border-galaxy-gold/50 bg-galaxy-gold/20 text-galaxy-gold-lite',
};

export function TierBadge({ tier }: { tier: GalaxyTier }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', tierClasses[tier])}>
      {tier}
    </span>
  );
}
```

Create `src/components/ui/score-pill.tsx`:

```tsx
import clsx from 'clsx';

function scoreTone(score: number) {
  if (score >= 85) return 'border-galaxy-gold/50 bg-galaxy-gold/15 text-galaxy-gold';
  if (score >= 70) return 'border-galaxy-positive/40 bg-galaxy-positive/10 text-galaxy-positive';
  return 'border-galaxy-border bg-galaxy-slate text-galaxy-muted';
}

export function ScorePill({ score, label = 'Lead Score' }: { score: number; label?: string }) {
  const safeScore = Number.isFinite(score) ? Math.round(score) : 0;

  return (
    <span
      aria-label={`${label} ${safeScore} out of 100`}
      className={clsx('inline-flex items-center rounded-full border px-3 py-1 font-mono text-sm', scoreTone(safeScore))}
    >
      {safeScore}
    </span>
  );
}
```

Create `src/components/ui/driver-chip.tsx`:

```tsx
import type { ReactNode } from 'react';

export function DriverChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-galaxy-border bg-galaxy-ink/55 px-2.5 py-1 text-xs text-galaxy-muted">
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Implement charts**

Create `src/components/charts/lead-score-gauge.tsx`:

```tsx
export function LeadScoreGauge({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, Number.isFinite(score) ? Math.round(score) : 0));

  return (
    <div
      role="meter"
      aria-label="Lead Score"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeScore}
      className="relative grid h-28 w-28 place-items-center rounded-full"
      style={{
        background: `conic-gradient(#c9a45c ${safeScore * 3.6}deg, rgba(44,44,54,0.9) 0deg)`,
      }}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-galaxy-charcoal">
        <span className="font-mono text-2xl font-semibold text-galaxy-cream">{safeScore}</span>
      </div>
    </div>
  );
}
```

Create `src/components/charts/priority-quadrant.tsx`:

```tsx
import Link from 'next/link';
import type { Guest } from '@/data';

function averagePropensity(guest: Guest) {
  const { luxuryHotelSpender, topTierRewards, coBrandLookAlike } = guest.cde.propensities;
  return (luxuryHotelSpender + topTierRewards + coBrandLookAlike) / 3;
}

function valueAxis(guest: Guest) {
  return Math.min(96, Math.max(8, guest.leadScore));
}

export function PriorityQuadrant({ guests }: { guests: Guest[] }) {
  return (
    <figure aria-label="Priority quadrant" className="relative min-h-[24rem] rounded-2xl border border-galaxy-border bg-galaxy-ink/60 p-5">
      <figcaption>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Value x propensity</p>
        <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Priority quadrant</h2>
      </figcaption>
      <div className="relative mt-5 h-72 rounded-xl border border-galaxy-border bg-[linear-gradient(90deg,transparent_49%,rgba(201,164,92,0.18)_50%,transparent_51%),linear-gradient(0deg,transparent_49%,rgba(201,164,92,0.18)_50%,transparent_51%)]">
        <div className="absolute right-3 top-3 rounded-full bg-galaxy-gold px-3 py-1 text-xs font-semibold text-galaxy-ink">Pitch now</div>
        {guests.map((guest) => {
          const x = valueAxis(guest);
          const y = Math.round(averagePropensity(guest) * 92);
          const size = 0.75 + guest.leadScore / 100;

          return (
            <Link
              key={guest.id}
              href={`/guests/${encodeURIComponent(guest.id)}`}
              aria-label={`${guest.id} guest priority bubble`}
              className="absolute rounded-full bg-galaxy-gold/75 shadow-[0_0_18px_rgba(201,164,92,0.48)] transition hover:scale-110"
              style={{
                left: `${x}%`,
                bottom: `${y}%`,
                width: `${0.75 + size}rem`,
                height: `${0.75 + size}rem`,
              }}
            />
          );
        })}
      </div>
    </figure>
  );
}
```

Create `src/components/charts/wallet-orbit.tsx`:

```tsx
import { CdeChip } from '@/components/ui/cde-chip';
import { PercentValue, IndexValue } from '@/components/ui/formatted-values';
import { CORE_CATEGORIES, type Guest } from '@/data';

const labels = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail luxury',
};

export function WalletOrbit({ guest }: { guest: Guest }) {
  return (
    <figure aria-label="Wallet orbit" className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/60 p-5">
      <figcaption className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Wallet orbit</p>
          <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Capture vs leakage</h2>
        </div>
        <CdeChip />
      </figcaption>
      <div className="mt-5 grid gap-3">
        {CORE_CATEGORIES.map((category) => (
          <div key={category} className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-galaxy-cream">{labels[category]}</span>
              <span className="text-galaxy-muted">
                <IndexValue value={guest.cde.categoryWalletIndex[category]} />
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-galaxy-slate">
              <div className="h-full rounded-full bg-galaxy-gold" style={{ width: `${guest.cde.categoryCapturePct[category]}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-galaxy-muted">
              <span>Capture <PercentValue value={guest.cde.categoryCapturePct[category]} /></span>
              <span>Leakage <PercentValue value={guest.cde.categoryLeakagePct[category]} /></span>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
```

- [ ] **Step 5: Run focused component tests and commit**

Run:

```bash
npm run test -- src/components/ui/tier-badge.test.tsx src/components/ui/score-pill.test.tsx src/components/ui/driver-chip.test.tsx src/components/charts/lead-score-gauge.test.tsx src/components/charts/priority-quadrant.test.tsx src/components/charts/wallet-orbit.test.tsx
npm run lint
```

Expected: all focused tests pass; lint exits 0.

Commit:

```bash
git add src/components/ui/tier-badge.tsx src/components/ui/tier-badge.test.tsx src/components/ui/score-pill.tsx src/components/ui/score-pill.test.tsx src/components/ui/driver-chip.tsx src/components/ui/driver-chip.test.tsx src/components/charts/lead-score-gauge.tsx src/components/charts/lead-score-gauge.test.tsx src/components/charts/priority-quadrant.tsx src/components/charts/priority-quadrant.test.tsx src/components/charts/wallet-orbit.tsx src/components/charts/wallet-orbit.test.tsx
git commit -m "Add guest lead visual components"
```

---

### Task 5: `/guests` Priority Lead Board

**Files:**
- Create: `src/components/panels/lead-board.tsx`
- Create: `src/components/panels/lead-board.test.tsx`
- Create: `src/app/guests/page.tsx`
- Create: `src/app/guests/page.test.tsx`
- Modify: `src/components/shell/nav.tsx`
- Modify: `src/components/shell/nav.test.tsx`
- Modify: `src/components/shell/lens-switch.tsx`
- Modify: `src/components/shell/lens-switch.test.tsx`

- [ ] **Step 1: Write failing Lead Board and route tests**

Create `src/components/panels/lead-board.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { guests } from '@/data';
import { LeadBoard } from './lead-board';

describe('LeadBoard', () => {
  it('renders ranked masked guests and score drivers', () => {
    render(<LeadBoard guests={guests} onAction={() => undefined} />);

    expect(screen.getByRole('heading', { name: /Priority Lead Board/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^MEM-••••/).length).toBeGreaterThan(0);
    expect(screen.getByText(/who to pitch next/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lead Score/i).length).toBeGreaterThan(0);
  });

  it('filters by tier and sends mock actions', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<LeadBoard guests={guests} onAction={onAction} />);

    await user.selectOptions(screen.getByLabelText('Tier filter'), 'Diamond');
    expect(screen.getAllByText('Diamond').length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole('button', { name: /Assign to host/i })[0]);
    expect(onAction).toHaveBeenCalledWith(expect.stringMatching(/assigned to host/i));
  });
});
```

Create `src/app/guests/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import GuestsPage from './page';

describe('guests route', () => {
  it('renders the Priority Lead Board and Priority Quadrant', () => {
    render(<GuestsPage />);

    expect(screen.getByRole('heading', { name: /Priority Lead Board/i })).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /Priority quadrant/i })).toBeInTheDocument();
    expect(screen.getByText(/Galaxy already knows what a guest does inside Galaxy/i)).toBeInTheDocument();
    expect(screen.getByText(/Mastercard CDE appends what they do outside/i)).toBeInTheDocument();
  });
});
```

Update `src/components/shell/nav.test.tsx`:

```tsx
expect(screen.getByRole('link', { name: /Guests/i })).toHaveAttribute('href', '/guests');
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
npm run test -- src/components/panels/lead-board.test.tsx src/app/guests/page.test.tsx src/components/shell/nav.test.tsx src/components/shell/lens-switch.test.tsx
```

Expected: FAIL because `/guests` components and nav entries do not exist.

- [ ] **Step 3: Implement Lead Board**

Create `src/components/panels/lead-board.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DriverChip } from '@/components/ui/driver-chip';
import { BandValue, IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { ScorePill } from '@/components/ui/score-pill';
import { TierBadge } from '@/components/ui/tier-badge';
import type { GalaxyTier, Guest } from '@/data';

type SortMode = 'leadScore' | 'upside' | 'propensity';
type TierFilter = GalaxyTier | 'all';

function propensityAverage(guest: Guest) {
  const values = Object.values(guest.cde.propensities);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sortGuests(guests: Guest[], sortMode: SortMode) {
  return [...guests].sort((a, b) => {
    if (sortMode === 'propensity') return propensityAverage(b) - propensityAverage(a);
    if (sortMode === 'upside') return b.leadScore + b.cde.categoryLeakagePct[b.primaryOpportunity] - (a.leadScore + a.cde.categoryLeakagePct[a.primaryOpportunity]);
    return b.leadScore - a.leadScore;
  });
}

export function LeadBoard({ guests, onAction }: { guests: Guest[]; onAction: (message: string) => void }) {
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('leadScore');
  const [minScore, setMinScore] = useState(0);

  const visibleGuests = useMemo(() => sortGuests(
    guests.filter((guest) => (tierFilter === 'all' || guest.galaxyTier === tierFilter) && guest.leadScore >= minScore),
    sortMode,
  ), [guests, minScore, sortMode, tierFilter]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Who to pitch next</p>
          <h1 className="mt-2 font-serif text-4xl text-galaxy-cream">Priority Lead Board</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
            Ranked by first-party value, CDE opportunity, propensity and engagement. IDs are masked synthetic demo records.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
            Tier filter
            <select value={tierFilter} onChange={(event) => setTierFilter(event.target.value as TierFilter)} className="mt-2 block rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 py-2 text-sm normal-case tracking-normal text-galaxy-cream">
              <option value="all">All</option>
              <option value="Diamond">Diamond</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Privilege">Privilege</option>
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
            Sort
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="mt-2 block rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 py-2 text-sm normal-case tracking-normal text-galaxy-cream">
              <option value="leadScore">Lead Score</option>
              <option value="upside">Upside</option>
              <option value="propensity">Propensity</option>
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
            Min score
            <input value={minScore} min={0} max={100} type="number" onChange={(event) => setMinScore(Number(event.target.value))} className="mt-2 block w-28 rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 py-2 text-sm normal-case tracking-normal text-galaxy-cream" />
          </label>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleGuests.slice(0, 12).map((guest, index) => (
          <article key={guest.id} className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-galaxy-gold">#{index + 1} {guest.id}</p>
                <h2 className="mt-2 text-xl font-semibold text-galaxy-cream">{guest.persona}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <TierBadge tier={guest.galaxyTier} />
                  <DriverChip>{guest.primaryOpportunity}</DriverChip>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Lead Score</p>
                <div className="mt-2"><ScorePill score={guest.leadScore} /></div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-galaxy-muted">{guest.nextBestActions[0].offer}</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div><p className="text-galaxy-muted">Upside</p><p className="mt-1 font-semibold text-galaxy-cream"><BandValue value={guest.projectedUpsideBand} /></p></div>
              <div><p className="text-galaxy-muted">Wallet</p><p className="mt-1 font-semibold text-galaxy-cream"><IndexValue value={guest.cde.categoryWalletIndex[guest.primaryOpportunity]} /></p></div>
              <div><p className="text-galaxy-muted">Leakage</p><p className="mt-1 font-semibold text-galaxy-cream"><PercentValue value={guest.cde.categoryLeakagePct[guest.primaryOpportunity]} /></p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {guest.scoreDrivers.map((driver) => <DriverChip key={driver}>{driver}</DriverChip>)}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/guests/${encodeURIComponent(guest.id)}`} className="rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink">Open 360</Link>
              <button type="button" onClick={() => onAction(`${guest.id} assigned to host`)} className="rounded-md border border-galaxy-border px-4 py-2 text-sm font-semibold text-galaxy-cream">Assign to host</button>
              <button type="button" onClick={() => onAction(`${guest.id} added to audience`)} className="rounded-md border border-galaxy-border px-4 py-2 text-sm font-semibold text-galaxy-cream">Add to audience</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `/guests` route**

Create `src/app/guests/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { PriorityQuadrant } from '@/components/charts/priority-quadrant';
import { LeadBoard } from '@/components/panels/lead-board';
import { Panel } from '@/components/ui/panel';
import { guests, topPriorityGuests } from '@/data';

export default function GuestsPage() {
  const [toast, setToast] = useState('');

  return (
    <div className="space-y-6 text-galaxy-cream">
      <Panel variant="hero">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Customer 360 lead prioritization</p>
        <p className="mt-3 max-w-4xl text-lg leading-8 text-galaxy-cream">
          Galaxy already knows what a guest does inside Galaxy. Mastercard CDE appends what they do outside. Fuse them per guest and the platform tells you who to pitch next, why, and exactly what to offer.
        </p>
        <p className="mt-3 text-sm leading-6 text-galaxy-muted">
          Synthetic masked demo records only. CDE values are modelled percentages, indices, probabilities, or bands.
        </p>
      </Panel>

      <PriorityQuadrant guests={topPriorityGuests} />
      <LeadBoard guests={guests} onAction={setToast} />

      {toast ? (
        <div role="status" className="fixed bottom-24 right-5 z-50 rounded-lg border border-galaxy-gold/40 bg-galaxy-charcoal px-4 py-3 text-sm text-galaxy-cream shadow-2xl shadow-black/30">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Add `/guests` navigation**

Modify `src/components/shell/nav.tsx`:

1. Add `UsersRound` to the Lucide import.
2. Insert this item after Segments in `walletNavItems`:

```tsx
{ href: '/guests', label: 'Guests', icon: UsersRound },
```

Modify `isAcquisitionLens` so `/guests` remains in the wallet lens:

```tsx
function isAcquisitionLens(pathname: string) {
  return pathname.startsWith('/corridors') || pathname.startsWith('/acquisition');
}
```

Modify `src/components/shell/lens-switch.tsx` only if it incorrectly marks `/guests` as acquisition. The correct behavior is Wallet Retention active on `/guests`.

- [ ] **Step 6: Run focused route tests and commit**

Run:

```bash
npm run test -- src/components/panels/lead-board.test.tsx src/app/guests/page.test.tsx src/components/shell/nav.test.tsx src/components/shell/lens-switch.test.tsx
npm run lint
```

Expected: all focused tests pass; lint exits 0.

Commit:

```bash
git add src/components/panels/lead-board.tsx src/components/panels/lead-board.test.tsx src/app/guests/page.tsx src/app/guests/page.test.tsx src/components/shell/nav.tsx src/components/shell/nav.test.tsx src/components/shell/lens-switch.tsx src/components/shell/lens-switch.test.tsx
git commit -m "Add priority guest lead board"
```

---

### Task 6: `/guests/[id]` Customer 360 Profile

**Files:**
- Create: `src/components/panels/guest-profile-header.tsx`
- Create: `src/components/panels/guest-profile-header.test.tsx`
- Create: `src/components/panels/fusion-panel.tsx`
- Create: `src/components/panels/fusion-panel.test.tsx`
- Create: `src/components/panels/nba-recommendation-card.tsx`
- Create: `src/components/panels/nba-recommendation-card.test.tsx`
- Create: `src/components/panels/pitch-script-card.tsx`
- Create: `src/components/panels/pitch-script-card.test.tsx`
- Create: `src/components/panels/guest-timeline.tsx`
- Create: `src/components/panels/guest-timeline.test.tsx`
- Create: `src/app/guests/[id]/page.tsx`
- Create: `src/app/guests/[id]/page.test.tsx`
- Modify: `src/app/segments/page.tsx`
- Modify: `src/app/segments/page.test.tsx`

- [ ] **Step 1: Write failing Customer 360 tests**

Create `src/app/guests/[id]/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { guests } from '@/data';
import GuestDetailPage from './page';

describe('guest detail route', () => {
  it('renders Customer 360 fusion, recommendations, and bilingual pitch', () => {
    render(<GuestDetailPage params={{ id: guests[0].id }} />);

    expect(screen.getByRole('heading', { name: /Customer 360/i })).toBeInTheDocument();
    expect(screen.getByText('What Galaxy sees')).toBeInTheDocument();
    expect(screen.getByText('What Mastercard CDE adds')).toBeInTheDocument();
    expect(screen.getByText('Fused opportunity')).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /Wallet orbit/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Next-Best-Action/i })).toBeInTheDocument();
    expect(screen.getByText('Suggested pitch script')).toBeInTheDocument();
    expect(screen.getByText('繁中')).toBeInTheDocument();
  });

  it('renders a not-found message for an unknown masked id', () => {
    render(<GuestDetailPage params={{ id: 'MEM-••••0000' }} />);

    expect(screen.getByText('Guest profile not found.')).toBeInTheDocument();
  });
});
```

Create `src/components/panels/fusion-panel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { guests } from '@/data';
import { FusionPanel } from './fusion-panel';

describe('FusionPanel', () => {
  it('separates Galaxy first-party and Mastercard CDE evidence', () => {
    render(<FusionPanel guest={guests[0]} />);

    expect(screen.getByText('What Galaxy sees')).toBeInTheDocument();
    expect(screen.getByText('What Mastercard CDE adds')).toBeInTheDocument();
    expect(screen.getByText('Fused opportunity')).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
npm run test -- src/app/guests/[id]/page.test.tsx src/components/panels/fusion-panel.test.tsx
```

Expected: FAIL because profile panels and route do not exist.

- [ ] **Step 3: Implement profile header and fusion panel**

Create `src/components/panels/guest-profile-header.tsx`:

```tsx
import { LeadScoreGauge } from '@/components/charts/lead-score-gauge';
import { CdeChip } from '@/components/ui/cde-chip';
import { TierBadge } from '@/components/ui/tier-badge';
import type { Guest } from '@/data';

export function GuestProfileHeader({ guest }: { guest: Guest }) {
  return (
    <section className="rounded-2xl border border-galaxy-gold/30 bg-galaxy-charcoal/65 p-6 shadow-[0_0_44px_rgba(201,164,92,0.13)]">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="font-mono text-sm text-galaxy-gold">{guest.id}</p>
          <h1 className="mt-3 font-serif text-5xl text-galaxy-cream">Customer 360</h1>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{guest.persona}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TierBadge tier={guest.galaxyTier} />
            <CdeChip />
            <span className="rounded-full border border-galaxy-border px-2.5 py-1 text-xs text-galaxy-muted">matched via CDE</span>
          </div>
        </div>
        <LeadScoreGauge score={guest.leadScore} />
      </div>
    </section>
  );
}
```

Create `src/components/panels/fusion-panel.tsx`:

```tsx
import { CdeChip } from '@/components/ui/cde-chip';
import { BandValue, IndexValue, PercentValue } from '@/components/ui/formatted-values';
import type { Guest } from '@/data';

export function FusionPanel({ guest }: { guest: Guest }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem_minmax(0,1fr)]">
      <div className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">What Galaxy sees</p>
        <h2 className="mt-2 text-2xl font-semibold text-galaxy-cream">First-party behavior</h2>
        <dl className="mt-5 grid gap-3 text-sm">
          <div><dt className="text-galaxy-muted">Properties</dt><dd className="text-galaxy-cream">{guest.firstParty.properties.join(', ')}</dd></div>
          <div><dt className="text-galaxy-muted">Stays L12M</dt><dd className="text-galaxy-cream">{guest.firstParty.staysL12m}</dd></div>
          <div><dt className="text-galaxy-muted">Dining visits</dt><dd className="text-galaxy-cream">{guest.firstParty.diningVisits}</dd></div>
          <div><dt className="text-galaxy-muted">Rewards points</dt><dd className="text-galaxy-cream">{guest.firstParty.rewardsPoints.toLocaleString('en-US')}</dd></div>
        </dl>
      </div>
      <div className="rounded-2xl border border-galaxy-gold/40 bg-galaxy-gold/10 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Fused opportunity</p>
        <p className="mt-4 font-mono text-4xl font-semibold text-galaxy-cream">{guest.leadScore}</p>
        <p className="mt-3 text-sm text-galaxy-muted">Lead Score</p>
        <div className="mt-5 text-sm text-galaxy-cream">
          <BandValue value={guest.projectedUpsideBand} />
        </div>
      </div>
      <div className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">What Mastercard CDE adds</p>
          <CdeChip />
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-galaxy-cream">Off-property signals</h2>
        <dl className="mt-5 grid gap-3 text-sm">
          <div><dt className="text-galaxy-muted">Primary leak</dt><dd className="text-galaxy-cream">{guest.primaryOpportunity}</dd></div>
          <div><dt className="text-galaxy-muted">Leakage</dt><dd className="text-galaxy-cream"><PercentValue value={guest.cde.categoryLeakagePct[guest.primaryOpportunity]} /></dd></div>
          <div><dt className="text-galaxy-muted">Wallet index</dt><dd className="text-galaxy-cream"><IndexValue value={guest.cde.categoryWalletIndex[guest.primaryOpportunity]} /></dd></div>
          <div><dt className="text-galaxy-muted">Cross-property band</dt><dd className="text-galaxy-cream"><BandValue value={guest.cde.crossPropertyCashBand} /></dd></div>
        </dl>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement recommendation, pitch, and timeline panels**

Create `src/components/panels/nba-recommendation-card.tsx`:

```tsx
import { IndexValue } from '@/components/ui/formatted-values';
import type { NbaRec } from '@/data';

export function NbaRecommendationCard({ rec }: { rec: NbaRec }) {
  return (
    <article className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <h3 className="text-lg font-semibold text-galaxy-cream">{rec.offer}</h3>
      <p className="mt-3 text-sm leading-6 text-galaxy-muted">{rec.rationale}</p>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div><p className="text-galaxy-muted">Uplift</p><p className="font-semibold text-galaxy-cream"><IndexValue value={rec.upliftIndex} /></p></div>
        <div><p className="text-galaxy-muted">Channel</p><p className="font-semibold capitalize text-galaxy-cream">{rec.channel}</p></div>
        <div><p className="text-galaxy-muted">Confidence</p><p className="font-semibold text-galaxy-cream">{Math.round(rec.confidence * 100)}%</p></div>
      </div>
    </article>
  );
}
```

Create `src/components/panels/pitch-script-card.tsx`:

```tsx
import type { Guest } from '@/data';

export function PitchScriptCard({ guest }: { guest: Guest }) {
  return (
    <section className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Suggested pitch script</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="font-semibold text-galaxy-cream">EN</p>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">{guest.pitchScript.en}</p>
        </div>
        <div>
          <p className="font-semibold text-galaxy-cream">繁中</p>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">{guest.pitchScript.zh}</p>
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/panels/guest-timeline.tsx`:

```tsx
import type { Guest } from '@/data';

export function GuestTimeline({ guest }: { guest: Guest }) {
  const events = [
    `${guest.firstParty.recencyDays} days ago · last Galaxy touchpoint`,
    `${guest.firstParty.diningVisits} dining visits L12M`,
    `Next best moment · ${guest.nextBestActions[0].channel} outreach`,
  ];

  return (
    <section className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Guest journey timeline</p>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {events.map((event) => (
          <li key={event} className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3 text-sm text-galaxy-muted">
            {event}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 5: Implement Customer 360 route**

Create `src/app/guests/[id]/page.tsx`:

```tsx
import Link from 'next/link';
import { WalletOrbit } from '@/components/charts/wallet-orbit';
import { FusionPanel } from '@/components/panels/fusion-panel';
import { GuestProfileHeader } from '@/components/panels/guest-profile-header';
import { GuestTimeline } from '@/components/panels/guest-timeline';
import { NbaRecommendationCard } from '@/components/panels/nba-recommendation-card';
import { PitchScriptCard } from '@/components/panels/pitch-script-card';
import { getGuestById, guests } from '@/data';

export function generateStaticParams() {
  return guests.map((guest) => ({ id: guest.id }));
}

export default function GuestDetailPage({ params }: { params: { id: string } }) {
  const guest = getGuestById(decodeURIComponent(params.id));

  if (!guest) {
    return (
      <div className="space-y-4 text-galaxy-cream">
        <p className="text-galaxy-muted">Guest profile not found.</p>
        <Link href="/guests" className="inline-flex rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink">
          Back to Lead Board
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-galaxy-cream">
      <GuestProfileHeader guest={guest} />
      <FusionPanel guest={guest} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-galaxy-cream">Next-Best-Action</h2>
          {guest.nextBestActions.map((rec) => <NbaRecommendationCard key={rec.offer} rec={rec} />)}
          <PitchScriptCard guest={guest} />
          <GuestTimeline guest={guest} />
        </div>
        <WalletOrbit guest={guest} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Cross-link Segments to guest board**

In `src/app/segments/page.tsx`, add this link inside the existing "Close the loop" panel next to the corridor link:

```tsx
<Link
  href={`/guests?segment=${encodeURIComponent(activeSegment?.id ?? '')}`}
  className="inline-flex rounded-md border border-galaxy-gold/50 px-4 py-2 text-sm font-semibold text-galaxy-gold hover:bg-galaxy-gold/10"
>
  See guests in this segment
</Link>
```

Update `src/app/segments/page.test.tsx`:

```tsx
expect(screen.getByRole('link', { name: /See guests in this segment/i })).toHaveAttribute('href', expect.stringMatching(/^\/guests\?segment=/));
```

- [ ] **Step 7: Run focused route tests and commit**

Run:

```bash
npm run test -- src/app/guests/[id]/page.test.tsx src/components/panels/fusion-panel.test.tsx src/app/segments/page.test.tsx
npm run lint
```

Expected: focused tests pass; lint exits 0.

Commit:

```bash
git add src/components/panels/guest-profile-header.tsx src/components/panels/guest-profile-header.test.tsx src/components/panels/fusion-panel.tsx src/components/panels/fusion-panel.test.tsx src/components/panels/nba-recommendation-card.tsx src/components/panels/nba-recommendation-card.test.tsx src/components/panels/pitch-script-card.tsx src/components/panels/pitch-script-card.test.tsx src/components/panels/guest-timeline.tsx src/components/panels/guest-timeline.test.tsx src/app/guests/[id]/page.tsx src/app/guests/[id]/page.test.tsx src/app/segments/page.tsx src/app/segments/page.test.tsx
git commit -m "Add Customer 360 guest profiles"
```

---

### Task 7: Compliance, Responsive E2E, And Demo Script

**Files:**
- Modify: `e2e/compliance.spec.ts`
- Modify: `README.md`

- [ ] **Step 1: Add e2e checks for v2 routes**

Modify the `routes` array in `e2e/compliance.spec.ts`:

```ts
const routes = ['/', '/wallet', '/segments', '/guests', '/guests/MEM-••••3421', '/leakage', '/propensity', '/activation', '/marketscan', '/corridors', '/corridors/korea', '/acquisition'];
```

Add inside the route loop:

```ts
if (route === '/guests') {
  await expect(page.getByRole('heading', { name: /Priority Lead Board/i })).toBeVisible();
  await expect(page.getByRole('figure', { name: /Priority quadrant/i })).toBeVisible();
  await expect(page.getByText(/masked synthetic demo records/i)).toBeVisible();
}

if (route.startsWith('/guests/')) {
  await expect(page.getByRole('heading', { name: /Customer 360/i })).toBeVisible();
  await expect(page.getByText('What Galaxy sees')).toBeVisible();
  await expect(page.getByText('What Mastercard CDE adds')).toBeVisible();
  await expect(page.getByText('Suggested pitch script')).toBeVisible();
}
```

Add this viewport test near the existing responsive checks:

```ts
for (const viewport of [
  { label: 'iPhone', width: 390, height: 844 },
  { label: 'iPad', width: 820, height: 1180 },
  { label: 'desktop', width: 1440, height: 900 },
]) {
  test(`Customer 360 routes remain CDE-safe and responsive on ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const route of ['/guests', '/guests/MEM-••••3421']) {
      await page.goto(route);
      await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
      expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);
    }
  });
}
```

- [ ] **Step 2: Add README demo script**

Append to `README.md`:

```md
## V2 Demo Script

1. Wow open: "This is your guest base as a living constellation. Every star is a guest or segment, and the brightest points are the largest untapped opportunities."
2. Lead Board: "The platform tells a host who to pitch next, ranked by Galaxy first-party value, Mastercard CDE opportunity, propensity and engagement."
3. Open a 360: "Left is what Galaxy already knows. Right is what Mastercard CDE adds. The centre is the fused opportunity and Lead Score."
4. Recommendation and pitch: "The offer, channel, confidence and bilingual pitch are templated from local demo data. There is no live LLM call or client API key."
5. Close the loop: "From who are my guests to who should I call today and what should I say: Galaxy data plus Mastercard CDE, made actionable."
```

- [ ] **Step 3: Run e2e and full verification**

Run:

```bash
npm run test:e2e
npm run verify
```

Expected: e2e passes in chromium and mobile-safari projects; `npm run verify` passes lint, unit tests, build, and 46+ Playwright tests.

- [ ] **Step 4: Commit final hardening**

```bash
git add e2e/compliance.spec.ts README.md
git commit -m "Add v2 guest demo acceptance checks"
```

---

## Self-Review Checklist

Spec coverage:

- Visual elevation: Task 1 adds motion-safe count-up, constellation canvas, glass panels. Task 2 adds bento Overview and wallet constellation.
- Customer 360 and Lead Board: Task 3 adds deterministic guest data and computed lead scores. Task 5 adds `/guests`. Task 6 adds `/guests/[id]`.
- Data fusion narrative: Task 5 route intro and Task 6 fusion panel use the exact Galaxy first-party plus Mastercard CDE framing.
- Compliance: Task 3 data tests and Task 7 e2e enforce masked IDs and banned currency avoidance.
- Responsiveness: Task 7 viewport checks cover `/guests` and `/guests/[id]`.
- No backend and no live LLM: Task 3 templated generator and Task 7 README script state local deterministic behavior.

Placeholder scan:

- No banned placeholder markers or undefined component names are used in the implementation steps.
- Every new component referenced by a route is created in an earlier step or the same task.

Type consistency:

- `Guest`, `GalaxyTier`, `NbaRec`, `GuestCategory`, and `NbaChannel` are defined in Task 3 and reused consistently in Tasks 4-6.
- Routes use `/guests` and `/guests/[id]`; nav and e2e use the same path strings.
- CDE category keys use existing `CoreCategory`: `hospitality`, `fnb`, `entertainment`, `retailLuxury`.
