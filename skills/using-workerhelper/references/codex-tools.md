# Codex Tool Mapping

workerhelper skills describe **actions** (read a file, edit, run a shell command,
search with grep/glob, dispatch a subagent) rather than naming specific tools.
On Codex these map to the native `shell`, `apply_patch`, read, and — once
enabled below — `spawn_agent` / `wait_agent` / `close_agent` tools.

## Subagent dispatch requires multi-agent support

`exec-plan` dispatches sub-agents (implementer + reviewer) when executing
plans. On Codex, multi-agent support is **disabled by default**. Add to your
Codex config (`~/.codex/config.toml`):

```toml
[features]
multi_agent = true
```

This enables `spawn_agent`, `wait_agent`, and `close_agent`. Always close
implementer and reviewer sub-agents once they have finished their work.

## Sandbox write boundaries

workerhelper writes its artifacts under `docs/workerhelper/` (the feature route
map and per-task `design.md` / `plan.md` / `plan-fix{n}.md`). This directory
must live **inside the open workspace**. If the Codex sandbox blocks a write
outside the workspace, write within the workspace root and tell the user.

## No other mapping required

`worker-lookup`, `worker-init`, `worker-sync`, `worker-debug`, `design`, and
`plan` only need read / edit / shell / grep / glob, which Codex provides
natively. No per-skill tool mapping is needed beyond enabling `multi_agent`
for `exec-plan`.
