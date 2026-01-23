import { test, expect } from '@playwright/test';
import type { Passage, ComprehensionQuestion } from '../lib/types/reading';

/**
 * E2E テストスイート: QuestionResults Component
 *
 * QuestionResults コンポーネントのテスト:
 * 1. スコア表示（正解数/問題数、パーセント）
 * 2. 正解/不正解の表示
 * 3. 解説の表示（日本語）
 * 4. ユーザーの誤答表示
 * 5. 新しい文章ボタン
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
    question: 'What did Sarah order at the café?',
    options: [
      'Tea and a sandwich',
      'Coffee and a croissant',
      'Juice and a muffin',
      'Water and a cookie',
    ],
    correctAnswer: 1,
    explanation: 'The passage says "She ordered a cup of coffee and a croissant."',
    explanationJa: '第1段落に「She ordered a cup of coffee and a croissant」と書かれています。',
  },
  {
    id: 'q2',
    type: 'true-false',
    question: 'Sarah woke up late on Saturday morning.',
    correctAnswer: false,
    explanation: 'The passage says she woke up early, not late.',
    explanationJa: '文章では「early」と書かれており、「late」ではありません。',
  },
  {
    id: 'q3',
    type: 'fill-in-blank',
    question: 'Sarah ordered a cup of _____ and a croissant.',
    correctAnswer: 'coffee',
    acceptableAnswers: ['coffee'],
    explanation: 'The passage explicitly mentions coffee.',
    explanationJa: '文章に「coffee」と明記されています。',
  },
];

test.describe('QuestionResults Component', () => {
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

    // Mock questions API
    await page.route('/api/reading/questions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { questions: MOCK_QUESTIONS } }),
      });
    });

    // Generate passage
    await page.getByTestId('generate-button').click();
    await page.waitForSelector('[data-testid="passage-display"]');

    // Click "finished reading" to move to questions phase
    await page.getByTestId('finish-reading-button').click();
    await page.waitForSelector('[data-testid="comprehension-questions"]');

    // Answer all questions
    // Q1: Select correct answer (index 1: Coffee and a croissant)
    await page.locator('[data-testid="option-q1-1"] [data-slot="radio-group-item"]').click();
    // Q2: Select correct answer (False)
    await page.locator('[data-testid="option-q2-false"] [data-slot="radio-group-item"]').click();
    // Q3: Fill in correct answer
    await page.getByTestId('input-q3').fill('coffee');

    // Submit answers
    await page.getByTestId('submit-answers-button').click();

    // Wait for results to appear
    await page.waitForSelector('[data-testid="question-results"]');
  });

  test.describe('Score Display', () => {
    test('結果タイトルが表示される', async ({ page }) => {
      const title = page.getByTestId('results-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('結果');
    });

    test('正解数が表示される（分数形式）', async ({ page }) => {
      const score = page.getByTestId('results-score');
      await expect(score).toBeVisible();
      // All 3 answers are correct
      await expect(score).toContainText('3 / 3');
    });

    test('正解率がパーセントで表示される', async ({ page }) => {
      const percentage = page.getByTestId('results-percentage');
      await expect(percentage).toBeVisible();
      await expect(percentage).toContainText('100%');
    });

    test('「正解」ラベルが表示される', async ({ page }) => {
      const score = page.getByTestId('results-score');
      await expect(score).toContainText('正解');
    });
  });

  test.describe('Question Explanations', () => {
    test('解説セクションが表示される', async ({ page }) => {
      const explanations = page.getByTestId('results-explanations');
      await expect(explanations).toBeVisible();
      await expect(explanations).toContainText('解説');
    });

    test('各問題の結果が表示される', async ({ page }) => {
      await expect(page.getByTestId('result-q1')).toBeVisible();
      await expect(page.getByTestId('result-q2')).toBeVisible();
      await expect(page.getByTestId('result-q3')).toBeVisible();
    });

    test('問題番号が表示される', async ({ page }) => {
      await expect(page.getByTestId('result-q1')).toContainText('Q1');
      await expect(page.getByTestId('result-q2')).toContainText('Q2');
      await expect(page.getByTestId('result-q3')).toContainText('Q3');
    });

    test('正解の問題に正解マークが表示される', async ({ page }) => {
      await expect(page.getByTestId('result-q1')).toContainText('正解');
      await expect(page.getByTestId('result-q2')).toContainText('正解');
      await expect(page.getByTestId('result-q3')).toContainText('正解');
    });

    test('日本語の解説が表示される', async ({ page }) => {
      await expect(page.getByTestId('result-q1')).toContainText(
        '第1段落に「She ordered a cup of coffee and a croissant」と書かれています。'
      );
      await expect(page.getByTestId('result-q2')).toContainText(
        '文章では「early」と書かれており、「late」ではありません。'
      );
      await expect(page.getByTestId('result-q3')).toContainText(
        '文章に「coffee」と明記されています。'
      );
    });

    test('正解の答えが表示される', async ({ page }) => {
      // Multiple-choice: shows the option text
      await expect(page.getByTestId('result-q1')).toContainText('Coffee and a croissant');
      // True/False: shows "False"
      await expect(page.getByTestId('result-q2')).toContainText('False');
      // Fill-in-blank: shows the correct answer
      await expect(page.getByTestId('result-q3')).toContainText('coffee');
    });
  });

  test.describe('Incorrect Answers', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate back to settings to restart with wrong answers
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

      // Generate passage
      await page.getByTestId('generate-button').click();
      await page.waitForSelector('[data-testid="passage-display"]');

      // Move to questions
      await page.getByTestId('finish-reading-button').click();
      await page.waitForSelector('[data-testid="comprehension-questions"]');

      // Answer Q1 incorrectly (index 0: Tea and a sandwich)
      await page.locator('[data-testid="option-q1-0"] [data-slot="radio-group-item"]').click();
      // Answer Q2 incorrectly (True)
      await page.locator('[data-testid="option-q2-true"] [data-slot="radio-group-item"]').click();
      // Answer Q3 incorrectly
      await page.getByTestId('input-q3').fill('tea');

      // Submit answers
      await page.getByTestId('submit-answers-button').click();
      await page.waitForSelector('[data-testid="question-results"]');
    });

    test('不正解のスコアが表示される', async ({ page }) => {
      const score = page.getByTestId('results-score');
      await expect(score).toContainText('0 / 3');
    });

    test('不正解のパーセントが表示される', async ({ page }) => {
      const percentage = page.getByTestId('results-percentage');
      await expect(percentage).toContainText('0%');
    });

    test('不正解の問題に不正解マークが表示される', async ({ page }) => {
      await expect(page.getByTestId('result-q1')).toContainText('不正解');
    });

    test('ユーザーの誤答が表示される', async ({ page }) => {
      // Q1: user chose "Tea and a sandwich"
      await expect(page.getByTestId('result-q1')).toContainText('Tea and a sandwich');
      // Q2: user chose "True"
      await expect(page.getByTestId('result-q2')).toContainText('True');
      // Q3: user typed "tea"
      await expect(page.getByTestId('result-q3')).toContainText('tea');
    });
  });

  test.describe('Action Buttons', () => {
    test('「新しい文章」ボタンが表示される', async ({ page }) => {
      const newPassageButton = page.getByTestId('new-passage-button');
      await expect(newPassageButton).toBeVisible();
      await expect(newPassageButton).toContainText('新しい文章');
    });

    test('「新しい文章」ボタンをクリックすると設定画面に戻る', async ({ page }) => {
      await page.getByTestId('new-passage-button').click();

      // Should go back to settings phase
      await expect(page.getByTestId('generate-button')).toBeVisible();
      // Results should not be visible
      await expect(page.getByTestId('question-results')).not.toBeVisible();
    });
  });
});
