import * as p from '@clack/prompts'
import pc from 'picocolors'
import {
  existsSync,
  mkdirSync,
  cpSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets')

function getVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8')
    ) as { version: string }
    return pkg.version
  } catch {
    return '0.0.0'
  }
}

const AXIARCH_VERSION = getVersion()

type AgentKey = 'claude' | 'codex' | 'antigravity' | 'cursor' | 'copilot' | 'windsurf'

function handleCancel(value: unknown): asserts value is NonNullable<typeof value> {
  if (p.isCancel(value)) {
    p.cancel('キャンセルしました / Cancelled.')
    process.exit(0)
  }
}

function copyIfExists(src: string, dest: string): void {
  if (existsSync(src)) {
    cpSync(src, dest)
  }
}

function cpDirIfExists(src: string, dest: string): void {
  if (existsSync(src)) {
    cpSync(src, dest, { recursive: true })
  }
}

async function main(): Promise<void> {
  console.log()
  p.intro(pc.bold(pc.cyan(`🏰 Axiarch CLI v${AXIARCH_VERSION} — Quick Setup`)))
  console.log(pc.cyan('   Constitution-Driven AI Agent Governance Framework'))
  console.log(pc.cyan('   https://github.com/s-kyono/axiarch'))
  console.log()

  const targetDir = process.argv[2] ?? process.cwd()

  // Existing installation guard
  const existingMarkers: string[] = []
  if (existsSync(join(targetDir, 'axiarch-rules'))) existingMarkers.push('axiarch-rules/')
  if (existsSync(join(targetDir, 'axiarch-manifest.json'))) existingMarkers.push('axiarch-manifest.json')
  if (existsSync(join(targetDir, '.axiarch', 'version.json'))) existingMarkers.push('.axiarch/version.json')

  if (existingMarkers.length > 0) {
    p.log.warn(`既存の Axiarch ファイルを検出: ${existingMarkers.join(', ')}`)
    p.log.info('アップグレードには axiarch-scripts/axiarch-upgrade.sh を使用してください。')
    p.log.info(
      'インストール済みの場合: bash axiarch-scripts/axiarch-upgrade.sh --safe-only --dry-run'
    )
    console.log()
    const cont = await p.confirm({
      message: '続行しますか？ / Continue with full install anyway?',
      initialValue: false,
    })
    handleCancel(cont)
    if (!cont) {
      p.cancel('中断しました。')
      process.exit(0)
    }
  }

  // Step 1: Language
  const langRaw = await p.select({
    message: '言語を選択 / Select language:',
    options: [
      { value: 'ja', label: '🇯🇵 日本語 (Japanese)', hint: 'デフォルト / Default' },
      { value: 'en', label: '🇺🇸 English' },
    ],
  })
  handleCancel(langRaw)
  const langCode = langRaw as 'ja' | 'en'
  const langLabel = langCode === 'ja' ? 'Japanese (日本語)' : 'English'

  // Step 1.5: Language directories
  const keepBothLangs = await p.confirm({
    message: '両言語ディレクトリ (ja + en) を保持しますか？ / Keep both language directories?',
    initialValue: true,
  })
  handleCancel(keepBothLangs)

  // Step 2: AI Agent multi-select (key difference from init.sh)
  const agentsRaw = await p.multiselect({
    message:
      'AIエージェントを選択（Space で切替・複数可）/ Select AI agents (Space to toggle, multiple allowed):',
    options: [
      {
        value: 'claude',
        label: 'Claude Code',
        hint: 'CLAUDE.md + .claude/settings.json',
      },
      {
        value: 'codex',
        label: 'OpenAI Codex',
        hint: '.codex/hooks.json',
      },
      {
        value: 'antigravity',
        label: 'Google Antigravity ✅',
        hint: '.agents/rules/prompt_pointer.md (verified)',
      },
      {
        value: 'cursor',
        label: 'Cursor ⚠️',
        hint: '.cursor/rules/axiarch.mdc (unverified)',
      },
      {
        value: 'copilot',
        label: 'GitHub Copilot ⚠️',
        hint: '.github/copilot-instructions.md (unverified)',
      },
      {
        value: 'windsurf',
        label: 'Windsurf ⚠️',
        hint: '.windsurfrules (unverified)',
      },
    ],
    required: false,
  })
  handleCancel(agentsRaw)
  const selectedAgents = (agentsRaw ?? []) as AgentKey[]

  // Copy files
  const s = p.spinner()
  s.start('ファイルをコピーしています / Copying files...')

  try {
    mkdirSync(targetDir, { recursive: true })

    // --- Common files ---
    copyIfExists(join(ASSETS_DIR, 'AGENTS.md'), join(targetDir, 'AGENTS.md'))
    copyIfExists(
      join(ASSETS_DIR, 'axiarch-manifest.json'),
      join(targetDir, 'axiarch-manifest.json')
    )

    // axiarch-rules/
    cpDirIfExists(join(ASSETS_DIR, 'axiarch-rules'), join(targetDir, 'axiarch-rules'))
    if (!keepBothLangs) {
      const unusedLang = langCode === 'ja' ? 'en' : 'ja'
      const unusedDir = join(targetDir, 'axiarch-rules', unusedLang)
      if (existsSync(unusedDir)) rmSync(unusedDir, { recursive: true })
    }

    // axiarch-scripts/
    cpDirIfExists(join(ASSETS_DIR, 'axiarch-scripts'), join(targetDir, 'axiarch-scripts'))
    try {
      execSync(`chmod +x "${join(targetDir, 'axiarch-scripts')}"/*.sh`, { stdio: 'ignore' })
    } catch {
      // chmod not critical (Windows etc.)
    }

    // --- Agent-specific files ---
    if (selectedAgents.includes('claude')) {
      copyIfExists(join(ASSETS_DIR, 'CLAUDE.md'), join(targetDir, 'CLAUDE.md'))
      mkdirSync(join(targetDir, '.claude'), { recursive: true })
      copyIfExists(
        join(ASSETS_DIR, '.claude', 'settings.json'),
        join(targetDir, '.claude', 'settings.json')
      )
      // Preserve existing memory
      const memoryTarget = join(targetDir, '.claude', 'memory', 'MEMORY.md')
      if (!existsSync(memoryTarget)) {
        mkdirSync(join(targetDir, '.claude', 'memory'), { recursive: true })
        copyIfExists(join(ASSETS_DIR, '.claude', 'memory', 'MEMORY.md'), memoryTarget)
      }
    }

    if (selectedAgents.includes('codex')) {
      mkdirSync(join(targetDir, '.codex'), { recursive: true })
      copyIfExists(
        join(ASSETS_DIR, '.codex', 'hooks.json'),
        join(targetDir, '.codex', 'hooks.json')
      )
    }

    if (selectedAgents.includes('antigravity')) {
      mkdirSync(join(targetDir, '.agents', 'rules'), { recursive: true })
      copyIfExists(
        join(ASSETS_DIR, '.agents', 'rules', 'prompt_pointer.md'),
        join(targetDir, '.agents', 'rules', 'prompt_pointer.md')
      )
    }

    if (selectedAgents.includes('cursor')) {
      mkdirSync(join(targetDir, '.cursor', 'rules'), { recursive: true })
      copyIfExists(
        join(ASSETS_DIR, '.cursor', 'rules', 'axiarch.mdc'),
        join(targetDir, '.cursor', 'rules', 'axiarch.mdc')
      )
    }

    if (selectedAgents.includes('copilot')) {
      mkdirSync(join(targetDir, '.github'), { recursive: true })
      copyIfExists(
        join(ASSETS_DIR, '.github', 'copilot-instructions.md'),
        join(targetDir, '.github', 'copilot-instructions.md')
      )
    }

    if (selectedAgents.includes('windsurf')) {
      copyIfExists(join(ASSETS_DIR, '.windsurfrules'), join(targetDir, '.windsurfrules'))
    }

    // Write install metadata
    mkdirSync(join(targetDir, '.axiarch'), { recursive: true })
    writeFileSync(
      join(targetDir, '.axiarch', 'version.json'),
      JSON.stringify(
        {
          version: AXIARCH_VERSION,
          installerVersion: AXIARCH_VERSION,
          sourceRef: `tags/v${AXIARCH_VERSION}`,
          installedAt: new Date().toISOString(),
          agents: selectedAgents.length > 0 ? selectedAgents : ['universal'],
          language: langCode,
        },
        null,
        2
      )
    )

    s.stop('ファイルのコピーが完了しました / Files copied.')
  } catch (err) {
    s.stop('エラーが発生しました / Error occurred.')
    p.log.error(String(err))
    process.exit(1)
  }

  printNextSteps(langCode, langLabel, selectedAgents)

  p.outro(pc.bold(pc.green('🎉 Axiarch setup complete!')))
}

