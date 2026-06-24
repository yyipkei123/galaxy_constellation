import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import ActivationPage from './page';

function renderActivation() {
  return render(
    <AppStateProvider>
      <ActivationPage />
    </AppStateProvider>,
  );
}

describe('activation route', () => {
  it('renders next-best-action cards and pushes an audience to campaign', () => {
    renderActivation();

    expect(screen.getByRole('heading', { name: 'Next-Best-Action' })).toBeInTheDocument();
    expect(screen.getAllByText('Galaxy Rewards').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('MOP 200 rebate on MOP 500 spend')).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Push to campaign' })[0]);

    expect(screen.getByText('Audience exported to Galaxy Rewards CRM / activation platform')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
