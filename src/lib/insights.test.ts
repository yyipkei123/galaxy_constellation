import { latestSegments, methodology, type Segment } from '@/data';
import {
  buildLeakageInsightNarrative,
  buildPortfolioInsightNarrative,
  buildSegmentInsightNarrative,
} from './insights';

const bannedCurrencyPattern = /\b(?:MOP|HKD)\b|\$|元|澳門幣/i;

describe('insight narrative generation', () => {
  it('ranks portfolio findings by derived priority from opportunity and leakage signals', () => {
    const narrative = buildPortfolioInsightNarrative(latestSegments, methodology);
    const expectedTopSegment = [...latestSegments].sort(
      (first, second) => second.opportunityIndex - first.opportunityIndex,
    )[0];

    expect(narrative.title).toBe('Executive Summary');
    expect(narrative.findings.length).toBeGreaterThanOrEqual(3);
    expect(narrative.findings[0].segmentId).toBe(expectedTopSegment.id);
    expect(narrative.findings[0].title).toContain(expectedTopSegment.name);
    narrative.findings.forEach((finding, index) => {
      if (index === 0) return;
      expect(finding.priority).toBeLessThanOrEqual(narrative.findings[index - 1].priority);
    });
  });

  it('generates stable CDE-compliant copy without banned currency markers', () => {
    const portfolio = buildPortfolioInsightNarrative(latestSegments, methodology);
    const segment = buildSegmentInsightNarrative(latestSegments[0]);
    const leakage = buildLeakageInsightNarrative(latestSegments[0], latestSegments);

    expect(JSON.stringify({ portfolio, segment, leakage })).not.toMatch(bannedCurrencyPattern);
    expect(portfolio.summary).toMatch(/matched coverage 63%/i);
    expect(segment.summary).toContain(latestSegments[0].name);
    expect(leakage.summary).toContain(latestSegments[0].crossPropertyCashBand);
  });

  it('handles empty and malformed segments without non-finite output', () => {
    const malformedSegment = {
      id: 'bad-segment',
      name: 'Bad Segment',
      metrics: {
        shareOfWallet: Number.NaN,
        shareOfVisits: Number.POSITIVE_INFINITY,
      },
      propensities: {},
      categories: {},
      crossPropertyCashIndex: Number.NaN,
      crossPropertyCashBand: 'HKD $5000 monthly',
      opportunityIndex: Number.POSITIVE_INFINITY,
    } as unknown as Segment;

    const emptyNarrative = buildPortfolioInsightNarrative([], methodology);
    const malformedNarrative = buildSegmentInsightNarrative(malformedSegment);
    const serialized = JSON.stringify({ emptyNarrative, malformedNarrative });

    expect(emptyNarrative.summary).toContain('No active CDE segment');
    expect(serialized).not.toMatch(/NaN|Infinity/);
    expect(serialized).not.toMatch(bannedCurrencyPattern);
    expect(serialized).toContain('Indexed band equiv./mo');
  });
});
