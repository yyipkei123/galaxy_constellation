import { IndexValue } from '@/components/ui/formatted-values';
import type { NbaChannel, NbaRec } from '@/data';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const nonFinitePattern = /NaN|Infinity/i;
const channels: NbaChannel[] = ['online', 'physical', 'host'];

function hasUnsafeText(value: string) {
  return bannedCurrencyPattern.test(value) || nonFinitePattern.test(value);
}

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const rawValue = String(value);
  if (hasUnsafeText(rawValue)) return fallback;

  const cleaned = rawValue.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeChannel(value: unknown): NbaChannel {
  return channels.includes(value as NbaChannel) ? value as NbaChannel : 'host';
}

export function NbaRecommendationCard({ rec }: { rec: NbaRec }) {
  const offer = cleanText(rec?.offer, 'Host-curated invitation');
  const rationale = cleanText(
    rec?.rationale,
    'Galaxy and CDE signals indicate a pitch-ready opportunity.',
  );
  const upliftIndex = Math.max(0, Math.round(safeNumber(rec?.upliftIndex)));
  const confidence = Math.min(100, Math.max(0, Math.round(safeNumber(rec?.confidence) * 100)));
  const channel = safeChannel(rec?.channel);

  return (
    <article className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <h3 className="text-lg font-semibold leading-7 text-galaxy-cream">{offer}</h3>
      <p className="mt-3 text-sm leading-6 text-galaxy-muted">{rationale}</p>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-galaxy-muted">Uplift</p>
          <p className="font-semibold text-galaxy-cream">
            <IndexValue value={upliftIndex} />
          </p>
        </div>
        <div>
          <p className="text-galaxy-muted">Channel</p>
          <p className="font-semibold capitalize text-galaxy-cream">{channel}</p>
        </div>
        <div>
          <p className="text-galaxy-muted">Confidence</p>
          <p className="font-semibold text-galaxy-cream">{confidence}%</p>
        </div>
      </div>
    </article>
  );
}
