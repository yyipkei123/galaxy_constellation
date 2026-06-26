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

const BANNED_CURRENCY_RE = /\b(?:HKD|MOP)\b|\$|元|澳門幣/i;

describe('share of wallet route', () => {
  it('renders the wallet overview panels and category toggles', () => {
    renderWallet();

    expect(screen.getByRole('heading', { name: 'Share of Wallet' })).toBeInTheDocument();
    expect(screen.getByText('Wallet analytics')).toBeInTheDocument();
    expect(screen.getByText(/Prioritize Galaxy wallet gaps/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wallet analytics snapshot' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ranked category leakage' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Segment opportunity heatmap' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Largest wallet gaps now' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Wallet dashboard sections' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'CDE snapshot status' })).toBeInTheDocument();

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
    expect(screen.getAllByText('Insight callout').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/CDE/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(BANNED_CURRENCY_RE)).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('shows a selected heatmap cell detail and updates it after cell selection', () => {
    renderWallet();

    expect(screen.getByRole('region', { name: 'Selected wallet opportunity detail' })).toBeInTheDocument();
    expect(screen.getByText(/Selected opportunity/i)).toBeInTheDocument();

    const heatmap = screen.getByRole('table', { name: 'Segment opportunity heatmap table' });
    const privateDiningCell = within(heatmap).getByRole('button', {
      name: /Cosmopolitan Connoisseurs F&B relative wallet gap/i,
    });

    fireEvent.click(privateDiningCell);

    const detail = screen.getByRole('region', { name: 'Selected wallet opportunity detail' });
    expect(within(detail).getByText('Cosmopolitan Connoisseurs')).toBeInTheDocument();
    expect(within(detail).getByText('F&B')).toBeInTheDocument();
    expect(within(detail).getByText(/Recommended action/i)).toBeInTheDocument();
    expect(within(detail).queryByText(BANNED_CURRENCY_RE)).not.toBeInTheDocument();
  });

  it('exposes chart evidence tooltips for wallet analytics metrics', () => {
    renderWallet();
    const detail = screen.getByRole('region', { name: 'Selected wallet opportunity detail' });

    expect(within(detail).getByLabelText(/Wallet intensity index/i)).toBeInTheDocument();
    expect(within(detail).getByLabelText(/Relative wallet gap priority/i)).toBeInTheDocument();
  });

  it('updates ranked category leakage when a category filter is selected', () => {
    renderWallet();

    fireEvent.click(screen.getByRole('button', { name: 'F&B' }));

    const ranking = screen.getByRole('region', { name: 'Ranked category leakage analytics' });
    expect(within(ranking).getByText('F&B')).toBeInTheDocument();
    expect(within(ranking).queryByText('Hospitality')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'F&B category drill' })).toBeInTheDocument();
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
    expect(screen.getByText('No segment-level wallet gaps available for this quarter.')).toBeInTheDocument();
    expect(screen.getAllByText('Insufficient data').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('No channel signal available for this quarter.')).toBeInTheDocument();
    expect(screen.queryByText(/Physical payment behavior is dominant/i)).not.toBeInTheDocument();
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

  it('does not expose raw internal opportunity scores in rendered or accessible labels', () => {
    const { container } = renderWallet();

    expect(container.innerHTML).not.toMatch(/leakage opportunity score \d+/i);
  });

  it('uses a compact analytical header and leads with decision visuals before KPI support', () => {
    renderWallet();

    expect(screen.queryByText('Reveal the gap')).not.toBeInTheDocument();
    expect(screen.getByText('Wallet analytics')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Share of Wallet', level: 1 })).toHaveClass('font-sans');

    const heatmapHeading = screen.getByRole('heading', { name: 'Segment opportunity heatmap' });
    const snapshotHeading = screen.getByRole('heading', { name: 'Wallet analytics snapshot' });
    const rankingHeading = screen.getByRole('heading', { name: 'Ranked category leakage' });
    const ladderHeading = screen.getByRole('heading', { name: 'Largest wallet gaps now' });

    expect(Boolean(heatmapHeading.compareDocumentPosition(snapshotHeading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean(rankingHeading.compareDocumentPosition(snapshotHeading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean(ladderHeading.compareDocumentPosition(snapshotHeading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });
});
