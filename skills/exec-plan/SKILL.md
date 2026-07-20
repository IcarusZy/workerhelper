---
name: exec-plan
description: Execute plan.md or implement small, located changes within the WorkerHelper workflow. Load when worker-lookup, plan, or design suggests entering the coding phase.
---

# Exec Plan

Execute `plan.md`, or directly implement code modifications for small, clear tasks.

## Core Principles

- Prioritize making the minimal correct change.
- When a plan exists, follow the plan; for small tasks without a plan, form a brief internal execution note first, and briefly describe it to the user if necessary.
- Only pause for blocking issues; non-blocking uncertainties are recorded as Assumptions and execution continues.
- Modifications must be verified after completion; when verification is not possible, explain the reason.
- After adding, deleting, or changing feature behavior, refactoring, or fixing critical bugs, must determine whether the change affects feature entries, core implementations, or critical test entry points; only proceed with `worker-sync` when changes are confirmed.
- Sub-agents must be used for all plan-based execution; even when tasks must be executed serially with no parallelizable groups, delegate implementation to sub-agents whenever the plan involves extensive code changes. The main thread must not implement code directly for plan-based execution — it only divides, dispatches, reviews, and integrates.
- The main thread is responsible for sub-agent task division, integration, final judgment, and user delivery.
- After implementation is complete, a task review must be performed to prioritize finding omissions, regression risks, and verification gaps.
- For anything other than small, localized, low-risk changes, a dedicated review sub-agent must be launched after completing medium-to-large changes; the main thread is responsible for reviewing the audit conclusions and handling confirmed issues.
- **Verification gate**: No completion claim without running the verification command and reading its output fresh. You must not claim "tests pass," "verification passed," or "task complete" based on memory, assumptions, or sub-agent self-reports. Run the command. Read the output. Then claim the result. This is non-negotiable.

## Workflow

1. Read context:
    - When a task directory exists, read `design.md`, `plan.md`, and the latest `plan-fix{n}.md`.
    - `plan-fix{n}.md` is determined as latest by the highest number; before execution, check unfinished items in `plan.md` and all `plan-fix*.md` — actual execution follows the latest fix plan and unclosed issues.
    - When loaded from `worker-debug`, read the worker-debug debug summary (root cause, divergence point, fix direction, affected files) as the execution note.
    - For small direct changes, read the `worker-lookup` results and related code.
2. Read task relationships in `plan.md`; for small tasks without `plan.md`, execute on the main thread by default unless complexity is discovered that requires splitting.
3. When executing a `plan.md`, sub-agents are required — formulate sub-agent task groupings based on task relatedness; even serial-only execution must use sub-agents for implementation. Only small tasks without a plan may execute directly on the main thread.
4. Output or maintain a brief task list covering only the modifications and verifications to be done this time; small tasks default to internal maintenance unless the user needs it or the task risk warrants explanation.
5. Execute code modifications, maintaining original style without opportunistic refactoring.
    - When adding new logic, consider writing a failing test first to confirm the test catches the issue, then implement the fix to make it pass. This applies especially to bug fixes (ensure the test reproduces the bug before fixing) and new feature behavior (ensure the test defines the expected contract before coding). This is a guideline, not a hard gate — for trivial one-liners or purely mechanical changes, direct implementation is acceptable.
6. Run related verification: prioritize tests, type checking, lint, or the minimal commands that can prove the changes are correct.
    - The verification gate applies here: run the command, read the output fresh, and confirm it passes before claiming success. Do not trust memory, assumptions, or sub-agent self-reports.
7. Perform task review: check against `design.md`, `plan.md`, actual diff, and verification results for omissions, risks, and test gaps.
8. Check results:
    - Pass: proceed to completion summary.
    - Clear bug or omission (found during review): fix directly and verify again.
    - Still unresolved after multiple rounds: if a task directory exists, write to `unresolved-issues.md`; for small tasks without a task directory, explain the blocking reason in the summary.
9. Determine worker-sync: `yes` / `no` / `uncertain`. If feature entries, core implementations, or critical test entry points are confirmed to have changed, proceed to load `worker-sync` to complete the sync check; if `no`, explain the reason why sync is not needed.

