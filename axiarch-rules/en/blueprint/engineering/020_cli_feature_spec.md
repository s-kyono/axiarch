# 020. CLI Feature Spec — `npx axiarch init`

> **Blueprint First**: This spec was created before implementation.
> Target folder: `engineering/` | Related Universal: `engineering/000_engineering_standards`

---

## 📑 Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [User Stories](#2-user-stories)
3. [Acceptance Criteria](#3-acceptance-criteria)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Edge Cases and Constraints](#5-edge-cases-and-constraints)
6. [Architecture Design](#6-architecture-design)
7. [UI/UX — Interaction Flow](#7-uiux--interaction-flow)
8. [Security Considerations](#8-security-considerations)
9. [Test Strategy](#9-test-strategy)
10. [Release Strategy](#10-release-strategy)
11. [Appendix A: Reverse Index](#appendix-a-reverse-index)

---

## 1. Feature Overview

- **Feature name**: Axiarch CLI (`npx axiarch init`)
- **Problem**: The existing `curl init.sh` approach leaves repository structure behind and is cumbersome. Only a single agent can be selected.
- **Solution**: Replace with a native npm CLI that enables simultaneous multi-agent selection and version consistency via npm publish.
- **Success criteria**:
  - `npx axiarch init` completes interactively
  - Files for selected agents are correctly copied
  - Multiple agents can be selected simultaneously (key difference from init.sh)

---

## 2. User Stories

### US-001: Introducing Axiarch to a New Project

- **As a** developer,
- **I want** to run `npx axiarch init` to add Axiarch governance to my project,
- **So that** I can apply the same constitution to multiple AI agents.

### US-002: Simultaneous Multi-Agent Setup

- **As a** developer using both Claude Code and OpenAI Codex,
- **I want** to set up hooks for both agents with a single command,
- **So that** I can avoid running init.sh twice.

---

## 3. Acceptance Criteria

### Acceptance Criteria for US-001

| ID | Given | When | Then | Priority |
|:---|:------|:-----|:-----|:---------|
| AC-001 | Run in a new directory | Execute `npx axiarch init` | AGENTS.md + axiarch-rules/ + axiarch-scripts/ + axiarch-manifest.json are copied | Must |
| AC-002 | Select `ja` as language | Choose "selected only" in language directory settings | `axiarch-rules/en/` is removed | Must |
| AC-003 | Existing installation detected | Execute `npx axiarch init` | Warning is shown and confirmation to continue is requested | Must |
| AC-004 | Prompt library selected | Choose Yes | `axiarch-prompts/` is copied | Should |
| AC-005 | Pre-commit hook selected | Choose Yes | axiarch block is added to `.git/hooks/pre-commit` | Should |
| AC-006 | lefthook etc. detected | Choose Yes | Warning shown prompting manual setup (existing hooks not broken) | Must |

### Acceptance Criteria for US-002

| ID | Given | When | Then | Priority |
|:---|:------|:-----|:-----|:---------|
| AC-007 | Agent selection screen | Select both claude and codex | CLAUDE.md + .claude/settings.json + .codex/hooks.json are all copied | Must |
| AC-008 | Agent selection screen | Confirm with empty selection (0 items) | Only AGENTS.md + common files are copied (no error) | Must |

---

## 4. Non-Functional Requirements

| Category | Requirement | Baseline |
|:---------|:------------|:---------|
| Performance | From command launch to start of interaction | < 1 second |
| Node.js version | Minimum supported | `>=18` |
| Package size | Package size at npm publish | < 10 MB (including axiarch-rules/) |
| Offline operation | Installed `npx axiarch init` | No network required |

---

## 5. Edge Cases and Constraints

### Edge Cases

| ID | Scenario | Expected Behavior |
|:---|:---------|:-----------------|
| EC-001 | pre-commit selected outside a git repository | Show warning and skip |
| EC-002 | lefthook / husky / pre-commit-config.yaml detected | Warning + manual setup instructions |
| EC-003 | 0 agents selected | No error; copy only AGENTS.md + common files |
| EC-004 | .claude/memory/MEMORY.md already exists | Skip without overwriting (protect user data) |
| EC-005 | Interrupt with Ctrl+C | Display clean cancellation message |

### Constraints

- **Technical constraint**: Node.js >= 18 required (uses `import.meta.url`)
- **Business constraint**: Phase 1 includes only the `init` subcommand. `upgrade` / `health` are Phase 2/3
- **Not supported**: Binary `chmod` on `.git/hooks/pre-commit` for Windows (skipped via `try/catch`)

---

## 6. Architecture Design

```
axiarch/                         ← repo root
├── package.json                 ← npm workspaces root
├── packages/
│   └── cli/
│       ├── package.json         ← name: "axiarch", bin: { axiarch: dist/index.js }
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── src/
│       │   └── index.ts         ← All CLI logic (single file)
│       ├── scripts/
│       │   └── sync-assets.mjs  ← repo root → assets/ copy
│       └── assets/              ← GENERATED: included in npm package
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

### Build Flow

```
npm run build (packages/cli)
  1. node scripts/sync-assets.mjs   → generate assets/
  2. tsup                           → dist/index.js (ESM)

npm publish
  → dist/ + assets/ included in npm package
  → package.json "files": ["dist", "assets"]
```

### Runtime Assets Reference

```typescript
const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets')
// From dist/index.js: ../assets = packages/cli/assets/
```

---

## 7. UI/UX — Interaction Flow

```
🏰 Axiarch CLI vX.Y.Z — Quick Setup

[If existing detected] ⚠ Warning + continue confirmation

◆ Select language
  ● 🇯🇵 Japanese (日本語)
  ○ 🇺🇸 English

◆ Keep both language directories?
  ● Yes  ○ No

◆ Select AI agents (multiple allowed) [Space to toggle]
  ☐ Claude Code          CLAUDE.md + .claude/settings.json
  ☐ OpenAI Codex         .codex/hooks.json
  ☐ Google Antigravity ✅ .agents/rules/prompt_pointer.md (verified)
  ☐ Cursor ⚠️            .cursor/rules/axiarch.mdc (unverified)
  ☐ GitHub Copilot ⚠️    .github/copilot-instructions.md (unverified)
  ☐ Windsurf ⚠️          .windsurfrules (unverified)

⠦ Copying files...
✔ Files copied.

Next Steps: ...

🎉 Axiarch setup complete!
```

---

## 8. Security Considerations

| Risk | Mitigation |
|:-----|:-----------|
| Overwriting user's `.claude/memory/MEMORY.md` | Skip if file already exists |
| `chmod +x` failure (Windows etc.) | Skip via try/catch |
| Incomplete copy due to Ctrl+C | Immediate exit(0) via `p.isCancel()` |

---

## 9. Test Strategy

Phase 1 uses manual testing only. Unit tests to be added in Phase 2.

| Test Type | Target | Expected Result |
|:----------|:-------|:----------------|
| Manual E2E | `node packages/cli/dist/index.js` | Interaction completes normally |
| Manual: existing detection | Run with axiarch-rules/ present | Warning + continue confirmation |
| Manual: multi-select | Select both claude + codex | Both sets of files copied |
| Manual: empty selection | 0 agents selected | Only common files copied |

---

## 10. Release Strategy

| Item | Content |
|:-----|:--------|
| Phase 1 (MVP) | `npx axiarch init` only → npm publish |
| Phase 2 | `npx axiarch upgrade` (Node.js port of axiarch-upgrade.sh) |
| Phase 3 | `npx axiarch health`, monorepo support |
| Existing init.sh | After Phase 1 completion, switch README to `npx axiarch init`. Keep init.sh for the time being |

---

## Appendix A: Reverse Index

| Keyword | Section |
|:--------|:--------|
| npx axiarch init | §1 Feature Overview |
| multi-agent selection | §3 AC-007, §7 Interaction Flow |
| assets/ bundling | §6 Architecture |
| pre-commit hook | §3 AC-005, AC-006 |
| Ctrl+C cancel | §5 EC-005 |
| npm publish | §10 Release Strategy |

---

**Version**: 1.0.0 (Phase 1 MVP)  
**Created**: 2026-05-24
