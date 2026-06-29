'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import type { Methodology, Quarter, Segment } from '@/data';
import {
  buildAssistantAnswer,
  buildCategoryRows,
  buildConstellationPoints,
  buildPlaybookRows,
  buildSegmentPriorityRows,
  buildWorkbenchRows,
  dashboardTabs,
  getPrimaryLeakage,
  getTopSegment,
  type ConstellationPoint,
  type DashboardTabId,
  type SegmentPriority,
} from './open-design-view-model';

interface DecisionWorkspaceProps {
  methodology: Methodology;
  quarter: Quarter;
  segments: Segment[];
  selectedSegmentId: string;
  onSelectedSegmentChange: (segmentId: string) => void;
}

type SegmentFilter = SegmentPriority | 'all';

const defaultPrompt = 'Which audience should Galaxy Marketing pitch first this quarter?';

const panelNames: Record<DashboardTabId, string> = {
  opportunity: 'Opportunity map',
  wallet: 'Category capture',
  segments: 'Audience ranking',
  activation: 'Campaign action',
  workbench: 'Ranking evidence',
};

const filterLabels: Record<SegmentFilter, string> = {
  all: 'All segments',
  priority: 'Priority',
  watch: 'Watch',
  nurture: 'Nurture',
};

function panelId(tabId: DashboardTabId) {
  return `dashboard-panel-${tabId}`;
}

function tabId(tabId: DashboardTabId) {
  return `dashboard-tab-${tabId}`;
}

function selectedSegmentFrom(segments: Segment[], selectedSegmentId: string) {
  return segments.find((segment) => segment.id === selectedSegmentId) ?? getTopSegment(segments);
}

function primaryPlay(segment: Segment) {
  return segment.recommendedPlays[0];
}

function starToneClass(point: ConstellationPoint) {
  if (point.tone === 'positive') return 'border-galaxy-positive/50 bg-galaxy-positive text-galaxy-ink';
  if (point.tone === 'leak') return 'border-galaxy-leak/60 bg-galaxy-leak text-galaxy-cream';
  if (point.tone === 'market') return 'border-white/20 bg-galaxy-market text-galaxy-cream';
  return 'border-galaxy-gold/50 bg-galaxy-gold text-galaxy-ink';
}

