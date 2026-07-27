---
name: task-triage
description: 任务分诊与四类未知收敛；在实现前明确目标、范围、风险、场景、等级、能力需求初判和停止条件。
disable-model-invocation: true
argument-hint: "[原始任务描述、目标、约束或验收标准]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: task-triage
  requires: []
  capabilityMap: ${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md
---
# 任务分诊

> 触发方式：仅当用户输入 `/task-triage` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

在实现前把任务的目标、范围、风险、验证方式和执行场景收敛清楚。这个 skill 只做分诊和草案，不进入环境初始化、文档初始化或实现。

## 适用场景

- 用户明确要求“任务分诊”“四类未知分析”“未知收敛”。
- 用户要求先判断任务属于哪类：从零开发、加新特性、重构、迁移、Bug 修复或混合场景。
- 用户要求先判断 S/M/L/XL 等级、风险、能力需求或是否需要进入 Agent 环境初始化。
- 用户明确说“先分诊，不要实现”。

## 不适用场景

- 用户只是要求普通编码、解释代码、写测试、修文档或普通 code review。
- 用户已经明确要求直接执行某个其他 `/skill-name`。
- 问题不会影响架构、数据、权限、验证方式或风险边界。

## 核心规则

1. 先不要实现。
2. 信息不足时，不给最终分诊；最多问 5 个关键问题。
3. 每个问题必须说明“为什么这个答案会改变执行方案”。
4. 如果偏好不明确，给 2-3 个选项并说明取舍。
5. 必须做 blind spot pass，检查权限、安全、数据、迁移、回滚、性能、兼容性、测试可行性、外部副作用、文档冲突、发布影响、多 Agent 写入冲突、上下文污染和 MCP 必要性。
6. 已有项目任务可以建议使用 CodeGraph 或只读探索 Agent 确认影响面；本阶段不要写代码。
7. 用户确认前，不进入下一阶段。
8. 优先参考 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md` 判断当前任务可能需要的 ECC 能力类别，但本阶段只做能力需求初判，不展开具体 Agent、MCP、workflow 或命令派发方案。
9. 如果可能需要的 ECC 能力类别存在缺失、改名或不适用风险，只记录为 `/agent-env` 需要处理的能力缺口和 Plan B 输入。
10. 如果用户或项目提供 `references/`，按 `${CLAUDE_PLUGIN_ROOT}/orchestration/reference-inputs.md` 将其作为只读参考输入，用于识别目标、范围、非目标、风险、验收候选和冲突；不得把 references 内容自动视为验收标准。

## 四类未知

| 未知类型 | 分诊阶段要搞清什么 | 动作 |
| --- | --- | --- |
| Known Knowns | 用户已经明确说出的目标、范围、非目标、约束和验收标准 | 复述确认 |
| Known Unknowns | 用户知道还没决定的问题 | 定向提问 |
| Unknown Knowns | 用户看到方案对比后才会表达的隐性偏好 | 给选项 / 原型 / 方案对比 |
| Unknown Unknowns | 用户没提到但会影响任务成败的风险 | blind spot pass / 风险扫描 |

## 推荐等级

- S：单文件、小修复、低风险、容易验证。
- M：少量文件、常规功能或 bug、有明确验收方式。
- L：多模块、行为变化明显、涉及权限/数据/兼容性/核心路径。
- XL：迁移、安全、架构替换、数据语义变化、不可逆或难回滚操作。

## 输出格式

```markdown
# 任务分诊结果

## 0. 分诊状态
- 当前状态：Need Clarification / Ready For Approval / Approved
- 是否可以进入 Agent 环境初始化：Yes / No
- 原因：

## 1. 四类未知分析

### Known Knowns
- 目标：
- 范围：
- 非目标：
- 约束：
- 验收标准：
- 参考输入：`references/...`；用途：；影响的分诊判断：

### Known Unknowns
| 问题 | 为什么重要 | 用户回答 | 对执行方案的影响 |
|---|---|---|---|

### Unknown Knowns
| 可能的隐性偏好 | 选项 | 取舍 | 需要用户选择吗 |
|---|---|---|---|

### Unknown Unknowns
| 风险 | 为什么重要 | 影响等级 | 建议处理 | 是否需要确认 |
|---|---|---|---|---|

## 2. 推荐场景
- 场景：A. 从零开发 / MVP；B. 已有项目新增特性；C. 已有功能行为变更；D. 项目重构；E. 代码迁移 / 架构迁移；F. Bug 定位与修复；G. 混合场景 / 无法判断
- 理由：

## 3. 推荐等级
- 等级：S / M / L / XL
- 理由：

## 4. 能力需求初判
- Hook Profile 倾向：minimal / standard / strict；理由：
- CodeGraph：需要 / 不需要；理由：
- ECC 能力类别：
  | 能力类别 | 是否需要 | 理由 | 交由 `/agent-env` 细化 |
  |---|---|---|---|
  | 规划 | | | 是 / 否 |
  | 代码探索 | | | 是 / 否 |
  | 实现 | | | 是 / 否 |
  | 构建修复 | | | 是 / 否 |
  | 代码审查 | | | 是 / 否 |
  | 安全审查 | | | 是 / 否 |
  | 性能审查 | | | 是 / 否 |
  | 文档更新 | | | 是 / 否 |
  | E2E / 可观察验证 | | | 是 / 否 |
- 多 Agent：需要 / 不需要 / 待确认；理由：
- MCP：需要 / 不需要 / 待确认；理由：
- Workflow：需要 / 不需要 / 待确认；理由：
- Checkpoint：需要 / 不需要；理由：

## 5. Agent 环境初始化建议
- 是否建议进入 `/agent-env`：Yes / No
- 理由：
- `/agent-env` 需要重点处理：
  - Agent 读写权限
  - 具体 `/ecc:*` 指令和可选 `ecc:*` Agent
  - MCP 配置建议
  - Workflow 策略
  - Commands / Hooks
  - 验证门禁
  - 上下文裁剪
  - 能力缺口和 Plan B

## 6. 停止条件
- ...

## 7. 分诊清晰度
| 维度 | High / Medium / Low | 说明 |
|---|---|---|
| 目标 | | |
| 范围 | | |
| 风险 | | |
| 验证方式 | | |

## 8. 是否允许结束分诊
- 目标和非目标是否明确：
- 场景类型是否明确，或混合场景是否已拆分：
- 等级是否已有理由：
- 高风险项是否已有处理策略：
- 是否至少有一个可观察验证方式：
- 需要用户选择的问题是否已确认：
- 停止条件是否明确：

结论：可以 / 不可以
理由：

## 9. 需要用户确认的问题
1. ...

## 10. 下一步
- 如果用户确认：可进入 `/agent-env`。
- 如果用户修改：重新分诊。
- 如果仍不清楚：继续提问。
```

## 运行文档

以交互模式向用户确认待确认问题后，写入：

```text
.claude/runs/<date>-<task-slug>/diagnosis.md
```

日期建议使用 ISO 格式，例如 `2026-07-21`。
