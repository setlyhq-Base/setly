import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('text=Find Your Perfect Room')).toBeVisible();
  });

  test('should navigate to browse page', async ({ page }) => {
    await page.goto('/');
    const browseLink = page.locator('a', { hasText: 'Browse' });
    await browseLink.click();
    await expect(page).toHaveURL('/browse');
    await expect(page.locator('text=Browse Rooms')).toBeVisible();
  });

  test('should navigate to post room page', async ({ page }) => {
    await page.goto('/');
    const postRoomLink = page.locator('a', { hasText: 'Post Room' });
    await postRoomLink.click();
    await expect(page).toHaveURL('/open-room');
    await expect(page.locator('text=Open a Room')).toBeVisible();
  });

  test('should navigate to messages page', async ({ page }) => {
    await page.goto('/');
    const messagesLink = page.locator('a', { hasText: 'Messages' }).first();
    await messagesLink.click();
    await expect(page).toHaveURL('/messages');
    await expect(page.locator('h1', { hasText: 'Messages' })).toBeVisible();
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/');
    const profileLink = page.locator('a', { hasText: 'Profile' }).first();
    await profileLink.click();
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('h1', { hasText: 'Profile' })).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');
    const signInLink = page.locator('a', { hasText: 'Sign In' });
    await signInLink.click();
    await expect(page).toHaveURL('/sign-in');
    await expect(page.locator('text=Sign In')).toBeVisible();
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
    await expect(page.locator('text=Page not found').or(page.locator('text=Find Your Perfect Room'))).toBeVisible();
  });
});
