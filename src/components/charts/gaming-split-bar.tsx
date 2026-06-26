import type { Corridor } from '@/data';
import { PercentValue } from '@/components/ui/formatted-values';
import { InsightTooltip } from '@/components/ui/insight-tooltip';
import { clampPct } from './utils';

export function GamingSplitBar({ corridor }: { corridor: Corridor }) {
  const gamingWidth = clampPct(corridor.gamingSharePct);
  const nonGamingWidth = clampPct(corridor.nonGamingSharePct);

  return (
    <div>
      <InsightTooltip
        block
        title={`${corridor.name} gaming/non-gaming mix`}
        lines={[
          'Metric meaning: gaming versus non-gaming share for the corridor.',
          'Action hint: use non-gaming weight to shape acquisition bundles.',
          'Aggregate CDE signal, no PII.',
        ]}
      >
        <div
          role="img"
          aria-label={`${corridor.name} gaming split`}
          className="flex h-3 overflow-hidden rounded-full bg-galaxy-ink"
        >
          <span className="bg-galaxy-gold" style={{ width: `${gamingWidth}%` }} />
          <span className="bg-galaxy-slate" style={{ width: `${nonGamingWidth}%` }} />
        </div>
      </InsightTooltip>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-galaxy-muted">
        <span aria-label={`Gaming ${corridor.gamingSharePct}%`} className="inline-flex items-center gap-1">
          <span>Gaming </span>
          <PercentValue value={corridor.gamingSharePct} />
        </span>
        <span aria-label={`Non-gaming ${corridor.nonGamingSharePct}%`} className="inline-flex items-center gap-1">
          <span>Non-gaming </span>
          <PercentValue value={corridor.nonGamingSharePct} />
        </span>
      </div>
    </div>
  );
}
