import { render, screen } from '@testing-library/react';
import { DriverChip } from './driver-chip';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('DriverChip', () => {
  it('renders an accessible scoring driver', () => {
    render(<DriverChip>retailLuxury leakage 54%</DriverChip>);

    const chip = screen.getByLabelText('Driver: retailLuxury leakage 54%');
    expect(chip).toHaveTextContent('retailLuxury leakage 54%');
    expect(chip).not.toHaveTextContent(bannedCurrencyPattern);
  });

  it('removes banned currency text from string drivers', () => {
    render(<DriverChip>fnb leakage HKD100 MOP100 $ 元 48%</DriverChip>);

    const chip = screen.getByLabelText('Driver: fnb leakage 100 100 48%');
    expect(chip).toHaveTextContent('fnb leakage 100 100 48%');
    expect(chip).not.toHaveTextContent(bannedCurrencyPattern);
    expect(chip).toHaveAccessibleName('Driver: fnb leakage 100 100 48%');
  });

  it('removes banned currency text from nested driver content', () => {
    render(
      <DriverChip>
        <span>fnb HKD $ 48%</span>
      </DriverChip>,
    );

    const chip = screen.getByLabelText('Driver: fnb 48%');
    expect(chip).toHaveTextContent('fnb 48%');
    expect(chip).not.toHaveTextContent(bannedCurrencyPattern);
    expect(chip).toHaveAccessibleName('Driver: fnb 48%');
  });
});
