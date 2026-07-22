---
name: ECC 能力映射
type: capability-map
language: zh-CN
scope: project
status: experimental
baseline: orchestration/ecc-baseline.md
---
# ECC 能力映射

## 用途

记录本项目 skill 与 ECC 插件能力之间的映射关系。

执行项目内 skill 时，应优先查询当前可用 ECC 能力，并在执行计划中显式列出推荐调用的 `/ecc:*` 指令、可选 `ecc:*` Agent、用途和 Plan B。如果 ECC 能力缺失、改名、不适用或粒度过粗，应按本文件的 Plan B 降级。

## 能力模型

ECC 能力分为三层：

1. 指令型能力：`/ecc:*`，适合作为优先入口，触发 ECC 插件封装好的流程。
2. Agent 型能力：`ecc:*`，适合作为专项执行单元，用于只读探索、专项审查、构建修复、文档更新、测试覆盖分析或受限写入。
3. 内建 / 项目能力：Claude Code 内建能力、CodeGraph、测试、lint、build、浏览器工具和项目已有脚本。

`/ecc:*` 指令可能内部编排一个或多个 `ecc:*` Agent，但本项目 skill 不依赖该内部实现。能力映射只记录推荐入口和可见专项能力，不把“某指令一定调用某 Agent”写成契约。

## 总原则

1. 优先使用 ECC 插件能力，但不要假设某个 `/ecc:*` 指令或 `ecc:*` Agent 一定存在。
2. 调用计划必须显式列出推荐入口、用途和阶段；推荐入口优先使用 `/ecc:*` 指令。
3. 当 `/ecc:*` 指令不可用、不适合或需要更细粒度控制时，可以选择职责明确的 `ecc:*` Agent。
4. 如果 ECC 能力不可用，先找职责明确的同类 ECC 能力，再找其他插件或内建 Claude Code 能力，最后手动执行。
5. 不使用职责不明确、风险边界不清或会扩大副作用的替代能力。
6. 涉及写入、发布、删除、迁移、真实外部副作用或生产数据时，必须保留用户确认门禁。
7. 本项目 skill 是编排器，ECC 插件是优先执行器；不要在项目内 skill 中重复实现 ECC 插件已有能力。

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
| 最新库 / API 文档查询 | `/ecc:documentation-lookup` | 查询框架、库、SDK 或 API 的最新文档和示例 | `ecc:docs-lookup` agent；Context7 / Web 文档；手动查阅官方文档 |
| checkpoint | `/ecc:checkpoint` | 保存阶段性状态和回滚点 | `git diff` + 手动记录阶段摘要 |

## Agent 能力映射

ECC Agent 是 `/ecc:*` 指令之外的可见专项能力。指令型能力适合触发固定流程；Agent 型能力适合只读探索、专项审查、构建修复、文档更新、测试覆盖分析或受限写入。

使用 Agent 型能力时遵循：

1. 探索、审查、安全、性能、文档建议类 Agent 默认只读。
2. build resolver、refactor cleaner、doc updater 等可写 Agent 必须限定文件范围、停止条件和验证命令。
3. 多 Agent 写入必须按模块或文件边界拆分，由主 Agent 汇总集成。
4. 不把某个 Agent 名称写成硬依赖；如果 Agent 不存在、改名或职责不适用，按 Plan B 降级。
5. 如果 `/ecc:*` 指令已经能稳定覆盖该阶段，优先使用指令入口；只有在指令不可用、不适合或需要细粒度控制时，才显式选择 Agent。

