'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { ChannelDonut } from '@/components/charts/channel-donut';
import { SowSovScatter } from '@/components/charts/sow-sov-scatter';
import { WalletGauge } from '@/components/charts/wallet-gauge';
import { ChartCallout } from '@/components/panels/insight-storytelling';
import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { InsightTooltip } from '@/components/ui/insight-tooltip';
import { MetricTile } from '@/components/ui/metric-tile';
import { Overline } from '@/components/ui/overline';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionJumpNav } from '@/components/ui/section-jump-nav';
import { SnapshotStatusStrip } from '@/components/ui/snapshot-status-strip';
import { CORE_CATEGORIES, type CoreCategory, type Segment } from '@/data';
import { buildWalletAnalytics, type WalletAnalytics } from '@/lib/wallet-analytics';
import { useAppState } from '@/store/app-store';

type CategorySelection = CoreCategory | 'all';

interface SelectedWalletCell {
  segmentId: string;
  category: CoreCategory;
}

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

function selectedCellKey(cell: SelectedWalletCell) {
  return `${cell.segmentId}:${cell.category}`;
}

function defaultSelectedWalletCell(analytics: WalletAnalytics): SelectedWalletCell | null {
  const topSegment = analytics.segments[0];
  const topCategory = analytics.categories[0];

  if (!topSegment || !topCategory) return null;

  return {
    segmentId: topSegment.id,
    category: topCategory.category,
  };
}

function resolveSelectedWalletCell(analytics: WalletAnalytics, selectedCell: SelectedWalletCell | null) {
  const defaultCell = defaultSelectedWalletCell(analytics);

  if (!selectedCell) return defaultCell;

  const hasSelectedSegment = analytics.segments.some((segment) => segment.id === selectedCell.segmentId);
  const hasSelectedCategory = analytics.categories.some((category) => category.category === selectedCell.category);

  return hasSelectedSegment && hasSelectedCategory ? selectedCell : defaultCell;
}

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
        <SectionHeader
          eyebrow="Executive wallet view"
          title="Wallet analytics snapshot"
          description="Supporting KPI context for the visible category and segment wallet-gap analysis."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Average capture"
          value={<PercentValue value={summary.averageCapturePct} />}
          detail="Across visible wallet categories."
        />
        <MetricTile
          label="Average leakage"
          value={<PercentValue value={summary.averageLeakagePct} />}
          detail="Market remainder visible through CDE enrichment."
        />
        <MetricTile
          label="Highest leakage"
          value={summary.highestLeakageCategory.label}
          detail={<PercentValue value={summary.highestLeakageCategory.leakagePct} />}
        />
        <MetricTile
          label="Top wallet gap"
          value={hasSegments ? summary.topWalletSegment.name : 'No active segment'}
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

function heatmapMaxScore(analytics: WalletAnalytics) {
  return Math.max(
    ...analytics.segments.flatMap((segment) => Object.values(segment.categoryLeakageScores).map((score) => score ?? 0)),
    0,
  );
}

function HeatmapCellButton({
  segment,
  category,
  relative,
  score,
  maxScore,
  isSelected,
  onSelectCell,
}: {
  segment: WalletAnalytics['segments'][number];
  category: WalletAnalytics['categories'][number];
  relative: number;
  score: number;
  maxScore: number;
  isSelected: boolean;
  onSelectCell: (cell: SelectedWalletCell) => void;
}) {
  const cell = { segmentId: segment.id, category: category.category };

  return (
    <InsightTooltip
      title="Relative wallet gap priority"
      lines={[
        `${segment.name} x ${category.label}: ${relative}% of the strongest visible wallet gap.`,
        'CDE combines category leakage and wallet intensity into a relative action queue without raw spend values.',
      ]}
      block
      triggerClassName="block"
    >
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => onSelectCell(cell)}
        className={clsx(
          'block min-h-12 w-full rounded-lg border p-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
          heatmapCellClass(score, maxScore),
          isSelected ? 'ring-2 ring-galaxy-gold ring-offset-2 ring-offset-galaxy-charcoal' : 'hover:border-galaxy-gold/70',
        )}
        aria-label={`${segment.name} ${category.label} relative wallet gap ${relative}%`}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="md:hidden">{category.label}</span>
          <span>{relative}%</span>
        </span>
      </button>
    </InsightTooltip>
  );
}

