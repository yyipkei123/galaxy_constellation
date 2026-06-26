import { render, screen, within } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { PurchaseHistoryPanel } from './purchase-history-panel';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const directContactPattern = /@|\+\d{6,}|(?:\d[\s-]?){8,}/;

describe('PurchaseHistoryPanel', () => {
  it('renders Galaxy-owned stay and purchase history without currency', () => {
    const { container } = render(<PurchaseHistoryPanel guest={guests[0]} />);

    expect(screen.getByRole('heading', { name: 'Galaxy purchase and stay history' })).toBeInTheDocument();
    expect(screen.getByText('Stay history')).toBeInTheDocument();
    expect(screen.getByText('Purchase history')).toBeInTheDocument();
    expect(screen.getAllByText('Galaxy first-party').length).toBeGreaterThan(0);

    const purchaseList = screen.getByRole('list', { name: 'Purchase history' });
    expect(within(purchaseList).getAllByRole('listitem')).toHaveLength(5);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('renders finite empty states for malformed history arrays', () => {
    const malformedGuest = {
      ...guests[0],
      stayHistory: [],
      purchaseHistory: [
        {
          id: 'bad',
          periodLabel: 'HKD now',
          category: 'fnb',
          merchantArea: 'MOP area',
          itemLabel: '$ item',
          channel: 'Host',
          ticketBand: 'premium',
          galaxyOwned: true,
        },
      ],
    } as unknown as Guest;

    const { container } = render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(screen.getByText('No stay history available')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣|NaN|Infinity/i);
  });

  it('renders purchase empty state for an empty purchase history array', () => {
    const malformedGuest = {
      ...guests[0],
      purchaseHistory: [],
    } as unknown as Guest;

    render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(screen.getByText('No purchase history available')).toBeInTheDocument();
  });

  it('sanitizes direct contact-like values in history items', () => {
    const malformedGuest = {
      ...guests[0],
      stayHistory: [
        {
          id: 'bad-stay',
          periodLabel: 'Call +853 61234567',
          property: 'Email test@example.com',
          nightsBand: '9999 9999',
          roomType: 'Suite',
          occasion: 'Direct line +85263358365',
          satisfactionSignal: 'Positive',
        },
      ],
      purchaseHistory: [
        {
          id: 'bad-purchase',
          periodLabel: 'Email host@example.com',
          category: 'fnb',
          merchantArea: 'Call +853 61234567',
          itemLabel: 'WhatsApp 6335 8365',
          channel: 'Host',
          ticketBand: 'premium',
          galaxyOwned: true,
        },
      ],
    } as unknown as Guest;

    const { container } = render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(container.textContent).not.toMatch(directContactPattern);
  });
});
