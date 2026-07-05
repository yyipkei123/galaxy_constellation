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

  it('renders prototype section headers and route link contracts', () => {
    render(<Nav />);

    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Audience')).toBeInTheDocument();
    expect(screen.getByText('Act')).toBeInTheDocument();
    expect(screen.getByText('Measure')).toBeInTheDocument();
    expect(screen.getByText('Govern')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveTextContent('01');
    expect(screen.getByRole('link', { name: 'Journey' })).toHaveTextContent('02');
    expect(screen.getByRole('link', { name: 'Propensity' })).toHaveAttribute('href', '/propensity');
    expect(screen.getByRole('link', { name: 'Market Scan' })).toHaveAttribute('href', '/marketscan');
  });

  it('shows Guests in the wallet lens navigation', () => {
    render(<Nav />);

    expect(screen.getByRole('link', { name: /Guests/i })).toHaveAttribute('href', '/guests');
  });

  it('scrolls the active route link into view in the horizontal mobile nav', () => {
    mockPathname = '/activation';

    render(<Nav />);

    expect(screen.getByRole('link', { name: /Activation/i })).toHaveAttribute('aria-current', 'page');
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'center' });
  });

  it('swaps to acquisition nav links on corridor routes', () => {
    mockPathname = '/corridors';

    render(<Nav />);

    expect(screen.getByRole('link', { name: /Source Markets/i })).toHaveAttribute('href', '/corridors');
    expect(screen.getByRole('link', { name: /Acquisition/i })).toHaveAttribute('href', '/acquisition');
    expect(screen.queryByRole('link', { name: /^Wallet$/i })).not.toBeInTheDocument();
  });

  it('treats the guests route as part of the wallet lens', () => {
    mockPathname = '/guests';

    render(<Nav />);

    expect(screen.getByRole('link', { name: /Guests/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Cotai wallet view')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Source Markets/i })).not.toBeInTheDocument();
  });

  it('keeps compact mobile labels while preserving full accessible route names', () => {
    render(<Nav />);

    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Activation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Market Scan' })).toBeInTheDocument();
    expect(screen.getByText('Activate')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Market')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders Open Design numeric nav indexes on desktop labels', () => {
    render(<Nav />);

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveTextContent('01');
    expect(screen.getByRole('link', { name: 'Wallet' })).toHaveTextContent('03');
    expect(screen.getByText('Cotai wallet view')).toBeInTheDocument();
  });
});
