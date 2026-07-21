---
name: ecc-capability-map
summary: 项目内 skill 到 ECC 能力的映射与 Plan B
language: zh-CN
maturity: experimental
---

# ECC 能力映射

## 用途

记录本项目 skill 与 ECC 插件能力之间的映射关系。

执行项目内 skill 时，应优先查询当前可用 ECC 能力，并在执行计划中显式列出推荐调用的 `/ecc:*` 指令。如果 ECC 能力缺失、改名或不适用，应按本文件的 Plan B 降级。

## 总原则

1. 优先使用 ECC 插件能力，但不要假设某个 `/ecc:*` 一定存在。
2. 调用计划必须显式列出推荐的 `/ecc:*` 指令、用途和阶段。
3. 如果 ECC 能力不可用，先找职责明确的同类 ECC 能力，再找其他插件或内建 Claude Code 能力，最后手动执行。
4. 不使用职责不明确、风险边界不清或会扩大副作用的替代能力。
5. 涉及写入、发布、删除、迁移、真实外部副作用或生产数据时，必须保留用户确认门禁。
6. 本项目 skill 是编排器，ECC 插件是优先执行器；不要在项目内 skill 中重复实现 ECC 插件已有能力。

## 通用能力映射

| 需求 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 任务规划 | `/ecc:plan`、`/ecc:plan-canvas` | 制定计划、明确范围和验收 | Claude Code plan mode；手动输出计划草案 |
| PRD / 需求文档 | `/ecc:plan-prd` | 形成需求、范围和验收标准 | 手动 PRD 草案；`docs/` 中维护需求文档 |
| 项目初始化 | `/ecc:project-init` | 初始化项目结构和基础配置 | 手动创建骨架；按项目技术栈初始化 |
| 功能开发 | `/ecc:feature-dev` | 执行常规功能开发 | 主 Agent 实现；按任务 skill 的流程执行 |
| 多 Agent 规划 | `/ecc:multi-plan`、`/ecc:multi-workflow` | 多 Agent 拆分与编排 | 手动拆分 Agent 角色；限制写入边界 |
| 构建修复 | `/ecc:build-fix` | 修复 build / type / compile 错误 | 对应 build resolver agent；手动分析错误日志 |
| 代码审查 | `/ecc:code-review` | correctness / maintainability review | 内建 code-review；对应语言 reviewer agent；手动 checklist |
| 安全扫描 | `/ecc:security-scan` | 安全风险检查 | security-review；security-reviewer agent；手动 OWASP checklist |
| 测试覆盖 | `/ecc:test-coverage` | 检查测试充分性 | 手动运行测试；pr-test-analyzer agent |
| 质量门禁 | `/ecc:quality-gate` | 聚合测试、lint、build、审查结果 | 手动运行 test / lint / build 并汇总 |
| 文档更新 | `/ecc:update-docs` | 更新文档和 codemap | 手动更新 `docs/`；doc-updater agent |
| checkpoint | `/ecc:checkpoint` | 保存阶段性状态和回滚点 | `git diff` + 手动记录阶段摘要 |

## 场景映射

### `/task-triage`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 分诊规划 | `/ecc:plan`、`/ecc:plan-canvas` | 辅助拆分任务、识别风险和验收 | 手动四类未知分析 |
| 编排判断 | `/ecc:multi-plan` | 判断是否需要多 Agent / workflow | 手动给出 Agent 派发建议 |
| 风险检查 | `/ecc:quality-gate` | 形成后续质量门禁建议 | 手动 blind spot pass |

### `/agent-env`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 能力盘点 | `/ecc:ecc-guide`、`/ecc:multi-plan` | 识别可用 ECC 能力和编排方式 | 使用当前 `/skills`、`/context` 可见能力列表 |
| Agent 策略 | `/ecc:multi-plan` | 规划只读 / 可写 Agent 边界 | 手动列出 Agent 角色和写入边界 |
| 门禁策略 | `/ecc:quality-gate` | 设计验证与审查门禁 | 手动 test / lint / build / review 清单 |

### `/task-docs`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 文档规划 | `/ecc:update-docs` | 识别需要更新的文档 | 手动列出 `docs/`、`releases/`、`.claude/runs/` |
| 项目说明 | `/ecc:update-codemaps` | 更新 codemap 或架构索引 | 手动维护架构说明和影响面 |
| 交付门禁 | `/ecc:quality-gate` | 确保文档与验证结果一致 | 手动对照代码、测试和运行结果 |

