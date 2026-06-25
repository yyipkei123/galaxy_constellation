import Link from 'next/link';
import { GamingSplitBar } from '@/components/charts/gaming-split-bar';
import { PersonaAffinityChart } from '@/components/charts/persona-affinity-chart';
import { SeasonalityHeatmap } from '@/components/charts/seasonality-heatmap';
import { IndexValue } from '@/components/ui/formatted-values';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import type { Corridor } from '@/data';

export function CorridorDetailPanel({ corridor }: { corridor: Corridor }) {
  const dominantPersona = corridor.personas[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel>
          <SectionHeader
            eyebrow="Affinity analysis"
            title="Persona mix"
            description="Aggregate co-spend themes translate each corridor into targetable acquisition messages."
          />
          <div className="mt-5">
            <PersonaAffinityChart corridor={corridor} />
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            eyebrow="Offer bridge"
            title="Recommended offer + KV brief"
            description={dominantPersona.kvBrief}
          />
          <p className="mt-5 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-4 text-sm font-semibold leading-6 text-galaxy-cream">
            {dominantPersona.recommendedOffer}
          </p>
          <Link
            href={`/acquisition?corridor=${corridor.id}&persona=${dominantPersona.persona}`}
            className="mt-5 inline-flex rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink hover:bg-galaxy-gold-lite"
          >
            Generate campaign content
          </Link>
          <Link
            href="/segments"
            className="mt-3 inline-flex rounded-md border border-galaxy-border px-4 py-2 text-sm font-semibold text-galaxy-cream hover:border-galaxy-gold"
          >
            View on-property segments
          </Link>
        </Panel>
      </div>

      <Panel>
        <SectionHeader
          eyebrow="Corridor signals"
          title="Seasonality and channel signals"
          description="Aggregate seasonality, gaming/non-gaming split, and frequency indices support timing and offer design."
        />
        <div className="mt-5 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="space-y-5">
            <GamingSplitBar corridor={corridor} />
            <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Same-card frequency</p>
              <div className="mt-3 text-2xl font-semibold text-galaxy-cream">
                <IndexValue value={corridor.txnFrequencyIndex} />
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <SeasonalityHeatmap corridors={[corridor]} showNotes={false} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
