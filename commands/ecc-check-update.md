---
description: 检查当前安装的 ECC 插件是否与 orch-for-ecc 插件内置基线兼容；兼容则报告无需更新，不兼容则列出差异并生成等待审批的 update 计划。
metadata:
  language: zh-CN
  scope: project
  role: maintenance-command
  triggerMode: explicit-only
---
# ECC 检查更新

> 触发方式：仅当用户输入 `/ecc-check-update` 或明确要求执行本 command 时使用。
> 作为插件安装后，命令入口为 `/orch-for-ecc:ecc-check-update`。
> 默认只检查和生成刷新计划；写入 orch-for-ecc 插件配套文件前必须先让用户确认。

## 用途

检查当前环境安装的 `ecc@ecc` 插件信息是否与当前安装的 `orch-for-ecc@orch-for-ecc` 插件内置 ECC 基线一致。

本 command 维护 `orch-for-ecc@orch-for-ecc` 插件内置基线：

- `orchestration/ecc-baseline.md`
- `orchestration/ecc-capability-map.md`
- 必要时同步检查 `skills/*/SKILL.md`

## 执行流程

1. 选择运行模式：
   - 如果当前工作目录是 orch-for-ecc 源码仓库（存在 `.claude-plugin/plugin.json` 且 `name` 为 `orch-for-ecc`），直接使用源码开发模式：`node scripts/ecc-check-update.js --source-root .`。
   - 否则使用默认插件模式，通过已安装 `orch-for-ecc@orch-for-ecc` 插件目录下的 `scripts/ecc-check-update.js` 启动检查。
2. 查询当前环境 ECC 插件（由脚本按 Claude CLI 查找规则执行，不在 command 外层直接调用裸 `claude`）：
   - `claude plugin list --json`
   - `claude plugin details ecc@ecc`
3. 定位 `orch-for-ecc@orch-for-ecc` 插件安装目录：
   - 默认插件模式由 `scripts/ecc-check-update.js` 按 `CLAUDE_BIN` / `PATH` / 常见安装路径查找 Claude CLI，再从 `claude plugin list --json` 读取 `orch-for-ecc@orch-for-ecc.installPath`
   - 源码开发模式必须显式传入 `--source-root <path>`
4. 读取 orch-for-ecc 内置基线：
   - `orchestration/ecc-baseline.md`
5. 读取 orch-for-ecc 内置能力映射：
   - `orchestration/ecc-capability-map.md`
6. 按需扫描 orch-for-ecc 入口 skill：
   - `skills/*/SKILL.md`
7. 对比：
   - ECC 插件版本。
   - `/ecc:*` 指令是否可在当前 ECC skills / commands 中找到对应能力。
   - `ecc:*` Agent 是否可在当前 ECC agents 中找到对应能力。
   - 当前环境 ECC `mcp-configs/mcp-servers.json` 是否与 orch-for-ecc 内置 `orchestration/ecc-capability-map.md` 中的 MCP 配置模板清单一致.
8. 输出检查结论：
   - 如果兼容：报告当前环境 ECC 与 orch-for-ecc 基线兼容，无需更新。
   - 如果不兼容：报告不兼容，列出差异点，并生成 update 计划。
   - 如果仅发现新增能力：作为可选升级机会处理，不默认生成 update 计划。
9. 等待用户审批：用户批准前不写入 orch-for-ecc 插件配套文件。

## 插件根目录定位

用户正常执行 `/orch-for-ecc:ecc-check-update` 时，默认是插件运行模式：必须通过 `claude plugin list --json` 定位 `orch-for-ecc@orch-for-ecc.installPath`，并从该安装目录读取本插件内置基线；不要把当前工作目录或目标业务项目相对路径当作 orch-for-ecc 根目录。

维护本源码仓库时才使用源码开发模式，并显式传入：

```bash
node scripts/ecc-check-update.js --source-root .
```

需要读取 `ecc@ecc` 内置文件时，必须通过同一份插件元数据定位 `ecc@ecc.installPath`，例如：

- `ecc@ecc.installPath/README.md`
- `ecc@ecc.installPath/mcp-configs/mcp-servers.json`

