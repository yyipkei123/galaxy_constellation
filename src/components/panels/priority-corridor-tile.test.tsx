import { render, screen } from '@testing-library/react';
import { priorityCorridor } from '@/data';
import { PriorityCorridorTile } from './priority-corridor-tile';

describe('PriorityCorridorTile', () => {
  it('links Korea recommendation to acquisition with the required tag', () => {
    render(<PriorityCorridorTile corridor={priorityCorridor} />);

    expect(screen.getByRole('heading', { name: /Korea/i })).toBeInTheDocument();
    expect(screen.getByText('Merging to the World')).toBeInTheDocument();
    expect(screen.getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open acquisition recommendation/i })).toHaveAttribute(
      'href',
      '/acquisition?corridor=korea',
    );
  });
});
