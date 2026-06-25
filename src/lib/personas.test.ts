import { personaClusters, personaRecords, personaById } from '@/data';

const bannedCurrencyPattern = /\b(?:MOP|HKD)\b|\$|元|澳門幣/i;

describe('persona segmentation data', () => {
  it('exports eighteen second-level personas grouped under the six Galaxy CDE segments', () => {
    expect(personaClusters).toHaveLength(6);
    expect(personaRecords).toHaveLength(18);
    expect(Object.keys(personaById)).toHaveLength(18);

    personaClusters.forEach((cluster) => {
      expect(cluster.personaIds).toHaveLength(3);
      cluster.personaIds.forEach((personaId) => {
        expect(personaById[personaId].segmentId).toBe(cluster.segmentId);
      });
    });
  });

  it('keeps persona copy CDE-compliant without banned currency markers', () => {
    expect(JSON.stringify({ personaClusters, personaRecords })).not.toMatch(bannedCurrencyPattern);
  });
});
