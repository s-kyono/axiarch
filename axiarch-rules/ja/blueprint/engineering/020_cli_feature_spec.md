# 020. CLI 機能仕様 — `npx axiarch init`

> **Blueprint First**: この仕様書は実装前に作成されたもの。
> 対応フォルダ: `engineering/` | 関連 Universal: `engineering/000_engineering_standards`

---

## 📑 目次

1. [機能概要](#1-機能概要)
2. [ユーザーストーリー](#2-ユーザーストーリー)
3. [受け入れ条件](#3-受け入れ条件)
4. [非機能要件](#4-非機能要件)
5. [エッジケースと制約](#5-エッジケースと制約)
6. [アーキテクチャ設計](#6-アーキテクチャ設計)
7. [UI/UX — 対話フロー](#7-uiux--対話フロー)
8. [セキュリティ考慮事項](#8-セキュリティ考慮事項)
9. [テスト戦略](#9-テスト戦略)
10. [リリース戦略](#10-リリース戦略)
11. [Appendix A: 逆引き索引](#appendix-a-逆引き索引)

---

## 1. 機能概要

- **機能名**: Axiarch CLI (`npx axiarch init`)
- **課題**: 現行の `curl init.sh` 方式はリポジトリ構造が手元に残り煩雑。単一エージェントしか選択できない。
- **解決策**: npm ネイティブの CLI に置き換え、複数 AI エージェント同時選択・npm publish によるバージョン整合を実現する。
- **成功指標**:
  - `npx axiarch init` がインタラクティブに完了する
  - 選択したエージェント用ファイルが正しくコピーされる
  - 複数エージェントを同時選択できる（init.sh との最大の差分）

---

## 2. ユーザーストーリー

### US-001: 新規プロジェクトへの Axiarch 導入

- **As a** 開発者,
- **I want** `npx axiarch init` を実行して Axiarch ガバナンスをプロジェクトに追加したい,
- **So that** 複数の AI エージェントに同一の憲法を適用できる。

### US-002: 複数エージェントの同時セットアップ

- **As a** Claude Code と OpenAI Codex を両方使う開発者,
- **I want** 1 回のコマンドで両エージェントのフックをセットアップしたい,
- **So that** init.sh を 2 回実行する手間を省ける。

---

## 3. 受け入れ条件

### US-001 の受け入れ条件

| ID | Given | When | Then | 優先度 |
|:---|:------|:-----|:-----|:------|
| AC-001 | 新規ディレクトリで実行 | `npx axiarch init` を実行 | AGENTS.md + axiarch-rules/ + axiarch-scripts/ + axiarch-manifest.json がコピーされる | Must |
| AC-002 | 言語として `ja` を選択 | 言語ディレクトリ設定で「選択のみ」を選択 | `axiarch-rules/en/` が削除される | Must |
| AC-003 | 既存インストール検出 | `npx axiarch init` を実行 | 警告が表示され、続行確認を求められる | Must |
| AC-004 | プロンプトライブラリ選択 | Yes を選択 | `axiarch-prompts/` がコピーされる | Should |
| AC-005 | pre-commit hook 選択 | Yes を選択 | `.git/hooks/pre-commit` に axiarch ブロックが追加される | Should |
| AC-006 | lefthook 等を検出 | Yes を選択 | 警告が出て手動設定を促す（既存 hook を壊さない） | Must |

### US-002 の受け入れ条件

| ID | Given | When | Then | 優先度 |
|:---|:------|:-----|:-----|:------|
| AC-007 | エージェント選択画面 | claude と codex を両方選択 | CLAUDE.md + .claude/settings.json + .codex/hooks.json が全てコピーされる | Must |
| AC-008 | エージェント選択画面 | 空選択（0件）で確定 | AGENTS.md + 共通ファイルのみコピー（エラーにならない） | Must |

---

## 4. 非機能要件

| カテゴリ | 要件 | 基準値 |
|:--------|:-----|:------|
| パフォーマンス | コマンド起動から対話開始まで | < 1 秒 |
| Node.js バージョン | 最低サポート | `>=18` |
| パッケージサイズ | npm publish 時のパッケージサイズ | < 10 MB (axiarch-rules/ 同梱込み) |
| オフライン動作 | インストール済みの `npx axiarch init` | ネットワーク不要 |

---

## 5. エッジケースと制約

### エッジケース

| ID | シナリオ | 期待動作 |
|:---|:--------|:--------|
| EC-001 | git リポジトリ外で pre-commit 選択 | 警告を表示してスキップ |
| EC-002 | lefthook / husky / pre-commit-config.yaml 検出 | 警告 + 手動設定の案内 |
| EC-003 | エージェント選択で 0 件 | エラーなし、AGENTS.md + 共通ファイルのみコピー |
| EC-004 | .claude/memory/MEMORY.md が既存 | 上書きせずスキップ（ユーザーデータ保護） |
| EC-005 | Ctrl+C で中断 | クリーンなキャンセルメッセージ表示 |

### 制約事項

- **技術的制約**: Node.js >= 18 必須（`import.meta.url` 使用）
- **ビジネス制約**: Phase 1 は `init` サブコマンドのみ。`upgrade` / `health` は Phase 2/3
- **非対応**: Windows の `.git/hooks/pre-commit` へのバイナリ chmod（`try/catch` でスキップ）

---

## 6. アーキテクチャ設計

```
axiarch/                         ← repo root
├── package.json                 ← npm workspaces root
├── packages/
│   └── cli/
│       ├── package.json         ← name: "axiarch", bin: { axiarch: dist/index.js }
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── src/
│       │   └── index.ts         ← CLI 全ロジック (単一ファイル)
│       ├── scripts/
│       │   └── sync-assets.mjs  ← repo root → assets/ コピー
│       └── assets/              ← GENERATED: npm package に含まれる
│           ├── AGENTS.md
│           ├── axiarch-manifest.json
│           ├── axiarch-rules/
│           ├── axiarch-scripts/
│           ├── axiarch-prompts/
│           ├── CLAUDE.md
│           ├── .claude/
│           ├── .codex/
│           ├── .agents/
│           ├── .cursor/
│           ├── .github/
│           └── .windsurfrules
```

### ビルドフロー

```
npm run build (packages/cli)
  1. node scripts/sync-assets.mjs   → assets/ 生成
  2. tsup                           → dist/index.js (ESM)

npm publish
  → dist/ + assets/ が npm パッケージに含まれる
  → package.json の "files": ["dist", "assets"]
```

### ランタイム assets 参照

```typescript
const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets')
// dist/index.js から見て ../assets = packages/cli/assets/
```

---

## 7. UI/UX — 対話フロー

```
🏰 Axiarch CLI vX.Y.Z — Quick Setup

[既存検出時] ⚠ 警告 + 続行確認

◆ 言語を選択
  ● 🇯🇵 日本語 (Japanese)
  ○ 🇺🇸 English

◆ 両言語ディレクトリを保持しますか？
  ● Yes  ○ No

◆ AIエージェントを選択（複数可）[Space で選択切替]
  ☐ Claude Code          CLAUDE.md + .claude/settings.json
  ☐ OpenAI Codex         .codex/hooks.json
  ☐ Google Antigravity ✅ .agents/rules/prompt_pointer.md (verified)
  ☐ Cursor ⚠️            .cursor/rules/axiarch.mdc (unverified)
  ☐ GitHub Copilot ⚠️    .github/copilot-instructions.md (unverified)
  ☐ Windsurf ⚠️          .windsurfrules (unverified)

◆ プロンプトライブラリをコピーしますか？
  ○ Yes  ● No

◆ pre-commit hookをインストールしますか？
  ○ Yes  ● No

⠦ ファイルをコピーしています...
✔ ファイルのコピーが完了しました。

Next Steps: ...

🎉 Axiarch setup complete!
```

---

## 8. セキュリティ考慮事項

| リスク | 対策 |
|:-------|:-----|
| ユーザーの `.claude/memory/MEMORY.md` 上書き | 既存時はスキップ |
| `chmod +x` 失敗（Windows 等） | try/catch でスキップ |
| Ctrl+C による不完全コピー | `p.isCancel()` で即座に exit(0) |

---

## 9. テスト戦略

Phase 1 では手動テストのみ。Phase 2 でユニットテスト追加予定。

| テスト種別 | 対象 | 期待結果 |
|:----------|:-----|:--------|
| 手動 E2E | `node packages/cli/dist/index.js` | 対話が正常完了 |
| 手動: 既存検出 | axiarch-rules/ 存在下で実行 | 警告 + 続行確認 |
| 手動: 複数選択 | claude + codex 両選択 | 両方のファイルがコピーされる |
| 手動: 空選択 | エージェント 0 件 | 共通ファイルのみコピー |

---

## 10. リリース戦略

| 項目 | 内容 |
|:-----|:-----|
| Phase 1 (MVP) | `npx axiarch init` のみ → npm publish |
| Phase 2 | `npx axiarch upgrade`（axiarch-upgrade.sh の Node.js 移植） |
| Phase 3 | `npx axiarch health`、monorepo 対応 |
| 既存 init.sh | Phase 1 完成後に README を `npx axiarch init` に切り替え。init.sh は当面残す |

---

## Appendix A: 逆引き索引

| キーワード | 対応セクション |
|:----------|:-------------|
| npx axiarch init | §1 機能概要 |
| 複数エージェント選択 | §3 AC-007, §7 対話フロー |
| assets/ 同梱 | §6 アーキテクチャ |
| pre-commit hook | §3 AC-005, AC-006 |
| Ctrl+C キャンセル | §5 EC-005 |
| npm publish | §10 リリース戦略 |

---

**Version**: 1.0.0 (Phase 1 MVP)  
**Created**: 2026-05-24
