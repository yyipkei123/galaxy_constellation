'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  latestQuarter,
  latestSegments,
  methodology,
  quarters,
  segmentsByQuarter,
  type Methodology,
  type Quarter,
  type Segment,
} from '@/data';

export interface AudienceFilters {
  segmentIds: string[];
  channel: 'all' | 'online' | 'physical' | 'hybrid';
  minPropensity: number;
}

export interface SavedAudience {
  id: string;
  name: string;
  segmentIds: string[];
  createdAt: string;
}

export interface CampaignToast {
  title: string;
  description: string;
}

interface AppStateValue {
  quarters: Quarter[];
  selectedQuarter: Quarter;
  selectedQuarterId: string;
  setSelectedQuarterId: (quarterId: string) => void;
  segments: Segment[];
  selectedSegment: Segment;
  selectedSegmentId: string;
  setSelectedSegmentId: (segmentId: string) => void;
  selectedPersonaId: string;
  setSelectedPersonaId: (personaId: string) => void;
  methodology: Methodology;
  filters: AudienceFilters;
  setFilters: (filters: SetStateAction<AudienceFilters>) => void;
  savedAudiences: SavedAudience[];
  saveAudience: (name: string, segmentIds?: string[]) => SavedAudience;
  removeSavedAudience: (audienceId: string) => void;
  campaignToast: CampaignToast | null;
  pushCampaign: (toast: CampaignToast) => void;
  clearCampaignToast: () => void;
}

const defaultAudienceFilters: AudienceFilters = {
  segmentIds: latestSegments.map((segment) => segment.id),
  channel: 'all',
  minPropensity: 0,
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [selectedQuarterId, setSelectedQuarterIdState] = useState(latestQuarter.id);
  const [selectedSegmentId, setSelectedSegmentIdState] = useState(latestSegments[0].id);
  const [selectedPersonaId, setSelectedPersonaIdState] = useState('');
  const [filters, setFiltersState] = useState<AudienceFilters>(defaultAudienceFilters);
  const [savedAudiences, setSavedAudiences] = useState<SavedAudience[]>([]);
  const [campaignToast, setCampaignToast] = useState<CampaignToast | null>(null);

  const selectedQuarter = quarters.find((quarter) => quarter.id === selectedQuarterId) ?? latestQuarter;
  const segments = segmentsByQuarter[selectedQuarter.id] ?? latestSegments;
  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId) ?? segments[0];

  const setSelectedQuarterId = useCallback((quarterId: string) => {
    const nextQuarter = quarters.find((quarter) => quarter.id === quarterId) ?? latestQuarter;
    const nextSegments = segmentsByQuarter[nextQuarter.id] ?? latestSegments;

    setSelectedQuarterIdState(nextQuarter.id);
    setSelectedPersonaIdState('');
    setSelectedSegmentIdState((currentSegmentId) => (
      nextSegments.some((segment) => segment.id === currentSegmentId)
        ? currentSegmentId
        : nextSegments[0].id
    ));
  }, []);

  const setSelectedSegmentId = useCallback((segmentId: string) => {
    setSelectedSegmentIdState(segmentId);
    setSelectedPersonaIdState('');
  }, []);

  const setSelectedPersonaId = useCallback((personaId: string) => {
    setSelectedPersonaIdState(personaId);
  }, []);

  const setFilters = useCallback((nextFilters: SetStateAction<AudienceFilters>) => {
    setFiltersState((current) => {
      const resolvedFilters = typeof nextFilters === 'function' ? nextFilters(current) : nextFilters;

      return {
        ...resolvedFilters,
        segmentIds: [...resolvedFilters.segmentIds],
      };
    });
  }, []);

  const saveAudience = useCallback((name: string, segmentIds = filters.segmentIds) => {
    const audience: SavedAudience = {
      id: `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'audience'}`,
      name,
      segmentIds: [...segmentIds],
      createdAt: new Date().toISOString(),
    };

    setSavedAudiences((current) => [audience, ...current.filter((item) => item.id !== audience.id)]);
    return audience;
  }, [filters.segmentIds]);

  const removeSavedAudience = useCallback((audienceId: string) => {
    setSavedAudiences((current) => current.filter((audience) => audience.id !== audienceId));
  }, []);

  const value = useMemo<AppStateValue>(() => ({
    quarters,
    selectedQuarter,
    selectedQuarterId: selectedQuarter.id,
    setSelectedQuarterId,
    segments,
    selectedSegment,
    selectedSegmentId: selectedSegment.id,
    setSelectedSegmentId,
    selectedPersonaId,
    setSelectedPersonaId,
    methodology,
    filters,
    setFilters,
    savedAudiences,
    saveAudience,
    removeSavedAudience,
    campaignToast,
    pushCampaign: setCampaignToast,
    clearCampaignToast: () => setCampaignToast(null),
  }), [
    campaignToast,
    filters,
    removeSavedAudience,
    saveAudience,
    savedAudiences,
    segments,
    selectedQuarter,
    selectedSegment,
    selectedPersonaId,
    setFilters,
    setSelectedPersonaId,
    setSelectedQuarterId,
    setSelectedSegmentId,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}
