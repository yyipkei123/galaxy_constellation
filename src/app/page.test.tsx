import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology, quarters, type Segment } from '@/data';
import { useAppState } from '@/store/app-store';
import Home from './page';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();

  return {
    ...actual,
    useAppState: vi.fn(),
  };
});

function mockAppState(segments: Segment[] = latestSegments) {
  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments,
    selectedSegment: latestSegments[0],
    selectedSegmentId: latestSegments[0].id,
    setSelectedSegmentId: vi.fn(),
    methodology,
    filters: {
      segmentIds: segments.map((segment) => segment.id),
      channel: 'all',
      minPropensity: 0,
    },
    setFilters: vi.fn(),
    savedAudiences: [],
    saveAudience: vi.fn(),
    removeSavedAudience: vi.fn(),
    campaignToast: null,
    pushCampaign: vi.fn(),
    clearCampaignToast: vi.fn(),
  });
}

function renderHome() {
  mockAppState();
  return render(<Home />);
}

describe('overview route', () => {
  it('renders the Galaxy Constellation overview surface', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: /Galaxy Constellation/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Guest Wallet Intelligence/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Mastercard CDE/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/off-property wallet headroom/i)).toBeInTheDocument();

    expect(screen.getByText('Matched guest base')).toBeInTheDocument();
    expect(screen.getByText('Galaxy wallet capture')).toBeInTheDocument();
    expect(screen.getByText('Estimated wallet headroom')).toBeInTheDocument();
    expect(screen.getByText('Top-tier rewards propensity')).toBeInTheDocument();
    [
      'Matched guest base',
      'Galaxy wallet capture',
      'Estimated wallet headroom',
      'Top-tier rewards propensity',
    ].forEach((label) => {
      const card = screen.getByText(label).closest('article');
      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getAllByText('CDE').length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByRole('heading', { name: /Category wallet snapshot/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /This period's headline findings/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Insight engine/i })).toBeInTheDocument();
    expect(screen.getByText(/Galaxy first-party signal/i)).toBeInTheDocument();
    expect(screen.getByText(/Mastercard CDE reveal/i)).toBeInTheDocument();
    expect(screen.getByText(/Discovered opportunity/i)).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(4);
  });

  it('links top opportunities to leakage in descending opportunity order', () => {
    renderHome();
    const expectedSegments = [...latestSegments]
      .sort((first, second) => second.opportunityIndex - first.opportunityIndex)
      .slice(0, 3);
    const links = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/leakage');

    expect(links).toHaveLength(3);
    expectedSegments.forEach((segment, index) => {
      expect(links[index]).toHaveAttribute('href', '/leakage');
      expect(within(links[index]).getByText(segment.name)).toBeInTheDocument();
      expect(within(links[index]).getByText(`Index ${Math.round(segment.opportunityIndex)}`)).toBeInTheDocument();
    });
  });

  it('renders finite fallback aggregate values when segments are empty', () => {
    mockAppState([]);
    render(<Home />);

    expect(screen.getByText('~0-0k')).toBeInTheDocument();
    expect(screen.getAllByText('0%')).toHaveLength(2);
    expect(screen.getByText('0.00')).toBeInTheDocument();
    expect(screen.getByText('Index 0')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/i)).not.toBeInTheDocument();
    expect(screen.getByText('No category wallet segments available for this quarter.')).toBeInTheDocument();
    expect(screen.getByText('No active CDE segment insights available for this quarter.')).toBeInTheDocument();
  });

  it('does not surface non-finite aggregate values from unexpected segment data', () => {
    const malformedSegment = {
      ...latestSegments[0],
      sizeLowK: Number.NaN,
      sizeHighK: Number.POSITIVE_INFINITY,
      metrics: {
        ...latestSegments[0].metrics,
        shareOfWallet: Number.NaN,
      },
      propensities: {
        ...latestSegments[0].propensities,
        topTierRewards: Number.POSITIVE_INFINITY,
      },
      categories: {},
      opportunityIndex: Number.POSITIVE_INFINITY,
    };

    expect(() => {
      mockAppState([malformedSegment as unknown as Segment]);
      render(<Home />);
    }).not.toThrow();
    expect(screen.queryByText(/NaN|Infinity/i)).not.toBeInTheDocument();
  });

  it('does not render its own main landmark because the shell owns it', () => {
    renderHome();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
