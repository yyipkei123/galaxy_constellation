import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('prototype style contract', () => {
  const layoutSource = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
  const globalsCss = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const nextConfigSource = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8');

  it('uses the prototype Manrope sans font with Cormorant display', () => {
    expect(layoutSource).toContain('Cormorant_Garamond');
    expect(layoutSource).toContain('Manrope');
    expect(layoutSource).not.toContain('Geist,');
  });

  it('keeps the prototype background without extra body overlays', () => {
    expect(globalsCss).toContain('radial-gradient(1200px 800px at 75% -10%, #1A1430 0%, #0A0812 55%)');
    expect(globalsCss).not.toContain('body::before');
    expect(globalsCss).not.toContain('body::after');
    expect(globalsCss).not.toContain('repeating-linear-gradient(90deg');
  });

  it('hides framework dev indicators for client presentation previews', () => {
    expect(nextConfigSource).toContain('devIndicators: false');
  });
});
