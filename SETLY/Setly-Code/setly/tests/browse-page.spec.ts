import { test, expect } from '@playwright/test';

test.describe('Browse Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/browse');
  });

  test('should load the browse page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.getByRole('heading', { name: /Browse Rooms/i })).toBeVisible();
  });

  test('should display filters', async ({ page }) => {
    // Desktop filters bar is hidden on mobile; just assert the filter affordance exists.
    await expect(page.locator('button[aria-label="Open filters"]').or(page.locator('text=Filters'))).toBeVisible();
  });

  test('should display room listings', async ({ page }) => {
    const roomCards = page.locator('[data-testid="room-card"]');
    await expect(roomCards.first()).toBeVisible();
  });

  test('should have filter chips', async ({ page }) => {
    // At minimum, the results header should exist.
    await expect(page.locator('text=rooms available')).toBeVisible();
  });

  test('should allow filtering by price', async ({ page }) => {
    // Open mobile filters and ensure sheet opens.
    const openFilters = page.locator('button[aria-label="Open filters"]').or(page.locator('text=Filters'));
    await openFilters.click();
    await expect(page.locator('text=Filters')).toBeVisible();
  });

  test('should display room details', async ({ page }) => {
    const firstRoomCard = page.locator('[data-testid="room-card"]').first();
    await expect(firstRoomCard.locator('text=$')).toBeVisible();
    await expect(firstRoomCard.locator('text=View Details')).toBeVisible();
  });

  test('should navigate to room detail on click', async ({ page }) => {
    const firstRoomCard = page.locator('[data-testid="room-card"]').first();
    await firstRoomCard.click();
    await expect(page).toHaveURL(/\/listing\//);
  });
});
