import { render, screen } from '@testing-library/react';
import { guests, type Guest } from '@/data';
import { PitchScriptCard } from './pitch-script-card';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('PitchScriptCard', () => {
  it('renders bilingual pitch scripts for a guest', () => {
    const { container } = render(<PitchScriptCard guest={guests[0]} />);

    expect(screen.getByText('Suggested pitch script')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('繁中')).toBeInTheDocument();
    expect(screen.getByText(guests[0].pitchScript.en)).toBeInTheDocument();
    expect(screen.getByText(guests[0].pitchScript.zh)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });

  it('falls back when pitch text contains banned CDE currency tokens', () => {
    const malformedGuest = {
      ...guests[0],
      pitchScript: {
        en: 'Offer HKD $500 value',
        zh: '澳門幣500元禮遇',
      },
    } as unknown as Guest;

    const { container } = render(<PitchScriptCard guest={malformedGuest} />);

    expect(screen.getByText('Use Galaxy relationship context and the strongest CDE opportunity to invite this guest into the next best experience.')).toBeInTheDocument();
    expect(screen.getByText('根據 Galaxy 關係脈絡及 CDE 機會訊號，邀請會員體驗最合適的下一步禮遇。')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(bannedCurrencyPattern);
  });
});
