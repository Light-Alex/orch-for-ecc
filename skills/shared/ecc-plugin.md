---
name: ecc-plugin
summary: ECC 插件基线与升级检查
language: zh-CN
maturity: experimental
---

# ECC 插件基线

## 用途

记录本项目 skill 设计时所依据的 ECC 插件能力基线、能力快照来源和兼容策略。

本文件不是 ECC 插件本身的发布说明；它只记录本项目使用 ECC 能力时需要关注的适配信息。

## 当前基线

- 记录日期：2026-07-21
- ECC 插件来源：当前 Claude Code 会话可见的 ECC 插件能力
- ECC 插件版本：2.0.0
- 能力快照来源：当前会话 `/context`、`/skills` 和可用 agent 列表
- 备注：如果 ECC 插件以后提供稳定版本命令或版本文件，应补充到本节。

## 兼容策略

1. 项目内 skill 优先使用 ECC 插件能力。
2. 如果 `/ecc:*` 指令不存在、改名或行为变化，应使用 `skills/shared/ecc-capability-map.md` 中的 Plan B。
3. ECC 插件升级后，不直接假设兼容；先刷新能力映射。
4. 本项目 skill 应保持自足，不依赖 ECC 插件内部文档才能理解任务流程。
5. 版本记录不得保存 token、密钥、真实用户隐私、生产敏感数据或不必要的本机敏感路径。

## 升级检查清单

ECC 插件升级后，按以下步骤检查：

- [ ] 记录新的插件版本、commit 或能力快照日期。
- [ ] 对比当前 `/ecc:*` 指令列表是否变化。
- [ ] 对比常用 agent 名称是否变化。
- [ ] 检查 build / review / test / quality-gate 能力是否变化。
- [ ] 检查 orchestration 相关能力是否变化。
- [ ] 更新 `skills/shared/ecc-capability-map.md`。
- [ ] 抽样验证 `/task-triage`、`/bug-fix`、`/migrate-safe` 的推荐能力组合是否仍然合理。
- [ ] 如果某个 ECC 能力缺失或行为变化，补充 Plan B 或调整映射。

## 能力快照维护原则

能力快照比单个版本号更重要。因为本项目真正依赖的是“某类任务可用哪些 ECC 能力组合”。

更新快照时至少记录：

| 字段 | 说明 | 示例 |
| --- | --- | --- |
| 记录日期 | ISO 日期 | `2026-07-21` |
| 能力来源 | 从哪里看到能力列表 | `/context`、`/skills` |
| 变化类型 | 新增 / 删除 / 改名 / 行为变化 | `新增` |
| 影响场景 | 影响哪个项目内 skill | `/bug-fix` |
| 处理方式 | 更新映射或 Plan B | `改用 /ecc:build-fix` |

## 不确定点

当前 ECC 插件版本号尚未标准化记录。因此本项目先以能力快照和能力映射作为兼容基线。

如果以后可以稳定获取 ECC 插件版本，应优先补充：

- 插件包版本。
- 插件 commit hash。
- 插件安装来源。
- 版本对应的 `/ecc:*` 能力列表。
