'use client';

import { AudienceBuilder } from '@/components/panels/audience-builder';
import { PageHeader } from '@/components/ui/page-header';
import { useAppState } from '@/store/app-store';

export default function PropensityPage() {
  const { segments, filters, setFilters, saveAudience } = useAppState();

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Audience build"
        title="Propensity & Audience Builder"
        description={(
          <>
            Build a CDE-compliant target audience from segment-level luxury hotel, rewards, look-alike, and leakage
            signals.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">CDE activation guardrail</p>
            <p className="mt-2">Audience sizing and wallet potential stay at banded or indexed levels only.</p>
          </>
        )}
      />

      <AudienceBuilder
        segments={segments}
        filters={filters}
        setFilters={setFilters}
        saveAudience={saveAudience}
      />
    </div>
  );
}
