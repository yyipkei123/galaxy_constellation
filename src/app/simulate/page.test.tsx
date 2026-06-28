import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import {
  latestQuarter,
  latestSegments,
  methodology,
  quarters,
  type CoreCategory,
  type SavedScenario,
  type ScenarioLever,
  type Segment,
} from '@/data';
import { useAppState, type SaveScenarioInput } from '@/store/app-store';
import SimulatePage from './page';

vi.mock('@/store/app-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/app-store')>();

  return {
    ...actual,
    useAppState: vi.fn(),
  };
});

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;

function createSavedScenario(input: SaveScenarioInput): SavedScenario {
  return {
    id: 'saved-scenario-1',
    name: input.name,
    segmentIds: input.segmentIds,
    category: input.category,
    recapturePct: input.recapturePct,
    onlineShiftPct: input.onlineShiftPct,
    lever: input.lever,
    createdAt: '2026-06-28T00:00:00.000Z',
  };
}

function mockAppState({
  segments = latestSegments,
  selectedSegment = segments[0],
  selectedSegmentId = selectedSegment?.id ?? '',
}: {
  segments?: Segment[];
  selectedSegment?: Segment;
  selectedSegmentId?: string;
} = {}) {
  const saveScenario = vi.fn((input: SaveScenarioInput) => createSavedScenario(input));

  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments,
    selectedSegment: selectedSegment as Segment,
    selectedSegmentId,
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
    launchedCampaigns: [],
    launchCampaign: vi.fn(),
    savedScenarios: [],
    saveScenario,
    removeSavedScenario: vi.fn(),
  });

  return { saveScenario };
}

function renderSimulate(options?: Parameters<typeof mockAppState>[0]) {
  const mocks = mockAppState(options);
  const view = render(<SimulatePage />);

  return { ...view, ...mocks };
}

describe('simulate route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders simulator controls and displayed CDE-safe impact', () => {
    const { container } = renderSimulate();

    expect(screen.getByRole('heading', { name: 'What-if Scenario Simulator', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lever' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Recapture leakage' })).toHaveValue('18');
    expect(screen.getByRole('slider', { name: 'Shift online channel mix' })).toHaveValue('8');
    expect(screen.getByRole('button', { name: 'Save scenario' })).toBeInTheDocument();
    expect(screen.getByText('Wallet uplift')).toBeInTheDocument();
    expect(screen.getByText('Opportunity delta')).toBeInTheDocument();
    expect(screen.getByText('Pitch-now movement')).toBeInTheDocument();
    expect(screen.getByText('Projected band')).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /Scenario constellation shift/i })).toBeInTheDocument();
    expect(container.textContent).toMatch(/Index \d+/);
    expect(container.textContent).toMatch(/\d+-\d+k equiv\.\/mo/);
    expect(container.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });

  it('updates sliders and displayed impact when scenario inputs change', () => {
    renderSimulate();

    const recaptureSlider = screen.getByRole('slider', { name: 'Recapture leakage' });
    const onlineShiftSlider = screen.getByRole('slider', { name: 'Shift online channel mix' });
    fireEvent.change(recaptureSlider, { target: { value: '42' } });
    fireEvent.change(onlineShiftSlider, { target: { value: '21' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), {
      target: { value: 'retailLuxury' satisfies CoreCategory },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Lever' }), {
      target: { value: 'contentPersonalisation' satisfies ScenarioLever },
    });

    expect(recaptureSlider).toHaveValue('42');
    expect(onlineShiftSlider).toHaveValue('21');
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('+21 pts')).toBeInTheDocument();
    expect(screen.getByText('Retail-Luxury')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lever' })).toHaveValue('contentPersonalisation');
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });

  it('saves the current scenario and shows status after save', () => {
    const { saveScenario } = renderSimulate();

    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), {
      target: { value: 'fnb' satisfies CoreCategory },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Lever' }), {
      target: { value: 'hostLift' satisfies ScenarioLever },
    });
    fireEvent.change(screen.getByRole('slider', { name: 'Recapture leakage' }), {
      target: { value: '26' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));

    expect(saveScenario).toHaveBeenCalledWith(expect.objectContaining({
      segmentIds: [latestSegments[0].id],
      category: 'fnb',
      recapturePct: 26,
      onlineShiftPct: 8,
      lever: 'hostLift',
    }));
    expect(screen.getByRole('status')).toHaveTextContent(/Scenario saved/i);
    expect(screen.getByRole('status')).toHaveTextContent(`${latestSegments[0].name} Host lift scenario`);
    expect(screen.getByRole('status')).not.toHaveTextContent('saved-scenario-1');
  });

  it('sanitizes unsafe active segment names before rendering and saving scenarios', () => {
    const unsafeSegment = {
      ...latestSegments[0],
      id: 'unsafe-segment',
      name: 'HKD 5000 leakage segment',
    };
    const { container, saveScenario } = renderSimulate({
      segments: [unsafeSegment],
      selectedSegment: unsafeSegment,
      selectedSegmentId: unsafeSegment.id,
    });

    expect(container.textContent).not.toMatch(/\bHKD\b|5000|\$|元|澳門幣/i);

    fireEvent.change(screen.getByRole('combobox', { name: 'Lever' }), {
      target: { value: 'hostLift' satisfies ScenarioLever },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));

    expect(saveScenario).toHaveBeenCalledWith(expect.objectContaining({
      name: 'leakage segment Host lift scenario',
    }));
    expect(screen.getByRole('status')).toHaveTextContent('Scenario saved: leakage segment Host lift scenario');
    expect(screen.getByRole('status')).not.toHaveTextContent('saved-scenario-1');
    expect(container.textContent).not.toMatch(/\bHKD\b|5000|\$|元|澳門幣/i);
  });

  it('uses the first segment as a safe fallback when selectedSegment is missing', () => {
    const { saveScenario } = renderSimulate({
      selectedSegment: undefined,
      selectedSegmentId: 'stale-selected-segment',
    });

    expect(screen.getByText(latestSegments[0].name)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));

    expect(saveScenario).toHaveBeenCalledWith(expect.objectContaining({
      segmentIds: [latestSegments[0].id],
    }));
    expect(within(screen.getByRole('figure', { name: /Scenario constellation shift/i }))
      .queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });
});
