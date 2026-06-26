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
});
