import { test, expect } from '@playwright/test';
import type { Passage } from '@/lib/types/reading';

/**
 * E2E テストスイート: ReadingTimer Component
 *
 * ReadingTimer コンポーネントのテスト（表示確認のみ）:
 * ロジックやカウントアップの詳細テストは components/reading/ReadingTimer.test.tsx (Vitest) に移行済み。
 */

const MOCK_PASSAGE: Passage = {
  title: 'A Day at the Coffee Shop',
  content: 'Sarah woke up early on Saturday morning.',
  level: 'A2',
  topic: 'daily-life',
  wordCount: 20,
  estimatedReadingTimeMinutes: 1,
  questions: [],
};

test.describe('ReadingTimer Component (Visual Only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reading');

    // Mock generate API
    await page.route('/api/reading/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_PASSAGE }),
      });
    });

    // Generate passage
    await page.getByTestId('generate-button').click();
    await page.waitForSelector('[data-testid="passage-display"]');
  });

  test('タイマーが表示される', async ({ page }) => {
    const timer = page.getByTestId('reading-timer');
    await expect(timer).toBeVisible();
    await expect(timer).toContainText('読書時間');
  });

  test('目標WPMが表示される', async ({ page }) => {
    const targetWpm = page.getByTestId('target-wpm');
    await expect(targetWpm).toBeVisible();
    await expect(targetWpm).toContainText('目標');
  });
});
