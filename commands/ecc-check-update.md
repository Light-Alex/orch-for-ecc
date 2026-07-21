---
name: ecc-check-update
description: 检查当前环境安装的 ECC 插件版本是否与项目基线一致；一致则报告无需更新，不一致则列出差异并生成等待审批的 update 计划。
metadata:
  language: zh-CN
  scope: project
  role: maintenance-command
  triggerMode: explicit-only
---
# ECC 检查更新

> 触发方式：仅当用户输入 `/ecc-check-update` 或明确要求执行本 command 时使用。
> 默认只检查和生成刷新计划；写入项目文件前必须先让用户确认。

## 用途

检查当前环境安装的 ECC 插件信息是否与本项目记录的 ECC 基线一致。

本 command 维护：

- `orchestration/ecc-baseline.md`
- `orchestration/ecc-capability-map.md`
- 必要时同步检查 `skills/*/SKILL.md`

## 执行流程

1. 查询当前环境 ECC 插件：
   - `claude plugin list --json`
   - `claude plugin details ecc@ecc`
2. 读取项目基线：
   - `orchestration/ecc-baseline.md`
3. 读取项目能力映射：
   - `orchestration/ecc-capability-map.md`
4. 按需扫描入口 skill：
   - `skills/*/SKILL.md`
5. 对比：
   - ECC 插件版本。
   - `/ecc:*` 指令是否可在当前 ECC skills / commands 中找到对应能力。
   - `ecc:*` Agent 是否可在当前 ECC agents 中找到对应能力。
   - 当前项目关注的 MCP / hooks / LSP 摘要是否变化。
6. 输出检查结论：
   - 如果一致：报告当前环境 ECC 与项目基线一致，无需更新。
   - 如果不一致：报告不一致，列出差异点，并生成 update 计划。
7. 等待用户审批：用户批准前不写入项目文件。

## 只读检查脚本

优先使用命令和脚本收集事实，不手工猜测。

~~~bash
python - <<'PY'
import json
import re
import subprocess
from pathlib import Path

ROOT = Path.cwd()
BASELINE = ROOT / 'orchestration' / 'ecc-baseline.md'
CAPABILITY_MAP = ROOT / 'orchestration' / 'ecc-capability-map.md'
SKILLS_DIR = ROOT / 'skills'


def run(cmd):
    return subprocess.run(cmd, text=True, capture_output=True, check=False)


def read(path):
    return path.read_text(encoding='utf-8') if path.exists() else ''


def extract_project_refs():
    texts = []
    for path in [BASELINE, CAPABILITY_MAP]:
        texts.append(read(path))
    if SKILLS_DIR.exists():
        for path in SKILLS_DIR.glob('*/SKILL.md'):
            texts.append(read(path))
    text = '\n'.join(texts)
    commands = sorted(set(re.findall(r'/ecc:[A-Za-z0-9_-]+', text)))
    agents = sorted(set(
        item for item in re.findall(r'(?<![/@\w-])ecc:[A-Za-z0-9_-]+', text)
        if item != 'ecc:baseline'
    ))
    return commands, agents


def parse_baseline_version():
    text = read(BASELINE)
    m = re.search(r'^version:\s*([^\n]+)$', text, re.M)
    return m.group(1).strip() if m else None


def parse_details(text):
    skills = set()
    agents = set()
    counts = {}
    for key in ['Skills', 'Agents', 'Hooks', 'MCP servers', 'LSP servers']:
        m = re.search(rf'{re.escape(key)} \((\d+)\)', text)
        if m:
            counts[key] = int(m.group(1))

    skills_match = re.search(r'Skills \(\d+\)\s+(.*?)(?:\n\s+Agents \(|\n\s+Hooks \()', text, re.S)
    if skills_match:
        skills = {s.strip() for s in skills_match.group(1).replace('\n', ' ').split(',') if s.strip()}

    agents_match = re.search(r'Agents \(\d+\)\s+(.*?)(?:\n\s+Hooks \(|\n\s+MCP servers \()', text, re.S)
    if agents_match:
        agents = {s.strip() for s in agents_match.group(1).replace('\n', ' ').split(',') if s.strip()}

    return counts, skills, agents


result = {
    'plugin': None,
    'baselineVersion': parse_baseline_version(),
    'projectCommands': [],
    'projectAgents': [],
    'missingCommands': [],
    'missingAgents': [],
    'componentCounts': {},
    'warnings': [],
}

list_cmd = run(['claude', 'plugin', 'list', '--json'])
if list_cmd.returncode != 0:
    result['warnings'].append('failed to run claude plugin list --json: ' + list_cmd.stderr.strip())
