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
    expect(screen.getByText('No purchase history available')).toBeInTheDocument();
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

  it('drops primitive and missing-field history items before rendering history lists', () => {
    const malformedGuest = {
      ...guests[0],
      stayHistory: [
        'bad primitive',
        {},
        { id: 'not-generated', periodLabel: 'Last month' },
      ],
      purchaseHistory: [
        'bad primitive',
        {},
        { category: 'fnb' },
        { category: 'not-real', itemLabel: 'Chef-led dinner', merchantArea: 'Fine dining', periodLabel: 'Recent' },
      ],
    } as unknown as Guest;

    render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(screen.getByText('No stay history available')).toBeInTheDocument();
    expect(screen.getByText('No purchase history available')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Stay history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Purchase history' })).not.toBeInTheDocument();
  });

  it('handles non-array history values as empty states', () => {
    const malformedGuest = {
      ...guests[0],
      stayHistory: { id: '3421-stay-1', property: 'Galaxy Hotel' },
      purchaseHistory: '3421-purchase-1',
    } as unknown as Guest;

    render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(screen.getByText('No stay history available')).toBeInTheDocument();
    expect(screen.getByText('No purchase history available')).toBeInTheDocument();
  });

  it('drops history items with actual non-finite values before rendering fallback cards', () => {
    const malformedGuest = {
      ...guests[0],
      stayHistory: [
        {
          id: 'not-generated',
          periodLabel: Number.NaN,
          property: Number.POSITIVE_INFINITY,
          roomType: Number.NaN,
          nightsBand: '2-3 nights',
          occasion: 'Short break',
          satisfactionSignal: 'Positive',
        },
      ],
      purchaseHistory: [
        {
          id: 'not-generated',
          periodLabel: Number.NaN,
          category: 'fnb',
          merchantArea: Number.POSITIVE_INFINITY,
          itemLabel: Number.NaN,
          channel: 'Host',
          ticketBand: 'premium',
          galaxyOwned: true,
        },
      ],
    } as unknown as Guest;

    const { container } = render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(screen.getByText('No stay history available')).toBeInTheDocument();
    expect(screen.getByText('No purchase history available')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/NaN|Infinity/i);
  });

  it('drops generated-looking stay ids when display fields are missing or unsafe', () => {
    const malformedGuest = {
      ...guests[0],
      stayHistory: [
        {
          id: '1234-stay-1',
          periodLabel: 'HKD current',
          property: 'Email test@example.com',
          roomType: Number.NaN,
          nightsBand: '2-3 nights',
          occasion: 'Short break',
          satisfactionSignal: 'Positive',
        },
      ],
    } as unknown as Guest;

    render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(screen.getByText('No stay history available')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Stay history' })).not.toBeInTheDocument();
  });

  it('drops generated-looking purchase ids when category is valid but display fields are missing or unsafe', () => {
    const malformedGuest = {
      ...guests[0],
      purchaseHistory: [
        {
          id: '1234-purchase-1',
          periodLabel: 'MOP current',
          category: 'fnb',
          merchantArea: 'Call +853 61234567',
          itemLabel: Number.POSITIVE_INFINITY,
          channel: 'Host',
          ticketBand: 'premium',
          galaxyOwned: true,
        },
      ],
    } as unknown as Guest;

    render(<PurchaseHistoryPanel guest={malformedGuest} />);

    expect(screen.getByText('No purchase history available')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Purchase history' })).not.toBeInTheDocument();
  });

  it('does not render malformed long ticket band tokens', () => {
    const malformedTicketBand = `premium-${'x'.repeat(160)}`;
    const malformedGuest = {
      ...guests[0],
      purchaseHistory: [
        {
          ...guests[0].purchaseHistory[0],
          ticketBand: malformedTicketBand,
        },
      ],
    } as unknown as Guest;

    const { container } = render(<PurchaseHistoryPanel guest={malformedGuest} />);
    const purchaseList = screen.getByRole('list', { name: 'Purchase history' });

    expect(within(purchaseList).getAllByRole('listitem')).toHaveLength(1);
    expect(within(purchaseList).getByText('band')).toBeInTheDocument();
    expect(container.textContent).not.toContain(malformedTicketBand);
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
