import type { Guest, NbaChannel } from '@/data';

const channels: NbaChannel[] = ['online', 'physical', 'host'];

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeChannel(value: unknown): NbaChannel {
  return channels.includes(value as NbaChannel) ? value as NbaChannel : 'host';
}

export function GuestTimeline({ guest }: { guest: Guest }) {
  const recencyDays = safeNumber(guest?.firstParty?.recencyDays, -1);
  const diningVisits = Math.max(0, Math.round(safeNumber(guest?.firstParty?.diningVisits)));
  const nextAction = Array.isArray(guest?.nextBestActions) ? guest.nextBestActions[0] : undefined;
  const channel = safeChannel(nextAction?.channel);
  const events = [
    recencyDays >= 0
      ? `${Math.round(recencyDays)} days ago · last Galaxy touchpoint`
      : 'No recent Galaxy touchpoint',
    `${diningVisits} dining visits L12M`,
    `Next best moment · ${channel} outreach`,
  ];

  return (
    <section className="galaxy-panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Guest journey timeline</p>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {events.map((event) => (
          <li
            key={event}
            className="galaxy-tile p-3 text-sm text-galaxy-muted"
          >
            {event}
          </li>
        ))}
      </ol>
    </section>
  );
}
