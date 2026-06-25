import { render, screen } from '@testing-library/react';
import CorridorDetailPage from './page';

describe('corridor detail route', () => {
  it('renders Korea detail with required refresh tag and activation bridge', async () => {
    render(await CorridorDetailPage({ params: Promise.resolve({ id: 'korea' }) }));

    expect(screen.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeInTheDocument();
    expect(screen.getByText('2020 base · refresh pending')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Persona mix/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Seasonality and channel signals/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Generate campaign content/i })).toHaveAttribute(
      'href',
      '/acquisition?corridor=korea&persona=entertainment_lover',
    );
  });

  it('falls back to the priority corridor for an unknown id', async () => {
    render(await CorridorDetailPage({ params: Promise.resolve({ id: 'unknown' }) }));

    expect(screen.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeInTheDocument();
  });
});
