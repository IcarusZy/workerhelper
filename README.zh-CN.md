# WorkerHelper

[English](README.md) | 简体中文

面向个人开发者的文档驱动 AI 编码工作流技能套件。它**按任务规模**标准化任务执行流程,并通过**功能路由表**快速定位功能代码。

支持的 harness:**OpenCode**、**Claude Code**、**Codex**。同一套 `skills/` 在三者上运行 —— 只是引导 / 激活机制随 harness 不同。

## 它做什么

- **先定位**:每个编码任务都先加载 `worker-lookup`,查询功能路由表并路由到正确的下一步。
- **按任务规模分流**:小改动 → 直接 `exec-plan`;中 / 大 / 范围不清晰 → `design` → `plan` → `exec-plan`;缺陷 → `worker-debug`。
- **绿地建项目**:空目录或明确的新建意图 → `worker-greenfield`(grilling 式需求澄清、五节架构议程、脚手架落地、占位路由表)。
- **环境自动接线**:`worker-env` 从 `.env` / `application.yml` 发现连接信息,经两层注册表(`~/.workerhelper/` 覆盖内置默认)配置 MCP 工具并验证,产出环境地图供 `worker-debug` 远程日志探针使用。
- **规格驱动**:路由表、词汇表、ADR 与每个任务的设计 / 计划文档位于 `docs/workerhelper/`。

## 技能

`using-workerhelper` · `worker-lookup` · `worker-init` · `worker-greenfield` · `worker-env` · `worker-sync` · `worker-debug` · `design` · `plan` · `exec-plan`

## 存储结构

WorkerHelper 在你项目中的 `docs/workerhelper/` 目录下写入产物,共同构成"位置 ↔ 规约"闭环。

```
docs/workerhelper/
├── feature-routes.md          # 小项目:单文件路由表
├── feature-routes/            # 大项目:目录模式(渐进式披露)
│   ├── index.md               #   总索引:模块 → 文件 + 摘要
│   └── <module>.md            #   每模块一个文件
├── glossary.md                # 共享语言:术语 + 避免词 + 已消解的歧义
├── env.md                     # 环境地图:服务器、日志路径、已配置的 MCP
├── adr/                       # 架构决策记录(绿地与设计流程产生)
└── yyyy-MM-dd-{taskName}/     # 任务规约目录(design / plan / 修复计划)
    ├── design.md
    ├── plan.md
    └── plan-fix{n}.md
```

- **功能路由表** —— "下次改某个功能先读哪些文件"的速查表。小项目用 `feature-routes.md`;大 / 多模块项目用 `feature-routes/`(总索引 `index.md` + 每模块文件,AI 只读它需要的那个模块,省 token)。
- **任务规约目录** —— `yyyy-MM-dd-{taskName}/` 存放该任务的 `design.md`、`plan.md`,以及修复追加的 `plan-fix{n}.md`。

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

**Codex 没有 SessionStart 钩子** —— 不会在会话启动时自动注入技能正文。它的机制是:把所有已安装技能的 `name` + `description` 注入每个新会话,正文按需加载。WorkerHelper 按此模型适配:`worker-lookup` 的 description 本身携带"所有编码任务必须先加载它"的强制规则,因此干净会话中的任何编码任务都应先触发它。

安装:在 Codex 应用的插件/市场流程中添加本仓库为市场源(本地路径或 GitHub URL —— 仓库根已提供 Codex 格式的 `marketplace.json`),然后安装 `workerhelper`。技能在**新会话启动时**生效;已安装插件缓存在 `~/.codex/plugins/cache/`。

要让 `exec-plan` 的子代理(sub-agent)工作,在 `~/.codex/config.toml` 中启用多代理:

```toml
[features]
multi_agent = true
```

详见 [`skills/using-workerhelper/references/codex-tools.md`](skills/using-workerhelper/references/codex-tools.md)。

## 验证

在干净会话中发送任意编码任务。Claude Code / OpenCode 上会注入 `using-workerhelper` 引导并先走 `worker-lookup`;Codex 上则应直接加载 `worker-lookup`(其 description 携带强制路由规则)。

## 许可证

MIT —— 见 [LICENSE](LICENSE)。跨 harness 钩子引导基础设施改编自 [Superpowers](https://github.com/obra/superpowers);见 [NOTICES.md](NOTICES.md)。
