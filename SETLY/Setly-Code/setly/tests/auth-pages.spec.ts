import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test.describe('Auth Page Layout', () => {
    test('should load auth page with two-pane layout', async ({ page }) => {
      await page.goto('/auth');
      await expect(page).toHaveTitle(/Authentication - Setly/);
      await expect(page.locator('h1')).toContainText('Find Your Perfect Room');
      await expect(page.locator('text=Connect with verified students')).toBeVisible();
    });

    test('should show all social provider buttons', async ({ page }) => {
      await page.goto('/auth/sign-in');
      await expect(page.locator('button', { hasText: 'Continue with Google' })).toBeVisible();
      await expect(page.locator('button', { hasText: 'Continue with Facebook' })).toBeVisible();
      await expect(page.locator('button', { hasText: 'Continue with Microsoft' })).toBeVisible();
    });
  });

  test.describe('Sign In Flow', () => {
    test('should load sign in form', async ({ page }) => {
      await page.goto('/auth/sign-in');
      await expect(page.locator('h2')).toContainText('Sign in to your account');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should have sign in button', async ({ page }) => {
      await page.goto('/auth/sign-in');
      const signInButton = page.locator('button[type="submit"]', { hasText: 'Sign In' });
      await expect(signInButton).toBeVisible();
    });

    test('should have magic link option', async ({ page }) => {
      await page.goto('/auth/sign-in');
      await expect(page.locator('button', { hasText: 'Or sign in with magic link' })).toBeVisible();
    });

    test('should have link to sign up', async ({ page }) => {
      await page.goto('/auth/sign-in');
      const signUpLink = page.locator('a', { hasText: 'Create account' });
      await expect(signUpLink).toBeVisible();
    });
  });

  test.describe('Sign Up Flow', () => {
    test('should load sign up form', async ({ page }) => {
      await page.goto('/auth/sign-up');
      await expect(page.locator('h2')).toContainText('Create your account');
      await expect(page.locator('input[placeholder*="First name"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="Last name"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should have create account button', async ({ page }) => {
      await page.goto('/auth/sign-up');
      const signUpButton = page.locator('button[type="submit"]', { hasText: 'Create Account' });
      await expect(signUpButton).toBeVisible();
    });

    test('should have link to sign in', async ({ page }) => {
      await page.goto('/auth/sign-up');
      const signInLink = page.locator('a', { hasText: 'Sign in' });
      await expect(signInLink).toBeVisible();
    });
  });

  test.describe('Navigation between auth modes', () => {
    test('should navigate from sign in to sign up', async ({ page }) => {
      await page.goto('/auth/sign-in');
      const signUpLink = page.locator('a', { hasText: 'Create account' });
      await signUpLink.click();
      await expect(page.locator('h2')).toContainText('Create your account');
    });

    test('should navigate from sign up to sign in', async ({ page }) => {
      await page.goto('/auth/sign-up');
      const signInLink = page.locator('a', { hasText: 'Sign in' });
      await signInLink.click();
      await expect(page.locator('h2')).toContainText('Sign in to your account');
    });
  });

  test.describe('Route Guards', () => {
    test('should redirect unauthenticated users to auth', async ({ page }) => {
      await page.goto('/browse');
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });

    test('should redirect to auth with next parameter', async ({ page }) => {
      await page.goto('/messages');
      await expect(page).toHaveURL(/\/auth\/sign-in\?next=%2Fmessages/);
    });
  });
});
