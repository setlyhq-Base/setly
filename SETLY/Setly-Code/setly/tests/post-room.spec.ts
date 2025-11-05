import { test, expect } from '@playwright/test';

test.describe('Post Room Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/post-room');
  });

  test('should load post room page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('h1')).toContainText('Post Your Room');
  });

  test('should have room posting form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
  });

  test('should have required form fields', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Cozy Room Near Campus"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Describe your room"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="1200"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="City, State"]')).toBeVisible();
  });

  test('should have university selection', async ({ page }) => {
    const universitySelect = page.locator('select').or(page.locator('input[placeholder*="university"]'));
    await expect(universitySelect).toBeVisible();
  });

  test('should have room type selection', async ({ page }) => {
    await expect(page.locator('text=Room Type')).toBeVisible();
    const roomTypeOptions = page.locator('input[type="radio"]').or(page.locator('select'));
    await expect(roomTypeOptions.first()).toBeVisible();
  });

  test('should have amenities checkboxes', async ({ page }) => {
    await expect(page.locator('text=Amenities')).toBeVisible();
    const amenities = page.locator('input[type="checkbox"]');
    await expect(amenities.first()).toBeVisible();
  });

  test('should have image upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    // Check for drag and drop area
    const uploadArea = page.locator('text=Upload photos');
    await expect(uploadArea).toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button', { hasText: 'Post Room' }));
    await expect(submitButton).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button', { hasText: 'Post Room' }));
    await submitButton.click();

    // Should show validation errors or prevent submission
    await expect(page.locator('text=required')).toBeVisible();
  });
});
