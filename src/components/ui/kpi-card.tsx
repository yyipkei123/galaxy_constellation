import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}

export function KpiCard({ label, value, detail }: KpiCardProps) {
  return (
    <article className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/82 p-5 shadow-2xl shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-galaxy-muted">{label}</p>
      <div className="mt-3 text-3xl font-semibold text-galaxy-cream">{value}</div>
      {detail ? <div className="mt-3 text-sm leading-6 text-galaxy-muted">{detail}</div> : null}
    </article>
  );
}
