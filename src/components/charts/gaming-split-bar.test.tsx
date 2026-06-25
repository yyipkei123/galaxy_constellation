import { render, screen } from '@testing-library/react';
import { getCorridorById } from '@/data';
import { GamingSplitBar } from './gaming-split-bar';

describe('GamingSplitBar', () => {
  it('renders aggregate gaming and non-gaming percentages', () => {
    render(<GamingSplitBar corridor={getCorridorById('taiwan')} />);

    expect(screen.getByLabelText('Gaming 62%')).toHaveTextContent(/Gaming\s+62%/);
    expect(screen.getByLabelText('Non-gaming 38%')).toHaveTextContent(/Non-gaming\s+38%/);
    screen.getAllByText('CDE').forEach((chip) => {
      expect(chip.closest('.sr-only')).toBeNull();
      expect(chip.closest('[aria-hidden="true"]')).toBeNull();
    });
    expect(screen.getByRole('img', { name: /Taiwan gaming split/i })).toBeInTheDocument();
  });

  it('clamps split segment widths to valid percentages', () => {
    render(
      <GamingSplitBar
        corridor={{ ...getCorridorById('taiwan'), gamingSharePct: -12, nonGamingSharePct: 128 }}
      />,
    );

    const [gamingSegment, nonGamingSegment] = Array.from(
      screen.getByRole('img', { name: /Taiwan gaming split/i }).children,
    );
    expect(gamingSegment).toHaveStyle({ width: '0%' });
    expect(nonGamingSegment).toHaveStyle({ width: '100%' });
  });
});
