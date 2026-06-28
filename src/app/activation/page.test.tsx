import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology, quarters, type MeasurementCampaign, type Segment } from '@/data';
import { useAppState, type CampaignToast, type LaunchCampaignInput, type SavedAudience } from '@/store/app-store';
import ActivationPage from './page';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();

  return {
    ...actual,
    useAppState: vi.fn(),
  };
});

function mockAppState({
  segments = latestSegments,
  savedAudiences = [],
  campaignToast = null,
}: {
  segments?: Segment[];
  savedAudiences?: SavedAudience[];
  campaignToast?: CampaignToast | null;
} = {}) {
  const pushCampaign = vi.fn((toast: CampaignToast) => {
    vi.mocked(useAppState).mockReturnValue({
      ...state,
      campaignToast: toast,
      pushCampaign,
    });
  });
  const launchCampaign = vi.fn((input: LaunchCampaignInput) => {
    const campaign: MeasurementCampaign = {
      id: 'mock-measurement-campaign',
      name: `${input.audienceName} measurement launch`,
      source: input.source,
      audienceName: input.audienceName,
      segmentIds: [...input.segmentIds],
      corridorId: input.corridorId,
      lever: input.lever,
      category: 'corridor',
      indexedRevenueBand: 'Index 100',
      confidence: 'directional',
      testDesign: {
        holdoutPct: 10,
        durationWeeks: 6,
        expectedLiftThresholdPct: 5,
      },
      weeklySeries: [],
    };

    vi.mocked(useAppState).mockReturnValue({
      ...state,
      campaignToast: {
        title: 'Campaign launched into measurement',
        description: `${campaign.name} is ready for Test & Learn readout.`,
      },
      launchedCampaigns: [campaign],
      launchCampaign,
    });

    return campaign;
  });

  const state = {
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments,
    selectedSegment: segments[0],
    selectedSegmentId: segments[0]?.id ?? '',
    setSelectedSegmentId: vi.fn(),
    selectedPersonaId: '',
    setSelectedPersonaId: vi.fn(),
    methodology,
    filters: {
      segmentIds: segments.map((segment) => segment.id),
      channel: 'all' as const,
      minPropensity: 0,
    },
    setFilters: vi.fn(),
    savedAudiences,
    saveAudience: vi.fn(),
    removeSavedAudience: vi.fn(),
    campaignToast,
    pushCampaign,
    clearCampaignToast: vi.fn(),
    launchedCampaigns: [],
    launchCampaign,
    savedScenarios: [],
    saveScenario: vi.fn(),
    removeSavedScenario: vi.fn(),
  };

  vi.mocked(useAppState).mockReturnValue(state);

  return { launchCampaign, pushCampaign };
}

function renderActivation(options?: Parameters<typeof mockAppState>[0]) {
  const mocks = mockAppState(options);
  const view = render(<ActivationPage />);

  return { ...view, ...mocks };
}

function topFallbackSegments() {
  return [...latestSegments]
    .sort((first, second) => second.opportunityIndex - first.opportunityIndex)
    .slice(0, 2);
}

