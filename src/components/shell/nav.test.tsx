import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { Nav } from './nav';

let mockPathname = '/';
const scrollIntoView = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('Nav', () => {
  beforeEach(() => {
    mockPathname = '/';
    scrollIntoView.mockClear();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
  });

  it('points the Audience link to the propensity route', () => {
    render(<Nav />);

    expect(screen.getByRole('link', { name: /Audience/i })).toHaveAttribute('href', '/propensity');
  });

  it('points the Market Scan link to the implemented marketscan route', () => {
    render(<Nav />);

    expect(screen.getByRole('link', { name: /Market Scan/i })).toHaveAttribute('href', '/marketscan');
  });

  it('scrolls the active route link into view in the horizontal mobile nav', () => {
    mockPathname = '/activation';

    render(<Nav />);

    expect(screen.getByRole('link', { name: /Activation/i })).toHaveAttribute('aria-current', 'page');
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'center' });
  });
});
