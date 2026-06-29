import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AppStateProvider } from '@/store/app-store';
import { AppShell } from './app-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('AppShell', () => {
  it('keeps route content in the main landmark and mounts global affordances', () => {
    render(
      <AppStateProvider>
        <AppShell>
          <section aria-label="test content">Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open AI insight assistant' })).toBeInTheDocument();
    expect(screen.getByLabelText('test content')).toHaveTextContent('Route content');
    expect(screen.getByLabelText('Current CDE refresh')).toHaveTextContent('2026 Q2');
    expect(screen.getByText('Galaxy Constellation')).toBeInTheDocument();
    expect(screen.getByText('Galaxy Macau x Mastercard CDE')).toBeInTheDocument();
    expect(screen.getByText(/Enriched figures are modelled estimates/i)).toBeInTheDocument();
  });

  it('keeps the side rail sticky without applying glass positioning to the aside', () => {
    render(
      <AppStateProvider>
        <AppShell>
          <section aria-label="test content">Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    const sideRail = screen.getByTestId('app-shell-side-rail');

    expect(sideRail).toHaveClass('lg:sticky');
    expect(sideRail).toHaveClass('lg:top-0');
    expect(sideRail).toHaveClass('lg:h-screen');
    expect(sideRail).not.toHaveClass('galaxy-glass-panel');
    expect(sideRail.querySelector('.galaxy-glass-panel')).toBeInTheDocument();
  });
});
