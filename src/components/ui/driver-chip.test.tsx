import { render, screen } from '@testing-library/react';
import { DriverChip } from './driver-chip';

const bannedCurrencyPattern = /\b(?:HKD|MOP)\b|\$|元|澳門幣/i;

describe('DriverChip', () => {
  it('renders an accessible scoring driver', () => {
    render(<DriverChip>retailLuxury leakage 54%</DriverChip>);

    const chip = screen.getByLabelText('Driver: retailLuxury leakage 54%');
    expect(chip).toHaveTextContent('retailLuxury leakage 54%');
    expect(chip).not.toHaveTextContent(bannedCurrencyPattern);
  });

  it('removes banned currency text from string drivers', () => {
    render(<DriverChip>fnb leakage HKD $ 元 48%</DriverChip>);

    const chip = screen.getByLabelText('Driver: fnb leakage 48%');
    expect(chip).toHaveTextContent('fnb leakage 48%');
    expect(chip).not.toHaveTextContent(bannedCurrencyPattern);
  });
});
