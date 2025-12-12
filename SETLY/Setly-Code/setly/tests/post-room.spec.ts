import { test, expect } from '@playwright/test';
import { gotoAuthed } from './utils/e2e';

test.describe('Post Room Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, '/post-room');
  });

  test('should load post room page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('[data-testid="pr-title"]').or(page.locator('text=Post'))).toBeVisible();
  });

  test('should have room posting form', async ({ page }) => {
    await expect(page.locator('[data-testid="pr-title"]').or(page.locator('form'))).toBeVisible();
  });

  test('should have required form fields', async ({ page }) => {
    await expect(page.locator('[data-testid="pr-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="pr-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="pr-university"]')).toBeVisible();
  });

  test('should have university selection', async ({ page }) => {
    await expect(page.locator('[data-testid="pr-university"]')).toBeVisible();
  });

  test('should have room type selection', async ({ page }) => {
    await expect(page.locator('[data-testid="pr-room-type"]')).toBeVisible();
  });

  test('should have amenities checkboxes', async ({ page }) => {
    await expect(page.locator('[data-testid="pr-amenity-suggestions"]')).toBeVisible();
  });

  test('should have image upload', async ({ page }) => {
    await page.locator('[data-testid="pr-next"]').click();
    await expect(page.locator('[data-testid="pr-photos-dropzone"]')).toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    await expect(page.locator('[data-testid="pr-next"]').or(page.locator('[data-testid="pr-publish"]'))).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Attempt to go next without required data
    const nextBtn = page.locator('[data-testid="pr-next"]');
    await nextBtn.click();
    // Expect a toast or inline validation; match common patterns.
    await expect(page.locator('text=Please').or(page.locator('text=required')).or(page.locator('[role="alert"]'))).toBeVisible();
  });
});
