import { personaById, personaClusters, personaRecords } from '@/data';
import type { PersonaPriority, PersonaWealthTier, SegmentPersona } from '@/data';

export type PersonaSortMode = 'opportunity' | 'audience' | 'readiness';

export interface PersonaFilterInput {
  segmentId?: string;
  wealthTier?: PersonaWealthTier;
  priority?: PersonaPriority;
  query?: string;
  sort?: PersonaSortMode;
}

export interface PersonaClusterSummary {
  segmentId: string;
  label: string;
  personaCount: number;
  totalAudienceK: number;
  averageOpportunityIndex: number;
  priorityPersonaId: string;
  largestPersonaId: string;
}

export interface PersonaUniverseSummary {
  totalPersonas: number;
  totalAudienceK: number;
  clusters: PersonaClusterSummary[];
  generatedInsight: string;
}

const SORT_FIELDS: Record<PersonaSortMode, keyof Pick<SegmentPersona, 'opportunityIndex' | 'audienceK' | 'readinessScore'>> = {
  opportunity: 'opportunityIndex',
  audience: 'audienceK',
  readiness: 'readinessScore',
};

function finiteNumber(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeQuery(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase() ?? '';
}

function hasPersonaId(personaId: string): personaId is keyof typeof personaById {
  return Object.prototype.hasOwnProperty.call(personaById, personaId);
}

function lookupPersona(personaId: string): SegmentPersona | undefined {
  return hasPersonaId(personaId) ? personaById[personaId] : undefined;
}

function sortPersonas(personas: SegmentPersona[], sort: PersonaSortMode = 'opportunity'): SegmentPersona[] {
  const sortField = SORT_FIELDS[sort] ?? SORT_FIELDS.opportunity;

  return [...personas].sort((left, right) => {
    const delta = finiteNumber(right[sortField]) - finiteNumber(left[sortField]);

    if (delta !== 0) return delta;
    return left.id.localeCompare(right.id);
  });
}

function getClusterPersonas(segmentId: string): SegmentPersona[] {
  const cluster = personaClusters.find((candidate) => candidate.segmentId === segmentId);

  if (!cluster) return [];

  return cluster.personaIds.flatMap((personaId) => {
    const persona = lookupPersona(personaId);
    return persona && persona.segmentId === segmentId ? [persona] : [];
  });
}

function getSearchText(persona: SegmentPersona): string {
  return [
    persona.name,
    persona.nameZh,
    persona.primaryNeed,
    persona.walletGap,
    ...persona.tags,
  ]
    .join(' ')
    .toLocaleLowerCase();
}

export function getPersonasForSegment(segmentId: string, sort: PersonaSortMode = 'opportunity'): SegmentPersona[] {
  return sortPersonas(getClusterPersonas(segmentId), sort);
}

export function filterPersonas(input: PersonaFilterInput = {}): SegmentPersona[] {
  const query = normalizeQuery(input.query);

  const filtered = personaRecords.filter((persona) => {
    if (input.segmentId && persona.segmentId !== input.segmentId) return false;
    if (input.wealthTier && persona.wealthTier !== input.wealthTier) return false;
    if (input.priority && persona.priority !== input.priority) return false;
    if (query && !getSearchText(persona).includes(query)) return false;

    return true;
  });

  return sortPersonas(filtered, input.sort ?? 'opportunity');
}

export function getPriorityPersona(segmentId?: string): SegmentPersona {
  const scopedPersonas = segmentId ? getClusterPersonas(segmentId) : personaRecords;
  const candidates = scopedPersonas.length > 0 ? scopedPersonas : personaRecords;

  return sortPersonas(candidates, 'opportunity')[0] ?? personaRecords[0];
}

export function getPersonaDetail(personaId: string, segmentId?: string): SegmentPersona {
  const persona = lookupPersona(personaId);

  if (persona && (!segmentId || persona.segmentId === segmentId)) return persona;

  return getPriorityPersona(segmentId);
}

export function getPersonaUniverseSummary(): PersonaUniverseSummary {
  const clusters = personaClusters.map<PersonaClusterSummary>((cluster) => {
    const personas = getClusterPersonas(cluster.segmentId);
    const totalAudienceK = personas.reduce((sum, persona) => sum + finiteNumber(persona.audienceK), 0);
    const totalOpportunityIndex = personas.reduce(
      (sum, persona) => sum + finiteNumber(persona.opportunityIndex),
      0,
    );
    const priorityPersona = sortPersonas(personas, 'opportunity')[0] ?? getPriorityPersona();
    const largestPersona = sortPersonas(personas, 'audience')[0] ?? priorityPersona;

    return {
      segmentId: cluster.segmentId,
      label: cluster.label,
      personaCount: personas.length,
      totalAudienceK,
      averageOpportunityIndex: personas.length > 0 ? Math.round(totalOpportunityIndex / personas.length) : 0,
      priorityPersonaId: priorityPersona.id,
      largestPersonaId: largestPersona.id,
    };
  });

  const totalAudienceK = personaRecords.reduce((sum, persona) => sum + finiteNumber(persona.audienceK), 0);
  const largestPersona = sortPersonas(personaRecords, 'audience')[0] ?? getPriorityPersona();
  const largestCluster = personaClusters.find((cluster) => cluster.segmentId === largestPersona.segmentId);

  return {
    totalPersonas: personaRecords.length,
    totalAudienceK,
    clusters,
    generatedInsight: `${largestPersona.name} is the largest second-level persona in ${largestCluster?.label ?? 'the Galaxy persona universe'}, giving the selector view a clear audience-size anchor without exposing raw currency.`,
  };
}
