# WorkerHelper

A doc-driven AI coding workflow skill suite for individual developers. It standardizes task execution **by task scale** and quickly locates feature code through **feature route maps**.

Supported harnesses: **OpenCode**, **Claude Code**, **Codex**. The same `skills/` run on all three — only the bootstrap/activation mechanism differs per harness.

## What it does

- **Locate first**: every coding task loads `worker-lookup`, which queries the feature route map and routes to the right next step.
- **Scale by task size**: small edits → `exec-plan` directly; medium/large/unclear → `design` → `plan` → `exec-plan`; bugs → `worker-debug`.
- **Spec-driven**: the route map and per-task design/plan docs live under `docs/workerhelper/`.

## Skills

`using-workerhelper` · `worker-lookup` · `worker-init` · `worker-sync` · `worker-debug` · `design` · `plan` · `exec-plan`

## Install

### OpenCode

See [`.opencode/INSTALL.md`](.opencode/INSTALL.md). In short, add to `opencode.json`:

```json
{ "plugin": ["workerhelper@git+https://github.com/IcarusZy/workerhelper.git"] }
```

### Claude Code

Install from a local checkout. The `.claude-plugin/plugin.json` + `hooks/hooks.json` SessionStart hook auto-inject `using-workerhelper` on every session start (including after `/clear` and compaction):

```
/plugin install /absolute/path/to/workerhelper
```

For marketplace distribution later, add a `.claude-plugin/marketplace.json` and register with `/plugin marketplace add IcarusZy/workerhelper`.

### Codex

Install via the Codex plugin flow — `.codex-plugin/plugin.json` declares the skills (Codex discovers them natively; no session hook). For `exec-plan` sub-agents, enable multi-agent in `~/.codex/config.toml`:

```toml
[features]
multi_agent = true
```

See [`skills/using-workerhelper/references/codex-tools.md`](skills/using-workerhelper/references/codex-tools.md).

## Verify

In a clean session, send any coding task. `using-workerhelper` should load before any code is written and direct you to `worker-lookup` first.

## License

MIT — see [LICENSE](LICENSE). The cross-harness hook bootstrap infrastructure is adapted from [Superpowers](https://github.com/obra/superpowers); see [NOTICES.md](NOTICES.md).
