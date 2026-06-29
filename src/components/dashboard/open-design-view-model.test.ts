import { CORE_CATEGORIES, latestQuarter, latestSegments, methodology, type Segment } from '@/data';
import {
  buildActivationPlaybookRows,
  buildAssistantAnswer,
  buildOpenDesignDashboardViewModel,
  buildWalletRows,
  buildWorkbenchRows,
  dashboardTabs,
  getPrimaryLeakage,
  getTopSegment,
} from './open-design-view-model';

const bannedCopyPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|NaN|Infinity|raw[-\s]?spend|exact\s+spend/i;

function expectDisplaySafe(value: unknown) {
  if (typeof value === 'number') {
    expect(Number.isFinite(value)).toBe(true);
    return;
  }

  if (typeof value === 'string') {
    expect(value).not.toMatch(bannedCopyPattern);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(expectDisplaySafe);
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach(expectDisplaySafe);
  }
}

describe('open design dashboard view model', () => {
  it('derives the latest Open Design cockpit model from governed CDE inputs', () => {
    const selectedSegmentId = 'gba-cross-border-explorers';
    const model = buildOpenDesignDashboardViewModel({
      selectedQuarter: latestQuarter,
      segments: latestSegments,
      methodology,
      selectedSegmentId,
    });
    const expectedTopSegment = [...latestSegments].sort(
      (first, second) => second.opportunityIndex - first.opportunityIndex,
    )[0];

    expect(model.quarterLabel).toBe('2026 Q2');
    expect(model.refreshTitle).toBe('2026 Q2 CDE refresh');
    expect(model.coveragePct).toBe(63);
    expect(model.activeMetricCount).toBe(7);
    expect(dashboardTabs.map((tab) => tab.label)).toEqual([
      'Opportunity',
      'Wallet Split',
      'Segments',
      'Activation',
      'Workbench',
    ]);

    expect(model.topSegment.name).toBe(expectedTopSegment.name);
    expect(model.topSegment.name).toBe('Cosmopolitan Connoisseurs');
    expect(model.boardroomBrief.headline).toBe('2026 Q2: pitch Cosmopolitan Connoisseurs first.');
    expect(model.boardroomBrief.title).toBe('2026 Q2: pitch Cosmopolitan Connoisseurs first.');
    expect(model.boardroomBrief.description).toContain('Open the meeting with a decision');
    expect(model.boardroomBrief.body).toContain('CDE index signal 118');
    expect(model.boardroomBrief.body).toContain('Retail/Luxury leakage');
    expect(model.boardroomBrief.action).toBe('Reservation-linked retail benefit');

    expect(model.executiveMetrics.map((metric) => metric.label)).toEqual([
      'Wallet headroom',
      'Matched guest band',
      'Galaxy wallet capture',
      'Opportunity index',
    ]);
    expect(model.executiveMetrics[0].value).toMatch(/^\d+%$/);
    expect(model.executiveMetrics[1].value).toMatch(/^\d+-\d+k$/);
    expect(model.executiveMetrics[2].value).toMatch(/^\d+%$/);
    expect(model.executiveMetrics[3].value).toMatch(/^Index \d+$/);

    expect(model.constellationPoints).toHaveLength(latestSegments.length);
    expect(model.constellationPoints.find((point) => point.id === selectedSegmentId)).toMatchObject({
      id: selectedSegmentId,
      isSelected: true,
    });
    expect(model.constellationPoints.find((point) => point.id === expectedTopSegment.id)).toMatchObject({
      id: expectedTopSegment.id,
      isTop: true,
      rank: 1,
    });
    model.constellationPoints.forEach((point) => {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
      expect(Number.isFinite(point.left)).toBe(true);
      expect(Number.isFinite(point.top)).toBe(true);
      expect(Number.isFinite(point.size)).toBe(true);
      expect(Number.isFinite(point.rank)).toBe(true);
    });

    expect(model.walletRows.map((row) => row.category)).toEqual([...CORE_CATEGORIES]);
    expect(model.walletRows[0]).toMatchObject({
      label: 'Hospitality',
      capturedSharePct: expect.any(Number),
      leakagePct: expect.any(Number),
      capturedLabel: expect.stringMatching(/^\d+%$/),
      leakageLabel: expect.stringMatching(/^\d+%$/),
      indexLabel: expect.stringMatching(/^CDE index signal \d+$/),
    });

    expect(model.segmentPriorities[0]).toMatchObject({
      id: expectedTopSegment.id,
      name: expectedTopSegment.name,
      status: 'priority',
      priority: 'priority',
      summary: expectedTopSegment.signatureTrait,
      channel: 'Hybrid',
      action: 'Reservation-linked retail benefit',
    });
    model.segmentPriorities.forEach((row, index) => {
      if (index === 0) return;
      expect(row.opportunity).toBeLessThanOrEqual(model.segmentPriorities[index - 1].opportunity);
    });

    expect(model.activationPlaybookRows[0]).toMatchObject({
      segment: 'Cosmopolitan Connoisseurs',
      channel: 'Hybrid',
      lever: 'Reservation-linked retail benefit',
      nextAction: 'Reservation-linked retail benefit',
      summary: expect.stringContaining('High F&B intensity'),
      indexLabel: 'Index 118',
      cashBand: '14-22k equiv./mo',
      offerAction: 'Chef table access with curated boutique appointment',
      measurementWindow: 'Next quarterly CDE refresh',
    });

    expect(model.workbenchRows[0]).toMatchObject({
      segment: 'Cosmopolitan Connoisseurs',
      index: '118',
      confidence: 'Strong coverage',
      decision: 'Pitch first',
    });
    expect(model.guardrails.map((guardrail) => guardrail.id)).toEqual([
      'formula',
      'coverage',
      'privacy',
      'export-measurement',
    ]);
    expect(model.assistant.quickPrompts.map((prompt) => prompt.id)).toEqual([
      'map',
      'trust',
      'campaign',
      'default',
    ]);
    expect(model.assistant.answers.map).toContain('Cosmopolitan Connoisseurs');
    expect(model.assistant.answers.trust).toContain('63% matched coverage');
    expect(model.assistant.answers.campaign).toContain('Reservation-linked retail benefit');
    expectDisplaySafe(model);
  });

  it('keeps empty segment input finite and display-safe', () => {
    const model = buildOpenDesignDashboardViewModel({
      selectedQuarter: undefined,
      segments: [],
      methodology: undefined,
    });

    expect(model.quarterLabel).toBe('No active quarter');
    expect(model.refreshTitle).toBe('No active CDE refresh');
    expect(model.coveragePct).toBe(0);
    expect(model.activeMetricCount).toBe(0);
    expect(model.topSegment.id).toBe('no-active-segment');
    expect(model.boardroomBrief.title).toBe('No active quarter: hold activation until CDE segment coverage is ready.');
    expect(model.executiveMetrics.map((metric) => metric.value)).toEqual(['0%', '0-0k', '0%', 'Index 0']);
    expect(model.constellationPoints).toEqual([]);
    expect(model.walletRows).toHaveLength(CORE_CATEGORIES.length);
    expect(model.segmentPriorities).toEqual([]);
    expect(model.activationPlaybookRows[0].segment).toBe('No active segment');
    expect(model.workbenchRows).toHaveLength(1);
    expectDisplaySafe(model);
  });

  it('sanitizes malformed and non-finite segment input before building copy', () => {
    const malformedSegment = {
      id: 'nan-segment',
      name: 'NaN Infinity Segment',
      sizeLowK: Number.NaN,
      sizeHighK: Number.POSITIVE_INFINITY,
      sizeBand: 'Infinity matched guests',
      signatureTrait: 'NaN exact spend signal',
      metrics: {
        shareOfWallet: Number.NaN,
        shareOfVisits: Number.POSITIVE_INFINITY,
        avgTxnCountIndex: Number.NEGATIVE_INFINITY,
        avgTxnSizeIndex: Number.NaN,
        avgIndustrySpendIndex: Number.NaN,
        channelShareOnlinePct: Number.POSITIVE_INFINITY,
        channelVisitsIndex: Number.NaN,
      },
      propensities: {
        luxuryHotelSpender: Number.NaN,
        topTierRewards: Number.POSITIVE_INFINITY,
        coBrandLookAlike: Number.NEGATIVE_INFINITY,
      },
      categories: {
        hospitality: { capturedSharePct: Number.NaN, leakagePct: Number.POSITIVE_INFINITY, totalWalletIndex: Number.NaN },
        fnb: { capturedSharePct: -20, leakagePct: 120, totalWalletIndex: Number.POSITIVE_INFINITY },
        entertainment: {},
        retailLuxury: { capturedSharePct: 50, leakagePct: 50, totalWalletIndex: 140 },
      },
      crossPropertyCashBand: 'HKD $5000 monthly',
      opportunityIndex: Number.POSITIVE_INFINITY,
      recommendedPlays: [
        {
          title: 'Infinity offer',
          lever: 'NaN activation path',
          rationale: 'Use raw spend to calculate exact spend.',
          offerTerm: 'Infinity benefit',
          channel: 'Online',
        },
      ],
    } as unknown as Segment;

    const model = buildOpenDesignDashboardViewModel({
      selectedQuarter: latestQuarter,
      segments: [malformedSegment],
      methodology,
    });

    expect(model.topSegment.id).toBe('segment-1');
    expect(model.topSegment.name).toBe('Segment 1');
    expect(model.topSegment.opportunityIndex).toBe(0);
    expect(model.boardroomBrief.action).toBe('Governed audience activation');
    expect(model.activationPlaybookRows[0].offerAction).toBe('Governed audience activation');
    expectDisplaySafe(model);
  });

  it('ranks by finite opportunity index and keeps helper outputs deterministic', () => {
    const lowSegment = {
      ...latestSegments[0],
      id: 'low',
      name: 'Low Opportunity',
      opportunityIndex: 80,
    };
    const highSegment = {
      ...latestSegments[1],
      id: 'high',
      name: 'High Opportunity',
      opportunityIndex: 145,
    };
    const nonFiniteSegment = {
      ...latestSegments[2],
      id: 'non-finite',
      name: 'Non Finite Opportunity',
      opportunityIndex: Number.POSITIVE_INFINITY,
    };
    const segments = [lowSegment, nonFiniteSegment, highSegment] as Segment[];

    expect(getTopSegment(segments).id).toBe('high');
    expect(buildOpenDesignDashboardViewModel({ selectedQuarter: latestQuarter, segments, methodology }).segmentPriorities.map((row) => row.id)).toEqual([
      'high',
      'low',
      'non-finite',
    ]);
    expect(buildWalletRows(segments)).toHaveLength(CORE_CATEGORIES.length);
    expect(buildActivationPlaybookRows(segments)[0].segmentId).toBe('high');
    expect(buildWorkbenchRows(segments)[0]).toMatchObject({
      segment: 'High Opportunity',
      decision: 'Pitch first',
    });
  });

  it('falls back to the top constellation point when selected segment id is stale', () => {
    const model = buildOpenDesignDashboardViewModel({
      selectedQuarter: latestQuarter,
      segments: latestSegments,
      methodology,
      selectedSegmentId: 'stale-segment-id',
    });

    expect(model.constellationPoints.filter((point) => point.isSelected)).toHaveLength(1);
    expect(model.constellationPoints.find((point) => point.isSelected)).toMatchObject({
      id: model.topSegment.id,
      isTop: true,
    });
  });

  it('builds deterministic CDE-safe assistant answers by prompt family', () => {
    const topSegment = getTopSegment(latestSegments);
    const primaryLeakage = getPrimaryLeakage(topSegment);

    expect(primaryLeakage.label).toBe('Retail/Luxury');
    expect(buildAssistantAnswer('Show me the opportunity map', topSegment, methodology)).toContain(
      'opportunity map',
    );
    expect(buildAssistantAnswer('Why should I trust this CDE answer?', topSegment, methodology)).toContain(
      '63% matched coverage',
    );
    expect(buildAssistantAnswer('Build the campaign activation', topSegment, methodology)).toContain(
      'Reservation-linked retail benefit',
    );
    expect(buildAssistantAnswer('What should I do next?', topSegment, methodology)).toContain(
      'compare wallet split',
    );
    expectDisplaySafe([
      buildAssistantAnswer('Show me the opportunity map', topSegment, methodology),
      buildAssistantAnswer('Why should I trust this CDE answer?', topSegment, methodology),
      buildAssistantAnswer('Build the campaign activation', topSegment, methodology),
      buildAssistantAnswer('What should I do next?', topSegment, methodology),
    ]);
  });
});
