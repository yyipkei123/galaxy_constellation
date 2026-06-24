'use client';

import clsx from 'clsx';
import type { Segment } from '@/data';

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  onSelect: (segmentId: string) => void;
}

export function SegmentCard({ segment, isSelected, onSelect }: SegmentCardProps) {
  return (
    <button
      type="button"
      aria-label={`segment: ${segment.name}`}
      aria-pressed={isSelected}
      onClick={() => onSelect(segment.id)}
      className={clsx(
        'w-full rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
        isSelected
          ? 'border-galaxy-gold bg-galaxy-gold/15 shadow-lg shadow-black/20'
          : 'border-galaxy-border bg-galaxy-ink/35 hover:border-galaxy-gold/70 hover:bg-galaxy-ink/55',
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-galaxy-gold">
        {segment.nameZh}
      </span>
      <span className="mt-2 block font-serif text-2xl text-galaxy-cream">{segment.name}</span>
      <span className="mt-3 block text-sm leading-6 text-galaxy-muted">{segment.signatureTrait}</span>
      <span className="mt-4 inline-flex rounded border border-galaxy-border bg-galaxy-charcoal/70 px-2 py-1 text-xs font-semibold text-galaxy-muted">
        {segment.sizeBand}
      </span>
    </button>
  );
}
