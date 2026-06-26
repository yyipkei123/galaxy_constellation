import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { AnimatedCount } from './animated-count';

describe('AnimatedCount', () => {
  it('renders the final value immediately for accessible text', () => {
    render(<AnimatedCount value={64} suffix="%" ariaLabel="Wallet headroom" />);

    expect(screen.getByLabelText('Wallet headroom')).toHaveTextContent('64%');
  });

  it('formats index values without currency text', () => {
    render(<AnimatedCount value={128} prefix="Index " ariaLabel="Opportunity index" />);

    expect(screen.getByLabelText('Opportunity index')).toHaveTextContent('Index 128');
    expect(screen.getByLabelText('Opportunity index')).not.toHaveTextContent(/HKD|MOP|\$|元|澳門幣/i);
  });

  it('never renders non-finite values in initial markup', () => {
    const markup = renderToString(
      <AnimatedCount value={Number.NaN} prefix="Index " ariaLabel="Opportunity index" />,
    );

    expect(markup).toContain('Index 0');
    expect(markup).not.toMatch(/NaN|Infinity/);
  });
});
