import { render, screen } from '@testing-library/react';
import JourneyPage from './page';

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|\braw spend\b/i;

describe('journey route', () => {
  it('renders the cross-lens loop heading, headline, and linked stages', () => {
    const { container } = render(<JourneyPage />);

    expect(screen.getByRole('heading', { name: 'Acquire, Convert, Grow', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/one connected loop/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Acquire/i })).toHaveAttribute('href', '/corridors/korea');
    expect(screen.getByRole('link', { name: /Convert/i })).toHaveAttribute('href', '/segments');
    expect(screen.getByRole('link', { name: /Capture/i })).toHaveAttribute('href', '/leakage');
    expect(screen.getByRole('link', { name: /Grow/i })).toHaveAttribute('href', '/activation');
    expect(container.textContent).toMatch(/Index \d+/);
    expect(container.textContent).toMatch(/\d+%/);
    expect(container.textContent).toMatch(/\d+-\d+k equiv\.\/mo/);
  });

  it('keeps rendered journey copy CDE-safe', () => {
    const { container } = render(<JourneyPage />);

    expect(container.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});