| 需求 | 优先 ECC Agent | 用途 | Plan B |
| --- | --- | --- | --- |
| 任务规划 | `ecc:planner`、`ecc:architect`、`ecc:code-architect` | 规划任务、设计方案、拆分实施步骤 | Claude Code plan mode；主 Agent 手动规划 |
| 代码探索 | `ecc:code-explorer` | 只读分析现有实现、调用链、依赖关系 | CodeGraph；Grep/Read；手动探索 |
| 架构设计 | `ecc:architect`、`ecc:code-architect` | 系统设计、模块边界、技术决策 | 主 Agent 设计；参考现有架构文档 |
| 文档更新 | `ecc:doc-updater` | 更新文档、codemap、README | 主 Agent 手动更新文档 |
| 构建修复 | `ecc:build-error-resolver`、语言专用 build resolver | 修复 build/type/compile 错误 | 主 Agent 最小修复；手动分析日志 |
| 代码审查 | `ecc:code-reviewer`、语言 / 框架专用 reviewer | correctness、maintainability、language-specific review | Claude Code 内建 code review；手动 checklist |
| 安全审查 | `ecc:security-reviewer` | 检查 secrets、注入、权限、安全边界 | 手动 OWASP checklist；安全审查清单 |
| 测试覆盖 | `ecc:pr-test-analyzer`、`ecc:tdd-guide` | 检查测试充分性、指导测试优先 | 主 Agent 手动测试计划 |
| 可访问性 | `ecc:a11y-architect` | WCAG、交互、UI 可访问性 | 手动 accessibility checklist |
| 性能优化 | `ecc:performance-optimizer` | 性能瓶颈分析和优化建议 | 手动 profiling；浏览器性能工具 |
| 简化重构 | `ecc:code-simplifier`、`ecc:refactor-cleaner` | 清理重复、死代码、复杂逻辑 | 主 Agent 小步重构 |
| E2E 验证 | `ecc:e2e-runner` | 端到端测试、关键用户旅程 | Playwright / 浏览器手动验证 |
| 质量评估 | `ecc:agent-evaluator` | 对 Agent 输出进行质量评分和改进建议 | 手动质量 checklist |
| Harness / 环境审计 | `ecc:harness-optimizer` | 分析本地 Agent harness 配置、可靠性、成本和吞吐 | 手动检查 settings、hooks、MCP 和权限配置 |
| 静默失败检查 | `ecc:silent-failure-hunter` | 检查吞错、错误降级、缺失错误传播和假成功 | 手动错误处理 checklist；针对关键路径补充回归用例 |
| 类型设计分析 | `ecc:type-design-analyzer` | 检查类型边界、封装、不变量表达和可维护性 | 手动检查接口、schema、DTO 和领域类型 |
| 注释准确性 | `ecc:comment-analyzer` | 检查注释过期、误导或缺失的维护风险 | 手动对照代码行为更新注释 |

语言 / 框架专用 reviewer / build resolver 可作为 `ecc:code-reviewer`、`ecc:build-error-resolver` 的专项 Plan B。例如 TypeScript / JavaScript、React、Vue、Go、Python、Java、Rust、Django、FastAPI、Flutter、Swift、Kotlin、C++、C#、F#、PHP、Dart、PyTorch 等项目可优先选择对应语言、框架或运行时 Agent；如果没有匹配 Agent，则回退到通用 reviewer / build resolver 或手动检查。项目内入口 skill 不维护完整语言矩阵，只要求执行时按当前技术栈选择最贴近的专项能力。

## 场景映射

### `/task-triage`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 分诊规划 | `/ecc:plan`、`/ecc:plan-canvas` | 辅助拆分任务、识别风险和验收 | 手动四类未知分析 |
| 编排判断 | `/ecc:multi-plan`、`/ecc:plan-orchestrate` | 判断是否需要多 Agent / workflow，形成编排策略 | 手动给出 Agent 派发建议 |
| 风险检查 | `/ecc:quality-gate` | 形成后续质量门禁建议 | 手动 blind spot pass |

### `/agent-env`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 能力盘点 | `/ecc:ecc-guide`、`/ecc:multi-plan`、`/ecc:configure-ecc` | 识别可用 ECC 能力、配置入口和编排方式 | 使用当前 `/skills`、`/context` 可见能力列表 |
| Agent 策略 | `/ecc:multi-plan`、`/ecc:harness-audit` | 规划只读 / 可写 Agent 边界，审计 harness 配置风险 | 手动列出 Agent 角色和写入边界 |
| 门禁策略 | `/ecc:quality-gate` | 设计验证与审查门禁 | 手动 test / lint / build / review 清单 |

