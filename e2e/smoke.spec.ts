import { expect, test } from '@playwright/test';

test('renders the redesigned wallet intelligence cockpit', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Wallet intelligence cockpit' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wallet headroom constellation' })).toBeVisible();
  const aiDock = page.getByRole('complementary', { name: 'CDE AI' });
  await expect(aiDock).toBeVisible();
  await expect(aiDock.getByRole('button', { name: 'Hide CDE AI' })).toBeVisible();
});
