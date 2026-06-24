import { render, screen } from '@testing-library/react';
import MarketScanPage from './page';

describe('market scan route', () => {
  it('renders the illustrative market scan companion board', () => {
    render(<MarketScanPage />);

    expect(screen.getByRole('heading', { name: 'Market Scan' })).toBeInTheDocument();
    expect(screen.getByText(/illustrative market-scan companion/i)).toBeInTheDocument();
    expect(screen.getAllByText(/competitor calendar/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/social sentiment/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/share of voice/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('heading', { name: 'Share-of-voice gap watch' })).toBeInTheDocument();
    expect(screen.getByText(/Galaxy luxury hospitality conversation trails/i)).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