不要扫描或猜测 `~/.claude/plugins/cache/**/README.md`。脚本化定位可使用：

```bash
node "<orch-for-ecc installPath>/scripts/locate-plugin.js" --plugin-id orch-for-ecc@orch-for-ecc
node "<orch-for-ecc installPath>/scripts/locate-plugin.js" --plugin-id ecc@ecc
```

## 只读检查脚本

优先使用命令和脚本收集事实，不手工猜测。默认模式下，`scripts/ecc-check-update.js` 先按内置规则查找 Claude CLI，再通过 `claude plugin list --json` 定位 `orch-for-ecc@orch-for-ecc.installPath` 作为基线来源，读取该插件安装目录下的 `orchestration/` 和 `skills/`；当前工作目录只表示命令触发位置，不作为基线来源。

orch-for-ecc 项目开发者如需检查并准备更新当前源码仓库，必须显式使用 `--source-root <path>`。不要隐式依赖当前工作目录作为源码根目录。

默认插件模式不要从当前工作目录运行 `node scripts/ecc-check-update.js`。作为插件 command 执行时，优先使用已安装 `orch-for-ecc@orch-for-ecc` 插件目录下的 `scripts/ecc-check-update.js`；该脚本会自行查找 Claude CLI、解析 `orch-for-ecc@orch-for-ecc.installPath`，再读取安装目录下的基线文件。源码开发模式必须显式传入 `--source-root`。

不要在 command 外层使用 `execFileSync('claude', ...)` 或硬编码/猜测 Claude 插件缓存路径来 bootstrap；如果脚本无法定位 Claude CLI 或插件安装目录，应输出 `UNKNOWN` 报告并提示设置 `CLAUDE_BIN` 或启用源码开发模式。

```bash
node "<orch-for-ecc installPath>/scripts/ecc-check-update.js"
```

如果当前 shell 中 `claude` 不在 `PATH`，但已知 Claude CLI 位置，可以显式传入：

```bash
CLAUDE_BIN="/path/to/claude" node "<orch-for-ecc installPath>/scripts/ecc-check-update.js"
```

源码开发模式用于维护本仓库内容：

```bash
node scripts/ecc-check-update.js --source-root .
```

如需主动查看当前 ECC 中存在但项目尚未采用的新能力，可使用：

```bash
node "<orch-for-ecc installPath>/scripts/ecc-check-update.js" --opportunities
# 或源码开发模式：node scripts/ecc-check-update.js --source-root . --opportunities
```

如需排查脚本解析细节，可使用：

```bash
node "<orch-for-ecc installPath>/scripts/ecc-check-update.js" --verbose
# 或源码开发模式：node scripts/ecc-check-update.js --source-root . --verbose
```

查看脚本用法和 Claude CLI 查找规则：

```bash
node "<orch-for-ecc installPath>/scripts/ecc-check-update.js" --help
```

## 脚本输出字段

默认脚本输出为精简 JSON，用于判断是否需要继续分析或生成 update 计划。

