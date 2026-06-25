import { fireEvent, render, screen, within } from '@testing-library/react';
import CorridorsPage from './page';

describe('corridors route', () => {
  it('renders source-market board controls, ranking, priority tile, and methodology note', () => {
    render(<CorridorsPage />);

    expect(screen.getByRole('heading', { name: 'Source-Market & Corridor Intelligence', level: 1 })).toBeInTheDocument();
    const yearGroup = screen.getByRole('group', { name: /Corridor year/i });
    expect(within(yearGroup).getByRole('button', { name: '2024' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('combobox', { name: /Corridor metric/i })).toHaveValue('arrivals');
    const rankingTable = screen.getByRole('table', { name: /Inbound corridor ranking/i });
    expect(within(rankingTable).getByRole('row', { name: /#1 Korea/i })).toHaveTextContent('2020 base · refresh pending');
    expect(screen.getByText('Merging to the World')).toBeInTheDocument();
    expect(screen.getByText(/10–20% panel/i)).toBeInTheDocument();
    expect(screen.getByText(/directional, indexed/i)).toBeInTheDocument();
  });

  it('updates year and metric controls without losing corridor contrasts', () => {
    render(<CorridorsPage />);

    const yearGroup = screen.getByRole('group', { name: /Corridor year/i });
    fireEvent.click(within(yearGroup).getByRole('button', { name: '2020' }));
    fireEvent.change(screen.getByRole('combobox', { name: /Corridor metric/i }), {
      target: { value: 'spend' },
    });

    expect(within(yearGroup).getByRole('button', { name: '2020' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('combobox', { name: /Corridor metric/i })).toHaveValue('spend');
    const rankingTable = screen.getByRole('table', { name: /Inbound corridor ranking/i });
    const taiwanRow = within(rankingTable).getByRole('row', { name: /Taiwan/i });
    expect(within(taiwanRow).getAllByRole('cell')[1]).toHaveTextContent('Index 144');
    expect(taiwanRow).toHaveTextContent('Gaming 62%');
    expect(within(rankingTable).getByRole('row', { name: /Singapore/i })).toHaveTextContent('Non-gaming 71%');
    expect(screen.getByText(/Japan peaks around festival periods/i)).toBeInTheDocument();
  });
});
