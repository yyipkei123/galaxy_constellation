'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { formatEnriched } from '@/lib/format';
import {
  buildConstellationRedesignModel,
  type ConstellationRedesignModel,
  type RedesignAiAnswerKey,
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
  aiAnswerKey: RedesignAiAnswerKey | null;
  setAiAnswerKey: (key: RedesignAiAnswerKey | null) => void;
  aiInput: string;
  setAiInput: (input: string) => void;
  onToggleChannel: (channel: string) => void;
  onSelectSegment: (segmentId: string) => void;
}

const rawModelledWalletBandPattern = /(\d+(?:\.\d+)?-\d+(?:\.\d+)?)k \/mo/g;

const prototypeStars = [
  { left: '12%', top: '18%', size: 2, opacity: 0.22 },
  { left: '24%', top: '72%', size: 2, opacity: 0.18 },
  { left: '38%', top: '24%', size: 3, opacity: 0.2 },
  { left: '56%', top: '68%', size: 2, opacity: 0.18 },
  { left: '70%', top: '20%', size: 3, opacity: 0.2 },
  { left: '84%', top: '74%', size: 2, opacity: 0.18 },
];

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
}: ConstellationRedesignScreenProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState('cc');
  const [channels, setChannels] = useState<ChannelState>(defaultChannels);
  const [windowWeeks, setWindowWeeks] = useState(6);
  const [reachPct, setReachPct] = useState(40);
  const [depthPct, setDepthPct] = useState(15);
  const [exported, setExported] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiAnswerKey, setAiAnswerKey] = useState<RedesignAiAnswerKey | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [audienceBriefDrafted, setAudienceBriefDrafted] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);

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
        <ExecutiveDemoGuide
          model={model}
          isOpen={demoOpen}
          stepIndex={demoStepIndex}
          onStart={() => {
            setDemoOpen(true);
            setDemoStepIndex(0);
          }}
          onNext={() => setDemoStepIndex((current) => (current + 1) % model.demoStops.length)}
        />

        {pageId === 'overview' ? (
          <Overview
            model={model}
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

function ExecutiveDemoGuide({
  model,
  isOpen,
  stepIndex,
  onStart,
  onNext,
}: {
  model: ConstellationRedesignModel;
  isOpen: boolean;
  stepIndex: number;
  onStart: () => void;
  onNext: () => void;
}) {
  const activeStop = model.demoStops[stepIndex] ?? model.demoStops[0];

  return (
    <section
      aria-label="Executive demo guide"
      className="rounded-[14px] border border-galaxy-gold/20 bg-white/[0.025] px-4 py-3.5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-galaxy-gold">
            Boardroom story mode
          </p>
          {isOpen ? (
            <>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-galaxy-gold/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-galaxy-gold">
                  {stepIndex + 1} of {model.demoStops.length}
                </span>
                <h2 className="font-serif text-xl leading-tight text-galaxy-cream">{activeStop.title}</h2>
              </div>
              <p className="mt-1.5 max-w-3xl text-xs leading-5 text-galaxy-muted">{activeStop.note}</p>
            </>
          ) : (
            <p className="mt-1 text-xs leading-5 text-galaxy-muted">
              Open a presenter-safe sequence across overview, wallet, activation, measurement and governance.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {isOpen ? (
            <>
              <Link href={activeStop.href} className="galaxy-cta-secondary min-h-9 px-3 text-xs">
                Open this stop
              </Link>
              <button type="button" onClick={onNext} className="galaxy-cta-primary min-h-9 px-3 text-xs">
                Next stop
              </button>
            </>
          ) : (
            <button type="button" onClick={onStart} className="galaxy-cta-primary min-h-9 px-3 text-xs">
              Start demo
            </button>
          )}
        </div>
      </div>
    </section>
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
  onSelectSegment,
}: {
  model: ConstellationRedesignModel;
  onSelectSegment: (segmentId: string) => void;
}) {
  const topWalletBand = normalizeModelledWalletBands(`${model.topSegment.wallet} /mo`);

  return (
    <>
      <section className="overflow-hidden rounded-[14px] border border-galaxy-gold/35 bg-[linear-gradient(120deg,rgba(212,175,94,0.12),rgba(26,20,48,0.4)_55%)] px-[26px] py-[22px]">
        <div className="flex flex-col gap-[22px] lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-galaxy-gold">
              This quarter&apos;s play · {model.quarter.label}
            </p>
            <h1 className="mt-1.5 font-serif text-[32px] font-semibold leading-[1.15] text-[#F7F2E6]">
              Pitch {model.topSegment.name} first.
            </h1>
            <p className="mt-1.5 max-w-[640px] text-[13px] leading-[1.55] text-[#B5AFC0]">
              Index {model.topSegment.idx} opportunity, {model.topSegment.leak}% {model.topSegment.cat} leakage and a{' '}
              {topWalletBand} modelled wallet band. {model.topSegment.move} is the recommended campaign handoff.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-2.5">
            <Link
              href="/activation"
              className="galaxy-cta-primary px-5"
            >
              Build the brief
            </Link>
            <Link
              href="/segments"
              className="galaxy-cta-secondary px-5"
            >
              See the evidence
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        {model.kpis.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid min-w-0 items-stretch gap-3.5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <ConstellationMap
            nodes={model.constellationNodes}
            segmentRows={model.segmentRows}
            selectedSegmentName={model.selectedSegment.name}
            capturePct={model.quarter.capture}
            onSelectSegment={onSelectSegment}
          />
        </div>
        <SelectedFinding model={model} />
      </div>
    </>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="galaxy-kpi-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">{metric.label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold leading-none text-galaxy-cream">{metric.value}</p>
      <p className="mt-2 text-xs font-semibold" style={{ color: metric.deltaColor }}>
        {metric.delta}
      </p>
      <p className="mt-3 text-xs leading-5 text-galaxy-muted">{metric.sub}</p>
    </article>
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
      <section className="galaxy-panel min-w-0 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} governed audience rank
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Rank segments by opportunity index, top leakage lane and modelled wallet band before building an audience brief.
        </p>

        <div className="mt-6 overflow-hidden galaxy-tile">
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

      <aside className="galaxy-panel sticky top-4 h-fit p-5">
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
          className="galaxy-cta-secondary mt-5 w-full"
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
      <section className="galaxy-panel p-5 md:p-6">
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
            <article key={category.name} className="galaxy-tile p-4">
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

      <section className="galaxy-panel overflow-hidden p-5">
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
        <article className="galaxy-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
            What this means for {model.quarter.label}
          </p>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            {model.topSegment.name} leads the current ranking, so start with {model.topSegment.cat} recapture and
            validate supporting category lanes before activation.
          </p>
        </article>
        <article className="galaxy-panel p-5">
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
      <section className="galaxy-panel p-5 md:p-6">
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
              'galaxy-tile p-4',
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
        <article className="galaxy-panel galaxy-panel-accent p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Weakest link</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">{model.weakName}</h2>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">
            Capture signal sits at {model.weakCap}% for {model.selectedSegment.name}. Prioritize this step before
            widening reach.
          </p>
        </article>
        <article className="galaxy-panel p-5">
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
      <section className="galaxy-panel p-5 md:p-6">
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
        <section className="galaxy-panel min-w-0 p-5">
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

        <section className="galaxy-panel p-5">
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
          <article key={card.label} className="galaxy-tile p-4">
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
      <section className="galaxy-panel p-5 md:p-6">
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

      <section className="galaxy-panel p-5">
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

      <section className="galaxy-panel p-5">
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
                'galaxy-tile p-4 text-left transition',
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
      <section className="galaxy-panel min-w-0 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} propensity bands
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Select the activation audience using governed propensity bands and channel reach status.
        </p>

        <div className="mt-6 overflow-hidden galaxy-tile">
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

      <aside className="galaxy-panel galaxy-panel-accent sticky top-4 h-fit p-5">
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
      <section className="galaxy-panel p-5 md:p-6">
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
          <section className="galaxy-panel p-5">
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

          <section className="galaxy-panel p-5">
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

          <section className="galaxy-panel p-5">
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

        <aside className="galaxy-panel galaxy-panel-accent h-fit min-w-0 max-w-full p-5 lg:sticky lg:top-4">
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
              className="galaxy-cta-primary flex-1"
              style={{ backgroundColor: model.exportBg, color: model.exportColor }}
            >
              {controls.exported ? model.exportLabel : 'Export campaign brief'}
            </button>
            <button
              type="button"
              onClick={askAiBrief}
              className="galaxy-cta-secondary"
            >
              Ask CDE AI
            </button>
          </div>

          {controls.exported ? (
            <div
              role="status"
              aria-label="Measurement handoff queued"
              className="mt-5 rounded-[14px] border border-galaxy-positive/30 bg-galaxy-positive/10 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-positive">
                Measurement handoff queued
              </p>
              <p className="mt-2 text-sm leading-6 text-galaxy-cream">
                {model.activationHandoff.audience} enters {model.activationHandoff.window} with{' '}
                {model.activationHandoff.proof.toLowerCase()}.
              </p>
              <Link href={model.activationHandoff.href} className="galaxy-cta-secondary mt-3 min-h-9 px-3 text-xs">
                Open measurement readout
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}

function renderSimulator(model: ConstellationRedesignModel, controls: SharedRouteControls) {
  return (
    <>
      <section className="galaxy-panel p-5 md:p-6">
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
          <section className="galaxy-panel p-5">
            <h2 className="text-lg font-semibold text-galaxy-cream">Scenario audience</h2>
            <div className="mt-4">
              <SegmentChipBar chips={model.segmentChips} onSelectSegment={controls.onSelectSegment} />
            </div>
          </section>

          <section className="galaxy-panel p-5">
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

        <aside className="galaxy-panel galaxy-panel-accent h-fit min-w-0 max-w-full p-5 lg:sticky lg:top-4">
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
      <section className="galaxy-panel p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          {model.quarter.label} measurement
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted">
          Every campaign reads as capture-index delta vs a matched holdout before scale.
        </p>
      </section>

      <section aria-label="Latest activation handoff" className="galaxy-panel galaxy-panel-accent p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          Latest activation handoff
        </p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">
          Campaign activation now closes into measurement
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            { label: 'Audience', value: model.activationHandoff.audience },
            { label: 'Cohort band', value: model.activationHandoff.cohort },
            { label: 'Window', value: model.activationHandoff.window },
            { label: 'Proof', value: model.activationHandoff.proof },
          ].map((item) => (
            <div key={item.label} className="rounded-[12px] border border-white/10 bg-galaxy-ink/35 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-galaxy-muted">{item.label}</p>
              <p className="mt-1.5 text-xs font-semibold leading-5 text-galaxy-cream">
                {normalizeModelledWalletBands(item.value)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Measurement decision guidance" className="galaxy-panel galaxy-panel-accent p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Governed action</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">
              {model.measurementDecisionSummary.action} {model.measurementDecisionSummary.campaignName}
            </h2>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">
              {model.measurementDecisionSummary.rationale}
            </p>
            <p className="mt-3 text-sm leading-6 text-galaxy-cream">
              {model.measurementDecisionSummary.nextStep}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { label: 'Decision', value: model.measurementDecisionSummary.action },
              { label: 'Confidence', value: model.measurementDecisionSummary.confidence },
            ].map((item) => (
              <div key={item.label} className="rounded-[12px] border border-white/10 bg-galaxy-ink/35 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-galaxy-muted">{item.label}</p>
                <p className="mt-1.5 text-sm font-semibold leading-5 text-galaxy-cream">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {model.measureCounts.map((count) => (
          <article key={count.label} className="galaxy-tile p-4">
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

      <section className="galaxy-panel p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Campaign readouts</p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-galaxy-cream">
          Every campaign reads as capture-index delta vs a matched holdout
        </h2>
        <div className="mt-5 space-y-3">
          {model.readouts.map((readout) => (
            <article
              key={readout.name}
              className="grid gap-3 rounded-[14px] border border-white/10 bg-galaxy-ink/35 p-4 md:grid-cols-[minmax(0,1.45fr)_minmax(140px,0.9fr)_80px_80px_100px_100px] md:items-center"
            >
              <div>
                <h3 className="text-sm font-semibold text-galaxy-cream">{readout.name}</h3>
                <p className="mt-1 text-xs leading-5 text-galaxy-muted">{readout.note}</p>
                <p className="mt-1 text-xs leading-5 text-galaxy-muted">{readout.decision.nextStep}</p>
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
              <p
                className="w-fit rounded-full border px-3 py-1 text-xs font-semibold"
                style={{
                  borderColor: readout.decision.border,
                  color: readout.decision.color,
                  backgroundColor: readout.decision.bg,
                }}
              >
                {readout.decision.action}
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
      <section className="galaxy-panel p-5 md:p-6">
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
          <article key={item.name} className="galaxy-tile p-4">
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
        <section className="galaxy-panel min-w-0 p-5">
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

        <aside className="galaxy-panel min-w-0 p-5">
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
      <section className="galaxy-panel p-5 md:p-6">
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
          <article key={rule.t} className="galaxy-tile p-4">
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
        <section className="galaxy-panel min-w-0 p-5">
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

        <aside className="galaxy-panel min-w-0 p-5">
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
  capturePct,
  onSelectSegment,
}: {
  nodes: Node[];
  segmentRows: SegmentRow[];
  selectedSegmentName: string;
  capturePct: number;
  onSelectSegment: (segmentId: string) => void;
}) {
  function accessibleNodeName(node: Node) {
    const segmentRow = segmentRows.find((row) => row.id === node.id);
    const category = segmentRow?.cat ?? 'category';
    const reach = node.mobile ? 'mobile-ready' : 'CRM / desk';

    return `Select ${node.name}, opportunity index ${node.idx}, ${node.leak}% ${category} leakage, ${reach}`;
  }

  return (
    <section className="relative min-w-0 overflow-hidden rounded-[14px] border border-galaxy-gold/20 bg-[radial-gradient(900px_500px_at_50%_40%,#171230_0%,#0B0916_70%)] min-h-[540px]">
      <div className="absolute left-[22px] top-[18px] z-30">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-galaxy-gold">Opportunity map</p>
        <h2 className="mt-0.5 font-serif text-[22px] leading-tight text-galaxy-cream">
          Wallet headroom constellation
        </h2>
        <p className="mt-2 max-w-[28rem] text-[12px] leading-5 text-galaxy-muted">
          Point size is opportunity index. Orbit width is category leakage. Border color marks reach readiness.
        </p>
      </div>

      {prototypeStars.map((star) => (
        <span
          key={`${star.left}-${star.top}`}
          aria-hidden="true"
          className="absolute rounded-full bg-[#EAD9A9]"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
        />
      ))}

      <div className="absolute left-1/2 top-[52%] z-20 flex h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-galaxy-gold/55 bg-[radial-gradient(circle_at_40%_35%,rgba(212,175,94,0.35),rgba(20,16,31,0.9)_75%)] text-center shadow-[0_0_50px_rgba(212,175,94,0.2)]">
        <div className="text-[10px] font-bold uppercase leading-[1.35] tracking-[0.1em] text-[#EAD9A9]">
          Galaxy capture {capturePct}%
        </div>
      </div>

      <div aria-hidden="true" className="absolute left-1/2 top-[52%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-galaxy-gold/10" />
      <div aria-hidden="true" className="absolute left-1/2 top-[52%] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-galaxy-gold/10" />
      <div aria-hidden="true" className="absolute left-1/2 top-[52%] h-[145px] w-[145px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-galaxy-gold/20" />

      <p className="absolute right-[22px] top-[20px] z-30 rounded-full border border-galaxy-gold/30 bg-galaxy-gold/10 px-3 py-1 text-xs font-semibold text-galaxy-gold">
        Selected: {selectedSegmentName}
      </p>

      {nodes.map((node) => (
        <div key={node.id} className="absolute z-20" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-galaxy-gold/30"
            style={{ width: `${node.orbit}px`, height: `${node.orbit}px` }}
          />
          <button
            type="button"
            aria-label={accessibleNodeName(node)}
            aria-pressed={node.selected}
            onClick={() => onSelectSegment(node.id)}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-center font-mono font-semibold shadow-[0_16px_38px_rgba(0,0,0,0.32)] transition hover:scale-105 focus-visible:scale-105"
            style={{
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
          <span
            className="absolute z-10 -translate-x-1/2 rounded-full border border-white/10 bg-galaxy-ink/75 px-2 py-1 text-[11px] font-semibold"
            style={{
              left: '0px',
              top: `${Math.round(node.size / 2) + 10}px`,
              color: node.labelColor,
            }}
          >
            {node.shortName}
          </span>
        </div>
      ))}

      <div className="absolute bottom-4 left-[22px] right-[22px] z-30 flex flex-wrap gap-x-[18px] gap-y-2 text-[10.5px] text-galaxy-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border border-galaxy-gold bg-galaxy-gold/25" />
          Number = opportunity index
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-4 w-4 rounded-full border border-dashed border-galaxy-gold/50" />
          Ring width = wallet leakage
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-galaxy-positive" />
          Mobile-ready cohort
        </span>
      </div>
    </section>
  );
}

function SelectedFinding({ model }: { model: ConstellationRedesignModel }) {
  return (
    <section aria-label="Selected finding" className="flex rounded-[14px] border border-galaxy-gold/20 bg-white/[0.025] p-[22px]">
      <div className="flex min-h-full w-full flex-col gap-3.5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">Selected finding</p>
      <h2 className="font-serif text-2xl font-semibold leading-tight text-[#F7F2E6]">{model.selectedSegment.name}</h2>
      <p className="text-[12.5px] leading-[1.6] text-[#B5AFC0]">{model.selectedSegment.desc}</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {model.selectedStats.map((stat) => (
          <SelectedStat key={stat.label} stat={stat} />
        ))}
      </div>
      <div className="rounded-[9px] border border-galaxy-gold/25 bg-galaxy-gold/5 px-[15px] py-[13px]">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-galaxy-gold">Recommended move</p>
        <p className="mt-1 text-[13px] font-semibold leading-[1.45] text-galaxy-cream">{model.selectedSegment.move}</p>
      </div>
      <Link
        href="/activation"
        className="galaxy-cta-primary mt-auto"
      >
        Build audience brief →
      </Link>
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
  aiAnswerKey: RedesignAiAnswerKey | null;
  setAiAnswerKey: (key: RedesignAiAnswerKey | null) => void;
  aiInput: string;
  setAiInput: (input: string) => void;
}) {
  const aiPanelId = 'constellation-redesign-ai-panel';
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const aiAnswer = normalizeModelledWalletBands(
    aiAnswerKey ? model.aiPanel.answers[aiAnswerKey] : model.aiPanel.defaultAnswer,
  );

  function submitAiQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!aiInput.trim()) return;

    setAiAnswerKey('explain');
    setAiInput('');
  }

  function closeAiPanel() {
    setAiOpen(false);
    toggleButtonRef.current?.focus();
  }

  return (
    <aside
      aria-label="CDE AI"
      className="fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2.5 text-galaxy-cream md:bottom-[22px] md:right-[22px]"
    >
      <div
        id={aiPanelId}
        data-cde-ai-panel="floating"
        data-testid="cde-ai-panel"
        hidden={!aiOpen}
        className="w-[392px] max-w-full overflow-hidden rounded-[16px] border border-galaxy-gold/35 bg-[linear-gradient(160deg,#1B1530,#100C1E_70%)] shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-2.5 border-b border-[rgba(212,175,94,0.18)] bg-[rgba(212,175,94,0.06)] px-[18px] py-3.5">
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
            onClick={closeAiPanel}
            className="flex h-6 w-6 items-center justify-center bg-transparent p-1 text-base text-galaxy-muted transition hover:text-galaxy-cream"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 px-[18px] py-4">
          <div className="flex flex-wrap gap-[7px]">
            {model.aiPanel.starterPrompts.map((prompt) => (
              <button
                key={prompt.label}
                type="button"
                onClick={() => setAiAnswerKey(prompt.key)}
                className="min-h-[31px] rounded-full border border-white/10 bg-white/[0.035] px-3 text-[11px] font-semibold text-galaxy-muted transition hover:border-galaxy-gold/45 hover:text-galaxy-gold"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-[7px]">
            {model.aiPanel.chips.map((chip) => (
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

          <details className="rounded-[10px] border border-white/10 bg-galaxy-ink/35 px-3.5 py-3 text-xs text-galaxy-muted">
            <summary className="cursor-pointer font-semibold text-galaxy-gold">Show data behind this</summary>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-galaxy-muted">
              Grounded data used
            </p>
            <dl className="mt-2 grid gap-2">
              {model.aiPanel.evidenceRows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <dt className="text-galaxy-muted">{row.label}</dt>
                  <dd className="text-right font-semibold text-galaxy-cream">{normalizeModelledWalletBands(row.value)}</dd>
                </div>
              ))}
            </dl>
          </details>

          {model.aiPanel.links.length ? (
            <div className="flex flex-wrap gap-2">
              {model.aiPanel.links.map((link) => (
                <Link key={`${link.href}-${link.label}`} href={link.href} className="galaxy-cta-secondary min-h-8 px-3 text-[11px]">
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}

          <form className="flex gap-2" onSubmit={submitAiQuestion}>
            <label className="sr-only" htmlFor="cde-ai-question">
              Ask a CDE-safe question
            </label>
            <input
              id="cde-ai-question"
              type="text"
              value={aiInput}
              onChange={(event) => setAiInput(event.target.value)}
              placeholder={model.aiPanel.inputPlaceholder}
              className="min-h-[39px] min-w-0 flex-1 rounded-[9px] border border-galaxy-gold/20 bg-white/[0.03] px-3.5 text-[12.5px] text-galaxy-cream outline-none placeholder:text-galaxy-muted/70 focus:border-galaxy-gold"
            />
            <button
              type="submit"
              className="galaxy-cta-primary min-h-[39px] px-4 text-[12.5px]"
            >
              Ask
            </button>
          </form>

          <p className="text-[9.5px] leading-4 text-galaxy-muted">
            Answers use modelled CDE ranges, percentages and indices only — never guest-level data.
          </p>
        </div>
      </div>

      <button
        ref={toggleButtonRef}
        type="button"
        aria-controls={aiPanelId}
        aria-expanded={aiOpen}
        onClick={() => setAiOpen(!aiOpen)}
        className="flex min-h-11 items-center gap-[9px] rounded-full border border-galaxy-gold/50 bg-[linear-gradient(120deg,#221A3C,#14101F)] px-5 text-[13px] font-extrabold tracking-[0.02em] text-galaxy-gold shadow-[0_10px_34px_rgba(0,0,0,0.5),0_0_24px_rgba(212,175,94,0.15)] transition hover:shadow-[0_10px_34px_rgba(0,0,0,0.5),0_0_34px_rgba(212,175,94,0.3)]"
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
    <div className="galaxy-panel p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">{model.screenLabel}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream">{model.pageTitle}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-galaxy-muted">
        Shared renderer placeholder. The detailed body for this route will be implemented in the next task.
      </p>
    </div>
  );
}
