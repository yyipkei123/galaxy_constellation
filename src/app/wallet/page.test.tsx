import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, vi } from 'vitest';
import { latestQuarter, latestSegments, methodology, quarters, type Segment } from '@/data';
import { useAppState } from '@/store/app-store';
import WalletPage from './page';

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

function mockAppState(segments: Segment[] = latestSegments) {
  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments,
    selectedSegment: segments[0] ?? latestSegments[0],
    selectedSegmentId: (segments[0] ?? latestSegments[0]).id,
    setSelectedSegmentId: vi.fn(),
    selectedPersonaId: '',
    setSelectedPersonaId: vi.fn(),
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

function renderWallet(segments?: Segment[]) {
  mockAppState(segments);
  return render(<WalletPage />);
}

describe('share of wallet route', () => {
  it('renders the wallet overview panels and category toggles', () => {
    renderWallet();

    expect(screen.getByRole('heading', { name: 'Share of Wallet' })).toBeInTheDocument();
    expect(screen.getByText('Reveal the gap')).toBeInTheDocument();
    expect(screen.getByText(/Compare captured share of wallet/i)).toBeInTheDocument();

    ['All', 'Hospitality', 'F&B', 'Entertainment', 'Retail-Luxury'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
    expect(screen.getByRole('group', { name: 'Wallet category filters' })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Share of Wallet vs Share of Visits' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Share of wallet versus share of visits/i)).toBeInTheDocument();
    [
      'Loyal & frequent',
      'Loyal but infrequent',
      'Tried us, spends elsewhere',
      'At risk',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Channel mix' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Channel split/i)).toBeInTheDocument();
    expect(screen.getByText(/Average online payment share/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CDE/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/MOP|HKD|\$/)).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('limits the F&B drill to bars/clubs and full-service restaurants', () => {
    renderWallet();

    fireEvent.click(screen.getByRole('button', { name: 'F&B' }));

    const drill = screen.getByRole('region', { name: 'F&B category drill' });
    expect(within(drill).getByText('bars/clubs')).toBeInTheDocument();
    expect(within(drill).getByText('full-service restaurants')).toBeInTheDocument();
    expect(within(drill).queryByText(/cuisine|nationality/i)).not.toBeInTheDocument();
  });

  it('shows the Retail-Luxury drill with luxury sub-category and jewellery/watches index', () => {
    renderWallet();

    fireEvent.click(screen.getByRole('button', { name: 'Retail-Luxury' }));

    const drill = screen.getByRole('region', { name: 'Retail-Luxury category drill' });
    expect(within(drill).getByText('Luxury sub-category')).toBeInTheDocument();
    expect(within(drill).getByText('jewellery/watches index')).toBeInTheDocument();
  });

  it('renders finite defaults when segments are empty', () => {
    renderWallet([]);

    expect(screen.getByText('No wallet segments available for this quarter.')).toBeInTheDocument();
    expect(screen.getByText('Average online payment share')).toBeInTheDocument();
    expect(screen.getAllByText('0%').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });

  it('tolerates partial malformed segment data without leaking invalid values', () => {
    const malformedSegment = {
      id: 'partial-segment',
      name: 'Partial Segment',
      categories: {
        hospitality: { capturedSharePct: 44 },
        fnb: { capturedSharePct: Number.NaN, sub: { bars: 120 } },
        entertainment: {},
        retailLuxury: { sub: {} },
      },
    } as unknown as Segment;

    expect(() => renderWallet([malformedSegment])).not.toThrow();

    expect(screen.getByRole('heading', { name: 'Share of Wallet' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Wallet category filters' })).toBeInTheDocument();
    expect(screen.getByText('Hospitality wallet capture')).toBeInTheDocument();
    expect(screen.getByText('F&B wallet capture')).toBeInTheDocument();
    expect(screen.getByLabelText(/Share of wallet versus share of visits/i)).toBeInTheDocument();
    expect(screen.getByText('Average online payment share')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });
});
