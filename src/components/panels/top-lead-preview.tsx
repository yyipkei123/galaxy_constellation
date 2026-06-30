import Link from 'next/link';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { ScorePill } from '@/components/ui/score-pill';
import type { CoreCategory, Guest } from '@/data';

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

function finiteNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function safePercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(finiteNumber(value))));
}

function safeIndex(value: number) {
  return Math.max(0, Math.round(finiteNumber(value)));
}

function topScoringGuest(guests: Guest[]) {
  return [...guests].sort((first, second) => finiteNumber(second.leadScore) - finiteNumber(first.leadScore))[0];
}

export function TopLeadPreview({ guests }: { guests: Guest[] }) {
  const topGuest = topScoringGuest(guests);

  if (!topGuest) {
    return (
      <section aria-label="Top lead preview">
        <Panel className="border-galaxy-border bg-galaxy-charcoal/65">
          <Overline>Top lead preview</Overline>
          <p className="mt-3 text-lg font-semibold text-galaxy-cream">No priority lead available</p>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">
            Adjust the segment scope or return to all guests to identify the next Customer 360 lead.
          </p>
        </Panel>
      </section>
    );
  }

  const primaryOpportunity = topGuest.primaryOpportunity;
  const primaryLabel = categoryLabels[primaryOpportunity];
  const walletIndex = safeIndex(topGuest.cde.categoryWalletIndex[primaryOpportunity]);
  const leakagePct = safePercent(topGuest.cde.categoryLeakagePct[primaryOpportunity]);

  return (
    <section aria-label="Top lead preview">
      <Panel
        variant="glass"
        className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6"
      >
        <div className="min-w-0">
          <Overline>Top lead preview</Overline>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-galaxy-cream">
            Open this lead first
          </h2>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-6 text-galaxy-muted">
            <span className="font-mono text-galaxy-gold">{topGuest.id}</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-galaxy-cream">{topGuest.persona}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <ScorePill score={topGuest.leadScore} />
          <Link
            href={`/guests/${encodeURIComponent(topGuest.id)}`}
            aria-label={`Open Customer 360 for ${topGuest.id}`}
            className="inline-flex min-h-11 items-center rounded-lg bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink transition hover:bg-galaxy-gold/90"
          >
            Open Customer 360
          </Link>
        </div>

        <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
          <article className="rounded-xl border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
              Primary opportunity
            </p>
            <p className="mt-2 text-lg font-semibold text-galaxy-cream">{primaryLabel}</p>
          </article>
          <article className="rounded-xl border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
              Wallet intensity
            </p>
            <p className="mt-2 text-lg font-semibold text-galaxy-cream">
              <IndexValue value={walletIndex} label="CDE wallet intensity" />
            </p>
          </article>
          <article className="rounded-xl border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
              Leakage
            </p>
            <p className="mt-2 text-lg font-semibold text-galaxy-cream">
              <PercentValue value={leakagePct} />
            </p>
          </article>
        </div>
      </Panel>
    </section>
  );
}