| 字段 | 含义 |
| --- | --- |
| `status` | 总体状态：`OK` 表示兼容或一致，`DIFF` 表示 orch-for-ecc 基线受到差异影响，`UNKNOWN` 表示当前环境信息不足。仅发现新增能力时默认仍为 `OK`。 |
| `summary.baselineVersion` | 默认来自 `orch-for-ecc@orch-for-ecc.installPath/orchestration/ecc-baseline.md`；源码开发模式来自 `--source-root <path>/orchestration/ecc-baseline.md`。 |
| `summary.installedVersion` | 当前环境安装的 ECC 版本；无法取得时为 `null`。 |
| `summary.version` | 版本检查状态：`OK` / `DIFF` / `UNKNOWN`。 |
| `summary.skillCommands` | orch-for-ecc 引用的 `/ecc:*` 指令可用性检查状态。 |
| `summary.agents` | orch-for-ecc 引用的 `ecc:*` Agent 可用性检查状态。 |
| `summary.mcpTemplates` | ECC MCP 配置模板清单同步状态。 |
| `summary.newCapabilities` | 是否发现当前 ECC 中存在但 orch-for-ecc 能力映射尚未采用的新 `/ecc:*` 指令或 `ecc:*` Agent。 |
| `diffs.missingSkillCommands` | orch-for-ecc 引用但当前 ECC 未找到的 `/ecc:*` 指令。 |
| `diffs.missingAgents` | orch-for-ecc 引用但当前 ECC 未找到的 `ecc:*` Agent。 |
| `diffs.newSkillCommands.count` | 当前 ECC 中存在但 orch-for-ecc 尚未采用的新 `/ecc:*` 指令数量；默认模式为 `0`，使用 `--opportunities` 或 `--verbose` 时展示。 |
| `diffs.newSkillCommands.sample` | 新 `/ecc:*` 指令样例；完整列表只在 `--verbose` 输出中显示。 |
| `diffs.newAgents.count` | 当前 ECC 中存在但 orch-for-ecc 尚未采用的新 `ecc:*` Agent 数量；默认模式为 `0`，使用 `--opportunities` 或 `--verbose` 时展示。 |
| `diffs.newAgents.sample` | 新 `ecc:*` Agent 样例；完整列表只在 `--verbose` 输出中显示。 |
| `diffs.missingMcpTemplatesInMap` | 当前 ECC 模板文件有、orch-for-ecc MCP 模板参考区缺失的模板。 |
| `diffs.staleMcpTemplatesInMap` | orch-for-ecc MCP 模板参考区有、当前 ECC 模板文件已不存在的模板。 |
| `analysisRequired` | 需要 Claude 进行语义分析的差异类型，例如 `mcpTemplates`、`version`、`missingSkillCommands`。`newSkillCommands` / `newAgents` 仅在使用 `--opportunities` 或 `--verbose` 时纳入。 |
| `warnings` | 结构化告警列表，说明环境问题、解析失败或跳过原因。 |
| `warnings[].code` | 告警代码，例如 `CLAUDE_CLI_NOT_FOUND`、`PLUGIN_LIST_FAILED`。 |
| `warnings[].message` | 告警说明。 |
| `warnings[].hint` | 可选处理建议或底层错误信息。 |
| `nextAction` | 下一步建议。 |

`--opportunities` 会展示当前 ECC 中存在但 orch-for-ecc 尚未采用的新 `/ecc:*` 指令和 `ecc:*` Agent，并把它们加入 `analysisRequired`。这些新增能力默认只代表可选升级机会，不影响 `status`。

`--verbose` 会额外输出 `details`，包括完整 plugin 对象、组件数量、orch-for-ecc 引用清单、已安装能力清单、MCP 模板来源和完整模板清单。默认输出不展示这些细节，避免噪音和本机路径泄露。

## Claude CLI 查找

`scripts/ecc-check-update.js` 按以下顺序查找 Claude CLI：

1. `CLAUDE_BIN` 环境变量。
2. 当前 `PATH` 中的 `claude` / `claude.cmd` / `claude.exe` / `claude.bat`。
3. Windows、macOS、Linux 的少量常见安装路径。

如果输出 `status: UNKNOWN` 且 warning code 为 `CLAUDE_CLI_NOT_FOUND`、`PLUGIN_LIST_FAILED` 或 `PLUGIN_DETAILS_FAILED`，请先确认当前 shell 能直接运行：

```bash
claude plugin list --json
```

也可以显式指定 Claude CLI：

```bash
CLAUDE_BIN="/path/to/claude" node "<orch-for-ecc installPath>/scripts/ecc-check-update.js"
```

Windows PowerShell 示例：

```powershell
$env:CLAUDE_BIN="C:\Users\<user>\AppData\Roaming\npm\claude.cmd"
node "<orch-for-ecc installPath>/scripts/ecc-check-update.js"
```

## 升级机会分析

当脚本发现 `summary.newCapabilities: PRESENT`，或 `analysisRequired` 包含 `newSkillCommands` / `newAgents` 时，不要直接把所有新增能力写入 orch-for-ecc 能力映射。应由 Claude 基于当前入口 skill 的职责做语义分析：

