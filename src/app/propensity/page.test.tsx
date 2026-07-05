import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PropensityPage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('propensity route', () => {
  it('wires the propensity page into the redesign renderer', () => {
    render(<PropensityPage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'propensity');
  });
});
