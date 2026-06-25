import { expect, test } from '@playwright/test';

const routes = ['/', '/wallet', '/segments', '/leakage', '/propensity', '/activation', '/marketscan'];

test.describe('Galaxy Constellation rendered compliance', () => {
  for (const route of routes) {
    test(`${route} shows CDE methodology and avoids banned CDE currency patterns`, async ({ page }) => {
      await page.goto(route);

      const body = page.locator('body');
      await expect(page.getByText(/Enriched figures are modelled estimates/i)).toBeVisible();
      await expect(page.getByRole('banner').getByText('7 active CDE metrics', { exact: true })).toBeVisible();
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

  test('desktop projector viewport has visible nav, top bar, and main hero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Overview/i })).toBeVisible();
    await expect(page.getByLabel(/Quarter selector/i)).toBeVisible();
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
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  });

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

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewport.width);
    });
  }
});
