import { fireEvent, render, screen } from '@testing-library/react';
import { latestSegments } from '@/data';
import { AppStateProvider, useAppState } from '@/store/app-store';
import PropensityPage from './page';

function StoreProbe() {
  const { filters, savedAudiences } = useAppState();

  return (
    <div>
      <output aria-label="active filters">
        {`${filters.channel}|${filters.minPropensity}|${filters.segmentIds.join(',')}`}
      </output>
      <output aria-label="saved audience segment ids">
        {savedAudiences.map((audience) => audience.segmentIds.join(',')).join('|')}
      </output>
    </div>
  );
}

function renderPropensity() {
  return render(
    <AppStateProvider>
      <PropensityPage />
      <StoreProbe />
    </AppStateProvider>,
  );
}

describe('propensity route', () => {
  it('renders the audience builder and saves a named audience', () => {
    renderPropensity();

    expect(screen.getByRole('heading', { name: 'Propensity & Audience Builder' })).toBeInTheDocument();
    expect(screen.getByText('Turn insight into a targetable audience')).toBeInTheDocument();
    expect(screen.getByLabelText(/Luxury-hotel spender/i)).toBeInTheDocument();
    expect(screen.getByText('Live audience size')).toBeInTheDocument();
    expect(screen.getByText('Estimated recapturable wallet')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Segment membership/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Channel preference/i })).toHaveValue('all');
    expect(screen.getByText('Estimated wallet band')).toBeInTheDocument();
    expect(screen.getByText(/equiv\.\/mo/)).toBeInTheDocument();
    expect(screen.getByText('Dominant leakage')).toBeInTheDocument();
    expect(screen.getByText('Channel preference composition')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: new RegExp(latestSegments[0].name) }));
    fireEvent.change(screen.getByRole('combobox', { name: /Channel preference/i }), {
      target: { value: 'online' },
    });
    const audienceName = screen.getByLabelText(/Audience name/i);
    fireEvent.change(audienceName, { target: { value: 'Luxury win-back Q2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save audience' }));

    expect(screen.getByText('Saved: Luxury win-back Q2')).toBeInTheDocument();
    expect(screen.getByLabelText('active filters')).toHaveTextContent('online');
    expect(screen.getByLabelText('saved audience segment ids')).not.toHaveTextContent(latestSegments[0].id);
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
