'use client';

import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { RecommendedPlay } from '@/data';

interface NbaCardProps {
  play: Partial<RecommendedPlay>;
  audienceName: string;
  audienceSizeBand: string;
  recaptureIndex: number;
  onPush: () => void;
}

function finiteValue(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function safeChannel(value: unknown) {
  const text = safeText(value, 'Hybrid');

  return ['Online', 'Physical', 'Hybrid'].includes(text) ? text : 'Hybrid';
}

export function NbaCard({ play, audienceName, audienceSizeBand, recaptureIndex, onPush }: NbaCardProps) {
  const title = safeText(play.title, 'Galaxy Rewards audience activation');
  const lever = safeText(play.lever, 'Galaxy Rewards');
  const rationale = safeText(
    play.rationale,
    'Use CDE segment signals to prioritize a compliant audience export for the next campaign cycle.',
  );
  const offerTerm = safeText(play.offerTerm, '');
  const channel = safeChannel(play.channel);

  return (
    <Panel className="flex h-full flex-col bg-[linear-gradient(135deg,rgba(205,164,92,0.12),rgba(12,23,35,0.78))]">
      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Overline>{lever}</Overline>
            <h3 className="mt-3 font-serif text-3xl text-galaxy-cream">{title}</h3>
          </div>
          <span className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            {channel}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-galaxy-muted">{rationale}</p>
        {offerTerm ? (
          <div className="mt-4 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Galaxy Rewards offer term</p>
            <p className="mt-2 text-sm font-semibold text-galaxy-cream">{offerTerm}</p>
          </div>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Audience</dt>
            <dd className="mt-2 text-sm font-semibold text-galaxy-cream">{audienceName}</dd>
          </div>
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Audience size</dt>
            <dd className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-galaxy-cream">
              <span>{safeText(audienceSizeBand, '~0-0k matched guests')}</span>
              <CdeChip />
            </dd>
          </div>
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">CDE recapture index</dt>
            <dd className="mt-2 text-sm font-semibold text-galaxy-cream">
              <IndexValue value={finiteValue(recaptureIndex)} />
            </dd>
          </div>
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Suggested channel</dt>
            <dd className="mt-2 text-sm font-semibold text-galaxy-cream">{channel}</dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        onClick={onPush}
        className="mt-5 h-10 rounded-md bg-galaxy-gold px-4 text-sm font-semibold text-galaxy-ink transition hover:bg-galaxy-gold/90 focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
      >
        Push to campaign
      </button>
    </Panel>
  );
}
