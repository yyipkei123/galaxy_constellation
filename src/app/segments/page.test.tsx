import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, vi } from 'vitest';
import { crmRows, latestQuarter, latestSegments, methodology, quarters, type CrmRow, type Segment } from '@/data';
import { CrmAppendTable } from '@/components/panels/crm-append-table';
import { formatPropensity } from '@/lib/format';
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
    expect(screen.getByRole('group', { name: 'Segment rail' })).toBeInTheDocument();
    latestSegments.forEach((segment) => {
      const button = screen.getByRole('button', { name: `segment: ${segment.name}` });
      expect(within(button).getByText(segment.name)).toBeInTheDocument();
      expect(within(button).getByText(segment.nameZh)).toBeInTheDocument();
      expect(within(button).getByText(segment.signatureTrait)).toBeInTheDocument();
      expect(within(button).getByText(segment.sizeBand)).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: latestSegments[0].name })).toBeInTheDocument();
    expect(screen.getAllByText(latestSegments[0].nameZh).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('AI-style insight brief')).toBeInTheDocument();
    expect(screen.getByText(/Generated insight narrative/i)).toBeInTheDocument();
    expect(screen.getByText(/Galaxy first-party signal/i)).toBeInTheDocument();
    expect(screen.getByText(/Mastercard CDE reveal/i)).toBeInTheDocument();
    expect(screen.getByText(/Discovered opportunity/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Why this segment matters now/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Persona universe/i })).toBeInTheDocument();
    expect(screen.getByText(/18 personas/i)).toBeInTheDocument();
    expect(screen.getByText(/second-level persona opportunity/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Persona explorer/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search persona, need, wallet gap, or tag/i)).toBeInTheDocument();
    expect(screen.getByText('Suite-First Patrons')).toBeInTheDocument();
    expect(screen.getByText('Private Dining Hosts')).toBeInTheDocument();
  });

  it('filters second-level personas by selected top-level segment and search text', () => {
    renderSegments();

    fireEvent.click(screen.getByRole('button', { name: `segment: ${latestSegments[2].name}` }));

    expect(screen.getByText('Same-Week Itinerary Builders')).toBeInTheDocument();
    expect(screen.getByText('Border Family Daytrippers')).toBeInTheDocument();
    expect(screen.queryByText('Suite-First Patrons')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search persona, need, wallet gap, or tag/i), {
      target: { value: 'mobile' },
    });

    expect(screen.getByText('Same-Week Itinerary Builders')).toBeInTheDocument();
    expect(screen.getByText('Mobile Deal Optimizers')).toBeInTheDocument();
    expect(screen.queryByText('Border Family Daytrippers')).not.toBeInTheDocument();
  });

  it('renders selected persona recommendation kit and updates after card selection', () => {
    renderSegments();

    expect(screen.getByRole('heading', { name: /Persona recommendation kit/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Suite-First Patrons' })).toBeInTheDocument();
    expect(screen.getByText(/Host-led suite retention path/i)).toBeInTheDocument();
    expect(screen.getByText(/Galaxy first-party signal/i)).toBeInTheDocument();
    expect(screen.getByText(/Mastercard CDE reveal/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'persona: Private Dining Hosts' }));

    expect(screen.getByRole('heading', { name: 'Private Dining Hosts' })).toBeInTheDocument();
    expect(screen.getByText(/Chef-table to promenade path/i)).toBeInTheDocument();
    expect(screen.queryByText(/Host-led suite retention path/i)).not.toBeInTheDocument();
  });

  it('renders active CDE metrics, propensity labels, spend radar, and recommended plays', () => {
    renderSegments();

    expect(screen.getByText('7 active CDE metrics')).toBeInTheDocument();
    [
      'Share of Wallet',
      'Share of Visits',
      'Avg Transaction #',
      'Avg Transaction Size',
      'Avg Industry Spend',
      'Channel Share',
      'Channel Visits #',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    [
      'Average Transaction Count',
      'Average Transaction Size',
      'Average Industry Spend',
      'Online Channel Share',
      'Channel Visits',
    ].forEach((label) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
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
    expect(screen.getByText(new RegExp(`${latestSegments[2].name} combines`, 'i'))).toBeInTheDocument();
  });

  it('renders append-to-CRM rows with masked IDs and CDE-compliant values only', () => {
    renderSegments();

    const table = screen.getByRole('table', { name: /append-to-CRM/i });
    expect(within(table).getByText('Append-to-CRM')).toBeInTheDocument();
    const headers = within(table).getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual([
      'Masked Customer ID',
      'Category Share',
      'Spend-with-competitors',
      'Luxury-retail index',
      'Propensity score',
    ]);
    headers.forEach((header) => {
      expect(within(table).getByRole('columnheader', { name: header })).toBeInTheDocument();
    });
    ['Masked ID', 'Segment', 'Competitor Band', 'Luxury Retail', 'Look-Alike'].forEach((header) => {
      expect(within(table).queryByRole('columnheader', { name: header })).not.toBeInTheDocument();
    });
    expect(within(table).getAllByText(/^MEM-/)).toHaveLength(10);
    expect(within(table).getAllByText(/••••/)).toHaveLength(10);
    expect(within(table).getAllByText(/equiv\.\/mo/).length).toBeGreaterThan(0);
    expect(within(table).getByText(formatPropensity(crmRows[0].propensityScore))).toBeInTheDocument();
    expect(within(table).queryByText(`${Math.round(crmRows[0].propensityScore * 100)}%`)).not.toBeInTheDocument();
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

  it('renders malformed segments with finite fallbacks instead of crashing', () => {
    const malformedSegment = {
      id: 'partial-segment',
      name: 'Partial Segment',
    } as unknown as Segment;

    expect(() => renderSegments([malformedSegment], malformedSegment)).not.toThrow();

    expect(screen.getByRole('button', { name: 'segment: Partial Segment' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Partial Segment' })).toBeInTheDocument();
    expect(screen.getByText('7 active CDE metrics')).toBeInTheDocument();
    expect(screen.getByText('Indexed category profile')).toBeInTheDocument();
    expect(screen.getByText('Recommended plays')).toBeInTheDocument();
    expect(screen.getByText('No recommended plays available for this segment.')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/i)).not.toBeInTheDocument();
  });

  it('renders fallback labels when malformed segment text fields are not strings', () => {
    const malformedSegment = {
      id: 'non-string-text-segment',
      name: 123,
      nameZh: {},
      signatureTrait: {},
      sizeBand: 456,
      crossPropertyCashBand: [],
    } as unknown as Segment;

    expect(() => renderSegments([malformedSegment], malformedSegment)).not.toThrow();

    expect(screen.getByRole('button', { name: 'segment: Unnamed Segment' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Unnamed Segment' })).toBeInTheDocument();
    expect(screen.getAllByText('Customer 360').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Segment profile is available with limited CDE fields.').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('~0-0k matched guests')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/i)).not.toBeInTheDocument();
  });

  it('sanitizes raw competitor spend bands before CRM append rendering', () => {
    const rawRows: CrmRow[] = [
      {
        ...crmRows[0],
        customerId: 'MEM-••••9999',
        competitorSpendBand: 'HKD $5000 monthly',
      },
    ];

    render(<CrmAppendTable rows={rawRows} />);

    const table = screen.getByRole('table', { name: /append-to-CRM/i });
    expect(within(table).getByText('Indexed band equiv./mo')).toBeInTheDocument();
    expect(within(table).queryByText(/HKD|\$/i)).not.toBeInTheDocument();
  });

  it('sanitizes exact-looking competitor spend bands before CRM append rendering', () => {
    const rawRows: CrmRow[] = [
      {
        ...crmRows[0],
        customerId: 'MEM-••••9998',
        competitorSpendBand: '9000 equiv./mo',
      },
    ];

    expect(() => render(<CrmAppendTable rows={rawRows} />)).not.toThrow();

    const table = screen.getByRole('table', { name: /append-to-CRM/i });
    expect(within(table).getByText('Indexed band equiv./mo')).toBeInTheDocument();
    expect(within(table).queryByText('9000 equiv./mo')).not.toBeInTheDocument();
  });
});
