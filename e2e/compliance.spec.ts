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

      if (route === '/segments') {
        const personaRecommendationKit = page.getByLabel('Persona recommendation kit');

        await expect(page.getByText('AI-style insight brief')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Why this segment matters now/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Persona universe/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Persona explorer/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Persona recommendation kit/i })).toBeVisible();
        await expect(page.getByText('Generated persona insight')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Suite-First Patrons/i })).toBeVisible();
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
});
