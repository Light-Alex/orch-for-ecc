---
name: 交付报告模板
type: template
language: zh-CN
scope: project
status: experimental
---
# 交付报告模板

> 这是共享参考文件，不作为独立 skill 触发。
> 执行类 skill 应在任务结束时按需引用本模板。

```markdown
# Delivery Report

## Outcome
- 完成了什么

## User-visible Behavior
- 用户会看到什么变化

## Task Triage
- 场景、等级、风险和审批结论

## Agent Environment
- 本次启用 / 避免的能力、Agent、MCP、hooks

## Document Initialization
- 本次创建 / 更新的 docs、releases、run 文档
- 空白上下文 Agent 实际读取的启动材料
- 文档与代码 / 测试 / 真实系统行为是否存在冲突

## Key Decisions
- 决策与原因

## Deviations From Plan
- 偏离与风险

## Verification Evidence
- 命令、结果、截图或 E2E 证据

## Review Results
- correctness / security / performance / simplify 结论

## Residual Risks
- 剩余风险与建议

## Learn Back To ECC
- 是否有值得沉淀的经验
- 建议沉淀为 skill / command / workflow / hook / rule 的内容
- 保存位置建议：Global 还是 Project
- 如果不沉淀，说明原因

## Quiz
1. 为什么这样设计？
2. 哪些测试证明核心行为？
3. 如果线上出问题，如何回滚或定位？
```
