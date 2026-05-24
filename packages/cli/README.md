# 🏰 Axiarch

**Constitution-Driven AI Agent Governance Framework**

Axiarch installs a shared rule set ("constitution") into your project so that every AI agent — Claude Code, OpenAI Codex, Cursor, and more — follows the same protocols.

## Quick Start

```bash
npx axiarch init
```

That's it. The interactive CLI guides you through language selection and agent setup in under a minute.

## What gets installed

| File / Directory | Purpose |
|:----------------|:--------|
| `AGENTS.md` | Top-level protocol — the constitution every agent reads first |
| `axiarch-rules/` | Universal rules + project-specific Blueprint rules |
| `axiarch-scripts/` | Health check, upgrade, and diff-guard scripts |
| `axiarch-manifest.json` | File group and policy definitions |
| Agent config files | Per-agent hook / instruction files (based on your selection) |

## Supported AI Agents

| Agent | Config file |
|:------|:-----------|
| Claude Code | `CLAUDE.md` + `.claude/settings.json` |
| OpenAI Codex | `.codex/hooks.json` |
| Google Antigravity | `.agents/rules/prompt_pointer.md` |
| Cursor | `.cursor/rules/axiarch.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Windsurf | `.windsurfrules` |

## Requirements

- Node.js >= 18

## After Setup

```bash
# Verify everything is wired correctly
bash axiarch-scripts/check-axiarch-health.sh

# Preview available upgrades (safe, dry-run)
bash axiarch-scripts/axiarch-upgrade.sh --safe-only --dry-run
```

## Links

- **GitHub**: https://github.com/s-kyono/axiarch
- **Issues**: https://github.com/s-kyono/axiarch/issues

## License

MIT
