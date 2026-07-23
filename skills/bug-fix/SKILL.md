---
name: bug-fix
description: Bug 定位与修复工作流；先复现，再诊断根因，做最小修复，并用回归证据验证。
disable-model-invocation: true
argument-hint: "[现象、预期、复现步骤、日志、环境或相关路径]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: bug-fix
  requires: [task-triage, agent-env, task-docs]
  capabilityMap: orchestration/ecc-capability-map.md
---
# Bug 定位与修复

> 触发方式：仅当用户输入 `/bug-fix` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

用于已有异常现象的定位与修复。核心原则是先复现，再诊断根因，再做最小修复；无法复现时不猜修。

## 输入材料

如果用户没有提供完整材料，先补齐关键缺口。推荐包含：

- 通用输入材料：遵循 `orchestration/rules.md` 的“执行场景 skill 通用规则 / 通用输入材料”。
- 场景特有输入：现象、预期、复现步骤、输入、日志、环境、优先检查范围。

## 核心规则

1. 修复前必须有失败测试、失败命令或可观察复现路径。
2. 先解释根因，不要只改附近代码。
3. 做最小修复，不扩大改动面。
4. 不删除测试来让验证通过。
5. 影响核心数据、安全、认证、权限时升级风险并暂停确认。
6. 无法复现时，不猜修；输出缺失信息和下一步诊断探针。
7. 通用工作流规则遵循 `orchestration/rules.md` 的“执行场景 skill 通用规则”。

## 流程

1. Discover：复述现象和预期，收集日志、步骤、环境和影响范围。
2. Reproduce：找到最小复现路径，优先写失败回归测试或稳定失败命令。
3. Diagnose：解释根因，不要只改附近代码。
4. Fix：做最小修复，不扩大改动面。
5. Verify：证明同一复现路径已通过，并运行相关回归测试。
6. Review：确认修复没有引入副作用；高风险 bug 增加 security review。
7. Report：说明根因、改动、防回归测试、验证结果和残留风险。
8. Learn：如果是反复出现的问题，判断是否记录为 rule / hook / skill 候选。

## 执行前输出

遵循 `orchestration/rules.md` 的“执行场景 skill 通用规则 / 通用执行前输出”。

## 输出要求

- 明确现象、预期和复现方式。
- 明确根因，而不是只描述改了什么。
- 明确最小修复范围。
- 明确防回归测试或可观察验证证据。
- 明确残留风险和后续诊断建议。
