import type { CoreCategory, Segment } from '@/data';
import { CdeChip } from '@/components/ui/cde-chip';
import { clampPct } from './utils';

const labels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail/Luxury',
};

export function CategoryStackedBar({ segments, category }: { segments: Segment[]; category: CoreCategory }) {
  const capture = clampPct(
    segments.reduce((sum, segment) => sum + segment.categories[category].capturedSharePct, 0) / segments.length,
  );
  const leak = 100 - capture;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-galaxy-cream">
          <span>{labels[category]}</span>
          <CdeChip />
        </div>
        <span className="text-xs text-galaxy-muted">
          {capture}% captured / {leak}% leakage
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-galaxy-market">
        <div
          className="h-full bg-galaxy-capture"
          style={{ width: `${capture}%` }}
          aria-label={`${labels[category]} captured ${capture}%`}
        />
      </div>
      <div className="mt-1 text-xs text-galaxy-muted">Galaxy wallet split vs market remainder</div>
    </div>
  );
}
