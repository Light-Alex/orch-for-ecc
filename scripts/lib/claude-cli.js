const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

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

module.exports = {
  exists,
  findClaudeBin,
  runClaude,
  warning,
}
