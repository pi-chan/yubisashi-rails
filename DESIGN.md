# yubisashi-rails 設計書

## 概要

Rails アプリケーションのブラウザ上で UI 要素を視覚的にアノテーションし、AI コーディングエージェント（Claude Code, Cursor 等）に渡せる構造化 Markdown を生成する開発ツール。

[Agentation](https://agentation.dev/) の Rails 版。Rails 標準の `annotate_rendered_view_with_filenames` が出力する HTML コメントを活用し、クリックした要素がどのテンプレートファイルから生成されたかを自動特定する。

### 参考・先行プロジェクト

- [Agentation](https://agentation.dev/) — React 向けの視覚フィードバックツール。本ツールのコンセプト元
- [rails-template-inspector](https://github.com/aki77/rails-template-inspector) — Rails テンプレートからエディタにジャンプするカスタムエレメント。同じ `annotate_rendered_view_with_filenames` を活用するアプローチ

---

## 解決する課題

AI エージェントに UI の修正を依頼するとき、自然言語で場所を説明するのは曖昧で非効率。

```
❌ 「ヘッダーの右上にあるアバター画像を丸くして」
✅  構造化された情報（ファイルパス、セレクタ、テキスト、コメント）をそのまま渡す
```

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│  ブラウザ (development 環境のみ)                  │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ <yubisashi-rails> カスタムエレメント         │ │
│  │                                               │ │
│  │  1. ツールバー UI (フローティング)             │ │
│  │  2. 要素クリックハンドラ                       │ │
│  │  3. HTML コメントパーサー                      │ │
│  │     (annotate_rendered_view_with_filenames)    │ │
│  │  4. セレクタ生成エンジン                       │ │
│  │  5. アノテーション管理 (配列)                  │ │
│  │  6. Markdown ジェネレータ                      │ │
│  │  7. クリップボードコピー                       │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Rails が出力する HTML:                            │
│  <!-- BEGIN app/views/users/_card.html.erb -->     │
│  <div class="user-card">...</div>                 │
│  <!-- END app/views/users/_card.html.erb -->       │
└─────────────────────────────────────────────────┘
```

### 技術スタック

- **Web Components (カスタムエレメント)** — フレームワーク非依存、CDN 配信可能
- **TypeScript** — rails-template-inspector と同じ構成
- **Vite** — ビルド
- **CDN 配信** — jsDelivr 経由で `<script type="module">` で読み込み

---

## 導入方法

### 前提条件

```ruby
# config/environments/development.rb
config.action_view.annotate_rendered_view_with_filenames = true
```

### レイアウトへの追加

```erb
<%# app/views/layouts/application.html.erb %>
<% if Rails.env.development? %>
  <script type="module"
    src="https://cdn.jsdelivr.net/npm/yubisashi-rails@latest/dist/yubisashi-rails.mjs">
  </script>
  <yubisashi-rails
    root="<%= Rails.root %>"
    combo-key="command-shift-a"
  ></yubisashi-rails>
<% end %>
```

---

## 機能仕様

### 1. ツールバー UI

ブラウザ右下にフローティングツールバーを表示。

```
┌──────────────────────────────────┐
│  🎯  Agentation   [3]  📋  🗑️  │
└──────────────────────────────────┘
  ↑       ↑          ↑    ↑    ↑
  有効/   タイトル   件数  コピー クリア
  無効
```

**状態:**

| 状態 | 挙動 |
|------|------|
| Inactive | ツールバーのみ表示。ページ操作は通常通り |
| Active | 要素ホバーでハイライト。クリックでアノテーション追加 |

**トグル方法:** ツールバーの 🎯 ボタン or ショートカットキー（デフォルト: `Cmd+Shift+A`）

### 2. 要素選択 & アノテーション追加

Active 状態で要素をクリックすると：

1. クリックされた DOM 要素を特定
2. 最も近い `annotate_rendered_view_with_filenames` コメントからファイルパスを抽出
3. CSS セレクタを生成
4. メタデータ（クラス名、テキスト内容、data 属性等）を収集
5. コメント入力用のポップオーバーを表示
6. 入力完了でアノテーションリストに追加、要素にバッジ（番号）をオーバーレイ

### 3. テキスト選択

テキストを範囲選択した状態でアノテーション追加。選択テキストが `selectedText` として記録される。タイポ修正などに便利。

### 4. ファイルパス特定ロジック

```
annotate_rendered_view_with_filenames が生成するコメント:

<!-- BEGIN /path/to/app/views/users/_card.html.erb -->
  <div class="user-card">
    <!-- BEGIN /path/to/app/views/users/_avatar.html.erb -->
      <img class="avatar" src="..." />
    <!-- END /path/to/app/views/users/_avatar.html.erb -->
  </div>
<!-- END /path/to/app/views/users/_card.html.erb -->
```

クリックされた要素から DOM ツリーを上方向に走査し、最も近い `<!-- BEGIN ... -->` コメントノードを見つける。これにより、その要素を出力したパーシャル/ビューのファイルパスが特定できる。

**注意:** `root` 属性で Rails.root を渡し、絶対パスから相対パスに変換する。

### 5. セレクタ生成

以下の優先順で一意なセレクタを生成：

1. `id` があれば `#user-card-123`
2. `data-testid` / `data-controller` 等があれば `[data-testid="user-avatar"]`
3. クラス名の組み合わせ `.user-card > .avatar`
4. 最終手段: `nth-child` を使ったフルパス

### 6. Markdown 出力フォーマット

📋 ボタンでクリップボードにコピーされる Markdown:

```markdown
# UI Annotations

> Page: http://localhost:3000/users/1
> Timestamp: 2026-02-07T15:30:00+09:00

## #1 アバター画像を正円にしたい

- **File**: `app/views/users/_avatar.html.erb`
- **Selector**: `.user-card > .avatar-section > img.avatar`
- **Classes**: `avatar rounded-lg w-12 h-12`
- **Nearby text**: "田中太郎"
- **Bounding box**: x=320, y=80, w=48, h=48

## #2 ナビゲーションのactiveスタイルが効いてない

- **File**: `app/views/shared/_header.html.erb`
- **Selector**: `nav.main-nav > ul > li:nth-child(3) > a`
- **Classes**: `nav-link`
- **Text**: "設定"
- **Selected text**: "設定"

## #3 カード間のマージンが狭すぎる

- **File**: `app/views/users/_card.html.erb`
- **Selector**: `.user-list > .user-card:nth-child(2)`
- **Classes**: `user-card bg-white shadow-sm rounded-lg p-4`
- **Bounding box**: x=100, y=300, w=600, h=120
```

### 7. アノテーションデータ構造

```typescript
interface Annotation {
  id: number
  comment: string
  element: {
    tagName: string
    selector: string
    classes: string[]
    text: string           // trimmed textContent (max 100 chars)
    selectedText?: string  // テキスト選択時のみ
    boundingBox: { x: number; y: number; width: number; height: number }
    dataAttributes: Record<string, string>  // data-* 属性
  }
  source: {
    file: string           // 相対パス (e.g., "app/views/users/_card.html.erb")
    absolutePath: string   // 絶対パス
  }
  timestamp: string        // ISO 8601
}
```

---

## カスタムエレメント属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| `root` | string | `/` | Rails.root のパス。絶対パスからの相対パス変換に使用 |
| `combo-key` | string | `command-shift-a` | ツールバートグルのショートカットキー |
| `position` | string | `bottom-right` | ツールバー位置 (`bottom-right`, `bottom-left`) |
| `format` | string | `markdown` | 出力フォーマット (`markdown`, `json`) |
| `include-styles` | boolean | `false` | computedStyles をキャプチャに含めるか |

---

## 除外仕様

v1 では以下をスコープ外とする：

- **MCP サーバー連携** — まずはコピペ運用で十分。需要があれば v2 で検討
- **スクリーンショット添付** — ブラウザ API の制約上、部分キャプチャが複雑
- **エリア選択（ドラッグ）** — 要素クリックとテキスト選択で v1 は十分
- **複数ページ横断** — 各ページで独立して使う想定
- **Turbo / SPA 対応** — Turbo Drive でページ遷移するとアノテーションはリセットされる（v1 では許容）

---

## 実装ロードマップ

### Phase 1: コア機能（MVP）

- [ ] カスタムエレメントのスキャフォールド（Vite + TypeScript）
- [ ] HTML コメントパーサー（`annotate_rendered_view_with_filenames` 対応）
- [ ] 要素クリック → メタデータ収集
- [ ] コメント入力ポップオーバー
- [ ] Markdown 生成 & クリップボードコピー
- [ ] フローティングツールバー UI
- [ ] npm パッケージ公開 & CDN 配信

### Phase 2: 使い勝手の向上

- [ ] テキスト選択アノテーション
- [ ] アノテーション一覧パネル（編集・削除）
- [ ] バッジオーバーレイ（番号表示）
- [ ] JSON 出力フォーマット対応
- [ ] ダークモード

### Phase 3: エージェント連携の強化

- [ ] MCP サーバー（Claude Code / Cursor から直接参照）
- [ ] ViewComponent / Phlex 対応（コメントフォーマットの差異吸収）
- [ ] Turbo Frame / Turbo Stream 環境でのアノテーション永続化
- [ ] rails-template-inspector との統合オプション（エディタジャンプ + アノテーション）

---

## 競合・類似ツールとの比較

| | yubisashi-rails | Agentation | rails-template-inspector | ReActionView |
|---|---|---|---|---|
| 対象 | Rails (ERB/Haml) | React | Rails | Rails |
| 目的 | AIエージェント向けフィードバック | AIエージェント向けフィードバック | エディタジャンプ | デバッグ・バリデーション |
| ファイル特定 | HTML コメント | React ファイバーツリー | HTML コメント | data 属性 |
| 出力 | Markdown / JSON | Markdown / MCP | エディタ URL スキーム | ブラウザオーバーレイ |
| 導入コスト | script タグ 1 行 | npm install + React コンポーネント | script タグ 1 行 | gem + 設定 |
| フレームワーク依存 | なし (Web Components) | React 18+ | なし (Web Components) | Rails 7+ |

---

## 参考: Agentation の Markdown 出力例

```markdown
Annotation 1:
Element: Button (.sidebar > button.primary)
Position: x=120, y=340
Classes: btn btn-primary sidebar-action
Text: "Save Changes"
Note: This button should be disabled when form is invalid

Annotation 2:
Element: Image (header > .logo > img)
Position: x=20, y=15
Selected text: n/a
Note: Logo appears blurry on retina displays
```

yubisashi-rails ではこれに加え `File` フィールドが入る点が、Rails ならではの強み。
