'use client';

import { useAppState } from '@/store/app-store';
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
          <span className="rounded-full border border-galaxy-border bg-galaxy-charcoal/70 px-2.5 py-1 text-xs font-semibold text-galaxy-muted">
            {quarters.find((quarter) => quarter.id === selectedQuarterId)?.label ?? 'Current quarter'} snapshot
          </span>
          <span className="rounded-full border border-galaxy-border bg-galaxy-charcoal/70 px-2.5 py-1 text-xs font-semibold text-galaxy-muted">
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
