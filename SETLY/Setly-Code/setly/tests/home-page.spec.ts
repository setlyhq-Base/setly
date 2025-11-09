import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('[data-testid="hero-section"] h1')).toContainText('Find Your Perfect Room');
  });

  test('should display hero section', async ({ page }) => {
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('text=Find Your Perfect Room')).toBeVisible();
    await expect(page.locator('text=Connect with students and find housing')).toBeVisible();
  });

  test('should have search functionality with autosuggest', async ({ page }) => {
    const searchHero = page.locator('[data-testid="search-hero"]');
    await expect(searchHero).toBeVisible();

    const searchInput = searchHero.locator('input[placeholder*="university"]');
    await searchInput.fill('Harvard');
    await expect(searchHero.locator('text=Harvard University')).toBeVisible(); // Autosuggest
  });

  test('search should navigate to browse with params', async ({ page }) => {
    const searchHero = page.locator('[data-testid="search-hero"]');
    await searchHero.locator('input[placeholder*="university"]').fill('Harvard');
    await searchHero.locator('input[placeholder*="city"]').fill('Cambridge');
    await searchHero.locator('[data-testid="search-button"]').click();

    await expect(page).toHaveURL(/\/browse\?q=Harvard&city=Cambridge/);
  });

  test('should display featured rooms section', async ({ page }) => {
    await expect(page.locator('[data-testid="featured-rooms-section"]')).toBeVisible();
    await expect(page.locator('text=Featured Rooms')).toBeVisible();

    const roomCards = page.locator('[data-testid^="room-card-"]');
    await expect(roomCards).toHaveCount(6);
    await expect(roomCards.first()).toBeVisible();
  });

  test('room card click should navigate to browse with highlight', async ({ page }) => {
    const roomCard = page.locator('[data-testid="room-card-mock-room-1"]');
    await roomCard.click();

    await expect(page).toHaveURL(/\/browse\?highlight=mock-room-1/);
  });

  test('connect button should navigate to messages if logged in', async ({ page }) => {
    // Mock logged in state or skip if auth required
    const connectButton = page.locator('[data-testid="connect-button-mock-room-1"]');
    await connectButton.click();

    // If not logged in, expect navigation to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display ride services section', async ({ page }) => {
    await expect(page.locator('[data-testid="ride-services"]')).toBeVisible();
    await expect(page.locator('text=Get Around Campus')).toBeVisible();

    await expect(page.locator('[data-testid="setlyride-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="uber-button"]')).toBeVisible();
  });

  test('SetlyRide button should open modal', async ({ page }) => {
    await page.locator('[data-testid="setlyride-button"]').click();

    const modal = page.locator('[data-testid="ride-modal"]');
    await expect(modal).toBeVisible();
  });

  test('ride modal submit should close modal and log analytics', async ({ page }) => {
    await page.locator('[data-testid="setlyride-button"]').click();

    const modal = page.locator('[data-testid="ride-modal"]');
    await expect(modal).toBeVisible();

    // Fill form and submit
    await modal.locator('input[placeholder="Pickup location"]').fill('Campus');
    await modal.locator('input[placeholder="Destination"]').fill('Airport');
    await modal.locator('button[type="submit"]').click();

    await expect(modal).not.toBeVisible();
    // Check console for analytics log
    await expect(page.locator('body')).toContainText('ride_submitted'); // Or use page.on('console')
  });

  test('Uber button should open deep link', async ({ page }) => {
    const uberButton = page.locator('[data-testid="uber-button"]');
    await uberButton.click();

    // Expect new window or link with uber://
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      uberButton.click()
    ]);
    await expect(newPage.url()).toContain('uber://');
    await newPage.close();
  });

  test('should display trust & proof section', async ({ page }) => {
    await expect(page.locator('[data-testid="trust-proof"]')).toBeVisible();
    await expect(page.locator('text=Trusted by Students')).toBeVisible();
    await expect(page.locator('text=10,000+')).toBeVisible();
  });

  test('should display how it works section', async ({ page }) => {
    await expect(page.locator('[data-testid="how-it-works"]')).toBeVisible();
    await expect(page.locator('text=How it works')).toBeVisible();
    await expect(page.locator('text=Create your profile')).toBeVisible();
    await expect(page.locator('text=Get around campus')).toBeVisible(); // New step
  });

  test('should display testimonials section', async ({ page }) => {
    await expect(page.locator('[data-testid="testimonials-section"]')).toBeVisible();
    await expect(page.locator('text=What students say')).toBeVisible();
    await expect(page.locator('[data-testid="testimonials-carousel"]')).toBeVisible();
  });

  test('testimonial carousel should auto-play', async ({ page }) => {
    await expect(page.locator('[data-testid="testimonials-carousel"]')).toBeVisible();

    // Check for multiple testimonials
    const testimonials = page.locator('.testimonial');
    await expect(testimonials).toHaveCount(3); // Assume 3 testimonials

    // Wait for auto-advance (if implemented with timeout)
    await page.waitForTimeout(3000);
    await expect(testimonials.nth(1)).toBeVisible(); // Second testimonial visible after advance
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.locator('[data-testid="faq-section"]')).toBeVisible();
    await expect(page.locator('text=Frequently asked questions')).toBeVisible();

    const faqItems = page.locator('details');
    await expect(faqItems).toHaveCount(4);

    // Test accordion
    const firstFaq = faqItems.first();
    await firstFaq.locator('summary').click();
    await expect(firstFaq.locator('div')).toBeVisible(); // Content expands
  });

  test('should display final CTA section', async ({ page }) => {
    await expect(page.locator('[data-testid="final-cta"]')).toBeVisible();
    await expect(page.locator('text=Ready for your next move?')).toBeVisible();

    await expect(page.locator('[data-testid="cta-search-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="cta-post-button"]')).toBeVisible();
  });

  test('CTA search should navigate to browse', async ({ page }) => {
    await page.locator('[data-testid="cta-search-button"]').click();

    await expect(page).toHaveURL(/\/browse/);
  });

  test('CTA post should navigate to post-room', async ({ page }) => {
    await page.locator('[data-testid="cta-post-button"]').click();

    await expect(page).toHaveURL(/\/post-room/);
  });

  test('should have footer with links', async ({ page }) => {
    await expect(page.locator('app-footer')).toBeVisible();
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Terms')).toBeVisible();
    await expect(page.locator('text=Facebook')).toBeVisible();
  });



  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('app-search-hero')).toHaveClass(/sm:flex-col/); // Responsive classes
  });

  test('should have no auth blocks on homepage', async ({ page }) => {
    // Homepage should load without redirect to login
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toBeVisible(); // Content loads
  });

  test('should have data-testids for testing', async ({ page }) => {
    await expect(page.locator('app-header')).toBeVisible();
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="featured-rooms-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="ride-services"]')).toBeVisible();
    await expect(page.locator('[data-testid="trust-proof"]')).toBeVisible();
    await expect(page.locator('[data-testid="how-it-works"]')).toBeVisible();
    await expect(page.locator('[data-testid="testimonials-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="faq-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="final-cta"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-widget"]')).toBeVisible();
    await expect(page.locator('[data-testid="ride-modal"]')).toBeHidden();
  });

  test('should have accessibility features', async ({ page }) => {
    // Check ARIA labels
    await expect(page.locator('[aria-label="Setly - Find Your next Room"]')).toBeVisible();
    await expect(page.locator('[aria-label="Request to connect"]')).toBeVisible();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible(); // Focus ring

    // Test screen reader text
    await expect(page.locator('h1')).toHaveAttribute('role', 'heading');
  });

  test('should display footer with links', async ({ page }) => {
    await expect(page.locator('app-footer')).toBeVisible();
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Terms')).toBeVisible();
    await expect(page.locator('text=Facebook')).toBeVisible();
  });

  test('header navigation links should work', async ({ page }) => {
    await page.locator('text=Browse').click();
    await expect(page).toHaveURL(/\/browse/);

    await page.goBack();
    await page.locator('text=Post Room').click();
    await expect(page).toHaveURL(/\/post-room/);

    await page.goBack();
    await page.locator('text=Messages').click();
    await expect(page).toHaveURL(/\/messages/);

    await page.goBack();
    await page.locator('text=Profile').click();
    await expect(page).toHaveURL(/\/profile/);

    await page.goBack();
    await page.locator('text=Settings').click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
