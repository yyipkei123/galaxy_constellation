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

      if (route !== '/activation') {
        await expect(body).not.toContainText('MOP');
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
