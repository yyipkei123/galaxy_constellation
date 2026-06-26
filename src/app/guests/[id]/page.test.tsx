import { render, screen } from '@testing-library/react';
import { guests } from '@/data';
import GuestDetailPage, { generateStaticParams } from './page';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('guest detail route', () => {
  it('provides raw static params for generated guests', () => {
    const params = generateStaticParams();

    expect(params).toContainEqual({ id: guests[0].id });
  });

  it('renders Customer 360 fusion, recommendations, and bilingual pitch from an encoded id', async () => {
    const { container } = render(await GuestDetailPage({ params: Promise.resolve({ id: encodeURIComponent(guests[0].id) }) }));

    expect(screen.getByRole('heading', { name: /Customer 360/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Synthetic CRM identity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Galaxy purchase and stay history' })).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.displayName)).toBeInTheDocument();
    expect(screen.getByText(guests[0].profile.originMarket)).toBeInTheDocument();
    expect(screen.getByText('What Galaxy sees')).toBeInTheDocument();
    expect(screen.getByText('What Mastercard CDE adds')).toBeInTheDocument();
    expect(screen.getByText('Fused opportunity')).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /Wallet orbit/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Next-Best-Action/i })).toBeInTheDocument();
    expect(screen.getByText('Suggested pitch script')).toBeInTheDocument();
    expect(screen.getByText('繁中')).toBeInTheDocument();
    expect(screen.getByText('Guest journey timeline')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('also resolves a decoded masked id for direct unit rendering', async () => {
    render(await GuestDetailPage({ params: Promise.resolve({ id: guests[0].id }) }));

    expect(screen.getByText(guests[0].id)).toBeInTheDocument();
  });

  it('renders a not-found message for an unknown masked id with a safe back link', async () => {
    render(await GuestDetailPage({ params: Promise.resolve({ id: encodeURIComponent('MEM-••••0000') }) }));

    expect(screen.getByText('Guest profile not found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Lead Board/i })).toHaveAttribute('href', '/guests');
  });
});
