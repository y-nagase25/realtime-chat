import { test, expect } from '@playwright/test';
import type { Passage, VocabularyEntry } from '@/lib/types/reading';

/**
 * E2E テストスイート: VocabularyPopup Component
 *
 * VocabularyPopup コンポーネントのテスト（動作確認のみ）:
 * 詳細なコンテンツ表示（定義、発音など）のテストは components/reading/VocabularyPopup.test.tsx (Vitest) に移行済み。
 */

const MOCK_PASSAGE: Passage = {
  title: 'A Day at the Coffee Shop',
  content: 'Sarah woke up early.',
  level: 'A2',
  topic: 'daily-life',
  wordCount: 30,
  estimatedReadingTimeMinutes: 1,
  questions: [],
};

const MOCK_VOCAB_ENTRY: VocabularyEntry = {
  word: 'early',
  pronunciation: '/ˈɜːli/',
  partOfSpeech: 'adverb',
  definitionEn: 'Before the usual or expected time',
  definitionJa: '早く',
  exampleSentence: 'She woke up early.',
};

test.describe('VocabularyPopup Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reading');

    // Mock the generate API
    await page.route('/api/reading/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_PASSAGE }),
      });
    });

    // Generate passage to get to the reading phase
    await page.getByTestId('generate-button').click();
    await page.waitForSelector('[data-testid="passage-display"]');
  });

  test('単語をクリックするとポップアップが表示される', async ({ page }) => {
    // Mock vocabulary API
    await page.route('/api/reading/vocabulary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
      });
    });

    // Click a word
    await page.locator('[data-testid^="word-"]').first().click();

    // Popup should appear
    const popup = page.getByTestId('vocabulary-popup');
    await expect(popup).toBeVisible();
  });

  test('閉じるボタンでポップアップが閉じる', async ({ page }) => {
    await page.route('/api/reading/vocabulary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
      });
    });

    await page.locator('[data-testid^="word-"]').first().click();
    await page.waitForSelector('[data-testid="vocabulary-popup"]');

    const closeButton = page.getByTestId('vocab-close-button');
    await closeButton.click();

    await expect(page.getByTestId('vocabulary-popup')).not.toBeVisible();
  });

  test('ポップアップ外をクリックすると閉じる', async ({ page }) => {
    await page.route('/api/reading/vocabulary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
      });
    });

    await page.locator('[data-testid^="word-"]').first().click();
    await page.waitForSelector('[data-testid="vocabulary-popup"]');

    // Click outside the popup (on the page body)
    await page.locator('h1').click();

    await expect(page.getByTestId('vocabulary-popup')).not.toBeVisible();
  });
});
