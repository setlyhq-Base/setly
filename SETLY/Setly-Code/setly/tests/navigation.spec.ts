import { test, expect } from '@playwright/test';
import { gotoAuthed } from './utils/e2e';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should navigate to browse page', async ({ page }) => {
    await page.goto('/');
    await page.goto('/browse');
    await expect(page).toHaveURL(/\/browse/);
    await expect(page.getByRole('heading', { name: /Browse Rooms/i })).toBeVisible();
  });

  test('should navigate to post room page', async ({ page }) => {
    await gotoAuthed(page, '/open-room');
    await expect(page).toHaveURL(/\/(open-room|post-room)/);
  });

  test('should navigate to messages page', async ({ page }) => {
    await gotoAuthed(page, '/messages');
    await expect(page).toHaveURL(/\/messages/);
  });

  test('should navigate to profile page', async ({ page }) => {
    await gotoAuthed(page, '/profile');
    await expect(page).toHaveURL(/\/profile/);
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');
    await page.goto('/auth/sign-in');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await expect(page.locator('[data-testid="auth-title"]')).toContainText(/sign in/i);
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/');
    // Header no longer has Sign Up; use Sign In page link to reach Sign Up
    await page.locator('a', { hasText: 'Sign In' }).click();
    const signUpLink = page.locator('a', { hasText: 'Sign Up' });
    await signUpLink.click();
    await expect(page).toHaveURL('/auth/sign-up');
    await expect(page.locator('text=Create Account').or(page.locator('[data-testid="auth-title"]', { hasText: 'Create account' }))).toBeVisible();
  });

  test('should have working logo/home link', async ({ page }) => {
    await page.goto('/browse');
    const logo = page.locator('a').filter({ hasText: 'Setly' }).or(page.locator('[data-testid="logo"]'));
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('should maintain navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu might be hidden behind a hamburger
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(page.locator('button[aria-label="Menu"]'));
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }

    const browseLink = page.locator('a', { hasText: 'Browse' });
    await browseLink.click();
    await expect(page).toHaveURL('/browse');
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');
    // Should show 404 page or redirect to home
    await expect(page.locator('text=Page not found').or(page.getByRole('heading', { level: 1 }))).toBeVisible();
  });
});
