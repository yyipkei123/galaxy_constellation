import { render, screen, within } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { HostBriefingPanel } from './host-briefing-panel';

const categoryLabels = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

describe('HostBriefingPanel', () => {
  it('summarizes a synthetic guest for host action without banned currency', () => {
    const { container } = render(<HostBriefingPanel guest={guests[0]} />);

    const briefing = screen.getByRole('region', { name: 'Host briefing summary' });

    expect(within(briefing).getByRole('heading', { name: 'Host briefing' })).toBeInTheDocument();
    expect(within(briefing).getByText(guests[0].profile.displayName)).toBeInTheDocument();
    expect(within(briefing).getByText(guests[0].profile.originMarket)).toBeInTheDocument();
    expect(within(briefing).getByText(guests[0].profile.travelParty)).toBeInTheDocument();
    expect(within(briefing).getByText(categoryLabels[guests[0].primaryOpportunity])).toBeInTheDocument();
    expect(within(briefing).getByText(/Reason to contact now/i)).toBeInTheDocument();
    expect(within(briefing).getByText(/Next action/i)).toBeInTheDocument();
    expect(within(briefing).getByText(guests[0].nextBestActions[0].offer)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });

  it('renders an explicit no-action fallback without confidence metadata', () => {
    const guestWithoutActions = { ...guests[0], nextBestActions: [] };
    const { container } = render(<HostBriefingPanel guest={guestWithoutActions} />);

    const briefing = screen.getByRole('region', { name: 'Host briefing summary' });

    expect(within(briefing).getByText('No next action available')).toBeInTheDocument();
    expect(within(briefing).queryByText(/Confidence 0%/i)).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });

  it('sanitizes malformed CDE cash bands before rendering host rationale', () => {
    const unsafeGuest = {
      ...guests[0],
      cde: {
        ...guests[0].cde,
        crossPropertyCashBand: 'HKD 9000',
      },
    } as Guest;
    const { container } = render(<HostBriefingPanel guest={unsafeGuest} />);

    const briefing = screen.getByRole('region', { name: 'Host briefing summary' });

    expect(within(briefing).getByText(/0-0k equiv\.\/mo/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });
});