## Sub-agent Execution Rules

First, determine whether sub-agents are required:

- Sub-agents are required for all plan-based execution, regardless of whether tasks can be parallelized. Even when all tasks must run serially (e.g., shared files, sequential dependencies), implementation must be delegated to sub-agents — the main thread only divides, dispatches, reviews results, and integrates.
- Sub-agents are strongly preferred for complex or extensive code changes even without a formal `plan.md`.
- Sub-agents may be skipped only for small, localized, single-file, low-risk tasks without a plan.

Then determine grouping and execution order based on task relatedness:

- Strongly related tasks should be combined for the same sub-agent to avoid context fragmentation; when combined tasks must run serially due to file conflicts or dependencies, the sub-agent executes them sequentially in the correct order.
- Weakly related tasks can be combined by file scope, feature chain, or verification entry point to reduce the number of sub-agents and integration cost.
- Complex tasks with no direct relation and independently verifiable should be prioritized for splitting to different sub-agents for parallel execution.
- Tasks with conflict risk must not edit the same file in parallel; assign them to a single sub-agent for serial execution, and the main thread reviews the diff afterward.
- Exploration, implementation, test supplementation, and review can be split, but implementation and testing of the same behavior chain should usually be combined unless test boundaries are completely independent.

Sub-agent tasks must include clear input files, modification scope, prohibited areas, expected output, and verification method. Sub-agents can only be responsible for exploration, localized implementation, test supplementation, verification, or review suggestions; the main thread must review their results, handle integration conflicts, run final verification, and bear final delivery responsibility.

## Small Task Execution Note

```md
# Brief Execution Note

## Objective
- ...

## Modification Scope
- ...

## Verification Method
- ...

## Execution Strategy
- Sub-agent usage: required (plan-based) / default none (small, no plan)
- Task grouping: none / ...

## WorkerSync
- Need worker-sync: yes / no / uncertain
```

## Task Review

A review must be conducted after implementation and verification. The review has two stages: spec/plan compliance first, then code quality.

### Stage 1: Spec Compliance Review

Must be completed before Stage 2. Do not review code quality until spec compliance is confirmed.

1. Requirement coverage: Whether each task in `plan.md` is completed, and whether incomplete items have clear reasons.
2. Behavioral risks: Whether unplanned behavior changes, boundary omissions, compatibility issues, or error handling gaps have been introduced.
3. Route map impact: Whether changes involve feature entries, core implementations, or critical test entry points that require `worker-sync`.

### Stage 2: Code Quality Review

Only proceed after Stage 1 passes.

4. Code scope: Whether unrelated files were modified, whether opportunistic refactoring occurred, whether the user's existing unrelated changes were touched.
5. Verification adequacy: Whether tests, type checking, lint, or manual verification cover the current risks; whether reasons for inability to verify are credible. The verification gate must have been passed — fresh command output must be present.

### Review Sub-Agent

For anything other than small, localized, low-risk changes, a dedicated review sub-agent must be launched after completing medium-to-large changes. The review sub-agent:
- Performs both Stage 1 and Stage 2 reviews.
- Is only responsible for discovering issues and risks, not for directly modifying files.
- Must be given context: task list, actual diff, verification output, design/plan docs.
- The main thread must review its conclusions, fix confirmed issues directly and verify again, and record non-blocking risks in the summary or fix plan.

When the review discovers confirmed issues, prioritize fixing them directly and verifying again; only generate `plan-fix{n}.md` when there are plan omissions, unmet acceptance criteria, clear regression risks, or test gaps requiring separate tracking.

### Review Red Flags

- Starting code quality review before spec compliance is confirmed.
- Skipping review because "the changes are simple."
- Trusting sub-agent self-reports of verification without reading fresh output.
- Accepting review conclusions without the main thread reviewing them.
- Proceeding to completion with unresolved Critical or Important review findings.

## Scope Escalation

When it is discovered during execution that the change scope significantly exceeds expectations (e.g., involving new modules, new architecture, cross-file behavior changes):

1. Pause current execution.
2. Explain the escalation reason to the user: originally expected impact scope vs. actually discovered impact scope.
3. Recommend loading the `design` skill first to confirm the solution, then loading the `plan` skill to generate `plan.md` before continuing.

