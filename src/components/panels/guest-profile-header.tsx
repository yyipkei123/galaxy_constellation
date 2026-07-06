import { LeadScoreGauge } from '@/components/charts/lead-score-gauge';
import { CdeChip } from '@/components/ui/cde-chip';
import { TierBadge } from '@/components/ui/tier-badge';
import type { GalaxyTier, Guest } from '@/data';

const maskedGuestIdPattern = /^MEM-••••\d{4}$/;
const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const nonFinitePattern = /NaN|Infinity/i;
const galaxyTiers: GalaxyTier[] = ['Privilege', 'Gold', 'Platinum', 'Diamond'];

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const rawValue = String(value);
  if (bannedCurrencyPattern.test(rawValue) || nonFinitePattern.test(rawValue)) return fallback;

  const cleaned = rawValue.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function safeGuestId(value: unknown) {
  return typeof value === 'string' && maskedGuestIdPattern.test(value) ? value : 'Masked guest';
}

function safeTier(value: unknown): GalaxyTier {
  return galaxyTiers.includes(value as GalaxyTier) ? value as GalaxyTier : 'Privilege';
}

function safeScore(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function GuestProfileHeader({ guest }: { guest: Guest }) {
  const guestId = safeGuestId(guest?.id);
  const persona = cleanText(guest?.persona, 'Guest profile unavailable');
  const tier = safeTier(guest?.galaxyTier);
  const leadScore = safeScore(guest?.leadScore);

  return (
    <section className="galaxy-hero-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="break-words font-mono text-sm text-galaxy-gold">{guestId}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream md:text-5xl">
            Customer 360
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">{persona}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TierBadge tier={tier} />
            <CdeChip />
            <span className="rounded-[7px] border border-galaxy-gold/20 bg-white/[0.025] px-2.5 py-1 text-xs text-galaxy-muted">
              matched via CDE
            </span>
          </div>
        </div>
        <LeadScoreGauge score={leadScore} />
      </div>
    </section>
  );
}
