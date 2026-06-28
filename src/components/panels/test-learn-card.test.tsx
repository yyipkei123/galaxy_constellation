import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { campaigns } from '@/data';
import { TestLearnCard } from './test-learn-card';

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

describe('TestLearnCard', () => {
  it('renders the campaign measurement readout, chart, and methodology copy', () => {
    const { container } = render(<TestLearnCard campaign={campaigns[0]} />);

    expect(screen.getByRole('article', { name: /Promenade luxury play/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Promenade luxury play' })).toBeInTheDocument();
    expect(screen.getByText('Urban retail connoisseurs / recapture')).toBeVisible();
    expect(screen.getByText('CDE')).toBeVisible();
    expect(screen.getByText('Incremental lift')).toBeVisible();
    expect(screen.getByText('6%')).toBeVisible();
    expect(screen.getByText('Indexed revenue band')).toBeVisible();
    expect(screen.getByText('18-28k equiv./mo')).toBeVisible();
    expect(screen.getByText('iROI Index')).toBeVisible();
    expect(screen.getByText('Index 160')).toBeVisible();
    expect(screen.getByRole('figure', { name: /Lift over time/i })).toBeVisible();
    expect(screen.getByText(/models Mastercard Test & Learn methodology/i)).toBeVisible();
    expect(screen.getByText(/causal lift, not attribution/i)).toBeVisible();
    expect(container.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});
