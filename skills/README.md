# 项目内 Skill 说明

本目录保存本项目的主动触发式 skill。它们用于把任务分诊、环境初始化、文档初始化和五类执行场景组织成可复用的工作流入口。

## 定位

本仓库的定位是 ECC 插件能力编排器：

- 项目内 skill 负责识别任务场景、收敛风险、制定能力组合、定义输入材料、停止条件和 fallback。
- ECC 插件优先作为能力提供方，负责规划、实现、审查、验证、文档更新和多 Agent 编排等具体能力。
- 如果 ECC 插件缺失、改名或不适用，按 `skills/shared/ecc-capability-map.md` 中的 Plan B 降级。

## 触发方式

这些 skill 当前仍处于实验阶段，只能由用户显式输入 `/skill-name` 主动触发。

不要根据普通自然语言请求自动套用这些 skill。

## 运行时依赖

运行时以 `skills/` 目录内的内容为准，不依赖 `references/agent-workflow-solution.md`。

这些 skill 最初由项目参考文档第 10 章提炼而来；如果发现执行所需的规则、停止条件、输出格式、ECC 能力组合或 fallback 策略缺失，应直接补充到对应 skill 或 `skills/shared/` 文件中。

## 入口

| 入口 | 用途 |
| --- | --- |
| `/task-triage` | 任务分诊与四类未知收敛 |
| `/agent-env` | Agent 环境初始化 |
| `/task-docs` | 任务文档初始化 |
| `/mvp-build` | 从零开发 / MVP 工作流 |
| `/feature-add` | 已有项目加新特性工作流 |
| `/refactor-safe` | 保持行为不变的安全重构工作流 |
| `/migrate-safe` | 代码或架构迁移工作流 |
| `/bug-fix` | Bug 定位与修复工作流 |

## 共享参考

| 文件 | 用途 |
| --- | --- |
| `skills/shared/ecc-plugin.md` | 记录 ECC 插件基线、能力快照和升级检查流程 |
| `skills/shared/ecc-capability-map.md` | 记录项目内 skill 到 ECC 能力的映射和 Plan B |
| `skills/shared/rules.md` | 五类执行场景共享规则 |
| `skills/shared/report.md` | 交付报告模板 |
