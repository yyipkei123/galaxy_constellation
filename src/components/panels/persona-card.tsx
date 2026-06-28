'use client';

import clsx from 'clsx';
import { IndexValue } from '@/components/ui/formatted-values';
import type { SegmentPersona } from '@/data';

interface PersonaCardProps {
  persona: SegmentPersona;
  isSelected: boolean;
  onSelect: (personaId: string) => void;
}

const PRIORITY_LABELS: Record<SegmentPersona['priority'], string> = {
  priority: 'Priority',
  watch: 'Watch',
  nurture: 'Nurture',
};

export function PersonaCard({ persona, isSelected, onSelect }: PersonaCardProps) {
  const readinessWidth = `${Math.max(6, persona.readinessScore)}%`;

  return (
    <button
      type="button"
      aria-label={`persona: ${persona.name}`}
      aria-pressed={isSelected}
      onClick={() => onSelect(persona.id)}
      className={clsx(
        'w-full rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
        isSelected
          ? 'border-galaxy-gold bg-galaxy-gold/15 shadow-lg shadow-black/20'
          : 'border-galaxy-border bg-galaxy-ink/35 hover:border-galaxy-gold/70 hover:bg-galaxy-ink/55',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">
          {PRIORITY_LABELS[persona.priority]}
        </span>
        <span className="text-sm font-semibold text-galaxy-gold">~{persona.audienceK}k</span>
      </div>

      <span className="mt-4 block font-serif text-2xl text-galaxy-cream">{persona.name}</span>
      <p className="mt-2 text-sm font-semibold text-galaxy-muted">
        {persona.ageBand} · {persona.travelMode}
      </p>
      <p className="mt-4 text-sm leading-6 text-galaxy-muted">{persona.primaryNeed}</p>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
          <span>Readiness</span>
          <span className="text-galaxy-cream">{persona.readinessScore}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-galaxy-charcoal">
          <div className="h-full rounded-full bg-galaxy-gold" style={{ width: readinessWidth }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-galaxy-gold">
        <IndexValue value={persona.opportunityIndex} label="CDE opportunity signal" showSignal />
        <span className="rounded border border-galaxy-border bg-galaxy-charcoal/70 px-2 py-1 text-xs text-galaxy-muted">
          {persona.wealthTier}
        </span>
      </div>
    </button>
  );
}
