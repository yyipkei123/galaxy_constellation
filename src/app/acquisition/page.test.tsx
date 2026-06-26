import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import AcquisitionPage from './page';

const mockNavigation = vi.hoisted(() => ({
  search: 'corridor=korea&persona=entertainment_lover',
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mockNavigation.search),
}));

describe('acquisition route', () => {
  beforeEach(() => {
    mockNavigation.search = 'corridor=korea&persona=entertainment_lover';
  });

  it('renders priority corridor recommendation and templated content hand-off', () => {
    render(<AcquisitionPage />);

    const header = screen.getByRole('region', { name: 'Priority Corridor Acquisition' });
    expect(within(header).getByRole('heading', { name: 'Priority Corridor Acquisition', level: 1 })).toBeInTheDocument();
    expect(within(header).getByText(/Turn Korea corridor intelligence/i)).toBeInTheDocument();
    expect(within(header).getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Target personas/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Content draft/i })).toBeInTheDocument();
    expect(screen.getByText(/No live model call/i)).toBeInTheDocument();
  });

  it('falls back to default priority corridor params', () => {
    mockNavigation.search = '';

    render(<AcquisitionPage />);

    expect(screen.getByRole('heading', { name: 'Korea: Merging to the World' })).toBeInTheDocument();
    expect(screen.getByText('Why #1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Korea Entertainment Lover: Merging to the World' })).toBeInTheDocument();
  });

  it('falls back to corridor top persona for invalid persona params', () => {
    mockNavigation.search = 'corridor=taiwan&persona=invalid_persona';

    render(<AcquisitionPage />);

    const contentDraft = screen.getByRole('heading', { name: /Content draft/i }).closest('section');
    expect(contentDraft).not.toBeNull();
    expect(within(contentDraft as HTMLElement).getByRole('heading', { name: 'Taiwan Luxury Shopper: Taiwan acquisition' })).toBeInTheDocument();
  });

  it('uses rank-aware copy for non-priority selected corridors', () => {
    mockNavigation.search = 'corridor=japan&persona=entertainment_lover';

    render(<AcquisitionPage />);

    expect(screen.getByRole('heading', { name: 'Japan: Selected corridor' })).toBeInTheDocument();
    expect(screen.getByText('Rank #3')).toBeInTheDocument();
    expect(screen.getByText('Why this corridor')).toBeInTheDocument();
    expect(screen.queryByText('Why #1')).not.toBeInTheDocument();
    expect(screen.queryByText(/first acquisition corridor/i)).not.toBeInTheDocument();
  });

  it('renders duplicate-language corridors with one draft language chip per label', () => {
    mockNavigation.search = 'corridor=taiwan&persona=luxury_shopper';

    render(<AcquisitionPage />);

    const contentDraft = screen.getByRole('heading', { name: /Content draft/i }).closest('section');
    expect(contentDraft).not.toBeNull();
    expect(within(contentDraft as HTMLElement).getAllByText('EN')).toHaveLength(1);
    expect(within(contentDraft as HTMLElement).getAllByText('繁中')).toHaveLength(1);
  });
});
