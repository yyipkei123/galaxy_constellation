import { render, screen } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { GuestProfileHeader } from './guest-profile-header';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('GuestProfileHeader', () => {
  it('renders a masked Customer 360 header with Galaxy tier and finite lead score', () => {
    const { container } = render(<GuestProfileHeader guest={guests[0]} />);

    expect(screen.getByRole('heading', { name: /Customer 360/i })).toBeInTheDocument();
    expect(screen.getByText(/^MEM-••••/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Galaxy tier/i)).toHaveTextContent(guests[0].galaxyTier);
    expect(screen.getByRole('meter', { name: /Lead Score/i })).toHaveAttribute(
      'aria-valuenow',
      String(guests[0].leadScore),
    );
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('sanitizes malformed guest text and clamps invalid lead scores', () => {
    const malformedGuest = {
      ...guests[0],
      id: 'raw HKD id',
      persona: 'MOP persona $ Infinity',
      galaxyTier: 'Unknown',
      leadScore: Number.POSITIVE_INFINITY,
    } as unknown as Guest;

    const { container } = render(<GuestProfileHeader guest={malformedGuest} />);

    expect(screen.getByText('Masked guest')).toBeInTheDocument();
    expect(screen.getByText('Guest profile unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText(/Galaxy tier Privilege/i)).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: /Lead Score/i })).toHaveAttribute('aria-valuenow', '0');
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });
});
