import { describe, expect, it } from 'vitest';
import { campaigns, createLaunchedCampaign, type MeasurementCampaign } from '@/data';
import { buildMeasurementReadout, calculateIncrementalLiftPct } from './measurement';

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|\braw spend\b/i;

function expectCdeSafe(value: unknown) {
  expect(JSON.stringify(value)).not.toMatch(bannedCdeTokenPattern);
  expect(JSON.stringify(value)).not.toMatch(/NaN|Infinity/);
}

describe('measurement readouts', () => {
  it('calculates rounded incremental lift and guards finite edge cases', () => {
    expect(calculateIncrementalLiftPct(132, 124)).toBe(6);
    expect(calculateIncrementalLiftPct(95, 100)).toBe(-5);
    expect(calculateIncrementalLiftPct(120, 0)).toBe(0);
    expect(calculateIncrementalLiftPct(Number.NaN, 100)).toBe(0);
    expect(calculateIncrementalLiftPct(120, Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('builds a CDE-safe readout from the latest weekly test and control indices', () => {
    const readout = buildMeasurementReadout(campaigns[0]);

    expect(readout.campaignName).toBe('Promenade luxury play');
    expect(readout.audienceLeverLabel).toBe('Urban retail connoisseurs / recapture');
    expect(readout.latestLiftPct).toBe(6);
    expect(readout.latestLiftLabel).toBe('6%');
    expect(readout.incrementalRevenueBand).toBe('18-28k equiv./mo');
    expect(readout.iroiIndex).toBe('Index 160');
    expect(readout.confidenceLabel).toBe('Strong confidence');
    expect(readout.testDesignLabel).toBe('12% holdout / 8-week test / 5% lift threshold');
    expect(readout.testLine).toBe('Test group: Index 132');
    expect(readout.controlLine).toBe('Control holdout: Index 124');
    expect(readout.chartData.at(-1)).toMatchObject({
      week: 'Week 8',
      testGroup: 132,
      controlHoldout: 124,
      liftPct: 6,
    });
    expectCdeSafe(readout);
  });

  it('keeps launched campaign readouts deterministic and token-aware safe', () => {
    const launched = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'MOPAR loyalty travellers',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'recapture',
    });

    const readout = buildMeasurementReadout(launched);

    expect(readout.campaignName).toBe('MOPAR loyalty travellers measurement launch');
    expect(readout.audienceLeverLabel).toBe('MOPAR loyalty travellers / recapture');
    expect(readout.latestLiftLabel).toMatch(/^\d+%$/);
    expect(readout.incrementalRevenueBand).toBe('12-22k equiv./mo');
    expect('MOPAR loyalty travellers').not.toMatch(bannedCdeTokenPattern);
    expectCdeSafe(readout);
  });

  it('falls back to zeroed safe labels when weekly series is empty', () => {
    const campaign: MeasurementCampaign = {
      ...campaigns[0],
      weeklySeries: [],
    };

    const readout = buildMeasurementReadout(campaign);

    expect(readout.latestLiftPct).toBe(0);
    expect(readout.latestLiftLabel).toBe('0%');
    expect(readout.testLine).toBe('Test group: Index 0');
    expect(readout.controlLine).toBe('Control holdout: Index 0');
    expect(readout.chartData).toEqual([]);
    expectCdeSafe(readout);
  });
});
