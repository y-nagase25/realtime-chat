import { test, expect } from '@playwright/test';
import type { Passage, ComprehensionQuestion, SummaryFeedback } from '../lib/types/reading';

/**
 * E2E テストスイート: Reading Page Layout & Flow
 *
 * ページレイアウトと全体フローのテスト:
 * 1. ページメタデータ（タイトル）
 * 2. ページヘッダー
 * 3. レスポンシブレイアウト
 * 4. 全体フロー（設定→読書→問題→結果→要約）
 * 5. エラーハンドリング
 */

const MOCK_PASSAGE: Passage = {
  title: 'A Day at the Coffee Shop',
  content: 'Sarah woke up early on Saturday morning. She ordered a cup of coffee and a croissant.',
  level: 'A2',
  topic: 'daily-life',
  wordCount: 20,
  estimatedReadingTimeMinutes: 1,
};

const MOCK_QUESTIONS: ComprehensionQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What did Sarah order?',
    options: ['Tea', 'Coffee and a croissant', 'Juice', 'Water'],
    correctAnswer: 1,
    explanation: 'She ordered coffee and a croissant.',
    explanationJa: 'コーヒーとクロワッサンを注文しました。',
  },
];

const MOCK_FEEDBACK: SummaryFeedback = {
  keyPointsCaptured: ['Sarah woke up early'],
  keyPointsMissed: [],
  grammarFeedbackJa: '文法は正確です。',
  vocabularyFeedbackJa: '語彙は適切です。',
  overallFeedbackJa: 'よくできました。',
  modelSummary: 'Sarah woke up early and ordered coffee.',
  score: 90,
};

test.describe('Reading Page Layout', () => {
  test('ページタイトルにリーディング練習が含まれる', async ({ page }) => {
    await page.goto('/reading');
    await expect(page).toHaveTitle(/リーディング練習/);
  });

  test('ページヘッダーが表示される', async ({ page }) => {
    await page.goto('/reading');
    const heading = page.locator('h1');
    await expect(heading).toContainText('リーディング練習');
  });

  test('ページ説明が表示される', async ({ page }) => {
    await page.goto('/reading');
    await expect(page.locator('text=AIが生成した英文を読んで、理解力を高めましょう')).toBeVisible();
  });

  test('設定カードが初期表示される', async ({ page }) => {
    await page.goto('/reading');
    await expect(page.getByTestId('generate-button')).toBeVisible();
  });
});

test.describe('Reading Page - Full Flow', () => {
  test('設定→読書→問題→結果→新しい文章の全体フロー', async ({ page }) => {
    await page.goto('/reading');

    // Mock APIs
    await page.route('/api/reading/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_PASSAGE }),
      });
    });

    await page.route('/api/reading/questions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { questions: MOCK_QUESTIONS } }),
      });
    });

    // Phase 1: Settings → Generate
    await page.getByTestId('generate-button').click();
    await page.waitForSelector('[data-testid="passage-display"]');

    // Phase 2: Reading → Finish
    await expect(page.getByTestId('reading-timer')).toBeVisible();
    await page.getByTestId('finish-reading-button').click();

    // Phase 3: Questions → Submit
    await page.waitForSelector('[data-testid="comprehension-questions"]');
    await page.locator('[data-testid="option-q1-1"] [data-slot="radio-group-item"]').click();
    await page.getByTestId('submit-answers-button').click();

    // Phase 4: Results
    await page.waitForSelector('[data-testid="question-results"]');
    await expect(page.getByTestId('results-score')).toContainText('1 / 1');

    // Phase 5: New passage
    await page.getByTestId('new-passage-button').click();
    await expect(page.getByTestId('generate-button')).toBeVisible();
  });

  test('設定→読書→問題→結果→要約の全体フロー', async ({ page }) => {
    await page.goto('/reading');

    // Mock APIs
    await page.route('/api/reading/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_PASSAGE }),
      });
    });

    await page.route('/api/reading/questions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { questions: MOCK_QUESTIONS } }),
      });
    });

    await page.route('/api/reading/evaluate-summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_FEEDBACK }),
      });
    });

    // Generate → Read → Questions → Results
    await page.getByTestId('generate-button').click();
    await page.waitForSelector('[data-testid="passage-display"]');
    await page.getByTestId('finish-reading-button').click();
    await page.waitForSelector('[data-testid="comprehension-questions"]');
    await page.locator('[data-testid="option-q1-1"] [data-slot="radio-group-item"]').click();
    await page.getByTestId('submit-answers-button').click();
    await page.waitForSelector('[data-testid="question-results"]');

    // Results → Summary
    await page.getByTestId('write-summary-button').click();
    await page.waitForSelector('[data-testid="summary-writing"]');

    // Write and submit summary
    await page.getByTestId('summary-textarea').fill('Sarah woke up early.');
    await page.getByTestId('submit-summary-button').click();
    await page.waitForSelector('[data-testid="summary-feedback"]');

    // Verify feedback
    await expect(page.getByTestId('feedback-score')).toContainText('90');
  });
});

test.describe('Reading Page - Error Handling', () => {
  test('文章生成失敗時にエラーメッセージが表示される', async ({ page }) => {
    await page.goto('/reading');

    await page.route('/api/reading/generate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'APIエラーが発生しました' }),
      });
    });

    await page.getByTestId('generate-button').click();

    // Error message should appear
    await expect(page.locator('text=APIエラーが発生しました')).toBeVisible();

    // Should still be on settings phase
    await expect(page.getByTestId('generate-button')).toBeVisible();
  });
});