### `/task-docs`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 文档规划 | `/ecc:update-docs`、`/ecc:documentation-lookup` | 识别需要更新的文档；需要库、框架、SDK 或 API 资料时查询最新官方文档 | 手动列出 `docs/`、`releases/`、`.claude/runs/`；`ecc:docs-lookup` agent；Context7 / Web 文档 |
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
| 探索 | `/ecc:plan`、`/ecc:orch-add-feature`、`/ecc:orch-change-feature`、`/ecc:codebase-onboarding`、`/ecc:code-tour` | 探索相似实现、调用链、权限点和代码结构；修改已有功能时可优先考虑 `/ecc:orch-change-feature` | CodeGraph / 只读探索 Agent / 手动读取代码 |
| 实现 | `/ecc:feature-dev` | 新增功能并控制改动范围 | 主 Agent 实现，避免顺手重构 |
| 构建修复 | `/ecc:build-fix` | 修复新增功能引起的构建问题 | 对应 build resolver agent |
| 审查 | `/ecc:code-review` | 检查正确性、维护性、边界 | 内建 code-review 或语言 reviewer agent |
| 门禁 | `/ecc:quality-gate` | 汇总验证结果 | 手动 test / lint / build |

### `/refactor-safe`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 重构规划 | `/ecc:plan`、`/ecc:orch-refine-code` | 拆分小阶段并定义行为不变证据 | 手动阶段计划 |
| 清理执行 | `/ecc:refactor-clean` | 删除重复、死代码或简化结构 | code-simplifier / refactor-cleaner agent |
| 验证 | `/ecc:quality-gate`、`/ecc:test-coverage`、`/ecc:verification-loop` | 每阶段验证行为不变，必要时循环验证关键路径 | 手动运行相关测试 |
| 审查 | `/ecc:code-review`、`/ecc:error-handling` | 检查行为不变、可维护性、错误处理和风险 | 内建 code-review 或 reviewer agent |

### `/migrate-safe`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 迁移规划 | `/ecc:plan`、`/ecc:multi-plan`、`/ecc:multi-workflow` | 拆分迁移阶段、样本切片、回滚点 | 手动迁移计划和兼容矩阵 |
| 分区执行 | `/ecc:multi-execute`、`/ecc:parallel-execution-optimizer` | 多 Agent 分区执行受控迁移，并优化并发边界 | 主 Agent 串行执行；限制写入边界 |
| 构建修复 | `/ecc:build-fix` | 修复迁移导致的构建问题 | 对应 build resolver agent |
| 审查 | `/ecc:code-review`、`/ecc:security-scan`、`/ecc:delivery-gate` | 检查兼容性、安全、副作用和交付门禁 | reviewer / security-reviewer agent |
| 门禁 | `/ecc:quality-gate` | 旧/新行为对比、测试、lint、build | 手动验证和差异说明 |
| 文档 | `/ecc:update-docs` | 更新迁移说明、回滚说明、release notes | 手动更新 `docs/` 和 `releases/` |

### `/bug-fix`

| 阶段 | 优先 ECC 能力 | 用途 | Plan B |
| --- | --- | --- | --- |
| 复现规划 | `/ecc:plan`、`/ecc:orch-fix-defect` | 明确现象、预期、复现路径 | 手动最小复现和诊断探针 |
| 构建 / 测试失败修复 | `/ecc:build-fix` | 处理失败命令、类型错误、构建错误 | 对应 build resolver agent；手动日志分析 |
| 修复 | `/ecc:feature-dev`、`/ecc:error-handling` | 做最小修复，必要时专项检查错误处理路径 | 主 Agent 最小改动 |
| 防回归 | `/ecc:test-coverage`、`/ecc:verification-loop` | 增加或检查回归测试，循环验证关键复现路径 | 手动增加失败测试 / 回归用例 |
| 审查 | `/ecc:code-review`、`/ecc:security-scan` | 检查副作用和安全风险 | 内建 code-review / security-review |
| 门禁 | `/ecc:quality-gate` | 汇总复现路径、测试和验证结果 | 手动运行相关验证命令 |

## MCP 配置模板参考

ECC 插件包含 MCP 配置模板库：

```text
mcp-configs/mcp-servers.json
```

这些模板不是默认启用能力，不代表当前环境已经配置，也不代表项目必须启用。它们用于 `/agent-env` 阶段按任务需要提出可选 MCP 配置建议。

使用原则：

1. 不默认启用任何 MCP。
2. 不把 MCP 配置模板当成 ECC 运行时能力。
3. 不检查用户是否已复制或启用这些 MCP。
4. 不自动复制模板到 Claude Code settings。
5. 涉及 token、API key、登录态、外部服务、本地服务或生产数据时，必须由用户手动配置并确认。
6. `/agent-env` 只能提出建议，不能擅自写 settings、启用 MCP 或处理凭证。
7. 为保护上下文窗口，建议保持启用 MCP 数量少于 10 个。

### 模板分类

