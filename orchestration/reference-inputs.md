---
name: 参考输入源规则
type: reference
language: zh-CN
scope: project
status: experimental
---
# 参考输入源规则

> 这是共享参考文件，不作为独立 skill 触发。
> `references/` 是人工维护的参考材料区，会影响 `/task-triage`、`/agent-env`、`/task-docs`、`/mvp-build`、`/feature-add`、`/feature-change`、`/bug-fix`、`/refactor-safe`、`/migrate-safe`。

## 定义

`references/` 用于存放人工提供的参考输入，例如：

- 各版本 draft 需求。
- 参考实现或样例代码。
- 设计参考、竞品材料或外部样例。
- 历史方案、讨论稿或临时说明。

## 默认规则

1. Agent 可以读取和引用 `references/`。
2. Agent 不默认生成、修改、清理 `references/`。
3. `references/` 是参考输入，不自动成为正式需求、验收标准或执行授权。
4. 如果 `references/` 与用户当前指令、已审批任务文档、正式 docs/release 文档或当前代码事实冲突，必须显式记录冲突，不自动采纳。
5. 参考实现只能作为理解或设计参考；不得无审查复制，涉及许可证、第三方代码、安全或隐私风险时必须确认。
6. 如果 `references/` 疑似过期、版本冲突或与本任务无关，应在上下文策略中标记为避免加载，防止上下文污染。
7. 不得把 secrets、token、真实用户隐私或生产敏感数据从 `references/` 传播进任务文档、报告或候选学习资产。

## 阶段使用方式

### `/task-triage`

- 将相关 `references/` 作为只读参考输入。
- 用于识别目标、范围、非目标、风险、验收候选和潜在冲突。
- 不把 draft 需求或参考实现自动视为最终验收标准。
- 输出中应说明引用了哪些参考输入，以及它们影响了哪些分诊判断。

### `/agent-env`

- 在上下文策略中明确哪些 `references/` 需要加载、按需加载或避免加载。
- 标明每个 reference 的用途，例如 draft 需求、参考实现、设计参考或历史方案。
- 默认只读；如果需要修改 `references/`，必须回到用户确认。
- 避免一次性加载过期或无关 reference 造成上下文污染。

### `/task-docs`

- 如果文档计划引用 `references/`，必须说明引用来源、影响的文档和仍需用户确认的内容。
- 不自动把 `references/` 晋升为正式 `docs/`、`releases/` 或验收清单。
- 如果 reference 与正式文档或代码事实冲突，应在文档计划或实现记录中记录冲突，并提示用户确认。

### `/mvp-build`、`/feature-add`、`/feature-change`、`/bug-fix`、`/refactor-safe`、`/migrate-safe`

- 将相关 `references/` 作为生成 `implementation-plan.md` 时的只读参考来源。
- Discover / Decide 阶段可以读取 reference 帮助理解和对比。
- Implement 阶段可参考实现思路，但不得盲拷参考实现。
- Verify 阶段不直接以 `references/` 为验收标准，除非其内容已被审批文档吸收。
