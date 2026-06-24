import { render, screen } from '@testing-library/react';
import { BandValue, IndexValue, PercentValue } from './formatted-values';

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
    expect(screen.getAllByTitle(/Mastercard CDE enriched metric/i)).toHaveLength(3);
  });
});
