import { test, expect } from '@playwright/test';
import type { Passage } from '../lib/types/reading';

/**
 * E2E テストスイート: PassageDisplay Component
 *
 * PassageDisplay コンポーネントのテスト:
 * 1. タイトルとメタデータの表示
 * 2. パッセージテキストのレンダリング
 * 3. クリック可能な単語
 * 4. 文法パターンのハイライト
 * 5. 読了ボタン
 */

const MOCK_PASSAGE: Passage = {
  title: 'A Day at the Coffee Shop',
  content:
    "Sarah woke up early on Saturday morning. She had a busy day ahead. First, she went to the local café for breakfast. She ordered a cup of coffee and a croissant. In the afternoon, Sarah visited her friend's mansion. It was a beautiful apartment in the city center.",
  level: 'A2',
  topic: 'daily-life',
  wordCount: 50,
  estimatedReadingTimeMinutes: 2,
  grammarFocus: 'articles',
  questions: [],
};

test.describe('PassageDisplay Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reading page
    await page.goto('/reading');

    // Mock the generate API to return our test passage
    await page.route('/api/reading/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_PASSAGE }),
      });
    });

    // Click generate button to trigger passage display
    await page.getByTestId('generate-button').click();

    // Wait for the passage to be displayed
    await page.waitForSelector('[data-testid="passage-display"]');
  });

  test.describe('Title and Metadata', () => {
    test('パッセージのタイトルが表示される', async ({ page }) => {
      const title = page.getByTestId('passage-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('A Day at the Coffee Shop');
    });

    test('難易度レベルが表示される', async ({ page }) => {
      const metadata = page.getByTestId('passage-metadata');
      await expect(metadata).toContainText('A2');
    });

    test('単語数が表示される', async ({ page }) => {
      const metadata = page.getByTestId('passage-metadata');
      await expect(metadata).toContainText('50');
    });

    test('推定読書時間が表示される', async ({ page }) => {
      const metadata = page.getByTestId('passage-metadata');
      await expect(metadata).toContainText('約2分');
    });
  });

  test.describe('Passage Text Rendering', () => {
    test('パッセージのテキストが表示される', async ({ page }) => {
      const passageText = page.getByTestId('passage-content');
      await expect(passageText).toBeVisible();
      await expect(passageText).toContainText('Sarah woke up early');
    });

    test('各単語がクリック可能な要素としてレンダリングされる', async ({ page }) => {
      const clickableWords = page.locator('[data-testid="passage-content"] [data-testid^="word-"]');
      const count = await clickableWords.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Word Click Interaction', () => {
    test('単語をクリックするとonWordClickコールバックが呼ばれる', async ({ page }) => {
      // Mock the vocabulary lookup API
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              word: 'coffee',
              pronunciation: '/ˈkɒfi/',
              partOfSpeech: 'noun',
              definitionEn: 'A hot drink made from roasted beans',
              definitionJa: 'コーヒー',
              exampleSentence: 'She ordered a cup of coffee.',
            },
          }),
        });
      });

      // Click on a word
      const word = page.locator('[data-testid="word-coffee"]').first();
      await word.click();

      // The word should have a clicked/active state
      await expect(word).toHaveAttribute('data-clicked', 'true');
    });

    test('単語にホバー時にカーソルがポインターになる', async ({ page }) => {
      const word = page.locator('[data-testid="passage-content"] [data-testid^="word-"]').first();
      await expect(word).toHaveCSS('cursor', 'pointer');
    });
  });

  test.describe('Grammar Pattern Highlighting', () => {
    test('文法フォーカスがある場合、文法パターンがハイライトされる', async ({ page }) => {
      // The mock passage has grammarFocus: 'articles'
      // Articles (a, an, the) should be highlighted
      const grammarWord = page.locator('[data-grammar-highlight="true"]').first();
      await expect(grammarWord).toBeVisible();
    });

    test('ハイライトされた文法パターンに視覚的な区別がある', async ({ page }) => {
      const grammarWord = page.locator('[data-grammar-highlight="true"]').first();
      const classes = await grammarWord.getAttribute('class');
      expect(classes).toContain('grammar-highlight');
    });
  });

  test.describe('Finish Reading Button', () => {
    test('読み終わりましたボタンが表示される', async ({ page }) => {
      const finishButton = page.getByTestId('finish-reading-button');
      await expect(finishButton).toBeVisible();
      await expect(finishButton).toContainText('読み終わりました');
    });

    test('読み終わりましたボタンをクリックするとコールバックが呼ばれる', async ({ page }) => {
      const finishButton = page.getByTestId('finish-reading-button');
      await finishButton.click();

      // After clicking finish, the passage should transition
      // (the page state changes, so the passage display may be replaced)
      await expect(page.getByTestId('passage-display')).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Accessibility', () => {
    test('読み終わりましたボタンがフォーカス可能である', async ({ page }) => {
      const finishButton = page.getByTestId('finish-reading-button');
      await finishButton.focus();
      await expect(finishButton).toBeFocused();
    });
  });
});
