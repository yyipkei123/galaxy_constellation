import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import PropensityPage from './page';

function renderPropensity() {
  return render(
    <AppStateProvider>
      <PropensityPage />
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

    const audienceName = screen.getByLabelText(/Audience name/i);
    fireEvent.change(audienceName, { target: { value: 'Luxury win-back Q2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save audience' }));

    expect(screen.getByText('Saved: Luxury win-back Q2')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
