---
name: feature-add
description: 已有项目加新特性工作流；先探索相似实现、调用链、权限点和测试样式，再做必要改动并验证。
disable-model-invocation: true
argument-hint: "[已确认执行材料：分诊、环境、文档方案、目标功能和约束]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: feature-add
  requires: [task-triage, agent-env, task-docs]
  capabilityMap: orchestration/ecc-capability-map.md
---
# 已有项目加新特性

> 触发方式：仅当用户输入 `/feature-add` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

用于在已有项目中增加新功能或新行为。重点是先理解现有实现、调用链、权限点和测试样式，再做必要改动，不顺手重构无关代码。

## 输入材料

如果用户没有提供完整材料，先补齐关键缺口。推荐包含：

- 已确认的任务分诊结果：目标、非目标、等级、风险、验收标准。
- 已确认的 Agent 环境方案：允许使用的 Agent、MCP、workflow、验证与审查策略。
- 已确认的文档初始化方案：需要读取、创建或更新的文档。
- 场景特有输入：目标功能、优先修改范围、兼容性/权限/性能/UI/接口约束。

## 核心规则

1. 修改前优先找相似实现、调用链、权限点和测试样式。
2. 只做必要改动，不顺手重构无关代码。
3. 影响面不清楚时，先派只读探索，不直接写代码。
4. 涉及认证、权限、计费、数据写入、数据导出或外部副作用时，升级风险并暂停确认。
5. 多个 Agent 不应并行修改同一批文件；如需并行写入，必须先按模块或文件边界拆分。
6. 执行前参考 `orchestration/ecc-capability-map.md` 选择探索、实现、构建修复、审查和质量门禁相关 ECC 能力，并显式列出推荐调用的 `/ecc:*` 指令。
7. 如果 ECC 能力缺失、改名或不适用，按 Plan B 降级，并说明替代方案、能力缺口和风险。
8. 执行时引用 `orchestration/rules.md`，结束时参考 `orchestration/report-template.md`。

## 流程

1. Discover：复述目标、范围和约束；找到相似实现、调用链、权限点和测试样式。
2. Decide：给出不超过 5 步的实施计划，列出预计修改文件、测试文件和验证命令。
3. Implement：只做必要改动，不扩大范围。
4. Verify：补或更新相关测试，运行相关验证命令。
5. Review：至少做 correctness review；高风险改动增加 security review。
6. Report：说明用户可见变化、兼容性影响、验证结果和残留风险。
7. Learn：判断新的项目约定或重复模式是否值得沉淀为候选 skill / rule。

## 输出要求

- 明确新增了什么用户可见能力。
- 明确修改范围和未修改范围。
- 给出测试或可观察验证证据。
- 说明兼容性、安全、权限或数据风险。
