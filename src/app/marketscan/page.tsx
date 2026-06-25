import { Panel } from '@/components/ui/panel';
import { PageHeader } from '@/components/ui/page-header';
import { marketScanTiles } from '@/data';

export default function MarketScanPage() {
  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Market context"
        title="Market Scan"
        description={(
          <>
            Review synthetic competitor calendar, social sentiment, PR/news, share-of-voice, and footfall signals
            alongside CDE opportunity sizing.
          </>
        )}
      />

      <section className="grid gap-4 md:grid-cols-2">
        {marketScanTiles.map((tile) => (
          <Panel key={tile.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
              {tile.sourceType}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">{tile.title}</h2>
            <p className="mt-4 text-sm leading-6 text-galaxy-muted">{tile.signal}</p>
            <p className="mt-4 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-cream">
              {tile.implication}
            </p>
          </Panel>
        ))}
      </section>
    </div>
  );
}
