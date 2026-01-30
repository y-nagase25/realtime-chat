# AI-GO - English Learning App

AI を活用した英語学習アプリケーションです。リーディング、スピーキングの練習機能と学習履歴の管理機能を提供します。

## 主な機能

### リーディング練習
- AI が生成したパッセージで読解練習
- 多肢選択式、正誤判定、穴埋め形式の理解度確認問題
- 単語をクリックして語彙を確認（英語・日本語対応）
- 読解時間と WPM（1分あたりの単語数）の計測
- 要約作成と AI による評価

### スピーキング練習
- 音声録音機能
- Whisper API による自動文字起こし
- AI によるスコアリングとフィードバック

### 学習履歴
- リーディング・スピーキングの学習進捗を管理
- 過去の練習結果を確認

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| ランタイム | React 19 |
| スタイリング | Tailwind CSS 4 |
| リンター/フォーマッター | Biome 2.2.0 |
| UI コンポーネント | Radix UI |
| データベース | Supabase |
| テスト | Vitest (単体), Playwright (E2E) |

## 開発コマンド

```bash
# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバーの起動
npm start

# リント・フォーマット
npm run lint
npm run format

# 単体テスト
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage

# E2E テスト
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug
```

## 環境変数

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

| パス | 説明 |
|------|------|
| `/` | ホームページ（各機能へのナビゲーション） |
| `/reading` | リーディング練習 |
| `/speaking` | スピーキング練習 |
| `/history` | 学習履歴 |

## ディレクトリ構成

```
/app                    - Next.js App Router
  /api/                 - API ルートハンドラー
/components             - React コンポーネント
  /reading/             - リーディング機能
  /speaking/            - スピーキング機能
  /history/             - 履歴機能
  /ui/                  - 汎用 UI コンポーネント
/lib                    - ユーティリティ・型定義
  /types/               - TypeScript 型定義
  /hooks/               - カスタムフック
  /utils/               - ユーティリティ関数
/specs                  - 仕様書
/e2e                    - E2E テスト
/__tests__              - 単体テスト
```

## ブラウザ要件

- マイクへのアクセス許可
