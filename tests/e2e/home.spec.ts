import { test, expect, type Page } from '@playwright/test';

const EN_FILTERS = [
  'Pure Paintings',
  'Pictures from Galleries',
  '3D Arts, Sculptures etc.',
];

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

test.describe('home page', () => {
  test('root redirects to the default locale', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/en$/);
  });

  test('both locales render with the right direction', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.goto('/he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  });

  test('hero, filter bar, and gallery (or empty state) render without errors', async ({
    page,
  }) => {
    const errors = collectPageErrors(page);
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const label of EN_FILTERS) {
      await expect(
        page.getByRole('link', { name: label, exact: true }),
      ).toBeVisible();
    }

    // Tolerate an empty dataset: either at least one artwork figure or the
    // empty-state message must be present, never neither.
    const figures = page.locator('figure');
    const emptyState = page.getByText('No pieces in this category yet.');
    await expect(figures.first().or(emptyState)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('clicking a category navigates to its route and marks it current', async ({
    page,
  }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: 'Pure Paintings' }).click();

    await expect(page).toHaveURL(/\/en\/paintings$/);
    await expect(
      page.getByRole('link', { name: 'Pure Paintings' }),
    ).toHaveAttribute('aria-current', 'page');
    // category headline is shown
    await expect(
      page.getByRole('heading', { name: 'Pure Paintings' }),
    ).toBeVisible();

    // logo returns to the full landing view
    await page.getByRole('link', { name: 'Home' }).first().click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test('every category route loads directly and shows items or empty state', async ({
    page,
  }) => {
    for (const path of ['paintings', 'gallery-pictures', '3d-sculpture']) {
      await page.goto(`/en/${path}`);
      const figures = page.locator('figure');
      const emptyState = page.getByText('No pieces in this category yet.');
      await expect(figures.first().or(emptyState)).toBeVisible();
    }
  });

  test('locale switcher flips language and direction both ways', async ({
    page,
  }) => {
    await page.goto('/en');

    await page.getByRole('button', { name: 'עברית' }).click();
    await expect(page).toHaveURL(/\/he$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('link', { name: 'ציורים' })).toBeVisible();

    await page.getByRole('button', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(
      page.getByRole('link', { name: 'Pure Paintings' }),
    ).toBeVisible();
  });

  test('mobile shows a hamburger that opens the menu and selects a tab', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');

    // options are collapsed behind the hamburger on mobile
    await expect(
      page.getByRole('link', { name: 'Pure Paintings' }),
    ).toBeHidden();

    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/\/en\/contact$/);
    await expect(page.getByText('Omri Meron')).toBeVisible();
  });

  test('tab bar stays pinned to the top while scrolling', async ({ page }) => {
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const nav = page.locator('nav');
    expect(
      await nav.evaluate((el) => el.getBoundingClientRect().top),
    ).toBeLessThanOrEqual(1);
  });

  test('active tab survives a locale switch', async ({ page }) => {
    await page.goto('/en/paintings');

    await page.getByRole('button', { name: 'עברית' }).click();
    await expect(page).toHaveURL(/\/he\/paintings$/);
    await expect(page.getByRole('link', { name: 'ציורים' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('contact route shows the contact details with working links', async ({
    page,
  }) => {
    await page.goto('/en/contact');

    await expect(page.getByText('Omri Meron')).toBeVisible();

    const email = page.getByRole('link', { name: 'Email' });
    await expect(email).toBeVisible();
    expect(await email.getAttribute('href')).toMatch(/^mailto:.+@.+/);

    const phone = page.getByRole('link', { name: 'Phone' });
    await expect(phone).toBeVisible();
    expect(await phone.getAttribute('href')).toMatch(/^tel:\+?\d+$/);

    // message form is present with its required fields
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Send Message' }),
    ).toBeVisible();
  });
});
