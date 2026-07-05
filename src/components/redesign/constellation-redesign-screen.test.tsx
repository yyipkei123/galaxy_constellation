import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConstellationRedesignScreen } from './constellation-redesign-screen';
import type { RedesignPageId } from './constellation-redesign-model';

const bannedCdePattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend|NaN|Infinity/i;
const rawWalletBandPattern = /\d+-\d+k \/mo/;

function renderScreen(pageId: RedesignPageId = 'overview') {
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
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
    expect(container.textContent).toContain('14-22k equiv./mo');
  });

  it('updates selected finding when a constellation node is clicked', () => {
    const { container } = renderScreen('overview');

    fireEvent.click(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i }));

    const selectedFinding = screen.getByRole('region', { name: 'Selected finding' });
    expect(within(selectedFinding).getByText('Premium Mass Weekenders')).toBeInTheDocument();
    expect(within(selectedFinding).getByText('48% Dining')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
    expect(container.textContent).toContain('8-14k equiv./mo');
  });

  it('labels the AI dock as a complementary landmark with collapse state', () => {
    renderScreen('overview');

    const aiDock = screen.getByRole('complementary', { name: 'CDE AI' });
    const toggle = within(aiDock).getByRole('button', { name: 'Collapse' });
    const controlledPanelId = toggle.getAttribute('aria-controls');

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(controlledPanelId).toBeTruthy();
    expect(document.getElementById(controlledPanelId ?? '')).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(within(aiDock).getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(controlledPanelId ?? '')).toBeInTheDocument();
    expect(document.getElementById(controlledPanelId ?? '')).toHaveAttribute('hidden');
  });

  it('exposes constellation node details in accessible names', () => {
    renderScreen('overview');

    expect(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i })).toHaveAccessibleName(
      /Select Premium Mass Weekenders.*index 102.*48% Dining leakage.*mobile-ready/i,
    );
  });

  it('groups the segment shortcuts with an accessible label', () => {
    renderScreen('overview');

    expect(screen.getByRole('group', { name: 'Segment shortcuts' })).toBeInTheDocument();
  });

  it('submits a deterministic CDE-safe AI question and clears the input', () => {
    renderScreen('overview');

    const aiDock = screen.getByRole('complementary', { name: 'CDE AI' });
    const input = within(aiDock).getByRole('textbox', { name: /Ask a CDE-safe question/i });

    fireEvent.change(input, { target: { value: 'Explain the ranking' } });
    fireEvent.click(within(aiDock).getByRole('button', { name: 'Ask' }));

    expect(input).toHaveValue('');
    expect(within(aiDock).getByText(/Cosmopolitan Connoisseurs: opportunity index 118/i)).toBeInTheDocument();
    expect(within(aiDock).getByText(/14-22k equiv\.\/mo/i)).toBeInTheDocument();
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

  it('renders the Segments ranking and sticky detail panel', () => {
    renderScreen('segments');

    expect(screen.getByRole('region', { name: 'Segments' })).toBeInTheDocument();
    expect(screen.getByText('Segment detail')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cosmopolitan Connoisseurs/i })).toBeInTheDocument();
    expect(screen.getByText('Leakage by category')).toBeInTheDocument();
  });

  it('builds a CDE-safe audience brief draft for the selected segment', () => {
    const { container } = renderScreen('segments');

    expect(screen.queryByRole('status', { name: 'Audience brief draft' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Build audience brief' }));

    const draftStatus = screen.getByRole('status', { name: 'Audience brief draft' });
    expect(within(draftStatus).getByText('Audience brief draft generated')).toBeInTheDocument();
    expect(within(draftStatus).getByText(/Premium Mass Weekenders/i)).toBeInTheDocument();
    expect(within(draftStatus).getByText(/Progressive dining credit unlocking show tickets/i)).toBeInTheDocument();
    expect(within(draftStatus).getByText(/governed matched bands, indices and category percentages only/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCdePattern);
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
  });

  it('renders the Leakage matrix with category governance copy', () => {
    renderScreen('leakage');

    expect(screen.getByRole('region', { name: 'Leakage' })).toBeInTheDocument();
    expect(screen.getByText('Leakage matrix')).toBeInTheDocument();
    expect(screen.getByText("Where each segment's wallet escapes")).toBeInTheDocument();
    expect(screen.getByText(/demi-decile averages from matched CDE cohorts/i)).toBeInTheDocument();
  });

  it('renders Journey, Wallet, Guests, and Propensity screens from the model', () => {
    const expectations = [
      ['journey', 'Weakest link'],
      ['wallet', 'On-property vs modelled off-property'],
      ['guests', 'From resort universe to activation-ready cohorts'],
      ['propensity', 'Audience readiness'],
    ] as const;

    for (const [pageId, text] of expectations) {
      const { unmount } = renderScreen(pageId);
      expect(screen.getByText(text)).toBeInTheDocument();
      unmount();
    }
  });
});
