import type { Guest, GuestConsentStatus } from '@/data';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/gi;
const directContactPattern = /@|\+\d{6,}|(?:\d[\s-]?){8,}/g;
const nonFinitePattern = /NaN|Infinity/gi;

function safeText(value: unknown, fallback: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const rawValue = String(value);
  if (
    bannedCurrencyPattern.test(rawValue) ||
    directContactPattern.test(rawValue) ||
    nonFinitePattern.test(rawValue)
  ) {
    bannedCurrencyPattern.lastIndex = 0;
    directContactPattern.lastIndex = 0;
    nonFinitePattern.lastIndex = 0;
    return fallback;
  }

  bannedCurrencyPattern.lastIndex = 0;
  directContactPattern.lastIndex = 0;
  nonFinitePattern.lastIndex = 0;

  const cleaned = rawValue.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function safeList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;

  const cleaned = value
    .map((item) => safeText(item, ''))
    .filter(Boolean)
    .slice(0, 4);

  return cleaned.length > 0 ? cleaned : fallback;
}

function consentLabel(value: unknown): GuestConsentStatus {
  return value === 'service-only' ? 'service-only' : 'marketable';
}

export function GuestIdentityPanel({ guest }: { guest: Guest }) {
  const profile = guest?.profile;
  const preferences = guest?.preferences;
  const displayName = safeText(profile?.displayName, 'Synthetic guest');
  const displayNameZh = safeText(profile?.displayNameZh, '姓名未顯示');
  const favoriteCategories = safeList(preferences?.favoriteCategories, ['No favorite category signal']);
  const servicePreferences = safeList(preferences?.servicePreferences, ['No service preference signal']);
  const occasionSignals = safeList(preferences?.occasionSignals, ['No occasion signal']);

  return (
    <section className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            First-party profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-galaxy-cream">Synthetic CRM identity</h2>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">
            Demo-only synthetic identity linked to the masked member ID. No real PII is shown.
          </p>
        </div>
        <span className="rounded border border-galaxy-gold/35 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold text-galaxy-gold">
          Synthetic
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="text-sm font-semibold text-galaxy-cream">{displayName}</p>
          <p className="mt-1 text-sm text-galaxy-muted">{displayNameZh}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-galaxy-muted">Age band</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.ageBand, 'Unknown')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Origin market</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.originMarket, 'Unknown')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Travel party</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.travelParty, 'Unknown')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Language</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.preferredLanguage, 'Unknown')}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-galaxy-muted">Host owner</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.hostOwner, 'Host Team')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Contactability</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.contactability, 'Service channel')}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Consent</dt>
              <dd className="font-semibold text-galaxy-cream">{consentLabel(profile?.consentStatus)}</dd>
            </div>
            <div>
              <dt className="text-galaxy-muted">Tenure</dt>
              <dd className="font-semibold text-galaxy-cream">{safeText(profile?.membershipTenureBand, 'Unknown')}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="font-semibold text-galaxy-gold">Favorite signals</p>
          <ul className="mt-3 space-y-2 text-galaxy-muted">
            {favoriteCategories.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="font-semibold text-galaxy-gold">Service preferences</p>
          <ul className="mt-3 space-y-2 text-galaxy-muted">
            {servicePreferences.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="font-semibold text-galaxy-gold">Occasion signals</p>
          <ul className="mt-3 space-y-2 text-galaxy-muted">
            {occasionSignals.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
