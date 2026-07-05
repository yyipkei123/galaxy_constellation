import { CorridorIndexBaseline, CorridorIndexValue } from '@/components/ui/corridor-index-value';
import { BandValue } from '@/components/ui/formatted-values';
import { InsightTooltip } from '@/components/ui/insight-tooltip';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import type { Corridor } from '@/data';
import { koreaRefreshTag } from '@/data';

export function AcquisitionRecommendation({ corridor }: { corridor: Corridor }) {
  const tag = koreaRefreshTag(corridor);
  const topPersona = corridor.personas[0];
  const isPriorityCorridor = corridor.priorityRank === 1;
  const rankLabel = `Rank #${corridor.priorityRank}`;
  const statusTag = tag ?? (isPriorityCorridor ? null : rankLabel);
  const sectionTitle = isPriorityCorridor
    ? `${corridor.name}: ${corridor.note ?? 'Acquisition priority'}`
    : `${corridor.name}: Selected corridor`;
  const description = isPriorityCorridor
    ? 'Strong signal, validating. Use this as the first acquisition corridor while refreshing the post-2020 panel.'
    : `Selected corridor, validating. Use ${rankLabel} as ranked context while building the acquisition hand-off.`;
  const rationaleLabel = isPriorityCorridor ? 'Why #1' : 'Why this corridor';
  const offerLabel = isPriorityCorridor ? 'Offer first' : 'Offer focus';

  return (
    <Panel className="bg-[linear-gradient(135deg,rgba(205,164,92,0.14),rgba(8,18,30,0.82))]">
      <SectionHeader
        eyebrow={isPriorityCorridor ? 'Priority recommendation' : 'Selected corridor'}
        title={sectionTitle}
        description={description}
      />
      {statusTag ? (
        <p className="mt-4 inline-flex rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold text-galaxy-gold">
          {statusTag}
        </p>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">{rationaleLabel}</p>
          <p className="mt-2 text-sm leading-6 text-galaxy-cream">
            High non-gaming momentum, strong frequency, and clear entertainment-led addressability.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Corridor priority score</p>
          <div className="mt-2 text-xl font-semibold">
            <InsightTooltip
              title="Corridor priority score"
              lines={[
                'Metric meaning: priority score blends non-gaming momentum, arrivals growth, visit frequency, and addressability.',
                'Action hint: use this as the hand-off evidence for acquisition planning.',
                'Aggregate CDE signal, no PII.',
              ]}
            >
              <CorridorIndexValue label="Priority" value={corridor.priorityIndex} />
            </InsightTooltip>
          </div>
          <CorridorIndexBaseline className="mt-2" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-galaxy-muted">Projected value band</p>
          <div className="mt-2 text-xl font-semibold">
            <InsightTooltip
              title="Projected value band"
              lines={[
                'Metric meaning: modelled opportunity band expressed as an equivalent monthly range.',
                'Action hint: use the band for prioritization without exposing unbanded amounts.',
                'Aggregate CDE signal, no PII.',
              ]}
            >
              <BandValue value={corridor.projectedValueBand} />
            </InsightTooltip>
          </div>
        </div>
      </div>
      <p className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
        {offerLabel}: {topPersona.recommendedOffer}
      </p>
    </Panel>
  );
}
