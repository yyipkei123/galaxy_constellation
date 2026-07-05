'use client';

import { useAppState } from '@/store/app-store';

export function CurrentRefreshCard() {
  const { methodology, selectedQuarter } = useAppState();

  return (
    <div
      aria-label="Current CDE refresh"
      className="rounded-[14px] border border-[rgba(212,175,94,0.18)] bg-[rgba(255,255,255,0.025)] p-4"
    >
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#6A6478]">
        Current refresh
      </div>
      <div className="mt-2 font-serif text-[23px] font-semibold leading-none text-galaxy-cream">
        {selectedQuarter.label}
      </div>
      <div className="mt-3 text-[12px] font-semibold text-[#8B8598]">
        coverage {methodology.matchedCoveragePct}%
      </div>
    </div>
  );
}
