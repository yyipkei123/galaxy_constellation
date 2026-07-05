import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SimulatePage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('simulate route', () => {
  it('wires the simulate page into the redesign renderer', () => {
    render(<SimulatePage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'simulate');
  });
});
