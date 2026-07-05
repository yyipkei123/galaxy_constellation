'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
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

const defaultChannels = {
  'App push': true,
  'CRM email': true,
  'Paid social': false,
  'Concierge / VIP host': false,
};

export function ConstellationRedesignScreen({
  pageId,
  quarterLabel,
  coveragePct,
  activeMetricCount,
}: ConstellationRedesignScreenProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState('cc');
  const [channels, setChannels] = useState(defaultChannels);
  const [windowWeeks, setWindowWeeks] = useState(6);
  const [reachPct, setReachPct] = useState(40);
  const [depthPct, setDepthPct] = useState(15);
  const [exported, setExported] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);
  const [aiAnswerKey, setAiAnswerKey] = useState<'explain' | 'trust' | 'brief' | null>(null);
  const [aiInput, setAiInput] = useState('');

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

  return (
    <section aria-label={model.screenLabel} className="space-y-[18px] text-galaxy-cream">
      {pageId === 'overview' ? (
        <Overview
          model={model}
          coveragePct={coveragePct}
          activeMetricCount={activeMetricCount}
          channels={channels}
          setChannels={setChannels}
          windowWeeks={windowWeeks}
          setWindowWeeks={setWindowWeeks}
          reachPct={reachPct}
          setReachPct={setReachPct}
          depthPct={depthPct}
          setDepthPct={setDepthPct}
          exported={exported}
          setExported={setExported}
          aiOpen={aiOpen}
          setAiOpen={setAiOpen}
          aiAnswerKey={aiAnswerKey}
          setAiAnswerKey={setAiAnswerKey}
          aiInput={aiInput}
          setAiInput={setAiInput}
          onSelectSegment={setSelectedSegmentId}
        />
      ) : (
        <PlaceholderScreen model={model} />
      )}
    </section>
  );
}

