# 项目内主动触发 Skill

本目录保存本项目的主动触发式 skill。作为插件安装后，入口会带插件命名空间，例如 `/orch-for-ecc:task-triage`；在本仓库内直接开发/测试时仍可按本文件中的短名称理解。

这些 skill 来自任务分诊、Agent 环境初始化、文档初始化与执行场景的编排流程，并已整理为中文入口。当前阶段所有 skill 均为实验性能力，**只应在用户显式输入对应 `/skill-name` 时使用**，不要根据普通自然语言请求自动套用。

本仓库定位为 ECC 插件能力编排器：项目内 skill 负责场景识别、风险收敛、能力组合、输入材料、停止条件和 Plan B；ECC 插件能力优先作为执行器。执行时应显式列出推荐调用的 `/ecc:*` 指令，不要隐藏式链式调用。

## 入口 Skill

| Skill | 用途 |
| --- | --- |
| `/orch-for-ecc:task-triage` | 任务分诊、四类未知收敛、场景与 S/M/L/XL 等级判断 |
| `/orch-for-ecc:agent-env` | 根据已确认分诊结果初始化本次 Agent 环境 |
| `/orch-for-ecc:task-docs` | 根据分诊与环境方案初始化任务文档计划 |
| `/orch-for-ecc:mvp-build` | 从零开发或 MVP 垂直切片工作流 |
| `/orch-for-ecc:feature-add` | 已有项目新增当前不存在的特性工作流 |
| `/orch-for-ecc:feature-change` | 已有功能按新规格改变行为工作流 |
| `/orch-for-ecc:refactor-safe` | 保持行为不变的安全重构工作流 |
| `/orch-for-ecc:migrate-safe` | 代码或架构迁移工作流 |
| `/orch-for-ecc:bug-fix` | Bug 定位与修复工作流 |

## 共享编排资料

共享规则、模板、ECC 能力映射和 ECC 插件能力基线不属于 skill，不放在本目录中。它们位于插件根目录的 `orchestration/` 和 `templates/`：

- `${CLAUDE_PLUGIN_ROOT}/orchestration/rules.md`
- `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md`
- `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-baseline.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/workflow-execution-template.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/report-template.md`

## 使用原则

1. 只在用户显式输入对应命名空间入口（如 `/orch-for-ecc:task-triage`）时使用。
2. 单阶段调用只执行该阶段，不自动串联后续阶段。
3. 信息不足时先补齐关键缺口，不假装上下文完整。
4. 执行前优先参考 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md`，显式列出推荐 ECC 能力和 Plan B。
5. 高风险、不可逆、生产副作用、凭证、权限扩大或文档冲突时暂停确认。
