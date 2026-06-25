import { render, screen, within } from '@testing-library/react';
import { corridors } from '@/data';
import { CorridorRankTable } from './corridor-rank-table';

describe('CorridorRankTable', () => {
  it('renders Korea as rank one with the refresh-pending tag', () => {
    render(<CorridorRankTable corridors={corridors} year="2024" metric="spend" />);

    const table = screen.getByRole('table', { name: /Inbound corridor ranking/i });
    expect(table).toBeInTheDocument();
    within(table).getAllByRole('columnheader').forEach((header) => {
      expect(header).toHaveAttribute('scope', 'col');
    });
    expect(screen.getByRole('row', { name: /#1 Korea/i })).toHaveTextContent('2020 base · refresh pending');
    expect(screen.getByRole('row', { name: /Taiwan/i })).toHaveTextContent('Gaming 62%');
    expect(screen.getByRole('row', { name: /Singapore/i })).toHaveTextContent('Non-gaming 71%');
    expect(screen.getByRole('link', { name: 'Taiwan' })).toHaveAttribute('href', '/corridors/taiwan');
    expect(screen.getByRole('link', { name: 'Taiwan' }).closest('th')).toHaveAttribute('scope', 'row');
    expect(screen.getAllByText(/Index 153/i).length).toBeGreaterThan(0);
  });

  it('renders gaming split selected metric as a percent instead of an index', () => {
    render(<CorridorRankTable corridors={corridors} year="2024" metric="gamingSplit" />);

    const taiwanRow = screen.getByRole('row', { name: /Taiwan/i });
    const cells = within(taiwanRow).getAllByRole('cell');
    const selectedMetricCell = cells[1];
    expect(selectedMetricCell).toHaveTextContent('38%');
    expect(selectedMetricCell).not.toHaveTextContent(/Index/i);
  });
});
