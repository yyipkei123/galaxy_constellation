import { render, screen } from '@testing-library/react';
import { topPriorityGuests, type Guest } from '@/data';
import { PriorityQuadrant } from './priority-quadrant';

function inlineStyles(container: Element) {
  return Array.from(container.querySelectorAll<HTMLElement>('[style]'))
    .map((node) => node.getAttribute('style') ?? '')
    .join(' ');
}

describe('PriorityQuadrant', () => {
  it('plots valid guest bubbles and preserves guest profile links', () => {
    render(<PriorityQuadrant guests={topPriorityGuests.slice(0, 3)} />);

    const figure = screen.getByRole('figure', { name: /Priority quadrant/i });
    expect(figure).toBeInTheDocument();
    expect(screen.getByText('Pitch now')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/guest priority bubble/i)).toHaveLength(3);

    const firstGuest = topPriorityGuests[0];
    const firstGuestLink = screen.getByRole('link', {
      name: `${firstGuest.id} guest priority bubble`,
    });
    expect(firstGuestLink).toHaveAttribute('href', `/guests/${encodeURIComponent(firstGuest.id)}`);
  });

  it('renders an empty state when no valid guests are available', () => {
    render(<PriorityQuadrant guests={[]} />);

    expect(screen.getByRole('figure', { name: /Priority quadrant/i })).toBeInTheDocument();
    expect(screen.getByText('No priority guests to plot')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('skips malformed guests without non-finite text or styles', () => {
    const malformedGuests = [
      null,
      {
        id: '',
        leadScore: Number.POSITIVE_INFINITY,
        cde: {
          propensities: {
            luxuryHotelSpender: Number.NaN,
            topTierRewards: Number.POSITIVE_INFINITY,
            coBrandLookAlike: -4,
          },
        },
      },
      topPriorityGuests[0],
    ] as unknown as Guest[];

    render(<PriorityQuadrant guests={malformedGuests} />);

    const figure = screen.getByRole('figure', { name: /Priority quadrant/i });
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(figure).not.toHaveTextContent(/NaN|Infinity/);
    expect(inlineStyles(figure)).not.toMatch(/NaN|Infinity/);
  });
});
