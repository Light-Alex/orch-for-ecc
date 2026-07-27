---
name: feature-change
description: 已有功能行为变更工作流；先确认旧行为、新期望和兼容影响，再修改既有测试表达新规格，最后调整实现并验证。
disable-model-invocation: true
argument-hint: "[已确认执行材料：分诊、环境、文档方案、旧行为、新行为和兼容性约束]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: feature-change
  requires: [task-triage, agent-env, task-docs]
  capabilityMap: ${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md
---
# 已有功能行为变更

> 触发方式：仅当用户输入 `/feature-change` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

用于已有功能按新规格改变行为。当前行为不一定错误，只是不再符合新的产品、业务、接口或交互期望。

如果能力当前不存在，使用 `/feature-add`。如果当前行为违反既有预期、崩溃或回归，使用 `/bug-fix`。如果行为必须不变，只改善结构，使用 `/refactor-safe`。

## 输入材料

如果用户没有提供完整材料，先补齐关键缺口。推荐包含：

- 通用输入材料：遵循 `${CLAUDE_PLUGIN_ROOT}/orchestration/rules.md` 的“执行场景 skill 通用规则 / 通用输入材料”。
- 场景特有输入：旧行为、新行为、兼容性要求、影响用户 / API / 数据 / 权限、是否保留旧行为开关、验收标准。

## 核心规则

1. 先确认这是行为变更，不是 bug 修复，也不是新增能力。
2. 修改前找到既有实现、既有测试、调用方和文档承诺。
3. 优先更新既有测试表达新规格；如果没有测试，先补 characterization 或规格测试。
4. 明确兼容性影响，尤其是 API、数据格式、权限、默认值和 UI 文案。
5. 只做必要改动，不顺手重构无关代码。
6. 涉及认证、权限、计费、数据写入、数据导出或外部副作用时，升级风险并暂停确认。
7. 多个 Agent 不应并行修改同一批文件；如需并行写入，必须先按模块或文件边界拆分。
8. 通用工作流规则遵循 `${CLAUDE_PLUGIN_ROOT}/orchestration/rules.md` 的“执行场景 skill 通用规则”。

## 流程

1. Discover：复述旧行为、新行为、范围和兼容约束；找到既有实现、测试和调用方。
2. Decide：给出 changed-test plan，不超过 5 步，列出预计修改文件、测试文件和验证命令。
3. Test Update：修改或补充测试，使其表达新规格。
4. Implement：调整实现直到测试通过，不扩大范围。
5. Verify：运行相关测试、兼容性检查和可观察验证。
6. Review：至少做 correctness review；高风险改动增加 security review。
7. Report：说明行为变化、兼容性影响、验证结果和残留风险。
8. Learn：判断新的业务规则或测试模式是否值得沉淀为候选 skill / rule。

## 执行前输出

遵循 `${CLAUDE_PLUGIN_ROOT}/orchestration/rules.md` 的“执行场景 skill 通用规则 / 通用执行前输出”。

## 输出要求

- 明确旧行为和新行为。
- 明确为什么这是 feature change，不是 bug fix 或 feature add。
- 明确测试如何表达新规格。
- 明确修改范围和未修改范围。
- 明确兼容性、安全、权限、数据或用户影响。
- 给出测试或可观察验证证据。
