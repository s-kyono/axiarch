/**
 * sync-assets.mjs
 * Copies axiarch source files from the repo root into packages/cli/assets/
 * Run: node scripts/sync-assets.mjs
 * Called automatically by: npm run build
 */

import { cpSync, existsSync, rmSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PKG_DIR = join(__dirname, '..')        // packages/cli/
const REPO_ROOT = join(PKG_DIR, '..', '..') // repo root
const ASSETS_DIR = join(PKG_DIR, 'assets')

// Clear and recreate assets dir
if (existsSync(ASSETS_DIR)) rmSync(ASSETS_DIR, { recursive: true })
mkdirSync(ASSETS_DIR, { recursive: true })

/** @type {Array<{ src: string, dest: string }>} */
const entries = [
  // Common files
  { src: 'AGENTS.md', dest: 'AGENTS.md' },
  { src: 'axiarch-manifest.json', dest: 'axiarch-manifest.json' },
  // Rule and script directories
  { src: 'axiarch-rules', dest: 'axiarch-rules' },
  { src: 'axiarch-scripts', dest: 'axiarch-scripts' },
  { src: 'axiarch-prompts', dest: 'axiarch-prompts' },
  // Claude Code
  { src: 'CLAUDE.md', dest: 'CLAUDE.md' },
  { src: '.claude/settings.json', dest: '.claude/settings.json' },
  { src: '.claude/memory/MEMORY.md', dest: '.claude/memory/MEMORY.md' },
  // OpenAI Codex
  { src: '.codex/hooks.json', dest: '.codex/hooks.json' },
  // Google Antigravity
  { src: '.agents/rules/prompt_pointer.md', dest: '.agents/rules/prompt_pointer.md' },
  // Cursor
  { src: '.cursor/rules/axiarch.mdc', dest: '.cursor/rules/axiarch.mdc' },
  // GitHub Copilot
  { src: '.github/copilot-instructions.md', dest: '.github/copilot-instructions.md' },
  // Windsurf
  { src: '.windsurfrules', dest: '.windsurfrules' },
]

let copied = 0
let skipped = 0

for (const { src, dest } of entries) {
  const srcPath = join(REPO_ROOT, src)
  const destPath = join(ASSETS_DIR, dest)

  if (!existsSync(srcPath)) {
    console.log(`  skip  ${src} (not found)`)
    skipped++
    continue
  }

  // Ensure parent directory exists
  const destDir = dirname(destPath)
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })

  cpSync(srcPath, destPath, { recursive: true })
  console.log(`  sync  ${src}`)
  copied++
}

console.log(`\nDone: ${copied} synced, ${skipped} skipped → ${ASSETS_DIR}`)
