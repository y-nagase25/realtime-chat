import { test, expect } from '@playwright/test';

/**
 * E2E テストスイート: ReadingSettings Component
 *
 * ReadingSettings コンポーネントのテスト:
 * 1. レベル選択のテスト (A1-C1)
 * 2. トピック選択のテスト (6トピック)
 * 3. 文法フォーカス選択のテスト (オプション)
 * 4. フォーム送信のテスト
 * 5. 日本語ラベルの表示テスト
 */

test.describe('ReadingSettings Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reading practice page
    await page.goto('/reading');
    // Wait for page to be fully loaded
    await page.waitForSelector('[data-testid="level-selector"]');
  });

  test.describe('Level Selector', () => {
    test('全5レベル (A1, A2, B1, B2, C1) が選択可能である', async ({ page }) => {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

      // Open level selector
      await page.getByTestId('level-selector').click();

      // Verify all options are visible - Radix Select uses role="option"
      for (const level of levels) {
        const option = page.getByRole('option').filter({ hasText: new RegExp(`^${level} -`) });
        await expect(option).toBeVisible();
      }

      // Close by pressing Escape
      await page.keyboard.press('Escape');
    });

    test('レベルに日本語説明が表示される', async ({ page }) => {
      await page.getByTestId('level-selector').click();

      // Check Japanese level labels exist in dropdown options
      const dropdown = page.locator('[data-radix-select-viewport]');
      await expect(dropdown.getByText('A1 - 初級')).toBeVisible();
      await expect(dropdown.getByText('A2 - 初中級')).toBeVisible();
      await expect(dropdown.getByText('B1 - 中級')).toBeVisible();
      await expect(dropdown.getByText('B2 - 中上級')).toBeVisible();
      await expect(dropdown.getByText('C1 - 上級')).toBeVisible();

      await page.keyboard.press('Escape');
    });

    test('デフォルトでA2が選択されている', async ({ page }) => {
      const levelSelector = page.getByTestId('level-selector');
      await expect(levelSelector).toContainText('A2');
    });
  });

  test.describe('Topic Selector', () => {
    test('全6トピックが選択可能である', async ({ page }) => {
      const topicsJa = ['日常生活', 'ビジネス', '旅行', 'ニュース', '科学技術', '文化・エンタメ'];

      await page.getByTestId('topic-selector').click();

      const dropdown = page.locator('[data-radix-select-viewport]');
      for (const topic of topicsJa) {
        await expect(dropdown.getByText(topic)).toBeVisible();
      }

      await page.keyboard.press('Escape');
    });

    test('トピックに英語と日本語ラベルが表示される', async ({ page }) => {
      await page.getByTestId('topic-selector').click();

      const dropdown = page.locator('[data-radix-select-viewport]');
      // Check both English and Japanese labels are visible
      await expect(dropdown.getByText('Daily Life')).toBeVisible();
      await expect(dropdown.getByText('日常生活')).toBeVisible();
      await expect(dropdown.getByText('Business')).toBeVisible();
      await expect(dropdown.getByText('ビジネス')).toBeVisible();

      await page.keyboard.press('Escape');
    });

    test('デフォルトでdaily-lifeが選択されている', async ({ page }) => {
      const topicSelector = page.getByTestId('topic-selector');
      await expect(topicSelector).toContainText('日常生活');
    });
  });

  test.describe('Grammar Focus Selector', () => {
    test('文法フォーカスはオプションである', async ({ page }) => {
      const grammarSelector = page.getByTestId('grammar-selector');

      // Should show "選択なし" by default
      await expect(grammarSelector).toContainText('選択なし');
    });

    test('全6文法パターンが選択可能である', async ({ page }) => {
      const patternsJa = ['冠詞', '前置詞', '現在完了形', '関係代名詞', '受動態', '条件文'];

      await page.getByTestId('grammar-selector').click();

      const dropdown = page.locator('[data-radix-select-viewport]');
      for (const pattern of patternsJa) {
        await expect(dropdown.getByText(pattern)).toBeVisible();
      }

      await page.keyboard.press('Escape');
    });

    test('文法パターンに日本語説明が表示される', async ({ page }) => {
      await page.getByTestId('grammar-selector').click();

      const dropdown = page.locator('[data-radix-select-viewport]');
      await expect(dropdown.getByText('冠詞')).toBeVisible();
      await expect(dropdown.getByText('前置詞')).toBeVisible();

      await page.keyboard.press('Escape');
    });
  });

  test.describe('Form Submission', () => {
    test('設定を選択して送信できる', async ({ page }) => {
      // Intercept API to delay response (to test loading state)
      await page.route('/api/reading/generate', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 403,
          body: JSON.stringify({ success: false, error: 'Test' }),
        });
      });

      // Select level B1
      await page.getByTestId('level-selector').click();
      await page.getByRole('option').filter({ hasText: /^B1 -/ }).click();

      // Select topic Business
      await page.getByTestId('topic-selector').click();
      await page.getByRole('option').filter({ hasText: 'Business' }).click();

      // Click generate button
      const generateButton = page.getByTestId('generate-button');
      await expect(generateButton).toBeEnabled();
      await generateButton.click();

      // Should show loading state
      await expect(generateButton).toHaveAttribute('data-loading', 'true');
    });

    test('ローディング中は送信ボタンが無効になる', async ({ page }) => {
      // Intercept API to delay response
      await page.route('/api/reading/generate', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 403,
          body: JSON.stringify({ success: false, error: 'Test' }),
        });
      });

      const generateButton = page.getByTestId('generate-button');

      // Click to trigger loading
      await generateButton.click();

      // Wait for loading state to be set
      await expect(generateButton).toHaveAttribute('data-loading', 'true', { timeout: 2000 });
      // Button should be disabled during loading
      await expect(generateButton).toBeDisabled({ timeout: 2000 });
    });

    test('送信ボタンに日本語ラベルが表示される', async ({ page }) => {
      const generateButton = page.getByTestId('generate-button');
      await expect(generateButton).toContainText('文章を生成');
    });
  });

  test.describe('Japanese Labels', () => {
    test('レベルラベルが日本語で表示される', async ({ page }) => {
      // Look for label with exact match
      await expect(page.getByText('難易度', { exact: true })).toBeVisible();
    });

    test('トピックラベルが日本語で表示される', async ({ page }) => {
      await expect(page.getByText('トピック', { exact: true })).toBeVisible();
    });

    test('文法フォーカスラベルが日本語で表示される', async ({ page }) => {
      // The label includes (オプション) suffix
      await expect(page.getByText('文法フォーカス（オプション）')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('フォーム要素がフォーカス可能である', async ({ page }) => {
      // Focus first selector
      await page.getByTestId('level-selector').focus();
      await expect(page.getByTestId('level-selector')).toBeFocused();

      // Tab to topic selector
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('topic-selector')).toBeFocused();

      // Tab to grammar selector
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('grammar-selector')).toBeFocused();

      // Tab to generate button
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('generate-button')).toBeFocused();
    });

    test('ARIAラベルが適切に設定されている', async ({ page }) => {
      const levelSelector = page.getByTestId('level-selector');
      await expect(levelSelector).toHaveAttribute('aria-label', '難易度を選択');

      const topicSelector = page.getByTestId('topic-selector');
      await expect(topicSelector).toHaveAttribute('aria-label', 'トピックを選択');

      const grammarSelector = page.getByTestId('grammar-selector');
      await expect(grammarSelector).toHaveAttribute('aria-label', '文法フォーカスを選択');
    });
  });
});
