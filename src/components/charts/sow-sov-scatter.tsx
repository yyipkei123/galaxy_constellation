'use client';

import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { Segment } from '@/data';
import { galaxyPalette } from '@/lib/palette';

export function SowSovScatter({ segments }: { segments: Segment[] }) {
  const data = segments.map((segment) => ({
    name: segment.name,
    sow: segment.metrics.shareOfWallet,
    sov: segment.metrics.shareOfVisits,
  }));

  return (
    <div className="h-72 md:h-80" aria-label="Share of wallet versus share of visits scatter chart">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 12, bottom: 24, left: 0 }}>
          <CartesianGrid stroke={galaxyPalette.border} />
          <XAxis dataKey="sow" name="Share of Wallet" stroke={galaxyPalette.muted} unit="%" />
          <YAxis dataKey="sov" name="Share of Visits" stroke={galaxyPalette.muted} unit="%" />
          <ReferenceLine x={35} stroke={galaxyPalette.market} strokeDasharray="4 4" />
          <ReferenceLine y={35} stroke={galaxyPalette.market} strokeDasharray="4 4" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              background: galaxyPalette.slate,
              border: `1px solid ${galaxyPalette.border}`,
              color: galaxyPalette.cream,
            }}
          />
          <Scatter data={data} fill={galaxyPalette.gold} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
