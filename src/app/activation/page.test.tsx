import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology, quarters, type Segment } from '@/data';
import { useAppState, type CampaignToast, type SavedAudience } from '@/store/app-store';
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
  };

  vi.mocked(useAppState).mockReturnValue(state);

  return { pushCampaign };
}

function renderActivation(options?: Parameters<typeof mockAppState>[0]) {
  const mocks = mockAppState(options);
  const view = render(<ActivationPage />);

  return { ...view, ...mocks };
}

describe('activation route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps top leakage fallback behavior when no audiences are saved', () => {
    const view = renderActivation();

    expect(screen.getByRole('heading', { name: 'Next-Best-Action' })).toBeInTheDocument();
    expect(screen.getAllByText('Top leakage segments').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Galaxy Rewards').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('MOP 200 rebate on MOP 500 spend')).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Push to campaign' })[0]);
    view.rerender(<ActivationPage />);

    expect(screen.getByText('Audience exported to Galaxy Rewards CRM / activation platform')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
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
