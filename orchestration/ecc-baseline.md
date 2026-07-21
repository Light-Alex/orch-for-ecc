---
name: ECC 插件能力基线
type: baseline
language: zh-CN
scope: project
status: experimental
version: 2.0.0
recorded: 2026-07-21
---
# ECC 插件基线

## 用途

本文件只记录当前项目内 skill 实际依赖或推荐使用的 ECC 能力基线。

它不是 ECC 插件完整清单，也不是 ECC 插件发布说明。完整插件信息应通过当前环境命令查询，例如：

- `claude plugin list --json`
- `claude plugin details ecc@ecc`

## 当前项目基线

| 字段 | 值 |
| --- | --- |
| ECC 插件 ID | `ecc@ecc` |
| ECC 插件版本 | `2.0.0` |
| 启用状态 | `enabled: true` |
| scope | `user` |
| 信息来源 | `claude plugin list --json`、`claude plugin details ecc@ecc` |
| 记录日期 | `2026-07-21` |
| 能力映射文件 | `orchestration/ecc-capability-map.md` |

## 当前项目依赖的 `/ecc:*` 指令

这些指令来自 `orchestration/ecc-capability-map.md` 和 8 个入口 skill 的推荐调用计划。它们是当前项目的推荐入口，不是不可替代的硬依赖。

- `/ecc:plan`
- `/ecc:plan-canvas`
- `/ecc:plan-prd`
- `/ecc:project-init`
- `/ecc:feature-dev`
- `/ecc:multi-plan`
- `/ecc:multi-workflow`
- `/ecc:multi-execute`
- `/ecc:build-fix`
- `/ecc:code-review`
- `/ecc:security-scan`
- `/ecc:test-coverage`
- `/ecc:quality-gate`
- `/ecc:update-docs`
- `/ecc:update-codemaps`
- `/ecc:checkpoint`
- `/ecc:ecc-guide`
- `/ecc:orch-build-mvp`
- `/ecc:orch-add-feature`
- `/ecc:orch-refine-code`
- `/ecc:orch-fix-defect`
- `/ecc:refactor-clean`

## 当前项目推荐的 `ecc:*` Agent

这些 Agent 是当前项目 skill 的可选专项能力，不是硬依赖。优先使用 `/ecc:*` 指令入口；当指令不可用、不适合或需要更细粒度控制时，再显式选择职责明确的 Agent。

- `ecc:planner`
- `ecc:architect`
- `ecc:code-architect`
- `ecc:code-explorer`
- `ecc:doc-updater`
- `ecc:build-error-resolver`
- `ecc:code-reviewer`
- `ecc:security-reviewer`
- `ecc:pr-test-analyzer`
- `ecc:tdd-guide`
- `ecc:a11y-architect`
- `ecc:performance-optimizer`
- `ecc:code-simplifier`
- `ecc:refactor-cleaner`
- `ecc:e2e-runner`
- `ecc:agent-evaluator`

## 当前项目关注的 ECC 组件

| 组件类型 | 当前项目是否关注 | 当前环境摘要 | 说明 |
| --- | --- | --- | --- |
| Skills / Commands | 是 | `Skills (372)` | 项目 skill 会显式推荐 `/ecc:*` 指令；只维护本项目用到的子集。 |
| Agents | 是 | `Agents (67)` | 项目 skill 可按需推荐 `ecc:*` Agent；只维护本项目推荐的子集。 |
| Hooks | 间接关注 | `Hooks (7)` | 只记录是否存在，不把 hook 行为写成项目契约。 |
| MCP servers | 间接关注 | `MCP servers (1): chrome-devtools` | 主要用于浏览器、E2E、性能和可访问性相关任务。 |
| LSP servers | 暂不关注 | `LSP servers (0)` | 当前项目未依赖 ECC LSP 能力。 |

## 兼容策略

1. 当前环境安装的 ECC 插件是刷新基线时的事实来源。
2. 如果当前环境 ECC 版本与本文件不一致，以当前环境安装版本为准，先生成刷新计划，再更新项目配套内容。
3. 如果 `/ecc:*` 指令不存在、改名、行为变化或粒度不适合，应使用 `orchestration/ecc-capability-map.md` 中的 Plan B。
4. 如果推荐的 `ecc:*` Agent 不存在、改名或职责不适用，应选择职责明确的同类 Agent、其他插件能力、Claude Code 内建能力或手动流程。
5. 本项目 skill 应保持自足，不依赖 ECC 插件内部文档才能理解任务流程。
6. 不把“某 `/ecc:*` 指令一定调用某个 `ecc:*` Agent”当成稳定契约。

## 不记录的内容

本文件不保存：

- ECC 插件完整 skill 列表。
- ECC 插件完整 agent 描述。
- token 成本明细。
- 本机敏感路径。
- secrets、token、真实用户隐私或生产敏感数据。

完整信息以当前环境命令查询结果为准。

## 刷新方式

使用项目维护 command：

```text
commands/ecc-check-update.md
```

刷新时应先查询当前环境，再对比本文件和 `orchestration/ecc-capability-map.md`。不一致时先输出差异和刷新计划，用户确认后再写入项目文件。
