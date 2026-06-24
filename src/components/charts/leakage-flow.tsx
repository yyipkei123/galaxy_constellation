import type { Segment } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';
import { formatEnriched } from '@/lib/format';
import { clampPct } from './utils';

export function LeakageFlow({ segment }: { segment: Segment }) {
  const branches = [
    { label: 'Competitor hospitality', value: clampPct(segment.categories.hospitality.leakagePct) },
    { label: 'Off-property luxury retail', value: clampPct(segment.categories.retailLuxury.leakagePct) },
    { label: 'Off-property F&B', value: clampPct(segment.categories.fnb.leakagePct) },
    { label: 'Off-property entertainment', value: clampPct(segment.categories.entertainment.leakagePct) },
  ];
  const captured = clampPct(segment.metrics.shareOfWallet);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-galaxy-muted">Guest wallet split</span>
        <CdeChip />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-galaxy-border bg-galaxy-slate p-4">
          <p className="text-sm text-galaxy-muted">Captured by Galaxy</p>
          <p className="mt-3 font-serif text-4xl text-galaxy-gold">
            {formatEnriched(captured, 'pct')}
          </p>
        </div>
        <div className="space-y-3">
          {branches.map((branch) => (
            <div key={branch.label} className="rounded-xl border border-galaxy-border bg-galaxy-slate p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-galaxy-cream">{branch.label}</span>
                <span className="text-galaxy-leak">{formatEnriched(branch.value, 'pct')}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-galaxy-market">
                <div
                  className="h-2 rounded-full bg-galaxy-leak"
                  style={{ width: `${branch.value}%` }}
                  aria-label={`${branch.label} leakage ${branch.value}%`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
