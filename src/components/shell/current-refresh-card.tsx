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
