'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { ChannelDonut } from '@/components/charts/channel-donut';
import { SowSovScatter } from '@/components/charts/sow-sov-scatter';
import { WalletGauge } from '@/components/charts/wallet-gauge';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES, type CoreCategory, type Segment } from '@/data';
import { useAppState } from '@/store/app-store';

type CategorySelection = CoreCategory | 'all';

const CATEGORY_LABELS: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

const CATEGORY_OPTIONS: Array<{ label: string; value: CategorySelection }> = [
  { label: 'All', value: 'all' },
  { label: CATEGORY_LABELS.hospitality, value: 'hospitality' },
  { label: CATEGORY_LABELS.fnb, value: 'fnb' },
  { label: CATEGORY_LABELS.entertainment, value: 'entertainment' },
  { label: CATEGORY_LABELS.retailLuxury, value: 'retailLuxury' },
];

function finiteNumber(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function average(values: number[]) {
  const finiteValues = values.filter(Number.isFinite);

  if (finiteValues.length === 0) return 0;
  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function roundedAverage(values: number[]) {
  return Math.round(average(values));
}

function isSegment(segment: Segment | undefined): segment is Segment {
  return Boolean(segment);
}

function categoryCapture(segments: Segment[], category: CoreCategory) {
  return roundedAverage(segments.map((segment) => finiteNumber(segment.categories?.[category]?.capturedSharePct)));
}

function subIndex(segments: Segment[], category: CoreCategory, keys: string[]) {
  return roundedAverage(
    segments.flatMap((segment) => keys.map((key) => finiteNumber(segment.categories?.[category]?.sub?.[key]))),
  );
}

function channelInsight(onlinePct: number) {
  if (onlinePct >= 55) {
    return 'Online behavior is over-indexing, so pre-arrival journeys should carry the next wallet prompt.';
  }

  if (onlinePct <= 35) {
    return 'Physical payment behavior is dominant, so host and on-property prompts should close the wallet gap.';
  }

  return 'Channel behavior is balanced, so use consistent wallet prompts before arrival and on property.';
}

function visibleCategories(selectedCategory: CategorySelection): CoreCategory[] {
  return selectedCategory === 'all' ? [...CORE_CATEGORIES] : [selectedCategory];
}

function CategoryDrill({ selectedCategory, segments }: { selectedCategory: CategorySelection; segments: Segment[] }) {
  if (selectedCategory === 'fnb') {
    const barsClubsIndex = subIndex(segments, 'fnb', ['bars', 'nightlife']);
    const fullServiceIndex = subIndex(segments, 'fnb', ['fineDining', 'chefLed', 'privateDining', 'casualDining']);

    return (
      <div
        role="region"
        aria-label="F&B category drill"
        className="mt-5 grid gap-3 md:grid-cols-2"
      >
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="text-sm font-semibold text-galaxy-cream">bars/clubs</p>
          <div className="mt-3 text-xl font-semibold text-galaxy-gold">
            <IndexValue value={barsClubsIndex} />
          </div>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="text-sm font-semibold text-galaxy-cream">full-service restaurants</p>
          <div className="mt-3 text-xl font-semibold text-galaxy-gold">
            <IndexValue value={fullServiceIndex} />
          </div>
        </div>
      </div>
    );
  }

  if (selectedCategory === 'retailLuxury') {
    const jewelleryWatchesIndex = subIndex(segments, 'retailLuxury', ['watchesJewelry']);

    return (
      <div
        role="region"
        aria-label="Retail-Luxury category drill"
        className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-galaxy-gold">Luxury sub-category</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-galaxy-cream">jewellery/watches index</p>
          <div className="text-xl font-semibold text-galaxy-gold">
            <IndexValue value={jewelleryWatchesIndex} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function WalletPage() {
  const { selectedQuarter, segments } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<CategorySelection>('all');
  const safeSegments = useMemo(() => (segments ?? []).filter(isSegment), [segments]);
  const categories = visibleCategories(selectedCategory);
  const averageOnlinePct = roundedAverage(safeSegments.map((segment) => finiteNumber(segment.metrics?.channelShareOnlinePct)));

  return (
    <div className="space-y-6 text-galaxy-cream">
      <section className="rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_left,rgba(205,164,92,0.2),transparent_34%),linear-gradient(135deg,rgba(31,27,24,0.96),rgba(8,18,30,0.92))] px-6 py-8 shadow-2xl shadow-black/25 md:px-8">
        <Overline>Reveal the gap</Overline>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <h1 className="font-serif text-5xl text-galaxy-cream md:text-6xl">Share of Wallet</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
              Compare captured share of wallet against visit intensity, channel preference, and category-level
              headroom to pinpoint where Galaxy can convert known demand into more frequent on-property spend.
            </p>
          </div>
          <div className="rounded-lg border border-galaxy-gold/30 bg-galaxy-ink/45 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">{selectedQuarter.label}</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Wallet and visit signals are modelled from Mastercard CDE segment behavior.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2" aria-label="Wallet category filters">
        {CATEGORY_OPTIONS.map((option) => {
          const isSelected = selectedCategory === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedCategory(option.value)}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
                isSelected
                  ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                  : 'border-galaxy-border bg-galaxy-charcoal/70 text-galaxy-muted hover:border-galaxy-gold/70 hover:text-galaxy-cream',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <Panel>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Overline>Category wallet</Overline>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Visible category capture</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-galaxy-muted">
            Gauges average captured wallet across visible categories and expose remaining leakage without raw spend
            values.
          </p>
        </div>
        {safeSegments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <WalletGauge
                key={category}
                label={`${CATEGORY_LABELS[category]} wallet capture`}
                capturedPct={categoryCapture(safeSegments, category)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm text-galaxy-muted">
            No wallet segments available for this quarter.
          </p>
        )}
        <CategoryDrill selectedCategory={selectedCategory} segments={safeSegments} />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel>
          <div className="mb-5">
            <Overline>Visit conversion</Overline>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">
              Share of Wallet vs Share of Visits
            </h2>
          </div>
          <SowSovScatter segments={safeSegments} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              'Loyal & frequent',
              'Loyal but infrequent',
              'Tried us, spends elsewhere',
              'At risk',
            ].map((label) => (
              <p key={label} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 px-3 py-2 text-sm text-galaxy-muted">
                {label}
              </p>
            ))}
          </div>
        </Panel>

        <Panel>
          <Overline>Channel signal</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Channel mix</h2>
          <div className="mt-5">
            <ChannelDonut onlinePct={averageOnlinePct} />
          </div>
          <div className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-sm text-galaxy-muted">Average online payment share</p>
            <div className="mt-2 text-2xl font-semibold text-galaxy-gold">
              <PercentValue value={averageOnlinePct} />
            </div>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{channelInsight(averageOnlinePct)}</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
