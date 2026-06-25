import { fireEvent, render, screen, within } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';
import { beforeEach, vi } from 'vitest';
import { latestQuarter, latestSegments, methodology, quarters } from '@/data';
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

function mockAppState() {
  vi.mocked(useAppState).mockReturnValue({
    quarters,
    selectedQuarter: latestQuarter,
    selectedQuarterId: latestQuarter.id,
    setSelectedQuarterId: vi.fn(),
    segments: latestSegments,
    selectedSegment: latestSegments[0],
    selectedSegmentId: latestSegments[0].id,
    setSelectedSegmentId: vi.fn(),
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
  });
}

function renderLauncher() {
  mockAppState();
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

  it('opens and closes the AI insight assistant dialog', () => {
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
  });

  it('moves focus into the dialog, reaches the textbox with Tab, and closes with Escape', () => {
    renderLauncher();

    const launcher = screen.getByRole('button', { name: 'Open AI insight assistant' });
    launcher.focus();
    expect(launcher).toHaveFocus();

    const dialog = openAssistant();
    const closeButton = within(dialog).getByRole('button', { name: 'Close AI insight assistant' });
    const textbox = within(dialog).getByRole('textbox', { name: 'Ask the AI insight assistant' });

    expect(dialog).toContainElement(document.activeElement);
    expect(closeButton).toHaveFocus();
    for (let index = 0; index < 8 && document.activeElement !== textbox; index += 1) {
      fireEvent.keyDown(document.activeElement ?? closeButton, { key: 'Tab' });
    }
    expect(textbox).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'AI insight assistant' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open AI insight assistant' })).toHaveAttribute('aria-expanded', 'false');
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

  it('runs suggested persona prompts from the latest response', () => {
    renderLauncher();
    const dialog = openAssistant();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Which persona should we target first?' }));

    expect(within(dialog).getByText('Persona targeting answer')).toBeInTheDocument();
    expect(within(dialog).getByRole('figure', { name: 'Top personas' })).toBeInTheDocument();
  });
});
