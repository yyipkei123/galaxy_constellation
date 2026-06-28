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
    return '0%';
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

function LeadList({ items }: { items: ChatVisualItem[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li
          key={getStableItemKey(item)}
          className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-galaxy-cream">
                <span className="mr-2 text-galaxy-muted">#{index + 1}</span>
                {item.label}
              </p>
              <p className="mt-1 text-xs text-galaxy-muted">{item.description}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-galaxy-gold">{item.formattedValue}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CorridorCard({ items }: { items: ChatVisualItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <article
          key={getStableItemKey(item)}
          className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-galaxy-cream">{item.label}</h3>
              <p className="mt-1 text-xs text-galaxy-muted">{item.description}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-galaxy-gold">{item.formattedValue}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function LineSeries({ items }: { items: ChatVisualItem[] }) {
  const maxValue = getMaxPositiveValue(items);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={getStableItemKey(item)} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3">
          <p className="text-xs font-semibold text-galaxy-cream">{item.label}</p>
          <div className="h-2 overflow-hidden rounded-full bg-galaxy-border/45">
            <div
              aria-label={`${item.label} lift ${item.formattedValue}`}
              className="h-full rounded-full bg-galaxy-positive"
              style={{ width: getBarWidth(item.value, maxValue) }}
            />
          </div>
          <p className="text-xs font-semibold text-galaxy-gold">{item.formattedValue}</p>
        </div>
      ))}
    </div>
  );
}

function FactTable({ items }: { items: ChatVisualItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.14em] text-galaxy-muted">
          <tr>
            <th scope="col" className="pr-3 font-semibold">Fact</th>
            <th scope="col" className="pr-3 font-semibold">Value</th>
            <th scope="col" className="font-semibold">Source</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={getStableItemKey(item)} className="bg-galaxy-ink/45">
              <td className="rounded-l-lg border-y border-l border-galaxy-border px-3 py-2 font-semibold text-galaxy-cream">
                {item.label}
              </td>
              <td className="border-y border-galaxy-border px-3 py-2 text-galaxy-gold">
                {item.formattedValue}
              </td>
              <td className="rounded-r-lg border-y border-r border-galaxy-border px-3 py-2 text-galaxy-muted">
                {item.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyVisual({ kind }: { kind: ChatAssistantVisual['kind'] }) {
  const message = kind === 'fact-table'
    ? 'No governed facts are available for this answer.'
    : 'No visual data available for this answer.';

  return <p className="text-sm text-galaxy-muted">{message}</p>;
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
        <EmptyVisual kind={visual.kind} />
      ) : visual.kind === 'bar-list' ? (
        <BarList items={visual.items} />
      ) : visual.kind === 'lead-list' ? (
        <LeadList items={visual.items} />
      ) : visual.kind === 'corridor-card' ? (
        <CorridorCard items={visual.items} />
      ) : visual.kind === 'line-series' ? (
        <LineSeries items={visual.items} />
      ) : visual.kind === 'fact-table' ? (
        <FactTable items={visual.items} />
      ) : (
        <MetricStrip items={visual.items} />
      )}
    </figure>
  );
}
