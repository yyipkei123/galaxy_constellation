import { CORE_CATEGORIES, guests, getGuestById, getGuestsBySegmentId, topPriorityGuests } from './guests';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const maskedIdPattern = /^MEM-••••\d{4}$/;

describe('guest lead data', () => {
  it('generates deterministic masked guests across existing segments', () => {
    expect(guests.length).toBeGreaterThanOrEqual(40);
    expect(guests.length).toBeLessThanOrEqual(60);
    expect(guests.every((guest) => maskedIdPattern.test(guest.id))).toBe(true);
    expect(new Set(guests.map((guest) => guest.id)).size).toBe(guests.length);
  });

  it('computes finite lead scores and returns descending top priorities', () => {
    expect(topPriorityGuests).toHaveLength(12);
    topPriorityGuests.forEach((guest, index) => {
      expect(guest.leadScore).toBeGreaterThanOrEqual(0);
      expect(guest.leadScore).toBeLessThanOrEqual(100);
      if (index > 0) {
        expect(topPriorityGuests[index - 1].leadScore).toBeGreaterThanOrEqual(guest.leadScore);
      }
    });
  });

  it('keeps CDE capture and leakage balanced by category', () => {
    for (const guest of guests) {
      for (const category of CORE_CATEGORIES) {
        const total = guest.cde.categoryCapturePct[category] + guest.cde.categoryLeakagePct[category];
        expect(total).toBe(100);
      }
    }
  });

  it('keeps enriched guest fields CDE-safe', () => {
    for (const guest of guests) {
      expect(JSON.stringify(guest.cde)).not.toMatch(bannedCurrencyPattern);
      expect(guest.cde.crossPropertyCashBand).toMatch(/^\d+-\d+k equiv\.\/mo$/);
      expect(guest.projectedUpsideBand).toMatch(/^\d+-\d+k equiv\.\/mo$/);
      expect(guest.pitchScript.en).not.toMatch(bannedCurrencyPattern);
      expect(guest.pitchScript.zh).not.toMatch(bannedCurrencyPattern);
    }
  });

  it('looks up guests by id and segment id', () => {
    const first = guests[0];

    expect(getGuestById(first.id)).toEqual(first);
    expect(getGuestsBySegmentId(first.segmentId).every((guest) => guest.segmentId === first.segmentId)).toBe(true);
  });
});
