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
      role="group"
      aria-label="CDE snapshot status"
      className={clsx(
        'galaxy-tile flex max-w-full flex-wrap items-center gap-2 p-3 text-xs text-galaxy-muted',
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
              : 'border-galaxy-gold/20 bg-white/[0.025] text-galaxy-muted',
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
