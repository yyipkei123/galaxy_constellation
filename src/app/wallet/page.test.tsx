import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import WalletPage from './page';

vi.mock('@/components/redesign/constellation-redesign-route', () => ({
  ConstellationRedesignRoute: ({ pageId }: { pageId: string }) => (
    <section aria-label="Redesign route" data-page-id={pageId} />
  ),
}));

describe('wallet route', () => {
  it('wires the wallet page into the redesign renderer', () => {
    render(<WalletPage />);

    expect(screen.getByRole('region', { name: 'Redesign route' })).toHaveAttribute('data-page-id', 'wallet');
  });
});
