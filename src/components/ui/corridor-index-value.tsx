import { CdeChip } from './cde-chip';

export function CorridorIndexValue({ label, value }: { label: string; value: number }) {
  if (!Number.isFinite(value)) {
    throw new Error('Corridor index values must be finite');
  }

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span>{label} index {Math.round(value)}</span>
      <CdeChip />
    </span>
  );
}

export function CorridorIndexBaseline({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs leading-5 text-galaxy-muted ${className}`}>
      100 = Mastercard corridor baseline; above 100 signals stronger relative intensity.
    </p>
  );
}