function SegmentOpportunityHeatmap({
  analytics,
  hasSegments,
  selectedCell,
  onSelectCell,
}: {
  analytics: WalletAnalytics;
  hasSegments: boolean;
  selectedCell: SelectedWalletCell | null;
  onSelectCell: (cell: SelectedWalletCell) => void;
}) {
  const maxScore = heatmapMaxScore(analytics);
  const gridTemplateColumns = {
    gridTemplateColumns: `minmax(11rem,1.35fr) repeat(${Math.max(analytics.categories.length, 1)}, minmax(6rem,1fr))`,
  };
  const selectedKey = selectedCell ? selectedCellKey(selectedCell) : null;

  return (
    <div id="wallet-heatmap" className="scroll-mt-24">
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
                      const cell = { segmentId: segment.id, category: category.category };

                      return (
                        <HeatmapCellButton
                          key={category.category}
                          segment={segment}
                          category={category}
                          relative={relative}
                          score={score}
                          maxScore={maxScore}
                          isSelected={selectedKey === selectedCellKey(cell)}
                          onSelectCell={onSelectCell}
                        />
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
                      const cell = { segmentId: segment.id, category: category.category };

                      return (
                        <HeatmapCellButton
                          key={category.category}
                          segment={segment}
                          category={category}
                          relative={relative}
                          score={score}
                          maxScore={maxScore}
                          isSelected={selectedKey === selectedCellKey(cell)}
                          onSelectCell={onSelectCell}
                        />
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
    </div>
  );
}

function selectedWalletOpportunity(analytics: WalletAnalytics, selectedCell: SelectedWalletCell | null) {
  if (!selectedCell) return null;

  const segment = analytics.segments.find((item) => item.id === selectedCell.segmentId);
  const category = analytics.categories.find((item) => item.category === selectedCell.category);

  if (!segment || !category) return null;

  const maxScore = heatmapMaxScore(analytics);
  const score = segment.categoryLeakageScores[category.category] ?? 0;

  return {
    segment,
    category,
    relativePriority: relativeScorePct(score, maxScore),
  };
}

function recommendedWalletAction(segmentName: string, categoryLabel: string, relativePriority: number) {
  if (relativePriority >= 72) {
    return `Recommended action: Move ${segmentName} into a ${categoryLabel} recapture queue with host-owned prompts, early eligibility checks, and a follow-up audience for the next high-intent visit.`;
  }

  if (relativePriority >= 45) {
    return `Recommended action: Keep ${segmentName} warm with ${categoryLabel} cross-sell prompts and validate the category signal before scaling the audience.`;
  }

  return `Recommended action: Monitor ${segmentName} for ${categoryLabel} movement and reserve activation effort for stronger visible wallet gaps.`;
}

function SelectedWalletOpportunityDetail({
  analytics,
  selectedCell,
}: {
  analytics: WalletAnalytics;
  selectedCell: SelectedWalletCell | null;
}) {
  const opportunity = selectedWalletOpportunity(analytics, selectedCell);

  return (
    <section
      id="wallet-selected-detail"
      role="region"
      aria-label="Selected wallet opportunity detail"
      className="scroll-mt-24"
    >
      <Panel className="p-4 sm:p-6">
        {opportunity ? (
          <>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <Overline>Selected opportunity</Overline>
                <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">
                  {opportunity.segment.name} x {opportunity.category.label}
                </h2>
              </div>
              <CdeChip />
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]">
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricTile
                  label="Relative priority"
                  value={(
                    <InsightTooltip
                      title="Relative wallet gap priority"
                      lines={[
                        `${opportunity.segment.name} x ${opportunity.category.label} ranks at ${opportunity.relativePriority}% of the strongest visible gap.`,
                        'The priority normalizes segment and category scores for comparison inside the current dashboard cut.',
                      ]}
                    >
                      <PercentValue value={opportunity.relativePriority} />
                    </InsightTooltip>
                  )}
                  detail="Compared with the highest visible cell."
                />
                <MetricTile
                  label="Category leakage"
                  value={<PercentValue value={opportunity.category.leakagePct} />}
                  detail={`${opportunity.category.label} market remainder visible in CDE.`}
                />
                <MetricTile
                  label="Wallet intensity"
                  value={(
                    <InsightTooltip
                      title="Wallet intensity index"
                      lines={[
                        `${opportunity.category.label} wallet intensity is ${opportunity.category.walletIndex} index.`,
                        'Index values compare category demand against the modelled CDE baseline without raw spend values.',
                      ]}
                    >
                      <IndexValue value={opportunity.category.walletIndex} />
                    </InsightTooltip>
                  )}
                  detail="Category-level CDE demand signal."
                />
              </div>
              <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
                <div className="grid gap-3 text-sm text-galaxy-muted sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
                      Segment
                    </p>
                    <p className="mt-1 font-semibold text-galaxy-cream">{opportunity.segment.name}</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
                      Category
                    </p>
                    <p className="mt-1 font-semibold text-galaxy-cream">{opportunity.category.label}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-galaxy-muted">
                  {recommendedWalletAction(
                    opportunity.segment.name,
                    opportunity.category.label,
                    opportunity.relativePriority,
                  )}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div>
            <Overline>Selected opportunity</Overline>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">No selected opportunity</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-galaxy-muted">
              No segment-level wallet opportunity is available for this quarter. Once CDE segments load, selecting a
              heatmap cell will show the relative priority, leakage, intensity, and recommended action.
            </p>
          </div>
        )}
      </Panel>
    </section>
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
  const { methodology, selectedQuarter, segments } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<CategorySelection>('all');
  const [selectedCell, setSelectedCell] = useState<SelectedWalletCell | null>(null);
  const safeSegments = useMemo(() => (segments ?? []).filter(isSegment), [segments]);
  const scatterSegments = useMemo(() => chartReadySegments(safeSegments), [safeSegments]);
  const categories = useMemo(() => visibleCategories(selectedCategory), [selectedCategory]);
  const walletAnalytics = useMemo(
    () => buildWalletAnalytics(safeSegments, categories),
    [safeSegments, categories],
  );
  const resolvedSelectedCell = resolveSelectedWalletCell(walletAnalytics, selectedCell);
  const hasSegments = safeSegments.length > 0;
  const averageOnlinePct = roundedAverage(safeSegments.map((segment) => validNumber(segment.metrics?.channelShareOnlinePct)));

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Wallet analytics"
        title="Share of Wallet"
        description={(
          <>
            Prioritize Galaxy wallet gaps by segment, category, and channel signal. CDE-enriched values remain indexed,
            percentage-based, or banded.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">{selectedQuarter.label}</p>
            <p className="mt-2">
              Wallet and visit signals are modelled from Mastercard CDE segment behavior.
            </p>
          </>
        )}
      />

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

      <SectionJumpNav
        label="Wallet dashboard sections"
        currentId="wallet-heatmap"
        items={[
          { id: 'wallet-heatmap', label: 'Heatmap' },
          { id: 'wallet-selected-detail', label: 'Detail' },
          { id: 'wallet-drivers', label: 'Drivers' },
          { id: 'wallet-evidence', label: 'Evidence' },
        ]}
      />

      <SnapshotStatusStrip
        quarterLabel={selectedQuarter.label}
        methodology={methodology}
        context="Wallet model"
      />

      <SegmentOpportunityHeatmap
        analytics={walletAnalytics}
        hasSegments={hasSegments}
        selectedCell={resolvedSelectedCell}
        onSelectCell={setSelectedCell}
      />
      <SelectedWalletOpportunityDetail analytics={walletAnalytics} selectedCell={resolvedSelectedCell} />

      <div id="wallet-drivers" className="grid scroll-mt-24 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <RankedCategoryLeakage analytics={walletAnalytics} hasSegments={hasSegments} />
        <SegmentGapLadder analytics={walletAnalytics} hasSegments={hasSegments} />
      </div>

      <AnalyticsSnapshot analytics={walletAnalytics} hasSegments={hasSegments} />

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

      <div id="wallet-evidence" className="grid scroll-mt-24 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
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
