import { CdeChip } from '@/components/ui/cde-chip';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { CdeMetrics } from '@/data';
import { formatEnriched, type EnrichedFormatKind } from '@/lib/format';

interface MetricItem {
  label: string;
  value: number | undefined;
  kind: EnrichedFormatKind;
}

function finiteValue(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function CdeMetricPanel({ metrics }: { metrics: CdeMetrics }) {
  const metricItems: MetricItem[] = [
    { label: 'Share of Wallet', value: metrics.shareOfWallet, kind: 'pct' },
    { label: 'Share of Visits', value: metrics.shareOfVisits, kind: 'pct' },
    { label: 'Avg Transaction #', value: metrics.avgTxnCountIndex, kind: 'index' },
    { label: 'Avg Transaction Size', value: metrics.avgTxnSizeIndex, kind: 'index' },
    { label: 'Avg Industry Spend', value: metrics.avgIndustrySpendIndex, kind: 'index' },
    { label: 'Channel Share', value: metrics.channelShareOnlinePct, kind: 'pct' },
    { label: 'Channel Visits #', value: metrics.channelVisitsIndex, kind: 'index' },
  ];

  return (
    <Panel>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Overline>Customer 360 metrics</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">7 active CDE metrics</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-galaxy-muted">
          Metrics are modelled segment enrichments and expose indexed or percentage values only.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {metricItems.map((item) => (
          <div key={item.label} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-galaxy-cream">{item.label}</p>
              <CdeChip />
            </div>
            <p className="mt-3 text-2xl font-semibold text-galaxy-gold">
              {formatEnriched(finiteValue(item.value), item.kind)}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
