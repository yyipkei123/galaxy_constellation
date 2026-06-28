import { render, screen, within } from '@testing-library/react';
import type { ScenarioImpact } from '@/data';
import { ScenarioImpactConstellation } from './scenario-impact-constellation';

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;

describe('ScenarioImpactConstellation', () => {
  it('renders populated segment shifts with before and after index values', () => {
    const impact: ScenarioImpact = {
      walletUpliftIndex: 24,
      opportunityIndexDelta: 13,
      pitchNowGuestsK: 7,
      projectedBand: '6-11k equiv./mo',
      constellationShift: [
        {
          segmentId: 'diamond-high-rollers',
          label: 'Diamond High-Rollers',
          beforeIndex: 118,
          afterIndex: 139,
        },
        {
          segmentId: 'cosmopolitan-connoisseurs',
          label: 'Cosmopolitan Connoisseurs',
          beforeIndex: 132,
          afterIndex: 151,
        },
      ],
    };

    render(<ScenarioImpactConstellation impact={impact} />);

    const figure = screen.getByRole('figure', { name: /Scenario constellation shift/i });
    expect(figure).toBeInTheDocument();
    expect(within(figure).getByText('Diamond High-Rollers')).toBeInTheDocument();
    expect(within(figure).getByText('Cosmopolitan Connoisseurs')).toBeInTheDocument();
    expect(within(figure).getAllByText('Before')).toHaveLength(2);
    expect(within(figure).getAllByText('After')).toHaveLength(2);
    expect(within(figure).getByText('CDE before signal 118')).toBeInTheDocument();
    expect(within(figure).getByText('CDE after signal 151')).toBeInTheDocument();
    expect(figure.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(figure.textContent).not.toMatch(/NaN|Infinity/);
  });

  it('renders a useful finite empty state when no constellation shift exists', () => {
    const impact: ScenarioImpact = {
      walletUpliftIndex: 0,
      opportunityIndexDelta: 0,
      pitchNowGuestsK: 0,
      projectedBand: '0-0k equiv./mo',
      constellationShift: [],
    };

    render(<ScenarioImpactConstellation impact={impact} />);

    const figure = screen.getByRole('figure', { name: /Scenario constellation shift/i });
    expect(within(figure).getByText('No scenario shift available yet.')).toBeInTheDocument();
    expect(within(figure).getByText(/Choose a segment and adjust the levers/i)).toBeInTheDocument();
    expect(within(figure).getByText('CDE baseline signal 0')).toBeInTheDocument();
    expect(figure.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(figure.textContent).not.toMatch(/NaN|Infinity/);
  });
});
