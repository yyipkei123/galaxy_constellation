import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { methodology, priorityCorridor } from '@/data';

export default function CorridorsPage() {
  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Corridors acquisition"
        title="Source-Market & Corridor Intelligence"
        description="Rank inbound source markets using aggregate Mastercard panel signals for acquisition planning."
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">{methodology.panelSharePct} panel</p>
            <p className="mt-2">{methodology.lensBNote}. Directional, indexed, and blended with first-party context.</p>
          </>
        )}
      />
      <Panel>
        <p className="text-sm font-semibold text-galaxy-gold">Priority corridor</p>
        <p className="mt-3 text-2xl font-semibold text-galaxy-cream">{priorityCorridor.name}</p>
        <p className="mt-2 text-sm text-galaxy-muted">2020 base · refresh pending</p>
      </Panel>
    </div>
  );
}
