import { expect, test, type Page } from '@playwright/test';

const routes = ['/', '/journey', '/wallet', '/segments', '/guests', '/guests/MEM-••••3421', '/leakage', '/propensity', '/activation', '/measurement', '/simulate', '/marketscan', '/governance', '/corridors', '/corridors/korea', '/acquisition'];
const interruptedNavigationMessage = 'is interrupted by another navigation';
const fallbackBaseUrl = 'http://127.0.0.1:3000';
const globalUnsafeCdePattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend|\b(?:NaN|Infinity)\b/i;
const bannedCdeTokenPattern = globalUnsafeCdePattern;
const bannedCdeTokenOrUnsafeAmountPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend|\b(?:NaN|Infinity)\b|5000/i;

type RedesignedRouteExpectation = {
  region: string;
  heading: string;
  texts?: string[];
  sliders?: string[];
  complementary?: string;
};

const redesignedRouteExpectations = new Map<string, RedesignedRouteExpectation>([
  ['/', {
    region: 'Overview',
    heading: 'Wallet intelligence cockpit',
    texts: ['Wallet headroom constellation'],
    complementary: 'CDE AI',
  }],
  ['/journey', {
    region: 'Journey',
    heading: 'Segment journey',
    texts: ['Weakest link'],
  }],
  ['/wallet', {
    region: 'Wallet',
    heading: 'Wallet intelligence',
    texts: ['On-property vs modelled off-property'],
  }],
  ['/segments', {
    region: 'Segments',
    heading: 'Segment rankings',
    texts: ['Segment detail'],
  }],
  ['/guests', {
    region: 'Guests',
    heading: 'Matched guest universe',
    texts: ['Match funnel'],
  }],
  ['/leakage', {
    region: 'Leakage',
    heading: 'Leakage control tower',
    texts: ['Leakage matrix'],
  }],
  ['/propensity', {
    region: 'Propensity',
    heading: 'Propensity ladder',
    texts: ['Audience readiness'],
  }],
  ['/activation', {
    region: 'Activation',
    heading: 'Activation planning',
    texts: ['Campaign brief'],
  }],
  ['/simulate', {
    region: 'Simulator',
    heading: 'Scenario simulator',
    sliders: ['Audience reach', 'Offer depth'],
  }],
  ['/measurement', {
    region: 'Measurement',
    heading: 'Campaign measurement',
    texts: ['Campaign readouts'],
  }],
  ['/marketscan', {
    region: 'Market Scan',
    heading: 'Market context',
    texts: ['Corridor mix'],
  }],
  ['/governance', {
    region: 'Governance',
    heading: 'Governance & CDE rules',
    texts: ['Refresh log'],
  }],
]);

function normalizedPathname(pathname: string) {
  return pathname === '/' ? pathname : pathname.replace(/\/$/, '');
}

function normalizedUrl(value: string, baseUrl: string) {
  const url = new URL(value, baseUrl);
  return `${url.origin}${normalizedPathname(url.pathname)}${url.search}${url.hash}`;
}

function isEquivalentRoute(currentUrl: string, route: string, baseUrl: string) {
  return normalizedUrl(currentUrl, baseUrl) === normalizedUrl(route, baseUrl);
}

function isSameOrigin(currentUrl: string, baseUrl: string) {
  try {
    return new URL(currentUrl).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function currentOrigin(page: Page) {
  const currentUrl = page.url();
  return currentUrl.startsWith('http') ? new URL(currentUrl).origin : fallbackBaseUrl;
}

async function gotoStableRoute(page: Page, route: string) {
  const baseUrl = currentOrigin(page);
  const expectedUrl = normalizedUrl(route, baseUrl);
  const currentUrl = page.url();

  if (isSameOrigin(currentUrl, baseUrl) && !isEquivalentRoute(currentUrl, route, baseUrl)) {
    await page.goto('about:blank');
  }

  try {
    await page.goto(route);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes(interruptedNavigationMessage)) {
      throw error;
    }

    await page.waitForLoadState('load');
    if (!isEquivalentRoute(page.url(), route, baseUrl)) {
      throw error;
    }

    await page.goto(route);
  }

  await expect.poll(() => normalizedUrl(page.url(), baseUrl)).toBe(expectedUrl);
}

async function documentScrollWidth(page: Page) {
  return page.evaluate(() => Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
  ));
}

