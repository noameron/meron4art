import { test, expect, type Page } from '@playwright/test';

const EN_FILTERS = ['Paintings & Drawings', 'Shows', '3D Art'];

// the footer sitemap repeats the tab links, so tab assertions must be
// scoped to the top tab bar (the first nav on the page)
function tabBar(page: Page) {
  return page.getByRole('navigation').first();
}

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

  test('home shows hero and filter bar but no gallery', async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const label of EN_FILTERS) {
      await expect(
        tabBar(page).getByRole('link', { name: label, exact: true }),
      ).toBeVisible();
    }

    // home is hero-only: no artwork grid below the fold
    await expect(page.locator('figure')).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('clicking a category navigates to its route and marks it current', async ({
    page,
  }) => {
    await page.goto('/en');
    await tabBar(page).getByRole('link', { name: 'Paintings & Drawings' }).click();

    await expect(page).toHaveURL(/\/en\/paintings-drawings$/);
    await expect(
      tabBar(page).getByRole('link', { name: 'Paintings & Drawings' }),
    ).toHaveAttribute('aria-current', 'page');

    // logo returns to the full landing view
    await tabBar(page).getByRole('link', { name: 'Home' }).first().click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test('every category route loads directly and shows items or empty state', async ({
    page,
  }) => {
    for (const path of ['paintings-drawings', 'shows', '3d-art']) {
      await page.goto(`/en/${path}`);
      const figures = page.locator('figure');
      const emptyState = page.getByText('No pieces in this category yet.');
      await expect(figures.first().or(emptyState)).toBeVisible();
    }
  });

  test('lightbox opens and navigates with keys when a category has 2+ images', async ({
    page,
  }) => {
    await page.goto('/en/paintings-drawings');
    const figures = page.locator('figure');
    // needs at least two published paintings to exercise navigation
    test.skip((await figures.count()) < 2, 'not enough images in dataset');

    await figures.first().getByRole('button').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const firstSrc = await dialog.locator('img').getAttribute('src');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('img')).not.toHaveAttribute('src', firstSrc!);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('locale switcher flips language and direction both ways', async ({
    page,
  }) => {
    await page.goto('/en');

    // the switcher renders in both the mobile and desktop nav rows,
    // so filter to the one visible at the current breakpoint
    await page
      .getByRole('button', { name: 'עברית' })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(/\/he$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(
      tabBar(page).getByRole('link', { name: 'ציורים ותמונות' }),
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'English' })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(
      tabBar(page).getByRole('link', { name: 'Paintings & Drawings' }),
    ).toBeVisible();
  });

  test('mobile shows a hamburger that opens the menu and selects a tab', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');

    // options live in the drawer, which sits off-screen until the
    // hamburger opens it (so toBeHidden doesn't apply; check the viewport)
    await expect(
      tabBar(page).getByRole('link', { name: 'Paintings & Drawings' }),
    ).not.toBeInViewport();

    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(
      tabBar(page).getByRole('link', { name: 'Paintings & Drawings' }),
    ).toBeInViewport();
    await tabBar(page).getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/\/en\/contact$/);
    // the hero h1 also carries the name, so match the first occurrence
    await expect(
      page.getByRole('main').getByText('Omri Meron').first(),
    ).toBeVisible();
  });

  test('tab bar stays pinned to the top while scrolling', async ({ page }) => {
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const nav = tabBar(page);
    expect(
      await nav.evaluate((el) => el.getBoundingClientRect().top),
    ).toBeLessThanOrEqual(1);
  });

  test('active tab survives a locale switch', async ({ page }) => {
    await page.goto('/en/paintings-drawings');

    await page
      .getByRole('button', { name: 'עברית' })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(/\/he\/paintings-drawings$/);
    await expect(
      tabBar(page).getByRole('link', { name: 'ציורים ותמונות' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('about route shows the bio text', async ({ page }) => {
    await page.goto('/en/about');

    await expect(
      page.getByRole('main').getByText('Fine Art and Commercial Photographer', { exact: false }),
    ).toBeVisible();
  });

  test('contact route shows the contact details with working links', async ({
    page,
  }) => {
    await page.goto('/en/contact');

    // the hero h1 also carries the name, so match the first occurrence
    await expect(
      page.getByRole('main').getByText('Omri Meron').first(),
    ).toBeVisible();

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
