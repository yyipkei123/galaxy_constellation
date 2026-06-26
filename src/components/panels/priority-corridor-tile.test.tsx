import { render, screen } from '@testing-library/react';
import { priorityCorridor } from '@/data';
import { PriorityCorridorTile } from './priority-corridor-tile';

describe('PriorityCorridorTile', () => {
  it('links Korea recommendation to acquisition with the required tag', () => {
    render(<PriorityCorridorTile corridor={priorityCorridor} />);

    expect(screen.getByRole('heading', { name: /Korea/i })).toBeInTheDocument();
    expect(screen.getByText('Merging to the World')).toBeInTheDocument();
    expect(screen.getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getAllByText(/Acquisition priority score/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/100 = Mastercard corridor baseline/i)).toBeInTheDocument();
    expect(screen.getByText(/Metric meaning: priority score blends non-gaming momentum, arrivals growth, visit frequency, and addressability/i)).toBeInTheDocument();
    expect(screen.getByText(/Action hint: open the acquisition recommendation to convert evidence into content/i)).toBeInTheDocument();
    expect(screen.getByText(/Aggregate CDE signal, no PII/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open acquisition recommendation/i })).toHaveAttribute(
      'href',
      '/acquisition?corridor=korea',
    );
  });
});
