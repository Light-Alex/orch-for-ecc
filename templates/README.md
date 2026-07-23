# 模板文件

本目录保存可复制、可实例化的项目模板文件，不作为 Claude Code skill 触发。

## 文件说明

- `workflow-execution-template.md`：执行场景 skill 在实施前生成 `.claude/runs/<date>-<task-slug>/implementation-plan.md` 的模板。
- `report-template.md`：任务结束时汇总结果、验证证据、审查结论和残留风险的交付报告模板。

## 使用原则

1. 模板文件只定义输出结构，不直接代表已审批计划或交付结果。
2. 执行场景 skill 应按任务场景、分诊结果、Agent 环境方案和文档初始化方案实例化模板。
3. 如果模板与已审批任务材料冲突，暂停确认，不要擅自选择一边。
