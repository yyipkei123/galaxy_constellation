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
    expect(screen.getByRole('cell', { name: 'Japan Mar travel intensity index 136 vs this corridor monthly baseline 100' })).toHaveAttribute(
      'aria-label',
      'Japan Mar travel intensity index 136 vs this corridor monthly baseline 100',
    );
    expect(screen.getAllByText(/Metric meaning: monthly travel intensity compared with this corridor baseline/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Action hint: align campaign timing to high-intensity months/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Aggregate CDE signal, no PII/i).length).toBeGreaterThan(0);
  });

  it('can hide board-level pattern annotations for embedded detail views', () => {
    render(<SeasonalityHeatmap corridors={[corridors[0]]} showNotes={false} />);

    expect(screen.getByRole('table', { name: /Corridor seasonality heatmap/i })).toBeInTheDocument();
    expect(screen.queryByText(/Japan peaks around festival periods/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Southeast Asia clusters on long weekends/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hong Kong volume softening/i)).not.toBeInTheDocument();
  });
});
