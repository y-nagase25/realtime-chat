# Implementation Tasks: CSRF保護およびレート制限

## Phase 1: Foundation (P0 - 基盤構築)

### 1.1 型定義
- [x] `lib/types/security.ts` を作成
  - [x] `RateLimitEntry` 型を定義
  - [x] `RateLimitConfig` 型を定義
  - [x] `RateLimitResult` 型を定義
  - [x] `CsrfValidationResult` 型を定義

### 1.2 CSRF モジュール
- [x] `lib/csrf/index.ts` を作成
  - [x] `generateCsrfToken()` 関数を実装（crypto.randomUUID 使用）
  - [x] `validateCsrfToken()` 関数を実装
  - [x] `getCsrfCookieOptions()` 関数を実装

### 1.3 レート制限モジュール
- [x] `lib/rate-limit/store.ts` を作成
  - [x] インメモリ Map ストアを実装
  - [x] `cleanupExpiredEntries()` 関数を実装
- [x] `lib/rate-limit/config.ts` を作成
  - [x] エンドポイント別のレート制限設定を定義
- [x] `lib/rate-limit/index.ts` を作成
  - [x] `checkRateLimit()` 関数を実装
  - [x] 設定とストアを統合

## Phase 2: Core Features (P0 - コア機能)

### 2.1 CSRF トークン発行 API
- [ ] `app/api/csrf/route.ts` を作成
  - [ ] GET ハンドラを実装
  - [ ] トークン生成と Cookie 設定
  - [ ] 204 No Content レスポンス

### 2.2 Next.js Middleware
- [ ] `middleware.ts` を作成
  - [ ] matcher 設定（保護対象エンドポイント）
  - [ ] IP アドレス取得ロジック（x-forwarded-for 対応）
  - [ ] レート制限チェックの統合
  - [ ] CSRF 検証の統合
  - [ ] 403/429 エラーレスポンスの実装
  - [ ] X-RateLimit-* ヘッダーの設定

### 2.3 API クライアント
- [ ] `lib/api-client.ts` を作成
  - [ ] `fetchCsrfToken()` 関数を実装
  - [ ] `apiPost()` 関数を実装
  - [ ] `apiPostFormData()` 関数を実装
  - [ ] Cookie からトークン読み取りロジック

### 2.4 カスタムエラークラス
- [ ] `lib/errors.ts` を作成
  - [ ] `CsrfError` クラスを定義
  - [ ] `RateLimitError` クラスを定義
  - [ ] `ApiError` クラスを定義

### 2.5 CSRF Provider
- [ ] `components/providers/CsrfProvider.tsx` を作成
  - [ ] 初回マウント時に CSRF トークン取得
  - [ ] エラーハンドリング
- [ ] `app/layout.tsx` を更新
  - [ ] CsrfProvider でラップ

### 2.6 既存コードの更新
- [ ] 既存の API 呼び出し箇所を `apiPost` / `apiPostFormData` に置き換え
  - [ ] `/api/realtime/session` の呼び出し箇所
  - [ ] `/api/transcribe` の呼び出し箇所
  - [ ] `/api/text` の呼び出し箇所
  - [ ] `/api/speaking/score` の呼び出し箇所

## Phase 3: Polish (P1 - 改善)

### 3.1 エラーハンドリング改善
- [ ] レート制限エラー時のトースト通知を実装
  - [ ] `sonner` を使用したエラー表示
  - [ ] 再試行可能時間の表示
- [ ] CSRF エラー時の自動リトライ実装
  - [ ] トークン再取得後に元のリクエストを再試行

### 3.2 ロギング
- [ ] レート制限イベントのログ出力
  - [ ] 制限超過時のログ（IP、エンドポイント、時刻）
  - [ ] 開発環境でのデバッグログ

### 3.3 レスポンスヘッダー
- [ ] `X-RateLimit-Limit` ヘッダーを追加
- [ ] `X-RateLimit-Remaining` ヘッダーを追加
- [ ] `X-RateLimit-Reset` ヘッダーを追加
- [ ] `Retry-After` ヘッダーを追加（429時）

## Phase 4: Enhancement (P2 - 拡張)

### 4.1 設定の外部化
- [ ] レート制限設定を環境変数で上書き可能にする
- [ ] 開発環境でのレート制限緩和オプション

## Testing & Validation

### 手動テスト
- [ ] CSRF トークンなしで API を叩くと 403 が返ることを確認
  ```bash
  curl -X POST http://localhost:3000/api/realtime/session
  # Expected: 403 Forbidden
  ```
- [ ] 有効なトークン付きリクエストが成功することを確認
- [ ] レート制限を超えると 429 が返ることを確認
- [ ] レート制限リセット後に再度リクエスト可能なことを確認
- [ ] フロントエンドからの正常動作を確認
  - [ ] `/realtime-chat` ページが正常動作
  - [ ] `/speaking` ページが正常動作

### 受け入れ基準の検証
- [ ] CSRFトークンなしで `/api/realtime/session` にPOSTすると403が返る
- [ ] CSRFトークンなしで `/api/transcribe` にPOSTすると403が返る
- [ ] CSRFトークンなしで `/api/text` にPOSTすると403が返る
- [ ] CSRFトークンなしで `/api/speaking/score` にPOSTすると403が返る
- [ ] 有効なCSRFトークン付きリクエストは正常に処理される
- [ ] `GET /api/csrf` でCookieにトークンが設定される
- [ ] curlで直接APIを叩くと403が返る
- [ ] 制限回数を超えるとレスポンスが429になる
- [ ] `Retry-After` ヘッダーが含まれる
- [ ] 制限リセット後は再度リクエスト可能
- [ ] 異なるIPアドレスは独立してカウントされる

## Implementation Order

```
Phase 1.1 (型定義)
    ↓
Phase 1.2 (CSRF) ←──────┐
    ↓                   │
Phase 1.3 (Rate Limit)  │
    ↓                   │
Phase 2.1 (CSRF API) ───┘
    ↓
Phase 2.2 (Middleware)
    ↓
Phase 2.3 (API Client)
    ↓
Phase 2.4 (Errors)
    ↓
Phase 2.5 (Provider)
    ↓
Phase 2.6 (既存コード更新)
    ↓
Testing & Validation
    ↓
Phase 3 (Polish)
    ↓
Phase 4 (Enhancement)
```

## Estimated Effort

| Phase | タスク数 | 見積もり |
|-------|---------|---------|
| Phase 1 | 12 | - |
| Phase 2 | 18 | - |
| Phase 3 | 6 | - |
| Phase 4 | 2 | - |
| Testing | 12 | - |
| **合計** | **50** | - |
