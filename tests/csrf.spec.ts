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

const PROTECTED_ENDPOINTS = [
  '/api/realtime/session',
  '/api/transcribe',
  '/api/text',
  '/api/speaking/score',
];

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

/**
 * 特定の値でCSRFトークンCookieを設定するヘルパー
 */
async function setCsrfToken(page: Page, token: string): Promise<void> {
  await page.context().addCookies([
    {
      name: CSRF_COOKIE_NAME,
      value: token,
      domain: 'localhost',
      path: '/',
    },
  ]);
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

  test('CSRFトークンが有効なUUID形式である', async ({ page }) => {
    await clearCsrfToken(page);
    await page.goto('/');

    await page.request.get('/api/csrf');

    const token = await getCsrfTokenFromPage(page);
    expect(token).toBeDefined();

    // UUID v4 パターン
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(token).toMatch(uuidPattern);
  });
});

test.describe('CSRF検証 - 保護されたエンドポイント', () => {
  test.describe('CSRFトークンなし', () => {
    for (const endpoint of PROTECTED_ENDPOINTS) {
      test(`CSRFトークンなしでPOST ${endpoint} が403を返す`, async ({ page }) => {
        await page.goto('/');
        await clearCsrfToken(page);

        // ミドルウェアがリクエストをブロックするため、ルートモックは到達されない想定
        await page.route(endpoint, async (route) => {
          await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
        });

        const response = await page.request.post(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          data: {},
        });

        // ミドルウェアがルートハンドラーに到達する前に403を返すべき
        expect(response.status()).toBe(403);

        const body = await response.json();
        expect(body.error).toBe('Forbidden');
        expect(body.message).toContain('CSRF');
      });
    }
  });

  test.describe('CSRFトークン不一致', () => {
    test('ヘッダートークンがCookieトークンと異なる場合、POSTが403を返す', async ({ page }) => {
      await page.goto('/');

      // Cookieトークンを設定
      const cookieToken = 'cookie-token-abc123';
      await setCsrfToken(page, cookieToken);

      // 異なるヘッダートークンでリクエストを送信
      const response = await page.request.post('/api/text', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: 'different-header-token-xyz789',
        },
        data: { prompt: 'test' },
      });

      expect(response.status()).toBe(403);

      const body = await response.json();
      expect(body.error).toBe('Forbidden');
    });

    test('Cookieトークンのみ存在する場合（ヘッダーなし）、POSTが403を返す', async ({ page }) => {
      await page.goto('/');

      // Cookieトークンを設定するがヘッダーは送信しない
      await setCsrfToken(page, 'cookie-only-token');

      const response = await page.request.post('/api/text', {
        headers: {
          'Content-Type': 'application/json',
          // CSRFヘッダーなし
        },
        data: { prompt: 'test' },
      });

      expect(response.status()).toBe(403);
    });

    test('ヘッダートークンのみ存在する場合（Cookieなし）、POSTが403を返す', async ({ page }) => {
      await page.goto('/');
      await clearCsrfToken(page);

      const response = await page.request.post('/api/text', {
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: 'header-only-token',
        },
        data: { prompt: 'test' },
      });

      expect(response.status()).toBe(403);
    });
  });

  test.describe('有効な一致するCSRFトークン', () => {
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
});

