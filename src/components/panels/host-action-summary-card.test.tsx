import { render, screen, within } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { HostActionSummaryCard } from './host-action-summary-card';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

const categoryLabels: Record<Guest['primaryOpportunity'], string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

describe('HostActionSummaryCard', () => {
  it('renders presenter-ready host guidance without banned currency tokens', () => {
    const guestWithUnsafeOffer = {
      ...guests[0],
      nextBestActions: [
        {
          ...guests[0].nextBestActions[0],
          offer: 'HKD 500 host invitation 元',
        },
      ],
    } as Guest;

    const { container } = render(<HostActionSummaryCard guest={guestWithUnsafeOffer} />);

    const summary = screen.getByRole('region', { name: 'Host action summary' });

    expect(within(summary).getByRole('heading', { name: 'Host action summary' })).toBeInTheDocument();
    expect(within(summary).getByText('Why this guest')).toBeInTheDocument();
    expect(within(summary).getByText('What to offer')).toBeInTheDocument();
    expect(within(summary).getByText('What to say')).toBeInTheDocument();
    expect(within(summary).getByText('Evidence')).toBeInTheDocument();
    expect(summary).toHaveTextContent(guests[0].id);
    expect(within(summary).getByLabelText(`Lead Score ${guests[0].leadScore} out of 100`)).toBeInTheDocument();
    expect(summary).toHaveTextContent(categoryLabels[guests[0].primaryOpportunity]);
    expect(within(summary).getByRole('link', { name: 'Move to activation' })).toHaveAttribute('href', '/activation');
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('renders a safe host pitch fallback when no next-best-action is available', () => {
    const guestWithoutAction = {
      ...guests[0],
      nextBestActions: [],
    } as Guest;

    render(<HostActionSummaryCard guest={guestWithoutAction} />);

    const summary = screen.getByRole('region', { name: 'Host action summary' });

    expect(within(summary).getByText('Host-curated invitation')).toBeInTheDocument();
    expect(within(summary).getByText('Review the selected guest before creating a host pitch.')).toBeInTheDocument();
  });
});
