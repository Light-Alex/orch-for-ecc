---
name: agent-env
description: Agent 环境初始化；根据已确认的分诊结果裁剪上下文、ECC 能力、MCP、Agent、workflow、验证与审查策略。
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
  capabilityMap: orchestration/ecc-capability-map.md
---
# Agent 环境初始化

> 触发方式：仅当用户输入 `/agent-env` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

根据已确认的任务分诊结果，裁剪本次任务需要的上下文、命令、hooks、MCP、Agent、workflow、验证与审查策略。这个 skill 只输出环境初始化草案；用户确认前不进入文档初始化或实现。

## 输入前提

- 已有用户确认过的任务分诊结果，或用户在本次输入中提供了等价信息。
- 如果没有分诊结果，应先建议用户运行 `/task-triage`，或只输出缺失信息清单。

## 软初始化与硬初始化

- 软初始化：通过提示词约束本次任务只使用必要能力。
- 硬初始化：通过项目配置、环境变量、MCP、hooks 等真实裁剪运行环境。

本 skill 默认只提出方案，不直接修改配置。需要修改配置时必须单独确认。

## 核心规则

1. 不默认全量启用 ECC 能力。
2. Prompt 不能物理删除当前会话已加载上下文；如果上下文污染严重，建议新开会话，并把分诊结果和环境方案作为启动材料。
3. 用户确认前，只输出 `agent-environment.md` 草案。
4. 如果环境方案发现分诊结果不足或风险等级不合理，应回退到 `/task-triage`。
5. 环境初始化必须优先参考 `orchestration/ecc-baseline.md` 和 `orchestration/ecc-capability-map.md`，查询当前可用 `/ecc:*` 能力和 ECC MCP 配置模板参考。
6. 如果存在匹配的 ECC 能力，应在命令策略、Agents、Workflows 或验证门禁中显式列出推荐调用的 `/ecc:*` 指令。
7. MCP 只输出配置建议，不默认启用，不自动复制配置，不写 settings，不处理凭证。
8. 如果 ECC 能力缺失、改名或不适用，应按 Plan B 降级，并说明能力缺口、替代方案和风险。
9. 命令、MCP、Agent 名称以当前项目实际可用能力为准，不把 `/ecc:*` 写成硬依赖。
10. 输出内容能用表格呈现时优先使用表格，方便用户审阅、确认和复用。
11. 如果存在 `references/`，按 `orchestration/reference-inputs.md` 在上下文策略中明确哪些 reference 需要加载、按需加载或避免加载；`references/` 默认只读，不生成、不修改、不清理。

## 输出格式

