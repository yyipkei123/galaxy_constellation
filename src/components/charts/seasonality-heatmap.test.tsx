import { render, screen, within } from '@testing-library/react';
import { corridors } from '@/data';
import { SeasonalityHeatmap } from './seasonality-heatmap';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

describe('SeasonalityHeatmap', () => {
  it('renders month cells and required pattern annotations', () => {
    render(<SeasonalityHeatmap corridors={corridors} />);

    const table = screen.getByRole('table', { name: /Corridor seasonality heatmap/i });
    expect(table).toBeInTheDocument();
    const headerRow = table.querySelector('thead tr');
    expect(headerRow).not.toBeNull();
    const columnHeaders = within(headerRow as HTMLElement).getAllByRole('columnheader').map((header) => header.textContent);
    expect(columnHeaders).toEqual(['Corridor', ...months]);
    within(headerRow as HTMLElement).getAllByRole('columnheader').forEach((header) => {
      expect(header).toHaveAttribute('scope', 'col');
    });
    expect(screen.getByRole('rowheader', { name: 'Japan' })).toHaveAttribute('scope', 'row');
    expect(screen.getByText(/Japan peaks around festival periods/i)).toBeInTheDocument();
    expect(screen.getByText(/Southeast Asia clusters on long weekends/i)).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Japan Mar index 136' })).toHaveAttribute(
      'aria-label',
      'Japan Mar index 136',
    );
  });
});
