import { render, screen } from '@testing-library/react';
import CorridorsPage from './page';

describe('corridors route stub', () => {
  it('renders the Lens B route header and aggregate panel note', () => {
    render(<CorridorsPage />);

    expect(screen.getByRole('heading', { name: 'Source-Market & Corridor Intelligence', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/10–20% panel/i)).toBeInTheDocument();
    expect(screen.getByText(/aggregate inbound panel, no PII/i)).toBeInTheDocument();
  });
});
