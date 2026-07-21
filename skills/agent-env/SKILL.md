---
name: agent-env
summary: Agent 环境初始化
trigger: /agent-env
language: zh-CN
maturity: experimental
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
5. 环境初始化必须优先参考 `skills/shared/ecc-plugin.md` 和 `skills/shared/ecc-capability-map.md`，查询当前可用 `/ecc:*` 能力。
6. 如果存在匹配的 ECC 能力，应在命令策略、Agents、Workflows 或验证门禁中显式列出推荐调用的 `/ecc:*` 指令。
7. 如果 ECC 能力缺失、改名或不适用，应按 Plan B 降级，并说明能力缺口、替代方案和风险。
8. 命令、MCP、Agent 名称以当前项目实际可用能力为准，不把 `/ecc:*` 写成硬依赖。

## 输出格式

```markdown
# Agent 环境初始化方案

## 推荐环境级别
- 级别：minimal / standard / strict
- 理由：

## 必须加载的上下文
- ...

## 避免加载的上下文
- ...

## 命令策略
- 必用：
- 按需：
- 不建议：
- ECC 能力调用计划：
  | 阶段 | 推荐 `/ecc:*` 指令 | 用途 | Plan B |
  |---|---|---|---|
- 说明：优先查询 `skills/shared/ecc-capability-map.md` 和当前可用 ECC 能力；如果 ECC 能力缺失，按 Plan B 降级。

## Rules
- 必须：
- 可选：
- 避免：

## Hooks
- Hook Profile：minimal / standard / strict
- 必须保留：
- 可临时关闭：
- 原因：

## MCP
- 需要：
- 不需要：
- 是否需要用户通过 `/mcp` 操作：

## Agents
- 需要：
- 可写 Agent：
- 只读 Agent：
- 写入边界：

## Workflows
- 是否需要：
- 阶段：
- 输入：
- 输出：
- 失败停止条件：

## 验证门禁
- 测试 / lint / build：
- E2E 或可观察验证：
- correctness / security / performance review：
- 是否需要人工验收：

## 未知的未知
- 当前环境配置中有哪些不确定点：
- 哪些信息缺失会影响能力启用：
- 需要先探索哪些内容：

## 需要用户确认
1. ...

## 下一步
- 用户确认后：可进入 `/task-docs`。
- 用户修改后：更新环境方案。
- 环境方案不足时：回退到 `/task-triage`。
```

## 运行文档

用户确认前只输出草案。用户明确确认后，才可建议写入：

```text
.claude/runs/<date>-<task-slug>/agent-environment.md
```

日期建议使用 ISO 格式，例如 `2026-07-21`。
