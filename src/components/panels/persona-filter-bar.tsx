'use client';

import type { PersonaPriority, PersonaWealthTier } from '@/data';
import type { PersonaSortMode } from '@/lib/personas';

type WealthTierFilter = PersonaWealthTier | 'All';
type PriorityFilter = PersonaPriority | 'All';

interface PersonaFilterBarProps {
  query: string;
  wealthTier: WealthTierFilter;
  priority: PriorityFilter;
  sort: PersonaSortMode;
  onQueryChange: (query: string) => void;
  onWealthTierChange: (wealthTier: WealthTierFilter) => void;
  onPriorityChange: (priority: PriorityFilter) => void;
  onSortChange: (sort: PersonaSortMode) => void;
}

const SORT_OPTIONS: Array<{ value: PersonaSortMode; label: string }> = [
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'audience', label: 'Audience' },
  { value: 'readiness', label: 'Readiness' },
];

const WEALTH_TIERS: WealthTierFilter[] = ['All', 'VIP', 'Premium', 'Mass-Affluent', 'Mass'];
const PRIORITIES: PriorityFilter[] = ['All', 'priority', 'watch', 'nurture'];

function chipClass(isSelected: boolean) {
  return isSelected
    ? 'border-galaxy-gold bg-galaxy-gold/15 text-galaxy-gold'
    : 'border-galaxy-border bg-galaxy-ink/35 text-galaxy-muted hover:border-galaxy-gold/70 hover:text-galaxy-cream';
}

function priorityLabel(priority: PriorityFilter) {
  if (priority === 'All') return priority;
  return priority;
}

export function PersonaFilterBar({
  query,
  wealthTier,
  priority,
  sort,
  onQueryChange,
  onWealthTierChange,
  onPriorityChange,
  onSortChange,
}: PersonaFilterBarProps) {
  return (
    <div className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/78 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block">
          <span className="sr-only">Search personas</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            placeholder="Search persona, need, wallet gap, or tag"
            className="h-11 w-full rounded-lg border border-galaxy-border bg-galaxy-ink/45 px-4 text-sm text-galaxy-cream outline-none transition placeholder:text-galaxy-muted focus:border-galaxy-gold focus:ring-2 focus:ring-galaxy-gold/30"
          />
        </label>

        <label className="block">
          <span className="sr-only">Sort personas</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.currentTarget.value as PersonaSortMode)}
            className="h-11 w-full rounded-lg border border-galaxy-border bg-galaxy-ink/45 px-3 text-sm font-semibold text-galaxy-cream outline-none transition focus:border-galaxy-gold focus:ring-2 focus:ring-galaxy-gold/30"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Wealth tier filters">
          {WEALTH_TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              aria-pressed={wealthTier === tier}
              onClick={() => onWealthTierChange(tier)}
              className={`rounded border px-3 py-1.5 text-xs font-semibold transition ${chipClass(wealthTier === tier)}`}
            >
              {tier}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Priority filters">
          {PRIORITIES.map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={priority === level}
              onClick={() => onPriorityChange(level)}
              className={`rounded border px-3 py-1.5 text-xs font-semibold transition ${chipClass(priority === level)}`}
            >
              {priorityLabel(level)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
