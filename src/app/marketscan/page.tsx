import { Panel } from '@/components/ui/panel';
import { Overline } from '@/components/ui/overline';
import { marketScanTiles } from '@/data';

export default function MarketScanPage() {
  return (
    <div className="space-y-6 text-galaxy-cream">
      <section className="rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_left,rgba(205,164,92,0.18),transparent_34%),linear-gradient(135deg,rgba(31,27,24,0.96),rgba(8,18,30,0.92))] px-6 py-8 shadow-2xl shadow-black/25 md:px-8">
        <Overline>Illustrative companion</Overline>
        <h1 className="mt-3 font-serif text-5xl text-galaxy-cream md:text-6xl">Market Scan</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
          This illustrative market-scan companion is a synthetic board for competitor calendar, social sentiment,
          PR/news, share of voice, and footfall signals that an analyst could use alongside CDE opportunity sizing.
        </p>
      </section>

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
