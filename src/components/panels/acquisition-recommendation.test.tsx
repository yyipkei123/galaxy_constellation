import { render, screen } from '@testing-library/react';
import { getCorridorById, priorityCorridor } from '@/data';
import { AcquisitionRecommendation } from './acquisition-recommendation';

describe('AcquisitionRecommendation', () => {
  it('renders Korea rationale, index, band, and refresh-pending tag', () => {
    render(<AcquisitionRecommendation corridor={priorityCorridor} />);

    expect(screen.getByRole('heading', { name: /Korea/i })).toBeInTheDocument();
    expect(screen.getByText(/Merging to the World/i)).toBeInTheDocument();
    expect(screen.getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByText(/22-36k equiv.\/mo/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Corridor priority score/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/100 = Mastercard corridor baseline/i)).toBeInTheDocument();
    expect(screen.getByText(/Metric meaning: priority score blends non-gaming momentum, arrivals growth, visit frequency, and addressability/i)).toBeInTheDocument();
    expect(screen.getByText(/Action hint: use this as the hand-off evidence for acquisition planning/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Aggregate CDE signal, no PII/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/strong signal, validating/i)).toBeInTheDocument();
  });

  it('uses rank-aware copy for selected non-priority corridors', () => {
    render(<AcquisitionRecommendation corridor={getCorridorById('japan')} />);

    expect(screen.getByRole('heading', { name: /Japan/i })).toBeInTheDocument();
    expect(screen.getByText('Rank #3')).toBeInTheDocument();
    expect(screen.getByText('Why this corridor')).toBeInTheDocument();
    expect(screen.queryByText('Why #1')).not.toBeInTheDocument();
    expect(screen.queryByText(/first acquisition corridor/i)).not.toBeInTheDocument();
  });
});
