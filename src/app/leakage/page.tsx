'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { LeakageFlow } from '@/components/charts/leakage-flow';
import { BandValue, IndexValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES, type CoreCategory, type Segment } from '@/data';
import { useAppState } from '@/store/app-store';

const CATEGORY_LABELS: Record<CoreCategory, string> = {
  hospitality: 'Competitor hospitality',
  fnb: 'Off-property F&B',
  entertainment: 'Off-property entertainment',
  retailLuxury: 'Off-property luxury retail',
};

function finiteValue(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function safeBand(value: unknown) {
  const text = safeText(value, '0-0k equiv./mo');

  if (/\b(?:MOP|HKD)\b|\$|元|澳門幣/i.test(text) || !text.includes('equiv./mo')) {
    return '0-0k equiv./mo';
  }

  return text;
}

function normalizeCategory(category: Segment['categories'][CoreCategory] | undefined) {
  const capturedSharePct = finiteValue(category?.capturedSharePct);

  return {
    capturedSharePct,
    leakagePct: finiteValue(category?.leakagePct, Math.max(0, 100 - capturedSharePct)),
    totalWalletIndex: finiteValue(category?.totalWalletIndex, 100),
    sub: category?.sub ?? {},
  };
}

function normalizeSegment(segment: Segment, index = 0): Segment {
  const metrics = segment.metrics;
  const propensities = segment.propensities;

  return {
    ...segment,
    id: safeText(segment.id, `segment-${index + 1}`),
    name: safeText(segment.name, `Segment ${index + 1}`),
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
    crossPropertyCashIndex: finiteValue(segment.crossPropertyCashIndex),
    crossPropertyCashBand: safeBand(segment.crossPropertyCashBand),
    opportunityIndex: finiteValue(segment.opportunityIndex),
    recommendedPlays: Array.isArray(segment.recommendedPlays) ? segment.recommendedPlays : [],
  };
}

function fallbackSegment(): Segment {
  return normalizeSegment({
    id: 'no-segment',
    name: 'No segment selected',
    nameZh: 'Customer 360',
    colorToken: 'gold',
    sizeBand: '~0-0k matched guests',
    sizeLowK: 0,
    sizeHighK: 0,
    signatureTrait: 'Segment profile is available with limited CDE fields.',
    metrics: {
      shareOfWallet: 0,
      shareOfVisits: 0,
      avgTxnCountIndex: 0,
      avgTxnSizeIndex: 0,
      avgIndustrySpendIndex: 0,
      channelShareOnlinePct: 0,
      channelVisitsIndex: 0,
    },
    propensities: {
      luxuryHotelSpender: 0,
      topTierRewards: 0,
      coBrandLookAlike: 0,
    },
    categories: {
      hospitality: { capturedSharePct: 0, leakagePct: 0, totalWalletIndex: 100 },
      fnb: { capturedSharePct: 0, leakagePct: 0, totalWalletIndex: 100 },
      entertainment: { capturedSharePct: 0, leakagePct: 0, totalWalletIndex: 100 },
      retailLuxury: { capturedSharePct: 0, leakagePct: 0, totalWalletIndex: 100 },
    },
    crossPropertyCashIndex: 0,
    crossPropertyCashBand: '0-0k equiv./mo',
    opportunityIndex: 0,
    recommendedPlays: [],
  });
}

function dominantLeakage(segment: Segment) {
  return CORE_CATEGORIES.reduce((dominant, category) => {
    const currentLeakage = finiteValue(segment.categories[category]?.leakagePct);
    const dominantLeakageValue = finiteValue(segment.categories[dominant]?.leakagePct);

    return currentLeakage > dominantLeakageValue ? category : dominant;
  }, 'hospitality' as CoreCategory);
}

export default function LeakagePage() {
  const { segments, selectedSegment, setSelectedSegmentId } = useAppState();
  const safeSegments = useMemo(
    () => (segments ?? []).map((segment, index) => normalizeSegment(segment, index)),
    [segments],
  );
  const activeSegment = safeSegments.find((segment) => segment.id === selectedSegment?.id)
    ?? (selectedSegment ? normalizeSegment(selectedSegment) : undefined)
    ?? safeSegments[0]
    ?? fallbackSegment();
  const rankedSegments = useMemo(
    () => [...safeSegments].sort((first, second) => second.opportunityIndex - first.opportunityIndex),
    [safeSegments],
  );

  return (
    <div className="space-y-6 text-galaxy-cream">
      <section className="rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_left,rgba(205,164,92,0.2),transparent_34%),linear-gradient(135deg,rgba(31,27,24,0.96),rgba(8,18,30,0.92))] px-6 py-8 shadow-2xl shadow-black/25 md:px-8">
        <Overline>Find the money</Overline>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <h1 className="font-serif text-5xl text-galaxy-cream md:text-6xl">Cross-Property Leakage</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
              Quantify where known Galaxy guests are still spending across competitor hotels, retail, dining, and
              entertainment, then prioritize the segments with the clearest win-back path.
            </p>
          </div>
          <div
            role="region"
            aria-label="Headline opportunity index"
            className="rounded-lg border border-galaxy-gold/30 bg-galaxy-ink/45 p-4"
          >
            <p className="text-sm font-semibold text-galaxy-gold">Headline opportunity index</p>
            <div className="mt-3 text-3xl font-semibold text-galaxy-cream">
              <IndexValue value={activeSegment.opportunityIndex} />
            </div>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">
              <BandValue value={activeSegment.crossPropertyCashBand} />
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel>
          <Overline>{activeSegment.name}</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Opportunity narrative</h2>
          <p className="mt-4 text-base leading-8 text-galaxy-muted">
            A guest stays with Galaxy but spends an estimated {activeSegment.crossPropertyCashBand} at other hotels in
            cash. That is opportunity cost Galaxy can recapture with sharper timing, audience selection, and
            cross-property offers.
          </p>
        </Panel>

        <Panel>
          <div role="region" aria-label="cross-site cash spend">
            <Overline>cross-site cash spend</Overline>
            <div className="mt-4 text-4xl font-semibold text-galaxy-gold">
              <IndexValue value={activeSegment.crossPropertyCashIndex} />
            </div>
            <p className="mt-4 text-sm leading-6 text-galaxy-muted">
              Cross-property cash behavior is modelled, not itemised, and remains at indexed or banded CDE levels.
            </p>
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="mb-5">
          <Overline>Leakage flow</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Where the wallet leaves Galaxy</h2>
        </div>
        <LeakageFlow segment={activeSegment} />
      </Panel>

      <Panel>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Overline>Win-back targets</Overline>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Ranked audience priorities</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-galaxy-muted">
            Ranking uses the opportunity index so activation starts with the largest recapture headroom.
          </p>
        </div>
        {rankedSegments.length > 0 ? (
          <div className="overflow-x-auto">
            <table aria-label="Win-back target segments" className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-galaxy-gold">
                  <th scope="col" className="border-b border-galaxy-border px-4 py-3 font-semibold">Segment</th>
                  <th scope="col" className="border-b border-galaxy-border px-4 py-3 font-semibold">Leakage index</th>
                  <th scope="col" className="border-b border-galaxy-border px-4 py-3 font-semibold">Dominant leakage</th>
                  <th scope="col" className="border-b border-galaxy-border px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rankedSegments.map((segment) => {
                  const dominantCategory = dominantLeakage(segment);

                  return (
                    <tr key={segment.id} className="text-sm text-galaxy-muted">
                      <td className="border-b border-galaxy-border/70 px-4 py-4 font-semibold text-galaxy-cream">
                        {segment.name}
                      </td>
                      <td className="border-b border-galaxy-border/70 px-4 py-4">
                        <IndexValue value={segment.opportunityIndex} />
                      </td>
                      <td className="border-b border-galaxy-border/70 px-4 py-4">
                        {CATEGORY_LABELS[dominantCategory]}
                      </td>
                      <td className="border-b border-galaxy-border/70 px-4 py-4">
                        <Link
                          href="/propensity"
                          aria-label={`Build audience for ${segment.name}`}
                          onClick={() => setSelectedSegmentId(segment.id)}
                          className="font-semibold text-galaxy-gold transition hover:text-galaxy-cream focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
                        >
                          Build audience
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
            No leakage segments available for this quarter.
          </p>
        )}
      </Panel>
    </div>
  );
}
