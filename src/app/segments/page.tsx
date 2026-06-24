'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PropensityGauge } from '@/components/charts/propensity-gauge';
import { SpendRadar } from '@/components/charts/spend-radar';
import { CdeMetricPanel } from '@/components/panels/cde-metric-panel';
import { CrmAppendTable } from '@/components/panels/crm-append-table';
import { SegmentCard } from '@/components/panels/segment-card';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { crmRows, type Segment } from '@/data';
import { useAppState } from '@/store/app-store';

function finiteValue(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function hasRenderableSegmentId(segment: Partial<Segment> | undefined): segment is Partial<Segment> & { id: string } {
  return typeof segment?.id === 'string' && segment.id.trim().length > 0;
}

function normalizeCategory(category: Segment['categories']['hospitality'] | undefined) {
  const capturedSharePct = finiteValue(category?.capturedSharePct);

  return {
    capturedSharePct,
    leakagePct: finiteValue(category?.leakagePct, 100 - capturedSharePct),
    totalWalletIndex: finiteValue(category?.totalWalletIndex, 100),
    sub: category?.sub ?? {},
  };
}

function normalizeSegmentForView(segment: Segment): Segment {
  const name = safeText(segment.name, 'Unnamed Segment');
  const metrics = segment.metrics;
  const propensities = segment.propensities;

  return {
    ...segment,
    name,
    nameZh: safeText(segment.nameZh, 'Customer 360'),
    colorToken: segment.colorToken ?? 'gold',
    sizeLowK: finiteValue(segment.sizeLowK),
    sizeHighK: finiteValue(segment.sizeHighK),
    sizeBand: safeText(segment.sizeBand, '~0-0k matched guests'),
    signatureTrait: safeText(
      segment.signatureTrait,
      'Segment profile is available with limited CDE fields.',
    ),
    metrics: {
      shareOfWallet: finiteValue(metrics?.shareOfWallet),
      shareOfVisits: finiteValue(metrics?.shareOfVisits),
      avgTxnCountIndex: finiteValue(metrics?.avgTxnCountIndex),
      avgTxnSizeIndex: finiteValue(metrics?.avgTxnSizeIndex),
      avgIndustrySpendIndex: finiteValue(metrics?.avgIndustrySpendIndex),
      channelShareOnlinePct: finiteValue(metrics?.channelShareOnlinePct),
      channelVisitsIndex: finiteValue(metrics?.channelVisitsIndex),
    },
    propensities: {
      luxuryHotelSpender: finiteValue(propensities?.luxuryHotelSpender),
      topTierRewards: finiteValue(propensities?.topTierRewards),
      coBrandLookAlike: finiteValue(propensities?.coBrandLookAlike),
    },
    categories: {
      hospitality: normalizeCategory(segment.categories?.hospitality),
      fnb: normalizeCategory(segment.categories?.fnb),
      entertainment: normalizeCategory(segment.categories?.entertainment),
      retailLuxury: normalizeCategory(segment.categories?.retailLuxury),
    },
    gamingContextIndex: finiteValue(segment.gamingContextIndex, 100),
    crossPropertyCashIndex: finiteValue(segment.crossPropertyCashIndex, 100),
    crossPropertyCashBand: safeText(segment.crossPropertyCashBand, 'Indexed band equiv./mo'),
    opportunityIndex: finiteValue(segment.opportunityIndex),
    recommendedPlays: Array.isArray(segment.recommendedPlays) ? segment.recommendedPlays : [],
  };
}

export default function SegmentsPage() {
  const { segments, selectedSegment, setSelectedSegmentId } = useAppState();
  const safeSegments = useMemo(
    () => (segments ?? []).filter(hasRenderableSegmentId).map((segment) => normalizeSegmentForView(segment as Segment)),
    [segments],
  );
  const initialSelectedId = selectedSegment?.id ?? safeSegments[0]?.id ?? '';
  const [focusedSegmentId, setFocusedSegmentId] = useState(initialSelectedId);
  const activeSegment = safeSegments.find((segment) => segment.id === focusedSegmentId)
    ?? safeSegments.find((segment) => segment.id === selectedSegment?.id)
    ?? safeSegments[0];

  function selectSegment(segmentId: string) {
    setFocusedSegmentId(segmentId);
    setSelectedSegmentId(segmentId);
  }

  return (
    <div className="space-y-6 text-galaxy-cream">
      <section className="rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_left,rgba(205,164,92,0.18),transparent_34%),linear-gradient(135deg,rgba(31,27,24,0.96),rgba(8,18,30,0.92))] px-6 py-8 shadow-2xl shadow-black/25 md:px-8">
        <Overline>Zoom to a segment</Overline>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <h1 className="font-serif text-5xl text-galaxy-cream md:text-6xl">Guest Segments</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
              Explore the Customer 360 view for Galaxy guest segments, using masked CRM records and Mastercard CDE
              enrichments to support activation without exposing raw spend values.
            </p>
          </div>
          <div className="rounded-lg border border-galaxy-gold/30 bg-galaxy-ink/45 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">CDE-compliant profile</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Segment cards, propensity scores, and CRM append fields stay at indexed, percentage, or banded levels.
            </p>
          </div>
        </div>
      </section>

      {activeSegment ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
            <div role="group" className="space-y-3" aria-label="Segment rail">
              {safeSegments.map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  isSelected={segment.id === activeSegment.id}
                  onSelect={selectSegment}
                />
              ))}
            </div>

            <div className="space-y-6">
              <Panel className="bg-[linear-gradient(135deg,rgba(205,164,92,0.12),rgba(12,23,35,0.78))]">
                <Overline>{activeSegment.nameZh}</Overline>
                <h2 className="mt-3 font-serif text-4xl text-galaxy-cream">{activeSegment.name}</h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-galaxy-muted">
                  {activeSegment.signatureTrait}
                </p>
              </Panel>

              <CdeMetricPanel metrics={activeSegment.metrics} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <Panel>
              <div className="mb-5">
                <Overline>Category spend radar</Overline>
                <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Indexed category profile</h2>
              </div>
              <SpendRadar segment={activeSegment} />
              <p className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
                Gaming context is first-party indexed only and not a leakage category.
              </p>
            </Panel>

            <Panel>
              <Overline>Propensity</Overline>
              <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Activation signals</h2>
              <div className="mt-5 space-y-4">
                <PropensityGauge label="High Spender in Luxury Hotels" value={activeSegment.propensities.luxuryHotelSpender} />
                <PropensityGauge label="Top-Tier Rewards Spender" value={activeSegment.propensities.topTierRewards} />
                <PropensityGauge label="Co-Brand Look-Alike" value={activeSegment.propensities.coBrandLookAlike} />
              </div>
            </Panel>
          </div>

          <Panel>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <Overline>Why this matters</Overline>
                <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Recommended plays</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-galaxy-muted">
                Use the selected segment profile to move directly into audience building and activation planning.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeSegment.recommendedPlays.length > 0 ? activeSegment.recommendedPlays.map((play) => (
                <Link
                  key={play.title}
                  href="/activation"
                  className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 transition hover:border-galaxy-gold/70 focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-galaxy-gold">{play.channel}</p>
                  <h3 className="mt-3 text-lg font-semibold text-galaxy-cream">{play.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-galaxy-muted">{play.rationale}</p>
                  <p className="mt-3 text-sm font-semibold text-galaxy-gold">{play.lever}</p>
                </Link>
              )) : (
                <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
                  No recommended plays available for this segment.
                </p>
              )}
            </div>
          </Panel>

          <Panel>
            <div className="mb-5">
              <Overline>Masked CRM records</Overline>
              <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">CDE-compliant append fields</h2>
            </div>
            <div className="overflow-x-auto">
              <CrmAppendTable rows={crmRows} />
            </div>
          </Panel>
        </>
      ) : (
        <Panel>
          <Overline>Customer 360</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">No guest segments available for this quarter.</h2>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            Select another quarter or refresh the segment feed when CDE segment profiles are available.
          </p>
        </Panel>
      )}
    </div>
  );
}
