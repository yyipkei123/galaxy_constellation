'use client';

import { useMemo, useState } from 'react';
import { ScenarioImpactConstellation } from '@/components/charts/scenario-impact-constellation';
import { BandValue, IndexValue } from '@/components/ui/formatted-values';
import { MetricTile } from '@/components/ui/metric-tile';
import { Overline } from '@/components/ui/overline';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { CORE_CATEGORIES, type CoreCategory, type ScenarioLever, type Segment } from '@/data';
import { buildScenarioImpact, sanitizeScenarioLabel } from '@/lib/scenario-simulator';
import { useAppState } from '@/store/app-store';

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

const leverLabels: Record<ScenarioLever, string> = {
  recapture: 'Recapture',
  channelShift: 'Channel shift',
  hostLift: 'Host lift',
  contentPersonalisation: 'Content personalisation',
};

const leverOptions: ScenarioLever[] = ['recapture', 'channelShift', 'hostLift', 'contentPersonalisation'];

function isSegment(segment: Segment | undefined): segment is Segment {
  return Boolean(segment);
}

function clampSliderValue(value: string, min: number, max: number) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return min;
  return Math.min(max, Math.max(min, Math.round(numericValue)));
}

export default function SimulatePage() {
  const { segments, selectedSegment, saveScenario } = useAppState();
  const safeSegments = useMemo(
    () => (Array.isArray(segments) ? segments.filter(isSegment) : []),
    [segments],
  );
  const activeSegment = safeSegments.find((segment) => segment.id === selectedSegment?.id) ?? safeSegments[0];
  const [category, setCategory] = useState<CoreCategory>('hospitality');
  const [lever, setLever] = useState<ScenarioLever>('recapture');
  const [recapturePct, setRecapturePct] = useState(18);
  const [onlineShiftPct, setOnlineShiftPct] = useState(8);
  const [status, setStatus] = useState('');
  const activeSegmentIds = useMemo(() => (activeSegment ? [activeSegment.id] : []), [activeSegment]);
  const activeSegmentName = sanitizeScenarioLabel(activeSegment?.name, 'No active segment');
  const impact = useMemo(() => buildScenarioImpact({
    segments: safeSegments,
    segmentIds: activeSegmentIds,
    category,
    recapturePct,
    onlineShiftPct,
    lever,
  }), [activeSegmentIds, category, lever, onlineShiftPct, recapturePct, safeSegments]);

  function saveCurrentScenario() {
    const scenarioName = `${activeSegmentName} ${leverLabels[lever]} scenario`;
    const scenario = saveScenario({
      name: scenarioName,
      segmentIds: activeSegmentIds,
      category,
      recapturePct,
      onlineShiftPct,
      lever,
    });

    setStatus(`Scenario saved: ${sanitizeScenarioLabel(scenario.name, scenarioName)}`);
  }

  return (
    <div className="min-w-0 space-y-6 overflow-hidden text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Decision intelligence"
        title="What-if Scenario Simulator"
        description={(
          <>
            Adjust CDE-safe recapture and channel levers to model segment-level index movement before activation.
            Outputs stay deterministic, finite, and banded.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">Active segment</p>
            <p className="mt-2">Scenario target: {activeSegmentName}</p>
          </>
        )}
      />

      {status ? (
        <div role="status" className="rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-4 text-sm font-semibold text-galaxy-cream">
          {status}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <Panel className="min-w-0">
          <Overline>Scenario controls</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Levers</h2>

          <div className="mt-5 space-y-5">
            <label className="block text-sm font-semibold text-galaxy-muted" htmlFor="scenario-category">
              Category
              <select
                id="scenario-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as CoreCategory)}
                className="mt-2 w-full rounded-md border border-galaxy-border bg-galaxy-ink px-3 py-2 text-galaxy-cream focus:border-galaxy-gold focus:outline-none"
              >
                {CORE_CATEGORIES.map((option) => (
                  <option key={option} value={option}>{categoryLabels[option]}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-galaxy-muted" htmlFor="scenario-lever">
              Lever
              <select
                id="scenario-lever"
                value={lever}
                onChange={(event) => setLever(event.target.value as ScenarioLever)}
                className="mt-2 w-full rounded-md border border-galaxy-border bg-galaxy-ink px-3 py-2 text-galaxy-cream focus:border-galaxy-gold focus:outline-none"
              >
                {leverOptions.map((option) => (
                  <option key={option} value={option}>{leverLabels[option]}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-galaxy-muted" htmlFor="recapture-leakage">
              Recapture leakage
              <span className="float-right text-galaxy-cream">{recapturePct}%</span>
              <input
                id="recapture-leakage"
                aria-label="Recapture leakage"
                type="range"
                min={0}
                max={60}
                value={recapturePct}
                onChange={(event) => setRecapturePct(clampSliderValue(event.target.value, 0, 60))}
                className="mt-3 w-full accent-galaxy-gold"
              />
            </label>

            <label className="block text-sm font-semibold text-galaxy-muted" htmlFor="online-channel-shift">
              Shift online channel mix
              <span className="float-right text-galaxy-cream">{onlineShiftPct >= 0 ? '+' : ''}{onlineShiftPct} pts</span>
              <input
                id="online-channel-shift"
                aria-label="Shift online channel mix"
                type="range"
                min={-20}
                max={30}
                value={onlineShiftPct}
                onChange={(event) => setOnlineShiftPct(clampSliderValue(event.target.value, -20, 30))}
                className="mt-3 w-full accent-galaxy-gold"
              />
            </label>

            <button
              type="button"
              onClick={saveCurrentScenario}
              className="w-full rounded-md bg-galaxy-gold px-4 py-3 text-sm font-semibold text-galaxy-ink transition hover:bg-galaxy-gold-lite focus:outline-none focus:ring-2 focus:ring-galaxy-gold focus:ring-offset-2 focus:ring-offset-galaxy-charcoal"
            >
              Save scenario
            </button>
          </div>
        </Panel>

        <div className="min-w-0 space-y-5">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Wallet uplift"
              value={<IndexValue value={impact.walletUpliftIndex} label="CDE wallet uplift signal" />}
              detail={`${activeSegmentName} / ${categoryLabels[category]}`}
            />
            <MetricTile
              label="Opportunity delta"
              value={<IndexValue value={impact.opportunityIndexDelta} label="CDE opportunity movement" />}
              detail={leverLabels[lever]}
            />
            <MetricTile
              label="Pitch-now movement"
              value={`${impact.pitchNowGuestsK}k`}
              detail="Modelled matched guests."
            />
            <MetricTile
              label="Projected band"
              value={<BandValue value={impact.projectedBand} />}
              detail="Indexed equivalent movement."
            />
          </div>

          <ScenarioImpactConstellation impact={impact} />
        </div>
      </div>
    </div>
  );
}
