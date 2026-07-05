import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Home from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('overview route', () => {
  it('wires the overview page into the redesign renderer', () => {
    render(<Home />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'overview');
  });
});
