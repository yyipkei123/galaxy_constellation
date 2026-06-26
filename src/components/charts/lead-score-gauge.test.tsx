import { render, screen } from '@testing-library/react';
import { LeadScoreGauge } from './lead-score-gauge';

function styleText(element: Element) {
  return Array.from(element.querySelectorAll<HTMLElement>('[style]'))
    .map((node) => node.getAttribute('style') ?? '')
    .join(' ');
}

describe('LeadScoreGauge', () => {
  it('renders an accessible lead score gauge', () => {
    render(<LeadScoreGauge score={91} />);

    const gauge = screen.getByRole('meter', { name: /Lead Score/i });
    expect(gauge).toHaveAttribute('aria-valuemin', '0');
    expect(gauge).toHaveAttribute('aria-valuemax', '100');
    expect(gauge).toHaveAttribute('aria-valuenow', '91');
    expect(screen.getByText('91')).toBeInTheDocument();
  });

  it('clamps non-finite scores out of rendered text and styles', () => {
    render(<LeadScoreGauge score={Number.NaN} />);

    const gauge = screen.getByRole('meter', { name: /Lead Score/i });
    expect(gauge).toHaveAttribute('aria-valuenow', '0');
    expect(gauge).toHaveTextContent('0');
    expect(gauge).not.toHaveTextContent(/NaN|Infinity/);
    expect(styleText(gauge)).not.toMatch(/NaN|Infinity/);
  });
});
