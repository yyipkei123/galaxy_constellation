'use client';

import { useMemo, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { formatEnriched } from '@/lib/format';
import {
  buildConstellationRedesignModel,
  type ConstellationRedesignModel,
  type RedesignPageId,
} from './constellation-redesign-model';

interface ConstellationRedesignScreenProps {
  pageId: RedesignPageId;
  quarterLabel: string;
  coveragePct: number;
  activeMetricCount: number;
}

type Metric = ConstellationRedesignModel['kpis'][number];
type Stat = ConstellationRedesignModel['selectedStats'][number];
type Node = ConstellationRedesignModel['constellationNodes'][number];
type SegmentRow = ConstellationRedesignModel['segmentRows'][number];
type ChannelState = Record<string, boolean>;
type AiAnswerKey = 'explain' | 'trust' | 'brief';

interface SharedRouteControls {
  windowWeeks: number;
  setWindowWeeks: (weeks: number) => void;
  reachPct: number;
  setReachPct: (pct: number) => void;
  depthPct: number;
  setDepthPct: (pct: number) => void;
  exported: boolean;
  setExported: (exported: boolean) => void;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  aiAnswerKey: AiAnswerKey | null;
  setAiAnswerKey: (key: AiAnswerKey | null) => void;
  aiInput: string;
  setAiInput: (input: string) => void;
  onToggleChannel: (channel: string) => void;
  onSelectSegment: (segmentId: string) => void;
}

const rawModelledWalletBandPattern = /(\d+(?:\.\d+)?-\d+(?:\.\d+)?)k \/mo/g;

const defaultChannels: ChannelState = {
  'App push': true,
  'CRM email': true,
  'Paid social': false,
  'Concierge / VIP host': false,
};

function normalizeModelledWalletBands(value: string): string {
  return value.replace(rawModelledWalletBandPattern, (_match, band: string) => (
    formatEnriched(`${band}k equiv./mo`, 'band')
  ));
}

export function ConstellationRedesignScreen({
  pageId,
  quarterLabel,
  coveragePct,
  activeMetricCount,
}: ConstellationRedesignScreenProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState('cc');
  const [channels, setChannels] = useState<ChannelState>(defaultChannels);
  const [windowWeeks, setWindowWeeks] = useState(6);
  const [reachPct, setReachPct] = useState(40);
  const [depthPct, setDepthPct] = useState(15);
  const [exported, setExported] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);
  const [aiAnswerKey, setAiAnswerKey] = useState<AiAnswerKey | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [audienceBriefDrafted, setAudienceBriefDrafted] = useState(false);

  const model = useMemo(
    () => buildConstellationRedesignModel({
      pageId,
      quarterLabel,
      selectedSegmentId,
      channels,
      windowWeeks,
      reachPct,
      depthPct,
      exported,
    }),
    [channels, depthPct, exported, pageId, quarterLabel, reachPct, selectedSegmentId, windowWeeks],
  );

  function toggleChannel(channel: string) {
    setChannels((current) => ({
      ...current,
      [channel]: !current[channel],
    }));
    setExported(false);
  }

  function selectSegment(segmentId: string) {
    setSelectedSegmentId(segmentId);
    setAudienceBriefDrafted(false);
    setExported(false);
    setAiAnswerKey(null);
  }

  function selectWindow(weeks: number) {
    setWindowWeeks(weeks);
    setExported(false);
  }

  function updateReachPct(pct: number) {
    setReachPct(pct);
    setExported(false);
  }

  function updateDepthPct(pct: number) {
    setDepthPct(pct);
    setExported(false);
  }

  function buildAudienceBriefDraft() {
    setAudienceBriefDrafted(true);
  }

  const sharedControls: SharedRouteControls = {
    windowWeeks,
    setWindowWeeks: selectWindow,
    reachPct,
    setReachPct: updateReachPct,
    depthPct,
    setDepthPct: updateDepthPct,
    exported,
    setExported,
    aiOpen,
    setAiOpen,
    aiAnswerKey,
    setAiAnswerKey,
    aiInput,
    setAiInput,
    onToggleChannel: toggleChannel,
    onSelectSegment: selectSegment,
  };

  return (
    <>
      <section aria-label={model.screenLabel} className="space-y-[18px] pb-28 text-galaxy-cream">
        {pageId === 'overview' ? (
          <Overview
            model={model}
            coveragePct={coveragePct}
            activeMetricCount={activeMetricCount}
            onSelectSegment={selectSegment}
          />
        ) : (
          <div className="min-w-0 space-y-[18px]">
            {renderRouteBody(model, sharedControls, audienceBriefDrafted, buildAudienceBriefDraft)}
          </div>
        )}
      </section>

      <CdeAiDock
        model={model}
        aiOpen={aiOpen}
        setAiOpen={setAiOpen}
        aiAnswerKey={aiAnswerKey}
        setAiAnswerKey={setAiAnswerKey}
        aiInput={aiInput}
        setAiInput={setAiInput}
      />
    </>
  );
}

function renderRouteBody(
  model: ConstellationRedesignModel,
  controls: SharedRouteControls,
  audienceBriefDrafted: boolean,
  onBuildAudienceBrief: () => void,
) {
  switch (model.pageId) {
    case 'segments':
      return renderSegments(model, controls.onSelectSegment, audienceBriefDrafted, onBuildAudienceBrief);
    case 'leakage':
      return renderLeakage(model, controls.onSelectSegment);
    case 'journey':
      return renderJourney(model, controls.onSelectSegment);
    case 'wallet':
      return renderWallet(model, controls.onSelectSegment);
    case 'guests':
      return renderGuests(model, controls.onSelectSegment);
    case 'propensity':
      return renderPropensity(model, controls.onSelectSegment);
    case 'activation':
      return renderActivation(model, controls);
    case 'simulate':
      return renderSimulator(model, controls);
    case 'measurement':
      return renderMeasurement(model);
    case 'marketscan':
      return renderMarketScan(model);
    case 'governance':
      return renderGovernance(model);
    default:
      return <PlaceholderScreen model={model} />;
  }
}

