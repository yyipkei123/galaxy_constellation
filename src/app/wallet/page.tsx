'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { ChannelDonut } from '@/components/charts/channel-donut';
import { SowSovScatter } from '@/components/charts/sow-sov-scatter';
import { WalletGauge } from '@/components/charts/wallet-gauge';
import { ChartCallout } from '@/components/panels/insight-storytelling';
import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { KpiCard } from '@/components/ui/kpi-card';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES, type CoreCategory, type Segment } from '@/data';
import { buildWalletAnalytics, type WalletAnalytics } from '@/lib/wallet-analytics';
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

function validNumber(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function average(values: Array<number | undefined>) {
  const finiteValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (finiteValues.length === 0) return 0;
  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function roundedAverage(values: Array<number | undefined>) {
  return Math.round(average(values));
}

function isSegment(segment: Segment | undefined): segment is Segment {
  return Boolean(segment);
}

function categoryCapture(segments: Segment[], category: CoreCategory) {
  return roundedAverage(segments.map((segment) => validNumber(segment.categories?.[category]?.capturedSharePct)));
}

function subIndex(segments: Segment[], category: CoreCategory, keys: string[]) {
  return roundedAverage(
    segments.flatMap((segment) => keys.map((key) => validNumber(segment.categories?.[category]?.sub?.[key]))),
  );
}

function chartReadySegments(segments: Segment[]): Segment[] {
  return segments.map((segment, index) => ({
    ...segment,
    name: segment.name || `Segment ${index + 1}`,
    metrics: {
      ...(segment.metrics ?? {}),
      shareOfWallet: validNumber(segment.metrics?.shareOfWallet) ?? 0,
      shareOfVisits: validNumber(segment.metrics?.shareOfVisits) ?? 0,
    },
  } as Segment));
}

function channelInsight(onlinePct: number, hasSegments: boolean) {
  if (!hasSegments) {
    return 'No channel signal available for this quarter.';
  }

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

function scoreWidth(score: number, maxScore: number) {
  if (maxScore <= 0) return 0;
  return Math.max(8, Math.round((score / maxScore) * 100));
}

function relativeScorePct(score: number, maxScore: number) {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}

function scatterCallout(analytics: WalletAnalytics) {
  const topSegment = analytics.summary.topWalletSegment;

  if (topSegment.id === 'no-active-segment') {
    return 'No segment-level wallet gap is available yet. Once CDE segments load, this view separates visit intensity from Galaxy wallet capture.';
  }

  return `${topSegment.name} carries the largest visible wallet gap in this cut. Read the scatter as a conversion queue: high visits with lower wallet capture should move first into leakage and activation review.`;
}

function channelCallout(analytics: WalletAnalytics) {
  const { channelSkew, averageCapturePct } = analytics.summary;

  if (channelSkew === 'Insufficient data') {
    return 'No channel signal available for this quarter. Once CDE segments load, this panel will compare online and physical payment behavior.';
  }

  if (channelSkew === 'Online skew') {
    return `Online payment behavior is over-indexing while average capture is ${averageCapturePct}%, so pre-arrival and mobile prompts should carry the wallet recapture message.`;
  }

  if (channelSkew === 'Physical skew') {
    return `Physical payment behavior is dominant while average capture is ${averageCapturePct}%, so host, concierge, and on-property prompts should close the gap.`;
  }

  return `Channel behavior is balanced while average capture is ${averageCapturePct}%, so keep the same wallet message before arrival and on property.`;
}

function AnalyticsSnapshot({ analytics, hasSegments }: { analytics: WalletAnalytics; hasSegments: boolean }) {
  const { summary } = analytics;

  return (
    <Panel className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Overline>Executive wallet view</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Wallet analytics snapshot</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-galaxy-muted">
          A CDE-safe snapshot of capture, leakage, channel skew, and the segment carrying the clearest wallet gap.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Average capture"
          value={<PercentValue value={summary.averageCapturePct} />}
          detail="Across visible wallet categories."
        />
        <KpiCard
          label="Average leakage"
          value={<PercentValue value={summary.averageLeakagePct} />}
          detail="Market remainder visible through CDE enrichment."
        />
        <KpiCard
          label="Highest leakage"
          value={<span className="text-xl font-semibold text-galaxy-cream">{summary.highestLeakageCategory.label}</span>}
          detail={<PercentValue value={summary.highestLeakageCategory.leakagePct} />}
        />
        <KpiCard
          label="Top wallet gap"
          value={(
            <span className="block text-xl font-semibold leading-7 text-galaxy-cream">
              {hasSegments ? summary.topWalletSegment.name : 'No active segment'}
            </span>
          )}
          detail={summary.channelSkew}
        />
      </div>
    </Panel>
  );
}

function RankedCategoryLeakage({ analytics, hasSegments }: { analytics: WalletAnalytics; hasSegments: boolean }) {
  const maxScore = Math.max(...analytics.categories.map((category) => category.opportunityScore), 0);

  return (
    <Panel className="p-4 sm:p-6">
      <section role="region" aria-label="Ranked category leakage analytics">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Overline>Category leakage</Overline>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Ranked category leakage</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-galaxy-muted">
            Categories are ordered by leakage percentage multiplied by wallet intensity index, then shown without raw spend values.
          </p>
        </div>
        {hasSegments ? (
          <div className="space-y-4">
            {analytics.categories.map((category, index) => (
              <article key={category.category} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                      Rank {index + 1}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-galaxy-cream">{category.label}</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-galaxy-muted">
                    <PercentValue value={category.leakagePct} /> leakage
                  </span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-galaxy-market">
                  <div
                    className="h-full rounded-full bg-galaxy-leak"
                    style={{ width: `${scoreWidth(category.opportunityScore, maxScore)}%` }}
                    aria-label={`${category.label} leakage ${category.leakagePct}%, wallet intensity index ${category.walletIndex}, relative priority ${relativeScorePct(category.opportunityScore, maxScore)}%`}
                  />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-galaxy-muted sm:grid-cols-3">
                  <p>
                    Captured <span className="font-semibold text-galaxy-cream"><PercentValue value={category.capturePct} /></span>
                  </p>
                  <p>
                    Wallet intensity <span className="font-semibold text-galaxy-cream"><IndexValue value={category.walletIndex} /></span>
                  </p>
                  <p>
                    Lead segment <span className="font-semibold text-galaxy-cream">{category.leadingSegmentName}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
            No category leakage signals available for this quarter.
          </p>
        )}
      </section>
    </Panel>
  );
}

function heatmapCellClass(score: number, maxScore: number) {
  const relative = relativeScorePct(score, maxScore);

  if (relative >= 72) return 'border-galaxy-leak/60 bg-galaxy-leak/25 text-galaxy-cream';
  if (relative >= 45) return 'border-galaxy-gold/45 bg-galaxy-gold/15 text-galaxy-cream';
  return 'border-galaxy-border bg-galaxy-ink/35 text-galaxy-muted';
}

function SegmentOpportunityHeatmap({ analytics, hasSegments }: { analytics: WalletAnalytics; hasSegments: boolean }) {
  const maxScore = Math.max(
    ...analytics.segments.flatMap((segment) => Object.values(segment.categoryLeakageScores).map((score) => score ?? 0)),
    0,
  );
  const gridTemplateColumns = {
    gridTemplateColumns: `minmax(11rem,1.35fr) repeat(${Math.max(analytics.categories.length, 1)}, minmax(6rem,1fr))`,
  };

  return (
    <Panel className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Overline>Segment x category</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Segment opportunity heatmap</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-galaxy-muted">
          Heat shows relative wallet-gap priority by segment and visible category, using only CDE percentages and indices.
        </p>
      </div>
      {hasSegments ? (
        <>
          <div className="grid gap-3 md:hidden">
            {analytics.segments.map((segment) => (
              <article key={segment.id} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-galaxy-cream">{segment.name}</h3>
                    <p className="mt-1 text-xs text-galaxy-muted">{segment.leadingCategoryLabel} leads the gap</p>
                  </div>
                  <CdeChip />
                </div>
                <div className="mt-4 grid gap-2">
                  {analytics.categories.map((category) => {
                    const score = segment.categoryLeakageScores[category.category] ?? 0;
                    const relative = relativeScorePct(score, maxScore);

                    return (
                      <div
                        key={category.category}
                        className={clsx('rounded-lg border px-3 py-2 text-sm', heatmapCellClass(score, maxScore))}
                        aria-label={`${segment.name} ${category.label} relative wallet gap ${relative}%`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{category.label}</span>
                          <span className="font-semibold">{relative}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
          <div className="hidden md:block" role="table" aria-label="Segment opportunity heatmap table">
            <div
              role="row"
              className="grid gap-2 border-b border-galaxy-border pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted"
              style={gridTemplateColumns}
            >
              <span role="columnheader">Segment</span>
              {analytics.categories.map((category) => (
                <span key={category.category} role="columnheader">{category.label}</span>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {analytics.segments.map((segment) => (
                <div key={segment.id} role="row" className="grid gap-2" style={gridTemplateColumns}>
                  <div role="cell" className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3">
                    <p className="text-sm font-semibold text-galaxy-cream">{segment.name}</p>
                    <p className="mt-1 text-xs text-galaxy-muted">{segment.leadingCategoryLabel} leads the gap</p>
                  </div>
                  {analytics.categories.map((category) => {
                    const score = segment.categoryLeakageScores[category.category] ?? 0;
                    const relative = relativeScorePct(score, maxScore);

                    return (
                      <div
                        key={category.category}
                        role="cell"
                        className={clsx('rounded-lg border p-3 text-sm font-semibold', heatmapCellClass(score, maxScore))}
                        aria-label={`${segment.name} ${category.label} relative wallet gap ${relative}%`}
                      >
                        {relative}%
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
          No segment-level heatmap available for this quarter.
        </p>
      )}
    </Panel>
  );
}

function SegmentGapLadder({ analytics, hasSegments }: { analytics: WalletAnalytics; hasSegments: boolean }) {
  const maxScore = Math.max(...analytics.segments.map((segment) => segment.opportunityScore), 0);

  return (
    <Panel className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Overline>Segment ranking</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Largest wallet gaps now</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-galaxy-muted">
          A ranked activation queue using each segment&apos;s dominant visible category gap.
        </p>
      </div>
      {hasSegments ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {analytics.segments.slice(0, 6).map((segment, index) => {
            const relative = relativeScorePct(segment.opportunityScore, maxScore);

            return (
              <article key={segment.id} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                      Segment {index + 1}
                    </p>
                    <h3 className="mt-2 text-sm font-semibold text-galaxy-cream">{segment.name}</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-galaxy-muted">
                    <PercentValue value={relative} /> priority
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-galaxy-market">
                  <div
                    className="h-full rounded-full bg-galaxy-gold"
                    style={{ width: `${scoreWidth(segment.opportunityScore, maxScore)}%` }}
                    aria-label={`${segment.name} relative wallet gap priority ${relative}%`}
                  />
                </div>
                <div className="mt-4 grid gap-2 text-xs text-galaxy-muted sm:grid-cols-3">
                  <span>Gap: <strong className="text-galaxy-cream">{segment.leadingCategoryLabel}</strong></span>
                  <span>Capture: <strong className="text-galaxy-cream">{segment.shareOfWalletPct}%</strong></span>
                  <span>Visits: <strong className="text-galaxy-cream">{segment.shareOfVisitsPct}%</strong></span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
          No segment-level wallet gaps available for this quarter.
        </p>
      )}
    </Panel>
  );
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
  const scatterSegments = useMemo(() => chartReadySegments(safeSegments), [safeSegments]);
  const categories = useMemo(() => visibleCategories(selectedCategory), [selectedCategory]);
  const walletAnalytics = useMemo(
    () => buildWalletAnalytics(safeSegments, categories),
    [safeSegments, categories],
  );
  const hasSegments = safeSegments.length > 0;
  const averageOnlinePct = roundedAverage(safeSegments.map((segment) => validNumber(segment.metrics?.channelShareOnlinePct)));

  return (
    <div className="space-y-6 text-galaxy-cream">
      <section className="rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_left,rgba(205,164,92,0.2),transparent_34%),linear-gradient(135deg,rgba(31,27,24,0.96),rgba(8,18,30,0.92))] px-4 py-7 shadow-2xl shadow-black/25 sm:px-6 md:px-8 md:py-8">
        <Overline>Reveal the gap</Overline>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <h1 className="font-serif text-4xl text-galaxy-cream sm:text-5xl md:text-6xl">Share of Wallet</h1>
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

      <div className="-mx-1 max-w-full overflow-x-auto pb-1">
        <div role="group" className="flex w-max min-w-full gap-2 px-1 sm:w-auto sm:flex-wrap" aria-label="Wallet category filters">
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected = selectedCategory === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(option.value)}
                className={clsx(
                  'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
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
      </div>

      <AnalyticsSnapshot analytics={walletAnalytics} hasSegments={hasSegments} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <RankedCategoryLeakage analytics={walletAnalytics} hasSegments={hasSegments} />
        <SegmentGapLadder analytics={walletAnalytics} hasSegments={hasSegments} />
      </div>

      <SegmentOpportunityHeatmap analytics={walletAnalytics} hasSegments={hasSegments} />

      <Panel className="p-4 sm:p-6">
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
        {hasSegments ? (
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
        <Panel className="p-4 sm:p-6">
          <div className="mb-5">
            <Overline>Visit conversion</Overline>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">
              Share of Wallet vs Share of Visits
            </h2>
          </div>
          <SowSovScatter segments={scatterSegments} />
          <div className="mt-5">
            <ChartCallout>{scatterCallout(walletAnalytics)}</ChartCallout>
          </div>
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

        <Panel className="p-4 sm:p-6">
          <Overline>Channel signal</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Channel mix</h2>
          <div className="mt-5">
            <ChannelDonut onlinePct={averageOnlinePct} />
          </div>
          <div className="mt-5">
            <ChartCallout>{channelCallout(walletAnalytics)}</ChartCallout>
          </div>
          <div className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-sm text-galaxy-muted">Average online payment share</p>
            <div className="mt-2 text-2xl font-semibold text-galaxy-gold">
              <PercentValue value={averageOnlinePct} />
            </div>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{channelInsight(averageOnlinePct, hasSegments)}</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
