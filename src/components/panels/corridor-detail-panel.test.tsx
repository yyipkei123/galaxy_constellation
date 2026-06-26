import { render, screen } from '@testing-library/react';
import { getCorridorById } from '@/data';
import { CorridorDetailPanel } from './corridor-detail-panel';

describe('CorridorDetailPanel', () => {
  it('bridges corridor persona, affinity, and offer to acquisition', () => {
    render(<CorridorDetailPanel corridor={getCorridorById('korea')} />);

    expect(screen.getByRole('heading', { name: /Persona mix/i })).toBeInTheDocument();
    expect(screen.getByText('Entertainment Lover')).toBeInTheDocument();
    expect(screen.getByText(/K-pop adjacent events/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Arena-first Rewards package/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Same-card visit frequency index/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/100 = Mastercard corridor baseline/i)).toBeInTheDocument();
    expect(screen.getByText(/Metric meaning: same-card visit frequency compared with corridor baseline 100/i)).toBeInTheDocument();
    expect(screen.getByText(/Action hint: use stronger visit frequency to support retargeting cadence/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Aggregate CDE signal, no PII/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Japan peaks around festival periods/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Generate campaign content/i })).toHaveAttribute(
      'href',
      '/acquisition?corridor=korea&persona=entertainment_lover',
    );
    expect(screen.getByRole('link', { name: /View on-property segments/i })).toHaveAttribute('href', '/segments');
  });
});
