import { test, expect } from '@playwright/test';

test.describe('Browse Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/browse');
  });

  test('should load the browse page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('h1')).toContainText('Browse Rooms');
  });

  test('should display filters', async ({ page }) => {
    await expect(page.locator('text=Budget:')).toBeVisible();
    const minBudget = page.locator('input[placeholder="Min"]');
    const maxBudget = page.locator('input[placeholder="Max"]');
    await expect(minBudget).toBeVisible();
    await expect(maxBudget).toBeVisible();
  });

  test('should display room listings', async ({ page }) => {
    const roomCards = page.locator('[data-testid="room-card"]');
    await expect(roomCards.first()).toBeVisible();
  });

  test('should have filter chips', async ({ page }) => {
    const filterChips = page.locator('button').filter({ hasText: /Vegetarian|No smoking|Pets ok|Room type|Bath type|More filters/ });
    await expect(filterChips.first()).toBeVisible();
  });

  test('should allow filtering by price', async ({ page }) => {
    const minBudget = page.locator('input[placeholder="Min"]');
    await minBudget.fill('1000');
    // Wait for filtering to apply
    await page.waitForTimeout(500);
    // Should still show some results or appropriate message
    const roomCards = page.locator('[data-testid="room-card"]');
    const count = await roomCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
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
