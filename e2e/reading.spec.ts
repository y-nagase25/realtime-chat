import { test, expect } from '@playwright/test';

test.describe('Reading', () => {
  test('should display passage when level and topic are selected', async ({ page }) => {
    await page.goto('/reading');

    // select level A1
    await page.getByTestId('level-selector').click();
    await page.getByRole('option', { name: 'A1 - 初級 シンプルな語彙と短い文章' }).click();

    // select topic Culture & Entertainment
    await page.getByTestId('topic-selector').click();
    await page.getByRole('option', { name: 'Culture & Entertainment' }).click();

    // click generate button
    await page.getByTestId('generate-button').click();

    // wait for passage to be displayed
    // await page.waitForTimeout(10000);

    // loading skeleton should be visible
    await expect(page.getByTestId('passage-skeleton')).toBeVisible();
  });
});
