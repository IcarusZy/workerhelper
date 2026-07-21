# WorkerHelper

[English](README.md) | [简体中文](README.zh-CN.md)

A doc-driven AI coding workflow skill suite for individual developers. It standardizes task execution **by task scale** and quickly locates feature code through **feature route maps**.

Supported harnesses: **OpenCode**, **Claude Code**, **Codex**. The same `skills/` run on all three — only the bootstrap/activation mechanism differs per harness.

## What it does

- **Locate first**: every coding task loads `worker-lookup`, which queries the feature route map and routes to the right next step.
- **Scale by task size**: small edits → `exec-plan` directly; medium/large/unclear → `design` → `plan` → `exec-plan`; bugs → `worker-debug`.
- **Spec-driven**: the route map and per-task design/plan docs live under `docs/workerhelper/`.

## Skills

`using-workerhelper` · `worker-lookup` · `worker-init` · `worker-sync` · `worker-debug` · `design` · `plan` · `exec-plan`

## Install

Pick your harness — the same `skills/` run on all three; only the bootstrap differs.

### Claude Code

Standard marketplace install:

```
/plugin marketplace add IcarusZy/workerhelper
/plugin install workerhelper@workerhelper-marketplace
```

The SessionStart hook auto-injects `using-workerhelper` on every session start (including after `/clear` and compaction).

For local development, you can instead `/plugin install /absolute/path/to/workerhelper`.

### OpenCode

Add to `opencode.json` (global or project-level), then restart OpenCode:

```json
{ "plugin": ["workerhelper@git+https://github.com/IcarusZy/workerhelper.git"] }
```

Details: [`.opencode/INSTALL.md`](.opencode/INSTALL.md).

### Codex

Install via Codex's plugin flow — point Codex at this repo as a marketplace source, then in the Codex CLI run `/plugins`, search `workerhelper`, and install. The `.codex-plugin/plugin.json` declares the skills; Codex discovers them natively (no session hook). Installed plugins are cached under `~/.codex/plugins/cache/`.

For `exec-plan` sub-agents, enable multi-agent in `~/.codex/config.toml`:

```toml
[features]
multi_agent = true
```

See [`skills/using-workerhelper/references/codex-tools.md`](skills/using-workerhelper/references/codex-tools.md).

## Verify

In a clean session, send any coding task. `using-workerhelper` should load before any code is written and direct you to `worker-lookup` first.

## License

MIT — see [LICENSE](LICENSE). The cross-harness hook bootstrap infrastructure is adapted from [Superpowers](https://github.com/obra/superpowers); see [NOTICES.md](NOTICES.md).
