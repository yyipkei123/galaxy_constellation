import type { CSSProperties } from 'react';
import type { Methodology, Quarter } from '@/data';

interface DashboardHeroProps {
  methodology?: Methodology | null;
  quarter?: Quarter | null;
}

const unsafeDisplayCopyPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|NaN|Infinity|raw[-\s]?spend|exact\s+spend/i;

function finiteNumber(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeQuarterLabel(value: unknown): string {
  const label = typeof value === 'string' ? value.trim() : '';

  if (!label || unsafeDisplayCopyPattern.test(label)) return 'No active quarter';
  return label;
}

export function DashboardHero({ methodology, quarter }: DashboardHeroProps) {
  const coverage = clampPct(finiteNumber(methodology?.matchedCoveragePct));
  const activeMetricCount = Math.max(0, Math.round(finiteNumber(methodology?.activeMetricCount)));
  const coverageDegrees = Math.round((coverage / 100) * 360);
  const quarterLabel = safeQuarterLabel(quarter?.label);
  const ringStyle = {
    background: `conic-gradient(var(--galaxy-accent) 0deg ${coverageDegrees}deg, rgba(255,255,255,0.07) ${coverageDegrees}deg 360deg)`,
  } satisfies CSSProperties;

  return (
    <section
      aria-label="Guest wallet intelligence hero"
      className="grid gap-[18px] lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"
    >
      <div className="galaxy-glass-panel min-h-[382px] rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_80%_22%,rgba(214,179,95,0.08),transparent_27rem),linear-gradient(135deg,rgba(23,21,16,0.68),rgba(9,8,7,0.62))] p-[clamp(26px,4vw,46px)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
          Guest wallet intelligence
        </div>
        <h2 className="mt-[18px] max-w-[760px] font-serif text-[clamp(3rem,7vw,7rem)] font-semibold leading-[0.94] tracking-normal text-galaxy-cream">
          Find the wallet gap Galaxy can win next.
        </h2>
        <p className="mt-6 max-w-[68ch] text-[clamp(1rem,1.4vw,1.1875rem)] leading-8 text-galaxy-muted">
          Galaxy already knows stay, dining, and rewards behavior. Mastercard CDE adds modelled off-property wallet,
          leakage, and propensity so each quarter starts with a clear pitch priority.
        </p>
        <div className="mt-[34px] grid max-w-[760px] gap-3 md:grid-cols-3" aria-label="Methodology proof points">
          <div className="rounded-2xl border border-white/10 bg-galaxy-ink/50 p-[15px]">
            <b className="block font-mono text-2xl text-galaxy-cream">{coverage}%</b>
            <span className="mt-2 block text-xs leading-5 text-galaxy-muted">
              Matched CDE coverage across active wallet cohorts.
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-galaxy-ink/50 p-[15px]">
            <b className="block font-mono text-2xl text-galaxy-cream">{activeMetricCount}</b>
            <span className="mt-2 block text-xs leading-5 text-galaxy-muted">
              Active CDE metrics used by the ranked findings.
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-galaxy-ink/50 p-[15px]">
            <b className="block font-mono text-2xl text-galaxy-cream">Quarterly</b>
            <span className="mt-2 block text-xs leading-5 text-galaxy-muted">
              Refresh rhythm for segment planning and campaign readout.
            </span>
          </div>
        </div>
      </div>

      <aside
        aria-label="Mastercard CDE refresh"
        className="galaxy-glass-panel grid rounded-[20px] border border-white/10 p-[22px]"
      >
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
            Mastercard CDE refresh
          </div>
          <h2 className="mt-2.5 font-serif text-4xl font-semibold leading-tight text-galaxy-cream">
            {quarterLabel} snapshot
          </h2>
          <p className="mt-3 text-sm leading-7 text-galaxy-muted">
            Demi-decile average, matched coverage, and modelled estimates expressed as ranges, indices, and
            percentages.
          </p>
        </div>
        <div
          aria-label={`${coverage} percent matched CDE coverage`}
          className="relative mx-auto mt-6 grid h-[190px] w-[190px] place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          style={ringStyle}
        >
          <div className="absolute inset-3 rounded-full border border-white/10 bg-galaxy-charcoal" />
          <div className="relative z-[1] text-center">
            <strong className="block font-serif text-[58px] font-semibold leading-none text-galaxy-cream">
              {coverage}
            </strong>
            <span className="mx-auto block max-w-[11ch] text-[11px] font-semibold uppercase leading-tight tracking-[0.08em] text-galaxy-muted">
              matched coverage
            </span>
          </div>
        </div>
      </aside>
    </section>
  );
}
