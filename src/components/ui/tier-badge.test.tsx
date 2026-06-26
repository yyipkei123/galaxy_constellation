import { render, screen } from '@testing-library/react';
import { TierBadge } from './tier-badge';

const bannedCurrencyPattern = /\b(?:HKD|MOP)\b|\$|元|澳門幣/i;

describe('TierBadge', () => {
  it('renders an accessible Galaxy tier label', () => {
    render(<TierBadge tier="Diamond" />);

    const badge = screen.getByLabelText('Galaxy tier Diamond');
    expect(badge).toHaveTextContent('Diamond');
    expect(badge).not.toHaveTextContent(bannedCurrencyPattern);
  });
});
