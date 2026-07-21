# WorkerHelper

[English](README.md) | 简体中文

面向个人开发者的文档驱动 AI 编码工作流技能套件。它**按任务规模**标准化任务执行流程,并通过**功能路由表**快速定位功能代码。

支持的 harness:**OpenCode**、**Claude Code**、**Codex**。同一套 `skills/` 在三者上运行 —— 只是引导 / 激活机制随 harness 不同。

## 它做什么

- **先定位**:每个编码任务都先加载 `worker-lookup`,查询功能路由表并路由到正确的下一步。
- **按任务规模分流**:小改动 → 直接 `exec-plan`;中 / 大 / 范围不清晰 → `design` → `plan` → `exec-plan`;缺陷 → `worker-debug`。
- **规格驱动**:路由表与每个任务的设计 / 计划文档位于 `docs/workerhelper/`。

## 技能

`using-workerhelper` · `worker-lookup` · `worker-init` · `worker-sync` · `worker-debug` · `design` · `plan` · `exec-plan`

## 安装

选择你的 harness —— 同一套 `skills/` 在三者上运行;只是引导方式不同。

### Claude Code

标准市场安装:

```
/plugin marketplace add IcarusZy/workerhelper
/plugin install workerhelper@workerhelper-marketplace
```

SessionStart 钩子会在每次会话启动时自动注入 `using-workerhelper`(包括 `/clear` 与压缩之后)。

本地开发可改用 `/plugin install /absolute/path/to/workerhelper`。

### OpenCode

添加到 `opencode.json`(全局或项目级),然后重启 OpenCode:

```json
{ "plugin": ["workerhelper@git+https://github.com/IcarusZy/workerhelper.git"] }
```

详见 [`.opencode/INSTALL.md`](.opencode/INSTALL.md)。

### Codex

通过 Codex 的插件流程安装 —— 将本仓库作为市场源指向 Codex,然后在 Codex CLI 中运行 `/plugins`,搜索 `workerhelper` 并安装。`.codex-plugin/plugin.json` 声明技能;Codex 原生发现它们(无会话钩子)。已安装插件缓存在 `~/.codex/plugins/cache/`。

要让 `exec-plan` 的子代理(sub-agent)工作,在 `~/.codex/config.toml` 中启用多代理:

```toml
[features]
multi_agent = true
```

详见 [`skills/using-workerhelper/references/codex-tools.md`](skills/using-workerhelper/references/codex-tools.md)。

## 验证

在干净会话中发送任意编码任务。`using-workerhelper` 应在任何代码编写之前加载,并指引你先走 `worker-lookup`。

## 许可证

MIT —— 见 [LICENSE](LICENSE)。跨 harness 钩子引导基础设施改编自 [Superpowers](https://github.com/obra/superpowers);见 [NOTICES.md](NOTICES.md)。
