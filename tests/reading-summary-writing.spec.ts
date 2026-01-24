import { test, expect } from '@playwright/test';
import type { Passage, ComprehensionQuestion, SummaryFeedback } from '../lib/types/reading';

/**
 * E2E テストスイート: SummaryWriting Component
 *
 * SummaryWriting コンポーネントのテスト:
 * 1. テキストエリアの表示と入力
 * 2. 語数カウント表示
 * 3. 送信ボタンの動作
 * 4. AIフィードバックの表示（日本語）
 * 5. モデル要約の表示
 */

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

const MOCK_PASSAGE: Passage = {
  title: 'A Day at the Coffee Shop',
  content: 'Sarah woke up early on Saturday morning. She ordered a cup of coffee and a croissant.',
  level: 'A2',
  topic: 'daily-life',
  wordCount: 20,
  estimatedReadingTimeMinutes: 1,
  questions: MOCK_QUESTIONS,
};

const MOCK_FEEDBACK: SummaryFeedback = {
  keyPointsCaptured: ['Sarah woke up early', 'She ordered coffee'],
  keyPointsMissed: ['She also ordered a croissant'],
  grammarFeedbackJa: '文法は概ね正確です。過去形の使い方が適切です。',
  vocabularyFeedbackJa: '基本的な語彙を正しく使用しています。',
  overallFeedbackJa:
    '主要なポイントをよく捉えています。クロワッサンについても言及するとさらに良いでしょう。',
  modelSummary:
    'Sarah woke up early on Saturday and went to a coffee shop where she ordered coffee and a croissant.',
  score: 75,
};

test.describe('SummaryWriting Component', () => {
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

    // Move to questions
    await page.getByTestId('finish-reading-button').click();
    await page.waitForSelector('[data-testid="comprehension-questions"]');

    // Answer question and submit
    await page.locator('[data-testid="option-q1-1"] [data-slot="radio-group-item"]').click();
    await page.getByTestId('submit-answers-button').click();
    await page.waitForSelector('[data-testid="question-results"]');

    // Click "要約を書く" button to go to summary phase
    await page.getByTestId('write-summary-button').click();
    await page.waitForSelector('[data-testid="summary-writing"]');
  });

  test.describe('Text Area', () => {
    test('テキストエリアが表示される', async ({ page }) => {
      const textarea = page.getByTestId('summary-textarea');
      await expect(textarea).toBeVisible();
    });

    test('プレースホルダーテキストが表示される', async ({ page }) => {
      const textarea = page.getByTestId('summary-textarea');
      await expect(textarea).toHaveAttribute('placeholder', /要約/);
    });

    test('テキストを入力できる', async ({ page }) => {
      const textarea = page.getByTestId('summary-textarea');
      await textarea.fill('Sarah woke up early and ordered coffee.');
      await expect(textarea).toHaveValue('Sarah woke up early and ordered coffee.');
    });
  });

  test.describe('Word Count', () => {
    test('語数カウントが表示される', async ({ page }) => {
      const wordCount = page.getByTestId('summary-word-count');
      await expect(wordCount).toBeVisible();
    });

    test('初期状態で0語と表示される', async ({ page }) => {
      const wordCount = page.getByTestId('summary-word-count');
      await expect(wordCount).toContainText('0');
    });

    test('入力に応じて語数が更新される', async ({ page }) => {
      const textarea = page.getByTestId('summary-textarea');
      await textarea.fill('Sarah woke up early and ordered coffee.');

      const wordCount = page.getByTestId('summary-word-count');
      await expect(wordCount).toContainText('7');
    });
  });

  test.describe('Submit Button', () => {
    test('送信ボタンが表示される', async ({ page }) => {
      const submitButton = page.getByTestId('submit-summary-button');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toContainText('評価');
    });

    test('テキスト未入力時は送信ボタンが無効', async ({ page }) => {
      const submitButton = page.getByTestId('submit-summary-button');
      await expect(submitButton).toBeDisabled();
    });

    test('テキスト入力後に送信ボタンが有効になる', async ({ page }) => {
      const textarea = page.getByTestId('summary-textarea');
      await textarea.fill('Sarah ordered coffee.');

      const submitButton = page.getByTestId('submit-summary-button');
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('AI Feedback Display', () => {
    test.beforeEach(async ({ page }) => {
      // Mock evaluate-summary API
      await page.route('/api/reading/evaluate-summary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_FEEDBACK }),
        });
      });

      // Type summary and submit
      const textarea = page.getByTestId('summary-textarea');
      await textarea.fill('Sarah woke up early and ordered coffee.');
      await page.getByTestId('submit-summary-button').click();

      // Wait for feedback
      await page.waitForSelector('[data-testid="summary-feedback"]');
    });

    test('フィードバックセクションが表示される', async ({ page }) => {
      const feedback = page.getByTestId('summary-feedback');
      await expect(feedback).toBeVisible();
    });

    test('スコアが表示される', async ({ page }) => {
      const score = page.getByTestId('feedback-score');
      await expect(score).toBeVisible();
      await expect(score).toContainText('75');
    });

    test('総合フィードバックが日本語で表示される', async ({ page }) => {
      const overall = page.getByTestId('feedback-overall');
      await expect(overall).toContainText(
        '主要なポイントをよく捉えています。クロワッサンについても言及するとさらに良いでしょう。'
      );
    });

    test('文法フィードバックが表示される', async ({ page }) => {
      const grammar = page.getByTestId('feedback-grammar');
      await expect(grammar).toContainText('文法は概ね正確です。過去形の使い方が適切です。');
    });

    test('語彙フィードバックが表示される', async ({ page }) => {
      const vocabulary = page.getByTestId('feedback-vocabulary');
      await expect(vocabulary).toContainText('基本的な語彙を正しく使用しています。');
    });

    test('捉えたポイントが表示される', async ({ page }) => {
      const captured = page.getByTestId('feedback-captured');
      await expect(captured).toContainText('Sarah woke up early');
      await expect(captured).toContainText('She ordered coffee');
    });

    test('見逃したポイントが表示される', async ({ page }) => {
      const missed = page.getByTestId('feedback-missed');
      await expect(missed).toContainText('She also ordered a croissant');
    });

    test('モデル要約が表示される', async ({ page }) => {
      const modelSummary = page.getByTestId('feedback-model-summary');
      await expect(modelSummary).toContainText(
        'Sarah woke up early on Saturday and went to a coffee shop where she ordered coffee and a croissant.'
      );
    });
  });

  test.describe('Title', () => {
    test('タイトルが表示される', async ({ page }) => {
      const title = page.getByTestId('summary-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('要約');
    });
  });
});
