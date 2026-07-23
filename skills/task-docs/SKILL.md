---
name: task-docs
description: 任务文档初始化；把已确认的分诊结果和 Agent 环境方案转成可审批、可交接的文档计划。
disable-model-invocation: true
argument-hint: "[已确认的分诊结果 + Agent 环境方案]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: task-docs
  requires: [task-triage, agent-env]
  capabilityMap: orchestration/ecc-capability-map.md
---
# 任务文档初始化

> 触发方式：仅当用户输入 `/task-docs` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

把已确认的任务分诊结果和 Agent 环境方案转成后续执行可读取、可审批、可交接的文档初始化方案。这个 skill 只输出文档初始化草案；用户确认前不进入执行阶段，也不生成实施计划。

## 输入前提

- 已确认的任务分诊结果，通常来自 `/task-triage`。
- 已确认的 Agent 环境方案，通常来自 `/agent-env`。
- 如果输入不足，先列出缺失内容，不要假装可以执行。

## 文档分类

不要默认生成全套文档，只生成当前任务真正需要的文档。如果项目已有更具体的文档命名和目录规范，优先沿用项目规范；否则使用以下默认文档名，并在输出中说明与默认文档名的对应关系。

### `releases/<version-or-date>/`

面向人：发版说明、配置、DDL、迁移和回滚说明。

候选文档：

- `release-notes.md`：发版说明、目的、用户可见变更、验证结果和已知风险。
- `migration-notes.md`：迁移说明、兼容策略、操作步骤和回滚方式。
- `config-changes.md`：配置项、环境变量、开关、部署参数变化。
- `ddl.sql`：数据库 DDL 或需要人工审批的 schema 变更脚本。

### `docs/`

面向人和团队：长期项目文档。

候选文档：

- `project-brief.md`：项目说明、目标、边界和关键上下文。
- `PRD.md`：产品需求、范围、非目标和验收标准。
- `architecture.md`：系统设计、模块关系、关键决策和影响面。
- `api.md`：API 契约、请求响应、错误码和兼容性。
- `schema.md`：数据结构、数据库 schema、字段语义和迁移影响。
- `ui-spec.md`：设计稿、交互、状态、可访问性和 UI 规格。
- `checklist.md`：验收清单、测试清单和发布前检查项。

### `.claude/runs/<date>-<task-slug>/`

面向 Agent：本次任务运行记录和交接材料。

候选文档：

- `diagnosis.md`：任务分诊结果。
- `agent-environment.md`：Agent 环境初始化方案。
- `document-initialization.md`：文档初始化方案。
- `implementation-plan.md`：实施计划审批件；不由 `/task-docs` 生成，由 `/mvp-build`、`/feature-add`、`/bug-fix`、`/refactor-safe` 或 `/migrate-safe` 参照 `orchestration/workflow-execution-template.md` 生成。
- `progress.md`：进度记录。
- `implementation-notes.md`：Agent 审计日志、关键决策、偏离计划和上下文备注。
- `delivery-report.md`：交付报告。

### `agent_improvement/`

面向 Agent 学习：候选学习资产，不自动生效。

候选位置：

- `from_conversation.md`：短小、稳定、跨任务的用户偏好和项目特色。
- `conversations/`：每次沟通的脱敏摘要。
- `potential-skills/`：`/ecc:learn` 或 `/ecc:learn-eval` 生成的候选技能，人工确认后再晋升。

## S/M/L/XL 文档策略

文档策略必须直接列出默认生成或更新的文档名，并与“文档分类”使用同一套命名。

### S

默认不创建文档，最终回复说明结果即可。

适用条件：单文件、小修复、低风险、无需交接、无需长期记录。

### M

默认生成或更新：

- `.claude/runs/<date>-<task-slug>/diagnosis.md`
- `.claude/runs/<date>-<task-slug>/document-initialization.md`

按需补充：

- `.claude/runs/<date>-<task-slug>/implementation-notes.md`
- `docs/checklist.md`

适用条件：常规功能或 bug，需要最小可交接上下文和验收清单。

### L

默认创建任务运行目录，并生成或更新：

- `.claude/runs/<date>-<task-slug>/diagnosis.md`
- `.claude/runs/<date>-<task-slug>/agent-environment.md`
- `.claude/runs/<date>-<task-slug>/document-initialization.md`
- `.claude/runs/<date>-<task-slug>/progress.md`
- `.claude/runs/<date>-<task-slug>/implementation-notes.md`
- `.claude/runs/<date>-<task-slug>/delivery-report.md`

按影响面更新：

- `docs/PRD.md`
- `docs/architecture.md`
- `docs/api.md`
- `docs/schema.md`
- `docs/ui-spec.md`
- `docs/checklist.md`
- `releases/<version-or-date>/release-notes.md`

适用条件：多模块、用户可见行为、核心路径或团队协作影响明显。

### XL

