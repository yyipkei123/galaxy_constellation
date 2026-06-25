import { CORE_CATEGORIES, latestSegments, type Segment } from '@/data';
import { buildWalletAnalytics } from './wallet-analytics';

const bannedCurrencyPattern = /\b(?:MOP|HKD)\b|\$|元|澳門幣/i;

describe('wallet analytics generation', () => {
  it('ranks category and segment opportunities deterministically from leakage and wallet index', () => {
    const analytics = buildWalletAnalytics(latestSegments);
    const expectedTopCategory = [...CORE_CATEGORIES]
      .map((category) => {
        const scores = latestSegments.map((segment) => (
          segment.categories[category].leakagePct * segment.categories[category].totalWalletIndex
        ));
        return {
          category,
          score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        };
      })
      .sort((first, second) => second.score - first.score)[0];

    expect(analytics.categories).toHaveLength(CORE_CATEGORIES.length);
    expect(analytics.categories[0].category).toBe(expectedTopCategory.category);
    analytics.categories.forEach((category, index) => {
      if (index === 0) return;
      expect(category.opportunityScore).toBeLessThanOrEqual(analytics.categories[index - 1].opportunityScore);
    });

    analytics.segments.forEach((segment, index) => {
      if (index === 0) return;
      expect(segment.opportunityScore).toBeLessThanOrEqual(analytics.segments[index - 1].opportunityScore);
    });
    expect(analytics.summary.highestLeakageCategory.category).toBe(analytics.categories[0].category);
    expect(analytics.summary.topWalletSegment.id).toBe(analytics.segments[0].id);
  });

  it('filters category analytics without changing segment ranking inputs', () => {
    const analytics = buildWalletAnalytics(latestSegments, ['fnb']);

    expect(analytics.categories).toHaveLength(1);
    expect(analytics.categories[0].category).toBe('fnb');
    expect(analytics.segments.length).toBe(latestSegments.length);
    analytics.segments.forEach((segment) => {
      expect(Object.keys(segment.categoryLeakageScores)).toEqual(['fnb']);
    });
  });

  it('handles empty and malformed data without non-finite or banned currency output', () => {
    const malformedSegment = {
      id: 'malformed',
      name: '',
      metrics: {
        shareOfWallet: Number.NaN,
        shareOfVisits: Number.POSITIVE_INFINITY,
        channelShareOnlinePct: Number.NEGATIVE_INFINITY,
      },
      categories: {
        hospitality: { capturedSharePct: Number.NaN, leakagePct: Number.POSITIVE_INFINITY, totalWalletIndex: 250 },
        fnb: { capturedSharePct: 120, totalWalletIndex: Number.NaN },
        entertainment: {},
        retailLuxury: { capturedSharePct: -20, leakagePct: 150, totalWalletIndex: Number.POSITIVE_INFINITY },
      },
      crossPropertyCashBand: 'HKD $5000 monthly',
    } as unknown as Segment;

    const empty = buildWalletAnalytics([]);
    const malformed = buildWalletAnalytics([malformedSegment]);
    const serialized = JSON.stringify({ empty, malformed });

    expect(empty.categories).toHaveLength(CORE_CATEGORIES.length);
    expect(empty.summary.averageCapturePct).toBe(0);
    expect(serialized).not.toMatch(/NaN|Infinity/);
    expect(serialized).not.toMatch(bannedCurrencyPattern);
  });

  it('does not rank missing category wallet data as maximum leakage', () => {
    const partialSegment = {
      id: 'partial-segment',
      name: 'Partial Segment',
      opportunityIndex: 0,
      metrics: {
        shareOfWallet: 30,
        shareOfVisits: 60,
        channelShareOnlinePct: 60,
      },
      categories: {
        hospitality: { capturedSharePct: 40, totalWalletIndex: 150 },
        fnb: {},
        entertainment: {},
        retailLuxury: {},
      },
    } as unknown as Segment;

    const analytics = buildWalletAnalytics([partialSegment], ['fnb', 'hospitality']);
    const fnb = analytics.categories.find((category) => category.category === 'fnb');

    expect(fnb?.leakagePct).toBe(0);
    expect(fnb?.opportunityScore).toBe(0);
    expect(analytics.categories[0].category).toBe('hospitality');
  });

  it('reports insufficient channel data instead of a physical skew when segments are empty', () => {
    const analytics = buildWalletAnalytics([]);

    expect(analytics.summary.channelSkew).toBe('Insufficient data');
  });
});
