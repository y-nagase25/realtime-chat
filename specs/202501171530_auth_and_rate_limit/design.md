# Design Specification: CSRF保護およびレート制限

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  1. GET /api/csrf → Cookie に csrf_token 設定                    │
│  2. POST /api/* → X-CSRF-Token ヘッダー + Cookie 送信            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Middleware                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │  Rate Limiter   │ →  │  CSRF Validator │ → API Route         │
│  │  (IP-based)     │    │  (Double Submit)│                     │
│  └─────────────────┘    └─────────────────┘                     │
│         │                       │                                │
│         ▼                       ▼                                │
│    429 Too Many            403 Forbidden                         │
│    Requests                                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Routes                                │
├─────────────────────────────────────────────────────────────────┤
│  /api/csrf           → CSRFトークン発行                          │
│  /api/realtime/session → OpenAI Realtime セッション              │
│  /api/transcribe     → 音声文字起こし                            │
│  /api/text           → テキスト生成                              │
│  /api/speaking/score → スピーキング採点                          │
└─────────────────────────────────────────────────────────────────┘
```

## Component Design

### Data Layer

#### 型定義

```typescript
// lib/types/security.ts

/**
 * レート制限エントリ
 */
export type RateLimitEntry = {
  count: number;
  resetAt: number; // Unix timestamp (ms)
};

/**
 * レート制限設定
 */
export type RateLimitConfig = {
  endpoint: string;
  limit: number;
  windowMs: number;
};

/**
 * レート制限チェック結果
 */
export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // 秒
};

/**
 * CSRF検証結果
 */
export type CsrfValidationResult = {
  valid: boolean;
  error?: string;
};
```

#### インメモリストア

```typescript
// lib/rate-limit/store.ts

// シングルトンのインメモリストア
// Map<"ip:endpoint", RateLimitEntry>
const store = new Map<string, RateLimitEntry>();

// 定期的なクリーンアップ（期限切れエントリの削除）
```

### Business Logic Layer

#### CSRF モジュール

```typescript
// lib/csrf/index.ts

/**
 * CSRFトークンを生成
 * @returns 暗号学的に安全なランダムトークン
 */
export function generateCsrfToken(): string;

/**
 * CSRFトークンを検証（Double Submit Cookie パターン）
 * @param cookieToken - Cookie から取得したトークン
 * @param headerToken - ヘッダーから取得したトークン
 * @returns 検証結果
 */
export function validateCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): CsrfValidationResult;

/**
 * CSRF Cookie を設定するためのオプションを取得
 */
export function getCsrfCookieOptions(): ResponseCookie;
```

#### レート制限モジュール

```typescript
// lib/rate-limit/index.ts

/**
 * エンドポイントごとのレート制限設定
 */
export const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig>;

/**
 * レート制限をチェック
 * @param ip - クライアントIPアドレス
 * @param endpoint - APIエンドポイントパス
 * @returns チェック結果
 */
export function checkRateLimit(ip: string, endpoint: string): RateLimitResult;

/**
 * 期限切れエントリをクリーンアップ
 */
export function cleanupExpiredEntries(): void;
```

### Presentation Layer

#### API クライアント

```typescript
// lib/api-client.ts

/**
 * CSRFトークンを取得（Cookie に設定）
 */
export async function fetchCsrfToken(): Promise<void>;

/**
 * CSRFトークン付きでPOSTリクエストを送信
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T>;

/**
 * CSRFトークン付きでFormDataをPOSTリクエストで送信
 */
export async function apiPostFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T>;
```

#### CSRF Provider

```typescript
// components/providers/CsrfProvider.tsx

/**
 * アプリケーション起動時にCSRFトークンを取得
 * 子コンポーネントをラップして使用
 */
export function CsrfProvider({ children }: { children: React.ReactNode });
```

## API Design

### Endpoints

#### GET /api/csrf

CSRFトークンを発行し、Cookieに設定する。

**Request:**
```
GET /api/csrf
```

**Response:**
```
HTTP/1.1 204 No Content
Set-Cookie: csrf_token=<token>; Path=/; Max-Age=86400; SameSite=Strict; Secure
```

**Notes:**
- HttpOnly は false（フロントエンドで読み取る必要があるため）
- 本番環境では Secure フラグを有効化

---

### 保護対象エンドポイント共通仕様

以下のエンドポイントは CSRF 検証とレート制限の対象:
- `POST /api/realtime/session`
- `POST /api/transcribe`
- `POST /api/text`
- `POST /api/speaking/score`

**必須ヘッダー:**
```
X-CSRF-Token: <csrf_token>
Cookie: csrf_token=<csrf_token>
```

**エラーレスポンス:**

| Status | 条件 | レスポンス |
|--------|------|-----------|
| 403 | CSRFトークン無効/欠落 | `{ "error": "Forbidden", "message": "Invalid or missing CSRF token" }` |
| 429 | レート制限超過 | `{ "error": "Too Many Requests", "message": "Rate limit exceeded", "retryAfter": 60 }` |

**レート制限ヘッダー:**
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1705500000
Retry-After: 60  # 429 の場合のみ
```

