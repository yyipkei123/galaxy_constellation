import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}

export function KpiCard({ label, value, detail }: KpiCardProps) {
  return (
    <article className="galaxy-kpi-card min-h-[152px] p-[18px]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">{label}</p>
      <div className="mt-[18px] font-serif text-[clamp(2.5rem,4vw,3.875rem)] font-semibold leading-[0.9] tracking-normal text-galaxy-cream">
        {value}
      </div>
      {detail ? <div className="mt-3 text-[13px] leading-6 text-galaxy-muted">{detail}</div> : null}
    </article>
  );
}
