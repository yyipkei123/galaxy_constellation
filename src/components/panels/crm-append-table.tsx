import { CdeChip } from '@/components/ui/cde-chip';
import { formatEnriched, formatPropensity } from '@/lib/format';
import type { CrmRow } from '@/data';

function finiteValue(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function cdeBand(value: string | undefined) {
  if (!value || /HKD|MOP|\$/i.test(value) || !value.includes('equiv.')) {
    return 'Indexed band equiv./mo';
  }

  return formatEnriched(value, 'band');
}

export function CrmAppendTable({ rows }: { rows: CrmRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-galaxy-border">
      <table aria-label="append-to-CRM table" className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <caption className="bg-galaxy-ink/45 px-4 py-3 text-left font-serif text-2xl text-galaxy-cream">
          Append-to-CRM
        </caption>
        <thead className="bg-galaxy-charcoal text-xs uppercase tracking-[0.16em] text-galaxy-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Masked Customer ID</th>
            <th scope="col" className="px-4 py-3 font-semibold">Category Share</th>
            <th scope="col" className="px-4 py-3 font-semibold">Spend-with-competitors</th>
            <th scope="col" className="px-4 py-3 font-semibold">Luxury-retail index</th>
            <th scope="col" className="px-4 py-3 font-semibold">Propensity score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-galaxy-border bg-galaxy-ink/25">
          {rows.map((row) => (
            <tr key={row.customerId}>
              <th scope="row" className="px-4 py-3 font-semibold text-galaxy-cream">{row.customerId}</th>
              <td className="px-4 py-3 text-galaxy-gold">
                <span className="inline-flex items-center gap-2">
                  {formatEnriched(finiteValue(row.categorySharePct), 'pct')}
                  <CdeChip />
                </span>
              </td>
              <td className="px-4 py-3 text-galaxy-muted">
                <span className="inline-flex items-center gap-2">
                  {cdeBand(row.competitorSpendBand)}
                  <CdeChip />
                </span>
              </td>
              <td className="px-4 py-3 text-galaxy-gold">
                <span className="inline-flex items-center gap-2">
                  {formatEnriched(finiteValue(row.luxuryRetailIndex), 'index')}
                  <CdeChip />
                </span>
              </td>
              <td className="px-4 py-3 text-galaxy-gold">
                <span className="inline-flex items-center gap-2">
                  {formatPropensity(finiteValue(row.propensityScore))}
                  <CdeChip />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
