import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MarketScanPage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('market scan route', () => {
  it('wires the market scan page into the redesign renderer', () => {
    render(<MarketScanPage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'marketscan');
  });
});
