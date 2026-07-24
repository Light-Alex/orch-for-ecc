### Plugin Manifest Notes

This directory contains the Claude Code plugin and marketplace manifests for `orch-for-ecc`.

Before editing `.claude-plugin/plugin.json`, review `.claude-plugin/PLUGIN_SCHEMA_NOTES.md`. The Claude Code plugin validator is strict about manifest shape: component paths such as `skills` and `commands` should be arrays, `version` should be present, and unsupported fields such as `agents` should not be added.

### Local Validation

Run validation after manifest changes:

```bash
claude plugin validate .claude-plugin/plugin.json --strict
claude plugin validate . --strict
```

### Local Loading

From the repository root:

```bash
claude --plugin-dir .
```
