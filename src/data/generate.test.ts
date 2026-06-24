import { formatGuestBand } from '@/lib/format';
import {
  CORE_CATEGORIES,
  quarters,
  segmentsByQuarter,
  methodology,
  crmRows,
  latestQuarter,
  marketScanTiles,
} from './index';

const currencyPattern = /(MOP|HKD|\$|元|澳門幣)/i;

describe('synthetic CDE data', () => {
  it('generates four trailing quarters with six segments each', () => {
    expect(quarters).toHaveLength(4);
    for (const quarter of quarters) {
      expect(segmentsByQuarter[quarter.id]).toHaveLength(6);
    }
  });

  it('keeps CDE category share invariant at 100', () => {
    for (const quarter of quarters) {
      for (const segment of segmentsByQuarter[quarter.id]) {
        for (const category of CORE_CATEGORIES) {
          const wallet = segment.categories[category];
          expect(wallet.capturedSharePct + wallet.leakagePct).toBe(100);
        }
      }
    }
  });

  it('derives share of wallet from hospitality capture', () => {
    for (const quarter of quarters) {
      for (const segment of segmentsByQuarter[quarter.id]) {
        expect(segment.metrics.shareOfWallet).toBe(segment.categories.hospitality.capturedSharePct);
      }
    }
  });

  it('keeps generated size bands aligned with generated size bounds', () => {
    for (const quarter of quarters) {
      for (const segment of segmentsByQuarter[quarter.id]) {
        expect(segment.sizeBand).toBe(formatGuestBand(segment.sizeLowK, segment.sizeHighK));
      }
    }
  });

  it('uses the spec-approved Traditional Chinese segment labels', () => {
    const latest = segmentsByQuarter[quarters.at(-1)!.id];

    expect(Object.fromEntries(latest.map((segment) => [segment.name, segment.nameZh]))).toEqual({
      'Diamond High-Rollers': '鑽石貴賓',
      'Cosmopolitan Connoisseurs': '都會鑑賞家',
      'GBA Cross-Border Explorers': '大灣區跨境客',
      'Family Leisure Seekers': '親子度假客',
      'MICE & Business Guests': '商務會展客',
      'Aspiring Mass-Affluent': '新晉中產客',
    });
  });

  it('normalizes opportunity index around market base 100', () => {
    const latest = segmentsByQuarter[quarters.at(-1)!.id];
    const mean = latest.reduce((sum, segment) => sum + segment.opportunityIndex, 0) / latest.length;
    expect(mean).toBeGreaterThanOrEqual(98);
    expect(mean).toBeLessThanOrEqual(102);
  });

  it('exposes the CDE product framing and masked CRM rows', () => {
    expect(methodology).toMatchObject({
      matchedCoveragePct: 63,
      basis: 'demi-decile average',
      refresh: 'quarterly',
      activeMetricCount: 7,
    });
    expect(crmRows).toHaveLength(10);
    expect(latestQuarter.id).toBe('2026-q2');
    expect(marketScanTiles).toHaveLength(5);
    expect(marketScanTiles.some((tile) => tile.sourceType === 'share of voice')).toBe(true);
    expect(crmRows[0].competitorSpendBand).toContain('equiv./mo');

    for (const row of crmRows) {
      expect(row.customerId).toMatch(/^MEM-••••\d{4}$/);
      expect(row.competitorSpendBand).not.toMatch(currencyPattern);
    }
  });

  it('keeps generated bands and propensities within CDE display constraints', () => {
    for (const quarter of quarters) {
      for (const segment of segmentsByQuarter[quarter.id]) {
        expect(segment.crossPropertyCashBand).not.toMatch(currencyPattern);
        expect(segment.propensities.luxuryHotelSpender).toBeGreaterThanOrEqual(0);
        expect(segment.propensities.luxuryHotelSpender).toBeLessThanOrEqual(1);
        expect(segment.propensities.topTierRewards).toBeGreaterThanOrEqual(0);
        expect(segment.propensities.topTierRewards).toBeLessThanOrEqual(1);
        expect(segment.propensities.coBrandLookAlike).toBeGreaterThanOrEqual(0);
        expect(segment.propensities.coBrandLookAlike).toBeLessThanOrEqual(1);
      }
    }
  });
});
