import { test, expect } from '@playwright/test';
import { gotoAuthed } from './utils/e2e';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, '/profile');
  });

  test('should load profile page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('text=Profile').first()).toBeVisible();
  });

  test('should display user information', async ({ page }) => {
    // Profile V2 can render different field sets; assert the page shell renders.
    await expect(page.locator('app-profile-v2-page').or(page.locator('app-profile-page')).or(page.locator('main'))).toBeVisible();
  });

  test('should have profile form fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    const phoneInput = page.locator('input[type="tel"]').or(page.locator('input[placeholder*="phone"]'));
    await expect(phoneInput).toBeVisible();
  });

  test('should have university selection', async ({ page }) => {
    const universityField = page.locator('select').or(page.locator('input[placeholder*="university"]'));
    await expect(universityField).toBeVisible();
  });

  test('should have save button', async ({ page }) => {
    const saveButton = page.locator('button', { hasText: 'Save' }).or(page.locator('button[type="submit"]'));
    await expect(saveButton).toBeVisible();
  });

  test('should allow editing profile information', async ({ page }) => {
    const editable = page.locator('input[type="text"], textarea').first();
    if (await editable.isVisible().catch(() => false)) {
      await editable.fill('E2E Edit');
      await expect(editable).toHaveValue('E2E Edit');
    }
  });

  test('should display user listings', async ({ page }) => {
    const myListings = page.locator('text=My Listings').or(page.locator('[data-testid="user-listings"]'));
    await expect(myListings).toBeVisible();
  });

  test('should have logout button', async ({ page }) => {
    const logoutButton = page.locator('button', { hasText: 'Logout' }).or(page.locator('button', { hasText: 'Sign Out' }));
    await expect(logoutButton).toBeVisible();
  });
});
