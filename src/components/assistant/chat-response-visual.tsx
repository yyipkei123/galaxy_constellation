import { CdeChip } from '@/components/ui/cde-chip';
import type { ChatAssistantVisual, ChatVisualItem } from '@/lib/chat-assistant';

interface ChatResponseVisualProps {
  visual: ChatAssistantVisual;
}

function getStableItemKey(item: ChatVisualItem): string {
  return `${item.id || item.label}-${item.label}-${item.value}-${item.formattedValue}`;
}

function getMaxPositiveValue(items: ChatVisualItem[]): number {
  return Math.max(
    0,
    ...items.map((item) => (Number.isFinite(item.value) && item.value > 0 ? item.value : 0)),
  );
}

function formatWidth(value: number): string {
  return `${Number.isInteger(value) ? value : Number(value.toFixed(2))}%`;
}

function getBarWidth(value: number, maxValue: number): string {
  if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(maxValue) || maxValue <= 0) {
    return '6%';
  }

  return formatWidth(Math.min(100, Math.max(6, (value / maxValue) * 100)));
}

function BarList({ items }: { items: ChatVisualItem[] }) {
  const maxValue = getMaxPositiveValue(items);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={getStableItemKey(item)} className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-galaxy-cream">{item.label}</p>
              <p className="mt-1 text-xs text-galaxy-muted">{item.description}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-galaxy-gold">{item.formattedValue}</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-galaxy-border/45">
            <div
              aria-label={`${item.label} bar value ${item.formattedValue}`}
              className="h-full rounded-full bg-galaxy-gold"
              style={{ width: getBarWidth(item.value, maxValue) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricStrip({ items }: { items: ChatVisualItem[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div key={getStableItemKey(item)} className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">{item.label}</p>
          <p className="mt-2 text-lg font-semibold text-galaxy-gold">{item.formattedValue}</p>
          <p className="mt-1 text-xs text-galaxy-muted">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function ChatResponseVisual({ visual }: ChatResponseVisualProps) {
  const hasItems = visual.items.length > 0;

  return (
    <figure
      aria-label={visual.title}
      className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4 text-galaxy-cream"
    >
      <figcaption className="mb-4 flex items-center gap-2 text-sm font-semibold text-galaxy-cream">
        <span>{visual.title}</span>
        <CdeChip />
      </figcaption>

      {!hasItems ? (
        <p className="text-sm text-galaxy-muted">No visual data available for this answer.</p>
      ) : visual.kind === 'bar-list' ? (
        <BarList items={visual.items} />
      ) : (
        <MetricStrip items={visual.items} />
      )}
    </figure>
  );
}
