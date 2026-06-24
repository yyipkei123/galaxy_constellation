import { render, screen } from '@testing-library/react';
import { latestSegments } from '@/data';
import { CategoryStackedBar } from './category-stacked-bar';
import { LeakageFlow } from './leakage-flow';
import { PropensityGauge } from './propensity-gauge';
import { WalletGauge } from './wallet-gauge';

const segment = latestSegments[0];

describe('dashboard chart components', () => {
  it('renders captured and leakage labels for category bars', () => {
    render(<CategoryStackedBar segments={[segment]} category="hospitality" />);
    expect(screen.getByText('Hospitality')).toBeInTheDocument();
    expect(screen.getByText(/captured/i)).toBeInTheDocument();
    expect(screen.getByText(/leakage/i)).toBeInTheDocument();
  });

  it('renders wallet gauge with a CDE chip', () => {
    render(<WalletGauge label="Hospitality wallet capture" capturedPct={28} />);
    expect(screen.getByText('Hospitality wallet capture')).toBeInTheDocument();
    expect(screen.getByText('CDE')).toBeInTheDocument();
  });

  it('renders propensity gauge score', () => {
    render(<PropensityGauge label="Co-Brand Look-Alike" value={0.93} />);
    expect(screen.getByText('Co-Brand Look-Alike')).toBeInTheDocument();
    expect(screen.getByText('0.93')).toBeInTheDocument();
  });

  it('renders leakage flow branches without a raw currency symbol', () => {
    render(<LeakageFlow segment={segment} />);
    expect(screen.getByText(/Captured by Galaxy/i)).toBeInTheDocument();
    expect(screen.getByText(/Competitor hospitality/i)).toBeInTheDocument();
    expect(screen.queryByText(/MOP|HKD|\$/)).not.toBeInTheDocument();
  });
});
