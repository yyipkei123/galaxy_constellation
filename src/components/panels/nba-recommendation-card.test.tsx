import { render, screen } from '@testing-library/react';
import { guests, type NbaRec } from '@/data';
import { NbaRecommendationCard } from './nba-recommendation-card';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('NbaRecommendationCard', () => {
  it('renders a next-best-action offer with uplift, channel, and confidence', () => {
    const rec = guests[0].nextBestActions[0];
    const { container } = render(<NbaRecommendationCard rec={rec} />);

    expect(screen.getByRole('heading', { name: rec.offer })).toBeInTheDocument();
    expect(screen.getByText(rec.rationale)).toBeInTheDocument();
    expect(screen.getByText(/CDE uplift signal \d+/)).toBeInTheDocument();
    expect(screen.getByText(rec.channel)).toBeInTheDocument();
    expect(screen.getByText(`${Math.round(rec.confidence * 100)}%`)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('sanitizes malformed recommendation copy and numeric values', () => {
    const malformedRec = {
      offer: 'HKD $ suite offer',
      rationale: 'MOP value with Infinity uplift',
      upliftIndex: Number.POSITIVE_INFINITY,
      channel: 'host HKD',
      confidence: Number.NaN,
    } as unknown as NbaRec;

    const { container } = render(<NbaRecommendationCard rec={malformedRec} />);

    expect(screen.getByRole('heading', { name: 'Host-curated invitation' })).toBeInTheDocument();
    expect(screen.getByText(/Galaxy and CDE signals indicate a pitch-ready opportunity/i)).toBeInTheDocument();
    expect(screen.getByText('CDE uplift signal 0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });
});
