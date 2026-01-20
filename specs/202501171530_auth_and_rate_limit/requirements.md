# CSRF保護およびレート制限 要件定義

## Overview

セキュリティ監査で発見されたAPI保護の欠如とレート制限不足に対応する。CSRFトークンによりフロントエンドからのリクエストのみを許可し、外部からの直接API呼び出しを防止する。併せてレート制限を実装し、サービスの安定性とOpenAI APIコストを管理する。

**注意**: ユーザー登録・ログイン機能は実装しない。

## User Stories

### CSRF保護
- **US-001**: 開発者として、フロントエンド以外からのAPIアクセスを拒否したい。そうすることで、不正利用を防止できる。
- **US-002**: ユーザーとして、アプリケーションを通常通り利用できる。CSRFトークンは自動的に処理される。

### レート制限
- **US-003**: 開発者として、APIへの過剰なリクエストを制限したい。そうすることで、サービスの安定性とコスト管理ができる。
- **US-004**: ユーザーとして、レート制限に達した場合に明確なエラーメッセージを受け取りたい。そうすることで、いつ再試行できるか分かる。

## Functional Requirements

### Must Have (P0)

#### CSRF保護
- **REQ-001**: サーバーサイドでCSRFトークンを生成する
- **REQ-002**: CSRFトークンをHttpOnly Cookieとして設定する
- **REQ-003**: フロントエンドはリクエストヘッダーにCSRFトークンを含める
- **REQ-004**: 以下のAPIエンドポイントでCSRFトークンを検証する
  - `POST /api/realtime/session`
  - `POST /api/transcribe`
  - `POST /api/text`
  - `POST /api/speaking/score`
- **REQ-005**: CSRFトークンが無効または欠落している場合は `403 Forbidden` を返す
- **REQ-006**: CSRFトークン取得用エンドポイント `GET /api/csrf` を実装する

#### レート制限
- **REQ-007**: Next.js Middleware でレート制限を実装する
- **REQ-008**: IPアドレスベースのレート制限を適用する
- **REQ-009**: 以下のエンドポイントにレート制限を適用する
  | エンドポイント | 制限 |
  |---------------|------|
  | `/api/realtime/session` | 10回/分 |
  | `/api/transcribe` | 20回/分 |
  | `/api/text` | 30回/分 |
  | `/api/speaking/score` | 30回/分 |
- **REQ-010**: レート制限超過時に `429 Too Many Requests` を返す
- **REQ-011**: `Retry-After` ヘッダーで再試行可能時間を通知する

### Should Have (P1)

- **REQ-012**: CSRFトークンの有効期限を設定する（24時間）
- **REQ-013**: レート制限状況をログに記録する
- **REQ-014**: フロントエンドでレート制限エラーをトースト表示する
- **REQ-015**: `X-RateLimit-*` ヘッダーで制限状況を通知する

### Nice to Have (P2)

- **REQ-016**: レート制限をエンドポイントごとに設定ファイルで管理する
- **REQ-017**: 開発環境ではレート制限を緩和する

## Technical Requirements

### CSRF トークン仕様

#### トークン生成
```typescript
// crypto.randomUUID() または crypto.randomBytes(32) を使用
const csrfToken = crypto.randomUUID();
```

#### Cookie 設定
```typescript
// Set-Cookie ヘッダー
{
  name: 'csrf_token',
  value: csrfToken,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 24 // 24時間
}
```

#### リクエストヘッダー
```
X-CSRF-Token: <csrf_token>
```

### レート制限（インメモリ）

```typescript
type RateLimitEntry = {
  count: number;
  resetAt: number; // Unix timestamp (ms)
};

type RateLimitConfig = {
  endpoint: string;
  limit: number;
  windowMs: number; // ミリ秒
};

// Map<"ip:endpoint", RateLimitEntry>
const rateLimitStore = new Map<string, RateLimitEntry>();
```

### API Contracts

#### CSRF トークン取得
```
GET /api/csrf
Response: 204 No Content
Set-Cookie: csrf_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

#### CSRF エラーレスポンス
```json
{
  "error": "Forbidden",
  "message": "Invalid or missing CSRF token"
}
```
- HTTP Status: `403`

#### レート制限エラーレスポンス
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```
- HTTP Status: `429`
- Headers:
  - `Retry-After: 60`
  - `X-RateLimit-Limit: 20`
  - `X-RateLimit-Remaining: 0`
  - `X-RateLimit-Reset: 1705500000`

