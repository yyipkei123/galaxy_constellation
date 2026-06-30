import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import AcquisitionPage from './page';

const mockNavigation = vi.hoisted(() => ({
  search: 'corridor=korea&persona=entertainment_lover',
}));
const mockStore = vi.hoisted(() => ({
  launchCampaign: vi.fn(),
  pushCampaign: vi.fn(),
  saveScenario: vi.fn(),
  removeSavedScenario: vi.fn(),
  saveAudience: vi.fn(),
  removeSavedAudience: vi.fn(),
  clearCampaignToast: vi.fn(),
  setSelectedQuarterId: vi.fn(),
  setSelectedSegmentId: vi.fn(),
  setSelectedPersonaId: vi.fn(),
  setPresenterMode: vi.fn(),
  togglePresenterMode: vi.fn(),
  setFilters: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mockNavigation.search),
}));

vi.mock('@/store/app-store', () => ({
  useAppState: () => ({
    quarters: [],
    selectedQuarter: { id: '2024-q4', label: 'Q4 2024', isCurrent: true },
    selectedQuarterId: '2024-q4',
    setSelectedQuarterId: mockStore.setSelectedQuarterId,
    segments: [],
    selectedSegment: null,
    selectedSegmentId: '',
    setSelectedSegmentId: mockStore.setSelectedSegmentId,
    selectedPersonaId: '',
    setSelectedPersonaId: mockStore.setSelectedPersonaId,
    isPresenterMode: false,
    setPresenterMode: mockStore.setPresenterMode,
    togglePresenterMode: mockStore.togglePresenterMode,
    methodology: null,
    filters: {
      segmentIds: [],
      channel: 'all',
      minPropensity: 0,
    },
    setFilters: mockStore.setFilters,
    savedAudiences: [],
    saveAudience: mockStore.saveAudience,
    removeSavedAudience: mockStore.removeSavedAudience,
    campaignToast: null,
    pushCampaign: mockStore.pushCampaign,
    clearCampaignToast: mockStore.clearCampaignToast,
    launchedCampaigns: [],
    launchCampaign: mockStore.launchCampaign,
    savedScenarios: [],
    saveScenario: mockStore.saveScenario,
    removeSavedScenario: mockStore.removeSavedScenario,
  }),
}));

describe('acquisition route', () => {
  beforeEach(() => {
    mockNavigation.search = 'corridor=korea&persona=entertainment_lover';
    vi.clearAllMocks();
  });

  it('renders priority corridor recommendation and templated content hand-off', () => {
    render(<AcquisitionPage />);

    const header = screen.getByRole('region', { name: 'Priority Corridor Acquisition' });
    expect(within(header).getByRole('heading', { name: 'Priority Corridor Acquisition', level: 1 })).toBeInTheDocument();
    expect(within(header).getByText(/Turn Korea corridor intelligence/i)).toBeInTheDocument();
    expect(within(header).getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Target personas/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Content draft/i })).toBeInTheDocument();
    expect(screen.getByText(/No live model call/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '한국어' })).toBeInTheDocument();
    expect(screen.getByText(/v4 measurement-ready launch/i)).toBeInTheDocument();
  });

  it('launches acquisition campaign content into measurement', () => {
    render(<AcquisitionPage />);

    fireEvent.click(screen.getByRole('button', { name: /Launch campaign/i }));

    expect(mockStore.launchCampaign).toHaveBeenCalledTimes(1);
    expect(mockStore.launchCampaign).toHaveBeenCalledWith({
      source: 'acquisition',
      audienceName: 'Korea entertainment_lover',
      segmentIds: ['cosmopolitan-connoisseurs'],
      corridorId: 'korea',
      lever: expect.stringContaining('Korea'),
    });
  });

  it('falls back to default priority corridor params', () => {
    mockNavigation.search = '';

    render(<AcquisitionPage />);

    expect(screen.getByRole('heading', { name: 'Korea: Merging to the World' })).toBeInTheDocument();
    expect(screen.getByText('Why #1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Korea Entertainment Lover: Merging to the World' })).toBeInTheDocument();
  });

  it('falls back to corridor top persona for invalid persona params', () => {
    mockNavigation.search = 'corridor=taiwan&persona=invalid_persona';

    render(<AcquisitionPage />);

    const contentDraft = screen.getByRole('heading', { name: /Content draft/i }).closest('section');
    expect(contentDraft).not.toBeNull();
    expect(within(contentDraft as HTMLElement).getByRole('heading', { name: 'Taiwan Luxury Shopper: Taiwan acquisition' })).toBeInTheDocument();
  });

  it('uses rank-aware copy for non-priority selected corridors', () => {
    mockNavigation.search = 'corridor=japan&persona=entertainment_lover';

    render(<AcquisitionPage />);

    expect(screen.getByRole('heading', { name: 'Japan: Selected corridor' })).toBeInTheDocument();
    expect(screen.getByText('Rank #3')).toBeInTheDocument();
    expect(screen.getByText('Why this corridor')).toBeInTheDocument();
    expect(screen.queryByText('Why #1')).not.toBeInTheDocument();
    expect(screen.queryByText(/first acquisition corridor/i)).not.toBeInTheDocument();
  });

  it('renders required campaign language tabs once per label', () => {
    mockNavigation.search = 'corridor=taiwan&persona=luxury_shopper';

    render(<AcquisitionPage />);

    const contentDraft = screen.getByRole('heading', { name: /Content draft/i }).closest('section');
    expect(contentDraft).not.toBeNull();
    expect(within(contentDraft as HTMLElement).getAllByRole('tab', { name: 'EN' })).toHaveLength(1);
    expect(within(contentDraft as HTMLElement).getAllByRole('tab', { name: '繁中' })).toHaveLength(1);
    expect(within(contentDraft as HTMLElement).getAllByRole('tab', { name: '한국어' })).toHaveLength(1);
  });
});
