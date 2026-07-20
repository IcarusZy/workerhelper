> **2026-07-20 — Rename & cross-harness note**
> This project was renamed `route-spec` → `workerhelper`, re-owned to `IcarusZy`, and made cross-harness (OpenCode + Claude Code + Codex). Skill renames: `route-lookup/init/sync/debug` → `worker-lookup/init/sync/debug`, `using-route-spec` → `using-workerhelper`. Storage dir `docs/routespec/` → `docs/workerhelper/`. The historical entries below intentionally retain the old `route-spec` names.

---

# Complete Modification Completion Status

## Overview

Enhanced the route-spec skill group with 5 improvements identified by comparing against the superpowers skill group. Addressed 6 files (5 modified, 1 created). Two rounds of review (9 issues found and fixed in round 1, 3 minor issues fixed in round 2).

## Changes Summary

| # | Enhancement | Files Affected | Status |
|---|---|---|---|
| 1 | Systematic debugging skill (route-debug) | NEW: `skills/route-debug/SKILL.md` | Complete |
| 2 | Verification gate in exec-plan | Modified: `skills/exec-plan/SKILL.md` | Complete |
| 3 | Anti-pattern tables across skills | Modified: `skills/route-lookup/SKILL.md`, `skills/design/SKILL.md`, `skills/plan/SKILL.md`, `skills/exec-plan/SKILL.md` | Complete |
| 4 | Enhanced two-stage review protocol in exec-plan | Modified: `skills/exec-plan/SKILL.md` | Complete |
| 5 | TDD principle in exec-plan | Modified: `skills/exec-plan/SKILL.md` | Complete |

## Detailed Changes

### 1. Route-Debug Skill (NEW)

Created `skills/route-debug/SKILL.md` — a 3-phase systematic debugging workflow:

- **Phase 1: Reproduce and Scope** — reproduce the bug, determine expected vs actual behavior, identify blast radius
- **Phase 2: Trace the Data Flow** — trace backward through call stack, find divergence point, compare with working code paths
- **Phase 3: Hypothesize, Test, Confirm** — form single hypothesis, test with minimal diagnostic changes, document fix but do NOT implement

Key design decisions:
- Route-debug does NOT implement fixes — it diagnoses root cause and hands off to exec-plan
- Leverages route-lookup results for targeted code examination
- Escalation: 2 failed fixes → return to Phase 2; 3rd failure → question architecture
- Includes anti-pattern table (6 entries) and red flags list

### 2. Verification Gate (exec-plan)

Added an iron-law verification gate to `skills/exec-plan/SKILL.md`:

- **Core Principle**: "No completion claim without running the verification command and reading its output fresh"
- **Workflow step 6**: Mandatory fresh command output before claiming success
- **Completion Checklist**: Verification gate must be passed — no claims based on memory, assumptions, or sub-agent self-reports
- **Output Format**: New `Verification gate` field with status

### 3. Anti-Pattern Tables

Added rationale defense tables to 4 skills (6 entries each):

| Skill | Anti-patterns Added |
|---|---|
| route-lookup | "I can find this without the route map", "This task is too simple", "The map might be outdated", etc. |
| design | "This is too simple to need a design", "I understand what the user wants", "I'll figure it out as I implement", etc. |
| plan | "I'll just figure it out as I go", "Tasks are too interdependent", "I don't need task IDs", etc. |
| exec-plan | "This change is small, no need to verify", "Tests pass (from memory)", "The sub-agent said tests passed", "I'll just refactor this one thing", etc. |

### 4. Enhanced Two-Stage Review Protocol (exec-plan)

Upgraded the Task Review section from a flat 5-item checklist to a two-stage protocol:

- **Stage 1: Spec Compliance** — requirement coverage, behavioral risks, route map impact (MUST complete before Stage 2)
- **Stage 2: Code Quality** — code scope, verification adequacy (fresh output required)
- **Review Sub-Agent** — dedicated sub-agent for both stages on medium+ changes; main thread reviews conclusions
- **Review Red Flags** — 5 explicit prohibitions (skipping review, trusting self-reports, skipping stages)

### 5. TDD Principle (exec-plan)

Added optional TDD guidance to workflow step 5:

- Guideline: write failing test first for new logic, bug fixes, new feature behavior
- Explicit exceptions: trivial one-liners, purely mechanical changes
- Anti-pattern softened to match: "Unless the change is trivial or purely mechanical"

### 6. Route-Lookup Updates

- Added `bug-fix` task intent type that routes to `route-debug` (not exec-plan)
- Bug reports and test failures MUST route to `route-debug` — no fix without root cause
- Removed "fixing" from execution task list to avoid overlap with bug-fix intent
- Added "This does NOT include bug or test failure reports" to execution task definition
- Updated internal checklist: `Task type (for execution and bug-fix tasks)`
- Added `route-debug` to recommended next skills
- Default uncertainty between bug-fix and feature change treated as bug-fix

### 7. Using-Route-Spec Updates

- Added `route-debug` to workflow overview (index 3 of 7)
- Updated flow rules: bugs → route-lookup → route-debug → (exec-plan for localized fixes, design → plan → exec-plan for unclear approach)

## Cross-Skill Consistency Verification

- exec-plan workflow step 1: reads route-debug debug summary as execution note
- route-debug Phase 3: documents fix, does NOT implement (hands off to exec-plan)
- route-debug Output Format: Fix Direction fields match exec-plan expected input fields
- All anti-pattern tables: consistent `| Excuse | Reality |` format across 5 files
- Verification gate: consistently referenced in Core Principles, step 6, completion checklist, and output format

## Review History

**Round 1:** 3 Critical, 4 Important, 2 Minor — all fixed
**Round 2:** 0 Critical, 0 Important, 3 Minor — all fixed
**Final:** PASS — all issues resolved

## Files Changed

| File | Type | Description |
|---|---|---|
| `skills/route-debug/SKILL.md` | Created | New systematic debugging skill |
| `skills/route-lookup/SKILL.md` | Modified | Bug-fix routing, anti-patterns, task type fields |
| `skills/design/SKILL.md` | Modified | Anti-pattern table |
| `skills/plan/SKILL.md` | Modified | Anti-pattern table |
| `skills/exec-plan/SKILL.md` | Modified | Verification gate, two-stage review, TDD, anti-patterns, route-debug input |
| `skills/using-route-spec/SKILL.md` | Modified | route-debug in workflow overview and flow rules |
| `.gitignore` | Modified | Added superpowers/ exclusion (preexisting change) |
