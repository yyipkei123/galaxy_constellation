import { personaClusters, personaRecords, personaById } from '@/data';
import {
  filterPersonas,
  getPersonaDetail,
  getPersonasForSegment,
  getPersonaUniverseSummary,
  getPriorityPersona,
} from './personas';

const bannedCurrencyPattern = /\b(?:MOP|HKD)\b|\$|元|澳門幣/i;

function collectNumbers(value: unknown): number[] {
  if (typeof value === 'number') return [value];
  if (Array.isArray(value)) return value.flatMap(collectNumbers);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).flatMap(collectNumbers);

  return [];
}

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
    expect(summary.clusters[0]).toEqual({
      segmentId: 'diamond-high-rollers',
      label: 'Diamond High-Rollers',
      personaCount: 3,
      audienceK: 9,
      priorityCount: 2,
      highestOpportunityIndex: 142,
      largestPersonaName: 'Suite-First Patrons',
    });
    expect(Object.keys(summary.clusters[0]).sort()).toEqual([
      'audienceK',
      'highestOpportunityIndex',
      'label',
      'largestPersonaName',
      'personaCount',
      'priorityCount',
      'segmentId',
    ]);
    expect(summary.generatedInsight).toMatch(/largest second-level persona/i);
  });

  it('returns personas for the selected top-level segment sorted by opportunity by default', () => {
    const personas = getPersonasForSegment('gba-cross-border-explorers');

    expect(personas).toHaveLength(3);
    personas.slice(0, -1).forEach((persona, index) => {
      expect(persona.opportunityIndex).toBeGreaterThanOrEqual(personas[index + 1].opportunityIndex);
    });
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

  it('treats All wealth tier and priority filters as no filter', () => {
    const unfiltered = filterPersonas();
    const allFiltered = filterPersonas({ wealthTier: 'All', priority: 'All' });

    expect(allFiltered.map((persona) => persona.id)).toEqual(unfiltered.map((persona) => persona.id));
  });

  it('falls back to the priority persona when selected persona id is unavailable', () => {
    const detail = getPersonaDetail('missing-persona', 'diamond-high-rollers');
    const undefinedDetail = getPersonaDetail(undefined, 'diamond-high-rollers');
    const priority = getPriorityPersona('diamond-high-rollers');

    expect(detail.id).toBe(priority.id);
    expect(undefinedDetail.id).toBe(priority.id);
    expect(detail.segmentId).toBe('diamond-high-rollers');
  });

  it('keeps selector output finite and CDE-compliant', () => {
    const summary = getPersonaUniverseSummary();
    const filtered = filterPersonas({ query: 'retail', sort: 'readiness' });
    const serialized = JSON.stringify({ summary, filtered });
    const numericValues = collectNumbers({ summary, filtered });

    expect(numericValues.length).toBeGreaterThan(0);
    expect(numericValues.every(Number.isFinite)).toBe(true);
    expect(serialized).not.toMatch(bannedCurrencyPattern);
  });
});
