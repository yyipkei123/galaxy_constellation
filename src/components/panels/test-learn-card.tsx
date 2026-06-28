'use client';

import { LiftOverTimeChart } from '@/components/charts/lift-over-time-chart';
import { CdeChip } from '@/components/ui/cde-chip';
import { MetricTile } from '@/components/ui/metric-tile';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { MeasurementCampaign } from '@/data';
import { buildMeasurementReadout } from '@/lib/measurement';

interface TestLearnCardProps {
  campaign: MeasurementCampaign;
}

export function TestLearnCard({ campaign }: TestLearnCardProps) {
  const readout = buildMeasurementReadout(campaign);
  const titleId = `${readout.campaignId}-measurement-title`;

  return (
    <article aria-labelledby={titleId}>
      <Panel className="h-full bg-[linear-gradient(135deg,rgba(205,164,92,0.12),rgba(12,23,35,0.82))]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Overline>{readout.confidenceLabel}</Overline>
            <h2 id={titleId} className="mt-3 font-serif text-3xl leading-tight text-galaxy-cream">
              {readout.campaignName}
            </h2>
            <p className="mt-3 text-sm font-semibold text-galaxy-muted">{readout.audienceLeverLabel}</p>
          </div>
          <CdeChip />
        </div>

        <dl className="mt-5 grid gap-3 md:grid-cols-3">
          <MetricTile
            label="Incremental lift"
            value={readout.latestLiftLabel}
            detail={readout.testLine}
            className="bg-galaxy-ink/35"
          />
          <MetricTile
            label="Indexed revenue band"
            value={readout.incrementalRevenueBand}
            detail="Modelled incremental value range"
            className="bg-galaxy-ink/35"
          />
          <MetricTile
            label="CDE iROI signal"
            value={readout.iroiIndex}
            detail={readout.controlLine}
            className="bg-galaxy-ink/35"
          />
        </dl>

        <div className="mt-5">
          <LiftOverTimeChart readout={readout} />
        </div>

        <div className="mt-5 grid gap-3 text-sm leading-6 text-galaxy-muted md:grid-cols-2">
          <p>
            Test design: {readout.testDesignLabel}. This models Mastercard Test & Learn methodology with a
            persistent control holdout.
          </p>
          <p>
            Readout shows causal lift, not attribution, by comparing the test group against the control holdout over
            the same weekly window.
          </p>
        </div>
      </Panel>
    </article>
  );
}
