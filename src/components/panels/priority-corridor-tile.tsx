import Link from 'next/link';
import { IndexValue } from '@/components/ui/formatted-values';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { Corridor } from '@/data';
import { koreaRefreshTag } from '@/data';

export function PriorityCorridorTile({ corridor }: { corridor: Corridor }) {
  const tag = koreaRefreshTag(corridor);

  return (
    <Panel className="bg-[linear-gradient(135deg,rgba(205,164,92,0.16),rgba(8,18,30,0.82))]">
      <Overline>Priority corridor</Overline>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-sans text-3xl font-semibold text-galaxy-cream">{corridor.name}</h2>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">{corridor.note ?? 'Acquisition priority'}</p>
          {tag ? (
            <p className="mt-3 inline-flex rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold text-galaxy-gold">
              {tag}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Priority score</p>
          <div className="mt-2 text-2xl font-semibold">
            <IndexValue value={corridor.priorityIndex} />
          </div>
        </div>
      </div>
      <Link
        href={`/acquisition?corridor=${corridor.id}`}
        className="mt-5 inline-flex rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink hover:bg-galaxy-gold-lite"
      >
        Open acquisition recommendation
      </Link>
    </Panel>
  );
}
