import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { campaigns } from '@/data';
import { buildMeasurementReadout } from '@/lib/measurement';
import { LiftOverTimeChart } from './lift-over-time-chart';

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|\braw spend\b/i;

beforeAll(() => {
  class SizedResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [{
          target,
          contentRect: {
            x: 0,
            y: 0,
            width: 360,
            height: 260,
            top: 0,
            right: 360,
            bottom: 260,
            left: 0,
            toJSON: () => ({}),
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        }],
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
    get: () => 360,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 260,
  });
});

describe('LiftOverTimeChart', () => {
  it('renders a stable accessible Recharts figure with visible group labels', () => {
    const readout = buildMeasurementReadout(campaigns[0]);
    const { container } = render(<LiftOverTimeChart readout={readout} />);

    expect(screen.getByRole('figure', { name: /Lift over time/i })).toBeInTheDocument();
    expect(screen.getByText('Test group')).toBeVisible();
    expect(screen.getByText('Control holdout')).toBeVisible();
    expect(screen.getByText('Latest lift 6%')).toBeVisible();
    expect(container.firstChild).toHaveClass('min-h-[18rem]');
    expect(container.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });

  it('keeps empty chart copy finite and CDE-safe', () => {
    const readout = {
      ...buildMeasurementReadout(campaigns[0]),
      latestLiftPct: 0,
      latestLiftLabel: '0%',
      testLine: 'Test group: Index 0',
      controlLine: 'Control holdout: Index 0',
      chartData: [],
    };

    const { container } = render(<LiftOverTimeChart readout={readout} />);

    expect(screen.getByText('No weekly measurement points yet.')).toBeVisible();
    expect(screen.getByText('Latest lift 0%')).toBeVisible();
    expect(container.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});
