import type { ReactNode } from 'react';
import clsx from 'clsx';

interface MetricTileProps {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  className?: string;
}

export function MetricTile({ label, value, detail, className }: MetricTileProps) {
  return (
    <article className={clsx('galaxy-tile p-4', className)}>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-galaxy-muted">{label}</p>
      <div className="mt-3 font-mono text-2xl font-semibold tabular-nums text-galaxy-cream md:text-3xl">
        {value}
      </div>
      {detail ? <div className="mt-3 text-sm leading-6 text-galaxy-muted">{detail}</div> : null}
    </article>
  );
}
