import { CorridorDetailPanel } from '@/components/panels/corridor-detail-panel';
import { PageHeader } from '@/components/ui/page-header';
import { getCorridorById, koreaRefreshTag } from '@/data';

export default async function CorridorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const corridor = getCorridorById(id);
  const tag = koreaRefreshTag(corridor);

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Corridor detail"
        title={`${corridor.name} Corridor Detail`}
        description="Move from aggregate source-market signal into persona affinity, timing, offer design, and content hand-off."
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">{tag ?? `${corridor.languageLabel} content ready`}</p>
            <p className="mt-2">No individual records. Corridor insight stays indexed, ranked, percent-based, or banded.</p>
          </>
        )}
      />
      <CorridorDetailPanel corridor={corridor} />
    </div>
  );
}
