'use client';

import { useState } from 'react';
import { PriorityQuadrant } from '@/components/charts/priority-quadrant';
import { LeadBoard } from '@/components/panels/lead-board';
import { Panel } from '@/components/ui/panel';
import { guests, topPriorityGuests } from '@/data';

export default function GuestsPage() {
  const [toast, setToast] = useState('');

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

      <PriorityQuadrant guests={topPriorityGuests} />
      <LeadBoard guests={guests} onAction={setToast} />

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
