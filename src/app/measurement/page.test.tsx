import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MeasurementPage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('measurement route', () => {
  it('wires the measurement page into the redesign renderer', () => {
    render(<MeasurementPage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'measurement');
  });
});