export function DecisionWorkspace({
  methodology,
  quarter,
  segments,
  selectedSegmentId,
  onSelectedSegmentChange,
}: DecisionWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>('opportunity');
  const [filter, setFilter] = useState<SegmentFilter>('all');
  const [localSelectedSegmentId, setLocalSelectedSegmentId] = useState(selectedSegmentId);
  const selectedSegment = selectedSegmentFrom(segments, localSelectedSegmentId);
  const selectedLeakage = getPrimaryLeakage(selectedSegment);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [promptError, setPromptError] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState(
    buildAssistantAnswer(defaultPrompt, selectedSegment, methodology),
  );
  const [assistantStatus, setAssistantStatus] = useState('CDE-safe ranges only');

  const points = useMemo(
    () => buildConstellationPoints(segments, selectedSegment.id),
    [selectedSegment.id, segments],
  );
  const categoryRows = useMemo(() => buildCategoryRows(segments), [segments]);
  const segmentRows = useMemo(() => buildSegmentPriorityRows(segments), [segments]);
  const playbookRows = useMemo(() => buildPlaybookRows(segments), [segments]);
  const workbenchRows = useMemo(() => buildWorkbenchRows(segments), [segments]);
  const filteredSegmentRows = filter === 'all'
    ? segmentRows
    : segmentRows.filter((segment) => segment.priority === filter);

  useEffect(() => {
    setLocalSelectedSegmentId(selectedSegmentId);
  }, [selectedSegmentId]);

  function selectPoint(point: ConstellationPoint) {
    const nextSegment = selectedSegmentFrom(segments, point.id);
    const nextLeakage = getPrimaryLeakage(nextSegment);
    const play = primaryPlay(nextSegment);

    setLocalSelectedSegmentId(point.id);
    onSelectedSegmentChange(point.id);
    setAssistantAnswer(
      `Selected audience: ${nextSegment.name}. Use ${play?.lever ?? 'governed audience activation'} because the segment shows ${nextLeakage.leakageLabel} ${nextLeakage.label} leakage, ${point.opportunity} opportunity index, and ${nextSegment.crossPropertyCashBand} modelled wallet band.`,
    );
    setAssistantStatus('Audience selection updated');
  }

  function buildAudienceBrief() {
    const play = primaryPlay(selectedSegment);

    setActiveTab('activation');
    setAssistantAnswer(
      `Audience brief built: prioritize ${selectedSegment.name} with ${play?.lever ?? 'governed campaign action'}. Keep the proof chain visible: ${selectedSegment.opportunityIndex} opportunity index, ${selectedLeakage.leakageLabel} ${selectedLeakage.label} leakage, ${selectedSegment.crossPropertyCashBand} modelled wallet band, and CDE-safe cohort ranges only.`,
    );
    setAssistantStatus('Audience brief ready');
  }

  function generateAnswer() {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setPromptError('Prompt required');
      setAssistantStatus('Prompt required');
      return;
    }

    setPromptError('');
    setAssistantAnswer(buildAssistantAnswer(trimmedPrompt, selectedSegment, methodology));
    setAssistantStatus('Generated from current quarter');
  }

  function loadQuickPrompt(nextPrompt: string, nextStatus: string, prefix: string) {
    setPrompt(nextPrompt);
    setPromptError('');
    setAssistantAnswer(`${prefix}: ${buildAssistantAnswer(nextPrompt, selectedSegment, methodology)}`);
    setAssistantStatus(nextStatus);
  }

  async function copyAnswer() {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      setAssistantStatus('Copy unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(assistantAnswer);
      setAssistantStatus('Answer copied');
    } catch {
      setAssistantStatus('Copy unavailable');
    }
  }

  return (
    <section
      aria-label="Decision workspace"
      className="grid min-w-0 gap-[18px] xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="galaxy-glass-panel min-w-0 rounded-[20px] border border-white/10 p-5">
        <div
          role="tablist"
          aria-label="Dashboard workspace tabs"
          className="mb-[18px] flex min-w-0 gap-2 overflow-x-auto pb-1"
        >
          {dashboardTabs.map((tab, index) => (
            <button
              key={tab.id}
              id={tabId(tab.id)}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={panelId(tab.id)}
              onClick={() => setActiveTab(tab.id)}
              className="inline-flex min-h-[42px] shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-semibold text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream aria-selected:border-galaxy-gold/40 aria-selected:bg-galaxy-gold/12 aria-selected:text-galaxy-cream"
            >
              <span>{tab.label}</span>
              <span aria-hidden="true" className="font-mono text-[11px] text-galaxy-muted/70">
                {String(index + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>

        <section
          id={panelId('opportunity')}
          role="tabpanel"
          aria-labelledby={tabId('opportunity')}
          aria-label={panelNames.opportunity}
          hidden={activeTab !== 'opportunity'}
        >
          <div className="mb-[18px] min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
              Opportunity map
            </div>
            <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,2.375rem)] font-semibold leading-tight text-galaxy-cream">
              Wallet headroom constellation
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">
              Point size signals opportunity, orbit distance signals leakage, and the selected quarter controls the
              ranking.
            </p>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div
              aria-label="Segment opportunity constellation"
              className="relative min-h-[430px] min-w-0 overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(214,179,95,0.07),transparent_32%),linear-gradient(135deg,rgba(9,8,7,0.48),rgba(23,21,16,0.62))]"
            >
              <div className="absolute right-3.5 top-3.5 z-[2] max-w-[220px] rounded-[14px] border border-white/10 bg-galaxy-ink/75 p-3 text-xs leading-5 text-galaxy-muted">
                <b className="mb-1 block text-galaxy-cream">Reading model</b>
                Start with the largest numbered point. Higher opportunity index and wider orbit indicate the audience
                to inspect first.
              </div>
              <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 grid h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-galaxy-gold/30 bg-galaxy-gold/10 text-center text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-galaxy-muted">
                Galaxy
                <br />
                capture
              </div>

              {points.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  aria-label={`Select ${point.name}, opportunity index ${point.opportunity}`}
                  aria-pressed={point.isSelected}
                  onClick={() => selectPoint(point)}
                  className={clsx(
                    'absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-[11px] font-bold shadow-lg shadow-black/30 transition aria-pressed:outline aria-pressed:outline-2 aria-pressed:outline-offset-4 aria-pressed:outline-galaxy-gold',
                    starToneClass(point),
                  )}
                  style={{
                    width: point.size,
                    height: point.size,
                    left: `${point.left}%`,
                    top: `${point.top}%`,
                  }}
                >
                  {point.opportunity}
                </button>
              ))}

              <div className="absolute bottom-4 left-4 grid max-w-[260px] gap-2 rounded-[14px] border border-white/10 bg-galaxy-ink/75 p-3 text-xs text-galaxy-muted">
                <span>
                  <i className="mr-2 inline-block h-2 w-2 rounded-full bg-galaxy-gold" />
                  Number shows opportunity index
                </span>
                <span>
                  <i className="mr-2 inline-block h-2 w-2 rounded-full bg-galaxy-leak" />
                  Wider orbit shows wallet leakage
                </span>
                <span>
                  <i className="mr-2 inline-block h-2 w-2 rounded-full bg-galaxy-positive" />
                  Green points indicate mobile-ready cohorts
                </span>
              </div>
            </div>

            <article className="galaxy-glass-panel grid min-h-[430px] min-w-0 content-between rounded-[18px] border border-galaxy-gold/25 p-[18px]">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
                  Selected finding
                </div>
                <h3 className="mt-2.5 font-serif text-[clamp(1.8rem,3vw,2.125rem)] font-semibold leading-tight text-galaxy-cream">
                  {selectedSegment.name}: {primaryPlay(selectedSegment)?.title ?? 'Governed audience activation'}
                </h3>
                <p className="mt-3.5 text-sm leading-6 text-galaxy-muted">
                  {selectedSegment.signatureTrait} The CDE view shows {selectedLeakage.leakageLabel}{' '}
                  {selectedLeakage.label} leakage with {selectedSegment.opportunityIndex} opportunity index.
                </p>
                <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                  <span className="rounded-xl border border-white/10 bg-galaxy-ink/45 px-2.5 py-1.5 text-xs font-semibold text-galaxy-muted">
                    Opportunity <b className="text-galaxy-cream">{selectedSegment.opportunityIndex}</b>
                  </span>
                  <span className="rounded-xl border border-white/10 bg-galaxy-ink/45 px-2.5 py-1.5 text-xs font-semibold text-galaxy-muted">
                    Leakage <b className="text-galaxy-cream">{selectedLeakage.leakageLabel}</b>
                  </span>
                  <span className="rounded-xl border border-white/10 bg-galaxy-ink/45 px-2.5 py-1.5 text-xs font-semibold text-galaxy-muted">
                    Wallet band <b className="text-galaxy-cream">{selectedSegment.crossPropertyCashBand}</b>
                  </span>
                </div>
                <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-galaxy-muted" role="status" aria-live="polite">
                  Selected audience: {selectedSegment.name}. Use the workbench to inspect the proof chain before
                  exporting a brief.
                </p>
              </div>
              <button
                type="button"
                onClick={buildAudienceBrief}
                className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-xl border border-galaxy-gold/40 bg-galaxy-gold px-4 text-[13px] font-semibold text-galaxy-ink transition hover:bg-galaxy-gold-lite active:translate-y-px"
              >
                Build audience brief
              </button>
            </article>
          </div>
        </section>

        <section
          id={panelId('wallet')}
          role="tabpanel"
          aria-labelledby={tabId('wallet')}
          aria-label={panelNames.wallet}
          hidden={activeTab !== 'wallet'}
        >
          <div className="mb-[18px] min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
              Category capture
            </div>
            <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,2.375rem)] font-semibold text-galaxy-cream">
              Where Galaxy owns wallet share
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">
              Average category capture across selected segments, with the market remainder shown as CDE-modelled
              leakage.
            </p>
          </div>
          <div className="grid min-w-0 gap-4">
            {categoryRows.map((row) => (
              <div key={row.category} className="rounded-2xl border border-white/10 bg-galaxy-ink/40 p-4">
                <div className="mb-2 flex min-w-0 flex-wrap justify-between gap-3 text-sm font-semibold text-galaxy-cream">
                  <span>{row.label}</span>
                  <span className="font-mono text-xs text-galaxy-muted">
                    {row.capturedLabel} captured / {row.leakageLabel} leakage
                  </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-galaxy-market">
                  <div className="h-full rounded-full bg-galaxy-gold" style={{ width: `${row.capturedSharePct}%` }} />
                </div>
                <p className="mt-2 text-xs leading-5 text-galaxy-muted">{row.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id={panelId('segments')}
          role="tabpanel"
          aria-labelledby={tabId('segments')}
          aria-label={panelNames.segments}
          hidden={activeTab !== 'segments'}
        >
          <div className="mb-[18px] min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
              Audience ranking
            </div>
            <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,2.375rem)] font-semibold text-galaxy-cream">
              Segment priority board
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">
              Each segment card connects Galaxy-known behavior to the CDE wallet reveal, so Marketing can move from
              insight to audience selection.
            </p>
          </div>
          <div className="mb-2 flex flex-wrap gap-2" aria-label="Segment priority filters">
            {(['all', 'priority', 'watch', 'nurture'] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className="min-h-9 rounded-full border border-white/10 bg-galaxy-ink/45 px-3 text-xs font-semibold text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream aria-pressed:border-galaxy-gold/40 aria-pressed:bg-galaxy-gold/12 aria-pressed:text-galaxy-cream"
              >
                {filterLabels[item]}
              </button>
            ))}
          </div>
          <p
            aria-label="Segment filter status"
            role="status"
            aria-live="polite"
            className="text-xs leading-5 text-galaxy-muted"
          >
            Showing {filteredSegmentRows.length} {filter === 'all' ? 'all' : filter} audience{' '}
            {filteredSegmentRows.length === 1 ? 'segment' : 'segments'}.
          </p>
          <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-3" role="list" aria-live="polite">
            {filteredSegmentRows.map((segment) => (
              <article
                key={segment.id}
                role="listitem"
                className="galaxy-glass-panel grid min-h-[242px] min-w-0 content-between rounded-[18px] border border-white/10 p-4"
              >
                <div className="min-w-0">
                  <span className="inline-flex min-h-[30px] items-center rounded-full border border-white/10 px-2.5 text-xs font-semibold capitalize text-galaxy-muted">
                    {segment.priority}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold leading-tight text-galaxy-cream">{segment.name}</h3>
                  <p className="mt-2.5 text-[13px] leading-6 text-galaxy-muted">{segment.summary}</p>
                </div>
                <div className="grid min-w-0 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-galaxy-charcoal/60 p-2.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-galaxy-muted">
                      Audience
                    </span>
                    <b className="mt-1.5 block font-mono text-[13px] text-galaxy-cream">{segment.audience}</b>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-galaxy-charcoal/60 p-2.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-galaxy-muted">
                      Index
                    </span>
                    <b className="mt-1.5 block font-mono text-[13px] text-galaxy-cream">{segment.index}</b>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-galaxy-charcoal/60 p-2.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-galaxy-muted">
                      Leakage
                    </span>
                    <b className="mt-1.5 block font-mono text-[13px] text-galaxy-cream">{segment.leakageLabel}</b>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id={panelId('activation')}
          role="tabpanel"
          aria-labelledby={tabId('activation')}
          aria-label={panelNames.activation}
          hidden={activeTab !== 'activation'}
        >
          <div className="mb-[18px] min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
              Campaign action
            </div>
            <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,2.375rem)] font-semibold text-galaxy-cream">
              Recommended activation plays
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">
              Top findings convert into channel, offer, and audience instructions that a Galaxy Marketing team can
              test.
            </p>
          </div>
          <div className="grid min-w-0 gap-3">
            {playbookRows.map((row) => (
              <article
                key={row.id}
                className="grid min-w-0 gap-4 rounded-2xl border border-white/10 bg-galaxy-ink/40 p-4 md:grid-cols-[minmax(0,1fr)_150px_120px] md:items-center"
              >
                <div className="min-w-0">
                  <h3 className="m-0 text-base font-semibold text-galaxy-cream">{row.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-galaxy-muted">{row.summary}</p>
                </div>
                <span className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 px-2.5 text-xs font-semibold text-galaxy-muted">
                  {row.channel}
                </span>
                <span className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 px-2.5 text-xs font-semibold text-galaxy-muted">
                  {row.indexLabel}
                </span>
              </article>
            ))}
          </div>
          <div className="galaxy-table-wrap mt-4 overflow-x-auto" tabIndex={0} aria-label="Recommended activation plays table">
            <table className="galaxy-table">
              <caption className="sr-only">Recommended activation plays by segment</caption>
              <thead>
                <tr>
                  <th scope="col">Finding</th>
                  <th scope="col">Primary leakage</th>
                  <th scope="col">Wallet band</th>
                  <th scope="col">Next action</th>
                </tr>
              </thead>
              <tbody>
                {playbookRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.segment}</td>
                    <td>{row.rationale}</td>
                    <td className="galaxy-number">{row.cashBand}</td>
                    <td>{row.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id={panelId('workbench')}
          role="tabpanel"
          aria-labelledby={tabId('workbench')}
          aria-label={panelNames.workbench}
          hidden={activeTab !== 'workbench'}
        >
          <div className="mb-[18px] min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
              Ranking evidence
            </div>
            <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,2.375rem)] font-semibold text-galaxy-cream">
              Why the dashboard ranks this audience first
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-6 text-galaxy-muted">
              The scoring view shows formula inputs, confidence boundaries, and governed handoff from evidence to
              campaign action.
            </p>
          </div>
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="min-w-0 rounded-2xl border border-white/10 bg-galaxy-ink/40 p-4">
              <h3 className="text-base font-semibold text-galaxy-cream">Ranking formula in buyer language</h3>
              <div className="mt-3 grid gap-2 text-[13px] leading-6 text-galaxy-muted">
                <div className="grid gap-3 sm:grid-cols-[112px_1fr]">
                  <b className="font-mono text-xs text-galaxy-cream">{selectedSegment.opportunityIndex} index</b>
                  <span>Opportunity signal above the matched-cohort baseline of 100.</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[112px_1fr]">
                  <b className="font-mono text-xs text-galaxy-cream">{selectedLeakage.leakageLabel} leak</b>
                  <span>Primary wallet still outside Galaxy, expressed as a modelled CDE percentage.</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[112px_1fr]">
                  <b className="font-mono text-xs text-galaxy-cream">{selectedSegment.crossPropertyCashBand}</b>
                  <span>Modelled wallet band used for campaign sizing without customer-level values.</span>
                </div>
              </div>

              <div className="galaxy-table-wrap mt-4 overflow-x-auto" tabIndex={0} aria-label="Opportunity ranking formula table">
                <table className="galaxy-table">
                  <caption className="sr-only">Opportunity ranking formula by segment</caption>
                  <thead>
                    <tr>
                      <th scope="col">Segment</th>
                      <th scope="col">Index</th>
                      <th scope="col">Leakage</th>
                      <th scope="col">Confidence</th>
                      <th scope="col">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workbenchRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.segment}</td>
                        <td className="galaxy-number">{row.index}</td>
                        <td className="galaxy-number">{row.leakageLabel}</td>
                        <td>{row.confidence}</td>
                        <td>{row.decision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-white/10 bg-galaxy-ink/40 p-4">
              <h3 className="text-base font-semibold text-galaxy-cream">Trust and interpretation guardrails</h3>
              <div className="mt-3 grid gap-2 text-[13px] leading-6 text-galaxy-muted">
                <div className="grid gap-3 border-t border-white/10 pt-2 sm:grid-cols-[96px_1fr]">
                  <b className="text-galaxy-cream">Coverage</b>
                  <span>{methodology.matchedCoveragePct}% matched CDE coverage. Keep every figure as a range, percentage, or index.</span>
                </div>
                <div className="grid gap-3 border-t border-white/10 pt-2 sm:grid-cols-[96px_1fr]">
                  <b className="text-galaxy-cream">Refresh</b>
                  <span>{quarter.label} snapshot. New leaders and deteriorating capture are flagged each quarter.</span>
                </div>
                <div className="grid gap-3 border-t border-white/10 pt-2 sm:grid-cols-[96px_1fr]">
                  <b className="text-galaxy-cream">Suppression</b>
                  <span>No customer-level export. Output campaign segments and CDE-safe rationale only.</span>
                </div>
                <div className="grid gap-3 border-t border-white/10 pt-2 sm:grid-cols-[96px_1fr]">
                  <b className="text-galaxy-cream">Measure</b>
                  <span>Each activation returns to the next refresh with capture, leakage, and conversion change.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside
        aria-label="Ask CDE AI"
        className="galaxy-glass-panel sticky top-[18px] grid min-w-0 gap-4 self-start rounded-[20px] border border-white/10 p-5"
      >
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-galaxy-gold">
            Ask CDE AI
          </div>
          <h2 className="mt-2 font-serif text-[clamp(1.875rem,3vw,2.125rem)] font-semibold leading-tight text-galaxy-cream">
            Explain the next best audience.
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-galaxy-muted">
            Generate an executive-safe answer using only modelled ranges, percentages, and indices.
          </p>
        </div>

        <div className="grid min-w-0 gap-2.5">
          <input
            aria-label="CDE assistant prompt"
            aria-describedby="cde-assistant-prompt-help"
            aria-invalid={Boolean(promptError)}
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setPromptError('');
            }}
            className="min-h-[46px] w-full min-w-0 rounded-[13px] border border-white/10 bg-galaxy-ink/55 px-3 text-galaxy-cream aria-invalid:border-galaxy-leak"
          />
          <p
            id="cde-assistant-prompt-help"
            className={clsx('min-h-[18px] text-xs leading-5', promptError ? 'text-galaxy-leak' : 'text-galaxy-muted')}
          >
            {promptError || 'Ask for an explanation, trust rationale, or CDE-safe campaign brief.'}
          </p>
          <button
            type="button"
            onClick={generateAnswer}
            className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-galaxy-gold/40 bg-galaxy-gold px-4 text-[13px] font-semibold text-galaxy-ink transition hover:bg-galaxy-gold-lite active:translate-y-px"
          >
            Generate answer
          </button>
        </div>

        <div className="flex min-w-0 flex-wrap gap-2" aria-label="Assistant quick prompts">
          <button
            type="button"
            onClick={() => loadQuickPrompt('Show me the opportunity map', 'Chart explained', 'Opportunity map')}
            className="min-h-8 rounded-full border border-white/10 bg-galaxy-ink/45 px-2.5 text-xs font-semibold text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream"
          >
            Explain chart
          </button>
          <button
            type="button"
            onClick={() => loadQuickPrompt('Why should Galaxy trust this CDE answer?', 'Governance answer ready', 'Trust rationale')}
            className="min-h-8 rounded-full border border-white/10 bg-galaxy-ink/45 px-2.5 text-xs font-semibold text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream"
          >
            Why trust it?
          </button>
          <button
            type="button"
            onClick={() => loadQuickPrompt('Build the campaign activation', 'Campaign brief ready', 'Campaign brief')}
            className="min-h-8 rounded-full border border-white/10 bg-galaxy-ink/45 px-2.5 text-xs font-semibold text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream"
          >
            Build brief
          </button>
        </div>

        <div
          className="min-h-[190px] min-w-0 rounded-2xl border border-white/10 bg-galaxy-ink/50 p-4 text-sm leading-7 text-galaxy-cream"
          aria-live="polite"
        >
          {assistantAnswer}
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3 text-[11px] font-mono text-galaxy-muted" role="status" aria-live="polite">
          <span>{assistantStatus}</span>
          <button
            type="button"
            onClick={() => {
              void copyAnswer();
            }}
            className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-galaxy-cream transition hover:border-galaxy-gold/40 hover:text-galaxy-gold"
          >
            Copy answer
          </button>
        </div>
      </aside>
    </section>
  );
}