else:
    try:
        plugins = json.loads(list_cmd.stdout)
        result['plugin'] = next((p for p in plugins if p.get('id') == 'ecc@ecc'), None)
        if not result['plugin']:
            result['warnings'].append('ecc@ecc is not installed or not visible in plugin list')
    except json.JSONDecodeError as exc:
        result['warnings'].append(f'failed to parse plugin list JSON: {exc}')

details_cmd = run(['claude', 'plugin', 'details', 'ecc@ecc'])
if details_cmd.returncode != 0:
    result['warnings'].append('failed to run claude plugin details ecc@ecc: ' + details_cmd.stderr.strip())
    counts, installed_skills, installed_agents = {}, set(), set()
else:
    counts, installed_skills, installed_agents = parse_details(details_cmd.stdout)
    result['componentCounts'] = counts

project_commands, project_agents = extract_project_refs()
result['projectCommands'] = project_commands
result['projectAgents'] = project_agents

# /ecc:foo usually corresponds to an installed skill/command shim named foo.
result['missingCommands'] = [cmd for cmd in project_commands if cmd.removeprefix('/ecc:') not in installed_skills]
# ecc:foo usually corresponds to an installed agent named foo.
result['missingAgents'] = [agent for agent in project_agents if agent.removeprefix('ecc:') not in installed_agents]

installed_version = result['plugin'].get('version') if result['plugin'] else None
result['versionStatus'] = 'OK' if installed_version == result['baselineVersion'] else 'DIFF'

print(json.dumps(result, ensure_ascii=False, indent=2))
PY
~~~

## 检查报告模板

### 一致时

~~~markdown
# ECC 检查结果

## 结论

当前环境 ECC 与项目基线一致，无需更新。

## 当前环境

- ECC 插件：`ecc@ecc`
- 当前版本：`<installed-version>`
- 基线版本：`<baseline-version>`
- 状态：`enabled: <true|false>`

## 校验结果

- `/ecc:*` 指令：无缺失
- `ecc:*` Agent：无缺失
- 关注组件摘要：一致

## 下一步

无需操作。
~~~

### 不一致时

~~~markdown
# ECC 检查结果

## 结论

当前环境 ECC 与项目基线不一致，需要审批后更新。

## 当前环境

- ECC 插件：`ecc@ecc`
- 当前版本：`<installed-version>`
- 基线版本：`<baseline-version>`
- 状态：`enabled: <true|false>`

## 差异点

| 类型 | 基线 / 项目引用 | 当前环境 | 影响 |
| --- | --- | --- | --- |
| 版本 | `<baseline-version>` | `<installed-version>` | 需要刷新基线 |
| `/ecc:*` 指令 | `<project-command>` | 缺失 / 改名候选 | 需要确认替代能力 |
| `ecc:*` Agent | `<project-agent>` | 缺失 / 改名候选 | 需要确认替代 Agent |
| 关注组件 | `<baseline-summary>` | `<current-summary>` | 需要判断是否影响项目 |

## Update 计划

1. 更新 `orchestration/ecc-baseline.md` 的版本和项目关注组件摘要。
2. 检查并更新 `orchestration/ecc-capability-map.md` 中缺失、改名或不适用的能力。
3. 必要时更新 `skills/*/SKILL.md` 的推荐能力引用。
4. 重新验证文档路径、能力引用和 Markdown 格式。

## 等待审批

请确认是否按以上 update 计划刷新项目配套内容。用户审批前不写入项目文件。
~~~

## 不一致时的处理原则

1. 以当前环境安装的 ECC 插件为事实来源。
2. 先输出差异点和 update 计划，不直接写入。
3. 不自动删除项目能力映射中的能力；缺失能力可能是解析缺口、插件未启用、命令改名或当前环境异常。
4. 不自动把 ECC 新增的所有能力加入项目映射；只加入当前 8 个入口 skill 需要的能力。
5. 对疑似改名的能力，只输出候选替代，不自动替换。
6. 用户审批前不写入项目文件。
7. 写入前必须确认影响文件和具体改动。

## 用户审批后的可写入范围

用户确认后，允许按确认范围更新：

- `orchestration/ecc-baseline.md`
- `orchestration/ecc-capability-map.md`
- `skills/*/SKILL.md`
- `orchestration/README.md`

禁止自动修改：

- `.claude/commands/`
- 全局 ECC 插件目录
- Claude Code settings / hooks / MCP 配置
- secrets、token、凭证或生产敏感数据

## 验证

刷新后至少检查：

1. `orchestration/ecc-baseline.md` 版本与 `claude plugin list --json` 中 `ecc@ecc.version` 一致。
2. `orchestration/ecc-capability-map.md` 中推荐的 `/ecc:*` 指令和 `ecc:*` Agent 有 Plan B。
3. 8 个入口 skill 的 `metadata.capabilityMap` 仍指向 `orchestration/ecc-capability-map.md`。
4. 没有把 ECC 全量组件清单写入 `ecc-baseline.md`。
5. Markdown 末尾换行正常。
