import { expect, test } from '@playwright/test';

test('renders the redesigned wallet intelligence cockpit', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('banner')).toContainText('Wallet intelligence cockpit');
  await expect(page.getByRole('heading', { name: 'Pitch Cosmopolitan Connoisseurs first.' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wallet headroom constellation' })).toBeVisible();
  const demoGuide = page.getByRole('region', { name: 'Executive demo guide' });
  await expect(demoGuide).toBeVisible();
  await expect(demoGuide.getByRole('button', { name: 'Start demo' })).toBeVisible();
  const aiDock = page.getByRole('complementary', { name: 'CDE AI' });
  await expect(aiDock).toBeVisible();
  await expect(aiDock.locator('[data-cde-ai-panel="floating"]')).toBeHidden();
  await expect(aiDock.getByRole('button', { name: 'Ask CDE AI' })).toHaveAttribute('aria-expanded', 'false');
});