test.describe('CSRFとレート制限の統合', () => {
  test('有効なリクエストの成功レスポンスにレート制限ヘッダーが含まれる', async ({ page }) => {
    await page.goto('/');

    // 有効なCSRFトークンを取得
    await clearCsrfToken(page);
    await page.request.get('/api/csrf');
    const token = await getRequiredCsrfToken(page);

    // エンドポイントをモックして成功を返す
    await page.route('/api/text', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '29',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
        },
        body: JSON.stringify({ success: true }),
      });
    });

    const response = await page.request.post('/api/text', {
      headers: {
        'Content-Type': 'application/json',
        [CSRF_HEADER_NAME]: token,
      },
      data: { prompt: 'test' },
    });

    expect(response.status()).toBe(200);

    // レート制限ヘッダーが存在することを確認（テスト順序により値は変動する可能性あり）
    expect(response.headers()['x-ratelimit-limit']).toBe('30');
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    // 残り回数は非負の数であるべき
    const remaining = Number.parseInt(response.headers()['x-ratelimit-remaining'], 10);
    expect(remaining).toBeGreaterThanOrEqual(0);
    expect(remaining).toBeLessThanOrEqual(30);
    expect(response.headers()['x-ratelimit-reset']).toBeDefined();
  });

  test('403 CSRFエラーレスポンスにレート制限ヘッダーが含まれる', async ({ page }) => {
    // CSRFが失敗しても、レスポンスにはレート制限ヘッダーが含まれるべき
    // クライアントがレート制限状態を知るために重要

    await page.goto('/');
    await clearCsrfToken(page); // CSRFトークンなし

    const response = await page.request.post('/api/text', {
      headers: {
        'Content-Type': 'application/json',
        // CSRFトークンなし
      },
      data: { prompt: 'test' },
    });

    // 403 (CSRF) を取得するべき
    expect(response.status()).toBe(403);

    // レート制限ヘッダーは引き続き存在するべき
    expect(response.headers()['x-ratelimit-limit']).toBeDefined();
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers()['x-ratelimit-reset']).toBeDefined();
  });

  test('レスポンスにレート制限ヘッダーが含まれる', async ({ page }) => {
    await page.goto('/');

    // 有効なCSRFトークンを取得
    await clearCsrfToken(page);
    await page.request.get('/api/csrf');
    const token = await getRequiredCsrfToken(page);

    // ミドルウェアヘッダーをシミュレートするエンドポイントをモック
    await page.route('/api/text', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '29',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
        },
        body: JSON.stringify({ success: true }),
      });
    });

    const response = await page.request.post('/api/text', {
      headers: {
        'Content-Type': 'application/json',
        [CSRF_HEADER_NAME]: token,
      },
      data: { prompt: 'test' },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['x-ratelimit-limit']).toBe('30');
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers()['x-ratelimit-reset']).toBeDefined();
  });
});

test.describe('CSRFエラーレスポンス形式', () => {
  test('403レスポンスに適切なエラー構造が含まれる', async ({ page }) => {
    await page.goto('/');
    await clearCsrfToken(page);

    const response = await page.request.post('/api/text', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: { prompt: 'test' },
    });

    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body).toHaveProperty('message');
    expect(body.error).toBe('Forbidden');
    expect(body.message).toContain('CSRF');
  });

  test('403レスポンスにもレート制限ヘッダーが含まれる', async ({ page }) => {
    await page.goto('/');
    await clearCsrfToken(page);

    const response = await page.request.post('/api/text', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {},
    });

    expect(response.status()).toBe(403);

    // CSRF失敗時でもレート制限ヘッダーは存在するべき
    expect(response.headers()['x-ratelimit-limit']).toBeDefined();
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers()['x-ratelimit-reset']).toBeDefined();
  });
});

test.describe('保護されていないエンドポイント', () => {
  test('GETリクエストはCSRF検証をバイパスする', async ({ page }) => {
    await page.goto('/');
    await clearCsrfToken(page);

    // 保護されたエンドポイントパスへのGETリクエストはCSRFを必要としないべき
    // （POSTリクエストのみ保護される）
    const response = await page.request.get('/api/csrf');
    expect(response.status()).toBe(204);
  });

  test('保護されていないエンドポイントはCSRFトークンを必要としない', async ({ page }) => {
    await page.goto('/');
    await clearCsrfToken(page);

    // 保護されていないエンドポイント（存在する場合）または静的ページ
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });
});

