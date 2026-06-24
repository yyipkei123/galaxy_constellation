import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import { TopBar } from './top-bar';

describe('TopBar', () => {
  it('shows active CDE methodology metrics and defaults the quarter selector to Q2 2026', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByText('7 active CDE metrics')).toBeInTheDocument();
    expect(screen.getByText('Matched coverage 63%')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /reporting quarter/i })).toHaveValue('2026-q2');
    expect(screen.getByRole('option', { name: '2026 Q2' })).toBeInTheDocument();
  });

  it('updates the selected reporting quarter from the accessible selector', async () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.change(screen.getByRole('combobox', { name: /reporting quarter/i }), {
      target: { value: '2026-q1' },
    });

    expect(screen.getByRole('combobox', { name: /reporting quarter/i })).toHaveValue('2026-q1');
  });
});
