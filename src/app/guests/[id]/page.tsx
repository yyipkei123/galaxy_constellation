import Link from 'next/link';
import { WalletOrbit } from '@/components/charts/wallet-orbit';
import { FusionPanel } from '@/components/panels/fusion-panel';
import { GuestProfileHeader } from '@/components/panels/guest-profile-header';
import { GuestTimeline } from '@/components/panels/guest-timeline';
import { NbaRecommendationCard } from '@/components/panels/nba-recommendation-card';
import { PitchScriptCard } from '@/components/panels/pitch-script-card';
import { getGuestById, guests } from '@/data';

function decodeGuestParam(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export function generateStaticParams() {
  return guests.map((guest) => ({ id: encodeURIComponent(guest.id) }));
}

export default function GuestDetailPage({ params }: { params: { id: string } }) {
  const guest = getGuestById(decodeGuestParam(params.id));

  if (!guest) {
    return (
      <div className="space-y-4 text-galaxy-cream">
        <p className="text-galaxy-muted">Guest profile not found.</p>
        <Link
          href="/guests"
          className="inline-flex rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink"
        >
          Back to Lead Board
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-galaxy-cream">
      <GuestProfileHeader guest={guest} />
      <FusionPanel guest={guest} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-galaxy-cream">Next-Best-Action</h2>
          {guest.nextBestActions.map((rec) => (
            <NbaRecommendationCard key={rec.offer} rec={rec} />
          ))}
          <PitchScriptCard guest={guest} />
          <GuestTimeline guest={guest} />
        </div>
        <WalletOrbit guest={guest} />
      </div>
    </div>
  );
}
