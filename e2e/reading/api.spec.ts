import { test, expect, type Page } from '@playwright/test';

/**
 * E2E テストスイート: Reading Practice API
 *
 * リーディング練習機能のAPIエンドポイントをテスト:
 * 1. POST /api/reading/generate - 文章・問題生成
 * 2. POST /api/reading/vocabulary - 単語検索
 * 3. POST /api/reading/evaluate-summary - 要約評価
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * ページのCookieからCSRFトークンを取得するヘルパー
 */
async function getCsrfTokenFromPage(page: Page): Promise<string | undefined> {
  const cookies = await page.context().cookies();
  const csrfCookie = cookies.find((c) => c.name === CSRF_COOKIE_NAME);
  return csrfCookie?.value;
}

/**
 * CSRFトークンを取得して返すヘルパー
 */
async function setupCsrfToken(page: Page): Promise<string> {
  await page.goto('/');
  await page.context().clearCookies({ name: CSRF_COOKIE_NAME });
  await page.request.get('/api/csrf');
  const token = await getCsrfTokenFromPage(page);
  if (!token) {
    throw new Error('CSRFトークンの取得に失敗しました');
  }
  return token;
}

test.describe('Reading Passage Generation API', () => {
  test.describe('POST /api/reading/generate', () => {
    test('有効なリクエストで文章を生成する', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/generate', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          level: 'A2',
          topic: 'daily-life',
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.title).toBeDefined();
      expect(body.data.content).toBeDefined();
      expect(body.data.level).toBe('A2');
      expect(body.data.topic).toBe('daily-life');
      expect(body.data.wordCount).toBeGreaterThan(0);
      expect(body.data.estimatedReadingTimeMinutes).toBeGreaterThan(0);
    });

    test('grammarFocusオプション付きで文章を生成する', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/generate', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          level: 'B1',
          topic: 'business',
          grammarFocus: 'present-perfect',
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.grammarFocus).toBe('present-perfect');
    });

    test('無効なlevelで400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/generate', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          level: 'X1', // 無効なレベル
          topic: 'daily-life',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    test('無効なtopicで400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/generate', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          level: 'A1',
          topic: 'invalid-topic', // 無効なトピック
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    test('levelが欠落している場合400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/generate', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          topic: 'daily-life',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    });

    test('topicが欠落している場合400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/generate', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          level: 'A1',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    });

    test('CSRFトークンなしで403エラーを返す', async ({ page }) => {
      await page.goto('/');
      await page.context().clearCookies({ name: CSRF_COOKIE_NAME });

      const response = await page.request.post('/api/reading/generate', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          level: 'A1',
          topic: 'daily-life',
        },
      });

      expect(response.status()).toBe(403);
    });
  });
});

test.describe('Vocabulary Lookup API', () => {
  test.describe('POST /api/reading/vocabulary', () => {
    test('有効な単語で定義を返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/vocabulary', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          word: 'beautiful',
          context: 'The garden was beautiful in spring.',
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.word).toBe('beautiful');
      expect(body.data.partOfSpeech).toBeDefined();
      expect(body.data.definitionEn).toBeDefined();
      expect(body.data.definitionJa).toBeDefined();
      expect(body.data.exampleSentence).toBeDefined();
    });

    test('contextなしでも単語検索できる', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/vocabulary', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          word: 'happy',
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.word).toBe('happy');
    });

    test('wordが欠落している場合400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/vocabulary', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          context: 'Some context without word.',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    });

    test('空のwordで400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/vocabulary', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          word: '',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    });
  });
});

test.describe('Summary Evaluation API', () => {
  test.describe('POST /api/reading/evaluate-summary', () => {
    test('有効なリクエストで要約を評価する', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const passage = `
        Global warming is one of the most pressing issues facing our planet today.
        Scientists have observed a significant increase in average global temperatures
        over the past century. This rise in temperature is primarily caused by human
        activities, particularly the burning of fossil fuels. The consequences include
        rising sea levels, more extreme weather events, and threats to biodiversity.
      `;

      const userSummary =
        'Global warming is a serious problem. It is caused by burning fossil fuels and leads to rising sea levels.';

      const response = await page.request.post('/api/reading/evaluate-summary', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          passage,
          userSummary,
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.keyPointsCaptured).toBeDefined();
      expect(Array.isArray(body.data.keyPointsCaptured)).toBe(true);
      expect(body.data.keyPointsMissed).toBeDefined();
      expect(Array.isArray(body.data.keyPointsMissed)).toBe(true);
      expect(body.data.grammarFeedbackJa).toBeDefined();
      expect(body.data.vocabularyFeedbackJa).toBeDefined();
      expect(body.data.overallFeedbackJa).toBeDefined();
      expect(body.data.modelSummary).toBeDefined();
      expect(body.data.score).toBeGreaterThanOrEqual(0);
      expect(body.data.score).toBeLessThanOrEqual(100);
    });

    test('passageが欠落している場合400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/evaluate-summary', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          userSummary: 'This is my summary.',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    });

    test('userSummaryが欠落している場合400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/evaluate-summary', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          passage: 'Some passage text here.',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    });

    test('空のuserSummaryで400エラーを返す', async ({ page }) => {
      const token = await setupCsrfToken(page);

      const response = await page.request.post('/api/reading/evaluate-summary', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: token,
        },
        data: {
          passage: 'Some passage text here.',
          userSummary: '',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    });
  });
});

test.describe('Rate Limiting for Reading APIs', () => {
  test('レート制限ヘッダーがレスポンスに含まれる', async ({ page }) => {
    const token = await setupCsrfToken(page);

    // vocabulary APIを使用（最も軽量）
    const response = await page.request.post('/api/reading/vocabulary', {
      headers: {
        'Content-Type': 'application/json',
        [CSRF_HEADER_NAME]: token,
      },
      data: {
        word: 'test',
      },
    });

    // ステータスに関わらずレート制限ヘッダーを確認
    expect(response.headers()['x-ratelimit-limit']).toBeDefined();
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers()['x-ratelimit-reset']).toBeDefined();
  });
});
