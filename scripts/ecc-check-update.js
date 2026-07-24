#!/usr/bin/env node
/*
 * ECC check/update fact collector.
 *
 * Default output schema:
 * {
 *   status: 'OK' | 'DIFF' | 'UNKNOWN',
 *   summary: {
 *     baselineVersion, installedVersion,
 *     version, skillCommands, agents, mcpTemplates, newCapabilities
 *   },
 *   diffs: {
 *     missingSkillCommands, missingAgents,
 *     newSkillCommands, newAgents,
 *     missingMcpTemplatesInMap, staleMcpTemplatesInMap
 *   },
 *   analysisRequired: string[],
 *   warnings: { code, message, hint? }[],
 *   nextAction: string,
 *   details?: {...} // --verbose only
 * }
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const args = new Set(process.argv.slice(2))
const verbose = args.has('--verbose')
const opportunities = args.has('--opportunities') || verbose
const help = args.has('--help') || args.has('-h')

if (help) {
  console.log(`Usage:
  node scripts/ecc-check-update.js [--opportunities] [--verbose]

Environment:
  CLAUDE_BIN  Optional path to Claude CLI. Useful when claude is not on PATH.

Claude CLI lookup:
  1. CLAUDE_BIN
  2. PATH: claude, claude.cmd, claude.exe, claude.bat
  3. Common install paths for Windows, macOS, and Linux

Output:
  Default JSON: status, summary, diffs, analysisRequired, warnings, nextAction.
  --opportunities includes optional new ECC capabilities in diffs and analysisRequired.
  --verbose adds details for debugging and review.
`)
  process.exit(0)
}

const ORCH_PLUGIN_ID = 'orch-for-ecc@orch-for-ecc'
const ECC_PLUGIN_ID = 'ecc@ecc'

let ROOT = null
let BASELINE = null
let CAPABILITY_MAP = null
let SKILLS_DIR = null
let REQUIRED_PROJECT_FILES = []

function configureBaselineRoot(root) {
  ROOT = root
  BASELINE = path.join(ROOT, 'orchestration', 'ecc-baseline.md')
  CAPABILITY_MAP = path.join(ROOT, 'orchestration', 'ecc-capability-map.md')
  SKILLS_DIR = path.join(ROOT, 'skills')
  REQUIRED_PROJECT_FILES = [BASELINE, CAPABILITY_MAP]
}

function warning(code, message, hint) {
  return hint ? { code, message, hint } : { code, message }
}

function exists(file) {
  try {
    fs.accessSync(file, fs.constants.F_OK)
    return true
  } catch (_) {
    return false
  }
}

function isExecutableCandidate(file) {
  if (!exists(file)) return false
  if (process.platform === 'win32') return true
  try {
    fs.accessSync(file, fs.constants.X_OK)
    return true
  } catch (_) {
    return false
  }
}

function expandHome(file) {
  if (!file) return file
  if (file === '~') return os.homedir()
  if (file.startsWith(`~${path.sep}`) || file.startsWith('~/')) {
    return path.join(os.homedir(), file.slice(2))
  }
  return file
}

function pathCandidatesFromPath(names) {
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean)
  const candidates = []
  for (const dir of dirs) {
    for (const name of names) {
      candidates.push(path.join(dir, name))
    }
  }
  return candidates
}

function commonClaudeCandidates() {
  const home = os.homedir()
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming')
    const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local')
    return [
      path.join(appData, 'npm', 'claude.cmd'),
      path.join(appData, 'npm', 'claude.exe'),
      path.join(appData, 'npm', 'claude.bat'),
      path.join(localAppData, 'Programs', 'claude', 'claude.exe'),
    ]
  }
  if (process.platform === 'darwin') {
    return [
      '/opt/homebrew/bin/claude',
      '/usr/local/bin/claude',
      path.join(home, '.local', 'bin', 'claude'),
    ]
  }
  return [
    '/usr/local/bin/claude',
    '/usr/bin/claude',
    path.join(home, '.local', 'bin', 'claude'),
  ]
}

function findClaudeBin(warnings) {
  const envBin = process.env.CLAUDE_BIN && expandHome(process.env.CLAUDE_BIN)
  if (envBin) {
    if (isExecutableCandidate(envBin)) return envBin
    warnings.push(warning(
      'CLAUDE_BIN_INVALID',
      'CLAUDE_BIN points to a missing or non-executable file.',
      'Check CLAUDE_BIN. On Windows it can point to claude.cmd.'
    ))
  }

  const names = process.platform === 'win32'
    ? ['claude.cmd', 'claude.exe', 'claude.bat', 'claude']
    : ['claude']
  for (const candidate of pathCandidatesFromPath(names)) {
    if (isExecutableCandidate(candidate)) return candidate
  }
  for (const candidate of commonClaudeCandidates()) {
    if (isExecutableCandidate(candidate)) return candidate
  }

  warnings.push(warning(
    'CLAUDE_CLI_NOT_FOUND',
    'Could not find the claude CLI.',
    'Run from a shell where `claude plugin list --json` works, or set CLAUDE_BIN to claude / claude.cmd / claude.exe.'
  ))
  return null
}

function quoteCmdArg(value) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function runClaude(claudeBin, claudeArgs) {
  if (!claudeBin) {
    return { status: 127, stdout: '', stderr: 'claude CLI not found' }
  }

  let result
  if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(claudeBin)) {
    const commandLine = [quoteCmdArg(claudeBin), ...claudeArgs.map(quoteCmdArg)].join(' ')
    result = spawnSync(commandLine, {
      encoding: 'utf8',
      shell: true,
      windowsHide: true,
    })
  } else {
    result = spawnSync(claudeBin, claudeArgs, {
      encoding: 'utf8',
      windowsHide: true,
    })
  }
  return {
    status: typeof result.status === 'number' ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || (result.error ? String(result.error.message || result.error) : ''),
  }
}

function displayPath(file) {
  return ROOT ? path.relative(ROOT, file) : file
}

function readFile(file, warnings) {
  if (exists(file)) return fs.readFileSync(file, 'utf8')
  if (warnings) {
    warnings.push(warning(
      'ORCH_BASELINE_FILE_MISSING',
      `Missing orch-for-ecc baseline file: ${displayPath(file)}`
    ))
  }
  return ''
}

function listSkillFiles(warnings) {
  if (!exists(SKILLS_DIR)) {
    warnings.push(warning(
      'ORCH_SKILLS_DIR_MISSING',
      `Missing orch-for-ecc skills directory: ${displayPath(SKILLS_DIR)}`
    ))
    return []
  }
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(SKILLS_DIR, entry.name, 'SKILL.md'))
    .filter(exists)
    .sort()
}

function uniqueSorted(items) {
  return [...new Set(items)].sort()
}

function extractProjectRefs(warnings) {
  const texts = []
  for (const file of REQUIRED_PROJECT_FILES) texts.push(readFile(file, warnings))
  for (const file of listSkillFiles(warnings)) texts.push(readFile(file, warnings))
  const text = texts.join('\n')

  const skillCommands = uniqueSorted(text.match(/\/ecc:[A-Za-z0-9_-]+/g) || [])
  const agents = uniqueSorted(
    [...text.matchAll(/(?<![/@\w-])ecc:[A-Za-z0-9_-]+/g)]
      .map((match) => match[0])
      .filter((item) => item !== 'ecc:baseline')
  )
  return { skillCommands, agents }
}

function parseBaselineVersion(warnings) {
  const text = readFile(BASELINE, warnings)
  const match = text.match(/^version:\s*([^\n]+)$/m)
  if (!match) {
    warnings.push(warning(
      'BASELINE_VERSION_MISSING',
      'orchestration/ecc-baseline.md is missing the version field.'
    ))
    return null
  }
  return match[1].trim()
}

function splitComponentNames(raw) {
  return uniqueSorted(raw.split(/,|\n/).map((item) => item.trim()).filter(Boolean))
}

function parseComponentBlock(text, heading, stopHeadings) {
  const stops = stopHeadings.map((stop) => `\\n\\s+${escapeRegExp(stop)} \\(`).join('|')
  const regex = new RegExp(`${escapeRegExp(heading)} \\(\\d+\\)\\s+(.*?)(?:${stops}|\\Z)`, 's')
  const match = text.match(regex)
  return match ? splitComponentNames(match[1]) : []
}

function parseDetails(text, warnings) {
  const counts = {}
  for (const key of ['Skills', 'Agents', 'Hooks', 'MCP servers', 'LSP servers']) {
    const match = text.match(new RegExp(`${escapeRegExp(key)} \\((\\d+)\\)`))
    if (match) counts[key] = Number(match[1])
  }

  const skills = parseComponentBlock(text, 'Skills', ['Agents', 'Hooks', 'MCP servers', 'LSP servers'])
  const agents = parseComponentBlock(text, 'Agents', ['Hooks', 'MCP servers', 'LSP servers'])

  if (counts.Skills && !skills.length) {
    warnings.push(warning(
      'SKILLS_PARSE_FAILED',
      'Found Skills count but failed to parse installed skill names from plugin details.'
    ))
  }
  if (counts.Agents && !agents.length) {
    warnings.push(warning(
      'AGENTS_PARSE_FAILED',
      'Found Agents count but failed to parse installed agent names from plugin details.'
    ))
  }

  return { counts, skills, agents }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parsePluginList(stdout, warnings) {
  try {
    const plugins = JSON.parse(stdout)
    if (!Array.isArray(plugins)) {
      warnings.push(warning(
        'PLUGIN_LIST_SCHEMA_INVALID',
        'Expected `claude plugin list --json` output to be an array.'
      ))
      return { orchPlugin: null, eccPlugin: null }
    }

    const orchPlugin = plugins.find((item) => item && item.id === ORCH_PLUGIN_ID) || null
    const eccPlugin = plugins.find((item) => item && item.id === ECC_PLUGIN_ID) || null
    if (!orchPlugin) {
      warnings.push(warning(
        'ORCH_PLUGIN_NOT_FOUND',
        `${ORCH_PLUGIN_ID} was not found in \`claude plugin list --json\`.`,
        `Install or enable ${ORCH_PLUGIN_ID}; the baseline is read from its installPath.`
      ))
    } else if (!orchPlugin.installPath) {
      warnings.push(warning(
        'ORCH_PLUGIN_INSTALL_PATH_MISSING',
        `${ORCH_PLUGIN_ID} is missing installPath; cannot locate the orch-for-ecc baseline.`
      ))
    }
    if (!eccPlugin) {
      warnings.push(warning(
        'ECC_PLUGIN_NOT_FOUND',
        `${ECC_PLUGIN_ID} was not found in \`claude plugin list --json\`.`
      ))
    }
    return { orchPlugin, eccPlugin }
  } catch (error) {
    warnings.push(warning(
      'PLUGIN_LIST_JSON_PARSE_FAILED',
      'Failed to parse `claude plugin list --json` output as JSON.',
      String(error.message || error)
    ))
    return { orchPlugin: null, eccPlugin: null }
  }
}

function findMcpTemplateFile(plugin, warnings) {
  const installPath = plugin && plugin.installPath
  if (!installPath) {
    warnings.push(warning(
      'MCP_TEMPLATE_SOURCE_MISSING',
      'Missing installPath for ecc@ecc; cannot locate mcp-configs/mcp-servers.json.'
    ))
    return null
  }
  const file = path.join(installPath, 'mcp-configs', 'mcp-servers.json')
  if (!exists(file)) {
    warnings.push(warning(
      'MCP_TEMPLATE_SOURCE_MISSING',
      `Missing ECC MCP template file: ${file}`
    ))
    return null
  }
  return file
}

function parseMcpTemplateNames(plugin, warnings) {
  const file = findMcpTemplateFile(plugin, warnings)
  if (!file) return { source: null, names: [] }
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!data || typeof data.mcpServers !== 'object' || Array.isArray(data.mcpServers)) {
      warnings.push(warning(
        'MCP_TEMPLATE_SCHEMA_INVALID',
        'ECC MCP template JSON is missing object field: mcpServers.'
      ))
      return { source: file, names: [] }
    }
    return { source: file, names: uniqueSorted(Object.keys(data.mcpServers)) }
  } catch (error) {
    warnings.push(warning(
      'MCP_TEMPLATE_PARSE_FAILED',
      'Failed to parse ECC MCP template JSON.',
      String(error.message || error)
    ))
    return { source: file, names: [] }
  }
}

function parseProjectMcpTemplates(warnings) {
  const text = readFile(CAPABILITY_MAP, warnings)
  const match = text.match(/### 模板清单\s*([\s\S]*?)(?:\n## |\Z)/)
  if (!match) {
    warnings.push(warning(
      'CAPABILITY_MAP_MCP_SECTION_MISSING',
      'orchestration/ecc-capability-map.md is missing the MCP template list section.'
    ))
    return []
  }
  const names = []
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.trim().match(/^\| `([^`]+)` \|/)
    if (item) names.push(item[1])
  }
  return uniqueSorted(names)
}

function checkListAgainstInstalled(baselineItems, installedItems, kind, warnings) {
  if (!installedItems) {
    warnings.push(warning(
      `${kind}_CHECK_SKIPPED`,
      `Skipped ${kind.toLowerCase()} availability check because installed ECC ${kind.toLowerCase()} were not parsed.`
    ))
    return { status: 'UNKNOWN', missing: [] }
  }
  const installedSet = new Set(installedItems)
  const missing = baselineItems.filter((item) => {
    const name = item.startsWith('/ecc:') ? item.slice('/ecc:'.length) : item.replace(/^ecc:/, '')
    return !installedSet.has(name)
  })
  return { status: missing.length ? 'DIFF' : 'OK', missing }
}

function deriveOverallStatus(summary) {
  const values = [
    summary.version,
    summary.skillCommands,
    summary.agents,
    summary.mcpTemplates,
  ]
  if (values.includes('DIFF')) return 'DIFF'
  if (values.includes('UNKNOWN')) return 'UNKNOWN'
  return 'OK'
}

function summarizeList(items, sampleSize = 10) {
  return {
    count: items.length,
    sample: items.slice(0, sampleSize),
  }
}

function deriveAnalysisRequired(summary, diffs, includeOpportunities) {
  const required = []
  if (includeOpportunities && diffs.newSkillCommands.count) required.push('newSkillCommands')
  if (includeOpportunities && diffs.newAgents.count) required.push('newAgents')
  if (diffs.missingMcpTemplatesInMap.length || diffs.staleMcpTemplatesInMap.length) required.push('mcpTemplates')
  if (summary.version === 'DIFF') required.push('version')
  if (diffs.missingSkillCommands.length) required.push('missingSkillCommands')
  if (diffs.missingAgents.length) required.push('missingAgents')
  return uniqueSorted(required)
}

function deriveNextAction(status, analysisRequired, opportunityCounts, warnings = []) {
  const warningCodes = new Set(warnings.map((item) => item.code))
  const hasOpportunities = opportunityCounts.newSkillCommands || opportunityCounts.newAgents
  if (status === 'OK') {
    if (analysisRequired.includes('newAgents') || analysisRequired.includes('newSkillCommands')) {
      return 'The current ECC plugin is compatible with the orch-for-ecc baseline; optional new capabilities are listed for review. Analyze them only if you want to refresh the orch-for-ecc capability map.'
    }
    if (hasOpportunities) {
      return 'The current ECC plugin is compatible with the orch-for-ecc baseline; optional new capabilities are available. Run with --opportunities to review them.'
    }
    return 'The current ECC plugin matches the orch-for-ecc baseline and capability map; no update is required.'
  }
  if (status === 'UNKNOWN') {
    if (warningCodes.has('ORCH_PLUGIN_NOT_FOUND') || warningCodes.has('ORCH_PLUGIN_INSTALL_PATH_MISSING')) {
      return `The ${ORCH_PLUGIN_ID} plugin baseline is unavailable; install or enable ${ORCH_PLUGIN_ID}, then rerun this check.`
    }
    if (warningCodes.has('ECC_PLUGIN_NOT_FOUND')) {
      return `The ${ECC_PLUGIN_ID} plugin is unavailable; install or enable ${ECC_PLUGIN_ID}, then rerun this check.`
    }
    return 'The current environment information is incomplete; retry in an environment where the claude CLI is executable, or set CLAUDE_BIN.'
  }
  if (analysisRequired.includes('newAgents') || analysisRequired.includes('newSkillCommands')) {
    return 'New ECC capabilities or differences were found; ask Claude to analyze whether orch-for-ecc content should be replaced or optimized, then wait for user approval.'
  }
  return 'ECC differences affect the orch-for-ecc baseline; review the diff and generate an update plan for approval.'
}

function main() {
  const warnings = []
  const invocationCwd = process.cwd()
  const claudeBin = findClaudeBin(warnings)

  let orchPlugin = null
  let eccPlugin = null
  const listCmd = runClaude(claudeBin, ['plugin', 'list', '--json'])
  if (listCmd.status !== 0) {
    warnings.push(warning(
      'PLUGIN_LIST_FAILED',
      'Failed to run `claude plugin list --json`.',
      listCmd.stderr || 'No stderr output.'
    ))
  } else {
    const plugins = parsePluginList(listCmd.stdout, warnings)
    orchPlugin = plugins.orchPlugin
    eccPlugin = plugins.eccPlugin
  }

  let baselineVersion = null
  let orchSkillCommands = []
  let orchAgents = []
  let orchMcpTemplates = []
  const baselineAvailable = Boolean(orchPlugin && orchPlugin.installPath)
  if (baselineAvailable) {
    configureBaselineRoot(orchPlugin.installPath)
    baselineVersion = parseBaselineVersion(warnings)
    const refs = extractProjectRefs(warnings)
    orchSkillCommands = refs.skillCommands
    orchAgents = refs.agents
    orchMcpTemplates = parseProjectMcpTemplates(warnings)
  } else {
    warnings.push(warning(
      'ORCH_BASELINE_CHECK_SKIPPED',
      `Skipped orch-for-ecc baseline checks because ${ORCH_PLUGIN_ID} installPath was not available.`
    ))
  }

  let componentCounts = {}
  let installedSkillCommands = null
  let installedAgents = null
  if (eccPlugin) {
    const detailsCmd = runClaude(claudeBin, ['plugin', 'details', ECC_PLUGIN_ID])
    if (detailsCmd.status !== 0) {
      warnings.push(warning(
        'PLUGIN_DETAILS_FAILED',
        `Failed to run \`claude plugin details ${ECC_PLUGIN_ID}\`.`,
        detailsCmd.stderr || 'No stderr output.'
      ))
    } else {
      const details = parseDetails(detailsCmd.stdout, warnings)
      componentCounts = details.counts
      installedSkillCommands = details.skills
      installedAgents = details.agents
    }
  } else {
    warnings.push(warning(
      'PLUGIN_DETAILS_SKIPPED',
      `Skipped \`claude plugin details ${ECC_PLUGIN_ID}\` because ${ECC_PLUGIN_ID} was not found.`
    ))
  }

  const mcpTemplates = eccPlugin ? parseMcpTemplateNames(eccPlugin, warnings) : { source: null, names: [] }

  const skillCommandCheck = baselineAvailable
    ? checkListAgainstInstalled(orchSkillCommands, installedSkillCommands, 'SKILL_COMMANDS', warnings)
    : { status: 'UNKNOWN', missing: [] }
  const agentCheck = baselineAvailable
    ? checkListAgainstInstalled(orchAgents, installedAgents, 'AGENTS', warnings)
    : { status: 'UNKNOWN', missing: [] }

  const installedVersion = eccPlugin && eccPlugin.version ? eccPlugin.version : null
  let versionStatus = 'UNKNOWN'
  if (!installedVersion) {
    warnings.push(warning(
      'VERSION_CHECK_SKIPPED',
      'Skipped version diff because installed ECC version was not found.'
    ))
  } else if (!baselineAvailable) {
    versionStatus = 'UNKNOWN'
  } else {
    versionStatus = installedVersion === baselineVersion ? 'OK' : 'DIFF'
  }

  let mcpTemplateStatus = 'UNKNOWN'
  let missingMcpTemplatesInMap = []
  let staleMcpTemplatesInMap = []
  if (!baselineAvailable) {
    warnings.push(warning(
      'MCP_TEMPLATE_CHECK_SKIPPED',
      `Skipped MCP template diff because ${ORCH_PLUGIN_ID} baseline was not available.`
    ))
  } else if (!mcpTemplates.source) {
    warnings.push(warning(
      'MCP_TEMPLATE_CHECK_SKIPPED',
      'Skipped MCP template diff because ECC MCP template source was not found.'
    ))
  } else {
    missingMcpTemplatesInMap = mcpTemplates.names.filter((item) => !orchMcpTemplates.includes(item))
    staleMcpTemplatesInMap = orchMcpTemplates.filter((item) => !mcpTemplates.names.includes(item))
    mcpTemplateStatus = missingMcpTemplatesInMap.length || staleMcpTemplatesInMap.length ? 'DIFF' : 'OK'
  }

  let newCapabilitiesStatus = 'UNKNOWN'
  let newSkillCommands = []
  let newAgents = []
  if (installedSkillCommands && installedAgents) {
    const orchSkillCommandNames = new Set(orchSkillCommands.map((item) => item.slice('/ecc:'.length)))
    const orchAgentNames = new Set(orchAgents.map((item) => item.slice('ecc:'.length)))
    newSkillCommands = installedSkillCommands
      .filter((item) => !orchSkillCommandNames.has(item))
      .map((item) => `/ecc:${item}`)
    newAgents = installedAgents
      .filter((item) => !orchAgentNames.has(item))
      .map((item) => `ecc:${item}`)
    newCapabilitiesStatus = newSkillCommands.length || newAgents.length ? 'PRESENT' : 'OK'
  } else {
    warnings.push(warning(
      'NEW_CAPABILITY_CHECK_SKIPPED',
      'Skipped new capability check because installed ECC skills or agents were not parsed.'
    ))
  }

  const summary = {
    baselineVersion,
    installedVersion,
    version: versionStatus,
    skillCommands: skillCommandCheck.status,
    agents: agentCheck.status,
    mcpTemplates: mcpTemplateStatus,
    newCapabilities: newCapabilitiesStatus,
  }

  const diffs = {
    missingSkillCommands: skillCommandCheck.missing,
    missingAgents: agentCheck.missing,
    newSkillCommands: opportunities ? summarizeList(newSkillCommands) : summarizeList([]),
    newAgents: opportunities ? summarizeList(newAgents) : summarizeList([]),
    missingMcpTemplatesInMap,
    staleMcpTemplatesInMap,
  }

  const status = deriveOverallStatus(summary)
  const analysisRequired = deriveAnalysisRequired(summary, diffs, opportunities)

  const result = {
    status,
    summary,
    diffs,
    analysisRequired,
    warnings,
    nextAction: deriveNextAction(status, analysisRequired, {
      newSkillCommands: newSkillCommands.length,
      newAgents: newAgents.length,
    }, warnings),
  }

  if (verbose) {
    result.details = {
      claudeBin,
      plugin: eccPlugin,
      orchPlugin,
      baselineRoot: ROOT,
      invocationCwd,
      componentCounts,
      orchSkillCommands,
      orchAgents,
      installedSkillCommands,
      installedAgents,
      newSkillCommands,
      newAgents,
      mcpTemplateSource: mcpTemplates.source,
      mcpTemplateNames: mcpTemplates.names,
      orchMcpTemplates,
    }
  }

  console.log(JSON.stringify(result, null, 2))
}

main()
