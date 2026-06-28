import { render, screen, within } from '@testing-library/react';
import GovernancePage from './page';

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|\braw spend\b/i;

describe('governance route', () => {
  it('renders data governance controls and assistant grounding copy', () => {
    const { container } = render(<GovernancePage />);

    expect(screen.getByRole('heading', { name: 'Data Governance', level: 1 })).toBeInTheDocument();

    const panel = screen.getByRole('region', { name: 'Data governance' });
    expect(within(panel).getByText(/10–20% panel/i)).toBeInTheDocument();
    expect(within(panel).getByText(/63% matched/i)).toBeInTheDocument();
    expect(within(panel).getByText(/no PII/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Assistant grounding' })).toBeInTheDocument();
    expect(screen.getByText(/Ask CDE AI/i)).toBeInTheDocument();
    expect(screen.getByText(/audit expander/i)).toBeInTheDocument();
    expect(screen.getByText(/Source field/i)).toBeInTheDocument();
    expect(screen.getByText(/Route field/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});
