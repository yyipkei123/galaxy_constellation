import { fireEvent, render, screen, within } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology, quarters, type Segment } from '@/data';
import { useAppState } from '@/store/app-store';
import LeakagePage from './page';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();

  return {
    ...actual,
    useAppState: vi.fn(),
  };
});

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: ReactNode;
    href: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

function mockAppState(
  segments: Segment[] = latestSegments,
  selectedSegment: Segment | undefined = segments[0],
) {
  const setSelectedSegmentId = vi.fn();

  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments,
    selectedSegment: selectedSegment as Segment,
    selectedSegmentId: selectedSegment?.id ?? '',
    setSelectedSegmentId,
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

  return { setSelectedSegmentId };
}

function renderLeakage(segments?: Segment[], selectedSegment?: Segment) {
  const mocks = mockAppState(segments, selectedSegment);
  const view = render(<LeakagePage />);

  return { ...view, ...mocks };
}

describe('cross-property leakage route', () => {
  it('renders the leakage overview and headline opportunity index panel', () => {
    renderLeakage();

    expect(screen.getByText('Leakage review')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cross-Property Leakage', level: 1 })).toHaveClass('font-sans');
    expect(screen.getByText(/other hotels in cash/i)).toBeInTheDocument();
    expect(screen.getByText(/opportunity cost Galaxy can recapture/i)).toBeInTheDocument();
    expect(screen.getByText('Generated opportunity narrative')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Opportunity ladder/i })).toBeInTheDocument();
    expect(screen.getByText(/Insight callout/i)).toBeInTheDocument();

    const headline = screen.getByRole('region', { name: 'Headline opportunity index' });
    expect(within(headline).getByText('Headline opportunity index')).toBeInTheDocument();
    expect(within(headline).getByText(`Index ${Math.round(latestSegments[0].opportunityIndex)}`)).toBeInTheDocument();
    expect(within(headline).getByText(latestSegments[0].crossPropertyCashBand)).toBeInTheDocument();
    expect(within(headline).getByText(/equiv\.\/mo/)).toBeInTheDocument();
  });

  it('renders the leakage flow and cross-site cash spend callout without raw currency', () => {
    const { container } = renderLeakage();

    expect(screen.getByText('Guest wallet split')).toBeInTheDocument();
    expect(screen.getByText('Competitor hospitality')).toBeInTheDocument();
    expect(screen.getAllByText('Off-property luxury retail').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Off-property F&B').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Off-property entertainment').length).toBeGreaterThanOrEqual(1);

    const callout = screen.getByRole('region', { name: /cross-site cash spend/i });
    expect(within(callout).getByText(/cross-site cash spend/i)).toBeInTheDocument();
    expect(within(callout).getByText(`Index ${Math.round(latestSegments[0].crossPropertyCashIndex)}`)).toBeInTheDocument();
    expect(within(callout).getByText(/modelled, not itemised/i)).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/\b(?:MOP|HKD)\b|\$/i);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('renders win-back targets ranked by opportunity index and links to propensity', () => {
    const { setSelectedSegmentId } = renderLeakage();
    const rankedSegments = [...latestSegments].sort((first, second) => second.opportunityIndex - first.opportunityIndex);

    const table = screen.getByRole('table', { name: 'Win-back target segments' });
    expect(within(table).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Segment',
      'Leakage index',
      'Dominant leakage',
      'Action',
    ]);

    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(latestSegments.length);
    rankedSegments.forEach((segment, index) => {
      expect(within(rows[index]).getByText(segment.name)).toBeInTheDocument();
      expect(within(rows[index]).getByText(`Index ${Math.round(segment.opportunityIndex)}`)).toBeInTheDocument();
      expect(within(rows[index]).getByRole('link', { name: `Build audience for ${segment.name}` })).toHaveAttribute(
        'href',
        '/propensity',
      );
    });

    fireEvent.click(within(rows[0]).getByRole('link', { name: `Build audience for ${rankedSegments[0].name}` }));
    expect(setSelectedSegmentId).toHaveBeenCalledWith(rankedSegments[0].id);
  });

  it('uses fallback state when segments are empty', () => {
    renderLeakage([], undefined);

    expect(screen.getByRole('heading', { name: 'Cross-Property Leakage' })).toBeInTheDocument();
    expect(screen.getByText('No leakage segments available for this quarter.')).toBeInTheDocument();
    expect(screen.getAllByText('Index 0').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('0-0k equiv./mo')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });

  it('normalizes malformed segment values before rendering', () => {
    const malformedSegment = {
      id: 'partial-segment',
      name: 'Partial Segment',
      crossPropertyCashBand: 'HKD $999 monthly',
      crossPropertyCashIndex: Number.NaN,
      opportunityIndex: Number.POSITIVE_INFINITY,
      categories: {
        hospitality: { leakagePct: Number.NaN },
        fnb: {},
        entertainment: {},
        retailLuxury: {},
      },
      metrics: {},
    } as unknown as Segment;

    const { container } = renderLeakage([malformedSegment], malformedSegment);

    expect(screen.getByRole('heading', { name: 'Cross-Property Leakage' })).toBeInTheDocument();
    expect(screen.getAllByText('Partial Segment').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('0-0k equiv./mo')).toBeInTheDocument();
    expect(screen.getAllByText('Index 0').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(/\b(?:MOP|HKD)\b|\$/i);
  });

  it('sanitizes localized currency markers in malformed cash bands before rendering', () => {
    const malformedSegment = {
      ...latestSegments[0],
      id: 'localized-currency-segment',
      name: 'Localized Currency Segment',
      crossPropertyCashBand: '999元 equiv./mo',
    } as unknown as Segment;

    expect(() => renderLeakage([malformedSegment], malformedSegment)).not.toThrow();

    expect(screen.getByText('0-0k equiv./mo')).toBeInTheDocument();
    expect(screen.queryByText(/999元/)).not.toBeInTheDocument();
  });

  it('sanitizes exact-looking equiv cash bands before rendering', () => {
    const exactBandSegment = {
      ...latestSegments[0],
      id: 'exact-band-segment',
      name: 'Exact Band Segment',
      crossPropertyCashBand: '9000 equiv./mo',
    } as unknown as Segment;

    expect(() => renderLeakage([exactBandSegment], exactBandSegment)).not.toThrow();

    expect(screen.getByText('0-0k equiv./mo')).toBeInTheDocument();
    expect(screen.queryByText('9000 equiv./mo')).not.toBeInTheDocument();
  });
});