async function hideCompactCdeAiDock(page: Page) {
  const aiDock = page.getByRole('complementary', { name: 'CDE AI' });
  const hideButton = aiDock.getByRole('button', { name: 'Hide CDE AI' });

  if (await hideButton.isVisible()) {
    await hideButton.click();
    await expect(aiDock.locator('[data-cde-ai-panel="floating"]')).toBeHidden();
  }
}

test.describe('Galaxy Constellation rendered compliance', () => {
  for (const route of routes) {
    test(`${route} shows CDE methodology and avoids banned CDE currency patterns`, async ({ page }) => {
      await page.goto(route);

      const body = page.locator('body');
      const banner = page.getByRole('banner');
      const redesignedExpectation = redesignedRouteExpectations.get(route);
      await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
      await expect(banner.getByText('7 CDE metrics - Modelled', { exact: true })).toBeVisible();
      await expect(banner.locator('[aria-label="7 active CDE metrics - Modelled"]')).toBeVisible();
      const partnershipBadge = banner.getByLabel('Galaxy Macau and Mastercard data partnership');
      await expect(partnershipBadge).toBeVisible();
      await expect(partnershipBadge.getByRole('img', { name: 'Galaxy Macau' })).toBeVisible();
      await expect(partnershipBadge.getByRole('img', { name: 'Mastercard' })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Client presentation guidance' })).toBeVisible();
      await expect(body).not.toContainText(globalUnsafeCdePattern);

      if (redesignedExpectation) {
        const routeRegion = page.getByRole('region', { name: redesignedExpectation.region });

        await expect(routeRegion).toBeVisible();
        await expect(routeRegion.getByRole('heading', { name: redesignedExpectation.heading })).toBeVisible();

        for (const text of redesignedExpectation.texts ?? []) {
          await expect(routeRegion.getByText(text, { exact: true })).toBeVisible();
        }

        for (const slider of redesignedExpectation.sliders ?? []) {
          await expect(routeRegion.getByRole('slider', { name: slider })).toBeVisible();
        }

        if (redesignedExpectation.complementary) {
          await expect(page.getByRole('complementary', { name: redesignedExpectation.complementary })).toBeVisible();
        }

      } else if (route.startsWith('/guests/')) {
        const hostActionSummary = page.getByRole('region', { name: 'Host action summary' });

        await expect(page.getByRole('heading', { name: 'Customer 360', level: 1 })).toBeVisible();
        await expect(hostActionSummary).toBeVisible();
        await expect(hostActionSummary.getByText('What to offer')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Synthetic CRM identity/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Galaxy purchase and stay history/i })).toBeVisible();
        await expect(page.getByText(/Demo-only synthetic identity/i)).toBeVisible();
        await expect(page.getByText('Galaxy first-party', { exact: true })).toBeVisible();
        await expect(page.getByText('What Galaxy sees')).toBeVisible();
        await expect(page.getByText('What Mastercard CDE adds')).toBeVisible();
        await expect(page.getByText('Suggested pitch script')).toBeVisible();
      } else if (route === '/corridors') {
        const koreaRow = page.getByRole('row', { name: /#1 Korea/i });

        await expect(page.getByRole('heading', { name: /Source-Market & Corridor Intelligence/i })).toBeVisible();
        await expect(page.getByText(/10–20% panel/i)).toBeVisible();
        await expect(page.getByText(/aggregate inbound panel, no PII/i)).toBeVisible();
        await expect(koreaRow).toBeVisible();
      } else if (route === '/corridors/korea') {
        await expect(page.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeVisible();
        await expect(page.getByText('2020 base · refresh pending')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Generate campaign content', exact: true })).toBeVisible();
      } else if (route === '/acquisition') {
        await expect(page.getByRole('heading', { name: /Priority Corridor Acquisition/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Content draft/i })).toBeVisible();
        await expect(page.getByText(/No live model call/i)).toBeVisible();
      }
    });
  }

  test('CDE AI dock answers with deterministic CDE-safe brief controls', async ({ page }) => {
    await page.goto('/');

    const aiDock = page.getByRole('complementary', { name: 'CDE AI' });
    const aiPanel = aiDock.locator('[data-cde-ai-panel="floating"]');
    await expect(aiDock).toBeVisible();
    await expect(aiPanel).toBeVisible();
    await expect(aiPanel.getByText('CDE AI', { exact: true })).toBeVisible();
    await expect(aiPanel.getByText('Governed answers · ranges & indices only', { exact: true })).toBeVisible();
    await expect(aiPanel.getByText(
      'Ask for an explanation, trust rationale, or a CDE-safe campaign brief for Cosmopolitan Connoisseurs.',
      { exact: true },
    )).toBeVisible();

    const briefChip = aiDock.getByRole('button', { name: 'Build a brief' });
    await briefChip.click();

    await expect(briefChip).toHaveAttribute('aria-pressed', 'true');
    await expect(aiDock.getByText(/Draft brief for Cosmopolitan Connoisseurs/i)).toBeVisible();
    await expect(aiDock.getByText(/capture-index lift vs holdout/i)).toBeVisible();
    await expect(aiDock).not.toContainText(bannedCdeTokenPattern);

    const input = aiDock.getByRole('textbox', { name: /Ask a CDE-safe question/i });
    await expect(input).toHaveAttribute('placeholder', 'Ask about Cosmopolitan Connoisseurs...');
    await input.fill('Show HKD 5000 leakage');
    await aiDock.getByRole('button', { name: 'Ask' }).click();

    await expect(input).toHaveValue('');
    await expect(aiDock.getByText(/Cosmopolitan Connoisseurs: opportunity index 118/i)).toBeVisible();
    await expect(aiDock).not.toContainText(bannedCdeTokenOrUnsafeAmountPattern);

    await expect(aiDock.getByRole('button', { name: 'Collapse' })).toHaveCount(0);
    await expect(aiDock.getByRole('button', { name: 'Open' })).toHaveCount(0);

    await aiDock.getByRole('button', { name: 'Hide CDE AI' }).click();
    await expect(aiDock.getByRole('button', { name: 'Ask CDE AI' })).toHaveAttribute('aria-expanded', 'false');
    await expect(aiPanel).toBeHidden();

    await aiDock.getByRole('button', { name: 'Ask CDE AI' }).click();
    await expect(aiDock.getByRole('button', { name: 'Hide CDE AI' })).toHaveAttribute('aria-expanded', 'true');
    await expect(aiPanel).toBeVisible();
    await expect(aiDock.getByRole('button', { name: 'Build a brief' })).toBeVisible();
  });

  test('acquisition lens keeps corridor data aggregate and CDE-safe', async ({ page }) => {
    await page.goto('/corridors');

    const koreaRow = page.getByRole('row', { name: /#1 Korea/i });
    await expect(page.getByRole('navigation', { name: /Lens switch/i }).getByText(/Corridors Acquisition/i)).toBeVisible();
    await expect(page.getByText(/10–20% panel/i)).toBeVisible();
    await expect(page.getByText(/aggregate inbound panel, no PII/i)).toBeVisible();
    await expect(koreaRow).toBeVisible();
    await expect(koreaRow.getByText('2020 base · refresh pending')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);

    await page.getByRole('link', { name: /Open acquisition recommendation/i }).click();
    await expect(page).toHaveURL(/\/acquisition\?corridor=korea/);
    await expect(page.getByRole('heading', { name: /Content draft/i })).toBeVisible();
    await expect(page.getByText(/No live model call/i)).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
  });

  test('desktop projector viewport has visible nav, top bar, and main hero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Overview/i })).toBeVisible();
    await expect(page.getByRole('group', { name: /Quarter selector/i })).toBeVisible();
    await expect(page.getByRole('banner').getByLabel('Galaxy Macau and Mastercard data partnership')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wallet intelligence cockpit' })).toBeVisible();
  });

  test('mobile overview keeps redesigned cockpit within viewport width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Wallet intelligence cockpit' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wallet headroom constellation' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'CDE AI' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(bannedCdeTokenPattern);
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(390);
  });

  test('mobile viewport keeps leakage heading and methodology accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/leakage');

    await expect(page.getByRole('heading', { name: 'Leakage control tower' })).toBeVisible();
    await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
  });

  test('mobile activation keeps route content in the first viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/activation');

    const hero = page.getByRole('heading', { name: 'Activation planning', exact: true });
    await expect(hero).toBeVisible();
    const box = await hero.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });

    expect(box.top).toBeLessThan(620);
    expect(box.bottom).toBeLessThanOrEqual(844);
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(390);
  });

  test('mobile Lens B corridor routes keep content within viewport width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/corridors');
    await expect(page.getByRole('heading', { name: /Source-Market & Corridor Intelligence/i })).toBeVisible();
    await expect(page.getByRole('row', { name: /#1 Korea/i })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(390);

    await page.goto('/corridors/korea');

    await expect(page.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Generate campaign content', exact: true })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(390);
  });

  test('mobile presenter tour opens without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await hideCompactCdeAiDock(page);
    await page.getByRole('button', { name: 'Open presenter tour' }).click({ position: { x: 22, y: 42 } });

    const dialog = page.getByRole('dialog', { name: 'Presenter tour' });
    const presenterStops = [
      'Journey',
      'Overview',
      'Wallet',
      'Segments',
      'Guests',
      'Audience',
      'Activation',
      'Measurement',
      'Governance',
    ];

    await expect(dialog).toBeVisible();
    for (const [index, stop] of presenterStops.entries()) {
      if (index > 0) {
        await dialog.getByRole('button', { name: 'Next stop' }).click();
      }

      await expect(dialog.getByText(`${index + 1} of 9`)).toBeVisible();
      await expect(dialog.getByRole('heading', { name: stop })).toBeVisible();
    }
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(390);
  });

  test('presenter mode hides floating controls while keeping guidance visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Open presenter tour' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'CDE AI' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open AI insight assistant' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Presenter mode' }).click();

    await expect(page.getByRole('region', { name: 'Client presentation guidance' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open presenter tour' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open AI insight assistant' })).toHaveCount(0);
  });

  for (const viewport of [
    { label: 'iPhone', width: 390, height: 844 },
    { label: 'iPad', width: 820, height: 1180 },
    { label: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`Sprint 3 routes remain CDE-safe and responsive on ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of ['/measurement', '/simulate', '/journey', '/governance']) {
        await gotoStableRoute(page, route);
        await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
        await expect(page.locator('body')).not.toContainText(bannedCdeTokenPattern);
        await expect(page.locator('body')).not.toContainText(/NaN|Infinity/);
        expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);
      }
    });
  }

  for (const viewport of [
    { label: 'iPhone', width: 390, height: 844 },
    { label: 'iPad', width: 820, height: 1180 },
    { label: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`Customer 360 routes remain CDE-safe and responsive on ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of ['/guests', '/guests/MEM-••••3421']) {
        await gotoStableRoute(page, route);
        await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
        if (route.startsWith('/guests/')) {
          await expect(page.getByRole('heading', { name: /Synthetic CRM identity/i })).toBeVisible();
          await expect(page.getByRole('heading', { name: /Galaxy purchase and stay history/i })).toBeVisible();
        }
        await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
        expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);
      }
    });
  }

  for (const viewport of [
    { label: 'iPhone', width: 390, height: 844 },
    { label: 'iPad', width: 820, height: 1180 },
    { label: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`/wallet remains CDE-safe and responsive on ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/wallet');

      await expect(page.getByRole('region', { name: 'Wallet' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Wallet intelligence', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: /On-property vs modelled off-property/i })).toBeVisible();
      await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
      await expect(page.locator('body')).not.toContainText(bannedCdeTokenPattern);

      const scrollWidth = await documentScrollWidth(page);
      expect(scrollWidth).toBeLessThanOrEqual(viewport.width);
    });
  }

  for (const viewport of [
    { label: 'iPhone', width: 390, height: 844 },
    { label: 'iPad', width: 820, height: 1180 },
    { label: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`refined shell and decision visuals fit ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of ['/wallet', '/segments', '/activation']) {
        await gotoStableRoute(page, route);
        await expect(page.getByRole('banner')).toContainText(/CDE metrics/i);
        await expect(page.getByRole('banner').getByLabel('Galaxy Macau and Mastercard data partnership')).toBeVisible();
        await expect(page.getByRole('complementary', { name: 'CDE AI' })).toBeVisible();
        await expect(page.getByRole('button', { name: /Open AI insight assistant/i })).toHaveCount(0);

        const primaryNav = page.getByRole('navigation', { name: /Primary navigation/i });
        const activeNav = await primaryNav.locator('a[aria-current="page"]').boundingBox();
        expect(activeNav).not.toBeNull();
        expect(activeNav!.x).toBeGreaterThanOrEqual(-1);
        expect(activeNav!.x + activeNav!.width).toBeLessThanOrEqual(viewport.width + 1);

        const scrollWidth = await documentScrollWidth(page);
        expect(scrollWidth).toBeLessThanOrEqual(viewport.width);
      }
    });
  }

  for (const viewport of [
    { label: 'iPhone', width: 390, height: 844 },
    { label: 'iPad', width: 820, height: 1180 },
    { label: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`dashboard refinements stay usable on ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await gotoStableRoute(page, '/wallet');
      await hideCompactCdeAiDock(page);
      const walletRegion = page.getByRole('region', { name: 'Wallet' });
      await expect(walletRegion.getByRole('heading', { name: 'Wallet intelligence' })).toBeVisible();
      await expect(walletRegion.getByRole('heading', { name: 'On-property vs modelled off-property' })).toBeVisible();
      await walletRegion.getByRole('button', { name: 'Weekenders', exact: true }).click();
      await expect(walletRegion.getByText('Selected segment: Premium Mass Weekenders')).toBeVisible();
      await expect(page.locator('body')).not.toContainText(bannedCdeTokenPattern);
      expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);

      await gotoStableRoute(page, '/segments');
      await hideCompactCdeAiDock(page);
      const segmentsRegion = page.getByRole('region', { name: 'Segments' });
      await expect(segmentsRegion.getByRole('heading', { name: 'Segment rankings' })).toBeVisible();
      await expect(segmentsRegion.getByText('Segment detail')).toBeVisible();
      await segmentsRegion.getByRole('button', { name: 'Build audience brief' }).click();
      await expect(segmentsRegion.getByRole('status', { name: 'Audience brief draft' })).toBeVisible();
      await expect(page.locator('body')).not.toContainText(bannedCdeTokenPattern);
      expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);

      await gotoStableRoute(page, '/guests/MEM-••••3421');
      await expect(page.getByRole('navigation', { name: 'Customer 360 sections' })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Host briefing summary' })).toBeVisible();
      await expect(page.getByText(/Reason to contact now/i)).toBeVisible();
      await expect(page.getByTestId('ai-assistant-launcher')).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
      expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);
    });
  }
});
