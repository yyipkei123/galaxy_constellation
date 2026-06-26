import type { AcquisitionDraft, Corridor, PersonaKey } from '@/data';
import { formatEnriched } from './format';

function findPersona(corridor: Corridor, personaKey: string | null | undefined) {
  return corridor.personas.find((persona) => persona.persona === personaKey) ?? corridor.personas[0];
}

function uniqueLanguages(languages: AcquisitionDraft['languages']): AcquisitionDraft['languages'] {
  return languages.filter((language, index) => languages.indexOf(language) === index);
}

export function buildAcquisitionDraft(corridor: Corridor, personaKey: PersonaKey | string | null | undefined): AcquisitionDraft {
  const persona = findPersona(corridor, personaKey);
  const theme = corridor.note ?? `${corridor.name} acquisition`;
  const projectedValueBand = formatEnriched(corridor.projectedValueBand, 'band');
  const languages = uniqueLanguages(['EN', '繁中', corridor.languageLabel as AcquisitionDraft['languages'][number]]);

  return {
    corridorId: corridor.id,
    persona: persona.persona,
    languages,
    variants: [
      {
        id: 'A',
        subject: `${corridor.name} ${persona.label}: ${theme}`,
        body: `Invite ${corridor.name} ${persona.label} travelers with ${persona.recommendedOffer} under ${theme}. Use labelled Mastercard CDE indices with a 100 baseline and ${projectedValueBand} opportunity bands only.`,
        kvCaption: `${theme}: ${persona.kvBrief}`,
      },
      {
        id: 'B',
        subject: `${persona.label} escape for ${corridor.name}`,
        body: `Position Galaxy Rewards around ${persona.topCategories.join(', ')} and keep the message indexed, directional, and refresh-aware.`,
        kvCaption: `${persona.recommendedOffer} · ${corridor.languageLabel} ready`,
      },
    ],
    versionHistory: ['v1 corridor signal', 'v2 persona offer', 'v3 compliance copy'],
  };
}
