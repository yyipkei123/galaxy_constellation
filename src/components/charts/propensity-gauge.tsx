import { CdeChip } from '@/components/ui/cde-chip';
import { formatPropensity } from '@/lib/format';
import { clampPct } from './utils';

export function PropensityGauge({ label, value }: { label: string; value: number }) {
  const pct = clampPct(value * 100);
  const score = pct / 100;

  return (
    <div className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-galaxy-cream">{label}</p>
        <CdeChip />
      </div>
      <div className="mt-5 flex items-end gap-3">
        <div className="font-serif text-4xl text-galaxy-gold">{formatPropensity(score)}</div>
        <div className="mb-2 text-xs text-galaxy-muted">{pct}th percentile signal</div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-galaxy-market">
        <div
          className="h-2 rounded-full bg-galaxy-positive"
          style={{ width: `${pct}%` }}
          aria-label={`${label} propensity: ${pct}th percentile signal`}
        />
      </div>
    </div>
  );
}
