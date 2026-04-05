# CLAUDE.md

traQ_S-UI のフォーク。traP (Digital Creators Club) 向けのチームメッセージングアプリ traQ のフロントエンド。

## 技術スタック

- **Vue 3** + TypeScript (strict mode)
- **Vite** (ビルドツール)
- **Pinia** (状態管理)
- **Vue Router 5**
- **SCSS** (スタイリング)
- **Vitest** (ユニットテスト) / **Cypress** (E2E テスト)

## 開発コマンド

```bash
# 開発サーバー起動 (初回は npm run gen-fonts が必要)
npm run dev

# ビルド
npm run build
npm run build:with-font  # フォント生成込み

# テスト
npm run test:unit        # ユニットテスト (coverage付き)
npm run test:unit:watch  # ウォッチモード
npm run test:e2e         # E2E テスト

# コード品質
npm run lint             # ESLint (自動修正)
npm run format           # Prettier
npm run type-check       # TypeScript 型チェック
```

## ディレクトリ構成

```
src/
├── lib/           # 純粋なユーティリティ関数 (DOM 非依存は basic/, DOM 依存は dom/)
├── composables/   # Vue composables (utils/, dom/ でさらに分類)
├── components/    # Vue コンポーネント (機能別サブディレクトリ)
├── views/         # ルートレベルのコンポーネント
├── router/        # Vue Router 設定
├── store/         # Pinia ストア
│   ├── app/       # アプリ状態 (サーバー非同期)
│   ├── domain/    # サーバー状態 (非 key-value)
│   ├── entities/  # サーバー状態 (key-value)
│   └── ui/        # UI 状態 (ネットワーク・IDB 非使用)
├── styles/        # グローバル SCSS
├── sw/            # Service Worker
└── types/         # TypeScript 型定義
tests/
├── unit/          # Vitest ユニットテスト
└── e2e/           # Cypress E2E テスト
```

## ストアの使い方

ストアは 4 層に厳密に分離されている。詳細は [docs/store.md](docs/store.md) 参照。

- `app/`: サーバーと同期しないアプリ状態
- `domain/`: サーバー側の状態 (key-value でないもの)
- `entities/`: サーバー側の状態 (key-value、`Map` で管理)
- `ui/`: ネットワーク・IDB を使わない UI 状態

## コードスタイル

- **フォーマット**: Prettier (80文字、2スペースインデント、シングルクォート)
- **Lint**: ESLint flat config (Vue + TypeScript)
- **import 順序**: builtin → @traptitech → vue → 3rd party → `/@/` → relative
- **pre-commit フック**: Husky + lint-staged で自動フォーマット・Lint

## テスト方針

- ユニットテスト: `tests/unit/` に配置、ソースの構造に合わせてディレクトリを揃える
- `watch` は `flush: post` がデフォルト → `await nextTick()` が必要
- Composable のテスト: `testUtils.ts` の `withSetup` を使う
- Pinia ストアのモック: `beforeEach` で `createTestingPinia` を使う
- E2E テスト: `cypress.env.json` にログイン情報が必要

## パス エイリアス

`/@/` は `src/` にマップされる (tsconfig.json / vite.config.ts)。

## 環境要件

- Node.js: ^22.14.0
- npm: ^10.9.0
