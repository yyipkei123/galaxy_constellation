import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue } from '@/components/ui/formatted-values';
import type { Segment } from '@/data';
import { buildLeakageDrivers } from '@/lib/insights';

function widthFor(score: number, maxScore: number) {
  if (maxScore <= 0) return 0;
  return Math.max(6, Math.round((score / maxScore) * 100));
}

export function OpportunityLadder({ segment }: { segment: Segment }) {
  const drivers = buildLeakageDrivers(segment);
  const maxScore = Math.max(...drivers.map((driver) => driver.score), 0);

  return (
    <div className="space-y-4" aria-label={`${segment.name} opportunity ladder`}>
      {drivers.map((driver, index) => (
        <div key={driver.category} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                Driver {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold text-galaxy-cream">{driver.label}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-galaxy-muted">
              {Math.round(driver.leakagePct)}% leakage
              <CdeChip />
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-galaxy-market">
            <div
              className="h-full rounded-full bg-galaxy-leak"
              style={{ width: `${widthFor(driver.score, maxScore)}%` }}
              aria-label={`${driver.label} opportunity score ${Math.round(driver.score)}`}
            />
          </div>
          <p className="mt-2 text-xs text-galaxy-muted">
            Wallet intensity <IndexValue value={driver.walletIndex} label="CDE wallet intensity" />
          </p>
        </div>
      ))}
    </div>
  );
}
