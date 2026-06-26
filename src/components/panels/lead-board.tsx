'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DriverChip } from '@/components/ui/driver-chip';
import { BandValue, IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { ScorePill } from '@/components/ui/score-pill';
import { TierBadge } from '@/components/ui/tier-badge';
import { CORE_CATEGORIES, type CoreCategory, type GalaxyTier, type Guest } from '@/data';

type SortMode = 'leadScore' | 'upside' | 'propensity';
type TierFilter = GalaxyTier | 'all';

interface NormalizedLead {
  id: string;
  persona: string;
  galaxyTier: GalaxyTier;
  leadScore: number;
  projectedUpsideBand: string;
  primaryOpportunity: CoreCategory;
  walletIndex: number;
  leakagePct: number;
  propensityScore: number;
  propensityPct: number;
  scoreDrivers: string[];
  offer: string;
  channel: string;
}

interface LeadBoardProps {
  guests: Guest[];
  onAction: (message: string) => void;
}

const tierOptions: GalaxyTier[] = ['Diamond', 'Platinum', 'Gold', 'Privilege'];
const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/gi;
const nonFinitePattern = /NaN|Infinity/gi;
const maskedGuestIdPattern = /^MEM-••••\d{4}$/;
const modelledBandPattern = /^\d+(?:\.\d+)?-\d+(?:\.\d+)?k equiv\.\/mo$/i;

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cleanCopy(value: unknown, fallback = '') {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const cleaned = String(value)
    .replace(bannedCurrencyPattern, '')
    .replace(nonFinitePattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallback;
}

function safeTier(value: unknown): GalaxyTier {
  return tierOptions.includes(value as GalaxyTier) ? value as GalaxyTier : 'Privilege';
}

function safeBand(value: unknown) {
  const cleaned = cleanCopy(value, '0-0k equiv./mo');

  return modelledBandPattern.test(cleaned) ? cleaned : '0-0k equiv./mo';
}

function categoryMetric(cde: Record<string, unknown>, key: string, category: CoreCategory, max: number) {
  const values = isRecord(cde[key]) ? cde[key] : {};

  return clamp(finiteNumber(values[category]), 0, max);
}

function propensities(cde: Record<string, unknown>) {
  const values = isRecord(cde.propensities) ? cde.propensities : {};

  return {
    luxuryHotelSpender: clamp(finiteNumber(values.luxuryHotelSpender), 0, 1),
    topTierRewards: clamp(finiteNumber(values.topTierRewards), 0, 1),
    coBrandLookAlike: clamp(finiteNumber(values.coBrandLookAlike), 0, 1),
  };
}

function propensityScore(cde: Record<string, unknown>) {
  const values = propensities(cde);

  return (
    values.luxuryHotelSpender
    + values.topTierRewards
    + values.coBrandLookAlike
  ) / 3;
}

function propensityPct(cde: Record<string, unknown>) {
  return Math.round(propensityScore(cde) * 100);
}

function safeCategory(value: unknown, cde: Record<string, unknown>) {
  if (CORE_CATEGORIES.includes(value as CoreCategory)) return value as CoreCategory;

  return [...CORE_CATEGORIES].sort((first, second) => (
    categoryMetric(cde, 'categoryLeakagePct', second, 100) * categoryMetric(cde, 'categoryWalletIndex', second, 999)
    - categoryMetric(cde, 'categoryLeakagePct', first, 100) * categoryMetric(cde, 'categoryWalletIndex', first, 999)
  ))[0] ?? 'hospitality';
}

function normalizeDrivers(value: unknown, lead: Pick<NormalizedLead, 'primaryOpportunity' | 'walletIndex' | 'leakagePct'>) {
  const providedDrivers = Array.isArray(value)
    ? value.map((driver) => cleanCopy(driver)).filter(Boolean)
    : [];

  if (providedDrivers.length > 0) return providedDrivers.slice(0, 3);

  return [
    `${categoryLabels[lead.primaryOpportunity]} opportunity`,
    `wallet ${Math.round(lead.walletIndex)} index`,
    `leakage ${Math.round(lead.leakagePct)}%`,
  ];
}

function normalizeLead(value: unknown): NormalizedLead | null {
  if (!isRecord(value)) return null;

  const id = typeof value.id === 'string' ? value.id.trim() : '';
  if (!maskedGuestIdPattern.test(id)) return null;

  const cde = isRecord(value.cde) ? value.cde : {};
  const primaryOpportunity = safeCategory(value.primaryOpportunity, cde);
  const walletIndex = categoryMetric(cde, 'categoryWalletIndex', primaryOpportunity, 999);
  const leakagePct = categoryMetric(cde, 'categoryLeakagePct', primaryOpportunity, 100);
  const action = Array.isArray(value.nextBestActions) && isRecord(value.nextBestActions[0])
    ? value.nextBestActions[0]
    : {};
  const leadScore = clamp(Math.round(finiteNumber(value.leadScore)), 0, 100);
  const baseLead = {
    id,
    persona: cleanCopy(value.persona, 'Masked priority guest'),
    galaxyTier: safeTier(value.galaxyTier),
    leadScore,
    projectedUpsideBand: safeBand(value.projectedUpsideBand),
    primaryOpportunity,
    walletIndex,
    leakagePct,
    propensityScore: propensityScore(cde),
    propensityPct: propensityPct(cde),
    offer: cleanCopy(action.offer, 'Host-curated invitation based on the strongest wallet gap.'),
    channel: cleanCopy(action.channel, 'host'),
  };

  return {
    ...baseLead,
    scoreDrivers: normalizeDrivers(value.scoreDrivers, baseLead),
  };
}

function sortLeads(leads: NormalizedLead[], sortMode: SortMode) {
  return [...leads].sort((first, second) => {
    if (sortMode === 'propensity') return second.propensityScore - first.propensityScore;
    if (sortMode === 'upside') {
      return (second.leadScore + second.leakagePct + second.walletIndex / 10)
        - (first.leadScore + first.leakagePct + first.walletIndex / 10);
    }

    return second.leadScore - first.leadScore;
  });
}

function safeMinScore(value: string) {
  if (value.trim() === '') return 0;

  return clamp(Math.round(finiteNumber(Number(value))), 0, 100);
}

export function LeadBoard({ guests, onAction }: LeadBoardProps) {
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('leadScore');
  const [minScoreInput, setMinScoreInput] = useState('0');
  const minScore = safeMinScore(minScoreInput);

  const allLeads = useMemo(() => (
    (Array.isArray(guests) ? guests : [])
      .map((guest) => normalizeLead(guest))
      .filter((guest): guest is NormalizedLead => guest !== null)
  ), [guests]);

  const visibleLeads = useMemo(() => sortLeads(
    allLeads.filter((guest) => (
      (tierFilter === 'all' || guest.galaxyTier === tierFilter)
      && guest.leadScore >= minScore
    )),
    sortMode,
  ), [allLeads, minScore, sortMode, tierFilter]);

  return (
    <section aria-labelledby="priority-lead-board-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            Who to pitch next
          </p>
          <h1 id="priority-lead-board-title" className="mt-2 font-serif text-4xl text-galaxy-cream">
            Priority Lead Board
          </h1>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            Ranked by Galaxy first-party value, Mastercard CDE opportunity, propensity, and engagement.
            IDs are masked synthetic demo records for executive prioritization.
          </p>
        </div>

        <div className="grid w-full gap-3 rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3 sm:w-auto sm:grid-cols-3">
          <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
            Tier filter
            <select
              value={tierFilter}
              onChange={(event) => setTierFilter(event.target.value as TierFilter)}
              className="mt-2 block w-full rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 py-2 text-sm normal-case tracking-normal text-galaxy-cream"
            >
              <option value="all">All tiers</option>
              {tierOptions.map((tier) => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
            Sort leads
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="mt-2 block w-full rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 py-2 text-sm normal-case tracking-normal text-galaxy-cream"
            >
              <option value="leadScore">Lead score</option>
              <option value="upside">Upside</option>
              <option value="propensity">Propensity</option>
            </select>
          </label>

          <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
            Minimum lead score
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={minScoreInput}
              onChange={(event) => setMinScoreInput(event.target.value)}
              className="mt-2 block w-full rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 py-2 text-sm normal-case tracking-normal text-galaxy-cream"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
          <p className="text-galaxy-muted">Visible leads</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-galaxy-cream">{visibleLeads.length}</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
          <p className="text-galaxy-muted">Priority threshold</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-galaxy-cream">{minScore}</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
          <p className="text-galaxy-muted">Sort mode</p>
          <p className="mt-1 text-lg font-semibold text-galaxy-cream">
            {sortMode === 'leadScore' ? 'Lead Score' : sortMode === 'upside' ? 'Upside' : 'Propensity'}
          </p>
        </div>
      </div>

      {visibleLeads.length === 0 ? (
        <div className="rounded-xl border border-galaxy-border bg-galaxy-charcoal/65 p-8 text-center text-sm text-galaxy-muted">
          No priority guests match these controls.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleLeads.slice(0, 12).map((guest, index) => (
            <article
              key={guest.id}
              aria-label={`Priority lead ${index + 1} ${guest.id}`}
              className="rounded-xl border border-galaxy-border bg-galaxy-charcoal/72 p-5 shadow-2xl shadow-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                    Rank {index + 1}
                  </p>
                  <p className="mt-2 font-mono text-sm text-galaxy-gold">{guest.id}</p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight text-galaxy-cream">
                    {guest.persona}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <TierBadge tier={guest.galaxyTier} />
                    <DriverChip>{categoryLabels[guest.primaryOpportunity]}</DriverChip>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Lead Score</p>
                  <div className="mt-2">
                    <ScorePill score={guest.leadScore} />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-galaxy-muted">{guest.offer}</p>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3">
                  <p className="text-galaxy-muted">Upside band</p>
                  <p className="mt-1 font-semibold text-galaxy-cream">
                    <BandValue value={guest.projectedUpsideBand} />
                  </p>
                </div>
                <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3">
                  <p className="text-galaxy-muted">Wallet intensity</p>
                  <p className="mt-1 font-semibold text-galaxy-cream">
                    <IndexValue value={guest.walletIndex} />
                  </p>
                </div>
                <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3">
                  <p className="text-galaxy-muted">Leakage</p>
                  <p className="mt-1 font-semibold text-galaxy-cream">
                    <PercentValue value={guest.leakagePct} />
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {guest.scoreDrivers.map((driver) => (
                  <DriverChip key={driver}>{driver}</DriverChip>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/guests/${encodeURIComponent(guest.id)}`}
                  aria-label={`Open 360 for ${guest.id}`}
                  className="inline-flex min-h-10 items-center rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink"
                >
                  Open 360
                </Link>
                <button
                  type="button"
                  aria-label={`Assign ${guest.id} to host`}
                  onClick={() => onAction(`${guest.id} assigned to host`)}
                  className="inline-flex min-h-10 items-center rounded-md border border-galaxy-border px-4 py-2 text-sm font-semibold text-galaxy-cream transition hover:border-galaxy-gold/50"
                >
                  Assign to host
                </button>
                <button
                  type="button"
                  aria-label={`Add ${guest.id} to audience`}
                  onClick={() => onAction(`${guest.id} added to audience`)}
                  className="inline-flex min-h-10 items-center rounded-md border border-galaxy-border px-4 py-2 text-sm font-semibold text-galaxy-cream transition hover:border-galaxy-gold/50"
                >
                  Add to audience
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
