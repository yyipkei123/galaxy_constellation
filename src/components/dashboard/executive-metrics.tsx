import type { Methodology, Segment } from '@/data';
import { buildExecutiveMetrics } from './open-design-view-model';

interface ExecutiveMetricsProps {
  methodology?: Methodology | null;
  segments?: Segment[] | null;
}

export function ExecutiveMetrics({ methodology, segments }: ExecutiveMetricsProps) {
  const metrics = buildExecutiveMetrics(segments, methodology);

  return (
    <section aria-label="Executive summary" className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="galaxy-glass-panel min-h-[152px] rounded-[18px] border border-white/10 p-[18px]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">
            {metric.label}
          </div>
          <strong className="mt-[18px] block font-serif text-[clamp(2.5rem,4vw,3.875rem)] font-semibold leading-[0.9] tracking-normal text-galaxy-cream">
            {metric.value}
          </strong>
          <p className="mt-3.5 text-[13px] leading-5 text-galaxy-muted">{metric.detail}</p>
          <span className="mt-3.5 inline-flex min-h-[26px] items-center rounded-full border border-galaxy-positive/30 bg-galaxy-positive/10 px-2.5 font-mono text-[11px] font-semibold text-galaxy-positive">
            {metric.delta}
          </span>
        </article>
      ))}
    </section>
  );
}
