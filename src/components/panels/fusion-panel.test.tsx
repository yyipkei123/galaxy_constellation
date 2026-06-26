import { render, screen } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { FusionPanel } from './fusion-panel';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('FusionPanel', () => {
  it('separates Galaxy first-party and Mastercard CDE evidence', () => {
    const { container } = render(<FusionPanel guest={guests[0]} />);

    expect(screen.getByText('What Galaxy sees')).toBeInTheDocument();
    expect(screen.getByText('What Mastercard CDE adds')).toBeInTheDocument();
    expect(screen.getByText('Fused opportunity')).toBeInTheDocument();
    expect(screen.getAllByText('CDE').length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('renders finite fallbacks for malformed guest evidence', () => {
    const malformedGuest = {
      ...guests[0],
      firstParty: {
        ...guests[0].firstParty,
        properties: ['HKD property', 'Capella'],
        staysL12m: Number.POSITIVE_INFINITY,
        diningVisits: Number.NaN,
        rewardsPoints: Number.POSITIVE_INFINITY,
      },
      cde: {
        ...guests[0].cde,
        categoryLeakagePct: { ...guests[0].cde.categoryLeakagePct, hospitality: Number.NaN },
        categoryWalletIndex: { ...guests[0].cde.categoryWalletIndex, hospitality: Number.POSITIVE_INFINITY },
        crossPropertyCashBand: '$999 元',
      },
      leadScore: Number.POSITIVE_INFINITY,
      projectedUpsideBand: 'HKD 8k',
      primaryOpportunity: 'hospitality',
    } as unknown as Guest;

    const { container } = render(<FusionPanel guest={malformedGuest} />);

    expect(screen.getByText('Fused opportunity')).toBeInTheDocument();
    expect(screen.getAllByText(/Index 0|0%|0-0k equiv\.\/mo/).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });
});
