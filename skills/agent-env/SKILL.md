---
name: agent-env
description: Agent 环境初始化；根据 diagnosis.md 和 ECC 插件配置项，探测并初始化当前业务项目的项目级 Agent 环境。
disable-model-invocation: true
argument-hint: "[diagnosis.md 路径]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: agent-environment
  requires: [task-triage]
  capabilityMap: ${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md
---
# Agent 环境初始化

> 触发方式：仅当用户输入 `/agent-env` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

根据已确认的 `diagnosis.md` 和 `ecc` 插件配置项，探测当前业务项目的 Agent 环境，生成简洁的 `agent-environment.md`，并在用户批准后初始化项目级 Agent 环境。

批准 `agent-environment.md` 即授权本 skill 按方案修改当前业务项目内的：

- `.claude/settings.local.json`
- `.mcp.json`

不修改用户级配置，不修改 shell profile，不处理凭证，不执行业务实现。

## 输入前提

- 已有用户确认过的 `diagnosis.md`，或用户在本次输入中提供了等价分诊信息。
- 能确认当前业务项目根目录。
- 能确认 `ecc@ecc` 插件配置项，或能明确说明缺失项。

如果缺少 `diagnosis.md`、业务项目根目录不明确，或分诊信息不足，应停止并列出缺失项；不要猜测初始化。

## 工作流程

1. 定位当前业务项目根目录。
2. 读取并核对 `diagnosis.md`。
3. 探测当前业务项目的 Agent 环境。
4. 根据 `diagnosis.md` 和 ECC 插件配置项生成 `agent-environment.md` 草案。
5. 让用户确认草案；如用户要求修改，先更新草案再重新确认。
6. 用户批准后，按草案写入项目级配置：
   - `.claude/settings.local.json`
   - `.mcp.json`
7. 输出“初始化结果记录”。

未获得用户批准前，只输出草案，不写入 `.claude/settings.local.json` 或 `.mcp.json`。

## 当前业务项目 Agent 环境探测

生成 `agent-environment.md` 前，必须先探测当前业务项目的 Agent 环境，并把探测结果作为初始化建议的事实来源。

### 探测范围

- 业务项目根目录：优先使用用户提供路径；否则使用当前 Claude Code 工作目录。如果当前目录是 `orch-for-ecc` 插件仓库或其他工具仓库，应要求用户提供业务项目路径。
- 分诊文件：读取当前任务对应的 `diagnosis.md`。
- 现有 Claude 项目配置：检查 `.claude/settings.local.json`、`.claude/settings.json`、`.claude/agents/`、`.claude/commands/`、`.claude/skills/`、`.claude/hooks/`、`.claude/rules/`、`.claude/runs/` 是否存在；只记录与本次初始化相关的事实。
- 现有 MCP 配置：检查项目根目录 `.mcp.json`；记录 MCP server 名称、用途和是否疑似需要凭证。
- 项目技术栈与验证入口：识别包管理器、主要语言/框架、build/test/lint/typecheck 脚本和必要项目说明；避免大范围加载源码。
- ECC 插件配置项：从 `ecc@ecc.installPath` 定位 `ecc@ecc` 插件根目录；在给出任何 ECC 配置建议前，必须读取 ECC README 或等价配置说明中的运行时配置项，完整盘点当前版本可用的 ECC 配置项，再结合 `diagnosis.md` 和项目事实选择建议值。

### 探测边界

- 不通过扫描 `~/.claude/plugins/cache/**/README.md` 定位插件目录。
- 不读取、不记录、不补全 token、API key、secret 或其他凭证。
- 不覆盖已有项目级 agents、commands、skills、hooks、rules；如建议变更，只写入待确认项。
- 不把不存在或未确认可用的 `/ecc:*` 指令、Agent 或 MCP 写成硬依赖。
- 不得只因为 `diagnosis.md` 提到某个 ECC 配置项就直接写入；必须先确认当前 `ecc@ecc` 版本支持该配置项，并说明为什么只写入它而不写入其他相关配置项。

### 探测失败处理

出现以下情况时，停止在草案阶段，并要求用户补充或确认：

- 业务项目根目录不明确。
- 找不到或无法确认 `diagnosis.md`。
- `diagnosis.md` 内容不足以决定环境建议。
- 尚未完整盘点当前 `ecc@ecc` 版本的运行时配置项，或无法确认某个建议配置项是否受支持。
- `.claude/settings.local.json` 或 `.mcp.json` 与建议值存在明显冲突。
- MCP 涉及凭证或外部系统，无法安全自动写入。
- ECC 插件路径或配置项无法确认。

## 初始化配置范围

### `.claude/settings.local.json`

用于当前业务项目的 Claude Code 项目级设置。只写入 `agent-environment.md` 中已批准的建议值。

可包含但不限于：

- 与当前任务相关的项目级环境变量建议。
- 与当前任务相关的 Agent / hooks / permission / runtime 设置。
- 与当前技术栈相关的验证入口提示。

写入 ECC 运行时配置前，必须完成配置项盘点：

- 先列出当前 `ecc@ecc` 版本支持的相关配置项，例如 hook profile、session start、retention、instinct、context monitor、MCP 过滤、agent data home 等类别。
- 再说明本次建议写入哪些项、建议值是什么、依据是什么。
- 对未写入但相关的配置项，必须简要说明不写入原因，例如“不相关”“保持默认”“缺少需求依据”“涉及凭证/外部系统”。

不得写入用户级 `~/.claude/settings.json`，不得修改全局环境变量或 shell profile。

### `.mcp.json`

用于当前业务项目的项目级 MCP 配置。只写入当前任务必要的 MCP server。

要求：

- 复用已有可用 MCP 配置，避免重复 server。
- 新增 MCP 时优先使用环境变量引用凭证，而不是明文值。
- 涉及外部系统、私有仓库、浏览器、云服务或凭证保护资源时，必须在草案中列为“需要用户确认”。
- 不读取、不生成、不保存凭证。

## `agent-environment.md` 输出格式

````markdown
# Agent 环境初始化方案

## 输入摘要

- 业务项目：`<path>`
- 分诊文件：`<path/to/diagnosis.md>`
- 任务场景：`<mvp-build / feature-add / feature-change / refactor-safe / migrate-safe / bug-fix / mixed>`
- 风险等级：`<S / M / L / XL>`
- 主要目标：`<目标>`
- 验收标准：`<验收标准>`

## 当前 Agent 环境探测结果

### 项目环境

- 项目根目录：`<path>`
- 分诊文件：`<path/to/diagnosis.md>`
- 技术栈：`<language / framework / package manager>`
- 验证入口：`<build / test / lint / typecheck 命令；没有则写“未发现”>`

### 现有 Agent 配置

- Claude 项目配置：`.claude/settings.local.json` `<存在 / 不存在 / 需更新>`
- MCP 配置：`.mcp.json` `<存在 / 不存在 / 需更新>`
- 项目级 Agents / Commands / Skills：`<存在 / 不存在 / 不相关>`
- Hooks / Rules：`<存在 / 不存在 / 不改动>`

### 初始化判断

- 建议写入：`<.claude/settings.local.json / .mcp.json / 无>`
- 保留不动：`<已有配置或不相关项>`
- 需要用户确认：`<无 / 具体问题>`

## ECC 配置依据

- ecc 插件根目录：`<path / 未确认>`
- 使用的 ECC 配置说明：`<README / runtime controls / 其他>`
- 已盘点的 ECC 配置项：`<当前 ecc@ecc 版本支持的相关配置项清单>`
- 可用 ECC 能力：`<与本任务相关的 /ecc:* 指令或 ecc:* Agent；没有则写“无”>`

## ECC 配置选择

### 建议写入

- `<配置项>`：`<建议值>`；依据：`<diagnosis.md / ECC 配置说明 / 项目事实>`

### 不写入

- `<配置项>`：`<不相关 / 保持默认 / 缺少需求依据 / 涉及凭证或外部系统 / 其他原因>`

## 建议写入 `.claude/settings.local.json`

```json
{
  "<key>": "<value>"
}
```

说明：

- `<为什么需要这些项目级设置>`
- `<与 diagnosis.md 或 ECC 配置项的对应关系>`

## 建议写入 `.mcp.json`

```json
{
  "mcpServers": {
    "<server-name>": {
      "command": "<command>",
      "args": ["<arg>"],
      "env": {
        "<TOKEN_NAME>": "${ENV_VAR_NAME}"
      }
    }
  }
}
```

说明：

- `<为什么当前任务需要这些 MCP>`
- `<是否涉及外部系统或凭证>`

## 不建议改动

- `<已有配置或不相关项>`：`<原因>`

## 批准后执行动作

1. 写入或更新 `.claude/settings.local.json`。
2. 写入或更新 `.mcp.json`。
3. 输出初始化结果记录。

## 初始化结果记录

- 已写入：`<文件和关键项>`
- 已保留：`<未改动项>`
- 未执行：`<原因>`
- 后续约束：`<后续 task-docs / 实现 / 验证必须继承的约束>`

````

- 展示 `agent-environment.md` 草案后，必须让用户明确批准，才能写入 `.claude/settings.local.json` 和 `.mcp.json`。
- 用户回答问题、提供补充信息、说“继续看看”等，不等于批准写入。
- 如用户要求修改草案，先更新草案，再重新请求批准。
- 用户批准后，应按草案自动完成项目级 Agent 环境初始化，不再重复询问“是否自动设置”。
- 如果批准后执行时发现草案之外的新风险，应停止并请求用户确认。

## 运行文档

用户批准最终草案后，自动写入：

```text
.claude/runs/<date>-<task-slug>/agent-environment.md
```

日期使用 ISO 格式，例如 `2026-07-28`。

写入运行文档后，立即按批准方案初始化当前业务项目 Agent 环境，并输出“初始化结果记录”。

未完成初始化结果记录前，不进入 `/orch-for-ecc:task-docs` 或业务实现。
