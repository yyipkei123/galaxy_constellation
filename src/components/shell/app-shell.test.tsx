import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AppStateProvider } from '@/store/app-store';
import { AppShell } from './app-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('AppShell', () => {
  it('keeps route content in the main landmark and mounts the assistant launcher globally', () => {
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
  });
});
