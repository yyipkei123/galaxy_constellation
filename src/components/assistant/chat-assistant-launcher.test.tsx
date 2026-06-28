import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';
import { beforeEach, vi } from 'vitest';
import {
  campaigns,
  latestQuarter,
  latestSegments,
  methodology,
  personaRecords,
  quarters,
} from '@/data';
import { useAppState } from '@/store/app-store';
import { ChatAssistantLauncher } from './chat-assistant-launcher';

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

function mockAppState({ selectedPersonaId = '' }: { selectedPersonaId?: string } = {}) {
  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments: latestSegments,
    selectedSegment: latestSegments[0],
    selectedSegmentId: latestSegments[0].id,
    setSelectedSegmentId: vi.fn(),
    selectedPersonaId,
    setSelectedPersonaId: vi.fn(),
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
    launchedCampaigns: [],
    launchCampaign: vi.fn(),
    savedScenarios: [],
    saveScenario: vi.fn(),
    removeSavedScenario: vi.fn(),
  });
}

function renderLauncher(options?: Parameters<typeof mockAppState>[0]) {
  mockAppState(options);
  return render(<ChatAssistantLauncher />);
}

function openAssistant() {
  const launcher = screen.getByRole('button', { name: 'Open AI insight assistant' });
  fireEvent.click(launcher);
  return screen.getByRole('dialog', { name: 'AI insight assistant' });
}

