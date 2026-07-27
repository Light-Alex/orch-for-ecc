#!/usr/bin/env node

const { findClaudeBin, warning } = require('./lib/claude-cli')
const { locatePlugin } = require('./lib/claude-plugin')

const rawArgs = process.argv.slice(2)
const args = new Set(rawArgs)
const help = args.has('--help') || args.has('-h')
const printInstallPath = args.has('--print-install-path')

function readOptionValue(name) {
  const index = rawArgs.indexOf(name)
  if (index === -1) return null
  const value = rawArgs[index + 1]
  return value && !value.startsWith('--') ? value : null
}

if (help) {
  console.log(`Usage:
  node scripts/locate-plugin.js --plugin-id <plugin-id> [--print-install-path]

Examples:
  node scripts/locate-plugin.js --plugin-id orch-for-ecc@orch-for-ecc
  node scripts/locate-plugin.js --plugin-id ecc@ecc
  node scripts/locate-plugin.js --plugin-id ecc@ecc --print-install-path

Notes:
  This script reads Claude plugin metadata from \`claude plugin list --json\`.
  It does not scan or guess paths under the Claude plugin cache.

Environment:
  CLAUDE_BIN  Optional path to Claude CLI. Useful when claude is not on PATH.
`)
  process.exit(0)
}

const pluginId = readOptionValue('--plugin-id')
const warnings = []

if (!pluginId) {
  warnings.push(warning(
    'PLUGIN_ID_REQUIRED',
    '--plugin-id requires a plugin id, for example ecc@ecc.'
  ))
}

const claudeBin = findClaudeBin(warnings)
const located = pluginId ? locatePlugin(claudeBin, pluginId, warnings) : { plugin: null, installPath: null }
const plugin = located.plugin
const status = plugin && plugin.installPath ? 'OK' : 'UNKNOWN'

if (printInstallPath) {
  if (status === 'OK') {
    console.log(plugin.installPath)
    process.exit(0)
  }
  console.error(JSON.stringify({ status, pluginId, warnings }, null, 2))
  process.exit(1)
}

console.log(JSON.stringify({
  status,
  pluginId,
  installPath: plugin && plugin.installPath ? plugin.installPath : null,
  version: plugin && plugin.version ? plugin.version : null,
  enabled: plugin && Object.prototype.hasOwnProperty.call(plugin, 'enabled') ? plugin.enabled : null,
  source: 'claude plugin list --json',
  warnings,
}, null, 2))

process.exit(status === 'OK' ? 0 : 1)
