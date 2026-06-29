import { IndexSignalLegend } from '@/components/ui/formatted-values';

export function OpportunitySnapshot() {
  return (
    <section
      aria-label="Opportunity snapshot"
      className="galaxy-glass-panel grid gap-5 rounded-[20px] border border-galaxy-gold/20 p-[clamp(18px,2.4vw,28px)] xl:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] xl:items-start"
    >
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
          Opportunity snapshot
        </div>
        <h2 className="mt-2 max-w-[24ch] font-serif text-[clamp(1.875rem,3vw,2.75rem)] font-semibold leading-tight text-galaxy-cream">
          Read every CDE index from the same baseline.
        </h2>
        <p className="mt-3 max-w-[68ch] text-sm leading-6 text-galaxy-muted">
          Current segment recapture headroom remains indexed and banded for CDE compliance. The index compares each
          segment with the matched Galaxy x Mastercard CDE cohort, where 100 is the baseline.
        </p>
      </div>
      <div className="min-w-0">
        <IndexSignalLegend />
      </div>
    </section>
  );
}
