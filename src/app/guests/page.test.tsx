import { fireEvent, render, screen } from '@testing-library/react';
import GuestsPage from './page';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('guests route', () => {
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

    fireEvent.click(screen.getAllByRole('button', { name: /Add to audience/i })[0]);

    expect(screen.getByRole('status')).toHaveTextContent(/added to audience/i);
  });
});
