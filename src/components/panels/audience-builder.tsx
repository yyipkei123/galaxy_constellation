'use client';

import { useEffect, useMemo, useState } from 'react';
import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES, type Segment } from '@/data';
import type { AudienceFilters, SavedAudience } from '@/store/app-store';

interface AudienceBuilderProps {
  segments: Segment[];
  filters: AudienceFilters;
  setFilters: (filters: AudienceFilters | ((current: AudienceFilters) => AudienceFilters)) => void;
  saveAudience: (name: string) => SavedAudience;
}

interface BuilderThresholds {
  luxuryHotelSpender: number;
  topTierRewards: number;
  coBrandLookAlike: number;
  categoryLeakageIndex: number;
}

const DEFAULT_NAME = 'Luxury win-back audience';

function finiteValue(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function segmentId(segment: Segment, index: number) {
  return safeText(segment.id, `segment-${index + 1}`);
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

function audienceBand(segments: Segment[]) {
  const low = segments.reduce((sum, segment) => sum + finiteValue(segment.sizeLowK), 0);
  const high = segments.reduce((sum, segment) => sum + finiteValue(segment.sizeHighK), 0);

  return `~${Math.round(low)}-${Math.round(Math.max(low, high))}k matched guests`;
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

  const matchedSegments = useMemo(() => (
    safeSegments.filter((segment) => (
      propensityPct(segment.propensities?.luxuryHotelSpender) >= thresholds.luxuryHotelSpender
      && propensityPct(segment.propensities?.topTierRewards) >= thresholds.topTierRewards
      && propensityPct(segment.propensities?.coBrandLookAlike) >= thresholds.coBrandLookAlike
      && leakageIndex(segment) >= thresholds.categoryLeakageIndex
    ))
  ), [safeSegments, thresholds]);

  const matchedSegmentIds = useMemo(
    () => matchedSegments.map((segment, index) => segmentId(segment, index)),
    [matchedSegments],
  );
  const matchedSegmentIdKey = matchedSegmentIds.join('|');
  const audienceSizeBand = audienceBand(matchedSegments);
  const recapturableWalletIndex = averageIndex(matchedSegments.map((segment) => finiteValue(segment.opportunityIndex)));

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      segmentIds: matchedSegmentIds,
    }));
  }, [matchedSegmentIdKey, matchedSegmentIds, setFilters]);

  function updateThreshold(key: keyof BuilderThresholds, value: number) {
    setThresholds((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const safeName = audienceName.trim() || DEFAULT_NAME;
    saveAudience(safeName);
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
            Tune CDE propensity and leakage thresholds to produce an addressable audience at segment level.
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

        <div className="mt-5 grid gap-4 md:grid-cols-2">
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
          Current filters include {filters.segmentIds.length} store segment IDs and {matchedSegments.length} live matches.
        </p>
        <div className="mt-5 space-y-3">
          {matchedSegments.length > 0 ? matchedSegments.map((segment, index) => (
            <div key={segmentId(segment, index)} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-galaxy-cream">
                    {safeText(segment.name, `Segment ${index + 1}`)}
                  </p>
                  <p className="mt-1 text-xs text-galaxy-muted">{safeText(segment.sizeBand, '~0-0k matched guests')}</p>
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
              No segments match the current thresholds.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
