'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CategoryStackedBar } from '@/components/charts/category-stacked-bar';
import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { KpiCard } from '@/components/ui/kpi-card';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES } from '@/data';
import { formatPropensity } from '@/lib/format';
import { useAppState } from '@/store/app-store';

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
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
  const matchedGuestLowK = segments.reduce((sum, segment) => sum + segment.sizeLowK, 0);
  const matchedGuestHighK = segments.reduce((sum, segment) => sum + segment.sizeHighK, 0);
  const walletCapturePct = average(segments.map((segment) => segment.metrics.shareOfWallet));
  const walletHeadroomPct = average(
    segments.flatMap((segment) => CORE_CATEGORIES.map((category) => segment.categories[category].leakagePct)),
  );
  const topTierRewardsPropensity = (
    segments.reduce((sum, segment) => sum + segment.propensities.topTierRewards, 0) / segments.length
  );
  const topOpportunityIndex = Math.max(...segments.map((segment) => segment.opportunityIndex));
  const topOpportunities = [...segments]
    .sort((first, second) => second.opportunityIndex - first.opportunityIndex)
    .slice(0, 3);

  return (
    <div className="space-y-6 text-galaxy-cream">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="overflow-hidden rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_left,rgba(205,164,92,0.24),transparent_38%),linear-gradient(135deg,rgba(31,27,24,0.96),rgba(8,18,30,0.92))] px-6 py-8 shadow-2xl shadow-black/25 md:px-8"
      >
        <Overline>客戶錢包洞察 · Guest Wallet Intelligence</Overline>
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <h1 className="font-serif text-5xl text-galaxy-cream md:text-6xl">Galaxy Constellation</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
              CDE-enriched wallet intelligence maps matched Galaxy guests against broader category behavior,
              turning share, visit, channel, and rewards propensity signals into quarterly growth priorities.
            </p>
          </div>
          <div className="rounded-lg border border-galaxy-gold/30 bg-galaxy-ink/45 p-5">
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
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <KpiCard
          label="Estimated wallet headroom"
          value={<PercentValue value={walletHeadroomPct} />}
          detail={(
            <span className="inline-flex flex-wrap items-center gap-2">
              Highest opportunity benchmark <IndexValue value={topOpportunityIndex} />
            </span>
          )}
        />
        <KpiCard
          label="Top-tier rewards propensity"
          value={<EnrichedTextValue>{formatPropensity(topTierRewardsPropensity)}</EnrichedTextValue>}
          detail="Mean likelihood signal for premium rewards activation."
        />
      </section>

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
            {CORE_CATEGORIES.map((category) => (
              <CategoryStackedBar key={category} segments={segments} category={category} />
            ))}
          </div>
        </Panel>

        <Panel>
          <Overline>Priority Plays</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Top 3 opportunities this quarter</h2>
          <div className="mt-6 space-y-4">
            {topOpportunities.map((segment, index) => (
              <Link
                key={segment.id}
                href="/leakage"
                className="block rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 transition hover:border-galaxy-gold/60 hover:bg-galaxy-gold/10 focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                      Opportunity {index + 1}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-galaxy-cream">{segment.name}</h3>
                  </div>
                  <IndexValue value={segment.opportunityIndex} />
                </div>
                <p className="mt-3 text-sm leading-6 text-galaxy-muted">{segment.signatureTrait}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