describe('activation route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps top leakage fallback behavior when no audiences are saved', () => {
    const view = renderActivation();
    const expectedSegmentIds = [...latestSegments]
      .sort((first, second) => second.opportunityIndex - first.opportunityIndex)
      .slice(0, 2)
      .map((segment) => segment.id);

    expect(screen.getByText('Activation planning')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Next-Best-Action', level: 1 })).toHaveClass('font-sans');
    expect(screen.getByText(
      /Move saved propensity audiences into Galaxy Rewards activation with segment-level rationale, compliant CDE sizing, and a suggested campaign channel\./,
    )).toBeInTheDocument();
    expect(screen.getAllByText('Top leakage segments').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Galaxy Rewards').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('MOP 200 rebate on MOP 500 spend')).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Push to campaign' })[0]);
    view.rerender(<ActivationPage />);

    expect(view.launchCampaign).toHaveBeenCalledTimes(1);
    expect(view.launchCampaign).toHaveBeenCalledWith({
      source: 'activation',
      audienceName: 'Top leakage segments',
      segmentIds: expectedSegmentIds,
      lever: expect.any(String),
    });
    expect(screen.getByText('Campaign launched into measurement')).toBeInTheDocument();
    expect(screen.getByText(/Top leakage segments measurement launch is ready for Test & Learn readout\./)).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('launches the clicked non-first activation card lever into measurement', () => {
    const view = renderActivation();
    const fallbackLevers = topFallbackSegments()
      .flatMap((segment) => segment.recommendedPlays.map((play) => play.lever))
      .slice(0, 4);

    if (fallbackLevers.length < 2 || fallbackLevers[0] === fallbackLevers[1]) {
      throw new Error('Expected fallback activation cards to expose distinct first and second levers');
    }

    fireEvent.click(screen.getAllByRole('button', { name: 'Push to campaign' })[1]);

    expect(view.launchCampaign).toHaveBeenCalledTimes(1);
    expect(view.launchCampaign).toHaveBeenCalledWith(expect.objectContaining({
      source: 'activation',
      lever: fallbackLevers[1],
    }));
    expect(view.launchCampaign).not.toHaveBeenCalledWith(expect.objectContaining({
      lever: fallbackLevers[0],
    }));
  });

  it('renders activation cards only for the active saved audience segment ids', () => {
    const savedSegment = latestSegments.find((segment) => segment.id === 'family-leisure-seekers') ?? latestSegments[0];

    renderActivation({
      savedAudiences: [{
        id: 'saved-family',
        name: 'Family saved audience',
        segmentIds: [savedSegment.id],
        createdAt: '2026-06-24T00:00:00.000Z',
      }],
    });

    expect(screen.getByText('Active audience')).toBeInTheDocument();
    expect(screen.getAllByText('Family saved audience').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Holiday certainty bundle')).toBeInTheDocument();
    expect(screen.queryByText('Michelin-to-boutique retail path')).not.toBeInTheDocument();
    expect(screen.queryByText('Top leakage segments')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Push to campaign' }).length).toBeGreaterThanOrEqual(1);
  });

  it('launches mixed saved audiences with only valid rendered segment ids', () => {
    const validSegment = latestSegments.find((segment) => segment.id === 'family-leisure-seekers') ?? latestSegments[0];
    const view = renderActivation({
      savedAudiences: [{
        id: 'saved-mixed',
        name: 'Mixed saved audience',
        segmentIds: [validSegment.id, 'stale-segment-id'],
        createdAt: '2026-06-24T00:00:00.000Z',
      }],
    });

    expect(screen.getByText('Active audience')).toBeInTheDocument();
    expect(screen.getAllByText('Mixed saved audience').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Holiday certainty bundle')).toBeInTheDocument();
    expect(screen.queryByText('Michelin-to-boutique retail path')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Push to campaign' }));

    expect(view.launchCampaign).toHaveBeenCalledTimes(1);
    expect(view.launchCampaign).toHaveBeenCalledWith(expect.objectContaining({
      source: 'activation',
      audienceName: 'Mixed saved audience',
      segmentIds: [validSegment.id],
    }));
  });

  it.each([
    { name: 'Empty saved audience', segmentIds: [] },
    { name: 'Stale saved audience', segmentIds: ['missing-segment-id'] },
  ])('renders an empty activation state for saved audience "$name"', ({ name, segmentIds }) => {
    renderActivation({
      savedAudiences: [{
        id: 'inactive-audience',
        name,
        segmentIds,
        createdAt: '2026-06-24T00:00:00.000Z',
      }],
    });

    expect(screen.getByText('Active audience')).toBeInTheDocument();
    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No activation plays available.' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Push to campaign' })).not.toBeInTheDocument();
    expect(screen.queryByText('MOP 200 rebate on MOP 500 spend')).not.toBeInTheDocument();
    expect(screen.queryByText('Top leakage segments')).not.toBeInTheDocument();
  });
});
