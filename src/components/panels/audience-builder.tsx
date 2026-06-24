'use client';

import { useMemo, useState } from 'react';
import { CdeChip } from '@/components/ui/cde-chip';
import { BandValue, IndexValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES, type CoreCategory, type Segment } from '@/data';
import type { AudienceFilters, SavedAudience } from '@/store/app-store';

interface AudienceBuilderProps {
  segments: Segment[];
  filters: AudienceFilters;
  setFilters: (filters: AudienceFilters | ((current: AudienceFilters) => AudienceFilters)) => void;
  saveAudience: (name: string, segmentIds?: string[]) => SavedAudience;
}

interface BuilderThresholds {
  luxuryHotelSpender: number;
  topTierRewards: number;
  coBrandLookAlike: number;
  categoryLeakageIndex: number;
}

const DEFAULT_NAME = 'Luxury win-back audience';

const CATEGORY_LABELS: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Luxury retail',
};

const CHANNEL_LABELS: Record<AudienceFilters['channel'], string> = {
  all: 'All channels',
  online: 'Online-leaning',
  physical: 'Physical-leaning',
  hybrid: 'Hybrid / balanced',
};

const CHANNEL_OPTIONS: Array<{ value: AudienceFilters['channel']; label: string }> = [
  { value: 'all', label: CHANNEL_LABELS.all },
  { value: 'online', label: CHANNEL_LABELS.online },
  { value: 'physical', label: CHANNEL_LABELS.physical },
  { value: 'hybrid', label: CHANNEL_LABELS.hybrid },
];

function finiteValue(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function segmentId(segment: Segment, index: number) {
  return safeText(segment.id, `segment-${index + 1}`);
}

function dominantLeakage(segment: Segment) {
  return CORE_CATEGORIES.reduce((dominant, category) => {
    const leakagePct = finiteValue(segment.categories?.[category]?.leakagePct);

    return leakagePct > dominant.leakagePct
      ? { category, leakagePct, label: CATEGORY_LABELS[category] }
      : dominant;
  }, { category: 'hospitality' as CoreCategory, leakagePct: 0, label: CATEGORY_LABELS.hospitality });
}

function leakageIndex(segment: Segment) {
  const leakageValues = CORE_CATEGORIES.map((category) => finiteValue(segment.categories?.[category]?.leakagePct));

  if (leakageValues.length === 0) return 0;
  return Math.round(leakageValues.reduce((sum, value) => sum + value, 0) / leakageValues.length);
}

function propensityPct(value: number | undefined) {
  const finite = finiteValue(value);
  if (finite <= 1) return Math.round(finite * 100);
  return Math.round(finite);
}

function maxPropensityPct(segment: Segment) {
  return Math.max(
    propensityPct(segment.propensities?.luxuryHotelSpender),
    propensityPct(segment.propensities?.topTierRewards),
    propensityPct(segment.propensities?.coBrandLookAlike),
  );
}

function channelPreference(segment: Segment): Exclude<AudienceFilters['channel'], 'all'> {
  const onlinePct = finiteValue(segment.metrics?.channelShareOnlinePct, 50);

  if (onlinePct >= 60) return 'online';
  if (onlinePct <= 40) return 'physical';
  return 'hybrid';
}

function channelMatches(segment: Segment, channel: AudienceFilters['channel']) {
  return channel === 'all' || channelPreference(segment) === channel;
}

function audienceBand(segments: Segment[]) {
  const low = segments.reduce((sum, segment) => sum + finiteValue(segment.sizeLowK), 0);
  const high = segments.reduce((sum, segment) => sum + finiteValue(segment.sizeHighK), 0);

  return `~${Math.round(low)}-${Math.round(Math.max(low, high))}k matched guests`;
}

function parseWalletBand(value: string | undefined) {
  const match = safeText(value, '').match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)k equiv\.\/mo$/i);

  if (!match) return null;
  return { low: Number(match[1]), high: Number(match[2]) };
}

function walletBand(segments: Segment[]) {
  const bands = segments.map((segment) => parseWalletBand(segment.crossPropertyCashBand)).filter((band): band is {
    low: number;
    high: number;
  } => Boolean(band));
  const low = bands.reduce((sum, band) => sum + band.low, 0);
  const high = bands.reduce((sum, band) => sum + band.high, 0);

  return `${Math.round(low)}-${Math.round(Math.max(low, high))}k equiv./mo`;
}

function averageIndex(values: number[]) {
  const finiteValues = values.filter(Number.isFinite);

  if (finiteValues.length === 0) return 0;
  return Math.round(finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length);
}

function rangeValue(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function RangeControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
      <span className="flex items-center justify-between gap-4 text-sm font-semibold text-galaxy-cream">
        <span>{label}</span>
        <span className="text-galaxy-gold">{value}</span>
      </span>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(event) => onChange(rangeValue(Number(event.currentTarget.value)))}
        className="mt-4 w-full accent-galaxy-gold"
      />
    </label>
  );
}