| 类别 | MCP 配置模板 | 典型用途 | `/agent-env` 使用方式 |
| --- | --- | --- | --- |
| 成本 / 隐私 / 路由 | `nexus` | 本地成本、隐私代理、模型路由 | 需要成本统计、隐私遮蔽或路由策略时建议配置 |
| 项目协作 | `jira`、`github`、`confluence` | issue、PR、repo、团队文档 | 需要访问协作平台上下文时建议配置 |
| Web / 文档 / 搜索 | `firecrawl`、`exa-web-search`、`parallel-search`、`context7`、`cloudflare-docs`、`laraplugins` | 外部搜索、网页抓取、最新文档、插件检索 | 需要外部资料或最新文档时建议配置 |
| 数据库 / 数据平台 | `supabase`、`clickhouse` | 数据库操作、分析查询 | 需要数据库上下文且用户确认访问边界时建议配置 |
| 浏览器 / E2E | `playwright`、`browserbase`、`browser-use` | 浏览器自动化、云浏览器、Web 任务 | Web UI、E2E、可访问性或性能验证时建议配置 |
| 部署 / 云平台 | `vercel`、`railway`、`cloudflare-workers-builds`、`cloudflare-workers-bindings`、`cloudflare-observability` | 部署、构建、绑定、观测 | 需要检查部署、构建或云平台状态时建议配置 |
| 记忆 / 会话历史 | `memory`、`omega-memory`、`longhand`、`memxus`、`squish` | 记忆、历史检索、知识图谱 | 需要跨会话上下文且用户接受隐私边界时建议配置 |
| 推理 / 规划 | `sequential-thinking` | 分步推理 | 需要外部 MCP 推理工具且用户确认时建议配置 |
| 质量 / 评估 | `codescene`、`evalview` | 代码健康、Agent 回归评估 | 需要专项质量评估时建议配置 |
| UI / 媒体 | `magic`、`fal-ai` | UI 组件、媒体生成 | 需要设计组件或媒体生成服务时建议配置 |
| 文件系统 / 上下文优化 | `filesystem`、`token-optimizer` | 文件访问、上下文压缩 | 需要明确路径授权或上下文优化时建议配置 |
| 多 Agent / 编排 | `devfleet` | 多 Agent worktree 编排 | 需要外部 Agent 编排服务时建议配置 |

### 模板清单

| MCP 配置模板 | 说明 |
| --- | --- |
| `nexus` | 本地成本 / 隐私代理。 |
| `jira` | Jira issue tracking。 |
| `github` | GitHub PR、issue、repo 操作。 |
| `firecrawl` | Web scraping and crawling。 |
| `supabase` | Supabase database operations。 |
| `memory` | Persistent memory across sessions。 |
| `omega-memory` | Persistent agent memory with semantic search。 |
| `longhand` | Claude Code session history indexing。 |
| `sequential-thinking` | Chain-of-thought reasoning MCP。 |
| `vercel` | Vercel deployments and projects。 |
| `railway` | Railway deployments。 |
| `cloudflare-docs` | Cloudflare documentation search。 |
| `cloudflare-workers-builds` | Cloudflare Workers builds。 |
| `cloudflare-workers-bindings` | Cloudflare Workers bindings。 |
| `cloudflare-observability` | Cloudflare observability / logs。 |
| `clickhouse` | ClickHouse analytics queries。 |
| `exa-web-search` | Web search and research via Exa API。 |
| `parallel-search` | Parallel Web Search and fetch。 |
| `context7` | Live documentation lookup。 |
| `codescene` | CodeScene Code Health MCP。 |
| `magic` | Magic UI components。 |
| `memxus` | Universal persistent memory。 |
| `filesystem` | Filesystem operations with configured paths。 |
| `playwright` | Browser automation and testing via Playwright。 |
| `fal-ai` | AI image / video / audio generation。 |
| `browserbase` | Cloud browser sessions via Browserbase。 |
| `browser-use` | AI browser agent for web tasks。 |
| `devfleet` | Multi-agent orchestration。 |
| `token-optimizer` | Token optimization and context reduction。 |
| `laraplugins` | Laravel plugin discovery。 |
| `confluence` | Confluence Cloud integration。 |
| `evalview` | AI agent regression testing。 |
| `squish` | Local-first persistent memory runtime。 |

## 新增能力观察池

