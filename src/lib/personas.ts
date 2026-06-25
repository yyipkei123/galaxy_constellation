import { personaById, personaClusters, personaRecords } from '@/data';
import type { PersonaPriority, PersonaWealthTier, SegmentPersona } from '@/data';

export type PersonaSortMode = 'opportunity' | 'audience' | 'readiness';

export interface PersonaFilterInput {
  segmentId?: string;
  wealthTier?: PersonaWealthTier | 'All';
  priority?: PersonaPriority | 'All';
  query?: string;
  sort?: PersonaSortMode;
}

export interface PersonaClusterSummary {
  segmentId: string;
  label: string;
  personaCount: number;
  audienceK: number;
  priorityCount: number;
  highestOpportunityIndex: number;
  largestPersonaName: string;
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
  return value?.trim().toLowerCase() ?? '';
}

function hasPersonaId(personaId: string | undefined): personaId is keyof typeof personaById {
  if (!personaId) return false;

  return Object.prototype.hasOwnProperty.call(personaById, personaId);
}

function lookupPersona(personaId: string | undefined): SegmentPersona | undefined {
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
    .toLowerCase();
}

export function getPersonasForSegment(segmentId: string, sort: PersonaSortMode = 'opportunity'): SegmentPersona[] {
  return sortPersonas(getClusterPersonas(segmentId), sort);
}

export function filterPersonas(input: PersonaFilterInput = {}): SegmentPersona[] {
  const query = normalizeQuery(input.query);

  const filtered = personaRecords.filter((persona) => {
    if (input.segmentId && persona.segmentId !== input.segmentId) return false;
    if (input.wealthTier && input.wealthTier !== 'All' && persona.wealthTier !== input.wealthTier) return false;
    if (input.priority && input.priority !== 'All' && persona.priority !== input.priority) return false;
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

export function getPersonaDetail(personaId: string | undefined, segmentId?: string): SegmentPersona {
  const persona = lookupPersona(personaId);

  if (persona && (!segmentId || persona.segmentId === segmentId)) return persona;

  return getPriorityPersona(segmentId);
}

export function getPersonaUniverseSummary(): PersonaUniverseSummary {
  const clusters = personaClusters.map<PersonaClusterSummary>((cluster) => {
    const personas = getClusterPersonas(cluster.segmentId);
    const audienceK = personas.reduce((sum, persona) => sum + finiteNumber(persona.audienceK), 0);
    const priorityCount = personas.filter((persona) => persona.priority === 'priority').length;
    const highestOpportunityIndex = Math.max(0, ...personas.map((persona) => finiteNumber(persona.opportunityIndex)));
    const priorityPersona = sortPersonas(personas, 'opportunity')[0] ?? getPriorityPersona();
    const largestPersona = sortPersonas(personas, 'audience')[0] ?? priorityPersona;

    return {
      segmentId: cluster.segmentId,
      label: cluster.label,
      personaCount: personas.length,
      audienceK,
      priorityCount,
      highestOpportunityIndex,
      largestPersonaName: largestPersona.name,
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
