'use client';

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import type { Segment } from '@/data';
import { galaxyPalette } from '@/lib/palette';

export function SpendRadar({ segment }: { segment: Segment }) {
  const data = [
    { label: 'Hospitality', value: segment.categories.hospitality.totalWalletIndex },
    { label: 'F&B', value: segment.categories.fnb.totalWalletIndex },
    { label: 'Entertainment', value: segment.categories.entertainment.totalWalletIndex },
    { label: 'Retail-Luxury', value: segment.categories.retailLuxury.totalWalletIndex },
    { label: 'Gaming context', value: segment.gamingContextIndex ?? 100 },
    { label: 'Cross-property cash', value: segment.crossPropertyCashIndex },
  ];

  return (
    <div className="h-80" aria-label={`${segment.name} spend index radar`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke={galaxyPalette.border} />
          <PolarAngleAxis dataKey="label" stroke={galaxyPalette.muted} tick={{ fontSize: 11 }} />
          <Radar dataKey="value" stroke={galaxyPalette.gold} fill={galaxyPalette.gold} fillOpacity={0.22} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
