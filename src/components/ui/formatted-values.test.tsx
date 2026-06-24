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
    expect(screen.getByText('Index 176')).toBeInTheDocument();
    expect(screen.getByText('8-12k equiv./mo')).toBeInTheDocument();
    expect(screen.getAllByText('CDE')).toHaveLength(3);
    expect(screen.getAllByTitle('Mastercard Card Data Enrichment - modelled estimate')).toHaveLength(3);
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
  });
});
