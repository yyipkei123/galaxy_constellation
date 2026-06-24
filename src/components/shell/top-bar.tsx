'use client';

import { useAppState } from '@/store/app-store';

export function TopBar() {
  const { methodology, quarters, selectedQuarterId, setSelectedQuarterId } = useAppState();

  return (
    <header className="flex flex-col gap-4 border-b border-galaxy-border bg-galaxy-ink/82 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
          {methodology.activeMetricCount} active CDE metrics
        </span>
        <span className="text-sm font-medium text-galaxy-cream">
          Matched coverage {methodology.matchedCoveragePct}%
        </span>
      </div>

      <label className="flex items-center gap-3 text-sm text-galaxy-muted">
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
