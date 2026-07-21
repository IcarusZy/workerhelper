---
name: worker-init
description: Create the feature route map for the first time and write initial entries. Only triggered when the route map does not exist and the current task requires code location.
---

# Route Init

Create the feature route map for the first time: a full-project inventory (user-guided on which modules matter), organized as a feature→file lookup — single file for small projects, or a master index + per-module files for large ones (progressive disclosure, token-efficient).

## Core Principles

- **First time = full inventory; daily maintenance is incremental.** First-time creation scans the whole project to build a complete baseline. Subsequent updates go through `worker-sync`, not re-init.
- **Scan broad, record lean.** Identify every feature across the project, but each entry records only what is needed to locate code next time (entry / core / tests / necessary notes). The map is a "what to read first" lookup — NOT a full code index or knowledge base.
- **Let the user steer depth.** Ask which modules are CORE (inventory deeply) vs LEGACY/ABANDONED (skip or cover lightly), so dead code does not waste effort or pollute the map.
- **Feature = a capability, not a module.** One feature = one thing a future change would target (e.g., "user login", "Agent creation and run"). Modules are the optional grouping layer ABOVE features.
- **Ground every entry in real code.** Read the files before recording; unconfirmed locations are marked `uncertain` or omitted — never fabricated.
- **Do not force low-quality entries.** If the current task is a non-feature (typos, formatting, dependency upgrade, pure docs), still create the base map and explain — do not pad it with noise.

## Route Map Location

Choose the structure by realistic projected size, not just today's count:

- **Single file** — `docs/workerhelper/feature-routes.md`. Use when there are ≈30 features or fewer, or the whole map stays under ~200 lines.
- **Directory mode** — `docs/workerhelper/feature-routes/` with a master index plus one file per module. Use for larger or multi-module projects. This is **progressive disclosure**: the AI reads the cheap index first, then only the one module file it needs — saving tokens. Migration from single-file → directory later is cheap, but start in directory mode if the project clearly has multiple distinct business modules.

In directory mode:

- `feature-routes/index.md` — master index: module → file + one-line module summary + feature count.
- `feature-routes/<module>.md` — one file per module, kebab-case (e.g., `user-auth.md`), holding that module's feature entries.

## Workflow

1. Confirm the route map does not exist: check `docs/workerhelper/feature-routes.md` and `docs/workerhelper/feature-routes/`.
2. Full-project scan to identify modules and features. Follow **Scan Priority** below — do not open every file.
3. Ask the user ONE consolidated question: which modules are CORE (inventory deeply) vs LEGACY/ABANDONED (skip or cover lightly). Proceed even if the user has no preference.
4. Decide structure by size (single file vs directory mode).
5. Write the Project Overview (type, main entry, core directories, global test entry).
6. Write feature entries — grouped by module, or flat under a `## Features` heading for small projects. For each feature record Description + Entry + Core (+ Tests when non-obvious; + feature-specific extra location fields only when they affect locating). See **Feature Entry Fields**.
7. Mark unconfirmed locations `uncertain`; never fabricate.
8. Return to `worker-lookup` and set coverage to `partial` (the map now exists; worker-lookup refines per task).

## Scan Priority

Read in this order; exclude the rest:

- **Do read:** entry points, config/manifests, routing and module-registration files, source directories, test directories.
- **Do not read:** dependencies (`node_modules/`, `vendor/`, `.venv/`), build artifacts (`dist/`, `build/`, `target/`), caches, generated code, lockfiles, `.git/`.
- Enumerate with glob/grep first; open only the entry/core file(s) per feature — not every file.

## Feature Entry Fields

