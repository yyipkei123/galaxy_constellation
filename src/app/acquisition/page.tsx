'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PersonaAffinityChart } from '@/components/charts/persona-affinity-chart';
import { AcquisitionRecommendation } from '@/components/panels/acquisition-recommendation';
import { ContentDraftCard } from '@/components/panels/content-draft-card';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import { getCorridorById, koreaRefreshTag, priorityCorridor } from '@/data';
import { buildAcquisitionDraft } from '@/lib/acquisition-content';
import { useAppState } from '@/store/app-store';

export default function AcquisitionPage() {
  return (
    <Suspense fallback={<AcquisitionFallback />}>
      <AcquisitionPageContent />
    </Suspense>
  );
}

function AcquisitionPageContent() {
  const searchParams = useSearchParams();
  const { launchCampaign } = useAppState();
  const corridor = getCorridorById(searchParams.get('corridor') ?? priorityCorridor.id);
  const persona = searchParams.get('persona') ?? corridor.personas[0].persona;
  const draft = buildAcquisitionDraft(corridor, persona);
  const tag = koreaRefreshTag(corridor);

  function launchAcquisitionCampaign() {
    launchCampaign({
      source: 'acquisition',
      audienceName: `${corridor.name} ${draft.persona}`,
      segmentIds: ['cosmopolitan-connoisseurs'],
      corridorId: corridor.id,
      lever: draft.variants[0]?.subject ?? 'Corridor acquisition content',
    });
  }

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Acquisition hand-off"
        title="Priority Corridor Acquisition"
        description={`Turn ${corridor.name} corridor intelligence into persona-led campaign content without live AI calls or client-side keys.`}
        aside={tag ? <p className="font-semibold text-galaxy-gold">{tag}</p> : <p>{corridor.languageLabel} draft ready</p>}
      />

      <AcquisitionRecommendation corridor={corridor} />

      <Panel>
        <SectionHeader
          eyebrow="Target personas"
          title="Target personas"
          description="Persona share, affinity, and recommended offer are generated from aggregate corridor signals."
        />
        <div className="mt-5">
          <PersonaAffinityChart corridor={corridor} />
        </div>
      </Panel>

      <ContentDraftCard draft={draft} onLaunch={launchAcquisitionCampaign} />
    </div>
  );
}

function AcquisitionFallback() {
  return <div className="text-galaxy-muted">Loading acquisition recommendation...</div>;
}
