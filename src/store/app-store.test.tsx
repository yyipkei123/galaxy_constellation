import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider, useAppState } from '@/store/app-store';

function Probe() {
  const {
    launchCampaign,
    launchedCampaigns,
    saveScenario,
    savedScenarios,
  } = useAppState();

  return (
    <div>
      <output aria-label="launched campaign count">{launchedCampaigns.length}</output>
      <output aria-label="saved scenario count">{savedScenarios.length}</output>
      <button
        type="button"
        onClick={() => launchCampaign({
          source: 'activation',
          audienceName: 'Top leakage segments',
          segmentIds: ['cosmopolitan-connoisseurs'],
          lever: 'recapture',
        })}
      >
        Launch campaign
      </button>
      <button
        type="button"
        onClick={() => launchCampaign({
          source: 'activation',
          audienceName: 'Top leakage segments',
          segmentIds: ['cosmopolitan-connoisseurs'],
          lever: 'hostLift',
        })}
      >
        Launch host lift campaign
      </button>
      <button
        type="button"
        onClick={() => launchCampaign({
          source: 'activation',
          audienceName: 'Shared audience',
          segmentIds: ['cosmopolitan-connoisseurs'],
          lever: 'recapture',
        })}
      >
        Launch shared connoisseurs
      </button>
      <button
        type="button"
        onClick={() => launchCampaign({
          source: 'activation',
          audienceName: 'Shared audience',
          segmentIds: ['diamond-high-rollers'],
          lever: 'recapture',
        })}
      >
        Launch shared diamond
      </button>
      <button
        type="button"
        onClick={() => saveScenario({
          name: 'Luxury recapture scenario',
          segmentIds: ['cosmopolitan-connoisseurs'],
          category: 'retailLuxury',
          recapturePct: 12,
          onlineShiftPct: 8,
          lever: 'recapture',
        })}
      >
        Save scenario
      </button>
    </div>
  );
}

function PresenterModeProbe() {
  const { isPresenterMode, setPresenterMode, togglePresenterMode } = useAppState();

  return (
    <div>
      <output aria-label="presenter mode">{String(isPresenterMode)}</output>
      <button type="button" onClick={() => setPresenterMode(true)}>Enable presenter mode</button>
      <button type="button" onClick={() => setPresenterMode(false)}>Disable presenter mode</button>
      <button type="button" onClick={togglePresenterMode}>Toggle presenter mode</button>
    </div>
  );
}

describe('AppStateProvider sprint 3 state', () => {
  it('launches campaigns and saves scenarios through app state actions', () => {
    render(
      <AppStateProvider>
        <Probe />
      </AppStateProvider>,
    );

    expect(screen.getByLabelText('launched campaign count')).toHaveTextContent('0');
    expect(screen.getByLabelText('saved scenario count')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: 'Launch campaign' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));

    expect(screen.getByLabelText('launched campaign count')).toHaveTextContent('1');
    expect(screen.getByLabelText('saved scenario count')).toHaveTextContent('1');
  });

  it('keeps distinct launched campaigns for the same audience with different levers', () => {
    render(
      <AppStateProvider>
        <Probe />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Launch campaign' }));
    fireEvent.click(screen.getByRole('button', { name: 'Launch host lift campaign' }));

    expect(screen.getByLabelText('launched campaign count')).toHaveTextContent('2');
  });

  it('keeps distinct launched campaigns for the same audience with different single segments', () => {
    render(
      <AppStateProvider>
        <Probe />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Launch shared connoisseurs' }));
    fireEvent.click(screen.getByRole('button', { name: 'Launch shared diamond' }));

    expect(screen.getByLabelText('launched campaign count')).toHaveTextContent('2');
  });

  it('toggles presenter mode through app state', () => {
    render(
      <AppStateProvider>
        <PresenterModeProbe />
      </AppStateProvider>,
    );

    expect(screen.getByLabelText('presenter mode')).toHaveTextContent('false');

    fireEvent.click(screen.getByRole('button', { name: 'Enable presenter mode' }));
    expect(screen.getByLabelText('presenter mode')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('button', { name: 'Disable presenter mode' }));
    expect(screen.getByLabelText('presenter mode')).toHaveTextContent('false');

    fireEvent.click(screen.getByRole('button', { name: 'Enable presenter mode' }));
    expect(screen.getByLabelText('presenter mode')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle presenter mode' }));
    expect(screen.getByLabelText('presenter mode')).toHaveTextContent('false');
  });
});
