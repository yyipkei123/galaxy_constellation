import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { AppStateProvider } from '@/store/app-store';
import { StoryActionStrip } from './story-action-strip';

let mockPathname = '/wallet';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('StoryActionStrip', () => {
  beforeEach(() => {
    mockPathname = '/wallet';
  });

  it('shows wallet guidance with the next target-segments action', () => {
    render(
      <AppStateProvider>
        <StoryActionStrip />
      </AppStateProvider>,
    );

    const strip = screen.getByRole('region', { name: 'Client presentation guidance' });
    expect(strip).toHaveAttribute('data-presenter-mode', 'off');
    expect(within(strip).getByText('Gap proof')).toBeInTheDocument();
    expect(within(strip).getByText('Wallet')).toBeInTheDocument();
    expect(within(strip).getByText('Observation')).toBeInTheDocument();
    expect(within(strip).getByText('Recommended action')).toBeInTheDocument();
    expect(within(strip).getByText(/Share-of-wallet evidence proves where Galaxy captures spend/i)).toBeInTheDocument();
    expect(within(strip).getByRole('link', { name: /Open target segments/i })).toHaveAttribute('href', '/segments');
  });

  it('shows dynamic Customer 360 guidance with the audience-build action', () => {
    mockPathname = '/guests/MEM-%E2%80%A2%E2%80%A2%E2%80%A2%E2%80%A23421';

    render(
      <AppStateProvider>
        <StoryActionStrip />
      </AppStateProvider>,
    );

    const strip = screen.getByRole('region', { name: 'Client presentation guidance' });
    expect(within(strip).getByText('Human proof point')).toBeInTheDocument();
    expect(within(strip).getByText('Customer 360')).toBeInTheDocument();
    expect(within(strip).getByRole('link', { name: /Build target audience/i })).toHaveAttribute('href', '/propensity');
  });

  it('uses a distinct next-action label for corridor detail guidance', () => {
    mockPathname = '/corridors/korea';

    render(
      <AppStateProvider>
        <StoryActionStrip />
      </AppStateProvider>,
    );

    const strip = screen.getByRole('region', { name: 'Client presentation guidance' });
    expect(within(strip).getByText('Corridor proof')).toBeInTheDocument();
    expect(within(strip).getByRole('link', { name: /Open acquisition hand-off/i })).toHaveAttribute(
      'href',
      '/acquisition?corridor=korea',
    );
    expect(within(strip).queryByRole('link', { name: /Generate campaign content/i })).not.toBeInTheDocument();
  });
});
