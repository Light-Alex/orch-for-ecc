---
name: mvp-build
description: 从零开发或 MVP 工作流；收敛 PRD、MVP 边界和垂直切片，再搭建骨架、实现核心路径并验证。
disable-model-invocation: true
argument-hint: "[已确认执行材料：分诊、环境、文档方案、MVP 目标与非目标]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: mvp-build
  requires: [task-triage, agent-env, task-docs]
  capabilityMap: ${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md
---
# 从零开发 / MVP

> 触发方式：仅当用户输入 `/mvp-build` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

用于从零实现项目或产品的第一个可运行版本。重点是先收敛 PRD、MVP 边界和垂直切片，再搭建骨架和核心路径，避免把 MVP 做成大而全系统。

## 输入材料

如果用户没有提供完整材料，先补齐关键缺口。推荐包含：

- 通用输入材料：遵循 `${CLAUDE_PLUGIN_ROOT}/orchestration/rules.md` 的“执行场景 skill 通用规则 / 通用输入材料”。
- 场景特有输入：目标用户、MVP 成功标准、明确不做的功能。

## 核心规则

1. 先收敛 PRD、MVP 边界和垂直切片。
2. 先建立运行命令、测试命令和项目骨架，再做核心路径。
3. 不默认启用全部 MCP；只有需要 GitHub、浏览器、部署平台或外部系统时才启用。
4. 不让多个 Agent 同时修改同一批项目骨架文件。
5. 遇到外部发布、真实支付、短信、邮件、生产数据、不可逆操作时暂停确认。
6. 通用工作流规则遵循 `${CLAUDE_PLUGIN_ROOT}/orchestration/rules.md` 的“执行场景 skill 通用规则”。

## 流程

1. Discover：最多问 5 个会影响架构、数据模型或验收标准的问题。
2. Decide：给出 MVP 垂直切片、技术选择、项目结构和质量门禁。
3. Implement：搭项目骨架、运行命令、测试命令，再做核心路径。
4. Verify：启动应用或运行关键测试，给出可观察证据。
5. Review：至少做 correctness review；高风险路径增加 security review。
6. Report：说明完成范围、未做内容、风险和下一步。
7. Learn：判断是否有稳定的项目初始化步骤值得沉淀为候选 skill / command / workflow。

## 执行前输出

遵循 `${CLAUDE_PLUGIN_ROOT}/orchestration/rules.md` 的“执行场景 skill 通用规则 / 通用执行前输出”。

## 输出要求

- 明确用户可见结果。
- 明确 MVP 包含和不包含什么。
- 给出验证证据，而不是只说“已完成”。
- 记录偏离计划的地方和残留风险。
