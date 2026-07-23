---
name: migrate-safe
description: 代码或架构迁移工作流；默认高风险处理，先盘点兼容矩阵和代表性切片，再批量推进并保留回滚点。
disable-model-invocation: true
argument-hint: "[已确认执行材料：分诊、环境、文档方案、迁移前后目标和回滚要求]"
metadata:
  language: zh-CN
  maturity: experimental
  scope: project
  role: orchestrator
  dependency: ecc-preferred
  triggerMode: explicit-only
  scenario: migrate-safe
  requires: [task-triage, agent-env, task-docs]
  capabilityMap: orchestration/ecc-capability-map.md
---
# 安全迁移

> 触发方式：仅当用户输入 `/migrate-safe` 时使用。
> 不要根据普通自然语言请求自动套用本 skill。

## 用途

用于代码迁移、架构迁移、技术栈替换、API 替换、目录结构迁移或数据语义变化。迁移默认按高风险处理，先做代表性切片，再批量推进。

## 输入材料

如果用户没有提供完整材料，先补齐关键缺口。推荐包含：

- 通用输入材料：遵循 `orchestration/rules.md` 的“场景执行 skill 通用规则 / 通用输入材料”。
- 场景特有输入：旧技术/旧 API/旧目录结构、新目标、成功标准、回滚要求、是否允许不可逆变更。

## 核心规则

1. 默认按 XL 级处理；除非分诊结果明确降级，否则不要用普通 feature 流程简化处理。
2. 先盘点入口、依赖、测试、配置、数据、风险和兼容矩阵。
3. 先迁移代表性切片，通过后再批量推进。
4. 数据迁移必须有 dry-run、备份、回滚脚本或明确不可逆确认。
5. 大迁移可分区写入，但必须按模块/文件边界拆分，并由主 Agent 统一集成。
6. 数据迁移、生产配置、不可逆删除、跨系统发布或验证差异无法解释时必须暂停确认。
7. 通用工作流规则遵循 `orchestration/rules.md` 的“场景执行 skill 通用规则”。

## 流程

1. Discover：盘点入口、依赖、测试、配置、数据、风险和兼容矩阵。
2. Decide：提出分阶段迁移方案、样本切片、验证方式和回滚点。
3. Delegate：按职责派发只读探索、兼容性检查、风险审查和受限写入 Agent。
4. Implement：先迁移代表性切片；样本通过后再批量推进。
5. Verify：对比旧/新行为，运行构建、测试和关键路径验证。
6. Review：执行 correctness、security、performance 或 language-specific review。
7. Learn：记录迁移规则、映射关系、踩坑点和后续清理项，判断是否值得沉淀为候选资产。

## 执行前输出

遵循 `orchestration/rules.md` 的“场景执行 skill 通用规则 / 通用执行前输出”。

## 输出要求

- 明确迁移前后映射关系。
- 明确样本切片、批量推进条件和回滚点。
- 明确旧/新行为等价性的验证证据。
- 明确无法消除的兼容性、性能、安全或数据风险。
