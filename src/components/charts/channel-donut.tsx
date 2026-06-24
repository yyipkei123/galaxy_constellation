'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { galaxyPalette } from '@/lib/palette';

export function ChannelDonut({ onlinePct }: { onlinePct: number }) {
  const data = [
    { name: 'Online', value: onlinePct, color: galaxyPalette.gold },
    { name: 'Physical', value: 100 - onlinePct, color: galaxyPalette.market },
  ];

  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
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
          <span className="text-galaxy-gold">{onlinePct}%</span> online payment share
        </p>
        <p>
          <span className="text-galaxy-cream">{100 - onlinePct}%</span> physical payment share
        </p>
      </div>
    </div>
  );
}
