# 020. Core Governance Rules

> [!NOTE]
> This file is a Blueprint Rule (project-specific rule).
> Auto-crystallized from `core/010_project_lessons_log.md`.
> Created: 2026-05-24 (Auto-Crystallized from core/010)

> [!IMPORTANT]
> **Domain**: Core Governance
> **Location**: `blueprint/core/020_governance_rules.md`
> **Related Universal Rules**: `universal/core/000_core_mindset.md`, `universal/core/100_governance.md`
> **2 sections.**

---

## 📒 Table of Contents

| Section | Content | Count |
|:---------|:-----|:--:|
| Lessons | Crystallized rules and lessons | 3 |
| Appendix A | Reverse index & cross-references | 1 |

---

## Lessons

### [Initial] Foundational Principles at Project Start
**Domain:** Core Governance
**Context:** When starting a new project or refreshing rules.
**Problem:** N/A (preventive rule)
**Solution/Rule:** Comply with the protocols defined in `AGENTS.md` and `axiarch-rules` as the baseline. Never skip the BOOT SEQUENCE (Steps 1–5) at the start of each session.
**Reference:** `AGENTS.md` §0 Boot Sequence, `axiarch-rules/en/LOADING_PROTOCOL.md`

---

### [2026-05-24] diff guard counts untracked files such as package-lock.json
**Domain:** Core Governance
**Context:** After running `npm install` during CLI MVP implementation, diff guard warned about 2405 lines.
**Problem:** Actual `git diff --stat` showed only 7 lines, but diff guard sums untracked file lines via `git ls-files --others --exclude-standard`, causing a large warning due to package-lock.json and other new files.
**Solution/Rule:** For large new-feature tasks, diff guard warnings after `npm install` are expected behavior. Bypass with `AXIARCH_DIFF_GUARD_ALLOW=1` env var. Record "all intentional new creations" in task.md to clarify the intent of the warning.
**Reference:** `axiarch-scripts/axiarch-diff-guard.sh` L78-88

---

### [2026-05-24] Session process documents require overwrite-allow whitelist for Write
**Domain:** Core Governance
**Context:** At the start of CLI MVP implementation, `axiarch-protect-antifull.sh` blocked Write operations to task.md / implementation_plan.md / walkthrough.md as §6 violations.
**Problem:** These files are designed to be rewritten each session, but Write to existing files is blocked by default.
**Solution/Rule:** Register the absolute paths of session documents in `.claude/axiarch-overwrite-allow.txt` (or `.codex/axiarch-overwrite-allow.txt`) to apply the whitelist. As the first action of each session, create this file and register all 3 session documents.
**Reference:** `axiarch-scripts/axiarch-protect-antifull.sh` L89-109

---

## Appendix A: Reverse Index & Cross-References

### Reverse Index (Keyword → Section)

| Keyword | Section | Related Rule |
|:---------|:------------|:---------|
| BOOT SEQUENCE / session start | Lessons — Foundational Principles at Project Start | `universal/core/000_core_mindset.md` |
| diff guard / untracked / package-lock.json | Lessons — diff guard counts untracked files | `axiarch-scripts/axiarch-diff-guard.sh` |
| overwrite / §6 / whitelist / task.md | Lessons — Session process documents Write | `axiarch-scripts/axiarch-protect-antifull.sh` |
| AXIARCH_DIFF_GUARD_ALLOW | Lessons — diff guard counts untracked files | `axiarch-scripts/axiarch-diff-guard.sh` |
| axiarch-overwrite-allow.txt | Lessons — Session process documents Write | `axiarch-scripts/axiarch-protect-antifull.sh` |

### Cross-References

| Related File | Relationship |
|:-----------|:-----|
| `universal/core/000_core_mindset.md` | Governing Rule (Universal) |
| `universal/core/100_governance.md` | Governing Rule (Universal) |
| `core/010_project_lessons_log.md` | Index (crystallization origin) |
| `axiarch-scripts/axiarch-diff-guard.sh` | Referenced script (diff guard implementation) |
| `axiarch-scripts/axiarch-protect-antifull.sh` | Referenced script (§6 anti-overwrite implementation) |
