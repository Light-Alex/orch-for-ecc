---
name: 共享执行规则
type: reference
language: zh-CN
scope: project
status: experimental
---
# 共享执行规则

> 这是共享参考文件，不作为独立 skill 触发。
> 执行场景 skill 应按需引用本文件。

## 插件内置编排资料定位

`orchestration/*.md` 和 `templates/*.md` 是 orch-for-ecc 插件随包提供的共享资料，不是目标业务项目必须自带的目录。所有 skill 引用这些共享资料时，必须使用插件根目录定位：

- 共享规则：`${CLAUDE_PLUGIN_ROOT}/orchestration/rules.md`
- ECC 基线：`${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-baseline.md`
- ECC 能力映射：`${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md`
- 参考输入规则：`${CLAUDE_PLUGIN_ROOT}/orchestration/reference-inputs.md`
- 执行计划模板：`${CLAUDE_PLUGIN_ROOT}/templates/workflow-execution-template.md`
- 交付报告模板：`${CLAUDE_PLUGIN_ROOT}/templates/report-template.md`

定位顺序：

1. 插件运行模式是默认模式。用户通过 `/orch-for-ecc:*` 使用已安装插件时，必须先通过 Claude 插件元数据定位 `orch-for-ecc@orch-for-ecc.installPath`，并把该目录作为 `${CLAUDE_PLUGIN_ROOT}`；不要把当前工作目录或目标业务项目相对路径当作 orch-for-ecc 插件根目录。
2. 推荐定位方式是运行 `claude plugin list --json`，选择 `id === "orch-for-ecc@orch-for-ecc"` 的对象，并读取其 `installPath`。不要为了 bootstrap `${CLAUDE_PLUGIN_ROOT}` 而先依赖 `${CLAUDE_PLUGIN_ROOT}/scripts/...`。
3. 源码开发或本仓库调试时，只有在用户明确要求维护源码仓库、或命令显式传入 `--source-root <path>`，且该路径存在 `.claude-plugin/plugin.json`、`name` 为 `orch-for-ecc` 时，才可读取源码仓库根目录下同名文件。
4. 只有插件根目录和显式源码根目录都无法定位时，才报告这些共享资料缺失，并把该缺口列为 Plan B/未知项。

不要把目标业务项目目录下没有 `orchestration/` 或 `templates/` 误判为 orch-for-ecc 共享资料缺失。

## 依赖插件定位

如需读取当前已安装 `ecc@ecc` 插件内置文件（例如 `README.md`、`mcp-configs/mcp-servers.json`、skills、agents 或 commands），必须通过 Claude 插件元数据定位：

1. 运行 `claude plugin list --json`。
2. 选择 `id === "ecc@ecc"` 的对象。
3. 使用该对象的 `installPath` 作为 ECC 插件根目录。
4. 只在该根目录内读取目标文件。

脚本化定位可使用：

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/locate-plugin.js" --plugin-id ecc@ecc
```

不要递归扫描 `~/.claude/plugins/cache/**/README.md`、按目录名猜测版本路径，或在未确认 `installPath` 前读取 Claude 插件缓存中的随机文件。其他 skill 如果需要定位 `ecc@ecc` 插件目录，也必须遵守本节规则。

## 自适应规则

1. 按已确认分诊中的 S/M/L/XL 等级调整流程强度。
2. 只启用环境方案建议的必要能力，不默认全量启用。
3. 按文档初始化方案决定需要读取、创建或更新哪些文档。
4. 按环境方案决定是否使用 CodeGraph、子 Agent、workflow、MCP、checkpoint。
5. 执行前优先参考 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md`，查询当前可用 ECC 能力，并在计划中显式列出推荐调用的 `/ecc:*` 指令。
6. 如果 ECC 能力缺失、改名或不适用，按能力映射中的 Plan B 降级；不得把不存在的 `/ecc:*` 写成硬依赖。
7. 默认遵循单写入责任人原则：同一阶段只允许一个 Agent 负责同一批文件的写入。
8. 探索、文档、审查、安全、性能类 Agent 默认只读，只输出结论、风险和建议。
9. build-fix、refactor、migration 类 Agent 可以写，但必须限定修改范围、验证命令和停止条件。
10. 如果需要多个写入 Agent，必须先按模块或文件边界拆分，并由主 Agent 汇总集成和最终验收。
11. 如果执行中发现风险高于分诊结果，自动升级等级并暂停确认。
12. 如果执行中发现风险低于分诊结果，可以建议降级，但不能擅自跳过已确认门禁。
13. 所有偏离分诊、环境方案或文档初始化方案的动作，必须写入实现记录或最终报告。
14. 如果初始化文档与当前代码、测试或真实系统行为冲突，暂停确认，不要擅自选择一边。
15. 任务结束前做学习判断：只把稳定、跨任务可复用的经验作为候选沉淀，不自动写入永久资产。

