import { test, expect } from '@playwright/test';
import type { Passage, VocabularyEntry } from '../lib/types/reading';

/**
 * E2E テストスイート: VocabularyPopup Component
 *
 * VocabularyPopup コンポーネントのテスト:
 * 1. 単語・発音・品詞の表示
 * 2. 英語定義と日本語訳の表示
 * 3. 和製英語警告の表示
 * 4. 例文の表示
 * 5. 単語保存ボタン
 * 6. ポップアップの閉じる機能
 * 7. ローディング状態
 */

const MOCK_PASSAGE: Passage = {
  title: 'A Day at the Coffee Shop',
  content:
    "Sarah woke up early on Saturday morning. She ordered a cup of coffee and a croissant. In the afternoon, Sarah visited her friend's mansion. It was a beautiful apartment.",
  level: 'A2',
  topic: 'daily-life',
  wordCount: 30,
  estimatedReadingTimeMinutes: 1,
};

const MOCK_VOCAB_ENTRY: VocabularyEntry = {
  word: 'coffee',
  pronunciation: '/ˈkɒfi/',
  partOfSpeech: 'noun',
  definitionEn: 'A hot drink made from roasted beans',
  definitionJa: 'コーヒー',
  exampleSentence: 'She ordered a cup of coffee every morning.',
};

const MOCK_WASEI_EIGO_ENTRY: VocabularyEntry = {
  word: 'mansion',
  pronunciation: '/ˈmænʃən/',
  partOfSpeech: 'noun',
  definitionEn: 'A large impressive house',
  definitionJa: '豪邸、大邸宅',
  exampleSentence: 'They live in a mansion with 20 rooms.',
  waseiEigoWarning: {
    word: 'mansion',
    japaneseUsage: 'マンション',
    japaneseUsageMeaning: 'apartment',
    actualEnglishMeaning: '豪邸、大邸宅',
    warningJa:
      '日本語の「マンション」は英語では "apartment" や "condominium" です。英語の "mansion" は大きな豪邸を意味します。',
  },
};

test.describe('VocabularyPopup Component', () => {
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

  test.describe('Basic Display', () => {
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
      await page.locator('[data-testid="word-coffee"]').first().click();

      // Popup should appear
      const popup = page.getByTestId('vocabulary-popup');
      await expect(popup).toBeVisible();
    });

    test('単語名が表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const wordDisplay = page.getByTestId('vocab-word');
      await expect(wordDisplay).toContainText('coffee');
    });

    test('発音が表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const pronunciation = page.getByTestId('vocab-pronunciation');
      await expect(pronunciation).toContainText('/ˈkɒfi/');
    });

    test('品詞が表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const pos = page.getByTestId('vocab-part-of-speech');
      await expect(pos).toContainText('noun');
    });
  });

  test.describe('Definitions', () => {
    test('英語定義が表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const defEn = page.getByTestId('vocab-definition-en');
      await expect(defEn).toContainText('A hot drink made from roasted beans');
    });

    test('日本語訳が表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const defJa = page.getByTestId('vocab-definition-ja');
      await expect(defJa).toContainText('コーヒー');
    });
  });

  test.describe('Example Sentence', () => {
    test('例文が表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const example = page.getByTestId('vocab-example');
      await expect(example).toContainText('She ordered a cup of coffee every morning.');
    });
  });

  test.describe('Wasei-Eigo Warning', () => {
    test('和製英語の場合、警告が表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_WASEI_EIGO_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-mansion"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const warning = page.getByTestId('vocab-wasei-eigo-warning');
      await expect(warning).toBeVisible();
    });

    test('和製英語警告に日本語の説明が表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_WASEI_EIGO_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-mansion"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const warning = page.getByTestId('vocab-wasei-eigo-warning');
      await expect(warning).toContainText('和製英語注意');
      await expect(warning).toContainText('apartment');
    });

    test('和製英語でない場合、警告は表示されない', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const warning = page.getByTestId('vocab-wasei-eigo-warning');
      await expect(warning).not.toBeVisible();
    });
  });

  test.describe('Save Button', () => {
    test('保存ボタンが表示される', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const saveButton = page.getByTestId('vocab-save-button');
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toContainText('単語を保存');
    });

    test('保存ボタンをクリックすると保存済み状態になる', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      const saveButton = page.getByTestId('vocab-save-button');
      await saveButton.click();

      // After saving, button should show saved state
      await expect(saveButton).toContainText('保存済み');
    });
  });

  test.describe('Close Functionality', () => {
    test('閉じるボタンでポップアップが閉じる', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
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

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      // Click outside the popup (on the page body)
      await page.locator('h1').click();

      await expect(page.getByTestId('vocabulary-popup')).not.toBeVisible();
    });
  });

  test.describe('Loading State', () => {
    test('ローディング中はスピナーが表示される', async ({ page }) => {
      // Delay the API response to test loading state
      await page.route('/api/reading/vocabulary', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();

      // Loading spinner should be visible
      const spinner = page.getByTestId('vocab-loading');
      await expect(spinner).toBeVisible();
    });

    test('データ読み込み後にスピナーが消える', async ({ page }) => {
      await page.route('/api/reading/vocabulary', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_VOCAB_ENTRY }),
        });
      });

      await page.locator('[data-testid="word-coffee"]').first().click();
      await page.waitForSelector('[data-testid="vocabulary-popup"]');

      // After loading, spinner should not be visible
      const spinner = page.getByTestId('vocab-loading');
      await expect(spinner).not.toBeVisible();
    });
  });
});
