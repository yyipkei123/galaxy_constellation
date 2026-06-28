import { latestSegments, type Segment } from '@/data';
import { buildScenarioImpact } from './scenario-simulator';

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;

function expectFiniteImpact(impact: ReturnType<typeof buildScenarioImpact>) {
  expect(Number.isFinite(impact.walletUpliftIndex)).toBe(true);
  expect(Number.isFinite(impact.opportunityIndexDelta)).toBe(true);
  expect(Number.isFinite(impact.pitchNowGuestsK)).toBe(true);
  expect(impact.projectedBand).toMatch(/^\d+-\d+k equiv\.\/mo$/);
  impact.constellationShift.forEach((shift) => {
    expect(Number.isFinite(shift.beforeIndex)).toBe(true);
    expect(Number.isFinite(shift.afterIndex)).toBe(true);
  });
}

describe('buildScenarioImpact', () => {
  it('builds a nonzero CDE-safe impact for the selected segments only', () => {
    const selectedSegments = latestSegments.slice(0, 2);
    const impact = buildScenarioImpact({
      segments: latestSegments,
      segmentIds: selectedSegments.map((segment) => segment.id),
      category: 'retailLuxury',
      recapturePct: 18,
      onlineShiftPct: 10,
      lever: 'hostLift',
    });

    expectFiniteImpact(impact);
    expect(impact.walletUpliftIndex).toBeGreaterThan(0);
    expect(impact.opportunityIndexDelta).toBeGreaterThan(0);
    expect(impact.pitchNowGuestsK).toBeGreaterThan(0);
    expect(impact.constellationShift).toHaveLength(selectedSegments.length);
    expect(impact.constellationShift.map((shift) => shift.segmentId)).toEqual(
      selectedSegments.map((segment) => segment.id),
    );
    expect(JSON.stringify(impact)).not.toMatch(bannedCdeTokenPattern);
    expect(JSON.stringify(impact)).not.toMatch(/NaN|Infinity/);
  });

  it('returns a zeroed finite safe output for empty and malformed inputs', () => {
    const emptyImpact = buildScenarioImpact({
      segments: [],
      segmentIds: ['missing-segment'],
      category: 'hospitality',
      recapturePct: 20,
      onlineShiftPct: 10,
      lever: 'recapture',
    });
    const malformedImpact = buildScenarioImpact({
      segments: [{
        id: 'malformed',
        name: '',
        metrics: undefined,
        categories: {},
        opportunityIndex: Number.NaN,
      } as unknown as Segment],
      segmentIds: ['malformed'],
      category: 'fnb',
      recapturePct: Number.POSITIVE_INFINITY,
      onlineShiftPct: Number.NEGATIVE_INFINITY,
      lever: 'recapture',
    });

    [emptyImpact, malformedImpact].forEach((impact) => {
      expectFiniteImpact(impact);
      expect(impact.walletUpliftIndex).toBe(0);
      expect(impact.opportunityIndexDelta).toBe(0);
      expect(impact.pitchNowGuestsK).toBe(0);
      expect(impact.projectedBand).toBe('0-0k equiv./mo');
      expect(impact.constellationShift).toEqual([]);
      expect(JSON.stringify(impact)).not.toMatch(bannedCdeTokenPattern);
      expect(JSON.stringify(impact)).not.toMatch(/NaN|Infinity/);
    });
  });

  it('clamps slider inputs and keeps lever multipliers deterministic', () => {
    const baseInput = {
      segments: latestSegments,
      segmentIds: [latestSegments[0].id],
      category: 'hospitality' as const,
    };

    expect(buildScenarioImpact({
      ...baseInput,
      recapturePct: 999,
      onlineShiftPct: 999,
      lever: 'channelShift',
    })).toEqual(buildScenarioImpact({
      ...baseInput,
      recapturePct: 60,
      onlineShiftPct: 30,
      lever: 'channelShift',
    }));

    expect(buildScenarioImpact({
      ...baseInput,
      recapturePct: -999,
      onlineShiftPct: -999,
      lever: 'channelShift',
    })).toEqual(buildScenarioImpact({
      ...baseInput,
      recapturePct: 0,
      onlineShiftPct: -20,
      lever: 'channelShift',
    }));

    const recapture = buildScenarioImpact({
      ...baseInput,
      recapturePct: 22,
      onlineShiftPct: 12,
      lever: 'recapture',
    });
    const channelShift = buildScenarioImpact({
      ...baseInput,
      recapturePct: 22,
      onlineShiftPct: 12,
      lever: 'channelShift',
    });
    const hostLift = buildScenarioImpact({
      ...baseInput,
      recapturePct: 22,
      onlineShiftPct: 12,
      lever: 'hostLift',
    });
    const contentPersonalisation = buildScenarioImpact({
      ...baseInput,
      recapturePct: 22,
      onlineShiftPct: 12,
      lever: 'contentPersonalisation',
    });

    expect(channelShift.walletUpliftIndex).toBeGreaterThan(recapture.walletUpliftIndex);
    expect(hostLift.walletUpliftIndex).toBeGreaterThan(channelShift.walletUpliftIndex);
    expect(contentPersonalisation.walletUpliftIndex).toBeGreaterThan(hostLift.walletUpliftIndex);
    expect(buildScenarioImpact({
      ...baseInput,
      recapturePct: 22,
      onlineShiftPct: 12,
      lever: 'contentPersonalisation',
    })).toEqual(contentPersonalisation);
  });

  it('never emits banned CDE tokens or non-finite values', () => {
    const unsafeSegment = {
      ...latestSegments[0],
      id: 'HKD-segment',
      name: 'MOP segment $',
    };
    const impact = buildScenarioImpact({
      segments: [unsafeSegment, ...latestSegments],
      segmentIds: ['HKD-segment', ...latestSegments.map((segment) => segment.id)],
      category: 'entertainment',
      recapturePct: 60,
      onlineShiftPct: 30,
      lever: 'contentPersonalisation',
    });
    const renderedPayload = JSON.stringify(impact);

    expectFiniteImpact(impact);
    expect(renderedPayload).not.toMatch(bannedCdeTokenPattern);
    expect(renderedPayload).not.toMatch(/NaN|Infinity/);
  });
});
