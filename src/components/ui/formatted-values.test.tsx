import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '@/store/app-store';
import { BandValue, IndexValue, PercentValue } from './formatted-values';
import { MethodologyNote } from './methodology-note';

describe('formatted CDE values', () => {
  it('formats enriched values and marks each one as CDE-backed', () => {
    render(
      <div>
        <PercentValue value={63} />
        <IndexValue value={176} />
        <BandValue value="8-12k equiv./mo" />
      </div>,
    );

    expect(screen.getByText('63%')).toBeInTheDocument();
    expect(screen.getByText('CDE index signal 176')).toBeInTheDocument();
    expect(screen.getByText('8-12k equiv./mo')).toBeInTheDocument();
    expect(screen.getAllByText('CDE')).toHaveLength(3);
    expect(screen.getAllByTitle('Mastercard Card Data Enrichment - modelled estimate')).toHaveLength(3);
    expect(screen.getAllByLabelText('Mastercard Card Data Enrichment - modelled estimate')).toHaveLength(3);
  });

  it('can explain CDE indices as relative signals with priority bands', () => {
    render(<IndexValue value={132} label="CDE wallet signal" showSignal />);

    const indexSignal = screen.getByLabelText(/CDE wallet signal 132/i);
    expect(screen.getByText('CDE wallet signal 132')).toBeInTheDocument();
    expect(screen.getByText('High recapture priority')).toBeInTheDocument();
    expect(indexSignal).toHaveAttribute(
      'title',
      expect.stringContaining('not a customer count'),
    );
    expect(indexSignal).toHaveAttribute(
      'title',
      expect.stringContaining('100 is the matched-cohort baseline'),
    );
  });

  it('renders the required CDE methodology disclaimer and active methodology facts', () => {
    render(
      <AppStateProvider>
        <MethodologyNote />
      </AppStateProvider>,
    );

    expect(screen.getByText(/Enriched figures are modelled estimates/i)).toBeInTheDocument();
    expect(screen.getByText(/expressed as indices \/ ranges \/ % per Mastercard CDE data-sharing rules/i)).toBeInTheDocument();
    expect(screen.getByText(/matched coverage 63%/i)).toBeInTheDocument();
    expect(screen.getByText(/refreshed quarterly/i)).toBeInTheDocument();
    expect(screen.getByText(/7 active CDE metrics/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'What CDE index signals mean' })).not.toBeInTheDocument();
    expect(screen.queryByText(/100 is the matched Galaxy x Mastercard cohort baseline/i)).not.toBeInTheDocument();
  });
});
