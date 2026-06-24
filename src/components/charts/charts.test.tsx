import { render, screen } from '@testing-library/react';
import { beforeAll } from 'vitest';
import { latestSegments } from '@/data';
import { CategoryStackedBar } from './category-stacked-bar';
import { ChannelDonut } from './channel-donut';
import { LeakageFlow } from './leakage-flow';
import { PropensityGauge } from './propensity-gauge';
import { SowSovScatter } from './sow-sov-scatter';
import { SpendRadar } from './spend-radar';
import { WalletGauge } from './wallet-gauge';

const segment = latestSegments[0];

beforeAll(() => {
  class SizedResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: {
              x: 0,
              y: 0,
              width: 320,
              height: 240,
              top: 0,
              right: 320,
              bottom: 240,
              left: 0,
              toJSON: () => ({}),
            },
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          },
        ],
        this,
      );
    }

    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: SizedResizeObserver,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 320,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 240,
  });
});

describe('dashboard chart components', () => {
  it('renders captured and leakage labels for category bars', () => {
    render(<CategoryStackedBar segments={[segment]} category="hospitality" />);
    expect(screen.getByText('Hospitality')).toBeInTheDocument();
    expect(screen.getByText(/captured/i)).toBeInTheDocument();
    expect(screen.getByText(/leakage/i)).toBeInTheDocument();
  });

  it('renders an empty category bar without NaN values', () => {
    render(<CategoryStackedBar segments={[]} category="hospitality" />);
    expect(screen.getByText('0% captured / 100% leakage')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Hospitality captured 0%')).toHaveStyle({ width: '0%' });
  });

  it('renders wallet gauge with a CDE chip', () => {
    render(<WalletGauge label="Hospitality wallet capture" capturedPct={28} />);
    expect(screen.getByText('Hospitality wallet capture')).toBeInTheDocument();
    expect(screen.getByText('CDE')).toBeInTheDocument();
  });

  it('clamps out-of-range wallet gauge percentages', () => {
    render(<WalletGauge label="Hospitality wallet capture" capturedPct={125} />);
    expect(screen.getByText('100% captured')).toBeInTheDocument();
    expect(screen.getByText('0% leakage')).toBeInTheDocument();
    expect(screen.getByLabelText('Hospitality wallet capture: 100% captured, 0% leakage')).toHaveStyle({
      width: '100%',
    });
  });

  it('renders propensity gauge score', () => {
    render(<PropensityGauge label="Co-Brand Look-Alike" value={0.93} />);
    expect(screen.getByText('Co-Brand Look-Alike')).toBeInTheDocument();
    expect(screen.getByText('0.93')).toBeInTheDocument();
  });

  it('clamps propensity gauge percentiles and exposes an accessible label', () => {
    render(<PropensityGauge label="Co-Brand Look-Alike" value={1.45} />);
    expect(screen.getByText('100th percentile signal')).toBeInTheDocument();
    expect(screen.getByLabelText('Co-Brand Look-Alike propensity: 100th percentile signal')).toHaveStyle({
      width: '100%',
    });
  });

  it('renders leakage flow branches without a raw currency symbol', () => {
    render(<LeakageFlow segment={segment} />);
    expect(screen.getByText(/Captured by Galaxy/i)).toBeInTheDocument();
    expect(screen.getByText(/Competitor hospitality/i)).toBeInTheDocument();
    expect(screen.queryByText(/MOP|HKD|\$/)).not.toBeInTheDocument();
  });

  it('exposes accessible labels for leakage branch bars', () => {
    render(<LeakageFlow segment={segment} />);
    expect(screen.getByLabelText(/Competitor hospitality leakage \d+%/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Off-property luxury retail leakage \d+%/i)).toBeInTheDocument();
  });

  it('clamps out-of-range channel donut percentages and exposes an accessible summary', () => {
    render(<ChannelDonut onlinePct={140} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByLabelText('Channel split: 100% online payment share, 0% physical payment share')).toBeInTheDocument();
  });

  it('smoke renders Recharts wrappers', () => {
    render(
      <>
        <SowSovScatter segments={[segment]} />
        <SpendRadar segment={segment} />
        <ChannelDonut onlinePct={segment.metrics.channelShareOnlinePct} />
      </>,
    );

    expect(screen.getByLabelText(/Share of wallet versus share of visits/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Spend index radar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Channel split/i)).toBeInTheDocument();
  });
});
