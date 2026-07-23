---
name: refactor-safe
description: 保持行为不变的安全重构工作流；建立绿色测试基线，小步调整结构并持续验证。
disable-model-invocation: true
argument-hint: "[已确认执行材料：分诊、环境、文档方案、重构范围和必须保持不变的行为]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: refactor-safe
  requires: [task-triage, agent-env, task-docs]
  capabilityMap: orchestration/ecc-capability-map.md
---
# 安全重构

> 触发方式：仅当用户输入 `/refactor-safe` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

用于在保持业务行为不变的前提下调整结构、降低重复、改善边界或提升可维护性。重构不是新功能；如果需要改变用户可见行为，应回到分诊阶段重新判断。

## 输入材料

如果用户没有提供完整材料，先补齐关键缺口。推荐包含：

- 通用输入材料：遵循 `orchestration/rules.md` 的“场景执行 skill 通用规则 / 通用输入材料”。
- 场景特有输入：旧结构或问题、新结构或目标、允许重构的目录/模块、必须保持不变的接口/数据语义/用户行为。

## 核心规则

1. 核心约束是业务行为保持不变。
2. 没有绿色测试基线，不开始大规模重构；先报告现有失败。
3. 把重构拆成可验证的小阶段，每阶段只改变一种结构维度。
4. 每阶段前后运行相关验证；失败就回滚该阶段或做最小修复。
5. 多 Agent 写入必须按目录或模块分区，并由主 Agent 统一集成验证。
6. 通用工作流规则遵循 `orchestration/rules.md` 的“场景执行 skill 通用规则”。

## 流程

1. Discover：确认当前测试基线、影响面、公共接口和可回滚点。
2. Decide：把重构拆成小阶段，列出每阶段目标、修改范围和验证方式。
3. Implement：小步重构，记录关键决策和偏离。
4. Verify：每阶段跑相关测试；失败就回滚或做最小修复。
5. Review：检查行为不变、可读性、重复度、边界清晰度和性能退化。
6. Report：列出结构变化、行为不变证据和残留风险。
7. Learn：判断稳定重构规则是否值得沉淀为候选 rule / skill / workflow。

## 执行前输出

遵循 `orchestration/rules.md` 的“场景执行 skill 通用规则 / 通用执行前输出”。

## 输出要求

- 明确哪些结构发生了变化。
- 明确哪些行为保持不变，以及证据是什么。
- 明确测试基线和验证命令。
- 明确残留风险和回滚建议。
