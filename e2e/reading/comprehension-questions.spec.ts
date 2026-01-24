import { test, expect } from '@playwright/test';
import type { Passage, ComprehensionQuestion } from '@/lib/types/reading';

/**
 * E2E テストスイート: ComprehensionQuestions Component
 *
 * ComprehensionQuestions コンポーネントのテスト:
 * 1. 多肢選択問題のレンダリング
 * 2. True/False問題のレンダリング
 * 3. 穴埋め問題のレンダリング
 * 4. ユーザー回答の追跡
 * 5. 送信ボタンの動作
 */

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

const MOCK_PASSAGE: Passage = {
  title: 'A Day at the Coffee Shop',
  content: 'Sarah woke up early on Saturday morning. She ordered a cup of coffee and a croissant.',
  level: 'A2',
  topic: 'daily-life',
  wordCount: 20,
  estimatedReadingTimeMinutes: 1,
  questions: MOCK_QUESTIONS,
};

test.describe('ComprehensionQuestions Component', () => {
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

    // Questions are visible in the reading phase
    await page.waitForSelector('[data-testid="comprehension-questions"]');
  });

  test.describe('Component Header', () => {
    test('タイトルが表示される', async ({ page }) => {
      const title = page.getByTestId('questions-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('理解度チェック');
    });
  });

  test.describe('Multiple Choice Questions', () => {
    test('多肢選択問題が表示される', async ({ page }) => {
      const question = page.getByTestId('question-q1');
      await expect(question).toBeVisible();
      await expect(question).toContainText('What did Sarah order at the café?');
    });

    test('4つの選択肢がラジオボタンで表示される', async ({ page }) => {
      const options = page.locator('[data-testid="question-q1"] [data-testid^="option-q1-"]');
      await expect(options).toHaveCount(4);
    });

    test('選択肢のテキストが正しく表示される', async ({ page }) => {
      await expect(page.getByTestId('option-q1-0')).toContainText('Tea and a sandwich');
      await expect(page.getByTestId('option-q1-1')).toContainText('Coffee and a croissant');
      await expect(page.getByTestId('option-q1-2')).toContainText('Juice and a muffin');
      await expect(page.getByTestId('option-q1-3')).toContainText('Water and a cookie');
    });

    test('ラジオボタンをクリックして選択できる', async ({ page }) => {
      // Click the label which triggers the radio via htmlFor
      const label = page.locator('[data-testid="option-q1-1"] label');
      await label.click();

      // Radix RadioGroupItem uses data-state="checked" when selected
      const radio = page.locator('[data-testid="option-q1-1"] [data-slot="radio-group-item"]');
      await expect(radio).toHaveAttribute('data-state', 'checked');
    });
  });

  test.describe('True/False Questions', () => {
    test('True/False問題が表示される', async ({ page }) => {
      const question = page.getByTestId('question-q2');
      await expect(question).toBeVisible();
      await expect(question).toContainText('Sarah woke up late on Saturday morning.');
    });

    test('TrueとFalseの2つの選択肢が表示される', async ({ page }) => {
      const options = page.locator('[data-testid="question-q2"] [data-testid^="option-q2-"]');
      await expect(options).toHaveCount(2);
    });

    test('TrueとFalseのラベルが表示される', async ({ page }) => {
      await expect(page.getByTestId('option-q2-true')).toContainText('True');
      await expect(page.getByTestId('option-q2-false')).toContainText('False');
    });

    test('True/Falseを選択できる', async ({ page }) => {
      // Click the label which triggers the radio via htmlFor
      const label = page.locator('[data-testid="option-q2-false"] label');
      await label.click();

      // Radix RadioGroupItem uses data-state="checked" when selected
      const radio = page.locator('[data-testid="option-q2-false"] [data-slot="radio-group-item"]');
      await expect(radio).toHaveAttribute('data-state', 'checked');
    });
  });

  test.describe('Fill-in-the-Blank Questions', () => {
    test('穴埋め問題が表示される', async ({ page }) => {
      const question = page.getByTestId('question-q3');
      await expect(question).toBeVisible();
      await expect(question).toContainText('Sarah ordered a cup of');
    });

    test('テキスト入力フィールドが表示される', async ({ page }) => {
      const input = page.getByTestId('input-q3');
      await expect(input).toBeVisible();
    });

    test('テキスト入力に回答を入力できる', async ({ page }) => {
      const input = page.getByTestId('input-q3');
      await input.fill('coffee');
      await expect(input).toHaveValue('coffee');
    });
  });

  test.describe('Submit Button', () => {
    test('送信ボタンが表示される', async ({ page }) => {
      const submitButton = page.getByTestId('submit-answers-button');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toContainText('答え合わせ');
    });

    test('全問未回答時は送信ボタンが無効', async ({ page }) => {
      const submitButton = page.getByTestId('submit-answers-button');
      await expect(submitButton).toBeDisabled();
    });

    test('全問回答後に送信ボタンが有効になる', async ({ page }) => {
      // Answer Q1 - click the radio item directly
      await page.locator('[data-testid="option-q1-1"] [data-slot="radio-group-item"]').click();
      // Answer Q2
      await page.locator('[data-testid="option-q2-false"] [data-slot="radio-group-item"]').click();
      // Answer Q3
      await page.getByTestId('input-q3').fill('coffee');

      const submitButton = page.getByTestId('submit-answers-button');
      await expect(submitButton).toBeEnabled();
    });

    test('送信ボタンをクリックすると回答が送信される', async ({ page }) => {
      // Answer all questions
      await page.locator('[data-testid="option-q1-1"] [data-slot="radio-group-item"]').click();
      await page.locator('[data-testid="option-q2-false"] [data-slot="radio-group-item"]').click();
      await page.getByTestId('input-q3').fill('coffee');

      const submitButton = page.getByTestId('submit-answers-button');
      await submitButton.click();

      // After submission, the questions component should disappear (phase changes to results)
      await expect(page.getByTestId('comprehension-questions')).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Question Numbering', () => {
    test('問題番号が表示される', async ({ page }) => {
      await expect(page.getByTestId('question-q1')).toContainText('Q1');
      await expect(page.getByTestId('question-q2')).toContainText('Q2');
      await expect(page.getByTestId('question-q3')).toContainText('Q3');
    });
  });

  test.describe('Accessibility', () => {
    test('ラジオボタンがフォーカス可能', async ({ page }) => {
      // Radix RadioGroupItem renders as a button
      const firstOption = page.locator(
        '[data-testid="option-q1-0"] [data-slot="radio-group-item"]'
      );
      await firstOption.focus();
      await expect(firstOption).toBeFocused();
    });

    test('テキスト入力がフォーカス可能', async ({ page }) => {
      const input = page.getByTestId('input-q3');
      await input.focus();
      await expect(input).toBeFocused();
    });
  });
});
