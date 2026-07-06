import { render, screen, within } from '@testing-library/react';
import { corridors } from '@/data';
import { CorridorRankTable } from './corridor-rank-table';

describe('CorridorRankTable', () => {
  it('renders Korea as rank one with the refresh-pending tag', () => {
    render(<CorridorRankTable corridors={corridors} year="2024" metric="spend" />);

    const table = screen.getByRole('table', { name: /Inbound corridor ranking/i });
    const scrollWrapper = table.parentElement;
    const rootWrapper = scrollWrapper?.parentElement;
    expect(table).toBeInTheDocument();
    expect(rootWrapper).toHaveClass('min-w-0');
    expect(rootWrapper).toHaveClass('max-w-full');
    expect(scrollWrapper).toHaveClass('max-w-full');
    expect(scrollWrapper).toHaveClass('overflow-x-auto');
    expect(scrollWrapper).toHaveClass('overscroll-x-contain');
    within(table).getAllByRole('columnheader').forEach((header) => {
      expect(header).toHaveAttribute('scope', 'col');
    });
    expect(screen.getByRole('row', { name: /#1 Korea/i })).toHaveTextContent('2020 base · refresh pending');
    expect(screen.getByRole('row', { name: /Taiwan/i })).toHaveTextContent('Gaming 62%');
    expect(screen.getByRole('row', { name: /Singapore/i })).toHaveTextContent('Non-gaming 71%');
    expect(screen.getByRole('link', { name: 'Taiwan' })).toHaveAttribute('href', '/corridors/taiwan');
    expect(screen.getByRole('link', { name: 'Taiwan' }).closest('th')).toHaveAttribute('scope', 'row');
    expect(screen.getByText(/Spend intensity index 153/i)).toBeInTheDocument();
    expect(screen.getByText(/Arrival demand index 132/i)).toBeInTheDocument();
    expect(screen.getByText(/Visit frequency index 136/i)).toBeInTheDocument();
    expect(screen.getByText(/100 = Mastercard corridor baseline/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Index 153$/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Metric meaning: spend intensity compares Mastercard CDE corridor spend signal against baseline 100/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Action hint: prioritize high-spend corridors for acquisition offers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Aggregate CDE signal, no PII/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Metric meaning: spend intensity compares Mastercard CDE corridor spend signal/i)[0]).toHaveAttribute('tabindex', '0');
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
