'use client';

import { useMemo, useState } from 'react';
import { CorridorRankTable } from '@/components/charts/corridor-rank-table';
import { SeasonalityHeatmap } from '@/components/charts/seasonality-heatmap';
import { PriorityCorridorTile } from '@/components/panels/priority-corridor-tile';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import {
  CORRIDOR_METRIC_LABELS,
  CORRIDOR_METRICS,
  CORRIDOR_YEARS,
  corridors,
  methodology,
  priorityCorridor,
  type CorridorMetric,
  type CorridorYear,
} from '@/data';

export default function CorridorsPage() {
  const [year, setYear] = useState<CorridorYear>('2024');
  const [metric, setMetric] = useState<CorridorMetric>('arrivals');
  const rankedCorridors = useMemo(() => [...corridors].sort((first, second) => first.priorityRank - second.priorityRank), []);

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Corridors acquisition"
        title="Source-Market & Corridor Intelligence"
        description="Rank inbound source markets using aggregate Mastercard panel signals for acquisition planning."
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">{methodology.panelSharePct} panel</p>
            <p className="mt-2">{methodology.lensBNote}. Corridor figures use labelled CDE indices with 100 as baseline, then blend with first-party and other sources.</p>
          </>
        )}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Top inbound markets"
              title="Corridor ranking"
              description="Top source markets ranked by computed acquisition attractiveness using labelled indices, percentages, ranks, and bands."
            />
            <div className="flex flex-wrap gap-3">
              <div
                role="group"
                aria-label="Corridor year"
                className="inline-flex rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] p-1"
              >
                {CORRIDOR_YEARS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={year === item}
                    className={year === item ? 'rounded-[7px] bg-galaxy-gold px-3 py-1.5 text-sm font-semibold text-galaxy-ink' : 'rounded-[7px] px-3 py-1.5 text-sm font-semibold text-galaxy-muted'}
                    onClick={() => setYear(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <label className="text-sm text-galaxy-muted">
                <span className="sr-only">Corridor metric</span>
                <select
                  aria-label="Corridor metric"
                  className="h-10 rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] px-3 font-semibold text-galaxy-cream"
                  value={metric}
                  onChange={(event) => setMetric(event.target.value as CorridorMetric)}
                >
                  {CORRIDOR_METRICS.map((item) => (
                    <option key={item} value={item}>{CORRIDOR_METRIC_LABELS[item]}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <CorridorRankTable corridors={rankedCorridors} year={year} metric={metric} />
        </Panel>

        <div className="min-w-0">
          <PriorityCorridorTile corridor={priorityCorridor} />
        </div>
      </div>

      <Panel className="min-w-0">
        <div className="mb-5">
          <SectionHeader
            eyebrow="Seasonality"
            title="Month x corridor intensity"
            description="Heat shows directional visit/spend intensity by corridor month, indexed to each corridor average."
          />
        </div>
        <SeasonalityHeatmap corridors={rankedCorridors} />
      </Panel>
    </div>
  );
}
