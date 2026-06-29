import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import {
  latestQuarter,
  latestSegments,
  methodology,
  quarters,
  type Segment,
} from '@/data';
import { useAppState } from '@/store/app-store';
import Home from './page';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();

  return {
    ...actual,
    useAppState: vi.fn(),
  };
});

const bannedCdeDisplayPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend/i;

function mockAppState(
  segments: Segment[] = latestSegments,
  selectedSegmentId = segments[0]?.id ?? 'missing-segment-id',
) {
  const setSelectedSegmentId = vi.fn();
  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId) ?? latestSegments[0];

  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments,
    selectedSegment,
    selectedSegmentId,
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
    launchedCampaigns: [],
    launchCampaign: vi.fn(),
    savedScenarios: [],
    saveScenario: vi.fn(),
    removeSavedScenario: vi.fn(),
  });

  return { setSelectedSegmentId };
}

function renderHome(segments?: Segment[], selectedSegmentId?: string) {
  const state = mockAppState(segments, selectedSegmentId);
  const result = render(<Home />);

  return { ...result, ...state };
}

function expectCdeSafeOutput(container: HTMLElement) {
  expect(container.textContent).not.toMatch(bannedCdeDisplayPattern);
  container.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      expect(attribute.value).not.toMatch(bannedCdeDisplayPattern);
    });
  });
}

describe('overview route', () => {
  it('composes the Open Design dashboard sections without a nested main landmark', () => {
    const { container } = renderHome();

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Guest wallet intelligence hero' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Executive summary' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Boardroom answer' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'How to read Galaxy Constellation' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Decision workspace' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Ask CDE AI' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Find the wallet gap Galaxy can win next/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Wallet headroom constellation/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Boardroom answer' })).toHaveTextContent(
      /pitch Cosmopolitan Connoisseurs first/i,
    );
    expect(screen.getByRole('button', { name: /Select Cosmopolitan Connoisseurs/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('tablist', { name: 'Dashboard workspace tabs' })).toBeInTheDocument();
    expectCdeSafeOutput(container);
  });

  it('lets the reading guide open the workbench and activation panels', () => {
    const { container } = renderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Open analytics workbench' }));

    expect(screen.getByRole('tab', { name: /Workbench/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Workbench' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Jump to campaign action' }));

    expect(screen.getByRole('tab', { name: /Activation/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Activation' })).toBeInTheDocument();
    expectCdeSafeOutput(container);
  });

  it('connects constellation segment selection back to app state', () => {
    const { container, setSelectedSegmentId } = renderHome();

    fireEvent.click(screen.getByRole('button', { name: /Select Aspiring Mass-Affluent/i }));

    expect(setSelectedSegmentId).toHaveBeenCalledWith('aspiring-mass-affluent');
    expect(screen.getByRole('button', { name: /Select Aspiring Mass-Affluent/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('complementary', { name: 'Ask CDE AI' })).toHaveTextContent(
      'Audience selection updated',
    );
    expectCdeSafeOutput(container);
  });

  it('renders finite fallback values when segments are empty', () => {
    const { container } = renderHome([]);

    expect(screen.getByText('0-0k')).toBeInTheDocument();
    expect(screen.getAllByText(/No active segment/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/NaN|Infinity/i)).not.toBeInTheDocument();
    expectCdeSafeOutput(container);
  });
});
