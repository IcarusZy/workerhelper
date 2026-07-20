---
name: using-workerhelper
description: WorkerHelper workflow guide. All coding tasks must load worker-lookup first, then follow its guidance for subsequent steps.
---

# WorkerHelper Workflow Guide

WorkerHelper is a suite of AI coding workflow skills that quickly locate code through feature route maps and select appropriate execution flows based on task scale.

## Core Rule

**All coding tasks must load `worker-lookup` first, then follow its guidance for subsequent steps.**

## Workflow Overview

1. **worker-lookup** — Query the feature route map to locate relevant code (mandatory entry point for all coding tasks)
2. **worker-init** — Create the feature route map for the first time (auto-triggered by worker-lookup when the route map does not exist)
3. **worker-debug** — Systematic debugging workflow leveraging route map for root cause analysis (for bugs, test failures, unexpected behavior)
4. **design** — Requirement clarification and solution design (for medium-to-large tasks or unclear scope)
5. **plan** — Generate execution plan (after design is confirmed)
6. **exec-plan** — Execute the plan or directly implement small changes
7. **worker-sync** — Sync the feature route map (after feature changes are completed)

## Flow Rules

- Small, clear changes (typos, formatting, dependency upgrades, etc.) → worker-lookup → exec-plan
- Bugs, test failures, unexpected behavior, crashes → worker-lookup → worker-debug → (exec-plan for localized fixes, design → plan → exec-plan for fixes with unclear approach or broad scope)
- Medium-to-large or unclear tasks → worker-lookup → design → plan → exec-plan
- After feature changes are completed → worker-sync

## Platform Adaptation

If your harness needs special setup, see:

- Codex: `references/codex-tools.md`
