# Orchestration 共享编排资料

本目录保存项目级共享编排资料，不作为 Claude Code skill 触发。

`skills/` 目录只保存用户可显式触发的入口 skill；这些 skill 在执行时按需引用本目录中的规则、ECC 能力映射和 ECC 插件能力基线。可复制、可实例化的输出模板位于项目根目录 `templates/`。

## 文件说明

- `rules.md`：执行场景共享规则，包括 S/M/L/XL 自适应、单写入责任人、暂停确认和学习沉淀判断。
- `ecc-capability-map.md`：项目内 skill 到 ECC `/ecc:*` 指令和 `ecc:*` Agent 的推荐映射与 Plan B 降级顺序。
- `ecc-baseline.md`：当前项目实际依赖或推荐使用的 ECC 插件版本与能力基线。

## 维护原则

1. 本目录文件是共享参考资料，不是可调用 skill。
2. ECC 插件升级后，优先使用 `commands/ecc-check-update.md` 检查当前环境与 `ecc-baseline.md` 是否一致，再检查 `ecc-capability-map.md` 和各入口 skill 的引用。
3. 如果某个共享规则变成稳定、可独立触发的能力，再考虑迁移为 `skills/<name>/SKILL.md`。

## 相关维护 command

- `commands/ecc-check-update.md`：检查当前环境安装的 ECC 插件版本是否与项目基线一致，并在不一致时生成刷新计划。
