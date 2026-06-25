import { render, screen } from '@testing-library/react';
import CorridorDetailPage from './page';

describe('corridor detail route stub', () => {
  it('renders the Korea corridor detail header from params', async () => {
    render(await CorridorDetailPage({ params: Promise.resolve({ id: 'korea' }) }));

    expect(screen.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeInTheDocument();
    expect(screen.getByText(/2020 base · refresh pending/i)).toBeInTheDocument();
  });
});
