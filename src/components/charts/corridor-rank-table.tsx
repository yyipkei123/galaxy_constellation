import Link from 'next/link';
import type { ReactNode } from 'react';
import { GamingSplitBar } from '@/components/charts/gaming-split-bar';
import { CorridorIndexBaseline, CorridorIndexValue } from '@/components/ui/corridor-index-value';
import { PercentValue } from '@/components/ui/formatted-values';
import { InsightTooltip } from '@/components/ui/insight-tooltip';
import type { Corridor, CorridorMetric, CorridorYear } from '@/data';
import { koreaRefreshTag } from '@/data';

const aggregateNote = 'Aggregate CDE signal, no PII.';

const metricTooltips: Record<CorridorMetric, { title: string; lines: string[] }> = {
  arrivals: {
    title: 'Arrival demand index',
    lines: [
      'Metric meaning: arrival demand compares Mastercard CDE corridor arrivals signal against baseline 100.',
      'Action hint: use high arrival demand to size corridor reach and media weight.',
      aggregateNote,
    ],
  },
  spend: {
    title: 'Spend intensity index',
    lines: [
      'Metric meaning: spend intensity compares Mastercard CDE corridor spend signal against baseline 100.',
      'Action hint: prioritize high-spend corridors for acquisition offers.',
      aggregateNote,
    ],
  },
  txnFrequency: {
    title: 'Visit frequency index',
    lines: [
      'Metric meaning: visit frequency compares same-card activity against baseline 100.',
      'Action hint: use stronger frequency to tune retargeting cadence.',
      aggregateNote,
    ],
  },
  gamingSplit: {
    title: 'Non-gaming share',
    lines: [
      'Metric meaning: non-gaming share shows the corridor mix available for hotel, dining, entertainment, and retail bundles.',
      'Action hint: use high non-gaming share to lead with lifestyle creative.',
      aggregateNote,
    ],
  },
};

function MetricTooltip({
  metric,
  children,
}: {
  metric: CorridorMetric;
  children: ReactNode;
}) {
  const tooltip = metricTooltips[metric];

  return (
    <InsightTooltip title={tooltip.title} lines={tooltip.lines}>
      {children}
    </InsightTooltip>
  );
}

function selectedMetricValue(corridor: Corridor, year: CorridorYear, metric: CorridorMetric) {
  switch (metric) {
    case 'arrivals':
      return (
        <MetricTooltip metric="arrivals">
          <CorridorIndexValue label="Selected arrival signal" value={corridor.arrivalsIndex[year]} />
        </MetricTooltip>
      );
    case 'spend':
      return (
        <MetricTooltip metric="spend">
          <CorridorIndexValue label="Selected spend signal" value={corridor.spendIndex[year]} />
        </MetricTooltip>
      );
    case 'txnFrequency':
      return (
        <MetricTooltip metric="txnFrequency">
          <CorridorIndexValue label="Selected visit signal" value={corridor.txnFrequencyIndex} />
        </MetricTooltip>
      );
    case 'gamingSplit':
      return (
        <MetricTooltip metric="gamingSplit">
          <PercentValue value={corridor.nonGamingSharePct} />
        </MetricTooltip>
      );
    default: {
      const exhaustiveMetric: never = metric;
      return exhaustiveMetric;
    }
  }
}

export function CorridorRankTable({
  corridors,
  year,
  metric,
}: {
  corridors: Corridor[];
  year: CorridorYear;
  metric: CorridorMetric;
}) {
  return (
    <div>
      <CorridorIndexBaseline className="mb-3" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <caption className="sr-only">Inbound corridor ranking</caption>
          <thead className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">
            <tr>
              <th scope="col" className="py-3 pr-4">Rank</th>
              <th scope="col" className="py-3 pr-4">Corridor</th>
              <th scope="col" className="py-3 pr-4">Selected metric</th>
              <th scope="col" className="py-3 pr-4">Arrival demand</th>
              <th scope="col" className="py-3 pr-4">Spend intensity</th>
              <th scope="col" className="py-3 pr-4">Visit frequency</th>
              <th scope="col" className="py-3 pr-4">Avg ticket</th>
              <th scope="col" className="py-3">Split</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-galaxy-border">
            {corridors.map((corridor) => {
              const tag = koreaRefreshTag(corridor);
              return (
                <tr key={corridor.id} className="align-top" aria-label={`#${corridor.priorityRank} ${corridor.name}`}>
                  <td className="py-4 pr-4 font-mono text-galaxy-gold">#{corridor.priorityRank}</td>
                  <th scope="row" className="py-4 pr-4 text-left font-normal">
                    <Link
                      className="font-semibold text-galaxy-cream hover:text-galaxy-gold"
                      href={`/corridors/${corridor.id}`}
                    >
                      {corridor.name}
                    </Link>
                    <p className="mt-1 text-xs text-galaxy-muted">
                      {corridor.nameZh} · {corridor.haul}-haul
                    </p>
                    {tag ? <p className="mt-2 text-xs font-semibold text-galaxy-gold">{tag}</p> : null}
                  </th>
                  <td className="py-4 pr-4">
                    {selectedMetricValue(corridor, year, metric)}
                  </td>
                  <td className="py-4 pr-4">
                    <MetricTooltip metric="arrivals">
                      <CorridorIndexValue label="Arrival demand" value={corridor.arrivalsIndex[year]} />
                    </MetricTooltip>
                  </td>
                  <td className="py-4 pr-4">
                    <MetricTooltip metric="spend">
                      <CorridorIndexValue label="Spend intensity" value={corridor.spendIndex[year]} />
                    </MetricTooltip>
                  </td>
                  <td className="py-4 pr-4">
                    <MetricTooltip metric="txnFrequency">
                      <CorridorIndexValue label="Visit frequency" value={corridor.txnFrequencyIndex} />
                    </MetricTooltip>
                  </td>
                  <td className="py-4 pr-4 capitalize">{corridor.avgTicketBand}</td>
                  <td className="py-4">
                    <GamingSplitBar corridor={corridor} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
