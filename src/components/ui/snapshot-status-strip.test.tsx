import { render, screen } from '@testing-library/react';
import { methodology } from '@/data';
import { SnapshotStatusStrip } from './snapshot-status-strip';

describe('SnapshotStatusStrip', () => {
  it('renders quarter, refresh, basis, and coverage without currency text', () => {
    const { container } = render(
      <SnapshotStatusStrip
        quarterLabel="2026 Q2"
        methodology={methodology}
        context="Wallet model"
      />,
    );

    expect(screen.getByRole('group', { name: 'CDE snapshot status' })).toBeInTheDocument();
    expect(screen.getByText('2026 Q2 snapshot')).toBeInTheDocument();
    expect(screen.getByText('Quarterly refresh')).toBeInTheDocument();
    expect(screen.getByText('63% matched coverage')).toBeInTheDocument();
    expect(screen.getByText(`${methodology.basis} basis`)).toBeInTheDocument();
    expect(screen.getByText('Wallet model')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });
});
