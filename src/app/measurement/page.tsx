'use client';

import { useMemo } from 'react';
import { TestLearnCard } from '@/components/panels/test-learn-card';
import { Overline } from '@/components/ui/overline';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { campaigns } from '@/data';
import { useAppState } from '@/store/app-store';

export default function MeasurementPage() {
  const { launchedCampaigns } = useAppState();
  const measurementCampaigns = useMemo(
    () => [...launchedCampaigns, ...campaigns],
    [launchedCampaigns],
  );

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Test and learn"
        title="Measurement Loop"
        description={(
          <>
            Close the activation loop with deterministic holdout readouts, indexed incremental value, and weekly
            test-versus-control proof for launched and seeded campaigns.
          </>
        )}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">Holdout proof</p>
            <p className="mt-2">
              Each card reads a fixed control holdout against the exposed test group to estimate causal lift.
            </p>
          </>
        )}
      />

      <Panel>
        <Overline>Measurement method</Overline>
        <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Holdout proof before scaling</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-galaxy-muted">
          The route models Mastercard Test & Learn methodology with stable test and control groups. Lift is reported
          as causal lift, not attribution, so teams can compare campaign impact without exposing transaction amounts or
          customer level records.
        </p>
      </Panel>

      <div className="grid gap-5">
        {measurementCampaigns.map((campaign) => (
          <TestLearnCard key={`${campaign.source}-${campaign.id}`} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
