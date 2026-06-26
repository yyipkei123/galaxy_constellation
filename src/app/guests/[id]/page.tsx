import Link from 'next/link';
import { WalletOrbit } from '@/components/charts/wallet-orbit';
import { FusionPanel } from '@/components/panels/fusion-panel';
import { GuestIdentityPanel } from '@/components/panels/guest-identity-panel';
import { GuestProfileHeader } from '@/components/panels/guest-profile-header';
import { GuestTimeline } from '@/components/panels/guest-timeline';
import { HostBriefingPanel } from '@/components/panels/host-briefing-panel';
import { NbaRecommendationCard } from '@/components/panels/nba-recommendation-card';
import { PitchScriptCard } from '@/components/panels/pitch-script-card';
import { PurchaseHistoryPanel } from '@/components/panels/purchase-history-panel';
import { SectionJumpNav } from '@/components/ui/section-jump-nav';
import { getGuestById, guests } from '@/data';

function decodeGuestParam(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export function generateStaticParams() {
  return guests.map((guest) => ({ id: guest.id }));
}

export default async function GuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guest = getGuestById(decodeGuestParam(id));

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
      <SectionJumpNav
        label="Customer 360 sections"
        currentId="guest-brief"
        items={[
          { id: 'guest-brief', label: 'Brief' },
          { id: 'guest-evidence', label: 'Evidence' },
          { id: 'guest-actions', label: 'Actions' },
          { id: 'guest-history', label: 'History' },
        ]}
      />
      <HostBriefingPanel guest={guest} />
      <section id="guest-evidence" className="scroll-mt-24 space-y-6" aria-label="Customer evidence">
        <GuestIdentityPanel guest={guest} />
        <FusionPanel guest={guest} />
      </section>
      <div id="guest-actions" className="grid scroll-mt-24 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
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
      <section id="guest-history" className="scroll-mt-24">
        <PurchaseHistoryPanel guest={guest} />
      </section>
    </div>
  );
}
