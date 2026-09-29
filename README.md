# WorkerHelper

[English](README.md) | [简体中文](README.zh-CN.md)

A doc-driven AI coding workflow skill suite for individual developers. It standardizes task execution **by task scale** and quickly locates feature code through **feature route maps**.

Supported harnesses: **OpenCode**, **Claude Code**, **Codex**. The same `skills/` run on all three — only the bootstrap/activation mechanism differs per harness.

## What it does

- **Locate first**: every coding task loads `worker-lookup`, which queries the feature route map and routes to the right next step.
- **Scale by task size**: small edits → `exec-plan` directly; medium/large/unclear → `design` → `plan` → `exec-plan`; bugs → `worker-debug`.
- **Greenfield included**: empty directory or new-project intent → `worker-greenfield` (grilling-style clarification, architecture agenda, scaffold, placeholder route map).
- **Env wiring**: `worker-env` discovers connections in `.env` / `application.yml`, configures MCP tools via a two-layer registry (`~/.workerhelper/` overrides built-ins), verifies, and records an environment map for `worker-debug`'s remote log probe.
- **Spec-driven**: the route map, glossary, ADRs, and per-task design/plan docs live under `docs/workerhelper/`.

## Skills

`using-workerhelper` · `worker-lookup` · `worker-init` · `worker-greenfield` · `worker-env` · `worker-sync` · `worker-debug` · `design` · `plan` · `exec-plan`

## Storage Layout

WorkerHelper writes its artifacts under one directory in your project — `docs/workerhelper/` — forming a "location ↔ spec" loop.

```
docs/workerhelper/
├── feature-routes.md          # Small project: single-file route map
├── feature-routes/            # Large project: directory mode (progressive disclosure)
│   ├── index.md               #   master index: module → file + summary
│   └── <module>.md            #   one file per module
├── glossary.md                # Shared language: terms + avoid-lists + resolved ambiguities
├── env.md                     # Environment map: servers, log paths, configured MCPs
├── adr/                       # Architecture decision records (greenfield & designs)
└── yyyy-MM-dd-{taskName}/     # Per-task spec dir (design / plan / fix plans)
    ├── design.md
    ├── plan.md
    └── plan-fix{n}.md
```

- **Feature route map** — the "what to read first" lookup for locating code. Small project → `feature-routes.md`; large / multi-module project → `feature-routes/` (master `index.md` + per-module files, so the AI reads only the module it needs, saving tokens).
- **Task spec dir** — `yyyy-MM-dd-{taskName}/` holds that task's `design.md`, `plan.md`, and any `plan-fix{n}.md`.

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

**Codex has no SessionStart hook** — skill bodies are never auto-injected at session start. Instead, Codex injects every installed skill's `name` + `description` into each new session and loads the body on demand. WorkerHelper fits this model: the `worker-lookup` description itself carries the mandatory-first rule, so any coding task in a clean session should trigger it before code is written.

Install via the Codex app's plugin/marketplace flow: add this repo (local path or GitHub URL — the repo root ships a Codex-format `marketplace.json`) as a marketplace, then install `workerhelper`. Skills take effect when a **new** session starts; installed plugins are cached under `~/.codex/plugins/cache/`.

For `exec-plan` sub-agents, enable multi-agent in `~/.codex/config.toml`:

```toml
[features]
multi_agent = true
```

See [`skills/using-workerhelper/references/codex-tools.md`](skills/using-workerhelper/references/codex-tools.md).

## Verify

In a clean session, send any coding task. On Claude Code / OpenCode, the injected `using-workerhelper` guide loads first and directs you to `worker-lookup`. On Codex, `worker-lookup` itself should load before any code is written (its description carries the routing rule).

## License

MIT — see [LICENSE](LICENSE). The cross-harness hook bootstrap infrastructure is adapted from [Superpowers](https://github.com/obra/superpowers); see [NOTICES.md](NOTICES.md).