describe('ChatAssistantLauncher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens and closes the AI insight assistant dialog', async () => {
    renderLauncher();

    expect(screen.queryByRole('dialog', { name: 'AI insight assistant' })).not.toBeInTheDocument();
    const launcher = screen.getByRole('button', { name: 'Open AI insight assistant' });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(launcher);
    const dialog = screen.getByRole('dialog', { name: 'AI insight assistant' });
    expect(dialog).toBeInTheDocument();
    expect(launcher).toHaveAccessibleName('Close AI insight assistant');
    expect(launcher).toHaveAttribute('aria-expanded', 'true');
    expect(launcher).toHaveAttribute('aria-controls', dialog.id);

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close AI insight assistant' }));

    expect(screen.queryByRole('dialog', { name: 'AI insight assistant' })).not.toBeInTheDocument();
    expect(launcher).toHaveAccessibleName('Open AI insight assistant');
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(launcher).toHaveFocus());
  });

  it('uses a compact safe-area mobile launcher and a labeled desktop affordance', () => {
    renderLauncher();

    const launcher = screen.getByRole('button', { name: 'Open AI insight assistant' });
    expect(launcher).toHaveAttribute('data-testid', 'ai-assistant-launcher');
    expect(launcher).toHaveClass('bottom-[calc(env(safe-area-inset-bottom)+0.875rem)]');
    expect(launcher).toHaveClass('right-3');
    expect(launcher).toHaveClass('h-11');
    expect(launcher).toHaveClass('w-11');
    expect(launcher).toHaveClass('lg:w-auto');
    expect(launcher).toHaveClass('lg:px-4');
    expect(within(launcher).getByText('Ask CDE AI')).toHaveClass('hidden');
    expect(within(launcher).getByText('Ask CDE AI')).toHaveClass('lg:inline');
  });

  it('keeps the assistant panel max height inside the safe-area-adjusted viewport', () => {
    renderLauncher();

    const dialog = openAssistant();

    expect(dialog).toHaveClass('bottom-[calc(env(safe-area-inset-bottom)+5rem)]');
    expect(dialog).toHaveClass('max-h-[min(42rem,calc(100dvh_-_env(safe-area-inset-bottom)_-_7rem))]');
  });

  it('moves focus into the dialog, lets Tab leave the non-modal drawer, and closes with Escape', async () => {
    renderLauncher();

    const launcher = screen.getByRole('button', { name: 'Open AI insight assistant' });
    launcher.focus();
    expect(launcher).toHaveFocus();

    const dialog = openAssistant();
    const closeButton = within(dialog).getByRole('button', { name: 'Close AI insight assistant' });

    expect(dialog).toContainElement(document.activeElement);
    expect(closeButton).toHaveFocus();
    expect(dialog).not.toHaveAttribute('aria-modal');

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    dialog.dispatchEvent(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(false);

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'AI insight assistant' })).not.toBeInTheDocument();
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(launcher).toHaveFocus());
  });

  it('answers a typed leakage question without banned currency tokens', () => {
    renderLauncher();
    const dialog = openAssistant();

    fireEvent.change(
      within(dialog).getByRole('textbox', { name: 'Ask the AI insight assistant' }),
      { target: { value: 'Which segment has the biggest leakage opportunity?' } },
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send question' }));

    expect(within(dialog).getByText('Leakage opportunity answer')).toBeInTheDocument();
    expect(within(dialog).getByRole('figure', { name: 'Leakage drivers' })).toBeInTheDocument();
    expect(within(dialog).getAllByText('CDE').length).toBeGreaterThanOrEqual(1);
    expect(dialog).not.toHaveTextContent(/\b(?:MOP|HKD)\b|\$|元|澳門幣/i);
  });

  it('sanitizes unsafe currency tokens from displayed user prompts', () => {
    renderLauncher();
    const dialog = openAssistant();

    fireEvent.change(
      within(dialog).getByRole('textbox', { name: 'Ask the AI insight assistant' }),
      { target: { value: 'Show HKD 5000 leakage' } },
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send question' }));

    expect(within(dialog).getByText('Governed CDE Fallback')).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent(/\b(?:MOP|HKD)\b|\$|元|澳門幣|5000/i);
  });

  it('sanitizes standalone amount tokens from sensitive displayed user prompts', () => {
    renderLauncher();
    const dialog = openAssistant();

    fireEvent.change(
      within(dialog).getByRole('textbox', { name: 'Ask the AI insight assistant' }),
      { target: { value: 'Show 5000 leakage' } },
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send question' }));

    expect(within(dialog).getByText('Leakage opportunity answer')).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent(/5000/i);
  });

  it('sanitizes standalone amount tokens for all leakage intent wording', () => {
    renderLauncher();
    const dialog = openAssistant();

    fireEvent.change(
      within(dialog).getByRole('textbox', { name: 'Ask the AI insight assistant' }),
      { target: { value: 'Show 5000 gap' } },
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send question' }));

    expect(within(dialog).getByText('Leakage opportunity answer')).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent(/5000/i);
  });

  it('runs suggested persona prompts from the latest response', () => {
    renderLauncher();
    const dialog = openAssistant();

    expect(within(dialog).queryByRole('button', { name: 'Which segment has the largest leakage gap?' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Which leakage driver is largest for the selected segment?' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Which persona should we target first?' }));

    expect(within(dialog).getByText('Persona targeting answer')).toBeInTheDocument();
    expect(within(dialog).getByRole('figure', { name: 'Top personas' })).toBeInTheDocument();
  });

  it('uses the selected persona id from app state in persona answers', () => {
    const selectedPersona = personaRecords.find((persona) => persona.name === 'Private Dining Hosts');
    expect(selectedPersona).toBeDefined();
    renderLauncher({ selectedPersonaId: selectedPersona?.id });
    const dialog = openAssistant();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Which persona should we target first?' }));

    expect(within(dialog).getByText('Persona targeting answer')).toBeInTheDocument();
    expect(within(dialog).getByText(/ranks Private Dining Hosts first/i)).toBeInTheDocument();
  });

  it('passes semantic context and launched campaigns into the assistant', () => {
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
      launchedCampaigns: [campaigns[1]],
      launchCampaign: vi.fn(),
      savedScenarios: [],
      saveScenario: vi.fn(),
      removeSavedScenario: vi.fn(),
    });
    render(<ChatAssistantLauncher />);
    const dialog = openAssistant();

    fireEvent.change(
      within(dialog).getByRole('textbox', { name: 'Ask the AI insight assistant' }),
      { target: { value: 'Who are my top 10 leads to pitch this quarter?' } },
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send question' }));

    expect(within(dialog).getByText('Top Pitch Leads')).toBeInTheDocument();
    expect(within(dialog).getByRole('figure', { name: 'Top 10 governed leads' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Draft the pitch for guest MEM-••••3421' })).toBeInTheDocument();
  });
});