function Overview({
  model,
  coveragePct,
  activeMetricCount,
  channels,
  setChannels,
  windowWeeks,
  setWindowWeeks,
  reachPct,
  setReachPct,
  depthPct,
  setDepthPct,
  exported,
  setExported,
  aiOpen,
  setAiOpen,
  aiAnswerKey,
  setAiAnswerKey,
  aiInput,
  setAiInput,
  onSelectSegment,
}: {
  model: ConstellationRedesignModel;
  coveragePct: number;
  activeMetricCount: number;
  channels: Record<string, boolean>;
  setChannels: (channels: Record<string, boolean>) => void;
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
  aiAnswerKey: 'explain' | 'trust' | 'brief' | null;
  setAiAnswerKey: (key: 'explain' | 'trust' | 'brief' | null) => void;
  aiInput: string;
  setAiInput: (input: string) => void;
  onSelectSegment: (segmentId: string) => void;
}) {
  return (
    <>
      <section className="galaxy-glass-panel overflow-hidden rounded-[24px] border border-white/10 p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
              {model.quarter.label} constellation cockpit
            </p>
            <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.02] text-galaxy-cream md:text-5xl">
              Pitch {model.topSegment.name} first.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-galaxy-muted md:text-base md:leading-7">
              The current quarter points to {model.topSegment.short} as the strongest governed recapture play.
              Use the constellation to compare opportunity index, category leakage and reach readiness before briefing Marketing.
            </p>
          </div>
          <div className="grid gap-3 rounded-[18px] border border-galaxy-gold/25 bg-galaxy-gold/10 p-4 sm:grid-cols-2 xl:grid-cols-1">
            <StatTile label="Matched coverage" value={`${coveragePct}%`} sub={`${activeMetricCount} governed metrics`} />
            <StatTile label="Decision move" value={model.topSegment.move} sub="Recommended first audience" />
          </div>
        </div>
      </section>

      <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-[18px]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {model.kpis.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <ConstellationMap
              nodes={model.constellationNodes}
              selectedSegmentName={model.selectedSegment.name}
              onSelectSegment={onSelectSegment}
            />
            <SelectedFinding model={model} />
          </div>

          <section className="galaxy-glass-panel rounded-[20px] border border-white/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-galaxy-cream">CDE index legend</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-galaxy-muted">
                  Indexed, banded and aggregated signals only; no member-level or merchant-level values are shown.
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

        <CdeAiDock
          model={model}
          channels={channels}
          setChannels={setChannels}
          windowWeeks={windowWeeks}
          setWindowWeeks={setWindowWeeks}
          reachPct={reachPct}
          setReachPct={setReachPct}
          depthPct={depthPct}
          setDepthPct={setDepthPct}
          exported={exported}
          setExported={setExported}
          aiOpen={aiOpen}
          setAiOpen={setAiOpen}
          aiAnswerKey={aiAnswerKey}
          setAiAnswerKey={setAiAnswerKey}
          aiInput={aiInput}
          setAiInput={setAiInput}
          onSelectSegment={onSelectSegment}
        />
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
}: {
  chips: ConstellationRedesignModel['segmentChips'];
  onSelectSegment: (segmentId: string) => void;
}) {
  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" aria-label="Segment shortcuts">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
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

function ProgressBar({ value, label }: { value: number; label: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-galaxy-muted">{label}</span>
        <span className="font-mono text-galaxy-cream">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-galaxy-ink/70">
        <div className="h-full rounded-full bg-galaxy-gold" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

function ConstellationMap({
  nodes,
  selectedSegmentName,
  onSelectSegment,
}: {
  nodes: Node[];
  selectedSegmentName: string;
  onSelectSegment: (segmentId: string) => void;
}) {
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
            aria-label={`Select ${node.name}`}
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
      <p className="mt-1 font-semibold text-galaxy-cream">{stat.value}</p>
    </div>
  );
}

function CdeAiDock({
  model,
  channels,
  setChannels,
  windowWeeks,
  setWindowWeeks,
  reachPct,
  setReachPct,
  depthPct,
  setDepthPct,
  exported,
  setExported,
  aiOpen,
  setAiOpen,
  aiAnswerKey,
  setAiAnswerKey,
  aiInput,
  setAiInput,
  onSelectSegment,
}: {
  model: ConstellationRedesignModel;
  channels: Record<string, boolean>;
  setChannels: (channels: Record<string, boolean>) => void;
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
  aiAnswerKey: 'explain' | 'trust' | 'brief' | null;
  setAiAnswerKey: (key: 'explain' | 'trust' | 'brief' | null) => void;
  aiInput: string;
  setAiInput: (input: string) => void;
  onSelectSegment: (segmentId: string) => void;
}) {
  const aiAnswer = aiAnswerKey ? model.aiAnswers[aiAnswerKey] : model.aiAnswer;

  function toggleChannel(channel: string) {
    setChannels({
      ...channels,
      [channel]: !channels[channel],
    });
  }

  return (
    <aside className="galaxy-glass-panel h-fit rounded-[20px] border border-white/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">CDE AI dock</p>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-galaxy-cream">Briefing controls</h2>
        </div>
        <button
          type="button"
          onClick={() => setAiOpen(!aiOpen)}
          className="min-h-9 rounded-full border border-white/10 px-3 text-xs font-semibold text-galaxy-muted transition hover:border-galaxy-gold/50 hover:text-galaxy-cream"
        >
          {aiOpen ? 'Collapse' : 'Open'}
        </button>
      </div>

      {aiOpen ? (
        <div className="mt-5 space-y-5">
          <SegmentChipBar chips={model.segmentChips} onSelectSegment={onSelectSegment} />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">Channels</p>
            <div className="grid gap-2">
              {model.channels.map((channel) => (
                <button
                  key={channel.name}
                  type="button"
                  aria-pressed={channel.enabled}
                  onClick={() => toggleChannel(channel.name)}
                  className={clsx(
                    'min-h-10 rounded-[12px] border px-3 text-left text-sm font-semibold transition',
                    channel.enabled
                      ? 'border-galaxy-gold/45 bg-galaxy-gold/12 text-galaxy-cream'
                      : 'border-white/10 bg-galaxy-ink/35 text-galaxy-muted hover:border-galaxy-gold/45',
                  )}
                >
                  {channel.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">Window</p>
            <div className="grid grid-cols-3 gap-2">
              {model.windows.map((windowOption) => (
                <button
                  key={windowOption.weeks}
                  type="button"
                  aria-pressed={windowWeeks === windowOption.weeks}
                  onClick={() => setWindowWeeks(windowOption.weeks)}
                  className={clsx(
                    'min-h-9 rounded-full border px-3 text-xs font-semibold transition',
                    windowWeeks === windowOption.weeks
                      ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                      : 'border-white/10 bg-galaxy-ink/35 text-galaxy-muted hover:border-galaxy-gold/45',
                  )}
                >
                  {windowOption.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-galaxy-muted">{model.windowNote}</p>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
              Reach
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={reachPct}
                onChange={(event) => setReachPct(Number(event.target.value))}
                className="mt-3 block w-full accent-galaxy-gold"
              />
            </label>
            <ProgressBar value={reachPct} label="Audience reach" />
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
              Offer depth
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={depthPct}
                onChange={(event) => setDepthPct(Number(event.target.value))}
                className="mt-3 block w-full accent-galaxy-gold"
              />
            </label>
            <ProgressBar value={depthPct} label="Offer depth" />
          </div>

          <div className="rounded-[16px] border border-white/10 bg-galaxy-ink/35 p-4">
            <div className="flex flex-wrap gap-2">
              {model.aiChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  aria-pressed={aiAnswerKey === chip.key}
                  onClick={() => setAiAnswerKey(chip.key)}
                  className={clsx(
                    'min-h-9 rounded-full border px-3 text-xs font-semibold transition',
                    aiAnswerKey === chip.key
                      ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                      : 'border-white/10 text-galaxy-muted hover:border-galaxy-gold/50 hover:text-galaxy-cream',
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-galaxy-cream">{aiAnswer}</p>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-muted">
            Ask a CDE-safe question
            <input
              type="text"
              value={aiInput}
              onChange={(event) => setAiInput(event.target.value)}
              placeholder="Compare the top two audiences"
              className="mt-3 block min-h-11 w-full rounded-[12px] border border-white/10 bg-galaxy-ink/50 px-3 text-sm normal-case tracking-normal text-galaxy-cream placeholder:text-galaxy-muted/70"
            />
          </label>

          <button
            type="button"
            onClick={() => setExported(true)}
            className="min-h-11 w-full rounded-[12px] border border-galaxy-gold/45 px-4 text-sm font-semibold text-galaxy-gold transition hover:bg-galaxy-gold/10"
          >
            {exported ? model.exportLabel : 'Export campaign brief'}
          </button>
        </div>
      ) : null}
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
