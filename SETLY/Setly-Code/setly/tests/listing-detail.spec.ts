import { test, expect } from '@playwright/test';

test.describe('Listing Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to browse first to get a listing ID
    await page.goto('/browse');
    const firstRoomCard = page.locator('[data-testid="room-card"]').first();
    await firstRoomCard.click();
    await page.waitForURL(/\/listing\//);
  });

  test('should load listing detail page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display room images', async ({ page }) => {
    const images = page.locator('img');
    await expect(images.first()).toBeVisible();

    // Check for image thumbnails
    const thumbnails = page.locator('.flex.gap-2 img');
    await expect(thumbnails).toHaveCount(3);
  });

  test('should display room details', async ({ page }) => {
    await expect(page.locator('text=$')).toBeVisible();
    await expect(page.locator('text=month')).toBeVisible();
    await expect(page.locator('text=Location')).toBeVisible();
  });

  test('should display room description', async ({ page }) => {
    const description = page.locator('text=Description').locator('..').locator('p');
    await expect(description).toBeVisible();
  });

  test('should display amenities', async ({ page }) => {
    await expect(page.locator('text=Amenities')).toBeVisible();
    const amenities = page.locator('li').or(page.locator('[data-testid="amenity"]'));
    await expect(amenities.first()).toBeVisible();
  });

  test('should have contact buttons', async ({ page }) => {
    const contactButton = page.locator('button', { hasText: /Contact|Message|Email/ });
    await expect(contactButton).toBeVisible();
  });

  test('should display landlord information', async ({ page }) => {
    const landlordInfo = page.locator('text=Landlord').or(page.locator('text=Posted by'));
    await expect(landlordInfo).toBeVisible();
  });

  test('should have back navigation', async ({ page }) => {
    const backButton = page.locator('button', { hasText: 'Back' }).or(page.locator('[aria-label="Go back"]'));
    await expect(backButton).toBeVisible();
  });

  test('should navigate back to browse', async ({ page }) => {
    const backButton = page.locator('button', { hasText: 'Back' }).or(page.locator('[aria-label="Go back"]'));
    await backButton.click();
    await expect(page).toHaveURL('/browse');
  });
});
