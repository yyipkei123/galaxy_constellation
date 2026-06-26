import { render, screen, within } from '@testing-library/react';
import { guests } from '@/data';
import GuestDetailPage, { generateStaticParams } from './page';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

function closestSection(element: HTMLElement) {
  const section = element.closest('section');
  if (!section) {
    throw new Error('Expected element to be rendered inside a section');
  }

  return section;
}

function parentElement(element: HTMLElement) {
  const parent = element.parentElement;
  if (!parent) {
    throw new Error('Expected element to have a parent element');
  }

  return parent;
}

describe('guest detail route', () => {
  it('provides raw static params for generated guests', () => {
    const params = generateStaticParams();

    expect(params).toContainEqual({ id: guests[0].id });
  });

  it('renders Customer 360 fusion, recommendations, and bilingual pitch from an encoded id', async () => {
    const { container } = render(await GuestDetailPage({ params: Promise.resolve({ id: encodeURIComponent(guests[0].id) }) }));

    expect(screen.getByRole('heading', { name: /Customer 360/i })).toBeInTheDocument();
    const identitySection = closestSection(screen.getByRole('heading', { name: 'Synthetic CRM identity' }));
    const historySection = closestSection(screen.getByRole('heading', { name: 'Galaxy purchase and stay history' }));
    const walletGrid = parentElement(screen.getByRole('figure', { name: /Wallet orbit/i }));

    expect(within(identitySection).getByText(guests[0].profile.displayName)).toBeInTheDocument();
    expect(within(identitySection).getByText(guests[0].profile.originMarket)).toBeInTheDocument();
    expect(screen.getByText('What Galaxy sees')).toBeInTheDocument();
    expect(screen.getByText('What Mastercard CDE adds')).toBeInTheDocument();
    expect(screen.getByText('Fused opportunity')).toBeInTheDocument();
    expect(walletGrid).toHaveClass('grid', 'xl:grid-cols-[minmax(0,1fr)_24rem]');
    expect(walletGrid).not.toContainElement(historySection);
    expect(walletGrid.nextElementSibling).toBe(historySection.closest('#guest-history'));
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

  it('places a host briefing and section navigation near the top of Customer 360', async () => {
    render(await GuestDetailPage({ params: Promise.resolve({ id: guests[0].id }) }));

    const nav = screen.getByRole('navigation', { name: 'Customer 360 sections' });
    const briefing = screen.getByRole('region', { name: 'Host briefing summary' });

    expect(within(nav).getByRole('link', { name: 'Brief' })).toHaveAttribute('href', '#guest-brief');
    expect(within(nav).getByRole('link', { name: 'Evidence' })).toHaveAttribute('href', '#guest-evidence');
    expect(within(nav).getByRole('link', { name: 'Actions' })).toHaveAttribute('href', '#guest-actions');
    expect(within(nav).getByRole('link', { name: 'History' })).toHaveAttribute('href', '#guest-history');
    expect(within(briefing).getByText(/Reason to contact now/i)).toBeInTheDocument();
    expect(within(briefing).getByText(/Next action/i)).toBeInTheDocument();
  });

  it('renders a not-found message for an unknown masked id with a safe back link', async () => {
    render(await GuestDetailPage({ params: Promise.resolve({ id: encodeURIComponent('MEM-••••0000') }) }));

    expect(screen.getByText('Guest profile not found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Lead Board/i })).toHaveAttribute('href', '/guests');
  });
});
