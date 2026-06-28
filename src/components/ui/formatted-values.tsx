import { formatEnriched } from '@/lib/format';
import { CdeChip } from './cde-chip';

interface EnrichedValueProps {
  value: string;
  ariaLabel?: string;
  title?: string;
  allowWrap?: boolean;
}

export interface IndexValueProps {
  value: number;
  label?: string;
  showSignal?: boolean;
}

export interface IndexSignalBand {
  range: string;
  label: string;
  description: string;
  className: string;
}

export const indexSignalBands: IndexSignalBand[] = [
  {
    range: '<90',
    label: 'Low signal',
    description: 'Below matched-cohort baseline',
    className: 'border-galaxy-border bg-galaxy-ink/65 text-galaxy-muted',
  },
  {
    range: '90-109',
    label: 'Near baseline',
    description: 'Close to cohort average',
    className: 'border-sky-400/40 bg-sky-400/10 text-sky-100',
  },
  {
    range: '110-129',
    label: 'Elevated opportunity',
    description: 'Above cohort baseline',
    className: 'border-galaxy-gold/50 bg-galaxy-gold/10 text-galaxy-gold',
  },
  {
    range: '130+',
    label: 'High recapture priority',
    description: 'Strongest action signal',
    className: 'border-galaxy-leak/55 bg-galaxy-leak/20 text-galaxy-cream',
  },
];

function EnrichedValue({ value, ariaLabel, title, allowWrap = false }: EnrichedValueProps) {
  return (
    <span
      aria-label={ariaLabel}
      title={title}
      className={allowWrap
        ? 'inline-flex max-w-full flex-wrap items-center gap-2 whitespace-normal'
        : 'inline-flex items-center gap-2 whitespace-nowrap'}
    >
      <span className={allowWrap ? 'min-w-0 max-w-full break-words' : undefined}>{value}</span>
      <CdeChip />
    </span>
  );
}

function roundedIndex(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function getIndexSignalBand(value: number): IndexSignalBand {
  const index = roundedIndex(value);

  if (index < 90) return indexSignalBands[0];
  if (index < 110) return indexSignalBands[1];
  if (index < 130) return indexSignalBands[2];
  return indexSignalBands[3];
}

function indexSignalTitle(label: string, value: number, signal: IndexSignalBand) {
  return [
    `${label} ${roundedIndex(value)}.`,
    `${signal.label}: ${signal.description}.`,
    'This is a Mastercard CDE relative index, not a customer count.',
    '100 is the matched-cohort baseline for Galaxy x Mastercard CDE.',
  ].join(' ');
}

export function PercentValue({ value }: { value: number }) {
  return <EnrichedValue value={formatEnriched(value, 'pct')} />;
}

export function IndexValue({ value, label = 'CDE index signal', showSignal = false }: IndexValueProps) {
  const index = roundedIndex(value);
  const signal = getIndexSignalBand(index);
  const displayValue = label === 'CDE index signal' ? formatEnriched(index, 'index') : `${label} ${index}`;
  const title = indexSignalTitle(label, index, signal);

  return (
    <span
      aria-label={title}
      title={title}
      className="inline-flex max-w-full flex-wrap items-center gap-2"
    >
      <EnrichedValue value={displayValue} allowWrap />
      {showSignal ? (
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${signal.className}`}>
          {signal.label}
        </span>
      ) : null}
    </span>
  );
}

export function BandValue({ value }: { value: string }) {
  return <EnrichedValue value={formatEnriched(value, 'band')} />;
}

export function IndexSignalLegend() {
  return (
    <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">CDE index legend</p>
      <p className="mt-2 text-sm leading-6 text-galaxy-muted">
        100 = matched-cohort baseline. Indices compare modelled CDE signals; they are not customer counts.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {indexSignalBands.map((band) => (
          <div key={band.range} className={`rounded-lg border px-3 py-2 ${band.className}`}>
            <p className="text-sm font-semibold">{band.range}</p>
            <p className="mt-1 text-xs font-semibold">{band.label}</p>
            <p className="mt-1 text-xs opacity-80">{band.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
