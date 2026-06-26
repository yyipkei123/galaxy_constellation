import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { guests, type Guest } from '@/data';
import { LeadBoard } from './lead-board';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('LeadBoard', () => {
  it('renders ranked masked guests, score drivers, and profile links', () => {
    render(<LeadBoard guests={guests} onAction={() => undefined} />);

    expect(screen.getByRole('heading', { name: /Priority Lead Board/i })).toBeInTheDocument();
    expect(screen.getByText(/who to pitch next/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^MEM-••••/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lead Score/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Driver:/i).length).toBeGreaterThan(0);

    const topGuest = [...guests].sort((first, second) => second.leadScore - first.leadScore)[0];
    const firstGuestLink = screen.getAllByRole('link', { name: /Open 360 for/i })[0];
    expect(firstGuestLink).toHaveAttribute('href', `/guests/${encodeURIComponent(topGuest.id)}`);
  });

  it('filters by tier, min score, and sends mock actions', () => {
    const onAction = vi.fn();
    render(<LeadBoard guests={guests} onAction={onAction} />);

    fireEvent.change(screen.getByLabelText('Tier filter'), { target: { value: 'Diamond' } });
    const listedGuests = screen.getAllByRole('article', { name: /priority lead/i });
    expect(listedGuests.length).toBeGreaterThan(0);
    listedGuests.forEach((lead) => {
      expect(within(lead).getByText('Diamond')).toBeInTheDocument();
    });

    const firstLead = screen.getAllByRole('article', { name: /priority lead/i })[0];

    expect(within(firstLead).getByRole('link', { name: /^Open 360 for MEM-••••\d{4}$/ })).toBeInTheDocument();
    expect(within(firstLead).getByRole('button', { name: /^Assign MEM-••••\d{4} to host$/ })).toBeInTheDocument();
    expect(within(firstLead).getByRole('button', { name: /^Add MEM-••••\d{4} to audience$/ })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Assign .* to host/i })[0]);
    expect(onAction).toHaveBeenCalledWith(expect.stringMatching(/assigned to host/i));

    fireEvent.change(screen.getByLabelText('Minimum lead score'), { target: { value: '95' } });
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });

  it('sorts by propensity when the sort control changes', () => {
    render(<LeadBoard guests={guests} onAction={() => undefined} />);

    fireEvent.change(screen.getByLabelText('Sort leads'), { target: { value: 'propensity' } });

    const expectedGuest = [...guests].sort((first, second) => {
      const firstAverage = Object.values(first.cde.propensities).reduce((sum, value) => sum + value, 0) / 3;
      const secondAverage = Object.values(second.cde.propensities).reduce((sum, value) => sum + value, 0) / 3;
      return secondAverage - firstAverage;
    })[0];

    expect(screen.getAllByRole('article', { name: /priority lead/i })[0]).toHaveTextContent(expectedGuest.id);
  });

  it('renders an empty state for no guests', () => {
    render(<LeadBoard guests={[]} onAction={() => undefined} />);

    expect(screen.getByText('No priority guests match these controls.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open 360/i })).not.toBeInTheDocument();
  });

  it('skips malformed guests without crashes or invalid values', () => {
    const malformedGuests = [
      null,
      {
        id: 'raw-id',
        persona: 'HKD malformed guest',
        leadScore: Number.POSITIVE_INFINITY,
        cde: {
          categoryLeakagePct: { hospitality: Number.NaN },
          categoryWalletIndex: { hospitality: Number.POSITIVE_INFINITY },
          propensities: {
            luxuryHotelSpender: Number.NaN,
            topTierRewards: Number.POSITIVE_INFINITY,
            coBrandLookAlike: -4,
          },
        },
        projectedUpsideBand: '$999',
      },
      guests[0],
    ] as unknown as Guest[];

    expect(() => render(<LeadBoard guests={malformedGuests} onAction={() => undefined} />)).not.toThrow();
    expect(screen.getAllByRole('article', { name: /priority lead/i })).toHaveLength(1);
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Priority Lead Board/i }).closest('section')).not.toHaveTextContent(bannedCurrencyPattern);
  });

  it('does not render unmasked MEM-style guest ids', () => {
    const malformedGuests = [
      {
        ...guests[0],
        id: 'MEM-12345678',
      },
      guests[1],
    ] as unknown as Guest[];

    render(<LeadBoard guests={malformedGuests} onAction={() => undefined} />);

    expect(screen.queryByText('MEM-12345678')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article', { name: /priority lead/i })).toHaveLength(1);
  });
});
