# yubisashi-rails

Rails 向け UI アノテーションツール。`annotate_rendered_view_with_filenames` の HTML コメントを活用してテンプレートファイルを特定し、Markdown/JSON 出力で AI エージェントに構造化フィードバックを渡す。

## Tech Stack

- **UI**: Lit 3.x + TypeScript (Web Components / Shadow DOM)
- **Build**: Vite (library mode, ES module 出力)
- **Package Manager**: pnpm
- **Test**: Vitest + happy-dom + @vitest/coverage-v8

## Commands

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # tsc + vite build (types/ と dist/ を生成)
pnpm typecheck    # 型チェックのみ
pnpm test         # テスト実行
pnpm test:watch   # テスト監視モード
pnpm test:coverage # カバレッジ付きテスト
```

## Architecture

### Component 構成 (src/)

| ファイル | 役割 |
|---------|------|
| yubisashi-rails.ts | メインコンポーネント。状態管理とイベント統合 |
| toolbar.ts | 下部ツールバー (トグル/コピー/一覧/クリア) |
| popover.ts | クリック時のアノテーション入力ポップオーバー |
| annotation-panel.ts | サイドパネル (一覧/編集/削除) |
| badge-overlay.ts | 要素上の番号バッジオーバーレイ |
| comment-parser.ts | DOM 走査で HTML コメントからテンプレートパスを特定 |
| selector-generator.ts | 要素の CSS セレクタ生成 |
| markdown-generator.ts | Markdown 出力フォーマット |
| json-generator.ts | JSON 出力フォーマット |
| theme.ts | ダークモード (CSS Variables + prefers-color-scheme) |
| utils.ts | ユーティリティ (throttle, isCombo, truncateText 等) |
| types.ts | 型定義 (Annotation, AnnotationElement 等) |

### Design Decisions

- comment-parser: 再帰ではなくループで DOM 走査 (スタックオーバーフロー防止)
- click イベントは capture フェーズで処理 (リンク遷移を確実に防止)
- `event.composedPath()` で Shadow DOM 境界を正しく検出
- selector-generator: id > data-testid/data-controller > class combo > nth-child の優先順
- CSS は Lit の `css` タグ内にプレーン CSS (UnoCSS 不使用)

## Coding Conventions

- Lit デコレータ: `@customElement`, `@property`, `@state`, `@query`
- プライベートメソッドは `_` プレフィクス
- イベントは `CustomEvent` + `bubbles: true, composed: true` (Shadow DOM 貫通)
- テスト可能なロジックはコンポーネントから export する純粋関数に切り出す
- CSS Variables は `--yubisashi-` プレフィクス

## Testing

- テスト環境: happy-dom (Vitest)
- Lit コンポーネントテスト: `document.createElement` + `updateComplete` + `shadowRoot` アクセス
- 純粋関数は直接テスト、UI コンポーネントはレンダリング + イベント発火をテスト
- カバレッジ目標: 80%+

## Output

- `dist/yubisashi-rails.mjs` - ビルド成果物 (ES module)
- `types/` - TypeScript 型定義 (テストファイルは除外)
