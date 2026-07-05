import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ActivationPage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('activation route', () => {
  it('wires the activation page into the redesign renderer', () => {
    render(<ActivationPage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'activation');
  });
});