| 维度 | 需要判断的问题 |
| --- | --- |
| 场景匹配 | 新能力是否对应 `/task-triage`、`/agent-env`、`/task-docs`、`/mvp-build`、`/feature-add`、`/feature-change`、`/refactor-safe`、`/migrate-safe`、`/bug-fix` 的某个阶段？ |
| 替换价值 | 是否比当前推荐能力更准确、更强或风险更低？ |
| 增强价值 | 是否适合作为可选能力或 Plan B，而不是替换现有能力？ |
| 副作用 | 是否引入写入、外部服务、凭证、生产数据或不可逆风险？ |
| 稳定性 | 是否需要先观察、试用或阅读 ECC 文档，而不是立即采用？ |
| 文档影响 | 是否需要更新 `orchestration/ecc-capability-map.md` 或某个入口 skill？ |

分析结果建议分为：

| 类型 | 含义 | 处理方式 |
| --- | --- | --- |
| `replace-candidate` | 可能替换现有推荐能力。 | 生成待审批替换建议。 |
| `enhancement-candidate` | 可增强某阶段，但不完全替代旧能力。 | 建议加入可选能力或 Plan B。 |
| `observe-only` | 可能有用但语义或稳定性不足。 | 暂不写入主流程，只记录观察。 |
| `not-relevant` | 与 orch-for-ecc 编排场景无关或副作用过大。 | 不采用。 |

## 检查报告模板

### 一致时

```markdown
# ECC 检查结果

## 结论

当前环境 ECC 与 orch-for-ecc 基线一致，无需更新。

## 当前环境

- ECC 插件：`ecc@ecc`
- 当前版本：`<installed-version>`
- 基线版本：`<baseline-version>`
- 状态：`enabled: <true|false>`

## 校验结果

- `/ecc:*` 指令：无缺失
- `ecc:*` Agent：无缺失
- MCP 配置模板清单：一致
- 关注组件摘要：仅作信息参考

## 下一步

无需操作。
```

### 兼容但有可选升级机会时

```markdown
# ECC 检查结果

## 结论

当前环境 ECC 与 orch-for-ecc 基线兼容，无需立即更新。

## 当前环境

- ECC 插件：`ecc@ecc`
- 当前版本：`<installed-version>`
- 基线版本：`<baseline-version>`
- 状态：`enabled: <true|false>`

## 校验结果

- `/ecc:*` 指令：无缺失
- `ecc:*` Agent：无缺失
- MCP 配置模板清单：一致
- 新增能力：仅作为可选升级机会，不影响当前编排流程

## 下一步

无需操作。如需维护 orch-for-ecc 能力映射，可使用已定位的 `orch-for-ecc@orch-for-ecc.installPath` 运行 `scripts/ecc-check-update.js --opportunities`；源码开发模式可运行 `node scripts/ecc-check-update.js --source-root . --opportunities` 后再做升级机会分析。
```

### 不兼容时

