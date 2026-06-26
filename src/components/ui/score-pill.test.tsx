import { render, screen } from '@testing-library/react';
import { ScorePill } from './score-pill';

const bannedCurrencyPattern = /\b(?:HKD|MOP)\b|\$|元|澳門幣/i;

describe('ScorePill', () => {
  it('renders a finite accessible lead score', () => {
    render(<ScorePill score={88} label="Lead Score" />);

    const score = screen.getByLabelText('Lead Score 88 out of 100');
    expect(score).toHaveTextContent('88');
    expect(score).not.toHaveTextContent(bannedCurrencyPattern);
  });

  it('clamps unsafe score values to finite labels', () => {
    render(
      <>
        <ScorePill score={Number.POSITIVE_INFINITY} label="Infinite Score" />
        <ScorePill score={132} label="Overflow Score" />
      </>,
    );

    expect(screen.getByLabelText('Infinite Score 0 out of 100')).toHaveTextContent('0');
    expect(screen.getByLabelText('Overflow Score 100 out of 100')).toHaveTextContent('100');
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });
});