## Security Design

### CSRF 保護フロー

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Browser │                    │Middleware│                    │API Route│
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  1. GET /api/csrf            │                              │
     │─────────────────────────────►│                              │
     │                              │                              │
     │  2. Set-Cookie: csrf_token   │                              │
     │◄─────────────────────────────│                              │
     │                              │                              │
     │  3. POST /api/xxx            │                              │
     │     Cookie: csrf_token       │                              │
     │     X-CSRF-Token: <token>    │                              │
     │─────────────────────────────►│                              │
     │                              │                              │
     │                              │  4. Validate tokens          │
     │                              │  (cookie === header)         │
     │                              │                              │
     │                              │  5. Forward request          │
     │                              │─────────────────────────────►│
     │                              │                              │
     │  6. Response                 │◄─────────────────────────────│
     │◄─────────────────────────────│                              │
```

### Double Submit Cookie パターンの安全性

1. **攻撃者がCookieを持っていない場合**
   - ヘッダーに正しいトークンを設定できない
   - → 403 Forbidden

2. **攻撃者が別サイトからリクエストを送信する場合**
   - `SameSite=Strict` により Cookie が送信されない
   - → 403 Forbidden

3. **XSS 攻撃の場合**
   - Cookie は HttpOnly=false だが、SameSite=Strict が保護
   - XSS があればトークンは読み取られる可能性がある
   - → XSS 対策は別途必要（React のエスケープ機能で基本的に保護）

### レート制限の実装位置

```
Request → Middleware (Rate Limit) → Middleware (CSRF) → API Route
```

- レート制限を最初にチェックすることで、無効なリクエストの処理コストを削減
- Middleware で実装することで、すべてのリクエストを一元管理

## Performance Considerations

### レート制限ストアの最適化

```typescript
// 期限切れエントリのクリーンアップ
// 1分ごとに実行
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60 * 1000);
```

### メモリ使用量の見積もり

- 1エントリ: 約 100 bytes
- 100ユーザー × 4エンドポイント = 400エントリ
- 最大メモリ: 約 40KB（無視できるレベル）

### Middleware のパフォーマンス

- CSRF 検証: 文字列比較のみ → < 1ms
- レート制限: Map の lookup と更新 → < 1ms
- 合計オーバーヘッド: < 5ms

## Error Handling Strategy

### ユーザー向けエラー

| エラー | メッセージ | 対処法 |
|--------|-----------|--------|
| CSRF エラー | "セッションが切れました。ページを再読み込みしてください。" | ページリロード |
| レート制限 | "リクエストが多すぎます。{N}秒後に再試行してください。" | 待機後に再試行 |

### フロントエンドでのエラーハンドリング

```typescript
// lib/api-client.ts

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 403) {
    // CSRF エラー → トークンを再取得して再試行
    await fetchCsrfToken();
    throw new CsrfError('Session expired');
  }

  if (response.status === 429) {
    const data = await response.json();
    throw new RateLimitError(data.retryAfter);
  }

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return response.json();
}
```

### トースト通知

```typescript
// sonner を使用したエラー通知
toast.error('リクエストが多すぎます', {
  description: `${retryAfter}秒後に再試行してください`,
});
```

## File Structure

```
├── app/
│   ├── api/
│   │   └── csrf/
│   │       └── route.ts              # CSRFトークン発行エンドポイント
│   └── layout.tsx                    # CsrfProvider を追加
├── components/
│   └── providers/
│       └── CsrfProvider.tsx          # CSRF初期化プロバイダー
├── lib/
│   ├── types/
│   │   └── security.ts               # セキュリティ関連の型定義
│   ├── csrf/
│   │   └── index.ts                  # CSRF生成・検証ロジック
│   ├── rate-limit/
│   │   ├── index.ts                  # レート制限ロジック
│   │   ├── config.ts                 # エンドポイント別設定
│   │   └── store.ts                  # インメモリストア
│   ├── api-client.ts                 # CSRFトークン付きAPIクライアント
│   └── errors.ts                     # カスタムエラークラス
└── middleware.ts                     # Next.js Middleware
```
