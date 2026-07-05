import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import GuestsPage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('guests route', () => {
  it('wires the guests page into the redesign renderer', () => {
    render(<GuestsPage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'guests');
  });
});
