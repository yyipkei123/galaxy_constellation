'use client';

import { useState } from 'react';
import type { Methodology, Quarter, Segment } from '@/data';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';

interface BoardroomSummaryCardProps {
  quarter: Quarter;
  segment: Segment;
  methodology: Methodology;
}

const DATA_RULE = 'Data rule: actionable, not identifiable. Uses aggregate, indexed CDE signals only.';

function opportunitySignal(segment: Segment) {
  return Number.isFinite(segment.opportunityIndex) ? Math.round(segment.opportunityIndex) : 0;
}

function recommendedAction(segment: Segment) {
  const primaryPlay = segment.recommendedPlays[0]?.title ?? 'governed activation plan';

  return `Recommended action: Prioritize ${segment.name} with ${primaryPlay} as the next client-ready activation brief.`;
}

function buildBoardroomSummaryCopy({
  quarter,
  segment,
  methodology,
}: BoardroomSummaryCardProps) {
  return [
    'Galaxy Constellation boardroom summary',
    `Quarter: ${quarter.label}`,
    `Coverage: ${methodology.matchedCoveragePct}% matched coverage`,
    `Segment: ${segment.name}`,
    `Opportunity: CDE opportunity signal ${opportunitySignal(segment)}`,
    recommendedAction(segment),
    DATA_RULE,
  ].join('\n');
}

export function BoardroomSummaryCard({ quarter, segment, methodology }: BoardroomSummaryCardProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const opportunity = opportunitySignal(segment);
  const action = recommendedAction(segment);

  async function copyBoardroomSummary() {
    const clipboard = navigator.clipboard;

    if (!clipboard?.writeText) {
      setCopyStatus('Copy unavailable in this preview');
      return;
    }

    try {
      await clipboard.writeText(buildBoardroomSummaryCopy({ quarter, segment, methodology }));
      setCopyStatus('Boardroom summary copied');
    } catch {
      setCopyStatus('Copy unavailable in this preview');
    }
  }

  return (
    <section aria-label="Client boardroom summary">
      <Panel
        variant="glass"
        className="grid gap-5 p-[clamp(18px,2.2vw,26px)]"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[68ch]">
            <Overline>Client boardroom summary</Overline>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-galaxy-cream">
              {quarter.label}: {segment.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{DATA_RULE}</p>
          </div>
          <button
            type="button"
            onClick={copyBoardroomSummary}
            className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-white/10 bg-galaxy-ink/45 px-4 text-[13px] font-semibold tracking-normal text-galaxy-cream transition hover:border-galaxy-gold/40 hover:text-galaxy-gold active:translate-y-px"
          >
            Copy boardroom summary
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-galaxy-ink/35 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">
              Matched coverage
            </p>
            <p className="mt-2 text-2xl font-semibold text-galaxy-gold">
              <PercentValue value={methodology.matchedCoveragePct} />
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-galaxy-ink/35 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">
              Priority segment
            </p>
            <p className="mt-2 text-xl font-semibold leading-tight text-galaxy-cream">
              {segment.name}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-galaxy-ink/35 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">
              Opportunity signal
            </p>
            <p className="mt-2 text-xl font-semibold leading-tight text-galaxy-cream">
              <IndexValue value={opportunity} label="CDE opportunity signal" />
            </p>
          </article>
        </div>

        <p className="rounded-2xl border border-galaxy-gold/20 bg-galaxy-gold/10 p-4 text-sm font-semibold leading-6 text-galaxy-cream">
          {action}
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {copyStatus}
        </p>
      </Panel>
    </section>
  );
}
