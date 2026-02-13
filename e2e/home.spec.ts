import { APP_NAME, NAV_ITEMS } from '@/lib/constants';
import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('should display title', async ({ page }) => {
    await page.goto('/');

    // title should be visible
    await expect(page.getByRole('heading', { name: APP_NAME })).toBeVisible();
  });

  test('should navigate to reading page when reading link is clicked', async ({ page }) => {
    await page.goto('/');

    const readingItem = NAV_ITEMS.find((item) => item.label === 'Reading');

    // link should be visible
    const readingLink = page.getByRole('link', {
      name: `${readingItem?.label} ${readingItem?.description}`,
    });
    await expect(readingLink).toBeVisible();
    // click link
    await readingLink.click();
    // wait for navigation
    await page.waitForURL(readingItem?.href as string);
    await expect(page.url()).toMatch(/\/reading/i);
  });

  test('should navigate to speaking page when speaking link is clicked', async ({ page }) => {
    await page.goto('/');

    const speakingItem = NAV_ITEMS.find((item) => item.label === 'Speaking');

    // link should be visible
    const speakingLink = page.getByRole('link', {
      name: `${speakingItem?.label} ${speakingItem?.description}`,
    });
    await expect(speakingLink).toBeVisible();
    // click link
    await speakingLink.click();
    // wait for navigation
    await page.waitForURL(speakingItem?.href as string);
    await expect(page.url()).toMatch(/\/speaking/i);
  });

  test('should navigate to history page when history link is clicked', async ({ page }) => {
    await page.goto('/');

    const historyItem = NAV_ITEMS.find((item) => item.label === 'History');

    // link should be visible
    const historyLink = page.getByRole('link', {
      name: `${historyItem?.label} ${historyItem?.description}`,
    });
    await expect(historyLink).toBeVisible();
    // click link
    await historyLink.click();
    // wait for navigation
    await page.waitForURL(historyItem?.href as string);
    await expect(page.url()).toMatch(/\/history/i);
  });
});
