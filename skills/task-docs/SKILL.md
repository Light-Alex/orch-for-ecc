---
name: task-docs
description: 任务文档初始化；根据已确认的 diagnosis.md 生成可审批、可交接的文档计划，并标明使用的 ECC 能力。
disable-model-invocation: true
argument-hint: "[diagnosis.md 路径]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: task-docs
  requires: [task-triage, agent-env]
  capabilityMap: ${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md
---
# 任务文档初始化

> 触发方式：仅当用户输入 `/task-docs` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

根据已确认的 `diagnosis.md`，为当前任务生成简洁、可审批、可交接的文档创建/更新方案。这个 skill 默认只输出文档初始化草案；完成交互式确认并获得用户明确批准后，自动写入对应运行文档。

`/agent-env` 已完成项目级 Agent 环境初始化，配置即生效；本 skill 不再读取或复述 `agent-env` 生成的文档，只继承当前已生效的 Agent 环境。

用户确认前不进入执行阶段，也不生成 `implementation-plan.md`。

## 输入前提

- 已确认的 `diagnosis.md`，通常来自 `/task-triage`。
- 当前业务项目根目录明确。
- 当前 Agent 环境已由 `/agent-env` 初始化并生效；无需读取 `agent-environment.md`。
- 如果输入不足，先列出缺失内容，不要假装可以执行。

## 工作流程

1. 读取并核对 `diagnosis.md`。
2. 按任务等级、风险、影响面和交接需求选择必要文档。
3. 结合 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md` 中 `/task-docs` 能力映射，为每个文档标明使用的具体 ECC 能力。
4. 如涉及 `references/`，按 `${CLAUDE_PLUGIN_ROOT}/orchestration/reference-inputs.md` 标明引用来源、影响文档和仍需用户确认的内容。
5. 生成 `document-initialization.md` 草案，通过交互确认文档范围、使用能力、最终写入/合并方和人审点。
6. 展示最终草案，并在用户明确批准后写入运行文档。

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

- `diagnosis.md`：任务分诊结果；本 skill 的输入，只读核对，不默认改写。
- `document-initialization.md`：文档初始化方案；本 skill 在用户批准后写入。
- `implementation-plan.md`：实施计划审批件；不由 `/task-docs` 生成，由 `/mvp-build`、`/feature-add`、`/feature-change`、`/bug-fix`、`/refactor-safe` 或 `/migrate-safe` 参照 `${CLAUDE_PLUGIN_ROOT}/templates/workflow-execution-template.md` 生成。
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

- `.claude/runs/<date>-<task-slug>/document-initialization.md`

按需补充：

- `.claude/runs/<date>-<task-slug>/implementation-notes.md`
- `docs/checklist.md`

适用条件：常规功能或 bug，需要最小可交接上下文和验收清单。

### L

默认创建任务运行目录，并生成或更新：

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

## ECC 能力标注规则

每个“需要创建或更新的文档”必须标明使用的具体 ECC 能力，而不是只写抽象能力类别。优先参考 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md` 的 `/task-docs` 映射。

常用能力：

- `/ecc:update-docs`：更新 README、`docs/`、运行记录或交付文档。
- `/ecc:update-codemaps`：更新 codemap、架构索引或代码结构说明。
- `/ecc:documentation-lookup`：需要最新库、框架、SDK 或 API 文档时查证。
- `/ecc:architecture-decision-records`：需要记录架构决策、取舍和后果时使用。
- `ecc:spec-miner`：从 brownfield 项目提取行为规格和不变量。
- `/ecc:quality-gate`：确认文档与验证结果、代码事实和交付门禁一致。

如果没有合适的 `/ecc:*` 指令或 `ecc:<agent>`，Plan B 必须说明由谁手写/更新哪些文档、如何审查、缺失能力带来的审计风险。

## 核心规则

1. 输入是 `diagnosis.md`；不要要求读取或复述 `agent-environment.md`。
2. `/agent-env` 已初始化项目级 Agent 环境，配置即生效；本 skill 只继承当前环境，不重新初始化环境。
3. 不默认生成全套文档，只生成当前任务真正需要的文档。
4. 文档分类和 S/M/L/XL 文档策略必须使用同一套文档名。
5. 如果项目已有文档命名和目录规范，优先沿用项目规范；但输出时必须说明与默认文档名的对应关系。
6. 同一个文档同一阶段只允许一个最终写入/合并方；专家 Agent 可以给建议，但由最终写入/合并方合并。
7. `/task-docs` 不生成 `.claude/runs/<date>-<task-slug>/implementation-plan.md`。
8. 不保存 secrets、token、真实用户隐私或生产敏感数据。
9. 文档是约束源，但不是不可质疑的真理；如果文档与代码、测试或真实系统行为冲突，必须暂停确认。
10. `.claude/runs/` 默认是过程资产；长期价值内容再晋升到 `docs/`、`rules/`、`skills/` 或 `workflows/`。
11. `agent_improvement/from_conversation.md` 必须短，只保留稳定偏好、项目特色和反复踩坑；一次性任务细节放 `agent_improvement/conversations/` 摘要。
12. `agent_improvement/potential-skills/` 是候选区，不自动生效；人工确认后再晋升。
13. 优先参考 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md` 查询文档、codemap 和质量门禁相关能力；输出中必须落到具体 `/ecc:*` 指令或 `ecc:<agent>` 名称。
14. “执行方式”必须说明具体 `/ecc:*` 指令、`ecc:<agent>`、最终写入/合并方和 Plan B；多个 Agent 参与时，同一文档同一阶段只能有一个最终写入/合并方。
15. 如果文档计划引用 `references/`，按 `${CLAUDE_PLUGIN_ROOT}/orchestration/reference-inputs.md` 说明引用来源、影响的文档和仍需用户确认的内容；不得把 reference draft 自动晋升为正式 docs、releases 或验收清单。
16. 文档初始化的待确认项必须通过交互模式逐项确认，覆盖文档范围、ECC 能力/Plan B、references 影响、最终写入/合并方、人审点和是否批准写入运行文档。
17. 用户确认前只保留草案，不写入正式 `document-initialization.md`；非交互输入、沉默、默认选项或模糊的“继续”不构成批准。

## 输出格式

```markdown
# 文档初始化方案

## 输入
- 分诊文件：`<path/to/diagnosis.md>`
- 文档级别：S / M / L / XL
- 任务摘要：`<一句话>`

## 需要创建或更新的文档
| 路径 | 动作 | 为什么需要 | 执行方式（ECC 能力 / Plan B） | 最终写入/合并方 | 人审点 |
|---|---|---|---|---|---|

## references 引用说明
| reference | 用途 | 影响文档 | 仍需用户确认的内容 |
|---|---|---|---|

## 不需要的文档
| 文档 | 跳过原因 |
|---|---|

## 给空白上下文 Agent 的启动材料
- 必读：
  - `diagnosis.md`：任务目标、边界、风险、验收候选。
- 按需读：
  - `<docs/references/...>`：`<用途>`
- 不读：
  - `<无关或易污染上下文的材料>`

## 写入原则
- 只写入本方案列出的文档。
- 同一文档同一阶段只允许一个最终写入/合并方。
- 不保存 secrets、token、真实用户隐私、生产敏感数据。
- 如果文档与代码、测试或真实系统行为冲突，暂停确认。
- 过程文档默认不提交；长期价值内容再晋升到 docs、rules、skills 或 workflows。

## 需要用户审批的内容
1. 确认待创建或更新的文档、跳过的文档及原因。
2. 确认每个文档使用的 ECC 能力或 Plan B。
3. 确认 `references/` 的引用来源、影响文档和仍需用户确认的内容。
4. 确认每个文档的最终写入/合并方和人审点。
5. 确认是否批准写入 `.claude/runs/<date>-<task-slug>/document-initialization.md`。

## 下一步
- 用户明确确认全部审批内容并批准写入后：自动写入 `.claude/runs/<date>-<task-slug>/document-initialization.md`。
- 用户修改后：更新文档初始化方案后重新确认，不写入旧方案。
- 用户未批准：不写入运行文档，不进入实现阶段。
```

## 运行文档

交互确认完成、最终草案已展示且用户明确批准“写入该运行文档”后，自动写入：

```text
.claude/runs/<date>-<task-slug>/document-initialization.md
```

未完成交互确认前只保留草案，不写入正式运行文档。回答问题不等于批准写入；该确认只授权写入 `document-initialization.md`，不授权进入执行阶段、生成 `implementation-plan.md`、实现代码、配置变更、外部访问或项目文件改动。非交互输入、沉默、默认选项或模糊的“继续”不构成批准。

日期建议使用 ISO 格式，例如 `2026-07-28`。