```markdown
# ECC 检查结果

## 结论

当前环境 ECC 与 orch-for-ecc 基线不兼容，需要审批后更新。

## 当前环境

- ECC 插件：`ecc@ecc`
- 当前版本：`<installed-version>`
- 基线版本：`<baseline-version>`
- 状态：`enabled: <true|false>`

## 差异点

| 类型 | 基线 / orch-for-ecc 引用 | 当前环境 | 影响 |
| --- | --- | --- | --- |
| 版本 | `<baseline-version>` | `<installed-version>` | 需要刷新基线 |
| `/ecc:*` 指令 | `<orch-command>` | 缺失 / 改名候选 | 需要确认替代能力 |
| `ecc:*` Agent | `<orch-agent>` | 缺失 / 改名候选 | 需要确认替代 Agent |
| MCP 配置模板清单 | `ecc-capability-map.md` 中记录的模板 | `mcp-configs/mcp-servers.json` | 需要刷新 MCP 模板参考区 |
| 关注组件 | `<baseline-summary>` | `<current-summary>` | 仅作信息参考 |

## 新增能力

| 类型 | 数量 | 样例 | 是否需要分析 |
| --- | ---: | --- | --- |
| `/ecc:*` 指令 | `<count>` | `<sample>` | 是 / 否 |
| `ecc:*` Agent | `<count>` | `<sample>` | 是 / 否 |

## 升级机会分析

| 目标 | 当前能力 | 候选能力 | 建议 | 理由 | 风险 |
| --- | --- | --- | --- | --- | --- |
| `<skill-or-stage>` | `<current>` | `<candidate>` | `replace-candidate / enhancement-candidate / observe-only / not-relevant` | `<reason>` | `<risk>` |

## Update 计划

1. 更新 `orchestration/ecc-baseline.md` 的 ECC 插件版本基线。
2. 检查并更新 `orchestration/ecc-capability-map.md` 中缺失、改名或不适用的 `/ecc:*` 指令和 `ecc:*` Agent。
3. 如果 ECC MCP 配置模板清单不一致，以当前环境 `mcp-configs/mcp-servers.json` 为准，刷新 `orchestration/ecc-capability-map.md` 的 MCP 配置模板参考区。
4. 必要时更新 `skills/*/SKILL.md` 的推荐能力引用。
5. 重新验证文档路径、能力引用和 Markdown 格式。

## 等待审批

请确认是否按以上 update 计划刷新 orch-for-ecc 插件配套内容。用户审批前不写入 orch-for-ecc 插件配套文件。
```

## MCP 配置模板检查边界

本 command 会检查 ECC 插件目录中的 `mcp-configs/mcp-servers.json` 与 `orchestration/ecc-capability-map.md` 中 “MCP 配置模板参考” 的模板清单是否一致。

该检查只用于维护 orch-for-ecc 文档中的模板参考区，不代表当前环境已经启用这些 MCP。

本 command 不会：

- 检查 Claude Code settings 中是否已配置某个 MCP。
- 自动复制 MCP 配置模板。
- 自动启用或禁用 MCP。
- 读取、写入或生成 secrets、token、API key、登录态或生产敏感数据。

## 不一致时的处理原则

1. 以当前环境安装的 ECC 插件为事实来源。
2. 先输出差异点、升级机会分析和 update 计划，不直接写入。
3. 不自动删除 orch-for-ecc 能力映射中的能力；缺失能力可能是解析缺口、插件未启用、命令改名或当前环境异常。
4. 不自动把 ECC 新增的所有 `/ecc:*` 指令或 `ecc:*` Agent 加入 orch-for-ecc 能力映射；新增能力默认只作为可选升级机会，必须先按场景匹配、替换价值、增强价值、副作用和稳定性分析。
5. 只有确认更适合当前入口 skill 的新增能力，才生成待审批替换或增强建议。
6. MCP 配置模板清单以当前环境 `mcp-configs/mcp-servers.json` 为准；若不一致，只刷新 `ecc-capability-map.md` 中的模板参考区。
7. 对疑似改名的能力，只输出候选替代，不自动替换。
8. 用户审批前不写入 orch-for-ecc 插件配套文件。
9. 写入前必须确认影响文件和具体改动。

## 用户审批后的可写入范围

用户确认后，允许按确认范围更新 orch-for-ecc 插件配套文件：

- `orchestration/ecc-baseline.md`
- `orchestration/ecc-capability-map.md`
- `skills/*/SKILL.md`
- `orchestration/README.md`

禁止自动修改：

- `.claude/commands/`
- 全局 ECC 插件目录
- Claude Code settings / hooks / MCP 配置
- secrets、token、凭证或生产敏感数据

## 验证

刷新后至少检查：

1. `orchestration/ecc-baseline.md` 版本与 `claude plugin list --json` 中 `ecc@ecc.version` 一致。
2. `orchestration/ecc-baseline.md` 没有保存 ECC 全量组件清单、MCP 模板清单或当前启用 MCP 摘要。
3. `orchestration/ecc-capability-map.md` 中推荐的 `/ecc:*` 指令和 `ecc:*` Agent 有 Plan B。
4. `orchestration/ecc-capability-map.md` 中的 MCP 配置模板清单与当前环境 `mcp-configs/mcp-servers.json` 一致。
5. 9 个入口 skill 的 `metadata.capabilityMap` 仍指向 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md`。
6. 没有修改 Claude Code settings、hooks、MCP 配置或全局 ECC 插件目录。
7. Markdown 末尾换行正常。
