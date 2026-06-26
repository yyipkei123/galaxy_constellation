import { render, screen } from '@testing-library/react';
import { latestSegments } from '@/data';
import { WalletConstellation } from './wallet-constellation';

describe('WalletConstellation', () => {
  it('renders each segment as a star with opportunity evidence', () => {
    render(<WalletConstellation segments={latestSegments} />);

    expect(screen.getByRole('figure', { name: /Wallet constellation/i })).toBeInTheDocument();
    expect(screen.getByText('Pitch-now cluster')).toBeInTheDocument();
    expect(screen.getByText(latestSegments[0].name)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/opportunity star/i).length).toBeGreaterThanOrEqual(latestSegments.length);
  });

  it('keeps CDE values in index and percentage form', () => {
    render(<WalletConstellation segments={latestSegments} />);

    expect(screen.getByRole('figure', { name: /Wallet constellation/i })).toHaveTextContent(/Index|%/);
    expect(screen.getByRole('figure', { name: /Wallet constellation/i }))
      .not.toHaveTextContent(/\b(?:HKD|MOP)\b|\$|元|澳門幣/i);
  });
});
