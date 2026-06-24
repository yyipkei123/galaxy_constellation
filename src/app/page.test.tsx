import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import Home from './page';

function renderHome() {
  return render(
    <AppStateProvider>
      <Home />
    </AppStateProvider>,
  );
}

describe('overview route', () => {
  it('renders the Galaxy Constellation overview surface', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: /Galaxy Constellation/i })).toBeInTheDocument();
    expect(screen.getByText(/Guest Wallet Intelligence/i)).toBeInTheDocument();

    expect(screen.getByText('Matched guest base')).toBeInTheDocument();
    expect(screen.getByText('Galaxy wallet capture')).toBeInTheDocument();
    expect(screen.getByText('Estimated wallet headroom')).toBeInTheDocument();
    expect(screen.getByText('Top-tier rewards propensity')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Category wallet snapshot/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Top 3 opportunities this quarter/i })).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(4);
  });

  it('does not render its own main landmark because the shell owns it', () => {
    renderHome();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
