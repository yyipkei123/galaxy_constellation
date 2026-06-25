import { CdeChip } from '@/components/ui/cde-chip';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { PersonaUniverseSummary } from '@/lib/personas';

interface PersonaUniverseProps {
  summary: PersonaUniverseSummary;
}

export function PersonaUniverse({ summary }: PersonaUniverseProps) {
  return (
    <Panel className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Overline>Second-level persona opportunity</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Persona universe</h2>
          <p className="mt-2 text-sm font-semibold text-galaxy-gold">
            {summary.totalPersonas} personas · ~{summary.totalAudienceK}k matched guests
          </p>
        </div>
        <CdeChip />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.clusters.map((cluster) => (
          <article
            key={cluster.segmentId}
            className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-galaxy-cream">{cluster.label}</h3>
              <span className="shrink-0 text-sm font-semibold text-galaxy-gold">~{cluster.audienceK}k</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-galaxy-muted">
              <span>{cluster.personaCount} personas</span>
              <span className="inline-flex items-center gap-1 text-galaxy-gold">
                Index {Math.round(cluster.highestOpportunityIndex)}
                <CdeChip />
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-galaxy-muted">
              Largest persona: <span className="text-galaxy-cream">{cluster.largestPersonaName}</span>
            </p>
          </article>
        ))}
      </div>

      <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
        <span className="font-semibold text-galaxy-gold">Generated persona insight:</span>{' '}
        {summary.generatedInsight}
      </p>
    </Panel>
  );
}