Small scope fluctuations (modifying 1-2 more files, adding minor boundary handling) do not require escalation — execute directly and explain.

## Fix Plan Rules

- Only generate `plan-fix{n}.md` when a `plan.md` exists and plan omissions, unmet acceptance criteria, clear regression risks, or test gaps are discovered.
- `plan-fix{n}.md` must reference stable task IDs from `plan.md`; new fix tasks can continue using stable IDs like `F1`, `F2`, etc.
- Small tasks typically do not generate fix plans — fix directly and explain in the summary.
- Fix limit defaults to 3 rounds. The user can override the default by "relaxing the fix limit" or specifying a specific number. When a task directory exists, it must be recorded in `unresolved-issues.md`; for small tasks without a task directory, record in the summary.

## Completion Checklist

Before completion, confirm:

- Tasks in the plan or execution note are completed, or incomplete reasons are clearly listed.
- When a task directory exists, task completion status in `plan.md` or the latest `plan-fix{n}.md` has been maintained.
- Sub-agent usage has been determined based on complexity, task grouping based on relatedness is complete, and all sub-agent results have been reviewed.
- Task review is complete: Stage 1 (spec compliance) passed, then Stage 2 (code quality) passed. For medium-to-large changes, a dedicated review sub-agent has been launched and its conclusions reviewed.
- **Verification gate passed**: verification command was run, fresh output was read, and it confirmed success. No completion claims based on memory, assumptions, or sub-agent self-reports.
- Issues found in review have been fixed or recorded.
- Related verification has been run, or the reason for not running it has been explained.
- Whether worker-sync is needed for this change has been determined; if `yes` or `uncertain`, `worker-sync` has been loaded to complete the sync check.
- If worker-sync was executed, the final summary must include the actual sync results and modified route map files; if unable to complete, explain the failure reason or unconfirmed content.
- No unrelated files were modified, and the user's existing changes were not reverted.

## Output Format

```md
# Execution Summary

## Result
- Complete / Partially complete / Not complete

## Changed Files
- `path/to/file`: modification description

## Verification
- Command: ...
- Result: passed / failed / not run (reason)
- Verification gate: passed (fresh output confirmed) / not passed / not applicable (reason)

## Execution Strategy
- Sub-agent usage: required for plan execution / not used (small task, no plan)
- Task grouping: none / ...

## Task Review
- Review stages: Stage 1 (spec compliance) completed / Stage 2 (code quality) completed
- Conclusion: passed / issues found and fixed / remaining issues
- Concerns: ...

## WorkerSync
- Need worker-sync: yes / no / uncertain
- Affected features: ...
- Sync result: not executed / updated / no update needed / partial / uncertain / failed (reason)
- Route map files: none / `docs/workerhelper/...`

## Remaining Issues
- None / ...
```

## Anti-Patterns

| Excuse | Reality |
|---|---|
| "This change is small, no need to verify" | Small changes cause big breakages. A typo in a config key, a wrong import path — all catchable by running verification. |
| "Tests pass" (from memory / last run) | Memory is unreliable. The verification gate requires fresh command output. Run the command. Read the output. Then claim. |
| "The sub-agent said tests passed" | Sub-agent self-reports are not verification. The main thread must read fresh test output directly. |
| "I'm confident the changes are correct" | Confidence is not evidence. Run the verification command and read the output. |
| "I'll skip the review sub-agent, this isn't that complex" | Medium-to-large changes always benefit from a second look. The review sub-agent catches omissions and regressions that the implementer is blind to after writing the code. |
| "The plan already had review built in" | Plan review (design-time) and code review (implementation-time) catch different classes of issues. Both are needed. |
| "I'll just refactor this one thing while I'm here" | Opportunistic refactoring risks introducing new bugs, expanding scope, and confusing review. Stick to the planned changes only. |
| "I need to add a test for this later, let me just finish the fix" | Unless the change is trivial or purely mechanical, you didn't confirm the test catches the original issue. Write the failing test before the fix. |
| "The worker-sync can wait" | Delayed worker-sync = stale route map = slower lookups for the next task. Do it now while context is fresh. |
