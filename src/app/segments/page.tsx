'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PropensityGauge } from '@/components/charts/propensity-gauge';
import { SpendRadar } from '@/components/charts/spend-radar';
import { CdeMetricPanel } from '@/components/panels/cde-metric-panel';
import { CrmAppendTable } from '@/components/panels/crm-append-table';
import {
  ChartCallout,
  EvidenceStrip,
  ExecutiveSummaryPanel,
  HeadlineFindings,
} from '@/components/panels/insight-storytelling';
import { PersonaCard } from '@/components/panels/persona-card';
import { PersonaDetailKit } from '@/components/panels/persona-detail-kit';
import { PersonaFilterBar } from '@/components/panels/persona-filter-bar';
import { PersonaUniverse } from '@/components/panels/persona-universe';
import { SegmentCard } from '@/components/panels/segment-card';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { SectionJumpNav } from '@/components/ui/section-jump-nav';
import { SectionHeader } from '@/components/ui/section-header';
import { SnapshotStatusStrip } from '@/components/ui/snapshot-status-strip';
import { crmRows, type PersonaPriority, type PersonaWealthTier, type Segment } from '@/data';
import { buildSegmentInsightNarrative } from '@/lib/insights';
import {
  filterPersonas,
  getPersonaUniverseSummary,
  type PersonaSortMode,
} from '@/lib/personas';
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
  const {
    methodology,
    selectedQuarter,
    segments,
    selectedSegment,
    selectedPersonaId,
    setSelectedPersonaId,
    setSelectedSegmentId,
  } = useAppState();
  const safeSegments = useMemo(
    () => (segments ?? []).filter(hasRenderableSegmentId).map((segment) => normalizeSegmentForView(segment as Segment)),
    [segments],
  );
  const initialSelectedId = selectedSegment?.id ?? safeSegments[0]?.id ?? '';
  const [focusedSegmentId, setFocusedSegmentId] = useState(initialSelectedId);
  const activeSegment = safeSegments.find((segment) => segment.id === focusedSegmentId)
    ?? safeSegments.find((segment) => segment.id === selectedSegment?.id)
    ?? safeSegments[0];
  const insightNarrative = activeSegment ? buildSegmentInsightNarrative(activeSegment) : null;
  const [focusedPersonaId, setFocusedPersonaId] = useState(selectedPersonaId);
  const [personaQuery, setPersonaQuery] = useState('');
  const [personaWealthTier, setPersonaWealthTier] = useState<PersonaWealthTier | 'All'>('All');
  const [personaPriority, setPersonaPriority] = useState<PersonaPriority | 'All'>('All');
  const [personaSort, setPersonaSort] = useState<PersonaSortMode>('opportunity');
  const personaSummary = useMemo(() => getPersonaUniverseSummary(), []);
  const filteredPersonas = useMemo(
    () => filterPersonas({
      segmentId: activeSegment?.id,
      wealthTier: personaWealthTier,
      priority: personaPriority,
      query: personaQuery,
      sort: personaSort,
    }),
    [activeSegment?.id, personaPriority, personaQuery, personaSort, personaWealthTier],
  );
  const selectedPersona = useMemo(() => {
    if (!activeSegment) return null;

    return filteredPersonas.find((persona) => persona.id === focusedPersonaId)
      ?? filteredPersonas[0]
      ?? null;
  }, [activeSegment, filteredPersonas, focusedPersonaId]);

  useEffect(() => {
    setFocusedPersonaId(selectedPersonaId);
  }, [selectedPersonaId]);

  useEffect(() => {
    if (selectedPersona && selectedPersona.id !== selectedPersonaId) {
      setSelectedPersonaId(selectedPersona.id);
    }
  }, [selectedPersona, selectedPersonaId, setSelectedPersonaId]);

  function selectPersona(personaId: string) {
    setFocusedPersonaId(personaId);
    setSelectedPersonaId(personaId);
  }

  function selectSegment(segmentId: string) {
    setFocusedSegmentId(segmentId);
    setSelectedSegmentId(segmentId);
    setFocusedPersonaId('');
    setSelectedPersonaId('');
    setPersonaQuery('');
    setPersonaWealthTier('All');
    setPersonaPriority('All');
    setPersonaSort('opportunity');
  }

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Guest segmentation"
        title="Guest Segments"
        description={(
          <>
            Move from top-level CDE segments into second-level personas, recommendation kits, and activation-ready
            audience decisions without exposing raw spend values.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">CDE-compliant profile</p>
            <p className="mt-2">
              Segment cards, propensity scores, and CRM append fields stay indexed, percentage-based, or banded.
            </p>
          </>
        )}
      />

      <Panel className="border-galaxy-gold/30 bg-galaxy-gold/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Close the loop</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Lens A grows wallet from known guests. Lens B finds the next source markets to acquire.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/corridors"
              className="inline-flex rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink hover:bg-galaxy-gold-lite"
            >
              Explore acquisition corridors
            </Link>
            <Link
              href={`/guests?segment=${encodeURIComponent(activeSegment?.id ?? '')}`}
              className="inline-flex rounded-md border border-galaxy-gold/50 px-4 py-2 text-sm font-semibold text-galaxy-gold hover:bg-galaxy-gold/10"
            >
              See guests in this segment
            </Link>
          </div>
        </div>
      </Panel>

      <SectionJumpNav
        label="Segmentation sections"
        items={[
          { id: 'segment-brief', label: 'Brief' },
          { id: 'segment-personas', label: 'Personas' },
          { id: 'segment-persona-kit', label: 'Kit' },
          { id: 'segment-actions', label: 'Actions' },
        ]}
      />

      <SnapshotStatusStrip
        quarterLabel={selectedQuarter.label}
        methodology={methodology}
        context="Segment and persona model"
      />

      {activeSegment ? (
        <>
          <div id="segment-brief" className="grid scroll-mt-24 gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
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
                <SectionHeader
                  eyebrow={activeSegment.nameZh}
                  title={activeSegment.name}
                  description={activeSegment.signatureTrait}
                />
              </Panel>

              {insightNarrative ? (
                <>
                  <ExecutiveSummaryPanel narrative={insightNarrative} />
                  <EvidenceStrip steps={insightNarrative.fusionSteps} />
                  <HeadlineFindings title="Why this segment matters now" findings={insightNarrative.findings} />
                </>
              ) : null}
            </div>
          </div>

          <section id="segment-personas" className="scroll-mt-24 space-y-6" aria-label="Segment persona analysis">
            <PersonaUniverse summary={personaSummary} />

            <Panel>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <SectionHeader
                  eyebrow="Persona drill-down"
                  title="Persona explorer"
                  description="Second-level personas translate the selected Galaxy segment into audience-sized actions, CDE evidence, and activation recommendations."
                />
              </div>

              <PersonaFilterBar
                query={personaQuery}
                wealthTier={personaWealthTier}
                priority={personaPriority}
                sort={personaSort}
                onQueryChange={setPersonaQuery}
                onWealthTierChange={setPersonaWealthTier}
                onPriorityChange={setPersonaPriority}
                onSortChange={setPersonaSort}
              />

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {filteredPersonas.length > 0 && selectedPersona ? filteredPersonas.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    isSelected={persona.id === selectedPersona.id}
                    onSelect={selectPersona}
                  />
                )) : (
                  <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted lg:col-span-3">
                    No personas match the current filters for this segment.
                  </p>
                )}
              </div>
            </Panel>
          </section>

          <section id="segment-persona-kit" className="scroll-mt-24">
            {selectedPersona ? (
              <PersonaDetailKit persona={selectedPersona} />
            ) : (
              <Panel>
                <SectionHeader
                  eyebrow="Persona recommendation kit"
                  title="No persona kit available"
                  description="Adjust the persona filters to select an audience before building a recommendation kit."
                />
              </Panel>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <Panel>
              <div className="mb-5">
                <SectionHeader eyebrow="Category spend radar" title="Indexed category profile" />
              </div>
              <SpendRadar segment={activeSegment} />
              {insightNarrative ? (
                <div className="mt-5">
                  <ChartCallout>{insightNarrative.chartCallout}</ChartCallout>
                </div>
              ) : null}
              <p className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
                Gaming context is first-party indexed only and not a leakage category.
              </p>
            </Panel>

            <Panel>
              <SectionHeader eyebrow="Propensity" title="Activation signals" />
              <div className="mt-5 space-y-4">
                <PropensityGauge label="High Spender in Luxury Hotels" value={activeSegment.propensities.luxuryHotelSpender} />
                <PropensityGauge label="Top-Tier Rewards Spender" value={activeSegment.propensities.topTierRewards} />
                <PropensityGauge label="Co-Brand Look-Alike" value={activeSegment.propensities.coBrandLookAlike} />
              </div>
            </Panel>
          </div>

          <CdeMetricPanel metrics={activeSegment.metrics} />

          <div id="segment-actions" className="scroll-mt-24">
            <Panel>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <SectionHeader
                  eyebrow="Why this matters"
                  title="Recommended plays"
                  description="Use the selected segment profile to move directly into audience building and activation planning."
                />
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
          </div>

          <Panel>
            <div className="mb-5">
              <SectionHeader eyebrow="Masked CRM records" title="CDE-compliant append fields" />
            </div>
            <div className="overflow-x-auto">
              <CrmAppendTable rows={crmRows} />
            </div>
          </Panel>
        </>
      ) : (
        <Panel>
          <SectionHeader
            eyebrow="Customer 360"
            title="No guest segments available for this quarter."
            description="Select another quarter or refresh the segment feed when CDE segment profiles are available."
          />
        </Panel>
      )}
    </div>
  );
}
