import clsx from 'clsx';
import type { Methodology } from '@/data';

interface SnapshotStatusStripProps {
  quarterLabel: string;
  methodology: Methodology;
  context: string;
  className?: string;
}

export function SnapshotStatusStrip({
  quarterLabel,
  methodology,
  context,
  className,
}: SnapshotStatusStripProps) {
  const items = [
    `${quarterLabel} snapshot`,
    `${methodology.refresh[0].toUpperCase()}${methodology.refresh.slice(1)} refresh`,
    `${methodology.matchedCoveragePct}% matched coverage`,
    `${methodology.basis} basis`,
    context,
  ];

  return (
    <div
      aria-label="CDE snapshot status"
      className={clsx(
        'flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3 text-xs text-galaxy-muted',
        className,
      )}
    >
      {items.map((item, index) => (
        <span
          key={item}
          className={clsx(
            'rounded-full border px-2.5 py-1 font-semibold',
            index === 0
              ? 'border-galaxy-gold/50 bg-galaxy-gold/10 text-galaxy-gold'
              : 'border-galaxy-border bg-galaxy-charcoal/60 text-galaxy-muted',
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
