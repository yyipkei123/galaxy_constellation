import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import JourneyPage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('journey route', () => {
  it('wires the journey page into the redesign renderer', () => {
    render(<JourneyPage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'journey');
  });
});
