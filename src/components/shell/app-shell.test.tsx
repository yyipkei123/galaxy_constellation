import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AppStateProvider } from '@/store/app-store';
import { AppShell } from './app-shell';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('AppShell', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('keeps route content in the main landmark and hides legacy floating controls on redesigned routes', () => {
    render(
      <AppStateProvider>
        <AppShell>
          <section aria-label="test content">Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Client presentation guidance' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open presenter tour' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open AI insight assistant' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('test content')).toHaveTextContent('Route content');
    expect(screen.getByLabelText('Current CDE refresh')).toHaveTextContent('2026 Q2');
    expect(screen.getByLabelText('Current CDE refresh')).toHaveTextContent('coverage 63%');
    expect(screen.getByText('Constellation')).toBeInTheDocument();
    expect(screen.getByText('Galaxy x Mastercard CDE')).toBeInTheDocument();
    expect(screen.getByText(/Enriched figures are modelled estimates/i)).toBeInTheDocument();
  });

  it('keeps legacy floating controls on routes without the compact CDE AI dock', () => {
    mockPathname = '/guests/MEM-••••3421';

    render(
      <AppStateProvider>
        <AppShell>
          <section aria-label="test content">Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    expect(screen.getByRole('button', { name: 'Open presenter tour' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open AI insight assistant' })).toBeInTheDocument();
  });

  it('orders route content before presentation guidance on small screens', () => {
    render(
      <AppStateProvider>
        <AppShell>
          <section aria-label="test content">Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    expect(screen.getByRole('region', { name: 'Client presentation guidance' }).parentElement).toHaveClass('order-2');
    expect(screen.getByRole('region', { name: 'Client presentation guidance' }).parentElement).toHaveClass('md:order-1');
    expect(screen.getByLabelText('test content').parentElement).toHaveClass('order-1');
    expect(screen.getByLabelText('test content').parentElement).toHaveClass('md:order-2');
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

    expect(sideRail).toHaveClass('lg:w-[236px]');
    expect(sideRail).toHaveClass('lg:sticky');
    expect(sideRail).toHaveClass('lg:top-0');
    expect(sideRail).toHaveClass('lg:h-screen');
    expect(sideRail).not.toHaveClass('galaxy-glass-panel');
    expect(sideRail.querySelector('.galaxy-glass-panel')).not.toBeInTheDocument();
  });

  it('keeps presentation guidance while hiding floating controls in presenter mode', () => {
    render(
      <AppStateProvider>
        <AppShell>
          <section aria-label="test content">Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    expect(screen.getByRole('region', { name: 'Client presentation guidance' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open presenter tour' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open AI insight assistant' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Presenter mode' }));

    expect(screen.getByRole('region', { name: 'Client presentation guidance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Presenter mode' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Open presenter tour' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open AI insight assistant' })).not.toBeInTheDocument();
  });
});
