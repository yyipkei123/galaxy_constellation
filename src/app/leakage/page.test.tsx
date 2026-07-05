import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LeakagePage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('leakage route', () => {
  it('wires the leakage page into the redesign renderer', () => {
    render(<LeakagePage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'leakage');
  });
});
