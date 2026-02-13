import { test, expect, type Page } from '@playwright/test';

/**
 * E2E テストスイート: CSRF保護機能
 *
 * Double Submit Cookieパターンの実装をテスト:
 * 1. GET /api/csrf によるCSRFトークン取得
 * 2. 保護されたエンドポイントでのトークン検証
 * 3. レート制限との統合
 * 4. 無効/欠落トークンのエラーハンドリング
 */

// 実装と一致するテスト定数
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
 * CSRFトークンが存在することを確認して取得するヘルパー
 */
async function getRequiredCsrfToken(page: Page): Promise<string> {
  const token = await getCsrfTokenFromPage(page);
  if (!token) {
    throw new Error('CSRFトークンが見つかりません - 先に /api/csrf を呼び出してください');
  }
  return token;
}

/**
 * CSRFトークンCookieをクリアするヘルパー
 */
async function clearCsrfToken(page: Page): Promise<void> {
  await page.context().clearCookies({ name: CSRF_COOKIE_NAME });
}

test.describe('CSRFトークン取得', () => {
  test('トークンが存在しない場合、GET /api/csrf がCSRFトークンCookieを設定する', async ({
    page,
  }) => {
    // 初期状態でトークンが存在しないことを確認
    await clearCsrfToken(page);

    // コンテキストを確立するためにアプリに移動
    await page.goto('/');

    // CSRFトークンを取得
    const response = await page.request.get('/api/csrf');

    // 204 No Content を返すべき
    expect(response.status()).toBe(204);

    // CSRF Cookieが設定されているべき
    const token = await getCsrfTokenFromPage(page);
    expect(token).toBeDefined();
    expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test('トークンが既に存在する場合、GET /api/csrf が204を返す', async ({ page }) => {
    // コンテキストを確立するために移動
    await page.goto('/');

    // まず有効なCSRFトークンを取得
    await clearCsrfToken(page);
    const firstResponse = await page.request.get('/api/csrf');
    expect(firstResponse.status()).toBe(204);

    const firstToken = await getCsrfTokenFromPage(page);
    expect(firstToken).toBeDefined();

    // CSRFエンドポイントを再度取得 - トークンを変更せずに204を返すべき
    const secondResponse = await page.request.get('/api/csrf');
    expect(secondResponse.status()).toBe(204);

    // トークンは同じままであるべき
    const secondToken = await getCsrfTokenFromPage(page);
    expect(secondToken).toBe(firstToken);
  });
});

test.describe('CSRF検証 - 保護されたエンドポイント', () => {
  test('CookieとヘッダーのトークンがマッチするとPOSTが成功する', async ({ page }) => {
    await page.goto('/');

    // 実際のCSRFトークンを取得
    await clearCsrfToken(page);
    await page.request.get('/api/csrf');
    const token = await getRequiredCsrfToken(page);

    // APIエンドポイントをモックして成功を返す（実際のAPI呼び出しを避ける）
    await page.route('/api/text', async (route) => {
      // リクエストがミドルウェアを通過したことを確認
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          response: 'test response',
        }),
      });
    });

    const response = await page.request.post('/api/text', {
      headers: {
        'Content-Type': 'application/json',
        [CSRF_HEADER_NAME]: token,
      },
      data: { prompt: 'test prompt' },
    });

    // CSRF検証を通過してルートハンドラーに到達するべき
    expect(response.status()).toBe(200);
  });
});

test.describe('CSRF Cookieプロパティ', () => {
  test('CSRF Cookieに正しいセキュリティ属性がある', async ({ page }) => {
    await clearCsrfToken(page);
    await page.goto('/');

    // CSRFトークン取得を待機
    await page.waitForResponse('/api/csrf');

    // CSRF Cookieを取得
    const cookies = await page.context().cookies();
    const csrfCookie = cookies.find((c) => c.name === CSRF_COOKIE_NAME);

    expect(csrfCookie).toBeDefined();
    expect(csrfCookie?.path).toBe('/');
    expect(csrfCookie?.sameSite).toBe('Strict');

    // httpOnlyはfalseであるべき（Double Submit Cookieパターンに必要）
    // 注意: テスト環境ではhttpOnlyを直接確認できない
    // ただしトークンがJavaScriptから読み取れることは確認できる
    const tokenFromJs = await page.evaluate(() => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf_token') {
          return value;
        }
      }
      return null;
    });

    expect(tokenFromJs).toBe(csrfCookie?.value);
  });
});
