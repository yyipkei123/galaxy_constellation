import { personaClusters, personaRecords, personaById } from '@/data';
import {
  filterPersonas,
  getPersonaDetail,
  getPersonasForSegment,
  getPersonaUniverseSummary,
  getPriorityPersona,
} from './personas';

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

    const clusteredPersonaIds = personaClusters.flatMap((cluster) => cluster.personaIds);
    personaRecords.forEach((persona) => {
      expect(clusteredPersonaIds.filter((personaId) => personaId === persona.id)).toHaveLength(1);
    });
  });

  it('keeps persona copy CDE-compliant without banned currency markers', () => {
    expect(JSON.stringify({ personaClusters, personaRecords })).not.toMatch(bannedCurrencyPattern);
  });
});

describe('persona segmentation selectors', () => {
  it('summarizes the persona universe by top-level Galaxy segment', () => {
    const summary = getPersonaUniverseSummary();

    expect(summary.totalPersonas).toBe(18);
    expect(summary.totalAudienceK).toBeGreaterThan(0);
    expect(summary.clusters).toHaveLength(6);
    expect(summary.clusters[0]).toMatchObject({
      segmentId: 'diamond-high-rollers',
      label: 'Diamond High-Rollers',
      personaCount: 3,
    });
    expect(summary.generatedInsight).toMatch(/largest second-level persona/i);
  });

  it('returns personas for the selected top-level segment sorted by opportunity by default', () => {
    const personas = getPersonasForSegment('gba-cross-border-explorers');

    expect(personas).toHaveLength(3);
    expect(personas[0].opportunityIndex).toBeGreaterThanOrEqual(personas[1].opportunityIndex);
    expect(personas.every((persona) => persona.segmentId === 'gba-cross-border-explorers')).toBe(true);
  });

  it('filters by segment, wealth tier, priority, and search text', () => {
    const personas = filterPersonas({
      segmentId: 'aspiring-mass-affluent',
      wealthTier: 'Mass-Affluent',
      priority: 'priority',
      query: 'tier',
      sort: 'opportunity',
    });

    expect(personas.map((persona) => persona.id)).toEqual(['tier-challenge-climbers']);
  });

  it('falls back to the priority persona when selected persona id is unavailable', () => {
    const detail = getPersonaDetail('missing-persona', 'diamond-high-rollers');
    const priority = getPriorityPersona('diamond-high-rollers');

    expect(detail.id).toBe(priority.id);
    expect(detail.segmentId).toBe('diamond-high-rollers');
  });

  it('keeps selector output finite and CDE-compliant', () => {
    const summary = getPersonaUniverseSummary();
    const filtered = filterPersonas({ query: 'retail', sort: 'readiness' });
    const serialized = JSON.stringify({ summary, filtered });

    expect(serialized).not.toMatch(/NaN|Infinity/);
    expect(serialized).not.toMatch(bannedCurrencyPattern);
  });
});
