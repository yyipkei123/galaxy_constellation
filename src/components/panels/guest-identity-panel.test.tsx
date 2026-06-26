import { render, screen } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { GuestIdentityPanel } from './guest-identity-panel';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const directContactPattern = /@|\+\d{6,}|(?:\d[\s-]?){8,}/;
const unsafeTextPattern = /HKD|MOP|\$|元|澳門幣|NaN|Infinity|@|\+\d{6,}|(?:\d[\s-]?){8,}/i;

describe('GuestIdentityPanel', () => {
  it('renders synthetic customer identity, demographics, and preferences', () => {
    const { container } = render(<GuestIdentityPanel guest={guests[0]} />);

    expect(screen.getByRole('heading', { name: 'Synthetic CRM identity' })).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.displayName)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.displayNameZh)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.ageBand)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.originMarket)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.preferredLanguage)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.hostOwner)).toBeInTheDocument();
    expect(screen.getByText(guests[0].preferences.servicePreferences[0])).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('sanitizes unsafe identity values without leaking direct contact details', () => {
    const malformedGuest = {
      ...guests[0],
      profile: {
        ...guests[0].profile,
        displayName: 'HKD raw name',
        displayNameZh: '澳門幣姓名',
        ageBand: 'NaN',
        originMarket: 'Hong Kong',
        preferredLanguage: 'Infinity',
        hostOwner: 'Host Team A',
        contactability: 'Email owner@',
        consentStatus: 'unknown',
        membershipTenureBand: '99999999',
      },
      preferences: {
        favoriteCategories: ['MOP luxury'],
        servicePreferences: ['Call +853 61234567'],
        occasionSignals: ['Email test@example.com'],
      },
    } as unknown as Guest;

    const { container } = render(<GuestIdentityPanel guest={malformedGuest} />);

    expect(screen.getByText('Synthetic guest')).toBeInTheDocument();
    expect(screen.getByText('姓名未顯示')).toBeInTheDocument();
    expect(screen.getByText('No favorite category signal')).toBeInTheDocument();
    expect(screen.getByText('No service preference signal')).toBeInTheDocument();
    expect(screen.getByText('No occasion signal')).toBeInTheDocument();
    expect(screen.getByText('service-only')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(directContactPattern);
    expect(container.textContent).not.toMatch(unsafeTextPattern);
  });
});
