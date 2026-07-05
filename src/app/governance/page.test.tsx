import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import GovernancePage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('governance route', () => {
  it('wires the governance page into the redesign renderer', () => {
    render(<GovernancePage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'governance');
  });
});
