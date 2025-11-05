import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('should load profile page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('h1')).toContainText('Profile');
  });

  test('should display user information', async ({ page }) => {
    const firstNameInput = page.locator('input[placeholder="First name"]');
    const lastNameInput = page.locator('input[placeholder="Last name"]');
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
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
    const nameInput = page.locator('input[placeholder*="name"]').first();
    await nameInput.fill('John Doe');
    await expect(nameInput).toHaveValue('John Doe');
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