当前 ECC 可能包含大量领域型、实验型或高副作用能力。项目能力映射只采用与 8 个入口 skill 明确相关、边界清晰、具备 Plan B 的能力。其余新增能力按以下原则观察：

| 类型 | 代表能力 | 当前建议 | 采用条件 |
| --- | --- | --- | --- |
| 编排优化 | `/ecc:orch-pipeline`、`/ecc:team-agent-orchestration`、`/ecc:agent-sort`、`/ecc:team-builder`、`/ecc:council`、`/ecc:dynamic-workflow-mode` | observe-only | 明确比 `/ecc:multi-plan` / `/ecc:multi-workflow` 更适合本项目入口 skill，且能控制写入边界与 token 成本 |
| Agent harness / 环境 | `/ecc:agent-harness-construction`、`/ecc:agent-introspection-debugging`、`/ecc:agent-self-evaluation`、`/ecc:hookify`、`/ecc:hookify-configure`、`/ecc:hookify-help`、`/ecc:hookify-list`、`/ecc:config-gc` | enhancement-candidate | 仅在 `/agent-env`、harness 审计、hooks 或明确配置任务中使用；写入 settings、hooks、MCP 前必须再次确认 |
| 浏览器 / E2E / 可访问性 | `/ecc:browser-qa`、`/ecc:e2e-testing`、`/ecc:accessibility`、`/ecc:frontend-a11y`、`/ecc:frontend-design-direction` | enhancement-candidate | Web UI、MVP、可访问性或关键用户旅程验证需要浏览器证据，且用户接受额外运行成本 |
| 文档 / 架构 / 代码健康 | `/ecc:architecture-decision-records`、`/ecc:repo-scan`、`/ecc:codehealth-mcp`、`/ecc:coding-standards`、`/ecc:inherit-legacy-style` | enhancement-candidate | 需要 ADR、repo 扫描、代码健康、风格继承或重构前后质量证据，且输出范围明确 |
| 语言 / 框架专项能力 | `/ecc:react-build`、`/ecc:react-review`、`/ecc:python-review`、`/ecc:go-build`、`/ecc:rust-review`、对应语言 reviewer / build resolver Agent | enhancement-candidate | 当前项目技术栈明确匹配时，作为通用 build / review 的专项 Plan B；不在入口 skill 中维护完整语言矩阵 |
| MVP / GAN harness | `/ecc:gan-build`、`/ecc:gan-design`、`ecc:gan-planner`、`ecc:gan-generator`、`ecc:gan-evaluator` | observe-only | 任务需要高迭代 UI / 产品原型，且用户接受较高 token、浏览器验证和多轮写入成本 |
| 领域型能力 | marketing、finance、healthcare、network、homelab、scientific、video、trade 等相关 skill / agent | not-relevant | 入口 skill 明确转向对应领域项目，并能定义数据、凭证和外部副作用边界 |
| 双用途安全能力 | `/ecc:security-bounty-hunter`、领域安全专项能力 | observe-only | 用户提供明确授权上下文，且任务边界符合防御、审计、CTF 或授权测试要求 |
| 外部服务 / 配置能力 | `/ecc:configure-ecc`、MCP / settings / hook 相关能力 | enhancement-candidate | 仅在 `/agent-env` 或明确配置任务中使用，写入 settings、hooks、MCP 前必须再次确认 |

当推荐 ECC 能力不可用时，按以下顺序降级：

1. 查找职责明确的同类 `/ecc:*` 指令。
2. 如果指令不可用、不适合或需要更细粒度控制，查找职责明确的 `ecc:*` Agent。
3. 查找当前已加载插件中职责明确、风险边界相近的能力。
4. 使用 Claude Code 内建能力，例如 plan mode、code-review、verify。
5. 使用项目已有工具，例如测试、lint、build、CodeGraph。
6. 手动执行对应流程，并在报告中说明缺失的 ECC 能力和替代风险。

## 禁止事项

- 不把不存在的 `/ecc:*` 指令或 `ecc:*` Agent 当成硬依赖。
- 不把“某 `/ecc:*` 指令一定调用某个 `ecc:*` Agent”当成稳定契约。
- 不因为 ECC 能力缺失就跳过验证、审查或用户确认门禁。
- 不用职责不明确的插件能力替代高风险迁移、删除、发布或生产操作。
- 不在项目内 skill 中隐藏式链式调用多个 `/ecc:*`；必须让调用计划可见、可审阅。
