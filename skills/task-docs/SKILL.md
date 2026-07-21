---
name: task-docs
summary: 任务文档初始化
tag: docs
trigger: /task-docs
language: zh-CN
maturity: experimental
---

# 任务文档初始化

> 触发方式：仅当用户输入 `/task-docs` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

把已确认的任务分诊结果和 Agent 环境方案转成后续执行可读取、可审批、可交接的文档计划。这个 skill 只输出文档初始化草案；用户确认前不进入执行阶段。

## 输入前提

- 已确认的任务分诊结果，通常来自 `/task-triage`。
- 已确认的 Agent 环境方案，通常来自 `/agent-env`。
- 如果输入不足，先列出缺失内容，不要假装可以执行。

## 文档分类

| 目录 | 受众 | 用途 |
| --- | --- | --- |
| `releases/` | 人 | 发版说明、配置、DDL、回滚说明 |
| `docs/` | 人和团队 | PRD、架构、API、schema、UI 规格、验收清单 |
| `.claude/runs/<date>-<task-slug>/` | Agent | 本次任务运行记录和交接材料 |
| `agent_improvement/` | Agent 学习 | 脱敏摘要、候选 skill/rule/workflow |

## S/M/L/XL 文档策略

| 等级 | 文档策略 |
| --- | --- |
| S | 不创建文档，最终回复说明结果即可 |
| M | 生成 `diagnosis.md`、`implementation-plan.md`；必要时补 `checklist.md` 或 `implementation-notes.md` |
| L | 创建任务运行目录；按影响面更新 PRD、architecture、api、schema、checklist |
| XL | 强制文档先行；`docs/`、`releases/`、`.claude/runs/` 都按需齐全，审批后执行 |

## 核心规则

1. 不默认生成全套文档，只生成当前任务真正需要的文档。
2. 同一个文档同一阶段只允许一个 owner Agent 写；专家 Agent 可以给建议，但由 owner 合并。
3. 不保存 secrets、token、真实用户隐私或生产敏感数据。
4. 文档是约束源，但不是不可质疑的真理；如果文档与代码、测试或真实系统行为冲突，必须暂停确认。
5. `.claude/runs/` 默认是过程资产；长期价值内容再晋升到 `docs/`、`rules/`、`skills/` 或 `workflows/`。
6. 如果文档初始化发现环境方案不足或冲突，应暂停并回退到 `/agent-env`。
7. 优先参考 `skills/shared/ecc-capability-map.md` 查询文档、codemap 和质量门禁相关 ECC 能力，并在方案中显式列出推荐调用的 `/ecc:*` 指令。
8. 如果 ECC 文档能力缺失、改名或不适用，按 Plan B 降级为手动文档计划、内建能力或只读文档 Agent，并说明能力缺口。

## 输出格式

```markdown
# 文档初始化方案

## 文档级别
- S/M/L/XL 对应的文档策略：
- 本任务建议：

## 需要创建或更新的文档
| 路径 | 受众 | 目的 | 是否必须 | 推荐 owner | 是否需要人审 |
|---|---|---|---:|---|---:|

## ECC 能力调用计划
| 阶段 | 推荐 `/ecc:*` 指令 | 用途 | Plan B |
|---|---|---|---|

## 不需要的文档
- ...

## 文档写入原则
- 同一文档同一阶段只允许一个 owner 写。
- 专家 Agent 可以给建议，但由 owner 合并。
- 不保存 secrets、token、真实用户隐私、生产敏感数据。
- 如果文档与代码、测试或真实系统行为冲突，暂停确认。
- 过程文档默认不提交；长期价值内容再晋升到 docs、rules、skills 或 workflows。

## 给空白上下文 Agent 的启动材料
- 必读：
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
