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

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const nonFinitePattern = /NaN|Infinity/i;
const defaultOffer = 'Host-curated invitation';
const pitchFallback = 'Review the selected guest before creating a host pitch.';

function finiteNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function safePercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(finiteNumber(value))));
}

function safeIndex(value: number) {
  return Math.max(0, Math.round(finiteNumber(value)));
}

function safeText(value: unknown, fallback: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const rawValue = String(value);
  if (bannedCurrencyPattern.test(rawValue) || nonFinitePattern.test(rawValue)) return fallback;

  const cleaned = rawValue.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function buildHostPitch(guest: Guest, offer: string, hasSafeAction: boolean) {
  if (!hasSafeAction) return pitchFallback;

  const language = safeText(guest.profile.preferredLanguage, 'preferred language');
  const channel = safeText(guest.nextBestActions[0]?.channel, 'host');

  return `Use ${language} via ${channel} channel: invite this guest to ${offer}.`;
}

export function HostActionSummaryCard({ guest }: { guest: Guest }) {
  const action = guest.nextBestActions[0];
  const offer = safeText(action?.offer, defaultOffer);
  const hasSafeAction = Boolean(action && offer !== defaultOffer);
  const pitchLine = buildHostPitch(guest, offer, hasSafeAction);
  const primaryOpportunity = guest.primaryOpportunity;
  const primaryLabel = categoryLabels[primaryOpportunity];
  const leakagePct = safePercent(guest.cde.categoryLeakagePct[primaryOpportunity]);
  const walletIndex = safeIndex(guest.cde.categoryWalletIndex[primaryOpportunity]);
  const contactReason = safeText(guest.profile.contactability, 'host-led contactability');

  return (
    <section aria-label="Host action summary">
      <Panel
        variant="glass"
        className="grid gap-5 border-galaxy-gold/25 p-5 md:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Overline>Customer 360 host move</Overline>
            <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Host action summary</h2>
          </div>
          <Link
            href="/activation"
            className="galaxy-cta-primary"
          >
            Move to activation
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <article className="galaxy-tile p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
              Why this guest
            </p>
            <p className="mt-3 font-mono text-sm text-galaxy-gold">{guest.id}</p>
            <div className="mt-3">
              <ScorePill score={guest.leadScore} />
            </div>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">
              {contactReason} with visible CDE opportunity.
            </p>
          </article>

          <article className="galaxy-tile p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
              What to offer
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-galaxy-cream">{offer}</p>
          </article>

          <article className="galaxy-tile p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
              What to say
            </p>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{pitchLine}</p>
          </article>

          <article className="galaxy-tile p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
              Evidence
            </p>
            <dl className="mt-3 grid gap-3 text-sm">
              <div>
                <dt className="text-galaxy-muted">Primary opportunity</dt>
                <dd className="text-galaxy-cream">{primaryLabel}</dd>
              </div>
              <div>
                <dt className="text-galaxy-muted">Leakage</dt>
                <dd className="text-galaxy-cream">
                  <PercentValue value={leakagePct} />
                </dd>
              </div>
              <div>
                <dt className="text-galaxy-muted">Wallet intensity</dt>
                <dd className="text-galaxy-cream">
                  <IndexValue value={walletIndex} label="CDE wallet intensity" />
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </Panel>
    </section>
  );
}