### フロントエンド実装

#### CSRFトークン取得フック
```typescript
// lib/hooks/use-csrf.ts
export function useCsrf() {
  // 初回マウント時に GET /api/csrf を呼び出し
  // Cookie に csrf_token が設定される
}
```

#### API クライアント
```typescript
// lib/api-client.ts
export async function apiPost(endpoint: string, body: unknown) {
  // Cookie から csrf_token を読み取り
  // X-CSRF-Token ヘッダーに設定してリクエスト
}
```

## Non-Functional Requirements

### Performance
- CSRFトークン検証: < 5ms
- レート制限チェック: < 10ms

### Security
- **SEC-001**: CSRFトークンは暗号学的に安全な乱数で生成
- **SEC-002**: HttpOnly Cookie でトークンを保護（XSSからの保護）
- **SEC-003**: SameSite=Strict でクロスサイトリクエストを防止
- **SEC-004**: 本番環境では Secure フラグを有効化
- **SEC-005**: レート制限はバイパスを防ぐため Middleware で実装

### Scalability
- インメモリレート制限は単一インスタンス前提
- 100ユーザー規模では問題なし

## Acceptance Criteria

### CSRF保護
- [ ] CSRFトークンなしで `/api/realtime/session` にPOSTすると403が返る
- [ ] CSRFトークンなしで `/api/transcribe` にPOSTすると403が返る
- [ ] CSRFトークンなしで `/api/text` にPOSTすると403が返る
- [ ] CSRFトークンなしで `/api/speaking/score` にPOSTすると403が返る
- [ ] 有効なCSRFトークン付きリクエストは正常に処理される
- [ ] `GET /api/csrf` でCookieにトークンが設定される
- [ ] curlで直接APIを叩くと403が返る

### レート制限
- [ ] 制限回数を超えるとレスポンスが429になる
- [ ] `Retry-After` ヘッダーが含まれる
- [ ] 制限リセット後は再度リクエスト可能
- [ ] 異なるIPアドレスは独立してカウントされる

## Out of Scope

- **ユーザー登録・ログイン機能**: 不要
- **セッション管理**: 不要
- **ロールベースアクセス制御（RBAC）**: 不要
- **分散レート制限（Redis）**: 単一インスタンス運用のため不要
- **監査ログ**: 将来の拡張として検討

## Dependencies

### Prerequisites
- なし（追加の外部サービス不要）

### Third-party Libraries
- 追加のライブラリは不要（Node.js 標準の crypto モジュールを使用）

## File Structure (Proposed)

```
├── app/
│   └── api/
│       └── csrf/
│           └── route.ts          # CSRFトークン発行
├── lib/
│   ├── csrf/
│   │   └── index.ts              # CSRF検証ロジック
│   ├── rate-limit/
│   │   └── index.ts              # レート制限ロジック
│   └── api-client.ts             # CSRFトークン付きAPIクライアント
└── middleware.ts                  # Next.js Middleware（CSRF検証 + レート制限）
```

## Implementation Notes

### CSRF保護の仕組み

1. ユーザーがページにアクセス
2. フロントエンドが `GET /api/csrf` を呼び出し
3. サーバーがCSRFトークンを生成し、HttpOnly Cookie に設定
4. フロントエンドはJavaScriptでCookieを読み取れないが、ブラウザが自動的にCookieを送信
5. フロントエンドは別途取得したトークンを `X-CSRF-Token` ヘッダーに設定
6. サーバーは Cookie のトークンと ヘッダーのトークンを比較検証

**Double Submit Cookie パターン** を採用:
- Cookie: `csrf_token` (HttpOnly=false で読み取り可能にする)
- Header: `X-CSRF-Token`
- 両者が一致すれば正当なリクエストと判断

### 外部からの直接API呼び出しが失敗する理由

1. 攻撃者は Cookie を持っていない
2. Cookie を偽造しても、正しいトークン値を知らない
3. 別サイトからのリクエストは SameSite=Strict により Cookie が送信されない
