---
name: 工作流执行流程模板
type: template
language: zh-CN
scope: project
status: experimental
---
# implementation-plan.md 模板

> 这是共享参考文件，不作为独立 skill 触发。
> `/mvp-build`、`/feature-add`、`/feature-change`、`/bug-fix`、`/refactor-safe`、`/migrate-safe` 应在执行前基于本模板生成 `.claude/runs/<date>-<task-slug>/implementation-plan.md`，供用户审批。

## 使用原则

1. `implementation-plan.md` 以已审批任务材料为基线，不重新分诊、不重新初始化环境、不重新规划文档。
2. `/mvp-build`、`/feature-add`、`/feature-change`、`/bug-fix`、`/refactor-safe`、`/migrate-safe` 只负责说明：在当前场景下，每个阶段如何使用已允许的 `/ecc:*` 指令、`ecc:<agent>`、内建能力和 Plan B。
3. 用户审批 `implementation-plan.md` 后，对应 skill 才能进入实施；开始后默认在“自动执行边界”内持续推进，只有越界、风险升级或基线冲突时才暂停确认。
4. 每个阶段必须尽量落到具体 `/ecc:*` 指令或 `ecc:<agent>` 名称；如果没有合适能力，Plan B 必须说明具体由谁用什么方式完成。
5. 同一批文件同一阶段只允许一个最终写入/合并方；探索、审查、安全、性能、文档建议类 Agent 默认只读。
6. `references/` 是人工维护的参考材料区，使用规则见 `orchestration/reference-inputs.md`；Agent 只能读取和引用，不生成、不修改、不清理；其内容不自动成为验收标准。
7. Learn 阶段产生的内容只能进入候选区，不自动晋升为正式 skill、rule、workflow、hook 或长期记忆。

## 输出格式

```markdown
# implementation-plan.md

## 0. 执行基线
| 来源 | 用途 | 执行中默认行为 |
|---|---|---|
| `.claude/runs/<date>-<task-slug>/diagnosis.md` | 目标、非目标、风险、等级、验收标准 | 只读，不默认改写 |
| `.claude/runs/<date>-<task-slug>/agent-environment.md` | 可用能力、Agent、MCP、workflow、验证策略 | 只读，不默认改写 |
| `.claude/runs/<date>-<task-slug>/document-initialization.md` | 文档边界和写入策略 | 只读，不默认改写 |
| `.claude/runs/<date>-<task-slug>/implementation-plan.md` | 实施步骤、阶段流程、验证门禁 | 只读，不默认改写 |
| `docs/...` | 正式长期项目约束 | 只读，除非前置计划已授权更新 |
| `releases/...` | 发版、迁移、配置、DDL 约束 | 只读，除非前置计划已授权更新 |
| `references/...` | 人工提供的 draft 需求、参考实现、样例材料 | 只读参考，不由 Agent 生成或修改 |

## 1. 场景化执行流程
| 阶段 | 目标 | ECC 指令 / Agent | Plan B | 写入边界 | 自动执行边界 |
|---|---|---|---|---|---|

## 2. 验证与审查门禁
| 门禁 | 执行方式 | 通过标准 | 失败处理 |
|---|---|---|---|

## 3. 执行期记录与交付
| 文档 / 位置 | 用途 | 写入条件 |
|---|---|---|
| `.claude/runs/<date>-<task-slug>/progress.md` | 阶段进度、当前状态、阻塞、验证状态 | 执行中按需 |
| `.claude/runs/<date>-<task-slug>/implementation-notes.md` | 偏离计划、关键决策、上下文备注、异常处理、冲突记录 | 执行中 / 执行后 |
| `.claude/runs/<date>-<task-slug>/delivery-report.md` | 完成范围、验证证据、审查结果、残留风险、Learn 判断 | 执行结束 |
| `agent_improvement/from_conversation.md` | 稳定偏好、项目特色、反复踩坑 | 用户确认或明确要求沉淀 |
| `agent_improvement/conversations/` | 本次沟通的脱敏摘要 | 有复盘价值且不含敏感信息 |
| `agent_improvement/potential-skills/` | 候选 skill / command / workflow / hook / rule | Learn 阶段判断值得沉淀，人工确认后再晋升 |

## 4. 不做事项
- 不主动改写已审批执行基线。
- 不扩大目标范围。
- 不执行外部发布、生产变更、真实通知、凭证操作或不可逆操作，除非执行基线已明确授权。
- 不把 `references/` 内容直接当作验收标准，除非已被审批文档吸收。

## 5. 用户确认后自动执行范围
- ...
```

## 填写说明

- `ECC 指令 / Agent`：写具体 `/ecc:*` 指令或 `ecc:<agent>`；如果只能使用内建工具，也要写明内建方式。
- `Plan B`：不能只写“手动处理”，必须说明能力缺失时由谁完成、怎么完成、缺失能力带来的风险。
- `写入边界`：说明本阶段允许修改的目录、文件类型或产物；只读阶段写“只读”。
- `自动执行边界`：说明无需再次确认即可继续的条件；涉及生产、凭证、真实外部副作用、不可逆操作、风险升级或基线冲突时必须越界处理。
- `references/...`：只作为理解、对比或参考实现输入；若与用户当前指令、已审批任务文档、正式 docs/release 文档或代码事实冲突，必须记录冲突，不自动采纳。
