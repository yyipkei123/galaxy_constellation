import { render, screen } from '@testing-library/react';
import { SectionJumpNav } from './section-jump-nav';

describe('SectionJumpNav', () => {
  it('renders section links with a compact analytics navigation label', () => {
    render(
      <SectionJumpNav
        label="Wallet sections"
        items={[
          { id: 'wallet-summary', label: 'Summary' },
          { id: 'wallet-drivers', label: 'Drivers' },
          { id: 'wallet-actions', label: 'Actions' },
        ]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Wallet sections' });

    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Summary' })).toHaveAttribute('href', '#wallet-summary');
    expect(screen.getByRole('link', { name: 'Drivers' })).toHaveAttribute('href', '#wallet-drivers');
    expect(screen.getByRole('link', { name: 'Actions' })).toHaveAttribute('href', '#wallet-actions');
  });

  it('marks the current item when currentId is supplied', () => {
    render(
      <SectionJumpNav
        label="Customer 360 sections"
        currentId="guest-brief"
        items={[
          { id: 'guest-brief', label: 'Brief' },
          { id: 'guest-history', label: 'History' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Brief' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'History' })).not.toHaveAttribute('aria-current');
  });

  it('keeps sticky gutters aligned with AppShell responsive padding', () => {
    render(
      <SectionJumpNav
        label="Dashboard sections"
        items={[
          { id: 'executive-summary', label: 'Executive summary' },
          { id: 'portfolio-risk', label: 'Portfolio risk' },
        ]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Dashboard sections' });

    expect(nav).toHaveClass('-mx-3');
    expect(nav).toHaveClass('px-3');
    expect(nav).toHaveClass('sm:-mx-5');
    expect(nav).toHaveClass('sm:px-5');
    expect(nav).toHaveClass('md:-mx-[26px]');
    expect(nav).toHaveClass('md:px-[26px]');
    expect(nav).toHaveClass('lg:static');
    expect(nav).toHaveClass('lg:mx-0');
    expect(nav).toHaveClass('lg:rounded-lg');
    expect(nav).toHaveClass('lg:border');
    expect(nav).toHaveClass('lg:bg-galaxy-charcoal/60');
    expect(nav).toHaveClass('lg:px-3');
    expect(nav).not.toHaveClass('-mx-4');
    expect(nav).not.toHaveClass('px-4');
    expect(nav).not.toHaveClass('md:-mx-8');
    expect(nav).not.toHaveClass('md:px-8');
  });
});
