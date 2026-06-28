import type {
  AcquisitionDraft,
  CampaignCreativeLanguage,
  CampaignCreativeVariant,
  Corridor,
  PersonaKey,
} from '@/data';
import { formatEnriched } from './format';

export type MeasurementReadyAcquisitionDraft = Omit<AcquisitionDraft, 'languages' | 'variants'> & {
  languages: CampaignCreativeLanguage[];
  variants: CampaignCreativeVariant[];
};

const measurementLanguages = ['EN', '繁中', '한국어'] satisfies CampaignCreativeLanguage[];
const cdeUnsafePattern = /HKD|MOP|\$|元|澳門幣|NaN|Infinity/i;
const guardrail = 'Brand voice and compliance guardrail: no raw spend, no PII, CDE-safe indexed or banded signals only.';

function findPersona(corridor: Corridor, personaKey: string | null | undefined) {
  return corridor.personas.find((persona) => persona.persona === personaKey) ?? corridor.personas[0];
}

function assertCdeSafe(draft: MeasurementReadyAcquisitionDraft) {
  if (cdeUnsafePattern.test(JSON.stringify(draft))) {
    throw new Error('Acquisition draft contains currency or unsafe CDE tokens');
  }
}

export function buildAcquisitionDraft(
  corridor: Corridor,
  personaKey: PersonaKey | string | null | undefined,
): MeasurementReadyAcquisitionDraft {
  const persona = findPersona(corridor, personaKey);
  const theme = corridor.note ?? `${corridor.name} acquisition`;
  const projectedValueBand = formatEnriched(corridor.projectedValueBand, 'band');
  const categoryList = persona.topCategories.join(', ');
  const zhCategoryList = persona.topCategories.join('、');
  const languages = [...measurementLanguages];

  const draft: MeasurementReadyAcquisitionDraft = {
    corridorId: corridor.id,
    persona: persona.persona,
    languages,
    variants: [
      {
        id: 'A',
        language: 'EN',
        subject: `${corridor.name} ${persona.label}: ${theme}`,
        body: `Invite ${corridor.name} ${persona.label} travelers with ${persona.recommendedOffer} under ${theme}. Use labelled Mastercard CDE indices with a 100 baseline and ${projectedValueBand} opportunity bands only.`,
        guardrail,
      },
      {
        id: 'B',
        language: 'EN',
        subject: `${persona.label} escape for ${corridor.name}`,
        body: `Position Galaxy Rewards around ${categoryList} and keep the message indexed, directional, and refresh-aware. Feature ${persona.recommendedOffer} as the action hook.`,
        guardrail,
      },
      {
        id: 'A',
        language: '繁中',
        subject: `${corridor.name} ${persona.label}: ${theme}`,
        body: `以 ${theme} 向 ${corridor.name} ${persona.label} 旅客推介 ${persona.recommendedOffer}。只使用 Mastercard CDE 標籤指數、100 baseline 與 ${projectedValueBand} 機會帶。`,
        guardrail,
      },
      {
        id: 'B',
        language: '繁中',
        subject: `${corridor.name} ${persona.label} Rewards journey`,
        body: `圍繞 ${zhCategoryList} 安排 Galaxy Rewards 訊息，保持 indexed、directional、refresh-aware，並以 ${persona.kvBrief} 作創意線索。`,
        guardrail,
      },
      {
        id: 'A',
        language: '한국어',
        subject: `${corridor.name} ${persona.label}: Rewards 여정`,
        body: `${theme} 테마로 ${corridor.name} ${persona.label} 고객에게 ${persona.recommendedOffer}를 제안합니다. Mastercard CDE 지수, 100 baseline, ${projectedValueBand} 기회 구간만 사용합니다.`,
        guardrail,
      },
      {
        id: 'B',
        language: '한국어',
        subject: `${corridor.name} ${persona.label} Galaxy Rewards path`,
        body: `Galaxy Rewards 메시지는 ${categoryList} 중심으로 구성하고 ${persona.kvBrief}를 창의 방향으로 사용합니다. indexed, directional, refresh-aware 표현만 사용합니다.`,
        guardrail,
      },
    ],
    versionHistory: ['v1 corridor signal', 'v2 persona offer', 'v3 compliance copy', 'v4 measurement-ready launch'],
  };

  assertCdeSafe(draft);

  return draft;
}
