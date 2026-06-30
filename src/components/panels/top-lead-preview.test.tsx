import { render, screen, within } from '@testing-library/react';
import { guests } from '@/data';
import { TopLeadPreview } from './top-lead-preview';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('TopLeadPreview', () => {
  it('promotes the highest scoring guest from the provided list', () => {
    const scopedGuests = [
      { ...guests[0], leadScore: 71 },
      { ...guests[1], leadScore: 96 },
      { ...guests[2], leadScore: 83 },
    ];
    const topGuest = scopedGuests[1];

    render(<TopLeadPreview guests={scopedGuests} />);

    const preview = screen.getByRole('region', { name: 'Top lead preview' });
    expect(within(preview).getByText('Open this lead first')).toBeInTheDocument();
    expect(preview).toHaveTextContent(topGuest.id);
    expect(preview).toHaveTextContent(topGuest.persona);
    expect(within(preview).getByLabelText(`Lead Score ${topGuest.leadScore} out of 100`)).toBeInTheDocument();
    expect(within(preview).getAllByText(/Wallet intensity/i).length).toBeGreaterThan(0);
    expect(within(preview).getAllByText(/Leakage/i).length).toBeGreaterThan(0);
    expect(within(preview).getByRole('link', { name: `Open Customer 360 for ${topGuest.id}` })).toHaveAttribute(
      'href',
      `/guests/${encodeURIComponent(topGuest.id)}`,
    );
    expect(preview.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('renders an empty state without a priority lead', () => {
    render(<TopLeadPreview guests={[]} />);

    const preview = screen.getByRole('region', { name: 'Top lead preview' });
    expect(preview).toHaveTextContent('No priority lead available');
    expect(within(preview).queryByRole('link', { name: /Open Customer 360/i })).not.toBeInTheDocument();
  });
});