强制文档先行；L 级运行文档必须按需齐全，并在审批后执行。

按风险补齐：

- `releases/<version-or-date>/release-notes.md`
- `releases/<version-or-date>/migration-notes.md`
- `releases/<version-or-date>/config-changes.md`
- `releases/<version-or-date>/ddl.sql`
- `docs/project-brief.md`
- `docs/PRD.md`
- `docs/architecture.md`
- `docs/api.md`
- `docs/schema.md`
- `docs/ui-spec.md`
- `docs/checklist.md`
- `agent_improvement/from_conversation.md`
- `agent_improvement/conversations/`
- `agent_improvement/potential-skills/`

适用条件：迁移、安全、架构替换、数据语义变化、生产配置、难回滚或不可逆操作。

## 核心规则

1. 不默认生成全套文档，只生成当前任务真正需要的文档。
2. 文档分类和 S/M/L/XL 文档策略必须使用同一套文档名。
3. 如果项目已有文档命名和目录规范，优先沿用项目规范；但输出时必须说明与默认文档名的对应关系。
4. 同一个文档同一阶段只允许一个最终写入/合并方；专家 Agent 可以给建议，但由最终写入/合并方合并。
5. `/task-docs` 不生成 `.claude/runs/<date>-<task-slug>/implementation-plan.md`；该文件由 `/mvp-build`、`/feature-add`、`/bug-fix`、`/refactor-safe` 或 `/migrate-safe` 在执行前参照 `orchestration/workflow-execution-template.md` 生成，并经用户审批后作为实施基线。
6. 不保存 secrets、token、真实用户隐私或生产敏感数据。
7. 文档是约束源，但不是不可质疑的真理；如果文档与代码、测试或真实系统行为冲突，必须暂停确认。
8. `.claude/runs/` 默认是过程资产；长期价值内容再晋升到 `docs/`、`rules/`、`skills/` 或 `workflows/`。
9. `agent_improvement/from_conversation.md` 必须短，只保留稳定偏好、项目特色和反复踩坑；一次性任务细节放 `agent_improvement/conversations/` 摘要。
10. `agent_improvement/potential-skills/` 是候选区，不自动生效；人工确认后再晋升。
11. 如果文档初始化发现环境方案不足或冲突，应暂停并回退到 `/agent-env`。
12. 优先参考 `orchestration/ecc-capability-map.md` 查询文档、codemap 和质量门禁相关能力；输出中必须尽量落到具体 `/ecc:*` 指令或 `ecc:<agent>` 名称，不能只写抽象能力类别。
13. 如果没有合适的 `/ecc:*` 指令或 `ecc:<agent>`，Plan B 必须说明由谁手写/更新哪些文档，以及缺失能力带来的审计风险。
14. “执行方式”必须说明具体 `/ecc:*` 指令、`ecc:<agent>`、最终写入/合并方和 Plan B；多个 Agent 参与时，同一文档同一阶段只能有一个最终写入/合并方。
15. 如果文档计划引用 `references/`，按 `orchestration/reference-inputs.md` 说明引用来源、影响的文档和仍需用户确认的内容；不得把 reference draft 自动晋升为正式 docs、releases 或验收清单。

## 输出格式

```markdown
# 文档初始化方案

## 文档级别
- S/M/L/XL 对应的文档策略：
- 本任务建议：

## 需要创建或更新的文档
| 路径 | 动作 | 为什么需要 | 执行方式 | 人审点 |
|---|---|---|---|---|

## references 引用说明
| reference | 用途 | 影响文档 | 仍需用户确认的内容 |
|---|---|---|---|

## 不需要的文档
| 文档 | 跳过原因 |
|---|---|

## 文档写入原则
- 同一文档同一阶段只允许一个最终写入/合并方。
- 专家 Agent 可以给建议，但由最终写入/合并方合并。
- 不保存 secrets、token、真实用户隐私、生产敏感数据。
- 如果文档与代码、测试或真实系统行为冲突，暂停确认。
- 过程文档默认不提交；长期价值内容再晋升到 docs、rules、skills 或 workflows。

## 给空白上下文 Agent 的启动材料
- 必读：
  - `references/...`：如被文档计划引用，仅作只读参考；说明用途。
- 按需读：
- 不读：

## 环境方案反馈
- `agent-environment.md` 是否足够支撑文档初始化：
- 是否需要回退调整 Agent 环境：
- 原因：

## 需要用户审批的内容
1. ...

## 下一步
- 用户确认后：选择 `/mvp-build`、`/feature-add`、`/refactor-safe`、`/migrate-safe` 或 `/bug-fix`。
- 用户修改后：更新文档初始化方案。
- 环境方案不足时：回退到 `/agent-env`。
```

## 运行文档

用户确认前只输出草案。用户明确确认后，才可建议写入：

```text
.claude/runs/<date>-<task-slug>/document-initialization.md
```

日期建议使用 ISO 格式，例如 `2026-07-21`。
