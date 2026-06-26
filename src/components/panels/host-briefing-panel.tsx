import { ArrowRight, CalendarClock, Sparkles } from 'lucide-react';
import type { Guest } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';
import { BandValue, PercentValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';

const categoryLabels: Record<Guest['primaryOpportunity'], string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/gi;
const nonFinitePattern = /NaN|Infinity/gi;
const modelledBandPattern = /^\d+(?:\.\d+)?-\d+(?:\.\d+)?k equiv\.\/mo$/i;

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const cleaned = String(value)
    .replace(bannedCurrencyPattern, '')
    .replace(nonFinitePattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallback;
}

function safeBand(value: unknown) {
  const cleaned = cleanText(value, '0-0k equiv./mo');

  return modelledBandPattern.test(cleaned) ? cleaned : '0-0k equiv./mo';
}

export function HostBriefingPanel({ guest }: { guest: Guest }) {
  const primaryLabel = categoryLabels[guest.primaryOpportunity];
  const primaryLeakage = guest.cde.categoryLeakagePct[guest.primaryOpportunity];
  const primaryCapture = guest.cde.categoryCapturePct[guest.primaryOpportunity];
  const action = guest.nextBestActions[0];

  return (
    <section id="guest-brief" className="scroll-mt-24">
      <Panel className="border-galaxy-gold/40 bg-galaxy-gold/10">
        <section role="region" aria-label="Host briefing summary">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Overline>Host-ready summary</Overline>
              <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Host briefing</h2>
              <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm leading-6 text-galaxy-muted">
                <span>{guest.profile.displayName}</span>
                <span aria-hidden="true">·</span>
                <span>{guest.profile.originMarket}</span>
                <span aria-hidden="true">·</span>
                <span>{guest.profile.travelParty}</span>
              </p>
            </div>
            <CdeChip />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-4">
              <div className="flex items-center gap-2 text-galaxy-gold">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Primary opportunity</p>
              </div>
              <p className="mt-3 text-xl font-semibold text-galaxy-cream">{primaryLabel}</p>
              <p className="mt-2 text-sm leading-6 text-galaxy-muted">
                Captured <PercentValue value={primaryCapture} /> with <PercentValue value={primaryLeakage} /> remaining leakage.
              </p>
            </article>

            <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-4">
              <div className="flex items-center gap-2 text-galaxy-gold">
                <CalendarClock aria-hidden="true" className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Reason to contact now</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-galaxy-muted">
                Last signal is {guest.firstParty.recencyDays} days old, with {guest.profile.contactability.toLowerCase()} contactability and <BandValue value={safeBand(guest.cde.crossPropertyCashBand)} /> cross-property headroom.
              </p>
            </article>

            <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/40 p-4">
              <div className="flex items-center gap-2 text-galaxy-gold">
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Next action</p>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-galaxy-cream">
                {action ? action.offer : 'No next action available'}
              </p>
              {action ? (
                <p className="mt-2 text-sm leading-6 text-galaxy-muted">
                  Confidence <PercentValue value={Math.round(action.confidence * 100)} /> · {action.channel} channel.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-galaxy-muted">
                  Review the selected guest profile before creating an activation recommendation.
                </p>
              )}
            </article>
          </div>
        </section>
      </Panel>
    </section>
  );
}
