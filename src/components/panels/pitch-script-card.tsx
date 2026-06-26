import type { Guest } from '@/data';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const nonFinitePattern = /NaN|Infinity/i;

const fallbackEnglishPitch = 'Use Galaxy relationship context and the strongest CDE opportunity to invite this guest into the next best experience.';
const fallbackTraditionalChinesePitch = '根據 Galaxy 關係脈絡及 CDE 機會訊號，邀請會員體驗最合適的下一步禮遇。';

function safePitch(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  if (bannedCurrencyPattern.test(value) || nonFinitePattern.test(value)) return fallback;

  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

export function PitchScriptCard({ guest }: { guest: Guest }) {
  const englishPitch = safePitch(guest?.pitchScript?.en, fallbackEnglishPitch);
  const traditionalChinesePitch = safePitch(guest?.pitchScript?.zh, fallbackTraditionalChinesePitch);

  return (
    <section className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Suggested pitch script</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="font-semibold text-galaxy-cream">EN</p>
          <p className="mt-2 break-words text-sm leading-6 text-galaxy-muted">{englishPitch}</p>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-galaxy-cream">繁中</p>
          <p className="mt-2 break-words text-sm leading-6 text-galaxy-muted">{traditionalChinesePitch}</p>
        </div>
      </div>
    </section>
  );
}
