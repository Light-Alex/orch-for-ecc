const { runClaude, warning } = require('./claude-cli')

const ORCH_PLUGIN_ID = 'orch-for-ecc@orch-for-ecc'
const ECC_PLUGIN_ID = 'ecc@ecc'

function parsePluginList(stdout, warnings) {
  try {
    const plugins = JSON.parse(stdout)
    if (!Array.isArray(plugins)) {
      warnings.push(warning(
        'PLUGIN_LIST_SCHEMA_INVALID',
        'Expected `claude plugin list --json` output to be an array.'
      ))
      return []
    }
    return plugins
  } catch (error) {
    warnings.push(warning(
      'PLUGIN_LIST_JSON_PARSE_FAILED',
      'Failed to parse `claude plugin list --json` output as JSON.',
      String(error.message || error)
    ))
    return []
  }
}

function findPluginById(plugins, pluginId) {
  return plugins.find((item) => item && item.id === pluginId) || null
}

function requirePluginInstallPath(plugin, pluginId, warnings, options = {}) {
  const code = options.code || 'PLUGIN_INSTALL_PATH_MISSING'
  if (plugin && plugin.installPath) return plugin.installPath
  warnings.push(warning(
    code,
    `${pluginId} is missing installPath; cannot locate the plugin root.`
  ))
  return null
}

function listPlugins(claudeBin, warnings) {
  const listCmd = runClaude(claudeBin, ['plugin', 'list', '--json'])
  if (listCmd.status !== 0) {
    warnings.push(warning(
      'PLUGIN_LIST_FAILED',
      'Failed to run `claude plugin list --json`.',
      listCmd.stderr || 'No stderr output.'
    ))
    return { status: listCmd.status, plugins: [], stdout: listCmd.stdout, stderr: listCmd.stderr }
  }
  return { status: 0, plugins: parsePluginList(listCmd.stdout, warnings), stdout: listCmd.stdout, stderr: listCmd.stderr }
}

function locatePlugin(claudeBin, pluginId, warnings) {
  const listed = listPlugins(claudeBin, warnings)
  const plugin = findPluginById(listed.plugins, pluginId)
  if (!plugin) {
    warnings.push(warning(
      'PLUGIN_NOT_FOUND',
      `${pluginId} was not found in \`claude plugin list --json\`.`
    ))
  }
  return {
    status: listed.status,
    plugin,
    installPath: plugin && plugin.installPath ? plugin.installPath : null,
  }
}

module.exports = {
  ORCH_PLUGIN_ID,
  ECC_PLUGIN_ID,
  findPluginById,
  listPlugins,
  locatePlugin,
  parsePluginList,
  requirePluginInstallPath,
}
