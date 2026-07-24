---
name: ECC 插件版本基线
type: baseline
language: zh-CN
scope: project
status: experimental
version: 2.0.0
recorded: 2026-07-21
---
# ECC 插件版本基线

## 用途

本文件只记录 `orch-for-ecc@orch-for-ecc` 插件适配的 ECC 插件版本基线。

项目使用的 `/ecc:*` 指令、`ecc:*` Agent 和 ECC MCP 配置模板参考，统一维护在：

```text
orchestration/ecc-capability-map.md
```

本文件不是 ECC 插件完整清单，也不是 ECC 插件发布说明。完整插件信息应通过当前环境命令查询，例如：

- `claude plugin list --json`
- `claude plugin details ecc@ecc`

## 当前基线

| 字段 | 值 |
| --- | --- |
| ECC 插件 ID | `ecc@ecc` |
| ECC 插件版本 | `2.0.0` |
| 记录日期 | `2026-07-21` |
| 信息来源 | `claude plugin list --json`、`claude plugin details ecc@ecc` |
| 能力映射文件 | `orchestration/ecc-capability-map.md` |

## 刷新原则

1. 当前环境安装的 ECC 插件是刷新基线时的事实来源。
2. 如果当前环境 ECC 版本与本文件不一致，先输出差异和 update 计划。
3. 用户确认前不写入 orch-for-ecc 插件配套文件。
4. 本文件不保存 ECC 全量 skills、agents、MCP 模板或组件清单。
5. orch-for-ecc skill 应保持自足，不依赖 ECC 插件内部文档才能理解任务流程。

## 不记录的内容

本文件不保存：

- ECC 插件完整 skill 列表。
- ECC 插件完整 agent 描述。
- ECC MCP 配置模板清单。
- 当前环境已启用 MCP servers 摘要。
- hooks / LSP / 组件数量摘要。
- token 成本明细。
- 本机敏感路径。
- secrets、token、真实用户隐私或生产敏感数据。

完整信息以当前环境命令查询结果为准。

## 刷新方式

使用项目维护 command；源码仓库维护场景应显式使用 `--source-root <path>`，避免把调用目录误当作基线目录：

```text
commands/ecc-check-update.md
node scripts/ecc-check-update.js --source-root .
```

刷新时应先查询当前环境，再对比默认模式下 `orch-for-ecc@orch-for-ecc.installPath` 或源码开发模式下 `--source-root <path>` 中的本文件和 `orchestration/ecc-capability-map.md`。不一致时先输出差异和刷新计划，用户确认后再写入 orch-for-ecc 插件配套文件。
