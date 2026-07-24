# Plugin Manifest Schema Notes

This document records the Claude Code plugin manifest constraints that this plugin follows.

These notes are based on validator behavior and the working ECC plugin manifest structure.

---

## Summary

The Claude Code plugin validator is strict about manifest shape. Keep `.claude-plugin/plugin.json` explicit, conservative, and close to known-good manifests.

---

## Required Fields

### `version`

Always include a `version` field.

```json
{
  "version": "0.1.0"
}
```

---

## Component Field Shape

Use arrays for component paths, even when there is only one path.

```json
{
  "skills": ["./skills/"],
  "commands": ["./commands/"]
}
```

Avoid string shorthand such as:

```json
{
  "skills": "./skills",
  "commands": "./commands"
}
```

---

## Do Not Add Unsupported Fields

Do not add an `agents` field to `plugin.json`. Claude Code discovers supported plugin components by its own conventions, and unsupported manifest fields can fail validation with generic errors.

Do not add a standard `hooks` declaration unless the plugin intentionally ships additional hook files and validation confirms the shape. Standard hook discovery may be automatic in supported Claude Code versions.

---

## MCP Opt-Out

Keep the explicit empty MCP object unless this plugin intentionally ships Claude Code MCP servers:

```json
{
  "mcpServers": {}
}
```

This makes the manifest behavior explicit and avoids accidental MCP auto-discovery if MCP files are added later.

---

## Current Known-Good Shape

```json
{
  "name": "orch-for-ecc",
  "version": "0.1.0",
  "mcpServers": {},
  "skills": ["./skills/"],
  "commands": ["./commands/"]
}
```

---

## Validation

After editing manifests, run:

```bash
claude plugin validate .claude-plugin/plugin.json --strict
claude plugin validate . --strict
```
