import { test, expect } from '@playwright/test';

test.describe('sanity studio', () => {
  test('loads the embedded studio login screen', async ({ page }) => {
    const response = await page.goto('/studio');
    expect(response?.status()).toBe(200);

    // Unauthenticated visitors get Sanity's login chooser; seeing it proves
    // the Studio bundle loaded and is wired to the project.
    await expect(page.getByText('Choose login provider')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole('link', { name: 'Google' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'E-mail / password' }),
    ).toBeVisible();
  });
});
