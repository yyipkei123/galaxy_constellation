import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConstellationRedesignScreen } from './constellation-redesign-screen';

const bannedCdePattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend|NaN|Infinity/i;

function renderScreen(pageId = 'overview' as const) {
  return render(
    <ConstellationRedesignScreen
      pageId={pageId}
      quarterLabel="2026 Q2"
      coveragePct={63}
      activeMetricCount={7}
    />,
  );
}

describe('ConstellationRedesignScreen', () => {
  it('renders the prototype overview and selected finding', () => {
    const { container } = renderScreen('overview');

    expect(screen.getByRole('region', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pitch Cosmopolitan Connoisseurs first.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wallet headroom constellation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i })).toBeInTheDocument();
    expect(screen.getByText('CDE index legend')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCdePattern);
  });

  it('updates selected finding when a constellation node is clicked', () => {
    renderScreen('overview');

    fireEvent.click(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i }));

    const selectedFinding = screen.getByRole('region', { name: 'Selected finding' });
    expect(within(selectedFinding).getByText('Premium Mass Weekenders')).toBeInTheDocument();
    expect(within(selectedFinding).getByText('48% Dining')).toBeInTheDocument();
  });

  it('renders each route screen with the matching prototype label', () => {
    const routeLabels = [
      ['journey', 'Journey'],
      ['wallet', 'Wallet'],
      ['segments', 'Segments'],
      ['guests', 'Guests'],
      ['leakage', 'Leakage'],
      ['propensity', 'Propensity'],
      ['activation', 'Activation'],
      ['simulate', 'Simulator'],
      ['measurement', 'Measurement'],
      ['marketscan', 'Market Scan'],
      ['governance', 'Governance'],
    ] as const;

    for (const [pageId, label] of routeLabels) {
      const { unmount } = renderScreen(pageId);
      expect(screen.getByRole('region', { name: label })).toBeInTheDocument();
      unmount();
    }
  });
});