export function AudienceBuilder({ segments, filters, setFilters, saveAudience }: AudienceBuilderProps) {
  const safeSegments = useMemo(
    () => (segments ?? []).filter((segment): segment is Segment => Boolean(segment)),
    [segments],
  );
  const [thresholds, setThresholds] = useState<BuilderThresholds>({
    luxuryHotelSpender: 60,
    topTierRewards: 50,
    coBrandLookAlike: 55,
    categoryLeakageIndex: 35,
  });
  const [audienceName, setAudienceName] = useState(DEFAULT_NAME);
  const [savedName, setSavedName] = useState('');

  const allSegmentIds = useMemo(
    () => safeSegments.map((segment, index) => segmentId(segment, index)),
    [safeSegments],
  );
  const selectedSegmentIds = filters.segmentIds.length > 0 ? filters.segmentIds : allSegmentIds;
  const selectedSegmentIdSet = useMemo(() => new Set(selectedSegmentIds), [selectedSegmentIds]);
  const minPropensityPct = rangeValue(finiteValue(filters.minPropensity) * 100);

  const matchedSegments = useMemo(() => (
    safeSegments.filter((segment, index) => (
      selectedSegmentIdSet.has(segmentId(segment, index))
      && channelMatches(segment, filters.channel)
      && maxPropensityPct(segment) >= minPropensityPct
      && propensityPct(segment.propensities?.luxuryHotelSpender) >= thresholds.luxuryHotelSpender
      && propensityPct(segment.propensities?.topTierRewards) >= thresholds.topTierRewards
      && propensityPct(segment.propensities?.coBrandLookAlike) >= thresholds.coBrandLookAlike
      && leakageIndex(segment) >= thresholds.categoryLeakageIndex
    ))
  ), [filters.channel, minPropensityPct, safeSegments, selectedSegmentIdSet, thresholds]);

  const matchedSegmentIds = useMemo(
    () => matchedSegments.map((segment, index) => segmentId(segment, index)),
    [matchedSegments],
  );
  const audienceSizeBand = audienceBand(matchedSegments);
  const recapturableWalletIndex = averageIndex(matchedSegments.map((segment) => finiteValue(segment.opportunityIndex)));
  const recapturableWalletBand = walletBand(matchedSegments);
  const topDominantLeakage = matchedSegments[0] ? dominantLeakage(matchedSegments[0]).label : 'No active match';
  const channelComposition = matchedSegments.reduce<Record<Exclude<AudienceFilters['channel'], 'all'>, number>>(
    (counts, segment) => ({
      ...counts,
      [channelPreference(segment)]: counts[channelPreference(segment)] + 1,
    }),
    { online: 0, physical: 0, hybrid: 0 },
  );

  function updateThreshold(key: keyof BuilderThresholds, value: number) {
    setThresholds((current) => ({ ...current, [key]: value }));
  }

  function updateFilters(nextFilters: Partial<AudienceFilters>) {
    setFilters((current) => ({
      ...current,
      ...nextFilters,
      segmentIds: nextFilters.segmentIds ? [...nextFilters.segmentIds] : [...current.segmentIds],
    }));
  }

  function toggleSegment(nextSegmentId: string) {
    const nextSegmentIds = selectedSegmentIdSet.has(nextSegmentId)
      ? selectedSegmentIds.filter((id) => id !== nextSegmentId)
      : [...selectedSegmentIds, nextSegmentId];

    updateFilters({ segmentIds: nextSegmentIds });
  }

  function updateChannel(value: string) {
    const nextChannel = CHANNEL_OPTIONS.some((option) => option.value === value)
      ? value as AudienceFilters['channel']
      : 'all';

    updateFilters({ channel: nextChannel });
  }

  function updateMinPropensity(value: number) {
    updateFilters({ minPropensity: rangeValue(value) / 100 });
  }

  function handleSave() {
    const safeName = audienceName.trim() || DEFAULT_NAME;
    saveAudience(safeName, matchedSegmentIds);
    setSavedName(safeName);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Panel>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Overline>Audience controls</Overline>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Propensity audience builder</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-galaxy-muted">
            Tune CDE propensity, segment membership, channel preference, and leakage thresholds to produce an
            addressable audience at segment level.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RangeControl
            label="Luxury-hotel spender"
            value={thresholds.luxuryHotelSpender}
            onChange={(value) => updateThreshold('luxuryHotelSpender', value)}
          />
          <RangeControl
            label="Top-tier rewards"
            value={thresholds.topTierRewards}
            onChange={(value) => updateThreshold('topTierRewards', value)}
          />
          <RangeControl
            label="Co-brand look-alike"
            value={thresholds.coBrandLookAlike}
            onChange={(value) => updateThreshold('coBrandLookAlike', value)}
          />
          <RangeControl
            label="Category leakage index"
            value={thresholds.categoryLeakageIndex}
            onChange={(value) => updateThreshold('categoryLeakageIndex', value)}
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <fieldset
            role="group"
            aria-label="Segment membership"
            className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4"
          >
            <legend className="text-sm font-semibold text-galaxy-cream">Segment membership</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {safeSegments.map((segment, index) => {
                const id = segmentId(segment, index);

                return (
                  <label key={id} className="flex items-start gap-2 rounded-md border border-galaxy-border bg-galaxy-charcoal/50 p-2 text-sm text-galaxy-muted">
                    <input
                      type="checkbox"
                      checked={selectedSegmentIdSet.has(id)}
                      onChange={() => toggleSegment(id)}
                      className="mt-1 accent-galaxy-gold"
                    />
                    <span>
                      <span className="block font-semibold text-galaxy-cream">{safeText(segment.name, `Segment ${index + 1}`)}</span>
                      <span className="block text-xs">{safeText(segment.sizeBand, '~0-0k matched guests')}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-4">
            <label className="block rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
              <span className="text-sm font-semibold text-galaxy-cream">Channel preference</span>
              <select
                aria-label="Channel preference"
                value={filters.channel}
                onChange={(event) => updateChannel(event.currentTarget.value)}
                className="mt-3 h-10 w-full rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 text-sm font-semibold text-galaxy-cream outline-none focus:ring-2 focus:ring-galaxy-gold"
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <RangeControl
              label="Minimum propensity score"
              value={minPropensityPct}
              onChange={updateMinPropensity}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Live audience size</p>
            <div className="mt-3 inline-flex items-center gap-2 text-2xl font-semibold text-galaxy-cream">
              <span>{audienceSizeBand}</span>
              <CdeChip />
            </div>
          </div>
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Estimated recapturable wallet</p>
            <div className="mt-3 text-2xl font-semibold text-galaxy-cream">
              <IndexValue value={recapturableWalletIndex} />
            </div>
          </div>
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Estimated wallet band</p>
            <div className="mt-3 text-2xl font-semibold text-galaxy-cream">
              <BandValue value={recapturableWalletBand} />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 md:flex-row md:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-galaxy-cream">Audience name</span>
            <input
              type="text"
              value={audienceName}
              onChange={(event) => setAudienceName(event.currentTarget.value)}
              className="mt-2 w-full rounded-md border border-galaxy-border bg-galaxy-charcoal px-3 py-2 text-sm text-galaxy-cream outline-none transition focus:border-galaxy-gold focus:ring-2 focus:ring-galaxy-gold/40"
            />
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 rounded-md bg-galaxy-gold px-4 text-sm font-semibold text-galaxy-ink transition hover:bg-galaxy-gold/90 focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
          >
            Save audience
          </button>
        </div>
        {savedName ? (
          <p className="mt-3 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-3 text-sm font-semibold text-galaxy-cream">
            Saved: {savedName}
          </p>
        ) : null}
      </Panel>

      <Panel>
        <Overline>Audience composition</Overline>
        <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Segment mix</h2>
        <p className="mt-3 text-sm leading-6 text-galaxy-muted">
          Current filters include {selectedSegmentIds.length} selected segment IDs, {CHANNEL_LABELS[filters.channel]},
          and {matchedSegments.length} live matches.
        </p>

        <div className="mt-5 grid gap-3">
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Dominant leakage</p>
            <p className="mt-2 text-sm text-galaxy-cream">{topDominantLeakage}</p>
          </div>
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Channel preference composition</p>
            <div className="mt-3 grid gap-2 text-sm text-galaxy-muted">
              <span>Online-leaning {channelComposition.online}</span>
              <span>Physical-leaning {channelComposition.physical}</span>
              <span>Hybrid / balanced {channelComposition.hybrid}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {matchedSegments.length > 0 ? matchedSegments.map((segment, index) => (
            <div key={segmentId(segment, index)} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-galaxy-cream">
                    {safeText(segment.name, `Segment ${index + 1}`)}
                  </p>
                  <p className="mt-1 text-xs text-galaxy-muted">{safeText(segment.sizeBand, '~0-0k matched guests')}</p>
                  <p className="mt-2 text-xs text-galaxy-muted">
                    {dominantLeakage(segment).label} leakage / {CHANNEL_LABELS[channelPreference(segment)]}
                  </p>
                </div>
                <span className="text-sm font-semibold text-galaxy-gold">
                  {Math.round(((finiteValue(segment.sizeHighK) || finiteValue(segment.sizeLowK)) / Math.max(1, matchedSegments.reduce(
                    (sum, item) => sum + (finiteValue(item.sizeHighK) || finiteValue(item.sizeLowK)),
                    0,
                  ))) * 100)}%
                </span>
              </div>
            </div>
          )) : (
            <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
              No segments match the current audience controls.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
