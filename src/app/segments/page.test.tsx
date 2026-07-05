import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SegmentsPage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('segments route', () => {
  it('wires the segments page into the redesign renderer', () => {
    render(<SegmentsPage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'segments');
  });
});