function Overview({
  model,
  coveragePct,
  activeMetricCount,
  onSelectSegment,
}: {
  model: ConstellationRedesignModel;
  coveragePct: number;
  activeMetricCount: number;
  onSelectSegment: (segmentId: string) => void;
}) {
  return (
    <>
      <section className="galaxy-glass-panel overflow-hidden rounded-[24px] border border-white/10 p-5 md:p-6">
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
              {model.quarter.label} constellation cockpit
            </p>
            <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.02] text-galaxy-cream md:text-5xl">
              {model.pageTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-galaxy-muted md:text-base md:leading-7">
              Pitch {model.topSegment.name} first. The current quarter points to {model.topSegment.short} as the
              strongest governed recapture play. Use the constellation to compare opportunity index, category leakage
              and reach readiness before briefing Marketing.
            </p>
          </div>
          <div className="grid gap-3 rounded-[18px] border border-galaxy-gold/25 bg-galaxy-gold/10 p-4 sm:grid-cols-2 xl:grid-cols-1">
            <StatTile label="Matched coverage" value={`${coveragePct}%`} sub={`${activeMetricCount} governed metrics`} />
            <StatTile label="Decision move" value={model.topSegment.move} sub="Recommended first audience" />
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-[18px]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {model.kpis.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          <ConstellationMap
            nodes={model.constellationNodes}
            segmentRows={model.segmentRows}
            selectedSegmentName={model.selectedSegment.name}
            onSelectSegment={onSelectSegment}
          />

          <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-galaxy-cream">CDE index legend</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-galaxy-muted">
                  Indexed, banded and aggregated signals only; no individual or venue-specific values are shown.
                </p>
              </div>
              <p className="rounded-full border border-galaxy-positive/35 bg-galaxy-positive/10 px-3 py-1 text-xs font-semibold text-galaxy-positive">
                CDE-safe note
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {model.legend.map((item) => (
                <div key={item.band} className="rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="font-mono text-sm font-semibold text-galaxy-cream">{item.band}</p>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-galaxy-cream">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-galaxy-muted">{item.sub}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <SelectedFinding model={model} />
      </div>
    </>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="galaxy-glass-panel min-h-[154px] rounded-[18px] border border-white/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">{metric.label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold leading-none text-galaxy-cream">{metric.value}</p>
      <p className="mt-2 text-xs font-semibold" style={{ color: metric.deltaColor }}>
        {metric.delta}
      </p>
      <p className="mt-3 text-xs leading-5 text-galaxy-muted">{metric.sub}</p>
    </article>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold leading-tight text-galaxy-cream">{value}</p>
      <p className="mt-2 text-xs leading-5 text-galaxy-muted">{sub}</p>
    </div>
  );
}

function SegmentChipBar({
  chips,
  onSelectSegment,
  buttonLabelPrefix = '',
}: {
  chips: ConstellationRedesignModel['segmentChips'];
  onSelectSegment: (segmentId: string) => void;
  buttonLabelPrefix?: string;
}) {
  return (
    <div role="group" className="flex min-w-0 gap-2 overflow-x-auto pb-1" aria-label="Segment shortcuts">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          aria-label={buttonLabelPrefix ? `${buttonLabelPrefix}${chip.label}` : undefined}
          aria-pressed={chip.selected}
          onClick={() => onSelectSegment(chip.id)}
          className={clsx(
            'min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition',
            chip.selected
              ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
              : 'border-white/10 bg-galaxy-ink/35 text-galaxy-muted hover:border-galaxy-gold/50 hover:text-galaxy-cream',
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

function pctWidth(value: number): string {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function walletBandPerMonth(value: string): string {
  return normalizeModelledWalletBands(value.includes('/mo') ? value : `${value} /mo`);
}

function renderSegments(
  model: ConstellationRedesignModel,
  onSelectSegment: (segmentId: string) => void,
  audienceBriefDrafted: boolean,
  onBuildAudienceBrief: () => void,
) {
  return (
    <div className="grid min-w-0 gap-[18px] xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="galaxy-glass-panel min-w-0 rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} governed audience rank
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Rank segments by opportunity index, top leakage lane and modelled wallet band before building an audience brief.
        </p>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-white/10">
          <div className="grid grid-cols-[52px_minmax(180px,1.3fr)_90px_minmax(150px,1fr)_140px] gap-3 bg-galaxy-ink/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-galaxy-muted">
            <span>#</span>
            <span>Segment</span>
            <span>Index</span>
            <span>Top leakage</span>
            <span>Wallet band</span>
          </div>
          <div className="divide-y divide-white/10">
            {model.segmentRows.map((row) => (
              <button
                key={row.id}
                type="button"
                aria-pressed={row.selected}
                aria-label={`Select ${row.name}, index ${row.idx}, ${row.leak}% ${row.cat} leakage, ${walletBandPerMonth(row.wallet)}`}
                onClick={() => onSelectSegment(row.id)}
                className={clsx(
                  'grid w-full grid-cols-[52px_minmax(180px,1.3fr)_90px_minmax(150px,1fr)_140px] gap-3 px-4 py-4 text-left text-sm transition',
                  row.selected
                    ? 'bg-galaxy-gold/12 text-galaxy-cream'
                    : 'bg-galaxy-ink/25 text-galaxy-muted hover:bg-galaxy-ink/45 hover:text-galaxy-cream',
                )}
              >
                <span className="font-mono text-xs font-semibold text-galaxy-muted">{row.rank}</span>
                <span className="font-semibold">{row.name}</span>
                <span className="font-mono font-semibold" style={{ color: row.idxColor }}>
                  {row.idx}
                </span>
                <span>
                  {row.leak}% {row.cat}
                </span>
                <span className="font-mono text-xs">{walletBandPerMonth(row.wallet)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="galaxy-glass-panel sticky top-4 h-fit rounded-[20px] border border-white/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Segment detail</p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">{model.selectedSegment.name}</h2>
        <p className="mt-3 text-sm leading-6 text-galaxy-muted">{model.selectedSegment.desc}</p>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-galaxy-cream">Leakage by category</h3>
          <div className="mt-3 space-y-3">
            {model.selectedSegment.cats.map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-galaxy-muted">{category.name}</span>
                  <span className="font-mono text-galaxy-cream">{category.v}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-galaxy-ink/70">
                  <div className="h-full rounded-full bg-galaxy-gold" style={{ width: pctWidth(category.v) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {model.selectedStats.map((stat) => (
            <SelectedStat key={stat.label} stat={stat} />
          ))}
        </div>

        <button
          type="button"
          onClick={onBuildAudienceBrief}
          className="mt-5 min-h-11 w-full rounded-[12px] border border-galaxy-gold/45 px-4 text-sm font-semibold text-galaxy-gold transition hover:bg-galaxy-gold/10"
        >
          Build audience brief
        </button>

        {audienceBriefDrafted ? (
          <div
            role="status"
            aria-label="Audience brief draft"
            className="mt-4 rounded-[14px] border border-galaxy-positive/35 bg-galaxy-positive/10 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-positive">
              Audience brief draft generated
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-galaxy-cream">{model.selectedSegment.name}</p>
            <p className="mt-1 text-sm leading-6 text-galaxy-cream">{model.selectedSegment.offer}</p>
            <p className="mt-3 text-xs leading-5 text-galaxy-muted">
              CDE-safe brief uses governed matched bands, indices and category percentages only. Validate against a
              matched holdout before scale.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function renderLeakage(model: ConstellationRedesignModel, onSelectSegment: (segmentId: string) => void) {
  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} category controls
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <h2 className="mt-4 text-2xl font-semibold leading-tight text-galaxy-cream">
          Where each segment&apos;s wallet escapes
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Compare category-level leakage signals and segment rows using only governed percentages and indices.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {model.leakageCategories.map((category) => (
            <article key={category.name} className="rounded-[16px] border border-white/10 bg-galaxy-ink/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-galaxy-cream">{category.name}</h3>
                <span className="font-mono text-lg font-semibold text-galaxy-gold">{category.v}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-galaxy-ink/70">
                <div className="h-full rounded-full bg-galaxy-gold" style={{ width: pctWidth(category.v) }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-galaxy-muted">{category.sub}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="galaxy-glass-panel overflow-hidden rounded-[20px] border border-white/10 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-galaxy-cream">Leakage matrix</h2>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Hot cells mark the largest category escape lanes by segment.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">
              Selected segment: {model.selectedSegment.name}
            </p>
          </div>
          <p className="rounded-full border border-galaxy-positive/35 bg-galaxy-positive/10 px-3 py-1 text-xs font-semibold text-galaxy-positive">
            Controlled category view
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[220px_repeat(4,minmax(110px,1fr))] gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-galaxy-muted">
              <span className="px-3 py-2">Segment</span>
              {model.leakageCategories.map((category) => (
                <span key={category.name} className="px-3 py-2">
                  {category.name}
                </span>
              ))}
            </div>
            <div className="space-y-2">
              {model.matrixRows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={row.selected}
                  aria-label={`Select ${row.name}, ${row.cells.map((cell) => `${cell.category} ${cell.v}%`).join(', ')}`}
                  onClick={() => onSelectSegment(row.id)}
                  className={clsx(
                    'grid w-full grid-cols-[220px_repeat(4,minmax(110px,1fr))] gap-2 rounded-[14px] border p-2 text-left transition',
                    row.selected ? 'border-galaxy-gold/35 bg-galaxy-gold/10' : 'border-white/10 bg-galaxy-ink/25',
                  )}
                >
                  <span className="flex items-center px-2 text-sm font-semibold text-galaxy-cream">{row.name}</span>
                  {row.cells.map((cell) => (
                    <span
                      key={cell.category}
                      className="rounded-[10px] px-3 py-3 text-sm font-semibold"
                      style={{ backgroundColor: cell.bg, color: cell.color }}
                    >
                      {cell.v}%
                    </span>
                  ))}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-[18px] lg:grid-cols-2">
        <article className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
            What this means for {model.quarter.label}
          </p>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            {model.topSegment.name} leads the current ranking, so start with {model.topSegment.cat} recapture and
            validate supporting category lanes before activation.
          </p>
        </article>
        <article className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Controls note</p>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            Values are demi-decile averages from matched CDE cohorts. This view exposes aggregated category
            percentages only and excludes identifiers or record-level detail.
          </p>
        </article>
      </div>
    </>
  );
}

function renderJourney(model: ConstellationRedesignModel, onSelectSegment: (segmentId: string) => void) {
  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} segment journey
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Track the selected segment through five governed journey stages and focus the intervention on the lowest
          capture signal.
        </p>
        <div className="mt-5">
          <SegmentChipBar chips={model.segmentChips} onSelectSegment={onSelectSegment} />
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-5">
        {model.journeyStages.map((stage) => (
          <article
            key={stage.num}
            className={clsx(
              'rounded-[18px] border p-4',
              stage.isWeak ? 'border-galaxy-gold/45 bg-galaxy-gold/10' : 'border-white/10 bg-galaxy-ink/35',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-xs font-semibold text-galaxy-muted">{stage.num}</span>
              <span
                className="rounded-full border border-galaxy-gold/35 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-galaxy-gold"
                style={{ display: stage.weakDisplay }}
              >
                Lowest
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold leading-tight text-galaxy-cream">{stage.name}</h2>
            <p className="mt-3 font-mono text-2xl font-semibold text-galaxy-cream">{stage.cap}%</p>
            <p className="mt-3 text-xs leading-5 text-galaxy-muted">{stage.note}</p>
          </article>
        ))}
      </div>

      <div className="grid min-w-0 gap-[18px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="galaxy-glass-panel rounded-[20px] border border-galaxy-gold/30 bg-galaxy-gold/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Weakest link</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">{model.weakName}</h2>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            Capture signal sits at {model.weakCap}% for {model.selectedSegment.name}. Prioritize this step before
            widening reach.
          </p>
        </article>
        <article className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Intervention</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">{model.selectedSegment.offer}</h2>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{model.selectedSegment.desc}</p>
        </article>
      </div>
    </>
  );
}

function renderWallet(model: ConstellationRedesignModel, onSelectSegment: (segmentId: string) => void) {
  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} wallet split
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Compare category capture with the selected segment&apos;s modelled off-property headroom.
        </p>
        <div className="mt-5">
          <SegmentChipBar chips={model.segmentChips} onSelectSegment={onSelectSegment} />
        </div>
      </section>

      <div className="grid min-w-0 gap-[18px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="galaxy-glass-panel min-w-0 rounded-[20px] border border-white/10 p-5">
          <h2 className="text-2xl font-semibold leading-tight text-galaxy-cream">
            On-property vs modelled off-property
          </h2>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">
            Each category is expressed as governed share bands for the selected segment.
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">
            Selected segment: {model.selectedSegment.name}
          </p>
          <div className="mt-5 space-y-5">
            {model.walletSplit.map((split) => (
              <div key={split.name}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-galaxy-cream">{split.name}</span>
                  <span className="font-mono text-xs text-galaxy-muted">
                    {split.on}% on / {split.off}% off
                  </span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-galaxy-ink/70">
                  <div className="h-full bg-galaxy-positive" style={{ width: pctWidth(split.on) }} />
                  <div className="h-full bg-galaxy-gold" style={{ width: pctWidth(split.off) }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
          <h2 className="text-2xl font-semibold leading-tight text-galaxy-cream">Wallet trend</h2>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">Quarterly modelled wallet bands for the selection.</p>
          <div className="mt-5">
            <div className="flex h-40 items-end gap-3" aria-label="Wallet trend bar area">
              {model.walletTrend.map((trend) => (
                <div key={`${trend.q}-bar`} className="flex min-w-0 flex-1 items-end self-stretch">
                  <div
                    className={clsx(
                      'w-full rounded-t-[12px] border',
                      trend.selected ? 'border-galaxy-gold bg-galaxy-gold/45' : 'border-white/10 bg-galaxy-ink/55',
                    )}
                    style={{ height: pctWidth(trend.h) }}
                    aria-label={`${trend.q} ${walletBandPerMonth(trend.band)}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-3">
              {model.walletTrend.map((trend) => (
                <div key={`${trend.q}-label`} className="min-w-0 text-center">
                  <span className="block font-mono text-[11px] font-semibold" style={{ color: trend.qColor }}>
                    {trend.q}
                  </span>
                  <span className="mt-1 block text-center font-mono text-[10px] text-galaxy-muted">
                    {walletBandPerMonth(trend.band)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {model.walletCards.map((card) => (
          <article key={card.label} className="galaxy-glass-panel rounded-[18px] border border-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">
              {normalizeModelledWalletBands(card.value)}
            </p>
            <p className="mt-3 text-xs leading-5 text-galaxy-muted">{card.sub}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function renderGuests(model: ConstellationRedesignModel, onSelectSegment: (segmentId: string) => void) {
  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} matched guests
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <h2 className="mt-4 text-2xl font-semibold leading-tight text-galaxy-cream">
          From resort universe to activation-ready cohorts
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          The funnel keeps every audience at governed cohort scale before any channel handoff.
        </p>
      </section>

      <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
        <h2 className="text-2xl font-semibold leading-tight text-galaxy-cream">Match funnel</h2>
        <div className="mt-5 space-y-4">
          {model.funnel.map((step) => (
            <div key={step.name}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-galaxy-cream">{step.name}</span>
                <span className="font-mono text-xs text-galaxy-muted">{step.band}</span>
              </div>
              <div className="h-10 rounded-[12px] bg-galaxy-ink/50 p-1">
                <div
                  className="flex h-full items-center rounded-[10px] bg-galaxy-gold/35 px-3 text-xs font-semibold text-galaxy-cream"
                  style={{ width: pctWidth(step.widthPct) }}
                >
                  {step.widthPct}%
                </div>
              </div>
              <p className="mt-2 text-xs leading-5 text-galaxy-muted">{step.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
        <h2 className="text-2xl font-semibold leading-tight text-galaxy-cream">Cohort coverage</h2>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">
          Selected cohort: {model.selectedSegment.name}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {model.guestRows.map((row) => (
            <button
              key={row.id}
              type="button"
              aria-pressed={row.selected}
              aria-label={`Select ${row.name}, matched band ${row.matched}, coverage ${row.cov}, ${row.quality} quality, ${row.reach}`}
              onClick={() => onSelectSegment(row.id)}
              className={clsx(
                'rounded-[16px] border p-4 text-left transition',
                row.selected ? 'border-galaxy-gold/40 bg-galaxy-gold/10' : 'border-white/10 bg-galaxy-ink/35',
              )}
            >
              <span className="block text-base font-semibold leading-tight text-galaxy-cream">{row.name}</span>
              <span className="mt-4 grid gap-3 text-xs">
                <span className="rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
                    Matched band
                  </span>
                  <span className="mt-2 block text-lg font-semibold leading-tight text-galaxy-cream">{row.matched}</span>
                  <span className="mt-2 block text-xs leading-5 text-galaxy-muted">Governed cohort range</span>
                </span>
                <span className="rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
                    Coverage
                  </span>
                  <span className="mt-2 block text-lg font-semibold leading-tight text-galaxy-cream">{row.cov}</span>
                  <span className="mt-2 block text-xs leading-5 text-galaxy-muted">CDE match rate</span>
                </span>
              </span>
              <span className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold" style={{ color: row.qColor }}>
                  {row.quality}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold" style={{ color: row.mColor }}>
                  {row.reach}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function renderPropensity(model: ConstellationRedesignModel, onSelectSegment: (segmentId: string) => void) {
  return (
    <div className="grid min-w-0 gap-[18px] xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="galaxy-glass-panel min-w-0 rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} propensity bands
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Select the activation audience using governed propensity bands and channel reach status.
        </p>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-white/10">
          <div className="grid grid-cols-[minmax(200px,1.3fr)_minmax(160px,1fr)_140px] gap-3 bg-galaxy-ink/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-galaxy-muted">
            <span>Segment</span>
            <span>Propensity band</span>
            <span>Reach</span>
          </div>
          <div className="divide-y divide-white/10">
            {model.propensityRows.map((row) => (
              <button
                key={row.id}
                type="button"
                aria-pressed={row.selected}
                aria-label={`Select ${row.name}, ${row.propensityBand}, ${row.reach}`}
                onClick={() => onSelectSegment(row.id)}
                className={clsx(
                  'grid w-full grid-cols-[minmax(200px,1.3fr)_minmax(160px,1fr)_140px] gap-3 px-4 py-4 text-left text-sm transition',
                  row.selected
                    ? 'bg-galaxy-gold/12 text-galaxy-cream'
                    : 'bg-galaxy-ink/25 text-galaxy-muted hover:bg-galaxy-ink/45 hover:text-galaxy-cream',
                )}
              >
                <span className="font-semibold">{row.name}</span>
                <span>{row.propensityBand}</span>
                <span className="font-semibold" style={{ color: row.mColor }}>
                  {row.reach}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="galaxy-glass-panel sticky top-4 h-fit rounded-[20px] border border-galaxy-gold/30 bg-galaxy-gold/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Audience readiness</p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">{model.selectedSegment.name}</h2>
        <div className="mt-5 grid gap-3">
          <SelectedStat stat={{ label: 'Propensity band', value: model.selectedPropensityBand }} />
          <SelectedStat stat={{ label: 'Matched guests', value: model.selectedSegment.matched }} />
          <SelectedStat stat={{ label: 'Top leakage', value: `${model.selectedSegment.leak}% ${model.selectedSegment.cat}` }} />
        </div>
        <div className="mt-5 rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
            Channel recommendation
          </p>
          <p className="mt-2 text-sm leading-6 text-galaxy-cream">{model.selectedChannelRecommendation}</p>
        </div>
      </aside>
    </div>
  );
}

function renderActivation(model: ConstellationRedesignModel, controls: SharedRouteControls) {
  function askAiBrief() {
    controls.setAiOpen(true);
    controls.setAiAnswerKey('brief');
  }

  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} activation setup
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Build a governed campaign brief from audience pick, channel scope and matched-holdout read window.
        </p>
      </section>

      <div className="grid min-w-0 gap-[18px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0 space-y-[18px]">
          <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
            <h2 className="text-lg font-semibold text-galaxy-cream">Audience</h2>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Choose one of the top governed recapture audiences for this brief.
            </p>
            <div className="mt-4 grid gap-2">
              {model.audiencePicks.map((audience) => (
                <button
                  key={audience.id}
                  type="button"
                  aria-pressed={audience.selected}
                  aria-label={`Select ${audience.name}, index ${audience.idx}`}
                  onClick={() => controls.onSelectSegment(audience.id)}
                  className={clsx(
                    'flex min-h-12 items-center justify-between gap-4 rounded-[12px] border px-4 text-left transition',
                    audience.selected
                      ? 'border-galaxy-gold/45 bg-galaxy-gold/12 text-galaxy-cream'
                      : 'border-white/10 bg-galaxy-ink/35 text-galaxy-muted hover:border-galaxy-gold/45 hover:text-galaxy-cream',
                  )}
                >
                  <span className="text-sm font-semibold">{audience.name}</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: audience.idxColor }}>
                    Index {audience.idx}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
            <h2 className="text-lg font-semibold text-galaxy-cream">Channels</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {model.channels.map((channel) => (
                <button
                  key={channel.name}
                  type="button"
                  aria-pressed={channel.enabled}
                  onClick={() => controls.onToggleChannel(channel.name)}
                  className={clsx(
                    'min-h-10 rounded-full border px-4 text-xs font-semibold transition',
                    channel.enabled
                      ? 'border-galaxy-gold/55 bg-galaxy-gold/15 text-galaxy-cream'
                      : 'border-white/10 bg-galaxy-ink/35 text-galaxy-muted hover:border-galaxy-gold/45',
                  )}
                >
                  {channel.name}
                </button>
              ))}
            </div>
          </section>

          <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
            <h2 className="text-lg font-semibold text-galaxy-cream">Measurement window</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {model.windows.map((windowOption) => (
                <button
                  key={windowOption.weeks}
                  type="button"
                  aria-pressed={controls.windowWeeks === windowOption.weeks}
                  onClick={() => controls.setWindowWeeks(windowOption.weeks)}
                  className={clsx(
                    'min-h-11 rounded-[12px] border px-3 text-xs font-semibold transition',
                    controls.windowWeeks === windowOption.weeks
                      ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                      : 'border-white/10 bg-galaxy-ink/35 text-galaxy-muted hover:border-galaxy-gold/45',
                  )}
                >
                  {windowOption.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-galaxy-muted">
              Lift is reported as a capture-index delta vs a matched holdout. {model.windowNote}
            </p>
          </section>
        </div>

        <aside className="galaxy-glass-panel h-fit min-w-0 max-w-full rounded-[20px] border border-galaxy-gold/30 bg-galaxy-gold/10 p-5 lg:sticky lg:top-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
                Campaign brief
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">
                {model.selectedSegment.move}
              </h2>
            </div>
            <span className="w-fit rounded-full border border-galaxy-positive/35 bg-galaxy-positive/10 px-3 py-1 text-xs font-semibold text-galaxy-positive">
              CDE-safe
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {model.briefFacts.map((fact) => (
              <div key={fact.label} className="rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-galaxy-muted">
                  {fact.label === 'Audience'
                    ? 'Selected audience'
                    : fact.label === 'Channels'
                      ? 'Selected channels'
                      : fact.label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-galaxy-cream">
                  {normalizeModelledWalletBands(
                    fact.label === 'Audience' ? `${fact.value} cohort` : fact.value,
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">CDE-safe summary</p>
            <p className="mt-3 text-sm leading-6 text-galaxy-cream">
              {normalizeModelledWalletBands(model.briefCopy)}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => controls.setExported(true)}
              className="min-h-11 flex-1 rounded-[12px] px-4 text-sm font-semibold text-galaxy-ink transition hover:brightness-110"
              style={{ backgroundColor: model.exportBg, color: model.exportColor }}
            >
              {controls.exported ? model.exportLabel : 'Export campaign brief'}
            </button>
            <button
              type="button"
              onClick={askAiBrief}
              className="min-h-11 rounded-[12px] border border-galaxy-gold/45 px-4 text-sm font-semibold text-galaxy-gold transition hover:bg-galaxy-gold/10"
            >
              Ask CDE AI
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

function renderSimulator(model: ConstellationRedesignModel, controls: SharedRouteControls) {
  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} scenario lab
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Tune reach, offer depth and read window to compare modelled planning bands before activation.
        </p>
      </section>

      <div className="grid min-w-0 gap-[18px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0 space-y-[18px]">
          <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
            <h2 className="text-lg font-semibold text-galaxy-cream">Scenario audience</h2>
            <div className="mt-4">
              <SegmentChipBar chips={model.segmentChips} onSelectSegment={controls.onSelectSegment} />
            </div>
          </section>

          <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
            <div className="space-y-5">
              <label className="block text-sm font-semibold text-galaxy-cream">
                Audience reach
                <span className="float-right font-mono text-xs text-galaxy-gold">{controls.reachPct}% of cohort</span>
                <input
                  type="range"
                  aria-label="Audience reach"
                  min="10"
                  max="90"
                  step="5"
                  value={controls.reachPct}
                  onChange={(event) => controls.setReachPct(Number(event.target.value))}
                  className="mt-3 block w-full accent-galaxy-gold"
                />
              </label>
              <p className="text-xs leading-5 text-galaxy-muted">Share of the matched band receiving the offer.</p>

              <label className="block text-sm font-semibold text-galaxy-cream">
                Offer depth
                <span className="float-right font-mono text-xs text-galaxy-gold">
                  {controls.depthPct}% equivalent value
                </span>
                <input
                  type="range"
                  aria-label="Offer depth"
                  min="5"
                  max="30"
                  step="1"
                  value={controls.depthPct}
                  onChange={(event) => controls.setDepthPct(Number(event.target.value))}
                  className="mt-3 block w-full accent-galaxy-gold"
                />
              </label>
              <p className="text-xs leading-5 text-galaxy-muted">Benefit value as a share of target basket.</p>

              <div>
                <h3 className="text-sm font-semibold text-galaxy-cream">Measurement window</h3>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {model.windows.map((windowOption) => (
                    <button
                      key={windowOption.weeks}
                      type="button"
                      aria-pressed={controls.windowWeeks === windowOption.weeks}
                      onClick={() => controls.setWindowWeeks(windowOption.weeks)}
                      className={clsx(
                        'min-h-11 rounded-[12px] border px-3 text-xs font-semibold transition',
                        controls.windowWeeks === windowOption.weeks
                          ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                          : 'border-white/10 bg-galaxy-ink/35 text-galaxy-muted hover:border-galaxy-gold/45',
                      )}
                    >
                      {windowOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="galaxy-glass-panel h-fit min-w-0 max-w-full rounded-[20px] border border-galaxy-gold/30 bg-galaxy-gold/10 p-5 lg:sticky lg:top-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Projected outcome</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">
            {model.selectedSegment.name}
          </h2>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
              Capture-index lift vs matched holdout
            </p>
            <p className="mt-2 font-serif text-5xl font-semibold leading-none text-galaxy-cream">
              {model.simulation.liftBand}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SelectedStat stat={{ label: 'Wallet recapture band', value: model.simulation.recaptureBand }} />
            <SelectedStat
              stat={{ label: 'Read window', value: `${model.simulation.windowLabel} vs matched holdout` }}
            />
          </div>
          <div className="mt-5 rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4">
            <p className="text-sm leading-6 text-galaxy-cream">{model.simulation.simNote}</p>
          </div>
          <p className="mt-4 text-xs leading-5 text-galaxy-muted">
            Directional modelled bands for planning only. Validate against the next CDE refresh before scale.
          </p>
        </aside>
      </div>
    </>
  );
}

function renderMeasurement(model: ConstellationRedesignModel) {
  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} measurement
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Every campaign reads as capture-index delta vs a matched holdout before scale.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {model.measureCounts.map((count) => (
          <article key={count.label} className="galaxy-glass-panel rounded-[18px] border border-white/10 p-4">
            <div className="flex items-center gap-4">
              <p className="font-serif text-4xl font-semibold leading-none" style={{ color: count.color }}>
                {count.v}
              </p>
              <div>
                <h2 className="text-sm font-semibold text-galaxy-cream">{count.label}</h2>
                <p className="mt-1 text-xs leading-5 text-galaxy-muted">{count.sub}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Campaign readouts</p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">
          Every campaign reads as capture-index delta vs a matched holdout
        </h2>
        <div className="mt-5 space-y-3">
          {model.readouts.map((readout) => (
            <article
              key={readout.name}
              className="grid gap-3 rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(150px,1fr)_80px_90px_110px] md:items-center"
            >
              <div>
                <h3 className="text-sm font-semibold text-galaxy-cream">{readout.name}</h3>
                <p className="mt-1 text-xs leading-5 text-galaxy-muted">{readout.note}</p>
              </div>
              <p className="text-sm text-galaxy-muted">{readout.aud}</p>
              <p className="font-mono text-xs font-semibold text-galaxy-muted">{readout.window}</p>
              <p className="font-mono text-sm font-semibold" style={{ color: readout.liftColor }}>
                {readout.lift}
              </p>
              <p
                className="w-fit rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: readout.sBorder, color: readout.sColor }}
              >
                {readout.status}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-galaxy-muted">
          Lift is expressed as a capture-index delta against the matched holdout band. Reads finalize at the CDE
          refresh after each window closes.
        </p>
      </section>
    </>
  );
}

function renderMarketScan(model: ConstellationRedesignModel) {
  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} market baseline
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Compare Cotai category demand indices and corridor share bands against the governed market baseline.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {model.demand.map((item) => (
          <article key={item.name} className="galaxy-glass-panel rounded-[18px] border border-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">{item.name}</p>
            <div className="mt-3 flex items-baseline gap-3">
              <p className="font-serif text-4xl font-semibold leading-none" style={{ color: item.color }}>
                {item.v}
              </p>
              <p className="text-xs font-semibold" style={{ color: item.deltaColor }}>
                {item.label}
              </p>
            </div>
            <p className="mt-3 text-xs leading-5 text-galaxy-muted">{item.sub}</p>
          </article>
        ))}
      </div>

      <div className="grid min-w-0 gap-[18px] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="galaxy-glass-panel min-w-0 rounded-[20px] border border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Corridor mix</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">
            Where matched visitation originates
          </h2>
          <div className="mt-5 space-y-4">
            {model.corridors.map((corridor) => (
              <div key={corridor.name}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-galaxy-cream">{corridor.name}</span>
                  <span className="font-mono text-xs font-semibold text-galaxy-gold">{corridor.band}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-galaxy-ink/70">
                  <div
                    aria-label={`${corridor.name} share band ${corridor.band}`}
                    className="h-full rounded-full bg-galaxy-gold"
                    style={{ width: pctWidth(corridor.sharePct) }}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-galaxy-muted">{corridor.note}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="galaxy-glass-panel min-w-0 rounded-[20px] border border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Competitive read</p>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            Retail/Luxury demand indexes highest against the market baseline while Galaxy category capture trails it.
            Dining demand is broad across corridors; Greater Bay Area weekenders are the volume engine, Hong Kong the
            premium one.
          </p>
          <div className="mt-5 rounded-[14px] border border-galaxy-gold/25 bg-galaxy-gold/10 p-4">
            <p className="text-xs leading-5 text-galaxy-muted">
              Market indices compare the Cotai competitive set against the matched CDE market baseline (100). Corridor
              shares are banded per governance rules.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function renderGovernance(model: ConstellationRedesignModel) {
  return (
    <>
      <section className="galaxy-glass-panel rounded-[24px] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} governed controls
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          CDE enrichment is shown as ranges, indices, percentages and banded cohort averages only.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {model.rules.map((rule) => (
          <article key={rule.t} className="galaxy-glass-panel rounded-[18px] border border-white/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold text-galaxy-cream">{rule.t}</h2>
              <span className="rounded-full border border-galaxy-positive/35 bg-galaxy-positive/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-galaxy-positive">
                Compliant
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-galaxy-muted">{rule.d}</p>
          </article>
        ))}
      </div>

      <div className="grid min-w-0 gap-[18px] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="galaxy-glass-panel min-w-0 rounded-[20px] border border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Refresh log</p>
          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr] gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-galaxy-muted">
                <span>Quarter</span>
                <span>Delivered</span>
                <span>Coverage</span>
                <span>Status</span>
              </div>
              <div className="space-y-2">
                {model.refreshLog.map((entry) => (
                  <div
                    key={entry.q}
                    className="grid grid-cols-[1fr_1.2fr_1fr_1fr] gap-3 rounded-[14px] border border-white/10 bg-galaxy-ink/35 px-3 py-3 text-sm"
                  >
                    <span className="font-semibold text-galaxy-cream">{entry.q}</span>
                    <span className="text-galaxy-muted">{entry.date}</span>
                    <span className="font-mono text-galaxy-muted">{entry.cov}</span>
                    <span
                      className="w-fit rounded-full border px-3 py-1 text-xs font-semibold"
                      style={{ borderColor: entry.sBorder, color: entry.sColor }}
                    >
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="galaxy-glass-panel min-w-0 rounded-[20px] border border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Data-sharing scope</p>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            Mastercard CDE enrichment reaches Galaxy as demi-decile averages over matched cohorts: governed metrics,
            quarterly cadence and {model.quarter.coverage}% coverage. No individual, venue, or payment-event detail is
            exposed.
          </p>
          <div className="mt-5 rounded-[14px] border border-galaxy-positive/35 bg-galaxy-positive/10 p-4">
            <p className="text-xs leading-5 text-galaxy-muted">
              Audit-ready briefs carry refresh stamp, cohort band and matched-holdout measurement design for compliance
              review.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function ConstellationMap({
  nodes,
  segmentRows,
  selectedSegmentName,
  onSelectSegment,
}: {
  nodes: Node[];
  segmentRows: SegmentRow[];
  selectedSegmentName: string;
  onSelectSegment: (segmentId: string) => void;
}) {
  function accessibleNodeName(node: Node) {
    const segmentRow = segmentRows.find((row) => row.id === node.id);
    const category = segmentRow?.cat ?? 'category';
    const reach = node.mobile ? 'mobile-ready' : 'CRM / desk';

    return `Select ${node.name}, opportunity index ${node.idx}, ${node.leak}% ${category} leakage, ${reach}`;
  }

  return (
    <section className="galaxy-glass-panel min-w-0 rounded-[20px] border border-white/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold leading-tight text-galaxy-cream">Wallet headroom constellation</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-galaxy-muted">
            Point size is opportunity index. Orbit width is category leakage. Border color marks reach readiness.
          </p>
        </div>
        <p className="rounded-full border border-galaxy-gold/30 bg-galaxy-gold/10 px-3 py-1 text-xs font-semibold text-galaxy-gold">
          Selected: {selectedSegmentName}
        </p>
      </div>

      <div className="relative mt-5 min-h-[420px] overflow-hidden rounded-[18px] border border-white/10 bg-[#0A0812]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(212,175,94,0.12),transparent_30%),radial-gradient(circle_at_30%_62%,rgba(111,191,143,0.10),transparent_24%)]"
        />
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-galaxy-gold/20" />

        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            aria-label={accessibleNodeName(node)}
            aria-pressed={node.selected}
            onClick={() => onSelectSegment(node.id)}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-center font-mono font-semibold shadow-[0_16px_38px_rgba(0,0,0,0.32)] transition hover:scale-105 focus-visible:scale-105"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              borderColor: node.border,
              backgroundColor: node.selected ? '#D4AF5E' : 'rgba(20,16,31,0.86)',
              color: node.color,
              fontSize: `${Math.max(node.fontSize, 12)}px`,
            }}
          >
            {node.idx}
          </button>
        ))}

        {nodes.map((node) => (
          <span
            key={`${node.id}-label`}
            className="absolute z-10 -translate-x-1/2 rounded-full border border-white/10 bg-galaxy-ink/75 px-2 py-1 text-[11px] font-semibold"
            style={{
              left: `${node.x}%`,
              top: `calc(${node.y}% + ${Math.round(node.size / 2) + 10}px)`,
              color: node.labelColor,
            }}
          >
            {node.shortName}
          </span>
        ))}
      </div>
    </section>
  );
}

function SelectedFinding({ model }: { model: ConstellationRedesignModel }) {
  return (
    <section aria-label="Selected finding" className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">Selected finding</p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">{model.selectedSegment.name}</h2>
      <p className="mt-3 text-sm leading-6 text-galaxy-muted">{model.selectedSegment.desc}</p>
      <div className="mt-5 grid gap-3">
        {model.selectedStats.map((stat) => (
          <SelectedStat key={stat.label} stat={stat} />
        ))}
      </div>
      <div className="mt-5 rounded-[14px] border border-galaxy-gold/25 bg-galaxy-gold/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">Recommended play</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-galaxy-cream">{model.selectedSegment.offer}</p>
      </div>
    </section>
  );
}

function SelectedStat({ stat }: { stat: Stat }) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-galaxy-muted">{stat.label}</p>
      <p className="mt-1 font-semibold text-galaxy-cream">{normalizeModelledWalletBands(stat.value)}</p>
    </div>
  );
}

function CdeAiDock({
  model,
  aiOpen,
  setAiOpen,
  aiAnswerKey,
  setAiAnswerKey,
  aiInput,
  setAiInput,
}: {
  model: ConstellationRedesignModel;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  aiAnswerKey: 'explain' | 'trust' | 'brief' | null;
  setAiAnswerKey: (key: 'explain' | 'trust' | 'brief' | null) => void;
  aiInput: string;
  setAiInput: (input: string) => void;
}) {
  const aiPanelId = 'constellation-redesign-ai-panel';
  const aiAnswer = normalizeModelledWalletBands(
    aiAnswerKey
      ? model.aiAnswers[aiAnswerKey]
      : 'Ask for an explanation, trust rationale, or a campaign-ready brief.',
  );

  function submitAiQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!aiInput.trim()) return;

    setAiAnswerKey('explain');
    setAiInput('');
  }

  return (
    <aside
      aria-label="CDE AI"
      className="fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 text-galaxy-cream md:bottom-[22px] md:right-[22px]"
    >
      <div
        id={aiPanelId}
        data-cde-ai-panel="floating"
        data-testid="cde-ai-panel"
        hidden={!aiOpen}
        className="w-[392px] max-w-full overflow-hidden rounded-[16px] border border-galaxy-gold/35 bg-[linear-gradient(160deg,#1B1530,#100C1E_70%)] shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-3 border-b border-galaxy-gold/20 bg-galaxy-gold/10 px-[18px] py-3.5">
          <span
            aria-hidden="true"
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#EAD9A9,#D4AF5E_70%)] text-[13px] font-extrabold text-galaxy-ink"
          >
            ✦
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-extrabold leading-tight text-galaxy-cream">CDE AI</span>
            <span className="mt-0.5 block text-[10px] leading-tight tracking-[0.06em] text-galaxy-muted">
              Governed answers · ranges &amp; indices only
            </span>
          </span>
          <button
            type="button"
            aria-label="Close CDE AI"
            aria-controls={aiPanelId}
            aria-expanded={aiOpen}
            onClick={() => setAiOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-base text-galaxy-muted transition hover:bg-white/5 hover:text-galaxy-cream"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 px-[18px] py-4">
          <div className="flex flex-wrap gap-[7px]">
            {model.aiChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                aria-pressed={aiAnswerKey === chip.key}
                onClick={() => setAiAnswerKey(chip.key)}
                className={clsx(
                  'min-h-[33px] rounded-full border px-3 text-[11.5px] font-bold transition',
                  aiAnswerKey === chip.key
                    ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                    : 'border-galaxy-gold/35 bg-galaxy-gold/5 text-galaxy-muted hover:border-galaxy-gold hover:text-galaxy-gold',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="min-h-[88px] rounded-[10px] border border-galaxy-gold/15 bg-galaxy-ink/50 px-4 py-3.5 text-[12.5px] leading-7 text-[#C9C3D2]">
            {aiAnswer}
          </div>

          <form className="flex gap-2" onSubmit={submitAiQuestion}>
            <label className="sr-only" htmlFor="cde-ai-question">
              Ask a CDE-safe question
            </label>
            <input
              id="cde-ai-question"
              type="text"
              value={aiInput}
              onChange={(event) => setAiInput(event.target.value)}
              placeholder={`Ask about ${model.selectedSegment.name}...`}
              className="min-h-[39px] min-w-0 flex-1 rounded-[9px] border border-galaxy-gold/20 bg-white/[0.03] px-3.5 text-[12.5px] text-galaxy-cream outline-none placeholder:text-galaxy-muted/70 focus:border-galaxy-gold"
            />
            <button
              type="submit"
              className="min-h-[39px] rounded-[9px] bg-galaxy-gold px-4 text-[12.5px] font-extrabold text-galaxy-ink transition hover:brightness-110"
            >
              Ask
            </button>
          </form>

          <p className="text-[9.5px] leading-4 text-galaxy-muted">
            Answers use modelled CDE ranges, percentages and indices only - never guest-level data.
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-controls={aiPanelId}
        aria-expanded={aiOpen}
        onClick={() => setAiOpen(!aiOpen)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-galaxy-gold/50 bg-[linear-gradient(120deg,#221A3C,#14101F)] px-5 text-[13px] font-extrabold tracking-[0.02em] text-galaxy-gold shadow-[0_10px_34px_rgba(0,0,0,0.5),0_0_24px_rgba(212,175,94,0.15)] transition hover:shadow-[0_10px_34px_rgba(0,0,0,0.5),0_0_34px_rgba(212,175,94,0.3)]"
      >
        <span aria-hidden="true" className="text-sm text-galaxy-gold">
          ✦
        </span>
        {aiOpen ? 'Hide CDE AI' : 'Ask CDE AI'}
      </button>
    </aside>
  );
}

function PlaceholderScreen({ model }: { model: ConstellationRedesignModel }) {
  return (
    <div className="galaxy-glass-panel rounded-[24px] border border-white/10 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">{model.screenLabel}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-galaxy-muted">
        Shared renderer placeholder. The detailed body for this route will be implemented in the next task.
      </p>
    </div>
  );
}
