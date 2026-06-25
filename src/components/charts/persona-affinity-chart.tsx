import type { Corridor } from '@/data';
import { PercentValue } from '@/components/ui/formatted-values';
import { clampPct } from './utils';

export function PersonaAffinityChart({ corridor }: { corridor: Corridor }) {
  return (
    <div className="space-y-3">
      {corridor.personas.map((persona) => (
        <article key={persona.persona} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-galaxy-cream">{persona.label}</p>
              <p className="mt-1 text-xs text-galaxy-muted">{persona.topCategories.join(' + ')}</p>
            </div>
            <span className="font-mono text-galaxy-gold">
              <PercentValue value={persona.sharePct} />
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-galaxy-slate">
            <div className="h-2 rounded-full bg-galaxy-gold" style={{ width: `${clampPct(persona.sharePct)}%` }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{persona.recommendedOffer}</p>
        </article>
      ))}
    </div>
  );
}
