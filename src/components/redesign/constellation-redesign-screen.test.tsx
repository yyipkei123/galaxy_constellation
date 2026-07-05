import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConstellationRedesignScreen } from './constellation-redesign-screen';
import type { RedesignPageId } from './constellation-redesign-model';

const bannedCdePattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend|\b(?:guest|member|merchant|transaction)-level\b|forecast|\b(?:NaN|Infinity)\b/i;
const rawWalletBandPattern = /\d+(?:\.\d+)?-\d+(?:\.\d+)?k \/mo/;

function expectCdeSafe(container: HTMLElement) {
  expect(container.textContent).not.toMatch(bannedCdePattern);
  expect(container.textContent).not.toMatch(rawWalletBandPattern);
}

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
    expect(screen.getByRole('heading', { name: 'Wallet intelligence cockpit' })).toBeInTheDocument();
    expect(screen.getByText(/Pitch Cosmopolitan Connoisseurs first/i)).toBeInTheDocument();
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

  it('selects a Leakage matrix row and updates the visible segment context', () => {
    const { container } = renderScreen('leakage');

    fireEvent.click(screen.getByRole('button', { name: /Select Regional Gaming Regulars/i }));

    expect(screen.getByText('Selected segment: Regional Gaming Regulars')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select Regional Gaming Regulars/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(container.textContent).not.toMatch(bannedCdePattern);
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
  });

  it('selects a Guests cohort row and updates the visible cohort context', () => {
    const { container } = renderScreen('guests');

    fireEvent.click(screen.getByRole('button', { name: /Select Family Resort Loyalists/i }));

    expect(screen.getByText('Selected cohort: Family Resort Loyalists')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select Family Resort Loyalists/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(container.textContent).not.toMatch(bannedCdePattern);
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
  });

  it('selects a Journey segment chip and updates the weakest-link context', () => {
    const { container } = renderScreen('journey');

    fireEvent.click(screen.getByRole('button', { name: 'Weekenders' }));

    expect(screen.getByRole('button', { name: 'Weekenders' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/for Premium Mass Weekenders/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCdePattern);
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
  });

  it('selects a Wallet segment and renders varied normalized quarterly bands', () => {
    const { container } = renderScreen('wallet');

    fireEvent.click(screen.getByRole('button', { name: 'Weekenders' }));

    expect(screen.getByRole('button', { name: 'Weekenders' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Selected segment: Premium Mass Weekenders')).toBeInTheDocument();
    expect(screen.getByLabelText('Wallet trend bar area')).toHaveClass('h-40');
    expect(screen.getByText('5-11k equiv./mo')).toBeInTheDocument();
    expect(screen.getByText('6-12k equiv./mo')).toBeInTheDocument();
    expect(screen.getByText('7-13k equiv./mo')).toBeInTheDocument();
    expect(screen.getAllByText('8-14k equiv./mo').length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(bannedCdePattern);
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
  });

  it('selects a Propensity row and updates the audience readiness context', () => {
    const { container } = renderScreen('propensity');

    fireEvent.click(screen.getByRole('button', { name: /Select Regional Gaming Regulars/i }));

    expect(screen.getByRole('button', { name: /Select Regional Gaming Regulars/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: 'Regional Gaming Regulars' })).toBeInTheDocument();
    expect(screen.getByText(/CRM email first with concierge follow-up/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCdePattern);
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
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

  it('switches CDE AI chip answers deterministically', () => {
    const { container } = renderScreen('overview');
    const aiDock = screen.getByRole('complementary', { name: 'CDE AI' });
    const trustChip = within(aiDock).getByRole('button', { name: 'Why trust it?' });
    const briefChip = within(aiDock).getByRole('button', { name: 'Build a brief' });

    fireEvent.click(trustChip);

    expect(trustChip).toHaveAttribute('aria-pressed', 'true');
    expect(within(aiDock).getByText(/matched Galaxy and Mastercard CDE cohort/i)).toBeInTheDocument();

    fireEvent.click(briefChip);

    expect(briefChip).toHaveAttribute('aria-pressed', 'true');
    expect(trustChip).toHaveAttribute('aria-pressed', 'false');
    expect(within(aiDock).getByText(/Draft brief for Cosmopolitan Connoisseurs/i)).toBeInTheDocument();
    expectCdeSafe(container);
  });

  it('renders Activation with working audience, channel, window, export, and AI controls', () => {
    const { container } = renderScreen('activation');
    const route = screen.getByRole('region', { name: 'Activation' });

    expect(within(route).getByRole('heading', { name: 'Activation planning' })).toBeInTheDocument();
    expect(within(route).getByText('Audience')).toBeInTheDocument();
    expect(within(route).getByText('Channels')).toBeInTheDocument();
    expect(within(route).getByText('Measurement window')).toBeInTheDocument();
    expect(within(route).getByText('Campaign brief')).toBeInTheDocument();
    expect(screen.queryByText(/Shared renderer placeholder/i)).not.toBeInTheDocument();

    fireEvent.click(within(route).getByRole('button', { name: /Select Premium Mass Weekenders/i }));
    expect(within(route).getByText('Premium Mass Weekenders')).toBeInTheDocument();

    const paidSocial = within(route).getByRole('button', { name: 'Paid social' });
    expect(paidSocial).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(paidSocial);
    expect(paidSocial).toHaveAttribute('aria-pressed', 'true');
    expect(within(route).getByText('App push / CRM email / Paid social')).toBeInTheDocument();

    fireEvent.click(within(route).getByRole('button', { name: '8 weeks' }));
    expect(within(route).getByText('8 weeks vs matched holdout')).toBeInTheDocument();

    fireEvent.click(within(route).getByRole('button', { name: 'Export campaign brief' }));
    expect(within(route).getByRole('button', { name: 'Brief handed to Marketing' })).toBeInTheDocument();

    fireEvent.click(within(route).getByRole('button', { name: 'Ask CDE AI' }));
    expect(screen.getAllByRole('complementary', { name: 'CDE AI' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Collapse' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Draft brief for Premium Mass Weekenders/i)).toBeInTheDocument();
    expectCdeSafe(container);
  });

  it('renders Simulator with accessible sliders that update modelled bands', () => {
    const { container } = renderScreen('simulate');
    const route = screen.getByRole('region', { name: 'Simulator' });

    expect(within(route).getByRole('heading', { name: 'Scenario simulator' })).toBeInTheDocument();
    expect(within(route).getByText('Scenario audience')).toBeInTheDocument();
    expect(within(route).getByText('Projected outcome')).toBeInTheDocument();
    expect(within(route).getByText('Capture-index lift vs matched holdout')).toBeInTheDocument();
    expect(within(route).getByText('+5 to +9')).toBeInTheDocument();

    const reachSlider = within(route).getByRole('slider', { name: 'Audience reach' });
    const depthSlider = within(route).getByRole('slider', { name: 'Offer depth' });
    expect(reachSlider).toHaveAttribute('min', '10');
    expect(reachSlider).toHaveAttribute('max', '90');
    expect(reachSlider).toHaveAttribute('step', '5');
    expect(depthSlider).toHaveAttribute('min', '5');
    expect(depthSlider).toHaveAttribute('max', '30');
    expect(depthSlider).toHaveAttribute('step', '1');

    fireEvent.change(reachSlider, { target: { value: '80' } });
    fireEvent.change(depthSlider, { target: { value: '25' } });

    expect(within(route).getByText('+18 to +31')).toBeInTheDocument();
    expect(within(route).getByText('11-26k equiv./mo')).toBeInTheDocument();
    expect(within(route).getByText(/Directional modelled bands/i)).toBeInTheDocument();
    expectCdeSafe(container);
  });

  it('renders Measurement readouts as capture-index deltas vs matched holdout', () => {
    const { container } = renderScreen('measurement');
    const route = screen.getByRole('region', { name: 'Measurement' });

    expect(within(route).getByRole('heading', { name: 'Campaign measurement' })).toBeInTheDocument();
    expect(within(route).getByText('Reads complete')).toBeInTheDocument();
    expect(within(route).getByText('In flight')).toBeInTheDocument();
    expect(within(route).getByText('Queued')).toBeInTheDocument();
    expect(within(route).getByText('Campaign readouts')).toBeInTheDocument();
    expect(within(route).getByText('Every campaign reads as capture-index delta vs a matched holdout')).toBeInTheDocument();
    expect(within(route).getByText('Michelin retail cross-sell pilot')).toBeInTheDocument();
    expect(within(route).getByText('+9 idx')).toBeInTheDocument();
    expect(within(route).getByText(/Lift is expressed as a capture-index delta against the matched holdout band/i)).toBeInTheDocument();
    expectCdeSafe(container);
  });

  it('renders Market Scan demand, corridor share bands, and governed baseline copy', () => {
    const { container } = renderScreen('marketscan');
    const route = screen.getByRole('region', { name: 'Market Scan' });

    expect(within(route).getByRole('heading', { name: 'Market context' })).toBeInTheDocument();
    expect(within(route).getByText('Hospitality')).toBeInTheDocument();
    expect(within(route).getByText('Retail/Luxury')).toBeInTheDocument();
    expect(within(route).getByText('Corridor mix')).toBeInTheDocument();
    expect(within(route).getByText('Competitive read')).toBeInTheDocument();
    expect(within(route).getByText(/matched CDE market baseline \(100\)/i)).toBeInTheDocument();

    expect(within(route).getByLabelText('Greater Bay Area share band 38-46%')).toHaveStyle({ width: '42%' });
    expect(within(route).getByLabelText('Hong Kong share band 24-30%')).toHaveStyle({ width: '27%' });
    expectCdeSafe(container);
  });

  it('renders Governance rules, refresh log, and CDE data-sharing scope', () => {
    const { container } = renderScreen('governance');
    const route = screen.getByRole('region', { name: 'Governance' });

    expect(within(route).getByRole('heading', { name: 'Governance & CDE rules' })).toBeInTheDocument();
    expect(within(route).getByText('Ranges & indices only')).toBeInTheDocument();
    expect(within(route).getByText('Cohort floors')).toBeInTheDocument();
    expect(within(route).getByText('Refresh log')).toBeInTheDocument();
    expect(within(route).getByText('2026 Q2')).toBeInTheDocument();
    expect(within(route).getByText('CURRENT')).toBeInTheDocument();
    expect(within(route).getByText('Data-sharing scope')).toBeInTheDocument();
    expect(within(route).getByText(/demi-decile averages over matched cohorts/i)).toBeInTheDocument();
    expect(within(route).getByText(/No individual, venue, or payment-event detail/i)).toBeInTheDocument();
    expectCdeSafe(container);
  });
});
