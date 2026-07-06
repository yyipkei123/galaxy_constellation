import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('theme alignment contract', () => {
  const globalsCss = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const panelSource = readFileSync(join(process.cwd(), 'src/components/ui/panel.tsx'), 'utf8');
  const pageHeaderSource = readFileSync(join(process.cwd(), 'src/components/ui/page-header.tsx'), 'utf8');
  const storyStripSource = readFileSync(join(process.cwd(), 'src/components/presentation/story-action-strip.tsx'), 'utf8');
  const redesignSource = readFileSync(
    join(process.cwd(), 'src/components/redesign/constellation-redesign-screen.tsx'),
    'utf8',
  );
  const guestDetailSource = readFileSync(join(process.cwd(), 'src/app/guests/[id]/page.tsx'), 'utf8');

  it('defines shared dashboard theme primitives for panels, tiles, and CTAs', () => {
    expect(globalsCss).toContain('.galaxy-panel');
    expect(globalsCss).toContain('.galaxy-tile');
    expect(globalsCss).toContain('.galaxy-hero-panel');
    expect(globalsCss).toContain('.galaxy-cta-primary');
    expect(globalsCss).toContain('.galaxy-cta-secondary');
  });

  it('routes shared layout components through the aligned panel primitives', () => {
    expect(panelSource).toContain("default: 'galaxy-panel'");
    expect(panelSource).toContain("glass: 'galaxy-panel");
    expect(panelSource).toContain("hero: 'galaxy-hero-panel");
    expect(pageHeaderSource).toContain('galaxy-hero-panel');
    expect(storyStripSource).toContain('galaxy-panel');
    expect(storyStripSource).toContain('galaxy-tile');
  });

  it('keeps redesigned route containers on the 14px panel and 12px tile radius system', () => {
    expect(redesignSource).not.toContain('rounded-[24px]');
    expect(redesignSource).not.toContain('rounded-[20px]');
    expect(redesignSource).not.toContain('rounded-[18px]');
    expect(redesignSource).toContain('galaxy-panel');
    expect(redesignSource).toContain('galaxy-tile');
    expect(redesignSource).toContain('galaxy-cta-primary');
    expect(redesignSource).toContain('galaxy-cta-secondary');
  });

  it('uses aligned CTA styling for Customer 360 fallback actions', () => {
    expect(guestDetailSource).toContain('galaxy-cta-primary');
    expect(guestDetailSource).not.toContain('rounded-md bg-galaxy-gold');
  });
});