```markdown
# Agent 环境初始化方案

## 任务输入摘要

| 项 | 内容 |
| --- | --- |
| 任务场景 | `<mvp-build / feature-add / refactor-safe / migrate-safe / bug-fix / mixed>` |
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
| 是否需要硬初始化 | `是 / 否` |

## 上下文策略

| 类型 | 使用内容 | 用途 | 是否必须 |
| --- | --- | --- | --- |
| 必读文件 | `<path>` | `<用途>` | 是 / 否 |
| 参考输入 | `references/<path>` | `draft 需求 / 参考实现 / 设计参考 / 历史方案`，只读参考 | 是 / 否 |
| 参考文档 | `<path>` | `<用途>` | 是 / 否 |
| 运行记录 | `.claude/runs/...` | `<用途>` | 是 / 否 |
| 避免加载 | `<path / 范围>` | `<避免原因>` | 是 / 否 |

## 命令策略

| 类型 | 命令 / 能力 | 用途 | 触发条件 |
| --- | --- | --- | --- |
| 必用 | `<command>` | `<用途>` | `<何时运行>` |
| 按需 | `<command>` | `<用途>` | `<何时运行>` |
| 不建议 | `<command>` | `<原因>` | `<禁用或避免条件>` |

## ECC 能力建议

| 阶段 | 推荐 `/ecc:*` 指令 | 可选 `ecc:*` Agent | 用途 | Plan B |
| --- | --- | --- | --- | --- |
| 规划 | `/ecc:plan` | `ecc:planner` | 明确范围和验收 | Claude Code plan mode |
| 审查 | `/ecc:code-review` | `ecc:code-reviewer` | 正确性和维护性审查 | 内建 code review / 手动 checklist |

说明：优先查询 `orchestration/ecc-capability-map.md` 和当前可用 ECC 能力；如果 ECC 能力缺失，按 Plan B 降级。

## Rules / Hooks 策略

| 类型 | 建议 | 原因 | 是否需要用户确认 |
| --- | --- | --- | --- |
| Rules | 必须 / 可选 / 避免：`<规则>` | `<原因>` | 是 / 否 |
| Hooks | Hook Profile：`minimal / standard / strict` | `<原因>` | 是 / 否 |
| 可临时关闭 | `<hook>` | `<原因>` | 是 / 否 |

## MCP 配置建议

| MCP 模板 | 是否建议配置 | 用途 | 凭证 / 登录需求 | 外部副作用 | Plan B |
| --- | --- | --- | --- | --- | --- |
| `context7` | 是 / 否 | 查询最新库文档 | 无 / 可能需要 | 读取外部文档 | WebFetch / 手动文档 |
| `github` | 是 / 否 | 读取 issue / PR / repo | 需要 token / 登录 | 访问 GitHub | 用户粘贴上下文 |

说明：MCP 只作为配置建议；不要自动启用、复制配置、写 settings 或处理凭证。

## Agent 派发策略

| Agent | 角色 | 读写权限 | 输入材料 | 输出产物 | 停止条件 |
| --- | --- | --- | --- | --- | --- |
| `ecc:code-explorer` | 代码探索 | 只读 | `<路径/问题>` | 调用链 / 影响面 | 找到关键入口 |
| 主 Agent | 集成实现 | 可写 | 已确认计划 | 代码改动 | 验证通过 |

## Workflow 策略

| 项 | 内容 |
| --- | --- |
| 是否需要 workflow | 是 / 否 |
| 阶段 | `<阶段>` |
| 输入 | `<输入材料>` |
| 输出 | `<输出产物>` |
| 失败停止条件 | `<停止条件>` |

## 验证门禁

| 门禁 | 命令 / 方法 | 触发条件 | 通过标准 |
| --- | --- | --- | --- |
| build | `<command>` | 有代码改动 | 退出码 0 |
| test | `<command>` | 影响逻辑 | 相关测试通过 |
| lint / typecheck | `<command>` | 有格式或类型约束 | 无新增错误 |
| E2E / 可观察验证 | `<方法>` | 影响用户路径 | 关键路径可观察通过 |
| review | `/ecc:code-review` | M+ 改动或核心路径 | 无阻断问题 |

## 未知的未知

| 问题 | 影响 | 建议处理 |
| --- | --- | --- |
| `<不确定点>` | `<影响>` | `<探索或确认方式>` |

## 需要用户确认

| 事项 | 原因 | 默认建议 |
| --- | --- | --- |
| 是否启用 MCP | 可能涉及凭证和外部访问 | 先不启用，只给建议 |
| 是否允许写入 | 涉及文件修改 | 限定文件范围后确认 |
| 是否使用 workflow | 可能增加成本和并发写入风险 | L/XL 任务再启用 |

## 下一步

| 条件 | 下一步 |
| --- | --- |
| 用户确认环境方案 | 进入 `/task-docs` |
| 用户修改环境方案 | 更新本方案 |
| 环境方案不足 | 回退到 `/task-triage` |
```

## 运行文档

用户确认前只输出草案。用户明确确认后，才可建议写入：

```text
.claude/runs/<date>-<task-slug>/agent-environment.md
```

日期建议使用 ISO 格式，例如 `2026-07-21`。
