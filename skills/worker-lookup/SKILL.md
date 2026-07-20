---
name: worker-lookup
description: Query the feature route map to locate related features, entry files, core code, and tests. Triggered when users ask to code, modify, add, delete, or fix features, report bugs, test failures, crashes, regressions, unexpected behavior, or ask questions about code, risks, implementation logic, review feedback, or diagnostic direction. Must be loaded first for all tasks that require code location.
---

# Route Lookup

Query the feature route map based on the user's current task to quickly identify which files should be read first.

## Core Principles

- The feature route map takes priority over full repository search.
- The feature route map is not a complete index or feature knowledge base; it only answers "which files should be read first when a user mentions a specific feature."
- When the route map exists but has no match, appears outdated, or has insufficient coverage, targeted code scanning is allowed but must be marked as temporary results.
- Features or file assignments that cannot be confirmed are marked as `uncertain`.
- When the user is only asking about code questions, risks, implementation logic, review feedback, or diagnostics, lookup is solely for locating priority files; it must not default to entering code modification, design, or execution plan workflows.
- Bug reports and test failures MUST route to `worker-debug`, not directly to `exec-plan` — root cause analysis must come before any fix attempt.

## Workflow

1. Read the feature route map: `docs/workerhelper/feature-routes.md` or `docs/workerhelper/feature-routes/`.
   - In directory mode, first read the feature index in `docs/workerhelper/feature-routes/README.md` or `docs/workerhelper/feature-routes/index.md`, then read the specific matched route files.
   - In directory mode, only when the index is missing, has no match, or appears outdated should you read potentially relevant feature files in the directory; if still unable to confirm, proceed with targeted scanning.
2. In single-file mode, first read the `Module Index`, then locate related modules based on the feature, module, entry, or file mentioned by the user; then match feature location entries within the module.
3. In directory mode, first read the module-to-file mapping in the index; if the index lists specific features, prioritize using the feature mapping to locate files; then read the matched module or feature files.
4. When matching feature location entries, prioritize matching module name, feature name, description, entry, core, tests, and notes.
5. Determine route map coverage status:
   - `sufficient`: Can locate main entries and core code; test locations are recorded if they exist.
   - `partial`: Can locate some information, but key location information is missing or appears outdated.
   - `missing`: Feature route map exists but has no related entries.
6. If the feature route map does not exist and the current task requires code location, the `worker-init` skill must be loaded first to complete initial setup; after initialization, return to this skill to continue lookup, marking coverage status as `partial`.
7. Only perform targeted scanning when coverage is `partial` or `missing`, prioritizing source code, entry points, configuration, and test directories; exclude dependencies, build artifacts, caches, and generated code.
8. Determine task intent and task type:
   - Analysis task: The user is only asking about code questions, risks, implementation logic, review feedback, or diagnostics. After lookup, read priority files and answer directly; do not load `design` or `exec-plan`.
   - Execution task: The user explicitly requests coding, modifying, adding, deleting, refactoring, adding tests, or committing changes. This does NOT include bug or test failure reports (those are bug-fix tasks).
   - Bug-fix task: The user explicitly reports a bug, test failure, crash, regression, or unexpected behavior and wants it fixed. This is a specialized execution task — after lookup, load `worker-debug` for root cause analysis; do NOT jump to `exec-plan` or write fixes before understanding the root cause.
   - When uncertain, treat as an analysis task — first share findings and recommendations; do not proactively modify code. When uncertain whether it's a bug-fix or feature change, treat as bug-fix to ensure root cause is understood first.
9. For execution tasks (non-bug-fix), continue to determine whether functional changes are involved:
   - Small, clear modifications (e.g., fixing typos, adjusting formatting, updating dependency versions, or localized feature behavior changes that are already located and low-risk) → proceed to `exec-plan` for direct execution.
   - Large-scale changes not involving functional changes (e.g., code refactoring, performance optimization, tech stack/framework replacement) → need to load the `design` skill.
   - Medium-to-large, unclear scope, or functional changes requiring solution confirmation (adding, modifying, deleting feature behavior) → need to load the `design` skill.
   - When uncertain, treat as needing to load the `design` skill.
10. Route map linkage:
    - When coverage status is `partial` or `missing`, check `worker-sync` after task completion; only update the route map when the current task confirms changes to feature entries, core implementations, or critical test entry points.
    - For tasks like typos, formatting, pure documentation, or dependency upgrades that do not produce usable feature location entries, `worker-sync` can be determined as `no`, but the reason must be explained.

## Internal Decision Checklist

After lookup is complete, the model should internally clarify the following judgments to determine next steps:

- Matched related modules / features and their sources (route map / temporary scan / uncertain)
- Files that should be read first and the reasons
- Potentially relevant files or files that may need modification, with source markers
- Route map coverage status: `sufficient` / `partial` / `missing`
- Task intent: `analysis` / `execution` / `bug-fix`
- Task type (for execution and bug-fix tasks): `feature-change` / `bug-fix` / `refactor` / `small-edit` / `uncertain`
- Whether functional changes are involved (execution intent only): `yes` / `no` / `uncertain`
- Recommended next skill: `none` / `design` / `worker-debug` / `exec-plan` / `worker-init`

Do not expand scanning scope for the sake of completeness.

## Standard Output Format

After lookup is complete, if subsequent skills need to read this skill's results, output or record in the following format:

```md
# Route Lookup Result

## Matched Modules
- Module name (source: route-map / scan / uncertain): match reason

## Matched Features
- Feature name (source: route-map / scan / uncertain): match reason

## Priority Files
- `path/to/file` (source: route-map / scan / uncertain): reason for priority reading

## Potential Relevant Or Change Files
- `path/to/file` (source: route-map / scan / uncertain): relevance or potential modification reason

## Coverage
- Status: sufficient / partial / missing
- Temporary scan used: yes / no

## Task Classification
- Intent: analysis / execution / bug-fix
- Task type: feature-change / bug-fix / refactor / small-edit / uncertain
- Functional change (execution only): yes / no / uncertain
- Need worker-sync: yes / no / uncertain

## Resolved Next Step
→ {action}  (one of: Load `worker-debug` / Load `design` / Load `exec-plan` / Answer directly)
```

## Anti-Patterns

| Excuse | Reality |
|---|---|
| "I can find this without the route map" | Route map gives you the exact entry points, skipping needless full-repo search. It's faster and more precise. |
| "This task is too simple for worker-lookup" | Even a single-file edit benefits from knowing which file is the entry point vs. which are downstream dependencies. |
| "The route map might be outdated, so I'll search directly" | Reading the route map takes seconds. If it's outdated, mark coverage `partial`, scan, and still benefit from the module hierarchy. Then update it via `worker-sync`. |
| "I already know the codebase well" | Route maps persist across sessions. They help the next agent (or future you) jump to the right file immediately. |
| "I'll read the route map later, let me explore first" | Exploration without the route map wastes tokens and time. Read the map, then explore only if coverage is `partial` or `missing`. |
| "The user mentioned a feature, but the map has no match — I'll create entries now" | Creating entries without confirmed code changes produces low-quality data. Mark coverage `missing`, scan, and update via `worker-sync` after the task is done. |

## First-time Initialization

When the route map does not exist and the current task requires code location, the `worker-init` skill must be loaded to complete initial setup. After initialization is complete, continue the lookup process of this skill and mark the coverage status as `partial`. When the route map exists but has no related entries, do not execute `worker-init`; instead, perform targeted scanning with `missing` coverage status and check `worker-sync` after the task is completed.