## 执行场景 skill 通用规则

“执行场景 skill”指需要基于已确认分诊、Agent 环境方案和文档初始化方案生成 `implementation-plan.md`，并进入实际实施、验证、审查和交付报告的场景入口；不包括 `/task-triage`、`/agent-env`、`/task-docs` 这类前置分诊 / 初始化入口。

当前适用于 `/mvp-build`、`/feature-add`、`/feature-change`、`/bug-fix`、`/refactor-safe`、`/migrate-safe`。

### 通用输入材料

执行场景 skill 生成实施计划时，默认以以下材料为输入：

- 已确认的任务分诊结果：目标、非目标、等级、风险、验收标准。
- 已确认的 Agent 环境方案：允许使用的 Agent、MCP、workflow、验证与审查策略。
- 已确认的文档初始化方案：文档边界和写入策略。
- 相关正式文档：`docs/...`、`releases/...`。
- 人工参考材料：`references/...` 中的 draft 需求、参考实现或样例材料，只读参考；使用规则见 `${CLAUDE_PLUGIN_ROOT}/orchestration/reference-inputs.md`。

执行阶段还必须以已审批的 `.claude/runs/<date>-<task-slug>/implementation-plan.md` 为实施基线。

### 通用工作流规则

1. 执行场景 skill 执行前参考 `${CLAUDE_PLUGIN_ROOT}/orchestration/ecc-capability-map.md` 和已确认的 Agent 环境方案，选择本场景相关 ECC 能力；实施计划中必须落到具体 `/ecc:*` 指令或 `ecc:<agent>`。
2. 执行场景 skill 执行前必须基于 `${CLAUDE_PLUGIN_ROOT}/templates/workflow-execution-template.md` 生成 `.claude/runs/<date>-<task-slug>/implementation-plan.md`，说明每个阶段的 ECC 指令 / Agent、Plan B、写入边界和自动执行边界，供用户审批。
3. 如果某阶段选择 ECC `orch-*` 指令作为执行器，则该阶段的具体实施流程以 `orch-*` 内建流程为主；本执行场景 skill 的阶段流程仅作为 `orch-*` 不可用、不适配或用户明确不使用时的 Plan B。
4. 无论是否使用 ECC `orch-*`，执行期记录与交付文档仍按 `implementation-plan.md` 和 `${CLAUDE_PLUGIN_ROOT}/templates/workflow-execution-template.md` 的“执行期记录与交付”要求维护。
5. 用户审批 `implementation-plan.md` 后，对应 skill 才能按该计划进入实施。
6. 执行时以已审批执行基线为准，不重新分诊、不重新初始化环境、不主动改写 `diagnosis.md`、`agent-environment.md`、`document-initialization.md`、`implementation-plan.md`、`docs/...`、`releases/...` 或 `references/...`。
7. `references/` 只能按 `${CLAUDE_PLUGIN_ROOT}/orchestration/reference-inputs.md` 作为人工只读参考输入；其 draft 需求或参考实现不自动成为验收标准，除非已被审批文档吸收。
8. 如果 ECC 能力缺失、改名或不适用，按 Plan B 降级，并说明替代方案、能力缺口和风险。
9. 执行时引用本文件，结束时参考 `${CLAUDE_PLUGIN_ROOT}/templates/report-template.md`。

### 通用执行前输出

实际执行前，`/mvp-build`、`/feature-add`、`/feature-change`、`/bug-fix`、`/refactor-safe`、`/migrate-safe` 必须按 `${CLAUDE_PLUGIN_ROOT}/templates/workflow-execution-template.md` 生成 `.claude/runs/<date>-<task-slug>/implementation-plan.md` 供用户审批，至少包含：

- 执行基线；
- 场景化执行流程；
- 验证与审查门禁；
- 执行期记录与交付；
- 不做事项；
- 用户确认后自动执行范围。

## 必须暂停确认的情况

- 目标、非目标或验收标准不清楚。
- 需要删除、覆盖或不可逆修改数据。
- 涉及生产部署、真实支付、真实邮件、短信或外部批量请求。
- 涉及凭证、权限扩大、安全高风险动作。
- 涉及 destructive migration。
- 当前文档与代码、测试或真实系统行为冲突。
- 预计风险等级高于原分诊结果。
- 连续修复没有新增信息。

## 学习沉淀判断

建议沉淀：

- 修复了非显而易见的错误，未来可能再次遇到。
- 发现了项目特有的架构、测试、权限或发布约定。
- 形成了新的 prompt、workflow、hook、rule 或 command 候选。
- 迁移、重构、bug 修复中出现了可复用的诊断路径。
- 本次任务暴露了 Agent 容易重复犯的错误。

不要沉淀：

- 拼写修复。
- 一次性线上故障细节。
- 临时 API 抖动。
- 只对当前对话有意义的信息。
