import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology } from '@/data';
import { BoardroomSummaryCard } from './boardroom-summary-card';

const bannedCdeDisplayPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend/i;

function setClipboard(value: { writeText: ReturnType<typeof vi.fn> } | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value,
  });
}

describe('BoardroomSummaryCard', () => {
  afterEach(() => {
    setClipboard(undefined);
    vi.restoreAllMocks();
  });

  it('renders a governed client boardroom summary without currency tokens', () => {
    render(
      <BoardroomSummaryCard
        quarter={latestQuarter}
        segment={latestSegments[0]}
        methodology={methodology}
      />,
    );

    const summary = screen.getByRole('region', { name: 'Client boardroom summary' });
    expect(within(summary).getByText('Client boardroom summary')).toBeInTheDocument();
    expect(summary).toHaveTextContent(latestQuarter.label);
    expect(summary).toHaveTextContent(latestSegments[0].name);
    expect(summary).toHaveTextContent(/actionable, not identifiable/i);
    expect(summary).toHaveTextContent(`${methodology.matchedCoveragePct}%`);
    expect(summary).toHaveTextContent(`CDE opportunity signal ${Math.round(latestSegments[0].opportunityIndex)}`);
    expect(summary.textContent).not.toMatch(bannedCdeDisplayPattern);
  });

  it('copies a governed boardroom summary to the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    render(
      <BoardroomSummaryCard
        quarter={latestQuarter}
        segment={latestSegments[0]}
        methodology={methodology}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy boardroom summary' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const copiedText = writeText.mock.calls[0][0];
    expect(copiedText).toContain('Galaxy Constellation boardroom summary');
    expect(copiedText).toContain(latestQuarter.label);
    expect(copiedText).toContain(`${methodology.matchedCoveragePct}% matched coverage`);
    expect(copiedText).toContain(latestSegments[0].name);
    expect(copiedText).toContain(`CDE opportunity signal ${Math.round(latestSegments[0].opportunityIndex)}`);
    expect(copiedText).toContain('Recommended action:');
    expect(copiedText).toContain('Data rule: actionable, not identifiable');
    expect(copiedText).not.toMatch(bannedCdeDisplayPattern);
    expect(screen.getByRole('status')).toHaveTextContent('Boardroom summary copied');
  });
});
