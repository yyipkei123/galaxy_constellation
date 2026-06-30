import { render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  campaigns,
  createLaunchedCampaign,
  latestQuarter,
  latestSegments,
  methodology,
  quarters,
  type MeasurementCampaign,
} from '@/data';
import { useAppState } from '@/store/app-store';
import MeasurementPage from './page';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();

  return {
    ...actual,
    useAppState: vi.fn(),
  };
});

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|\braw spend\b/i;

beforeAll(() => {
  class SizedResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [{
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
        }],
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

function mockAppState(launchedCampaigns: MeasurementCampaign[] = []) {
  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments: latestSegments,
    selectedSegment: latestSegments[0],
    selectedSegmentId: latestSegments[0].id,
    setSelectedSegmentId: vi.fn(),
    selectedPersonaId: '',
    setSelectedPersonaId: vi.fn(),
    isPresenterMode: false,
    setPresenterMode: vi.fn(),
    togglePresenterMode: vi.fn(),
    methodology,
    filters: {
      segmentIds: latestSegments.map((segment) => segment.id),
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
    launchedCampaigns,
    launchCampaign: vi.fn(),
    savedScenarios: [],
    saveScenario: vi.fn(),
    removeSavedScenario: vi.fn(),
  });
}

describe('measurement route', () => {
  it('renders launched campaigns before seeded campaigns with method proof copy', () => {
    const launchedCampaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Saved loyalty audience',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'recapture',
    });
    mockAppState([launchedCampaign]);

    const { container } = render(<MeasurementPage />);

    expect(screen.getByRole('heading', { name: 'Measurement Loop', level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(/holdout proof/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/causal lift/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/models Mastercard Test & Learn methodology/i).length).toBeGreaterThanOrEqual(1);

    const launchedCard = screen.getByRole('article', { name: /Saved loyalty audience measurement launch/i });
    const seedCard = screen.getByRole('article', { name: campaigns[0].name });
    expect(within(launchedCard).getByRole('heading', { name: /Saved loyalty audience measurement launch/i })).toBeVisible();
    expect(within(seedCard).getByRole('heading', { name: campaigns[0].name })).toBeVisible();
    expect(launchedCard.compareDocumentPosition(seedCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole('figure', { name: /Lift over time/i })).toHaveLength(campaigns.length + 1);
    expect(container.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});
