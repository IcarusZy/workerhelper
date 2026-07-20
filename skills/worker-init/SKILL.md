---
name: worker-init
description: Create the feature route map for the first time, define the format template, and write initial entries. Only triggered when the feature route map does not exist and the current task requires code location.
---

# Route Init

Create the feature route map for the first time, define the format template, and write initial entries.

## Core Principles

- Only perform initial setup when the route map does not exist.
- Conduct targeted code scanning based on the current task; only record features directly related to the current task — do not perform a full repository inventory.
- Only write feature location entries when the current task can be associated with clear features, entry points, or core code; if feature names or entry points cannot be confirmed, mark fields as `uncertain`.
- If the current task is not suitable for generating the first feature entry (e.g., typos, formatting, dependency upgrades, pure documentation), only create the base template and explain the reason — do not force low-quality entries.
- The feature route map is not a complete index or feature knowledge base; it only records the most valuable locations to read first when modifying a feature next time.
- Information that cannot be confirmed should be written as `uncertain` or simply omitted — never fabricate.

## Route Map Location

- By default, create `docs/workerhelper/feature-routes.md` using the hierarchical structure of "Project Overview → Module Index → Module → Feature".
- For medium-to-large projects, projects with clear business modules, or projects expected to have rapidly growing feature entries, prefer the `docs/workerhelper/feature-routes/` directory mode; for small projects or when only a few entries are needed, use the single-file mode.
- In directory mode, use kebab-case filenames by module by default, e.g., `docs/workerhelper/feature-routes/user-auth.md`; feature-level files are only allowed when the index explicitly maintains a "feature name → route file" mapping.
- Directory mode must maintain a lightweight index: `docs/workerhelper/feature-routes/README.md` or `docs/workerhelper/feature-routes/index.md`, recording the "module name → route file" mapping; when using feature-level files, a "feature name → route file" mapping must also be added for lookup to locate specific files first.

## Workflow

1. Confirm that the route map does not exist: check `docs/workerhelper/feature-routes.md` or `docs/workerhelper/feature-routes/`.
2. Conduct targeted code scanning based on the current task, prioritizing source code, entry points, configuration, and test directories; exclude dependencies, build artifacts, caches, and generated code.
3. Create the route map file using the initial setup template; small projects default to `docs/workerhelper/feature-routes.md`, while medium-to-large projects or projects with clear modules prefer the directory mode.
4. If using directory mode, first create the feature index file, then create the specific module file matching the current task.
5. When the current task can be associated with clear features, entry points, or core code, write at least one feature location entry; when not suitable for generating entries, only keep the base template and explain the reason.
6. After initialization is complete, return to `worker-lookup` to continue the lookup process, marking the coverage status as `partial`.

## Initial Setup Template

```md
# Feature Route Map

## Project Overview

- Application type: ...
- Main entry: `...`
- Core directories: `...`
- Test entry: `...`

## Module Index

- {Module name}: {Feature name}, {Feature name}

## {Module name}

### {Feature name}

- Description: ...
- Entry: `...`
- Core: `...`
- Tests: `...`
- Notes: ...
```

During initial setup, even if only a small amount of information can be confirmed, the hierarchical structure can be retained; missing fields can be omitted without forcing `N/A`.

## Feature Location Entry

Each feature only retains information that helps locate code:

- Parent module.
- Feature name.
- One-line description.
- User entry, external entry, page, API, command, or task entry point.
- Core code location; business orchestration, data, state, or persistence locations are only written in core or notes when they affect the next location lookup.
- Related test or verification locations.
- Necessary notes.

Feature location entries only contain information that helps locate code. Extended information such as status, type, change history, platform differences, observability/debugging, or related features should be merged into a single note only when it actually affects location lookup.

## New Module Template

```md
## {Module name}

### {Feature name}

- Description: ...
- Entry: `...`
- Core: `...`
- Tests: `...`
- Notes: ...
```

## New Entry Template

```md
### {Feature name}

- Description: ...
- Entry: `...`
- Core: `...`
- Tests: `...`
- Notes: ...
```

Missing fields can be omitted without forcing `N/A`. If the project already has more specific field naming, the existing naming can be continued, but the "module → feature" hierarchy must be preserved.

## Directory Mode Index Template

```md
# Feature Route Index

- {Module name}: `{module-file}.md`
  - {Feature name}: `{feature-file}.md` (only when using feature-level files)
```

The index should prioritize recording module-to-file mappings; when features are few, only modules can be listed; when features are numerous or cross-module confusion is likely, specific features can be listed.
