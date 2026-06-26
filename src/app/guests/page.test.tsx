import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { guests, latestSegments } from '@/data';
import GuestsPage from './page';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
let mockSegmentId = '';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mockSegmentId ? `segment=${mockSegmentId}` : ''),
}));

describe('guests route', () => {
  beforeEach(() => {
    mockSegmentId = '';
  });

  it('renders the Priority Lead Board, quadrant, and data fusion thesis', () => {
    const { container } = render(<GuestsPage />);

    expect(screen.getByRole('heading', { name: /Priority Lead Board/i })).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /Priority quadrant/i })).toBeInTheDocument();
    expect(screen.getByText(/Galaxy already knows internal behavior/i)).toBeInTheDocument();
    expect(screen.getByText(/Mastercard CDE adds external behavior/i)).toBeInTheDocument();
    expect(screen.getAllByText(/who to pitch next/i).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('shows an action toast from lead-board actions', () => {
    render(<GuestsPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /Add .* to audience/i })[0]);

    expect(screen.getByRole('status')).toHaveTextContent(/added to audience/i);
  });

  it('scopes the lead board and quadrant from a segment query with a clear action', () => {
    const selectedSegment = latestSegments[1];
    const otherSegmentGuest = guests.find((guest) => guest.segmentId !== selectedSegment.id);
    mockSegmentId = selectedSegment.id;

    render(<GuestsPage />);

    const scopeStatus = screen.getByRole('status');
    const scopedGuestCount = guests.filter((guest) => guest.segmentId === selectedSegment.id).length;

    expect(scopeStatus).toHaveTextContent(`Scoped to ${selectedSegment.name}`);
    expect(scopeStatus).toHaveTextContent(`Showing ${scopedGuestCount} matched guests`);
    expect(screen.getByRole('link', { name: /Clear segment scope/i })).toHaveAttribute('href', '/guests');
    guests
      .filter((guest) => guest.segmentId === selectedSegment.id)
      .forEach((guest) => {
        expect(screen.getByText(guest.id)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: `${guest.id} guest priority bubble` })).toHaveAttribute(
          'href',
          `/guests/${encodeURIComponent(guest.id)}`,
        );
      });
    if (otherSegmentGuest) {
      expect(screen.queryByText(otherSegmentGuest.id)).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: `${otherSegmentGuest.id} guest priority bubble` })).not.toBeInTheDocument();
    }
  });
});
