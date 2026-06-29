'use client';

import type { DashboardTabId } from './open-design-view-model';

interface ReadingGuideProps {
  onJump: (tabId: DashboardTabId) => void;
}

const guideSteps = [
  {
    title: '1. What changed?',
    body: 'Quarter deltas show whether wallet headroom, matched guests, and capture improved or deteriorated.',
  },
  {
    title: '2. Why this audience?',
    body: 'The map, table, and scoring view expose the same ranking from different levels of detail.',
  },
  {
    title: '3. What action follows?',
    body: 'Activation translates the top finding into channel, offer, measurement window, and CDE-safe copy.',
  },
];

export function ReadingGuide({ onJump }: ReadingGuideProps) {
  return (
    <section
      aria-label="How to read Galaxy Constellation"
      className="galaxy-glass-panel grid gap-4 rounded-[18px] border border-galaxy-gold/20 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
    >
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-muted">
          How to read this dashboard
        </div>
        <h2 className="mt-2 max-w-[28ch] font-serif text-[clamp(1.625rem,2.7vw,2.375rem)] font-semibold leading-[1.04] tracking-normal text-galaxy-cream">
          Start with the ranking, then prove the reason, then build the campaign.
        </h2>
        <p className="mt-2 max-w-[74ch] text-sm leading-6 text-galaxy-muted">
          Use the page as a boardroom readout: identify the largest wallet gap, inspect the CDE evidence, and leave
          with an activation brief Marketing can test.
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {guideSteps.map((step) => (
            <div key={step.title} className="border-t border-white/10 pt-3">
              <b className="block text-[13px] text-galaxy-cream">{step.title}</b>
              <span className="mt-1.5 block text-xs leading-5 text-galaxy-muted">{step.body}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2 lg:min-w-[220px]">
        <button
          type="button"
          onClick={() => onJump('workbench')}
          className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-galaxy-gold/40 bg-galaxy-gold px-4 text-[13px] font-semibold text-galaxy-ink shadow-lg shadow-black/20 transition hover:bg-galaxy-gold-lite active:translate-y-px"
        >
          Open analytics workbench
        </button>
        <button
          type="button"
          onClick={() => onJump('activation')}
          className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-white/10 bg-galaxy-ink/45 px-4 text-[13px] font-semibold text-galaxy-cream transition hover:border-galaxy-gold/40 hover:text-galaxy-gold active:translate-y-px"
        >
          Jump to campaign action
        </button>
      </div>
    </section>
  );
}