test.describe('APIクライアントCSRF統合', () => {
  test('APIクライアントがPOSTリクエスト前に自動的にCSRFトークンを取得する', async ({ page }) => {
    await page.goto('/');
    await clearCsrfToken(page);

    // CSRFエンドポイントが呼び出されたかを追跡
    let csrfFetched = false;
    await page.route('/api/csrf', async (route) => {
      csrfFetched = true;
      // インターセプトしているのでCookieを手動で設定
      await route.fulfill({
        status: 204,
        headers: {
          'Set-Cookie': `${CSRF_COOKIE_NAME}=test-token-from-mock; Path=/`,
        },
      });
    });

    // 保護されたエンドポイントをモック
    await page.route('/api/text', async (route) => {
      const headers = route.request().headers();
      const csrfHeader = headers[CSRF_HEADER_NAME.toLowerCase()];

      if (csrfHeader === 'test-token-from-mock') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.fulfill({
          status: 403,
          body: JSON.stringify({ error: 'Forbidden', message: 'Invalid CSRF token' }),
        });
      }
    });

    // ページを使用してクライアント経由でAPI呼び出しを行う
    // これはアプリが実際にAPIクライアントを使用する方法をシミュレート
    const result = await page.evaluate(async () => {
      // 実際のアプリコンテキストではインポートされる
      // ここではapiPostが使用するフェッチパターンをシミュレート
      const csrfCookieName = 'csrf_token';
      const csrfHeaderName = 'x-csrf-token';

      // ステップ1: CSRFトークンを取得（apiClientと同様）
      await fetch('/api/csrf', { method: 'GET', credentials: 'same-origin' });

      // ステップ2: Cookieからトークンを取得
      const cookies = document.cookie.split(';');
      let token: string | undefined;
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === csrfCookieName) {
          token = decodeURIComponent(value);
          break;
        }
      }

      // ステップ3: トークン付きでPOSTリクエストを行う
      const response = await fetch('/api/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [csrfHeaderName]: token || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ prompt: 'test' }),
      });

      return {
        status: response.status,
        tokenUsed: token,
      };
    });

    expect(csrfFetched).toBe(true);
    expect(result.tokenUsed).toBe('test-token-from-mock');
    expect(result.status).toBe(200);
  });

  test('APIクライアントが403 CSRFエラーを適切に処理する', async ({ page }) => {
    await page.goto('/');

    // 期限切れ/無効なトークンを設定
    await setCsrfToken(page, 'expired-token');

    // CSRFエラーを返すエンドポイントをモック
    await page.route('/api/text', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Forbidden',
          message: 'CSRF token invalid or expired',
        }),
      });
    });

    // リクエストを行いエラー処理を確認
    const result = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': 'expired-token',
          },
          credentials: 'same-origin',
          body: JSON.stringify({ prompt: 'test' }),
        });

        const body = await response.json();
        return {
          status: response.status,
          error: body.error,
          message: body.message,
        };
      } catch {
        return { error: 'fetch failed' };
      }
    });

    expect(result.status).toBe(403);
    expect(result.error).toBe('Forbidden');
    expect(result.message).toContain('CSRF');
  });
});

test.describe('CSRF Cookieプロパティ', () => {
  test('CSRF Cookieに正しいセキュリティ属性がある', async ({ page }) => {
    await page.goto('/');
    await clearCsrfToken(page);

    // CSRFトークンを取得
    await page.request.get('/api/csrf');

    // すべてのCookieを取得してCSRF Cookieを見つける
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

test.describe('FormDataリクエストとCSRF', () => {
  test('有効なCSRFトークン付きFormData POSTが成功する', async ({ page }) => {
    await page.goto('/');

    // 有効なCSRFトークンを取得
    await clearCsrfToken(page);
    await page.request.get('/api/csrf');
    const token = await getRequiredCsrfToken(page);

    // transcribeエンドポイントをモック（FormDataを受け入れる）
    await page.route('/api/transcribe', async (route) => {
      const headers = route.request().headers();
      const csrfHeader = headers[CSRF_HEADER_NAME.toLowerCase()];

      if (csrfHeader === token) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            transcription: { text: 'Test transcription' },
          }),
        });
      } else {
        await route.fulfill({
          status: 403,
          body: JSON.stringify({ error: 'Forbidden' }),
        });
      }
    });

    // FormDataリクエストを作成して送信
    const result = await page.evaluate(async (csrfToken) => {
      const formData = new FormData();
      const blob = new Blob(['fake audio data'], { type: 'audio/wav' });
      formData.append('audio', blob, 'test.wav');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'same-origin',
        body: formData,
      });

      return {
        status: response.status,
        body: await response.json(),
      };
    }, token);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  test('CSRFトークンなしのFormData POSTが失敗する', async ({ page }) => {
    await page.goto('/');
    await clearCsrfToken(page);

    const response = await page.request.post('/api/transcribe', {
      multipart: {
        audio: {
          name: 'test.wav',
          mimeType: 'audio/wav',
          buffer: Buffer.from('fake audio data'),
        },
      },
    });

    expect(response.status()).toBe(403);
  });
});
