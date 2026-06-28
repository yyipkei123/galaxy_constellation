import { expect, test, type Page } from '@playwright/test';

const routes = ['/', '/wallet', '/segments', '/guests', '/guests/MEM-••••3421', '/leakage', '/propensity', '/activation', '/marketscan', '/corridors', '/corridors/korea', '/acquisition'];
const interruptedNavigationMessage = 'is interrupted by another navigation';
const fallbackBaseUrl = 'http://127.0.0.1:3000';

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

test.describe('Galaxy Constellation rendered compliance', () => {
  for (const route of routes) {
    test(`${route} shows CDE methodology and avoids banned CDE currency patterns`, async ({ page }) => {
      await page.goto(route);

      const body = page.locator('body');
      const banner = page.getByRole('banner');
      await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
      await expect(banner.getByText('7 CDE metrics', { exact: true })).toBeVisible();
      await expect(banner.locator('[aria-label="7 active CDE metrics"]')).toBeVisible();
      const partnershipBadge = banner.getByLabel('Galaxy Macau and Mastercard data partnership');
      await expect(partnershipBadge).toBeVisible();
      await expect(partnershipBadge.getByRole('img', { name: 'Galaxy Macau' })).toBeVisible();
      await expect(partnershipBadge.getByRole('img', { name: 'Mastercard' })).toBeVisible();
      await expect(body).not.toContainText('HKD');
      await expect(body).not.toContainText('$');

      if (route === '/') {
        await expect(page.getByRole('heading', { name: /This period's headline findings/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Insight engine/i })).toBeVisible();
      }

      if (route === '/wallet') {
        await expect(page.getByRole('heading', { name: /Wallet analytics snapshot/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Ranked category leakage/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Segment opportunity heatmap/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Largest wallet gaps now/i })).toBeVisible();
      }

      if (route === '/segments') {
        const personaRecommendationKit = page.getByLabel('Persona recommendation kit');

        await expect(page.getByText('AI-style insight brief')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Why this segment matters now/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Persona universe/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Persona explorer/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Persona recommendation kit/i })).toBeVisible();
        await expect(page.getByText('Generated persona insight')).toBeVisible();
        await expect(page.getByRole('button', { name: 'persona: Suite-First Patrons' })).toBeVisible();
        await expect(personaRecommendationKit.getByText('Mastercard CDE reveal')).toBeVisible();
      }

      if (route === '/guests') {
        await expect(page.getByRole('heading', { name: /Priority Lead Board/i })).toBeVisible();
        await expect(page.getByRole('figure', { name: /Priority quadrant/i })).toBeVisible();
        await expect(page.getByText(/Masked synthetic demo records only\. CDE values render as percentages/i)).toBeVisible();
      }

      if (route.startsWith('/guests/')) {
        await expect(page.getByRole('heading', { name: /Customer 360/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Synthetic CRM identity/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Galaxy purchase and stay history/i })).toBeVisible();
        await expect(page.getByText(/Demo-only synthetic identity/i)).toBeVisible();
        await expect(page.getByText(/Galaxy first-party/i)).toBeVisible();
        await expect(page.getByText('What Galaxy sees')).toBeVisible();
        await expect(page.getByText('What Mastercard CDE adds')).toBeVisible();
        await expect(page.getByText('Suggested pitch script')).toBeVisible();
      }

      if (route === '/corridors') {
        const koreaRow = page.getByRole('row', { name: /#1 Korea/i });

        await expect(page.getByRole('heading', { name: /Source-Market & Corridor Intelligence/i })).toBeVisible();
        await expect(page.getByText(/10–20% panel/i)).toBeVisible();
        await expect(page.getByText(/aggregate inbound panel, no PII/i)).toBeVisible();
        await expect(koreaRow).toBeVisible();
      }

      if (route === '/corridors/korea') {
        await expect(page.getByRole('heading', { name: /Korea Corridor Detail/i })).toBeVisible();
        await expect(page.getByText('2020 base · refresh pending')).toBeVisible();
        await expect(page.getByRole('link', { name: /Generate campaign content/i })).toBeVisible();
      }

      if (route === '/acquisition') {
        await expect(page.getByRole('heading', { name: /Priority Corridor Acquisition/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Content draft/i })).toBeVisible();
        await expect(page.getByText(/No live model call/i)).toBeVisible();
      }

      if (route === '/leakage') {
        await expect(page.getByText('Generated opportunity narrative')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Opportunity ladder/i })).toBeVisible();
      }

      if (route !== '/activation') {
        await expect(body).not.toContainText('MOP');
      } else {
        const offerTerm = page.getByTestId('activation-offer-term').filter({
          hasText: 'MOP 200 rebate on MOP 500 spend',
        });

        await expect(offerTerm).toHaveCount(1);
        const mopTextNodes = await body.locator('*').evaluateAll((nodes) => (
          nodes
            .filter((node) => node.children.length === 0 && node.textContent?.includes('MOP'))
            .map((node) => ({
              text: node.textContent?.trim(),
              insideOfferTerm: Boolean(node.closest('[data-testid="activation-offer-term"]')),
            }))
        ));

        expect(mopTextNodes).toEqual([
          { text: 'MOP 200 rebate on MOP 500 spend', insideOfferTerm: true },
        ]);
      }
    });
  }

  test('AI insight assistant answers with CDE-safe visual evidence', async ({ page }) => {
    await page.goto('/segments');

    await page.getByRole('button', { name: 'Open AI insight assistant' }).click();
    const assistant = page.getByRole('dialog', { name: 'AI insight assistant' });

    await expect(assistant).toBeVisible();
    await expect(assistant.getByText(/^(Generated local demo narrative|Generated assistant insight)$/i)).toBeVisible();
    await expect(assistant.getByRole('figure', { name: 'Leakage drivers' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Ask the AI insight assistant' }).fill('Show HKD 5000 leakage');
    await assistant.getByRole('button', { name: 'Send question' }).click();

    await expect(assistant.getByText('Leakage opportunity answer')).toBeVisible();
    await expect(assistant).not.toContainText(/HKD|MOP|\$|元|澳門幣|5000/i);

    await page.getByRole('textbox', { name: 'Ask the AI insight assistant' }).fill('Show 5000 leakage');
    await assistant.getByRole('button', { name: 'Send question' }).click();

    await expect(assistant.getByText('Leakage opportunity answer')).toHaveCount(2);
    await expect(assistant).not.toContainText(/HKD|MOP|\$|元|澳門幣|5000/i);

    await page.getByRole('textbox', { name: 'Ask the AI insight assistant' }).fill('Which persona should we target first?');
    await assistant.getByRole('button', { name: 'Send question' }).click();

    await expect(assistant.getByText('Persona targeting answer')).toBeVisible();
    await expect(assistant.getByRole('figure', { name: 'Top personas' })).toBeVisible();
    await expect(assistant).toContainText('CDE');
    await expect(assistant).not.toContainText(/HKD|MOP|\$|元|澳門幣|5000/i);
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
    await expect(page.getByLabel(/Quarter selector/i)).toBeVisible();
    await expect(page.getByRole('banner').getByLabel('Galaxy Macau and Mastercard data partnership')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Galaxy Constellation/i })).toBeVisible();
  });

  test('mobile viewport keeps leakage heading and methodology accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/leakage');

    await expect(page.getByRole('heading', { name: /Cross-Property Leakage/i })).toBeVisible();
    await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
  });

  test('mobile activation keeps route content in the first viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/activation');

    const hero = page.getByRole('heading', { name: 'Next-Best-Action', exact: true });
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
    await expect(page.getByRole('link', { name: /Generate campaign content/i })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
    expect(await documentScrollWidth(page)).toBeLessThanOrEqual(390);
  });

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

      await expect(page.getByRole('heading', { name: 'Share of Wallet', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Wallet analytics snapshot/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Segment opportunity heatmap/i })).toBeVisible();
      await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);

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
        await expect(page.getByRole('button', { name: /Open AI insight assistant/i })).toBeVisible();

        const primaryNav = page.getByRole('navigation', { name: /Primary navigation/i });
        const activeNav = await primaryNav.locator('a[aria-current="page"]').boundingBox();
        expect(activeNav).not.toBeNull();
        expect(activeNav!.x).toBeGreaterThanOrEqual(-1);
        expect(activeNav!.x + activeNav!.width).toBeLessThanOrEqual(viewport.width + 1);

        const launcher = await page.getByRole('button', { name: /Open AI insight assistant/i }).boundingBox();
        expect(launcher).not.toBeNull();
        expect(launcher!.y + launcher!.height).toBeLessThanOrEqual(viewport.height);

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
      await expect(page.getByRole('navigation', { name: 'Wallet dashboard sections' })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Selected wallet opportunity detail' })).toBeVisible();
      await page.getByRole('button', { name: /Cosmopolitan Connoisseurs F&B relative wallet gap/i }).click();
      await expect(page.getByRole('region', { name: 'Selected wallet opportunity detail' })).toContainText('Cosmopolitan Connoisseurs');
      await expect(page.getByRole('region', { name: 'Selected wallet opportunity detail' })).toContainText('F&B');
      await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
      expect(await documentScrollWidth(page)).toBeLessThanOrEqual(viewport.width);

      await gotoStableRoute(page, '/segments');
      await expect(page.getByRole('navigation', { name: 'Segmentation sections' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Kit' })).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/HKD|MOP|\$|元|澳門幣/);
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
