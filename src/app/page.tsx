'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { CategoryStackedBar } from '@/components/charts/category-stacked-bar';
import { WalletConstellation } from '@/components/charts/wallet-constellation';
import {
  ChartCallout,
  EvidenceStrip,
  ExecutiveSummaryPanel,
  HeadlineFindings,
} from '@/components/panels/insight-storytelling';
import { AnimatedCount } from '@/components/ui/animated-count';
import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { KpiCard } from '@/components/ui/kpi-card';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES, type Methodology, type Quarter, type Segment } from '@/data';
import { formatPropensity } from '@/lib/format';
import { buildPortfolioInsightNarrative } from '@/lib/insights';
import { useAppState } from '@/store/app-store';

const ConstellationCanvas = dynamic(
  () => import('@/components/visuals/constellation-canvas').then((mod) => mod.ConstellationCanvas),
  { ssr: false },
);

function finiteNumber(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function average(values: number[]) {
  const finiteValues = values.filter(Number.isFinite);

  if (finiteValues.length === 0) return 0;
  return Math.round(finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length);
}

function hasRenderableCategories(segment: Segment) {
  return CORE_CATEGORIES.every((category) => {
    const wallet = segment?.categories?.[category];

    return Number.isFinite(wallet?.capturedSharePct) && Number.isFinite(wallet?.leakagePct);
  });
}

function isSegment(segment: Segment | undefined): segment is Segment {
  return Boolean(segment);
}

function EnrichedTextValue({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{children}</span>
      <CdeChip />
    </span>
  );
}

export default function Home() {
  const { selectedQuarter, segments, methodology } = useAppState();

  return <OverviewRoute selectedQuarter={selectedQuarter} segments={segments} methodology={methodology} />;
}

interface OverviewRouteProps {
  selectedQuarter: Quarter;
  segments?: Segment[];
  methodology: Methodology;
}

function OverviewRoute({ selectedQuarter, segments, methodology }: OverviewRouteProps) {
  const safeSegments: Segment[] = (segments ?? []).filter(isSegment);
  const categorySegments = safeSegments.filter(hasRenderableCategories);
  const matchedGuestLowK = safeSegments.reduce((sum, segment) => sum + finiteNumber(segment?.sizeLowK), 0);
  const matchedGuestHighK = safeSegments.reduce((sum, segment) => sum + finiteNumber(segment?.sizeHighK), 0);
  const walletCapturePct = average(safeSegments.map((segment) => segment?.metrics?.shareOfWallet ?? 0));
  const walletHeadroomPct = average(
    safeSegments.flatMap((segment) => (
      CORE_CATEGORIES.map((category) => segment?.categories?.[category]?.leakagePct ?? 0)
    )),
  );
  const topTierRewardsPropensity = safeSegments.length > 0
    ? safeSegments.reduce((sum, segment) => sum + finiteNumber(segment?.propensities?.topTierRewards), 0) / safeSegments.length
    : 0;
  const topOpportunityIndex = safeSegments.length > 0
    ? Math.max(...safeSegments.map((segment) => finiteNumber(segment?.opportunityIndex)))
    : 0;
  const insightNarrative = buildPortfolioInsightNarrative(safeSegments, methodology);
  const topFindings = insightNarrative.findings.slice(0, 3);

  return (
    <div className="space-y-6 text-galaxy-cream">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        data-testid="overview-constellation-hero"
        className="relative overflow-hidden rounded-2xl border border-galaxy-gold/25 bg-galaxy-ink px-6 py-8 shadow-[0_0_60px_rgba(201,164,92,0.16)] md:px-8"
      >
        <ConstellationCanvas />
        <div className="relative z-10">
          <Overline>客戶錢包洞察 · Guest Wallet Intelligence</Overline>
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="font-serif text-5xl text-galaxy-cream md:text-7xl"
              >
                Galaxy Constellation
              </motion.h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
                Galaxy already knows stay, dining and rewards behavior. Mastercard CDE adds modelled off-property
                wallet, leakage and propensity so each quarter starts with a clear pitch priority.
              </p>
            </div>
            <div className="rounded-2xl border border-galaxy-gold/30 bg-galaxy-charcoal/55 p-5 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-galaxy-gold">
                {selectedQuarter.label}
                <CdeChip />
              </div>
              <p className="mt-3 text-sm leading-6 text-galaxy-muted">
                Mastercard CDE refresh, {methodology.basis}, matched coverage{' '}
                <span className="text-galaxy-cream">{methodology.matchedCoveragePct}%</span>.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <ExecutiveSummaryPanel narrative={insightNarrative} />

      <section className="grid auto-rows-[minmax(11rem,auto)] gap-4 lg:grid-cols-4">
        <Panel variant="hero" className="lg:col-span-2 lg:row-span-2">
          <Overline>Wallet headroom</Overline>
          <div className="mt-5 font-serif text-6xl text-galaxy-gold md:text-7xl">
            <AnimatedCount value={walletHeadroomPct} suffix="%" ariaLabel="Estimated wallet headroom" />
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-galaxy-muted">
            Average modelled leakage still addressable across hospitality, dining, entertainment and retail-luxury
            categories.
          </p>
        </Panel>
        <KpiCard
          label="Matched guest base"
          value={<EnrichedTextValue>{`~${matchedGuestLowK}-${matchedGuestHighK}k`}</EnrichedTextValue>}
          detail="Matched active segments modelled from CDE coverage."
        />
        <KpiCard
          label="Galaxy wallet capture"
          value={<PercentValue value={walletCapturePct} />}
          detail="Average hospitality share across current-quarter segments."
        />
        <Panel variant="glass" className="lg:col-span-2">
          <Overline>Top ranked finding</Overline>
          <p className="mt-3 text-lg font-semibold leading-7 text-galaxy-cream">
            {topFindings[0]?.title ?? 'No active CDE segment insights available for this quarter.'}
          </p>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            {topFindings[0]?.finding ?? 'Refresh the segment feed to generate ranked findings.'}
          </p>
        </Panel>
        <KpiCard
          label="Top-tier rewards propensity"
          value={<EnrichedTextValue>{formatPropensity(topTierRewardsPropensity)}</EnrichedTextValue>}
          detail="Mean likelihood signal for premium rewards activation."
        />
        <KpiCard
          label="Opportunity benchmark"
          value={<IndexValue value={topOpportunityIndex} />}
          detail="Highest current-quarter segment opportunity index."
        />
      </section>

      <WalletConstellation segments={safeSegments} />

      <EvidenceStrip steps={insightNarrative.fusionSteps} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Panel>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <Overline>Wallet Split</Overline>
              <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Category wallet snapshot</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-galaxy-muted">
              Category capture is averaged across selected segments to expose where Galaxy already holds wallet
              share and where competitor leakage remains actionable.
            </p>
          </div>
          <div className="space-y-5">
            {categorySegments.length > 0 ? (
              CORE_CATEGORIES.map((category) => (
                <CategoryStackedBar key={category} segments={categorySegments} category={category} />
              ))
            ) : (
              <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm text-galaxy-muted">
                No category wallet segments available for this quarter.
              </p>
            )}
          </div>
          <div className="mt-5">
            <ChartCallout>{insightNarrative.chartCallout}</ChartCallout>
          </div>
        </Panel>

        <HeadlineFindings title="This period's headline findings" findings={topFindings} />
      </div>
    </div>
  );
}
