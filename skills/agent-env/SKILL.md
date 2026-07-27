---
name: agent-env
description: Agent 环境初始化；根据已确认的分诊结果裁剪上下文、ECC 能力、MCP、Agent、ECC 运行时环境变量、验证与审查策略。
disable-model-invocation: true
argument-hint: "[已确认的任务分诊结果]"
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

根据已确认的任务分诊结果，裁剪本次任务需要的上下文、ECC 能力、MCP、Agent、ECC 运行时环境变量、验证与审查策略。

这个 skill 只输出 `agent-environment.md` 草案；用户确认前不进入文档初始化或实现，也不直接修改 settings、MCP、hooks、rules 或环境变量。

## 输入前提

- 已有用户确认过的任务分诊结果，或用户在本次输入中提供了等价信息。
- 如果没有分诊结果，应先建议用户运行 `/orch-for-ecc:task-triage`，或只输出缺失信息清单。

## 软初始化与硬初始化

- 软初始化：通过提示词约束本次任务只使用必要能力、上下文、Agent 和验证门禁。
- 硬初始化：通过用户明确设置环境变量、调整 MCP、安装 rules 或修改项目配置等方式真实改变运行环境。

本 skill 默认只提出方案，不直接修改配置。需要硬初始化时必须单独确认，并明确由用户或后续步骤执行。

## 核心规则

