import { render, screen } from '@testing-library/react';
import { MetricTile } from './metric-tile';

describe('MetricTile', () => {
  it('renders label, value, and detail using dense dashboard styling', () => {
    render(
      <MetricTile
        label="Average leakage"
        value="53%"
        detail="Market remainder visible through CDE enrichment."
      />,
    );

    expect(screen.getByText('Average leakage')).toBeInTheDocument();
    expect(screen.getByText('53%')).toHaveClass('font-mono');
    expect(screen.getByText(/Market remainder/i)).toBeInTheDocument();
  });

  it('omits the detail node when no detail is provided', () => {
    render(<MetricTile label="Top wallet gap" value="Retail-Luxury" />);

    expect(screen.getByText('Top wallet gap')).toBeInTheDocument();
    expect(screen.getByText('Retail-Luxury').nextElementSibling).toBeNull();
  });
});