### `/mvp-build`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| PRD / MVP | `/ecc:plan-prd`、`/ecc:plan` | 收敛目标用户、MVP 边界、验收标准 | 手动 PRD / MVP 草案 |
| 项目初始化 | `/ecc:project-init` | 初始化项目结构 | 手动按技术栈创建骨架 |
| 实现 | `/ecc:feature-dev`、`/ecc:orch-build-mvp` | 构建核心垂直切片 | 主 Agent 小步实现 |
| 验证 | `/ecc:quality-gate`、`/ecc:test-coverage` | 测试、lint、build、覆盖检查 | 手动运行验证命令 |
| 文档 | `/ecc:update-docs` | 更新 README、docs、运行记录 | 手动更新文档 |

### `/feature-add`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 探索 | `/ecc:plan`、`/ecc:orch-add-feature` | 探索相似实现、调用链、权限点 | CodeGraph / 只读探索 Agent / 手动读取代码 |
| 实现 | `/ecc:feature-dev` | 新增功能并控制改动范围 | 主 Agent 实现，避免顺手重构 |
| 构建修复 | `/ecc:build-fix` | 修复新增功能引起的构建问题 | 对应 build resolver agent |
| 审查 | `/ecc:code-review` | 检查正确性、维护性、边界 | 内建 code-review 或语言 reviewer agent |
| 门禁 | `/ecc:quality-gate` | 汇总验证结果 | 手动 test / lint / build |

### `/refactor-safe`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 重构规划 | `/ecc:plan`、`/ecc:orch-refine-code` | 拆分小阶段并定义行为不变证据 | 手动阶段计划 |
| 清理执行 | `/ecc:refactor-clean` | 删除重复、死代码或简化结构 | code-simplifier / refactor-cleaner agent |
| 验证 | `/ecc:quality-gate`、`/ecc:test-coverage` | 每阶段验证行为不变 | 手动运行相关测试 |
| 审查 | `/ecc:code-review` | 检查行为不变、可维护性和风险 | 内建 code-review 或 reviewer agent |

### `/migrate-safe`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 迁移规划 | `/ecc:plan`、`/ecc:multi-plan`、`/ecc:multi-workflow` | 拆分迁移阶段、样本切片、回滚点 | 手动迁移计划和兼容矩阵 |
| 分区执行 | `/ecc:multi-execute` | 多 Agent 分区执行受控迁移 | 主 Agent 串行执行；限制写入边界 |
| 构建修复 | `/ecc:build-fix` | 修复迁移导致的构建问题 | 对应 build resolver agent |
| 审查 | `/ecc:code-review`、`/ecc:security-scan` | 检查兼容性、安全和副作用 | reviewer / security-reviewer agent |
| 门禁 | `/ecc:quality-gate` | 旧/新行为对比、测试、lint、build | 手动验证和差异说明 |
| 文档 | `/ecc:update-docs` | 更新迁移说明、回滚说明、release notes | 手动更新 `docs/` 和 `releases/` |

### `/bug-fix`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 复现规划 | `/ecc:plan`、`/ecc:orch-fix-defect` | 明确现象、预期、复现路径 | 手动最小复现和诊断探针 |
| 构建 / 测试失败修复 | `/ecc:build-fix` | 处理失败命令、类型错误、构建错误 | 对应 build resolver agent；手动日志分析 |
| 修复 | `/ecc:feature-dev` | 做最小修复 | 主 Agent 最小改动 |
| 防回归 | `/ecc:test-coverage` | 增加或检查回归测试 | 手动增加失败测试 / 回归用例 |
| 审查 | `/ecc:code-review`、`/ecc:security-scan` | 检查副作用和安全风险 | 内建 code-review / security-review |
| 门禁 | `/ecc:quality-gate` | 汇总复现路径、测试和验证结果 | 手动运行相关验证命令 |

## Plan B 顺序

当推荐 ECC 能力不可用时，按以下顺序降级：

1. 查找职责明确的同类 `/ecc:*` 能力。
2. 查找当前已加载插件中职责明确、风险边界相近的能力。
3. 使用 Claude Code 内建能力，例如 plan mode、code-review、verify。
4. 使用项目已有工具，例如测试、lint、build、CodeGraph。
5. 手动执行对应流程，并在报告中说明缺失的 ECC 能力和替代风险。

## 禁止事项

- 不把不存在的 `/ecc:*` 当成硬依赖。
- 不因为 ECC 能力缺失就跳过验证、审查或用户确认门禁。
- 不用职责不明确的插件能力替代高风险迁移、删除、发布或生产操作。
- 不在项目内 skill 中隐藏式链式调用多个 `/ecc:*`；必须让调用计划可见、可审阅。
