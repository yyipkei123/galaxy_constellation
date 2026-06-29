import type { Corridor } from '@/data';
import { InsightTooltip } from '@/components/ui/insight-tooltip';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function heatClass(value: number) {
  if (value >= 132) return 'bg-galaxy-gold text-galaxy-ink';
  if (value >= 118) return 'bg-galaxy-gold/35 text-galaxy-cream';
  if (value >= 104) return 'bg-galaxy-gold/15 text-galaxy-cream';
  return 'bg-galaxy-ink text-galaxy-muted';
}

export function SeasonalityHeatmap({ corridors, showNotes = true }: { corridors: Corridor[]; showNotes?: boolean }) {
  return (
    <div className="min-w-0 max-w-full">
      <p className="mb-3 text-xs leading-5 text-galaxy-muted">
        Travel intensity index by month; 100 = this corridor monthly baseline.
      </p>
      <div className="max-w-full overflow-x-auto">
        <table
          role="table"
          aria-label="Corridor seasonality heatmap"
          className="w-full min-w-[52rem] text-left text-xs"
        >
          <thead className="uppercase tracking-[0.16em] text-galaxy-muted">
            <tr>
              <th scope="col" className="py-2 pr-3">Corridor</th>
              {months.map((month) => (
                <th key={month} scope="col" className="px-2 py-2">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-galaxy-border">
            {corridors.map((corridor) => (
              <tr key={corridor.id}>
                <th scope="row" className="py-2 pr-3 text-galaxy-cream">{corridor.name}</th>
                {corridor.seasonality.map((value, index) => (
                  <td
                    key={months[index]}
                    aria-label={`${corridor.name} ${months[index]} travel intensity index ${value} vs this corridor monthly baseline 100`}
                    className="px-1 py-1"
                  >
                    <InsightTooltip
                      block
                      title={`${corridor.name} ${months[index]} timing signal`}
                      triggerClassName={`block rounded px-2 py-2 text-center font-mono ${heatClass(value)}`}
                      lines={[
                        'Metric meaning: monthly travel intensity compared with this corridor baseline 100.',
                        'Action hint: align campaign timing to high-intensity months.',
                        'Aggregate CDE signal, no PII.',
                      ]}
                    >
                      {value}
                    </InsightTooltip>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showNotes ? (
        <div className="mt-4 grid gap-3 text-sm leading-6 text-galaxy-muted md:grid-cols-3">
          <p>Japan peaks around festival periods in Mar-Apr and Oct-Nov.</p>
          <p>Southeast Asia clusters on long weekends and short holidays.</p>
          <p>Hong Kong volume softening is visible from 2020 to 2024.</p>
        </div>
      ) : null}
    </div>
  );
}
