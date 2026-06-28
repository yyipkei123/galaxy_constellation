import { describe, expect, it } from 'vitest';
import { corridors, latestSegments } from '@/data';
import { buildCrossLensJourney } from './journey';

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;
const unsafeValuePattern = /NaN|Infinity/;

function expectCdeSafe(value: unknown) {
  const serialized = JSON.stringify(value);

  expect(serialized).not.toMatch(bannedCdeTokenPattern);
  expect(serialized).not.toMatch(unsafeValuePattern);
}

describe('cross-lens journey', () => {
  it('builds four linked stages from the top corridor and top segment', () => {
    const topCorridor = [...corridors].sort((first, second) => second.priorityIndex - first.priorityIndex)[0];
    const topSegment = [...latestSegments].sort((first, second) => second.opportunityIndex - first.opportunityIndex)[0];

    const journey = buildCrossLensJourney({ corridors, segments: latestSegments });

    expect(journey.headline).toContain('one connected loop');
    expect(journey.headline).toContain(topCorridor.name);
    expect(journey.headline).toContain(topSegment.name);
    expect(journey.stages.map((stage) => stage.key)).toEqual(['acquire', 'convert', 'capture', 'grow']);
    expect(journey.stages.map((stage) => stage.href)).toEqual([
      '/corridors/korea',
      '/segments',
      '/leakage',
      '/activation',
    ]);
    expect(journey.stages[0]).toMatchObject({
      title: 'Acquire',
      metricValue: `Index ${topCorridor.priorityIndex}`,
    });
    expect(journey.stages[1]).toMatchObject({
      title: 'Convert',
      metricValue: `Index ${topSegment.opportunityIndex}`,
    });
    expect(journey.stages.map((stage) => stage.metricValue)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^Index \d+$/),
        expect.stringMatching(/^\d+%$/),
        expect.stringMatching(/^\d+-\d+k equiv\.\/mo$/),
      ]),
    );
    expectCdeSafe(journey);
  });

  it('falls back to finite CDE-safe metrics for empty or malformed inputs', () => {
    expect(() => buildCrossLensJourney({ corridors: [], segments: [] })).not.toThrow();

    const malformedJourney = buildCrossLensJourney({
      corridors: [{
        id: 'korea',
        name: 'HKD Infinity corridor',
        priorityIndex: Number.POSITIVE_INFINITY,
        projectedValueBand: '$999',
      }],
      segments: [{
        id: 'bad-segment',
        name: 'MOP NaN segment',
        opportunityIndex: Number.NaN,
        metrics: {
          shareOfWallet: Number.NaN,
          shareOfVisits: Number.POSITIVE_INFINITY,
          avgTxnCountIndex: Number.NaN,
          avgTxnSizeIndex: Number.NaN,
          avgIndustrySpendIndex: Number.NaN,
          channelShareOnlinePct: Number.NaN,
          channelVisitsIndex: Number.NaN,
        },
        categories: {
          hospitality: {
            capturedSharePct: Number.NaN,
            leakagePct: Number.POSITIVE_INFINITY,
            totalWalletIndex: Number.NaN,
          },
        },
        crossPropertyCashBand: '$5000',
      }],
    });

    expect(malformedJourney.stages).toHaveLength(4);
    expect(malformedJourney.stages.map((stage) => stage.metricValue)).toEqual([
      'Index 0',
      'Index 0',
      '0%',
      '0-0k equiv./mo',
    ]);
    expectCdeSafe(malformedJourney);
  });

  it('never emits CDE banned tokens or unsafe numeric labels', () => {
    const journey = buildCrossLensJourney({ corridors, segments: latestSegments });

    expectCdeSafe(journey);
  });
});
