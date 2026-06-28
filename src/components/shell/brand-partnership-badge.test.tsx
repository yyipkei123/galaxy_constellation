import { render, screen } from '@testing-library/react';
import { BrandPartnershipBadge } from './brand-partnership-badge';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('BrandPartnershipBadge', () => {
  it('renders a compact accessible data partnership badge without currency text', () => {
    const { container } = render(<BrandPartnershipBadge />);

    const badge = screen.getByLabelText('Galaxy Macau and Mastercard data partnership');
    const galaxyLogo = screen.getByRole('img', { name: 'Galaxy Macau' });
    const mastercardLogo = screen.getByRole('img', { name: 'Mastercard' });

    expect(badge).toBeInTheDocument();
    expect(badge).not.toHaveAttribute('href');
    expect(screen.getByText('Data partnership')).toHaveClass('hidden');
    expect(screen.getByText('Data partnership')).toHaveClass('sm:inline');
    expect(galaxyLogo).toHaveAttribute('alt', 'Galaxy Macau');
    expect(mastercardLogo).toHaveAttribute('alt', 'Mastercard');
    expect(galaxyLogo).toHaveAttribute('width', '28');
    expect(mastercardLogo).toHaveAttribute('width', '96');
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });
});
