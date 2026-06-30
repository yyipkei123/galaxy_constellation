'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PriorityQuadrant } from '@/components/charts/priority-quadrant';
import { LeadBoard } from '@/components/panels/lead-board';
import { TopLeadPreview } from '@/components/panels/top-lead-preview';
import { Panel } from '@/components/ui/panel';
import { guests, latestSegments, topPriorityGuests } from '@/data';

export default function GuestsPage() {
  return (
    <Suspense fallback={null}>
      <GuestsPageContent />
    </Suspense>
  );
}

function GuestsPageContent() {
  const [toast, setToast] = useState('');
  const searchParams = useSearchParams();
  const selectedSegmentId = searchParams.get('segment') ?? '';
  const selectedSegment = latestSegments.find((segment) => segment.id === selectedSegmentId);
  const scopedGuests = selectedSegment
    ? guests.filter((guest) => guest.segmentId === selectedSegment.id)
    : guests;
  const quadrantGuests = selectedSegment
    ? [...scopedGuests].sort((first, second) => second.leadScore - first.leadScore).slice(0, 12)
    : topPriorityGuests;

  return (
    <div className="space-y-6 text-galaxy-cream">
      <Panel variant="hero" className="overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
              Customer 360 lead prioritization
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-galaxy-cream md:text-5xl">
              Guest priority command
            </h1>
            <p className="mt-4 max-w-4xl text-base leading-7 text-galaxy-muted md:text-lg md:leading-8">
              Galaxy already knows internal behavior; Mastercard CDE adds external behavior.
              Fuse them per guest and the platform shows who to pitch next, why they rank high,
              and which host action should happen now.
            </p>
          </div>
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4 text-sm leading-6 text-galaxy-muted">
            Masked synthetic demo records only. CDE values render as percentages, indices,
            propensities, or modelled bands.
          </div>
        </div>
      </Panel>

      {selectedSegment ? (
        <Panel className="border-galaxy-gold/30 bg-galaxy-gold/10">
          <div role="status" className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                Segment scope
              </p>
              <p className="mt-2 text-sm leading-6 text-galaxy-muted">
                Scoped to <span className="font-semibold text-galaxy-cream">{selectedSegment.name}</span>.
                {' '}Showing <span className="font-semibold text-galaxy-cream">{scopedGuests.length}</span> matched guests
                in the quadrant and lead board.
              </p>
            </div>
            <Link
              href="/guests"
              className="inline-flex min-h-11 items-center rounded-lg border border-galaxy-gold/50 px-4 py-2 text-sm font-semibold text-galaxy-gold transition hover:bg-galaxy-gold/10"
            >
              Clear segment scope
            </Link>
          </div>
        </Panel>
      ) : null}

      <TopLeadPreview guests={scopedGuests} />
      <PriorityQuadrant guests={quadrantGuests} />
      <LeadBoard guests={scopedGuests} onAction={setToast} />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-24 right-5 z-50 max-w-[calc(100vw-2rem)] rounded-lg border border-galaxy-gold/40 bg-galaxy-charcoal px-4 py-3 text-sm text-galaxy-cream shadow-2xl shadow-black/30"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