1. 不默认全量启用 ECC 能力。
2. Prompt 不能物理删除当前会话已加载上下文；如果上下文污染严重，建议新开会话，并把分诊结果和环境方案作为启动材料。
3. 用户确认前，只输出 `agent-environment.md` 草案。
4. 如果环境方案发现分诊结果不足或风险等级不合理，应回退到 `/orch-for-ecc:task-triage`。
5. 环境初始化必须优先参考 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-baseline.md`、`${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md`，以及当前已安装 `ecc@ecc` 插件根目录的 `README.md`。
6. 如果存在匹配的 ECC 能力，应在“ECC 能力建议”中列出推荐 `/ecc:*` 指令、可选 `ecc:*` Agent、触发条件和 Plan B。
7. MCP 只输出配置建议；当前 Claude Code 会话的 MCP 启停应交给 `/mcp`，不自动复制配置，不写 settings，不处理凭证。
8. ECC 环境变量只输出建议、适用条件和风险，不自动设置，不读取、不记录 token 或凭证。
9. Rules 不作为本 skill 的常规配置项；ECC plugin 不自动分发 rules，如确需长期规则约束，只建议用户按 ECC README 选择性安装。
10. Hooks 不作为本 skill 的常规配置项；ECC plugin hooks 由 Claude Code 自动加载，如需调节只建议使用 ECC runtime 环境变量。
11. Workflow 不作为本 skill 的默认配置项；只有用户明确要求多 Agent workflow，或 L/XL 任务确有并行编排收益时，才作为可选能力建议。
12. 如果 ECC 能力缺失、改名或不适用，应按 Plan B 降级，并说明能力缺口、替代方案和风险。
13. 表格用于对比、矩阵和配置建议；简单流程、下一步和注意事项优先用列表。
14. 如果存在 `references/`，按 `${CLAUDE_PLUGIN_ROOT}/orchestration/reference-inputs.md` 在上下文策略中明确哪些 reference 需要加载、按需加载或避免加载；`references/` 默认只读，不生成、不修改、不清理。
15. 用户批准环境方案后，必须先按方案完成当前业务项目的 Agent 环境初始化，并输出“初始化结果记录”；未完成初始化前，不进入 `/orch-for-ecc:task-docs`。
16. 批准环境方案只授权软初始化；硬初始化动作仍需按方案中的“是否自动执行”字段判断，涉及配置、MCP、环境变量、rules、hooks、凭证或外部副作用时必须另行确认。

## 输出格式

```markdown
# Agent 环境初始化方案

## 任务输入摘要

| 项 | 内容 |
| --- | --- |
| 任务场景 | `<mvp-build / feature-add / feature-change / refactor-safe / migrate-safe / bug-fix / mixed>` |
| 风险等级 | `<S / M / L / XL>` |
| 主要目标 | `<目标>` |
| 非目标 | `<非目标>` |
| 验收标准 | `<验收标准>` |

## 推荐环境级别

| 项 | 内容 |
| --- | --- |
| 级别 | `minimal / standard / strict` |
| 理由 | `<为什么选择该级别>` |
| 是否需要新会话 | `是 / 否` |
| 是否需要调整运行时环境变量 | `是 / 否` |
| 是否需要调整 MCP | `是 / 否` |
| 是否需要用户级配置变更 | `默认否 / 待确认 / 是` |

## ECC 安装与加载状态

| 项 | 状态 / 建议 | 说明 |
| --- | --- | --- |
| ECC 插件 | `<已安装 / 未确认 / 不需要>` | 检查 `ecc@ecc` 是否可用；未确认时不把 `/ecc:*` 写成硬依赖 |
| 安装方式 | `<plugin / manual / mixed / unknown>` | mixed 可能导致重复 skills、commands 或 hooks |
| Rules | `<无需 / 可选 / 待确认>` | ECC plugin 不自动分发 rules；只在需要长期语言/框架约束时建议用户选择性安装 |
| Hooks | `<保持默认 / 需要运行时调节 / 待确认>` | 不复制 hooks，不写 settings；必要时通过 ECC 环境变量调节 |
| MCP | `<保持 / 减少 / 按需启用>` | MCP 工具描述会占用上下文；当前会话启停使用 `/mcp` |

## 上下文策略

| 类型 | 使用内容 | 用途 | 是否必须 |
| --- | --- | --- | --- |
| 必读文件 | `<path>` | `<用途>` | 是 / 否 |
| 参考输入 | `references/<path>` | `draft 需求 / 参考实现 / 设计参考 / 历史方案`，只读参考 | 是 / 否 |
| 参考文档 | `<path>` | `<用途>` | 是 / 否 |
| 运行记录 | `.claude/runs/...` | `<用途>` | 是 / 否 |
| 避免加载 | `<path / 范围>` | `<避免原因>` | 是 / 否 |

## ECC 能力建议

| 阶段 | 使用级别 | 推荐 `/ecc:*` 指令 | 可选 `ecc:*` Agent | 用途 | 触发条件 | Plan B |
| --- | --- | --- | --- | --- | --- | --- |
| 规划 | `必用 / 按需 / 不建议` | `<command>` | `<agent>` | `<用途>` | `<何时使用>` | `<降级方案>` |
| 代码探索 | `必用 / 按需 / 不建议` | `<command>` | `<agent>` | `<用途>` | `<何时使用>` | `<降级方案>` |
| 实现 | `必用 / 按需 / 不建议` | `<command>` | `<agent>` | `<用途>` | `<何时使用>` | `<降级方案>` |
| 构建修复 | `必用 / 按需 / 不建议` | `<command>` | `<agent>` | `<用途>` | `<何时使用>` | `<降级方案>` |
| 审查 | `必用 / 按需 / 不建议` | `<command>` | `<agent>` | `<用途>` | `<何时使用>` | `<降级方案>` |
| 文档 | `必用 / 按需 / 不建议` | `<command>` | `<agent>` | `<用途>` | `<何时使用>` | `<降级方案>` |

说明：
- 优先查询 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md` 和当前可用 ECC 能力。
- 如果 ECC 能力缺失、改名或不适用，按 Plan B 降级。
- 不把不存在或未确认可用的 `/ecc:*` 指令写成硬依赖。

## ECC 运行时环境变量建议

只输出和当前任务相关的变量；无关变量不要为了填表而全量列出。

### 本任务建议调整

| 变量 | 建议值 | 原因 | 生效方式 | 风险 / 注意 |
| --- | --- | --- | --- | --- |
| `<ENV>` | `<value>` | `<为什么本任务需要>` | `<用户手动设置 / 另行确认后设置>` | `<风险>` |

### 本任务不建议调整

| 变量 | 原因 |
| --- | --- |
| `<ENV>` | `<为什么不建议>` |

### 固定注意事项

- 不自动设置环境变量。
- 不读取、不写入、不记录 token、API key 或凭证。
- `ECC_DISABLED_MCPS` 只用于 ECC install/sync 过滤，不是当前 Claude Code 会话的 live MCP 开关。
- 如任务涉及自定义 LLM gateway，只提示用户检查 Claude Code 自身配置；本 skill 不处理 `ANTHROPIC_BASE_URL` 或 `ANTHROPIC_AUTH_TOKEN`。
- 可参考的 ECC 变量包括 `ECC_HOOK_PROFILE`、`ECC_DISABLED_HOOKS`、`ECC_SESSION_START_CONTEXT`、`ECC_SESSION_START_MAX_CHARS`、`ECC_SESSION_RETENTION_DAYS`、`ECC_MAX_INJECTED_INSTINCTS`、`ECC_INSTINCT_CONFIDENCE_THRESHOLD`、`ECC_CONTEXT_MONITOR_COST_WARNINGS`、`ECC_DISABLED_MCPS`、`ECC_AGENT_DATA_HOME`。
- 构建或测试任务中，如包管理器不明确，可按项目事实建议 `CLAUDE_PACKAGE_MANAGER`，但不覆盖项目已明确的 package manager。

## MCP 与上下文预算

| 项 | 建议 | 理由 | 操作边界 |
| --- | --- | --- | --- |
| MCP 数量 | `<保持 / 减少 / 不新增 / 按需启用>` | MCP 工具描述会占用上下文 | 当前会话启停用 `/mcp`，不写 settings |
| 必要 MCP | `<context7 / github / chrome-devtools / ...>` | `<为什么本任务需要>` | 只建议，不处理凭证 |
| 避免 MCP | `<mcp>` | `<不相关 / 工具过多 / 凭证风险 / 外部副作用>` | 不自动禁用 |
| 工具预算 | `<建议少于 10 个 MCP、少于 80 个 MCP tools>` | 降低上下文占用和工具选择噪音 | 作为建议，不强制 |

说明：
- MCP 只作为配置建议；不要自动启用、复制配置、写 settings 或处理凭证。
- 当前 Claude Code 会话的 MCP 启停应使用 `/mcp`。
- `ECC_DISABLED_MCPS` 只用于 ECC-managed install/sync 过滤，不作为当前会话 MCP 开关。
- 如果 MCP 会访问外部系统、私有仓库、issue、PR、浏览器或凭证保护资源，需要用户确认。

## Agent 派发策略

| Agent | 使用条件 | 角色 | 读写权限 | 输入材料 | 输出产物 | 停止条件 |
| --- | --- | --- | --- | --- | --- | --- |
| `<agent>` | `<何时使用>` | `<角色>` | `<只读 / 可写 / 限定范围>` | `<路径/问题/文档>` | `<结论/代码/报告>` | `<停止条件>` |
| 主 Agent | 默认 | 集成、执行、最终验收 | 可写，按计划限定 | 已确认计划 | 代码改动 / 文档改动 / 交付报告 | 验证通过或遇到越界事项 |

说明：
- 简单顺序任务默认由主 Agent 执行，避免不必要的额外上下文窗口和成本。
- 多 Agent 只在影响面探索、并行审查、多模块任务或 L/XL 任务中使用。
- 探索、审查、安全、性能、文档建议类 Agent 默认只读。
- 同一批文件同一阶段只允许一个最终写入/合并方。

## 验证门禁

| 门禁 | 命令 / 方法 | 触发条件 | 通过标准 |
| --- | --- | --- | --- |
| build | `<command>` | 有代码改动 | 退出码 0 |
| test | `<command>` | 影响逻辑 | 相关测试通过 |
| lint / typecheck | `<command>` | 有格式或类型约束 | 无新增错误 |
| E2E / 可观察验证 | `<方法>` | 影响用户路径 | 关键路径可观察通过 |
| review | `<review 方法 / /ecc:* 指令 / Agent>` | M+ 改动或核心路径 | 无阻断问题 |

## 批准后初始化动作

| 动作 | 类型 | 是否自动执行 | 说明 |
| --- | --- | --- | --- |
| 采用上下文策略 | 软初始化 | 是 | 后续只加载本方案允许的上下文 |
| 限定 ECC 能力 | 软初始化 | 是 | 后续只按本方案推荐能力和 Plan B 执行 |
| 限定 Agent 派发 | 软初始化 | 是 | 后续按读写权限、输入材料和停止条件派发 |
| 应用验证门禁 | 软初始化 | 是 | 后续 `/orch-for-ecc:task-docs` 和执行计划必须继承 |
| 调整环境变量 | 硬初始化 | 否 / 待确认 | 只给建议，不自动设置 |
| 调整 MCP | 硬初始化 | 否 / 待确认 | 使用 `/mcp`，不写 settings |
| 安装 ECC rules | 硬初始化 | 否 / 待确认 | 只建议选择性安装，不自动复制 |
| 修改项目文件 | 硬初始化 | 否 / 待确认 | 限定文件范围后另行确认 |

## 初始化结果记录

用户批准后，Agent 应先输出：

- 已生效的软初始化：
  - `<上下文策略 / ECC 能力 / Agent 派发 / 验证门禁>`
- 待用户执行或另行授权的硬初始化：
  - `<环境变量 / MCP / rules / 配置 / 项目文件>`
- 后续阶段必须继承的约束：
  - `<约束>`

未输出初始化结果记录前，不进入 `/orch-for-ecc:task-docs`。

## 需要用户确认

| 事项 | 原因 | 默认建议 |
| --- | --- | --- |
| 是否调整 ECC 环境变量 | 可能影响当前或后续 Claude Code 行为 | 只给建议，不自动设置 |
| 是否启用或禁用 MCP | MCP 影响上下文、工具数量和外部访问 | 使用 `/mcp` 手动调整 |
| 是否安装或调整 ECC rules | plugin 不自动分发 rules，且 rules 会增加长期上下文 | 只按语言/框架选择性安装 |
| 是否允许写入项目文件 | 涉及实际代码、文档或配置修改 | 限定文件范围后再确认 |
| 是否允许外部访问 | GitHub、浏览器、云服务、API 文档等可能有外部副作用 | 明确范围后再使用 |

## 下一步

- 如果用户确认环境方案：
  1. 先按“批准后初始化动作”初始化当前业务项目 Agent 环境；
  2. 输出“初始化结果记录”；
  3. 再进入 `/orch-for-ecc:task-docs`。
- 如果用户要求修改：更新本方案后重新确认。
- 如果分诊、风险或验收标准不足：回退到 `/orch-for-ecc:task-triage`。
```

## 运行文档

用户确认前只输出草案。用户明确确认后，才可建议写入：

```text
.claude/runs/<date>-<task-slug>/agent-environment.md
```

日期建议使用 ISO 格式，例如 `2026-07-21`。
