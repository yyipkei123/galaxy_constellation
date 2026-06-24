import { formatEnriched } from '@/lib/format';
import { CdeChip } from './cde-chip';

function EnrichedValue({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span>{value}</span>
      <CdeChip />
    </span>
  );
}

export function PercentValue({ value }: { value: number }) {
  return <EnrichedValue value={formatEnriched(value, 'pct')} />;
}

export function IndexValue({ value }: { value: number }) {
  return <EnrichedValue value={formatEnriched(value, 'index')} />;
}

export function BandValue({ value }: { value: string }) {
  return <EnrichedValue value={formatEnriched(value, 'band')} />;
}
