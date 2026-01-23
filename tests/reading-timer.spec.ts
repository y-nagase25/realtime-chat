import { test, expect } from '@playwright/test';
import type { Passage } from '../lib/types/reading';

/**
 * E2E テストスイート: ReadingTimer Component
 *
 * ReadingTimer コンポーネントのテスト:
 * 1. タイマー表示（mm:ss形式）
 * 2. タイマーの動作（カウントアップ）
 * 3. 目標WPMの表示
 * 4. 読み終わり後のWPM計算
 */

const MOCK_PASSAGE: Passage = {
  title: 'A Day at the Coffee Shop',
  content: 'Sarah woke up early on Saturday morning. She ordered a cup of coffee and a croissant.',
  level: 'A2',
  topic: 'daily-life',
  wordCount: 20,
  estimatedReadingTimeMinutes: 1,
};

test.describe('ReadingTimer Component', () => {
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

  test.describe('Timer Display', () => {
    test('タイマーが表示される', async ({ page }) => {
      const timer = page.getByTestId('reading-timer');
      await expect(timer).toBeVisible();
    });

    test('初期表示が0:00である', async ({ page }) => {
      const timerDisplay = page.getByTestId('timer-display');
      await expect(timerDisplay).toContainText('0:00');
    });

    test('タイマーがカウントアップする', async ({ page }) => {
      // Wait 2 seconds for the timer to tick
      await page.waitForTimeout(2000);

      const timerDisplay = page.getByTestId('timer-display');
      const text = await timerDisplay.textContent();
      // Should show at least 0:01 or 0:02
      expect(text).not.toBe('0:00');
    });

    test('読書時間ラベルが表示される', async ({ page }) => {
      const timer = page.getByTestId('reading-timer');
      await expect(timer).toContainText('読書時間');
    });
  });

  test.describe('Target WPM', () => {
    test('目標WPMが表示される', async ({ page }) => {
      const targetWpm = page.getByTestId('target-wpm');
      await expect(targetWpm).toBeVisible();
    });

    test('A2レベルの目標WPM範囲が表示される', async ({ page }) => {
      const targetWpm = page.getByTestId('target-wpm');
      // A2 target: 80-120 WPM
      await expect(targetWpm).toContainText('80');
      await expect(targetWpm).toContainText('120');
    });

    test('目標ラベルが表示される', async ({ page }) => {
      const targetWpm = page.getByTestId('target-wpm');
      await expect(targetWpm).toContainText('目標');
    });
  });

  test.describe('Timer Format', () => {
    test('3秒後に0:03と表示される', async ({ page }) => {
      await page.waitForTimeout(3000);

      const timerDisplay = page.getByTestId('timer-display');
      const text = await timerDisplay.textContent();
      // Should be around 0:03 (allow ±1 second tolerance)
      expect(text).toMatch(/0:0[2-4]/);
    });
  });

  test.describe('Different Levels', () => {
    test('B1レベルの目標WPMが正しく表示される', async ({ page }) => {
      const b1Passage: Passage = {
        ...MOCK_PASSAGE,
        level: 'B1',
      };

      // Navigate to settings and regenerate with B1
      await page.goto('/reading');

      await page.route('/api/reading/generate', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: b1Passage }),
        });
      });

      await page.getByTestId('generate-button').click();
      await page.waitForSelector('[data-testid="passage-display"]');

      const targetWpm = page.getByTestId('target-wpm');
      // B1 target: 120-180 WPM
      await expect(targetWpm).toContainText('120');
      await expect(targetWpm).toContainText('180');
    });
  });
});
