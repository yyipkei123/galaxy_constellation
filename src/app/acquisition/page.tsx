import { PageHeader } from '@/components/ui/page-header';
import { priorityCorridor } from '@/data';

export default function AcquisitionPage() {
  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Acquisition hand-off"
        title="Priority Corridor Acquisition"
        description={`Turn ${priorityCorridor.name} corridor intelligence into persona-led campaign content without live AI calls.`}
        aside={<p className="font-semibold text-galaxy-gold">2020 base · refresh pending</p>}
      />
    </div>
  );
}
