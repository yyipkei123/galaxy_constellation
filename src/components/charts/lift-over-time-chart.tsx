'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MeasurementReadout } from '@/lib/measurement';
import { formatEnriched } from '@/lib/format';
import { galaxyPalette } from '@/lib/palette';

interface LiftOverTimeChartProps {
  readout: MeasurementReadout;
}

function formatIndex(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? formatEnriched(value, 'index')
    : formatEnriched(0, 'index');
}

export function LiftOverTimeChart({ readout }: LiftOverTimeChartProps) {
  const hasData = readout.chartData.length > 0;

  return (
    <figure
      aria-label={`${readout.campaignName} Lift over time`}
      className="min-h-[18rem] rounded-lg border border-galaxy-border bg-galaxy-ink/30 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption className="text-sm font-semibold text-galaxy-cream">Lift over time</figcaption>
        <span className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
          Latest lift {readout.latestLiftLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-galaxy-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-5 rounded-full bg-galaxy-gold" aria-hidden="true" />
          Test group
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-5 rounded-full bg-cyan-300" aria-hidden="true" />
          Control holdout
        </span>
      </div>

      {hasData ? (
        <div className="mt-4 h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={readout.chartData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid stroke={galaxyPalette.border} strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke={galaxyPalette.muted} tick={{ fontSize: 11 }} />
              <YAxis stroke={galaxyPalette.muted} tick={{ fontSize: 11 }} domain={['dataMin - 4', 'dataMax + 4']} />
              <Tooltip
                formatter={(value) => formatIndex(value)}
                labelStyle={{ color: galaxyPalette.cream }}
                contentStyle={{
                  background: galaxyPalette.slate,
                  border: `1px solid ${galaxyPalette.border}`,
                  color: galaxyPalette.cream,
                }}
              />
              <Line
                type="monotone"
                dataKey="testGroup"
                name="Test group"
                stroke={galaxyPalette.gold}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="controlHoldout"
                name="Control holdout"
                stroke="#67e8f9"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-galaxy-border bg-galaxy-charcoal/70 p-4 text-sm text-galaxy-muted">
          No weekly measurement points yet.
        </p>
      )}
    </figure>
  );
}
