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
    expect(screen.queryByText(/Japan peaks around festival periods/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Generate campaign content/i })).toHaveAttribute(
      'href',
      '/acquisition?corridor=korea&persona=entertainment_lover',
    );
    expect(screen.getByRole('link', { name: /View on-property segments/i })).toHaveAttribute('href', '/segments');
  });
});
