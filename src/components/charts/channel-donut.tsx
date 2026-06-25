'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { galaxyPalette } from '@/lib/palette';
import { clampPct } from './utils';

export function ChannelDonut({ onlinePct }: { onlinePct: number }) {
  const online = clampPct(onlinePct);
  const physical = 100 - online;
  const data = [
    { name: 'Online', value: online, color: galaxyPalette.gold },
    { name: 'Physical', value: physical, color: galaxyPalette.market },
  ];

  return (
    <div
      className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[120px_1fr]"
      aria-label={`Channel split: ${online}% online payment share, ${physical}% physical payment share`}
    >
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={36} outerRadius={52} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 text-sm text-galaxy-muted">
        <p>
          <span className="text-galaxy-gold">{`${online}%`}</span> online payment share
        </p>
        <p>
          <span className="text-galaxy-cream">{`${physical}%`}</span> physical payment share
        </p>
      </div>
    </div>
  );
}
