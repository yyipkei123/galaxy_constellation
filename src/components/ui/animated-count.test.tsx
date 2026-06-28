import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnimatedCount } from './animated-count';

describe('AnimatedCount', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the final value immediately for accessible text', () => {
    render(<AnimatedCount value={64} suffix="%" ariaLabel="Wallet headroom" />);

    expect(screen.getByLabelText('Wallet headroom')).toHaveTextContent('64%');
  });

  it('formats index values without currency text', () => {
    render(<AnimatedCount value={128} prefix="CDE signal " ariaLabel="Opportunity signal" />);

    expect(screen.getByLabelText('Opportunity signal')).toHaveTextContent('CDE signal 128');
    expect(screen.getByLabelText('Opportunity signal')).not.toHaveTextContent(/HKD|MOP|\$|元|澳門幣/i);
  });

  it('never renders non-finite values in initial markup', () => {
    const markup = renderToString(
      <AnimatedCount value={Number.NaN} prefix="CDE signal " ariaLabel="Opportunity signal" />,
    );

    expect(markup).toContain('CDE signal 0');
    expect(markup).not.toMatch(/NaN|Infinity/);
  });

  it.each([0, -100, Number.NaN, Number.POSITIVE_INFINITY])(
    'renders the final value without scheduling animation for invalid duration %s',
    (durationMs) => {
      const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');

      render(
        <AnimatedCount value={42} durationMs={durationMs} ariaLabel="Opportunity score" />,
      );

      expect(screen.getByLabelText('Opportunity score')).toHaveTextContent('42');
      expect(screen.getByLabelText('Opportunity score')).not.toHaveTextContent(/NaN|Infinity/);
      expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    },
  );
});
