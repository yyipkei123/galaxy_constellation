import type { Quarter, Segment } from '@/data';
import { buildBoardroomBrief } from './open-design-view-model';

interface BoardroomBriefProps {
  quarter?: Quarter | null;
  segment?: Segment;
}

export function BoardroomBrief({ quarter, segment }: BoardroomBriefProps) {
  const brief = buildBoardroomBrief(quarter, segment);

  return (
    <section
      aria-label="Boardroom answer"
      className="galaxy-glass-panel grid gap-6 rounded-[20px] border border-galaxy-gold/20 p-[clamp(18px,2.4vw,28px)] xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
    >
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">
          Boardroom answer
        </div>
        <h2 className="mt-2 max-w-[15ch] font-serif text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-normal text-galaxy-cream">
          {brief.headline}
        </h2>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-7 text-galaxy-muted">{brief.description}</p>
      </div>
      <div className="grid border-y border-white/10 md:grid-cols-3">
        <article className="grid min-h-[188px] content-between gap-4 border-b border-white/10 p-[18px] md:border-b-0 md:border-r">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">Audience</span>
          <div>
            <b className="block text-[clamp(1.25rem,2vw,1.75rem)] leading-tight text-galaxy-cream">
              {brief.audience}
            </b>
            <small className="mt-2 block text-xs leading-5 text-galaxy-muted">
              Cohort range stays banded so the readout remains governed and activation-ready.
            </small>
          </div>
        </article>
        <article className="grid min-h-[188px] content-between gap-4 border-b border-white/10 p-[18px] md:border-b-0 md:border-r">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">Proof</span>
          <div>
            <b className="block text-[clamp(1.25rem,2vw,1.75rem)] leading-tight text-galaxy-cream">
              {brief.proof}
            </b>
            <small className="mt-2 block text-xs leading-5 text-galaxy-muted">
              {brief.body}
            </small>
          </div>
        </article>
        <article className="grid min-h-[188px] content-between gap-4 p-[18px]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">Move</span>
          <div>
            <b className="block text-[clamp(1.25rem,2vw,1.75rem)] leading-tight text-galaxy-cream">
              {brief.move}
            </b>
            <small className="mt-2 block text-xs leading-5 text-galaxy-muted">
              {brief.action} becomes the next campaign handoff.
            </small>
          </div>
        </article>
      </div>
    </section>
  );
}
