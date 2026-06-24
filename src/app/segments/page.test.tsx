import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, vi } from 'vitest';
import { latestQuarter, latestSegments, methodology, quarters, type Segment } from '@/data';
import { useAppState } from '@/store/app-store';
import SegmentsPage from './page';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();

  return {
    ...actual,
    useAppState: vi.fn(),
  };
});

beforeAll(() => {
  class SizedResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: {
              x: 0,
              y: 0,
              width: 360,
              height: 260,
              top: 0,
              right: 360,
              bottom: 260,
              left: 0,
              toJSON: () => ({}),
            },
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          },
        ],
        this,
      );
    }

    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: SizedResizeObserver,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 360,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 260,
  });
});

function mockAppState(segments: Segment[] = latestSegments, selectedSegment: Segment | undefined = segments[0]) {
  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments,
    selectedSegment: selectedSegment as Segment,
    selectedSegmentId: selectedSegment?.id ?? '',
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

function renderSegments(segments?: Segment[], selectedSegment?: Segment) {
  mockAppState(segments, selectedSegment);
  return render(<SegmentsPage />);
}

describe('segments route', () => {
  it('renders six segment buttons and selected segment details', () => {
    renderSegments();

    expect(screen.getByRole('heading', { name: 'Guest Segments' })).toBeInTheDocument();
    expect(screen.getByText('Zoom to a segment')).toBeInTheDocument();
    expect(screen.getAllByText(/Customer 360/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/masked CRM records/i).length).toBeGreaterThanOrEqual(1);

    const buttons = screen.getAllByRole('button', { name: /^segment:/i });
    expect(buttons).toHaveLength(6);
    latestSegments.forEach((segment) => {
      const button = screen.getByRole('button', { name: `segment: ${segment.name}` });
      expect(within(button).getByText(segment.name)).toBeInTheDocument();
      expect(within(button).getByText(segment.nameZh)).toBeInTheDocument();
      expect(within(button).getByText(segment.signatureTrait)).toBeInTheDocument();
      expect(within(button).getByText(segment.sizeBand)).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: latestSegments[0].name })).toBeInTheDocument();
    expect(screen.getAllByText(latestSegments[0].nameZh).length).toBeGreaterThanOrEqual(1);
  });

  it('renders active CDE metrics, propensity labels, spend radar, and recommended plays', () => {
    renderSegments();

    expect(screen.getByText('7 active CDE metrics')).toBeInTheDocument();
    [
      'Share of Wallet',
      'Share of Visits',
      'Average Transaction Count',
      'Average Transaction Size',
      'Average Industry Spend',
      'Online Channel Share',
      'Channel Visits',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(7);

    [
      'High Spender in Luxury Hotels',
      'Top-Tier Rewards Spender',
      'Co-Brand Look-Alike',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/spend index radar/i)).toBeInTheDocument();
    expect(screen.getByText(/first-party indexed only/i)).toBeInTheDocument();
    expect(screen.getByText(/not a leakage category/i)).toBeInTheDocument();

    const playLinks = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/activation');
    expect(playLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('switches the selected segment from the rail', () => {
    renderSegments();

    fireEvent.click(screen.getByRole('button', { name: `segment: ${latestSegments[2].name}` }));

    expect(screen.getByRole('heading', { name: latestSegments[2].name })).toBeInTheDocument();
    expect(screen.getAllByText(latestSegments[2].nameZh).length).toBeGreaterThanOrEqual(1);
  });

  it('renders append-to-CRM rows with masked IDs and CDE-compliant values only', () => {
    renderSegments();

    const table = screen.getByRole('table', { name: /append-to-CRM/i });
    expect(within(table).getByText('Append-to-CRM')).toBeInTheDocument();
    expect(within(table).getAllByText(/^MEM-/)).toHaveLength(10);
    expect(within(table).getAllByText(/••••/)).toHaveLength(10);
    expect(within(table).getAllByText(/equiv\.\/mo/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/\b(?:HKD|MOP)\b|\$/i)).not.toBeInTheDocument();
  });

  it('renders an empty state when segments are unavailable', () => {
    renderSegments([], undefined);

    expect(screen.getByText('No guest segments available for this quarter.')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /^segment:/i })).toHaveLength(0);
    expect(screen.queryByText(/NaN|Infinity/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('does not throw when selectedSegment is unavailable', () => {
    expect(() => renderSegments(latestSegments, undefined)).not.toThrow();
    expect(screen.getByRole('heading', { name: latestSegments[0].name })).toBeInTheDocument();
  });
});
