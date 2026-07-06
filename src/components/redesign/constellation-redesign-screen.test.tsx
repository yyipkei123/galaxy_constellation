import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConstellationRedesignScreen } from './constellation-redesign-screen';
import type { RedesignPageId } from './constellation-redesign-model';

const bannedCdePattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend|(?<!never\s)\b(?:guest|member|merchant|transaction)-level\b|forecast|\b(?:NaN|Infinity)\b/i;
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

function openCdeAiDock() {
  const aiDock = screen.getByRole('complementary', { name: 'CDE AI' });
  const toggle = within(aiDock).getByRole('button', { name: 'Ask CDE AI' });

  fireEvent.click(toggle);

  return aiDock;
}

describe('ConstellationRedesignScreen', () => {
  it('renders the prototype overview and selected finding', () => {
    const { container } = renderScreen('overview');

    expect(screen.getByRole('region', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pitch Cosmopolitan Connoisseurs first.' })).toBeInTheDocument();
    expect(screen.getByText("This quarter's play · 2026 Q2")).toBeInTheDocument();
    expect(screen.getByText(/Pitch Cosmopolitan Connoisseurs first/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Build the brief' })).toHaveAttribute('href', '/activation');
    expect(screen.getByRole('link', { name: 'See the evidence' })).toHaveAttribute('href', '/segments');
    expect(screen.getByText('Opportunity map')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wallet headroom constellation' })).toBeInTheDocument();
    expect(screen.getByText('Galaxy capture 52%')).toBeInTheDocument();
    expect(screen.getByText('Number = opportunity index')).toBeInTheDocument();
    expect(screen.getByText('Recommended move')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Build audience brief →' })).toHaveAttribute('href', '/activation');
    expect(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCdePattern);
    expect(container.textContent).not.toMatch(rawWalletBandPattern);
    expect(container.textContent).toContain('14-22k equiv./mo');
  });

  it('opens a guided executive story mode and advances demo stops', () => {
    renderScreen('overview');

    const guide = screen.getByRole('region', { name: 'Executive demo guide' });
    expect(within(guide).getByText('Boardroom story mode')).toBeInTheDocument();
    expect(within(guide).queryByText('1 of 5')).not.toBeInTheDocument();

    fireEvent.click(within(guide).getByRole('button', { name: 'Start demo' }));

    expect(within(guide).getByText('1 of 5')).toBeInTheDocument();
    expect(within(guide).getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    expect(within(guide).getByText(/Lead with the boardroom answer/i)).toBeInTheDocument();
    expect(within(guide).getByRole('link', { name: 'Open this stop' })).toHaveAttribute('href', '/');

    fireEvent.click(within(guide).getByRole('button', { name: 'Next stop' }));

    expect(within(guide).getByText('2 of 5')).toBeInTheDocument();
    expect(within(guide).getByRole('heading', { name: 'Wallet' })).toBeInTheDocument();
    expect(within(guide).getByRole('link', { name: 'Open this stop' })).toHaveAttribute('href', '/wallet');
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

  it('matches the compact prototype CDE AI dock shell and defaults collapsed', () => {
    renderScreen('overview');

    const aiDock = screen.getByRole('complementary', { name: 'CDE AI' });
    const panel = within(aiDock).getByTestId('cde-ai-panel');
    const collapsedToggle = within(aiDock).getByRole('button', { name: 'Ask CDE AI' });
    const controlledPanelId = collapsedToggle.getAttribute('aria-controls');

    expect(panel).toHaveClass('w-[392px]');
    expect(panel).toHaveAttribute('hidden');
    expect(collapsedToggle).toHaveAttribute('aria-expanded', 'false');
    expect(controlledPanelId).toBeTruthy();

    fireEvent.click(collapsedToggle);

    const closeButton = within(panel).getByRole('button', { name: 'Close CDE AI' });
    const expandedToggle = within(aiDock).getByRole('button', { name: 'Hide CDE AI' });
    expect(within(panel).getByText('CDE AI')).toBeInTheDocument();
    expect(within(panel).getByText('Governed answers · ranges & indices only')).toBeInTheDocument();
    expect(within(panel).getByText('Explain the ranking')).toBeInTheDocument();
    expect(within(panel).getByText('Why trust it?')).toBeInTheDocument();
    expect(within(panel).getByText('Build a brief')).toBeInTheDocument();
    expect(within(panel).getByText(/Ask for an explanation, trust rationale/i)).toBeInTheDocument();
    expect(
      within(panel).getByText(
        'Ask for an explanation, trust rationale, or a CDE-safe campaign brief for Cosmopolitan Connoisseurs.',
      ),
    ).toBeInTheDocument();
    expect(within(panel).getByPlaceholderText('Ask about Cosmopolitan Connoisseurs…')).toBeInTheDocument();
    expect(
      within(panel).getByText('Answers use modelled CDE ranges, percentages and indices only — never guest-level data.'),
    ).toBeInTheDocument();
    expect(expandedToggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(closeButton);

    const closedToggle = within(aiDock).getByRole('button', { name: 'Ask CDE AI' });
    expect(closedToggle).toHaveAttribute('aria-expanded', 'false');
    expect(closedToggle).toHaveFocus();
    expect(document.getElementById(controlledPanelId ?? '')).toHaveAttribute('hidden');
  });

  it('resets the CDE AI dock to a segment-aware default answer when overview selection changes', () => {
    renderScreen('overview');

    const aiDock = openCdeAiDock();
    const briefChip = within(aiDock).getByRole('button', { name: 'Build a brief' });

    fireEvent.click(briefChip);
    expect(within(aiDock).getByText(/Draft brief for Cosmopolitan Connoisseurs/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i }));

    expect(within(aiDock).getByPlaceholderText('Ask about Premium Mass Weekenders…')).toBeInTheDocument();
    expect(
      within(aiDock).getByText(
        'Ask for an explanation, trust rationale, or a CDE-safe campaign brief for Premium Mass Weekenders.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the CDE AI dock as a fixed floating chatbot outside route layout columns', () => {
    renderScreen('overview');

    const aiDocks = screen.getAllByRole('complementary', { name: 'CDE AI' });
    const overviewRegion = screen.getByRole('region', { name: 'Overview' });
    const [aiDock] = aiDocks;

    expect(aiDocks).toHaveLength(1);
    expect(aiDock).toHaveClass('fixed');
    expect(overviewRegion).not.toContainElement(aiDock);
  });

  it('exposes constellation node details in accessible names', () => {
    renderScreen('overview');

    expect(screen.getByRole('button', { name: /Select Premium Mass Weekenders/i })).toHaveAccessibleName(
      /Select Premium Mass Weekenders.*index 102.*48% Dining leakage.*mobile-ready/i,
    );
  });

  it('groups the route segment shortcuts with an accessible label', () => {
    renderScreen('journey');

    expect(screen.getByRole('group', { name: 'Segment shortcuts' })).toBeInTheDocument();
  });

  it('submits a deterministic CDE-safe AI question and clears the input', () => {
    renderScreen('overview');

    const aiDock = openCdeAiDock();
    const input = within(aiDock).getByRole('textbox', { name: /Ask a CDE-safe question/i });

    fireEvent.change(input, { target: { value: 'Explain the ranking' } });
    fireEvent.click(within(aiDock).getByRole('button', { name: 'Ask' }));

    expect(input).toHaveValue('');
    expect(within(aiDock).getByText(/Cosmopolitan Connoisseurs: opportunity index 118/i)).toBeInTheDocument();
    expect(within(aiDock).getAllByText(/14-22k equiv\.\/mo/i).length).toBeGreaterThan(0);
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
    const route = screen.getByRole('region', { name: 'Journey' });

    fireEvent.click(screen.getByRole('button', { name: 'Weekenders' }));

    expect(screen.getByRole('button', { name: 'Weekenders' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(route).getByText(/for Premium Mass Weekenders/i)).toBeInTheDocument();
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
    const aiDock = openCdeAiDock();
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

  it('shows governed CDE AI starter prompts and the data behind the answer', () => {
    const { container } = renderScreen('overview');
    const aiDock = openCdeAiDock();

    expect(within(aiDock).getByRole('button', { name: 'Which segment leaks most?' })).toBeInTheDocument();
    expect(within(aiDock).getByRole('button', { name: 'Why is this CDE-safe?' })).toBeInTheDocument();

    fireEvent.click(within(aiDock).getByRole('button', { name: 'Why is this CDE-safe?' }));

    expect(within(aiDock).getByText(/matched Galaxy and Mastercard CDE cohort/i)).toBeInTheDocument();

    fireEvent.click(within(aiDock).getByText('Show data behind this'));

    expect(within(aiDock).getByText('Grounded data used')).toBeInTheDocument();
    expect(within(aiDock).getByText('Selected segment')).toBeInTheDocument();
    expect(within(aiDock).getByText('Cosmopolitan Connoisseurs')).toBeInTheDocument();
    expect(within(aiDock).getByText('Opportunity index')).toBeInTheDocument();
    expect(within(aiDock).getByText('118')).toBeInTheDocument();
    expect(within(aiDock).getByText('Matched coverage')).toBeInTheDocument();
    expect(within(aiDock).getByText('63%')).toBeInTheDocument();
    expectCdeSafe(container);
  });

  it('changes the CDE AI default answer, evidence, and links by route', () => {
    const wallet = renderScreen('wallet');
    let aiDock = openCdeAiDock();

    expect(within(aiDock).getByText(/Wallet gap for Cosmopolitan Connoisseurs/i)).toBeInTheDocument();
    expect(within(aiDock).getByPlaceholderText('Ask about wallet split…')).toBeInTheDocument();
    fireEvent.click(within(aiDock).getByText('Show data behind this'));
    expect(within(aiDock).getByText('Average on-property share')).toBeInTheDocument();
    expect(within(aiDock).getByText('Widest category gap')).toBeInTheDocument();
    expect(within(aiDock).getByRole('link', { name: 'Open activation handoff' })).toHaveAttribute(
      'href',
      '/activation',
    );
    expectCdeSafe(wallet.container);
    wallet.unmount();

    const measurement = renderScreen('measurement');
    aiDock = openCdeAiDock();

    expect(within(aiDock).getByText(/Scale Michelin retail cross-sell pilot/i)).toBeInTheDocument();
    expect(within(aiDock).getByPlaceholderText('Ask about measurement decision…')).toBeInTheDocument();
    fireEvent.click(within(aiDock).getByText('Show data behind this'));
    expect(within(aiDock).getByText('Decision')).toBeInTheDocument();
    expect(within(aiDock).getByText('Top readout')).toBeInTheDocument();
    expect(within(aiDock).getByRole('link', { name: 'Open governance basis' })).toHaveAttribute(
      'href',
      '/governance',
    );
    expectCdeSafe(measurement.container);
  });

  it('renders Activation with working audience, channel, window, export, and AI controls', () => {
    const { container } = renderScreen('activation');
    const route = screen.getByRole('region', { name: 'Activation' });

    expect(within(route).getByRole('heading', { name: 'Campaign activation' })).toBeInTheDocument();
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
    const handoff = within(route).getByRole('status', { name: 'Measurement handoff queued' });
    expect(within(handoff).getByText('Measurement handoff queued')).toBeInTheDocument();
    expect(within(handoff).getByText(/Premium Mass Weekenders/i)).toBeInTheDocument();
    expect(within(handoff).getByText(/8 weeks vs matched holdout/i)).toBeInTheDocument();
    expect(within(handoff).getByRole('link', { name: 'Open measurement readout' })).toHaveAttribute(
      'href',
      '/measurement',
    );

    fireEvent.click(within(route).getByRole('button', { name: 'Ask CDE AI' }));
    expect(screen.getAllByRole('complementary', { name: 'CDE AI' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Hide CDE AI' })).toHaveAttribute('aria-expanded', 'true');
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
    const handoff = within(route).getByRole('region', { name: 'Latest activation handoff' });
    expect(within(handoff).getByText('Latest activation handoff')).toBeInTheDocument();
    expect(within(handoff).getByText(/Campaign activation now closes into measurement/i)).toBeInTheDocument();
    expect(within(handoff).getByText(/Cosmopolitan Connoisseurs/i)).toBeInTheDocument();
    expect(within(handoff).getByText(/6 weeks vs matched holdout/i)).toBeInTheDocument();
    const decision = within(route).getByRole('region', { name: 'Measurement decision guidance' });
    expect(within(decision).getByText('Governed action')).toBeInTheDocument();
    expect(within(decision).getByRole('heading', { name: 'Scale Michelin retail cross-sell pilot' })).toBeInTheDocument();
    expect(within(decision).getByText(/above the governed scale threshold/i)).toBeInTheDocument();
    expect(within(decision).getByText(/Scale to the next eligible cohort band/i)).toBeInTheDocument();
    expect(within(route).getByText('Every campaign reads as capture-index delta vs a matched holdout')).toBeInTheDocument();
    expect(within(route).getByText('Michelin retail cross-sell pilot')).toBeInTheDocument();
    expect(within(route).getByText('+9 idx')).toBeInTheDocument();
    expect(within(route).getAllByText('Scale').length).toBeGreaterThanOrEqual(2);
    expect(within(route).getByText('Revise')).toBeInTheDocument();
    expect(within(route).getAllByText('Hold').length).toBeGreaterThanOrEqual(2);
    expect(within(route).getByText(/Lift is expressed as a capture-index delta against the matched holdout band/i)).toBeInTheDocument();
    expectCdeSafe(container);
  });

  it('renders Market Scan demand, corridor share bands, and governed baseline copy', () => {
    const { container } = renderScreen('marketscan');
    const route = screen.getByRole('region', { name: 'Market Scan' });

    expect(within(route).getByRole('heading', { name: 'Market scan' })).toBeInTheDocument();
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
