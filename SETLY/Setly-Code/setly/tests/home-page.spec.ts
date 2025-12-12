import { test, expect } from '@playwright/test';

test.describe('Home (Search) Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads and shows hero tagline', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/i);
    await expect(page.getByRole('heading', { level: 1, name: /Find your next move/i })).toBeVisible();
  });

  test('category pills switch between Rooms/Rides/Market', async ({ page }) => {
    const rooms = page.getByRole('button', { name: /^Rooms/i });
    const rides = page.getByRole('button', { name: /^Rides/i });
    const market = page.getByRole('button', { name: /^Market/i });

    await expect(rooms).toBeVisible();
    await expect(rides).toBeVisible();
    await expect(market).toBeVisible();

    await rides.click();
    await expect(page.locator('text=Search Rides')).toBeVisible();

    await market.click();
    await expect(page.locator('text=Search Market')).toBeVisible();

    await rooms.click();
    await expect(page.locator('text=Search Rooms')).toBeVisible();
  });

  test('opens global search overlay', async ({ page }) => {
    const openSearch = page.getByRole('button', { name: 'Search' });
    await expect(openSearch).toBeVisible();
    await openSearch.click();
    await expect(page.locator('app-global-search-overlay')).toBeVisible();
  });
});
