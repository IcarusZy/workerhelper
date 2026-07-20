---
name: plan
description: Generate an execution plan based on a confirmed design or clear requirements. Suitable for scenarios after design.md is confirmed, or when clear requirements need to be broken down into a plan before implementation.
---

# Plan

Transform a confirmed design or clear requirements into an executable plan.

## Core Principles

- Only plan modifications within the confirmed scope; do not expand the design scope.
- Task order must serve the minimal correct implementation.
- Each task should specify the files involved and verification method.
- Determine task relationships to help the execution phase decide on order, merging, or parallelism.
- Do not re-discuss requirement validity; do not rewrite `design.md`.

## Workflow

1. Read the confirmed `design.md`, user's clear requirements, `worker-lookup` output, and necessary code context.
2. Confirm whether the input is sufficient for planning; if blocking information is missing, ask only the most critical question at a time with 2-3 reference options.
   - `design.md` is only considered confirmed after the user has explicitly confirmed the solution.
   - When the user provides clear requirements directly without needing design, `design.md` is not required to generate a plan.
   - If an unconfirmed design exists and the requirements are not clearly a small task, stop and request user confirmation before generating `plan.md`.
3. Break down execution tasks in dependency order.
4. Assign stable task IDs (e.g., `T1`, `T2`) to each task, listing file scope, modification objectives, and verification method upon completion.
5. Determine task relationships: dependencies, shared files, shared context, degree of independent verifiability, and potential conflict points.
6. Determine whether `worker-sync` is needed and include it in the plan.
7. Write the plan to `plan.md` in the task directory, or output directly when the user only needs a lightweight plan.

## Task Relationships

When generating a plan, only determine the relationships between tasks; do not decide the executor or execution method.

- Strongly related: Sequential dependencies, modifications to the same core file, shared critical context, or requiring continuous judgment to maintain consistency.
- Weakly related: Related objectives but relatively clear file boundaries; can be handled independently after a certain task is completed.
- No direct relation: File and verification boundaries are independent; only final integration checks are needed.
- Conflict risk: Multiple tasks may modify the same file, same interface, same test entry, or same configuration.

Relationship determinations must serve the execution phase's task ordering, merged execution, and conflict avoidance; they must not introduce additional implementation scope.

## plan.md Concise Format

```md
# Execution Plan: {taskName}

## Summary
- ...

## Tasks
- [ ] T1: ...
  - Files: ...
  - Change: ...
  - Verify: ...
  - Depends on: none / ...

## Verification
- Commands: ...
- Manual checks: ...

## Task Relationships
- Strongly related: none / T1 + T2 (reason)
- Weakly related: none / ...
- Independent: none / ...
- Conflict risks: none / ...

## WorkerSync
- Need worker-sync: yes / no / uncertain
- Expected updates: ...

## Risks
- None / ...
```

## Output Requirements

- By default, write to `plan.md` in the same task directory as `design.md`.
- If no task directory exists, default to `docs/workerhelper/yyyy-MM-dd-{taskName}/plan.md`.
- In task directory naming, use the current date; `taskName` should be a short kebab-case string; Chinese task names should be converted to a stable English or pinyin summary; if the directory already exists, append a sequence number like `-2`, `-3`, etc.
- `plan.md` is the input file handed off to the `exec-plan` skill.
- Each task in `plan.md` must have a stable task ID; task relationships, fix plans, and execution summaries must reference these IDs.
- `plan.md` must include task relationship determinations, indicating whether tasks are strongly related, weakly related, independent, or have conflict risks.
- Determine whether `worker-sync` is needed subsequently.

## Exit Conditions

- Execution order has been clarified.
- Each task has file scope and verification method.
- Task relationships and conflict risks have been determined.
- Route-sync needs have been determined.
- Next step clearly points to `exec-plan` or waiting for user confirmation.

## Anti-Patterns

| Excuse | Reality |
|---|---|
| "I'll just figure it out as I go" | Implementation without a plan leads to scope drift, forgotten edge cases, and incomplete verification. A 5-minute plan saves hours of rework. |
| "The tasks are too interdependent to plan separately" | Interdependence is exactly what task relationships document — sequential deps, shared files, conflict risks. Planning makes the interdependence visible and manageable. |
| "This is a small plan, I don't need task IDs" | Stable task IDs enable fix plans, review references, and completion tracking. Even 3 tasks benefit from `T1`, `T2`, `T3`. |
| "I'll write the plan after I finish implementation" | A post-hoc plan documents nothing useful and can't prevent mistakes. Plans serve the implementation, not the record. |
| "The design already tells me what to do" | Design says what and why. Plan says in what order, with what files, and how to verify each step. They serve different purposes. |
| "Task relationships are obvious, I'll skip documenting them" | Obvious to you now is not obvious to the sub-agent (or future you) executing the plan. Write them down. |
