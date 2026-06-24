import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Nav } from './nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Nav', () => {
  it('points the Audience link to the propensity route', () => {
    render(<Nav />);

    expect(screen.getByRole('link', { name: /Audience/i })).toHaveAttribute('href', '/propensity');
  });

  it('points the Market Scan link to the implemented marketscan route', () => {
    render(<Nav />);

    expect(screen.getByRole('link', { name: /Market Scan/i })).toHaveAttribute('href', '/marketscan');
  });
});
