import { render, screen, within } from '@testing-library/react';
import { methodology } from '@/data';
import { GovernanceSummaryPanel } from './governance-summary-panel';

const bannedCdeTokenPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|\braw spend\b/i;

describe('GovernanceSummaryPanel', () => {
  it('renders governed methodology coverage and privacy controls without banned CDE tokens', () => {
    const { container } = render(<GovernanceSummaryPanel methodology={methodology} />);

    const panel = screen.getByRole('region', { name: 'Data governance' });

    expect(within(panel).getByRole('heading', { name: 'Data governance' })).toBeInTheDocument();
    expect(within(panel).getByText(/10–20% panel/i)).toBeInTheDocument();
    expect(within(panel).getByText(/63% matched/i)).toBeInTheDocument();
    expect(within(panel).getByText('PIPL')).toBeInTheDocument();
    expect(within(panel).getByText('HK PDPO')).toBeInTheDocument();
    expect(within(panel).getByText('Macau PDPA')).toBeInTheDocument();
    expect(within(panel).getByText(/no PII/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCdeTokenPattern);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});
