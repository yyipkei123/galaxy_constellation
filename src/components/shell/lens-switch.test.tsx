import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { LensSwitch } from './lens-switch';

let mockPathname = '/wallet';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('LensSwitch', () => {
  beforeEach(() => {
    mockPathname = '/wallet';
  });

  it('links to Wallet retention and Corridors acquisition lenses', () => {
    render(<LensSwitch />);

    expect(screen.getByRole('link', { name: /Wallet Retention/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Corridors Acquisition/i })).toHaveAttribute('href', '/corridors');
  });

  it('marks the corridors lens active for acquisition routes', () => {
    mockPathname = '/acquisition';

    render(<LensSwitch />);

    expect(screen.getByRole('link', { name: /Corridors Acquisition/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Wallet Retention/i })).not.toHaveAttribute('aria-current');
  });
});
