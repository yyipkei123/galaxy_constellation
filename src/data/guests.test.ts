import { latestSegments } from './generate';
import { CORE_CATEGORIES, guests, getGuestById, getGuestsBySegmentId, topPriorityGuests } from './guests';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const maskedIdPattern = /^MEM-••••\d{4}$/;

describe('guest lead data', () => {
  it('generates deterministic masked guests across existing segments', () => {
    expect(guests.length).toBeGreaterThanOrEqual(40);
    expect(guests.length).toBeLessThanOrEqual(60);
    expect(guests.every((guest) => maskedIdPattern.test(guest.id))).toBe(true);
    expect(new Set(guests.map((guest) => guest.id)).size).toBe(guests.length);

    const latestSegmentIds = latestSegments.map((segment) => segment.id);
    expect(new Set(guests.map((guest) => guest.segmentId))).toEqual(new Set(latestSegmentIds));
    for (const segmentId of latestSegmentIds) {
      expect(guests.filter((guest) => guest.segmentId === segmentId)).toHaveLength(8);
    }
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

  it('keeps first-party property history unique per guest', () => {
    for (const guest of guests) {
      expect(new Set(guest.firstParty.properties).size).toBe(guest.firstParty.properties.length);
    }
  });

  it('generates synthetic profile, demographics, stay history, and purchase history', () => {
    const directContactPattern = /@|\+\d{6,}|(?:\d[\s-]?){8,}/;

    for (const guest of guests) {
      expect(guest.profile).toEqual(expect.any(Object));
      expect(guest.preferences).toEqual(expect.any(Object));
      expect(guest.stayHistory).toEqual(expect.any(Array));
      expect(guest.purchaseHistory).toEqual(expect.any(Array));
      expect(guest.profile.displayName).toMatch(/^[A-Z][a-z]+ [A-Z]\.$/);
      expect(guest.profile.syntheticName).toBe(true);
      expect(guest.profile.ageBand).toMatch(/^\d{2}-\d{2}$/);
      expect(guest.profile.originMarket).toMatch(/Hong Kong|Guangdong|Taiwan|Singapore|Malaysia|Thailand|Japan|Korea/);
      expect(guest.profile.preferredLanguage).toMatch(/English|Cantonese|Mandarin|Korean|Japanese/);
      expect(guest.profile.hostOwner).toMatch(/^Host Team [A-D]$/);
      expect(guest.profile.contactability).toMatch(/Host-led|Digital opt-in|Concierge-led|Rewards app/);
      expect(guest.profile.consentStatus).toMatch(/marketable|service-only/);
      expect(guest.profile.travelParty).toMatch(/Solo|Couple|Family|Business party|Friends/);
      expect(guest.profile.homeProperty).toBeTruthy();
      expect(guest.profile.membershipTenureBand).toMatch(/^\d-\d years$/);
      expect(guest.preferences.favoriteCategories.length).toBeGreaterThanOrEqual(2);
      expect(guest.preferences.servicePreferences.length).toBeGreaterThanOrEqual(2);
      expect(guest.stayHistory).toHaveLength(3);
      expect(guest.purchaseHistory).toHaveLength(5);

      const firstPartyProfileText = JSON.stringify({
        profile: guest.profile,
        preferences: guest.preferences,
        stayHistory: guest.stayHistory,
        purchaseHistory: guest.purchaseHistory,
      });
      expect(firstPartyProfileText).not.toMatch(bannedCurrencyPattern);
      expect(firstPartyProfileText).not.toMatch(directContactPattern);
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
