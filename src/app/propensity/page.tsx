'use client';

import { AudienceBuilder } from '@/components/panels/audience-builder';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import { useAppState } from '@/store/app-store';

export default function PropensityPage() {
  const { segments, filters, setFilters, saveAudience } = useAppState();

  return (
    <div className="space-y-6 text-galaxy-cream">
      <section className="rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_left,rgba(205,164,92,0.2),transparent_34%),linear-gradient(135deg,rgba(31,27,24,0.96),rgba(8,18,30,0.92))] px-6 py-8 shadow-2xl shadow-black/25 md:px-8">
        <Overline>Turn insight into a targetable audience</Overline>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <h1 className="font-serif text-5xl text-galaxy-cream md:text-6xl">Propensity &amp; Audience Builder</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
              Build a CDE-compliant target audience from segment-level luxury hotel, rewards, look-alike, and leakage
              signals, then save it for Galaxy activation without exposing raw customer-level currency.
            </p>
          </div>
          <Panel className="bg-galaxy-ink/45 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">CDE activation guardrail</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Audience sizing and wallet potential stay at banded or indexed levels only.
            </p>
          </Panel>
        </div>
      </section>

      <AudienceBuilder
        segments={segments}
        filters={filters}
        setFilters={setFilters}
        saveAudience={saveAudience}
      />
    </div>
  );
}
