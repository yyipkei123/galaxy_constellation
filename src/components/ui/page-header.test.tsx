import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders a compact analytical header with sans title styling', () => {
    render(
      <PageHeader
        variant="compact"
        eyebrow="Wallet analytics"
        title="Share of Wallet"
        description="Prioritize wallet gaps by segment, category, and channel signal."
        aside={<p>2026 Q2</p>}
      />,
    );

    const region = screen.getByRole('region', { name: 'Share of Wallet' });
    expect(region).toHaveAttribute('data-variant', 'compact');
    expect(screen.getByRole('heading', { name: 'Share of Wallet', level: 1 })).toHaveClass('font-sans');
    expect(screen.getByText('Wallet analytics')).toBeInTheDocument();
    expect(screen.getByText('2026 Q2')).toBeInTheDocument();
  });

  it('renders the hero variant with display title styling for overview only', () => {
    render(
      <PageHeader
        variant="hero"
        eyebrow="Guest wallet intelligence"
        title="Galaxy Constellation"
        description="Reveal captured wallet and CDE-modeled headroom."
      />,
    );

    const region = screen.getByRole('region', { name: 'Galaxy Constellation' });
    expect(region).toHaveAttribute('data-variant', 'hero');
    expect(screen.getByRole('heading', { name: 'Galaxy Constellation', level: 1 })).toHaveClass('font-display');
  });

  it('links each rendered header region to its own heading', () => {
    render(
      <>
        <PageHeader title="Wallet coverage" description="Captured wallet by segment." />
        <PageHeader title="Leakage pressure" description="Market remainder by category." />
      </>,
    );

    const walletRegion = screen.getByRole('region', { name: 'Wallet coverage' });
    const leakageRegion = screen.getByRole('region', { name: 'Leakage pressure' });
    const walletHeading = screen.getByRole('heading', { name: 'Wallet coverage', level: 1 });
    const leakageHeading = screen.getByRole('heading', { name: 'Leakage pressure', level: 1 });

    expect(walletRegion).toHaveAttribute('aria-labelledby', walletHeading.id);
    expect(leakageRegion).toHaveAttribute('aria-labelledby', leakageHeading.id);
    expect(walletHeading.id).not.toBe(leakageHeading.id);
  });
});
