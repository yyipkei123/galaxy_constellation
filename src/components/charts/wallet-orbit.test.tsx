import { render, screen } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { WalletOrbit } from './wallet-orbit';

const bannedCurrencyPattern = /\b(?:HKD|MOP)\b|\$|元|澳門幣/i;

function widthPercentages(container: Element) {
  return Array.from(container.querySelectorAll<HTMLElement>('[style*="width"]')).map((node) => {
    const width = node.style.width.replace('%', '');
    return Number(width);
  });
}

describe('WalletOrbit', () => {
  it('renders capture and leakage by category without currency text', () => {
    render(<WalletOrbit guest={guests[0]} />);

    const figure = screen.getByRole('figure', { name: /Wallet orbit/i });
    expect(figure).toBeInTheDocument();
    expect(screen.getByText(/hospitality/i)).toBeInTheDocument();
    expect(figure).toHaveTextContent(/Index|%/);
    expect(figure).not.toHaveTextContent(bannedCurrencyPattern);
  });

  it('clamps malformed category percentages to finite bar widths', () => {
    const malformedGuest = {
      ...guests[0],
      cde: {
        ...guests[0].cde,
        categoryCapturePct: {
          hospitality: 140,
          fnb: -22,
          entertainment: Number.POSITIVE_INFINITY,
          retailLuxury: Number.NaN,
        },
        categoryLeakagePct: {
          hospitality: -40,
          fnb: 122,
          entertainment: Number.NEGATIVE_INFINITY,
          retailLuxury: Number.NaN,
        },
        categoryWalletIndex: {
          hospitality: 180,
          fnb: Number.POSITIVE_INFINITY,
          entertainment: Number.NaN,
          retailLuxury: 96,
        },
      },
    } as Guest;

    render(<WalletOrbit guest={malformedGuest} />);

    const figure = screen.getByRole('figure', { name: /Wallet orbit/i });
    expect(figure).not.toHaveTextContent(/NaN|Infinity/);
    expect(figure).not.toHaveTextContent(bannedCurrencyPattern);

    for (const width of widthPercentages(figure)) {
      expect(Number.isFinite(width)).toBe(true);
      expect(width).toBeGreaterThanOrEqual(0);
      expect(width).toBeLessThanOrEqual(100);
    }
  });
});
