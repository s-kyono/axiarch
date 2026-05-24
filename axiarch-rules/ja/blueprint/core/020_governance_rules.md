# 020. コア・ガバナンス運用ルール

> [!NOTE]
> このファイルは Blueprint Rule（プロジェクト固有ルール）です。
> `core/010_project_lessons_log.md` から自動結晶化されました。
> Created: 2026-05-24 (Auto-Crystallized from core/010)

> [!IMPORTANT]
> **Domain**: コア・ガバナンス
> **Location**: `blueprint/core/020_governance_rules.md`
> **Related Universal Rules**: `universal/core/000_core_mindset.md`, `universal/core/100_governance.md`
> **2 sections.**

---

## 📒 目次

| セクション | 内容 | セクション数 |
|:---------|:-----|:--:|
| 教訓 | 結晶化されたルール・教訓 | 3 |
| Appendix A | 逆引き索引 & クロスリファレンス | 1 |

---

## 教訓

### [Initial] プロジェクト開始時の基本原則
**Domain:** コア・ガバナンス
**Context:** 新規プロジェクトまたはルールの刷新時。
**Problem:** N/A（予防的ルール）
**Solution/Rule:** `AGENTS.md` および `axiarch-rules` のプロトコルを基準として遵守すること。セッション開始時の BOOT SEQUENCE（Step 1〜5）を省略しない。
**Reference:** `AGENTS.md` §0 Boot Sequence, `axiarch-rules/ja/LOADING_PROTOCOL.md`

---

### [2026-05-24] diff guard は package-lock.json 等の untracked ファイルも行数計上する
**Domain:** コア・ガバナンス
**Context:** CLI MVP 実装で `npm install` を実行後、diff guard が 2405 行を警告した。
**Problem:** `git diff --stat` の実測は 7 行のみだったが、diff guard は `git ls-files --others --exclude-standard` で untracked ファイル（package-lock.json 等）の行数も合算するため大きな警告が出た。
**Solution/Rule:** 大規模新規実装タスクでは `npm install` 後に diff guard が警告するのは仕様通り。`AXIARCH_DIFF_GUARD_ALLOW=1` 環境変数でバイパス可能。task.md に「全て意図的な新規作成」と記録することで警告の意図を明示する。
**Reference:** `axiarch-scripts/axiarch-diff-guard.sh` L78-88

---

### [2026-05-24] セッションプロセスドキュメントの Write には overwrite-allow whitelist が必要
**Domain:** コア・ガバナンス
**Context:** CLI MVP 実装タスク開始時、`axiarch-protect-antifull.sh` が task.md / implementation_plan.md / walkthrough.md への Write を §6 違反としてブロックした。
**Problem:** これらは毎セッション書き直すことが設計の意図だが、既存ファイルへの Write は原則ブロックされる。
**Solution/Rule:** `.claude/axiarch-overwrite-allow.txt`（または `.codex/axiarch-overwrite-allow.txt`）にセッションドキュメントの絶対パスを登録することでホワイトリスト適用。毎セッション最初のアクションとしてこのファイルを作成し、3 ファイルを登録すること。
**Reference:** `axiarch-scripts/axiarch-protect-antifull.sh` L89-109

---

## Appendix A: 逆引き索引 & クロスリファレンス

### 逆引き索引（Keyword → Section）

| Keyword | Section | Related Rule |
|:---------|:------------|:---------|
| BOOT SEQUENCE / セッション開始 | 教訓 — プロジェクト開始時の基本原則 | `universal/core/000_core_mindset.md` |
| diff guard / untracked / package-lock.json | 教訓 — diff guard は untracked ファイルも計上 | `axiarch-scripts/axiarch-diff-guard.sh` |
| overwrite / §6 / whitelist / task.md | 教訓 — セッションプロセスドキュメントの Write | `axiarch-scripts/axiarch-protect-antifull.sh` |
| AXIARCH_DIFF_GUARD_ALLOW | 教訓 — diff guard は untracked ファイルも計上 | `axiarch-scripts/axiarch-diff-guard.sh` |
| axiarch-overwrite-allow.txt | 教訓 — セッションプロセスドキュメントの Write | `axiarch-scripts/axiarch-protect-antifull.sh` |

### クロスリファレンス

| Related File | Relationship |
|:-----------|:-----|
| `universal/core/000_core_mindset.md` | Governing Rule (Universal) |
| `universal/core/100_governance.md` | Governing Rule (Universal) |
| `core/010_project_lessons_log.md` | Index (crystallization origin) |
| `axiarch-scripts/axiarch-diff-guard.sh` | Referenced script (diff guard implementation) |
| `axiarch-scripts/axiarch-protect-antifull.sh` | Referenced script (§6 anti-overwrite implementation) |
