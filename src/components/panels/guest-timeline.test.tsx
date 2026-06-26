import { render, screen } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { GuestTimeline } from './guest-timeline';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('GuestTimeline', () => {
  it('renders a compact guest journey timeline from first-party and NBA signals', () => {
    const { container } = render(<GuestTimeline guest={guests[0]} />);

    expect(screen.getByText('Guest journey timeline')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${guests[0].firstParty.recencyDays} days ago`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${guests[0].firstParty.diningVisits} dining visits`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(guests[0].nextBestActions[0].channel, 'i'))).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('uses safe timeline fallbacks when guest inputs are malformed', () => {
    const malformedGuest = {
      ...guests[0],
      firstParty: {
        ...guests[0].firstParty,
        recencyDays: Number.POSITIVE_INFINITY,
        diningVisits: Number.NaN,
      },
      nextBestActions: [],
    } as unknown as Guest;

    const { container } = render(<GuestTimeline guest={malformedGuest} />);

    expect(screen.getByText(/No recent Galaxy touchpoint/i)).toBeInTheDocument();
    expect(screen.getByText(/0 dining visits L12M/i)).toBeInTheDocument();
    expect(screen.getByText(/host outreach/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });
});
