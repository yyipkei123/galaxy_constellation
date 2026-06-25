import Link from 'next/link';
import { GamingSplitBar } from '@/components/charts/gaming-split-bar';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import type { Corridor, CorridorMetric, CorridorYear } from '@/data';
import { koreaRefreshTag } from '@/data';

function selectedMetricValue(corridor: Corridor, year: CorridorYear, metric: CorridorMetric) {
  switch (metric) {
    case 'arrivals':
      return <IndexValue value={corridor.arrivalsIndex[year]} />;
    case 'spend':
      return <IndexValue value={corridor.spendIndex[year]} />;
    case 'txnFrequency':
      return <IndexValue value={corridor.txnFrequencyIndex} />;
    case 'gamingSplit':
      return <PercentValue value={corridor.nonGamingSharePct} />;
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[54rem] text-left text-sm">
        <caption className="sr-only">Inbound corridor ranking</caption>
        <thead className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">
          <tr>
            <th scope="col" className="py-3 pr-4">Rank</th>
            <th scope="col" className="py-3 pr-4">Corridor</th>
            <th scope="col" className="py-3 pr-4">Selected metric</th>
            <th scope="col" className="py-3 pr-4">Arrivals</th>
            <th scope="col" className="py-3 pr-4">Spend</th>
            <th scope="col" className="py-3 pr-4">Txn frequency</th>
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
                  <IndexValue value={corridor.arrivalsIndex[year]} />
                </td>
                <td className="py-4 pr-4">
                  <IndexValue value={corridor.spendIndex[year]} />
                </td>
                <td className="py-4 pr-4">
                  <IndexValue value={corridor.txnFrequencyIndex} />
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
  );
}