function printNextSteps(
  langCode: string,
  langLabel: string,
  selectedAgents: AgentKey[]
): void {
  const agentFiles: Record<AgentKey, string> = {
    claude: 'CLAUDE.md + .claude/settings.json',
    codex: '.codex/hooks.json',
    antigravity: '.agents/rules/prompt_pointer.md',
    cursor: '.cursor/rules/axiarch.mdc',
    copilot: '.github/copilot-instructions.md',
    windsurf: '.windsurfrules',
  }

  const agentNames: Record<AgentKey, string> = {
    claude: 'Claude Code',
    codex: 'OpenAI Codex',
    antigravity: 'Google Antigravity',
    cursor: 'Cursor',
    copilot: 'GitHub Copilot',
    windsurf: 'Windsurf',
  }

  console.log()
  console.log(pc.bold('Next Steps:'))
  console.log()
  let step = 1

  console.log(
    `  ${pc.cyan(`${step}.`)} Open ${pc.bold('AGENTS.md')} and set ${pc.bold('Project Native Language')} to ${pc.bold(langLabel)}`
  )
  step++

  for (const agent of selectedAgents) {
    console.log(
      `  ${pc.cyan(`${step}.`)} ✅ ${pc.bold(agentFiles[agent])} — configured (${agentNames[agent]})`
    )
    step++
  }

  console.log(
    `  ${pc.cyan(`${step}.`)} Edit ${pc.bold(`axiarch-rules/${langCode}/blueprint/core/000_project_overview.md`)}`
  )
  console.log(`       → Fill in your project's tech stack, architecture, and goals`)
  step++

  const needsHookVerify = selectedAgents.includes('codex') || selectedAgents.includes('claude')
  if (needsHookVerify) {
    console.log(`  ${pc.cyan(`${step}.`)} ${pc.bold('Verify hook wiring (recommended):')}`)
  } else {
    console.log(`  ${pc.cyan(`${step}.`)} ${pc.bold('Optional diagnostic:')}`)
  }
  console.log(`       → ${pc.bold('bash axiarch-scripts/check-axiarch-health.sh')}`)
  step++

  console.log(`  ${pc.cyan(`${step}.`)} ${pc.bold('Plan future upgrades safely (optional):')}`)
  console.log(
    `       → ${pc.bold('bash axiarch-scripts/axiarch-upgrade.sh --safe-only --dry-run')}`
  )
  step++

  console.log(`  ${pc.cyan(`${step}.`)} Start developing — the Constitution is now active.`)
  console.log()
  console.log(`  ${pc.cyan('Docs:')}    https://github.com/s-kyono/axiarch`)
  console.log(`  ${pc.cyan('Scripts:')} See ${pc.bold('axiarch-scripts/README.md')} for diagnostic tools`)
  console.log(`  ${pc.cyan('Issues:')}  https://github.com/s-kyono/axiarch/issues`)
  console.log()
}

main().catch((err: unknown) => {
  p.log.error(String(err))
  process.exit(1)
})
