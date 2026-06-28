import type { CampaignWeeklyPoint, MeasurementCampaign } from '@/data';
import { formatEnriched } from './format';

export interface MeasurementChartPoint {
  week: string;
  testGroup: number;
  controlHoldout: number;
  liftPct: number;
}

export interface MeasurementReadout {
  campaignId: string;
  campaignName: string;
  audienceLeverLabel: string;
  latestLiftPct: number;
  latestLiftLabel: string;
  incrementalRevenueBand: string;
  iroiIndex: string;
  confidenceLabel: string;
  testDesignLabel: string;
  testLine: string;
  controlLine: string;
  chartData: MeasurementChartPoint[];
}

const confidenceLabels: Record<MeasurementCampaign['confidence'], string> = {
  directional: 'Directional confidence',
  credible: 'Credible confidence',
  strong: 'Strong confidence',
};

function finiteNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function finiteIndex(value: number) {
  return Math.round(finiteNumber(value));
}

function latestWeeklyPoint(series: CampaignWeeklyPoint[]) {
  return series.at(-1) ?? {
    week: 'Week 0',
    testIndex: 0,
    controlIndex: 0,
  };
}

export function calculateIncrementalLiftPct(testIndex: number, controlIndex: number) {
  if (!Number.isFinite(testIndex) || !Number.isFinite(controlIndex) || controlIndex === 0) {
    return 0;
  }

  const lift = ((testIndex - controlIndex) / controlIndex) * 100;

  return Number.isFinite(lift) ? Math.round(lift) : 0;
}

export function buildMeasurementReadout(campaign: MeasurementCampaign): MeasurementReadout {
  const chartData = campaign.weeklySeries.map((point) => {
    const testGroup = finiteIndex(point.testIndex);
    const controlHoldout = finiteIndex(point.controlIndex);

    return {
      week: point.week,
      testGroup,
      controlHoldout,
      liftPct: calculateIncrementalLiftPct(testGroup, controlHoldout),
    };
  });
  const latest = latestWeeklyPoint(campaign.weeklySeries);
  const latestTestIndex = finiteIndex(latest.testIndex);
  const latestControlIndex = finiteIndex(latest.controlIndex);
  const latestLiftPct = calculateIncrementalLiftPct(latestTestIndex, latestControlIndex);
  const iroiIndex = Math.max(0, 100 + latestLiftPct * 10);
  const holdoutPct = finiteNumber(campaign.testDesign.holdoutPct);
  const durationWeeks = Math.max(0, finiteIndex(campaign.testDesign.durationWeeks));
  const thresholdPct = finiteNumber(campaign.testDesign.expectedLiftThresholdPct);

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    audienceLeverLabel: [campaign.audienceName, campaign.lever].join(' / '),
    latestLiftPct,
    latestLiftLabel: formatEnriched(latestLiftPct, 'pct'),
    incrementalRevenueBand: formatEnriched(campaign.indexedRevenueBand, 'band'),
    iroiIndex: formatEnriched(iroiIndex, 'index'),
    confidenceLabel: confidenceLabels[campaign.confidence],
    testDesignLabel: [
      formatEnriched(holdoutPct, 'pct') + ' holdout',
      String(durationWeeks) + '-week test',
      formatEnriched(thresholdPct, 'pct') + ' lift threshold',
    ].join(' / '),
    testLine: 'Test group: ' + formatEnriched(latestTestIndex, 'index'),
    controlLine: 'Control holdout: ' + formatEnriched(latestControlIndex, 'index'),
    chartData,
  };
}