- **Feature name** — a capability a future change would target, verb-object style (e.g., "Agent creation and run", "User login"). NOT a module name.
- **Description** (说明) — 1–2 sentences: what the feature does, naming the key file/function it revolves around. Keep tight; put file references mainly in Entry/Core.
- **Entry** (入口) — the request/call entry point: API route, page, command, or top-level function (e.g., `src/agent/runner_wrapper.py :: run_agent`).
- **Core** (核心) — the file(s) to read first to understand or change this feature (business logic, orchestration, data/state).
- **Tests** (测试) — verification location; omit when obvious from the global Test entry.
- **Extra location fields** (e.g., 提示词备份 / prompts backup) — feature-specific locations added ONLY when they affect locating; never forced on every feature.

Unconfirmed → `uncertain` or omit. Field names may be localized to your project's language (入口/核心/测试) as long as the meaning stays consistent. Missing fields are omitted without forcing `N/A`.

Example entry (multi-file cells are comma-separated):

```md
### Agent creation and run
- Description: All LLM requests are wrapped as agent calls. `agent_factory.py` builds the Agent; `runner_wrapper.py` runs it. Single-call entry `run_agent`, batch `run_agent_batch`; prompt selected via `agent_code`.
- Entry: `src/agent/runner_wrapper.py` :: `run_agent`, `run_agent_batch`
- Core: `src/agent/agent_factory.py`, `src/agent/runner_wrapper.py`
- Prompts backup: `docs/prompts/` (DB is source of truth; code references via `agent_code`)
```

## Templates

### Single-file route map (small project)

Flat layout — features directly under `## Features`:

```md
# Feature Route Map

## Project Overview
- Type: ...
- Main entry: `...`
- Core directories: `...`
- Test entry: `...`

## Features

### {Feature name}
- Description: ...
- Entry: `...`
- Core: `...`
- Tests: `...`
- {Extra}: `...`
```

If the small project has several distinct modules, replace `## Features` with one `## {Module}` heading per module, each containing `### {Feature}` entries.

### Directory mode — master index (`feature-routes/index.md`)

```md
# Feature Route Index

- Type: ... | Main entry: `...` | Test entry: `...`

- `{module}.md` — {one-line module summary} ({n} features)
- `{module}.md` — {one-line module summary} ({n} features)
```

### Directory mode — per-module file (`feature-routes/{module}.md`)

```md
# {Module name}

### {Feature name}
- Description: ...
- Entry: `...`
- Core: `...`
- Tests: `...`
- {Extra}: `...`
```

## Completion Checklist

Before returning to `worker-lookup`, confirm:

- Route map created at the right location (single file or directory mode).
- Project Overview filled (type, main entry, core dirs, test entry).
- Every core module's features have entries; legacy modules skipped or lightly covered per user guidance.
- Each entry has at least Description + Entry + Core; Tests present when non-obvious; extra fields only where relevant.
- Unconfirmed locations marked `uncertain`; nothing fabricated.
- (Directory mode) master `index.md` lists module → file + summary + feature count.
- Hand off to `worker-lookup` with coverage `partial`.

## Anti-Patterns

| Excuse | Reality |
|---|---|
| "First-time setup should only cover the current task's feature" | A per-task map stays tiny and never helps the next task. First time = full inventory (user-guided) to build a reusable baseline. |
| "Full inventory means documenting every file" | Scan broad to FIND every feature; RECORD only locate-essential info per feature. The map is a lookup, not an index. |
| "I'll just scan everything, including legacy modules" | Ask the user which modules are core vs legacy first — dead code wastes effort and pollutes the map. |
| "This feature is small, I'll skip it" | If it is a real capability someone might change, record it leanly. Skip only true non-features (typos, formatting). |
| "I can't confirm the entry, so I'll guess" | Mark `uncertain` or omit. Fabricated locations send future tasks to the wrong file. |
| "One big file is fine even for this project" | A huge single file forces the AI to read everything each lookup. Use directory mode + index for progressive disclosure. |
| "Let me open every file to be thorough" | Enumerate with glob/grep, open only entry/core files per feature. Reading everything burns tokens for no extra map quality. |
