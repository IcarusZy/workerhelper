---
name: design
description: Requirement clarification, scope confirmation, and solution design. Suitable for unclear requirements, medium-to-large tasks, or scenarios where a solution needs to be confirmed first.
---

# Design

Transform requirements into a clear design solution without generating an execution plan.

## Core Principles

- **Clarify at the scale the ambiguity deserves.** Scope essentially clear → blocking questions only, asked one at a time with 2-3 reference options; non-blocking uncertainties go into Assumptions and the process continues. Scope genuinely unclear → switch to the **Grilling Protocol** and interview in rounds before designing anything.
- **Facts are yours, decisions are the user's.** Anything answerable from the feature route map, the code, or research is never asked of the user. Only choices go to the user, each presented with your recommendation.
- Design only answers goals, scope, behavior differences, implementation direction, risks, and acceptance criteria.
- All files and impact scopes must be based on user requirements, the feature route map, and code facts.
- Do not break down detailed coding tasks, do not maintain task checklists, and do not default to generating `plan.md`.
- Ask questions and present findings in the user's conversation language.

## Workflow

1. Read the output of the `worker-lookup` skill, combining related feature location entries and necessary code context to begin work. This skill depends on the results of `worker-lookup`; if worker-lookup has not been executed yet, load that skill first.
   - Record the source of key files: `route-map` / `scan` / `uncertain`, used for subsequent planning and execution to judge location reliability.
2. Determine the ambiguity tier:
   - **Tier A — scope essentially clear** (the ask names concrete behavior, features, or files; worker-lookup covers the rest): use the blocking-question loop in step 3.
   - **Tier B — scope genuinely unclear** (fuzzy goal, unfamiliar domain, conflicting asks, cross-module impact unknown, or the user is still shaping the idea): run the **Grilling Protocol** (see below) before writing anything, then continue at step 4 with the settled understanding.
3. (Tier A) If there are blocking questions, ask them one at a time in priority order: present only the most critical question each time with 2-3 reference options; after the user answers, determine whether the next blocking question needs to be asked.
4. Confirm task objectives, in-scope items, and non-objectives.
5. Compare current behavior with target behavior and provide a recommended implementation direction.
6. Explain potentially affected key files, risks, acceptance criteria, and verification direction.
7. When the user only wants a solution, stop at the design artifact; when the user decides to implement, medium-to-large tasks proceed to `plan`, and small, clear tasks can proceed to `exec-plan`.

## Blocking Question Format

```md
Need to confirm one question first: {question}

Reference options:
- A. ...
- B. ...
- C. ... (optional)
```

If the options cannot cover the user's intent, the user is allowed to provide a custom answer directly. Multiple blocking questions must not be presented at once.

## Grilling Protocol (Tier B — unclear scope)

Interview the user in rounds until every branch of the design is settled. Map the ask as a **design tree**: every decision branches into the decisions that hang off it.

- Work the **frontier** — every question whose prerequisites are already settled. Ask the whole frontier in one round: number each question and give your recommended answer. Wait for the user's answers; recompute the frontier; ask the next round. A question whose answer depends on another still-open question belongs to a LATER round, not this one.
- **Facts are yours**: resolve code-location questions via `worker-lookup` and ecosystem/tooling questions via research — never ask the user what you could look up. Don't block a round on research; only questions downstream of it wait.
- **Decisions are the user's**: every choice goes to them with your recommendation, never silently assumed.

Round format:

```md
❓ **Q1** — <question title>: <body, may include options>
➡️ <your recommended answer>

❓ **Q2** — ...
➡️ ...
```

Termination: the frontier is empty — every branch visited, nothing left silently assumed. Play the settled understanding back to the user in one tight paragraph; only after their confirmation write `design.md`. If rounds reveal the task is actually small, fall back to a design summary in the response (see Output Requirements).

## design.md Concise Format

```md
# Design: {taskName}

## Goal
- ...

## Scope
- In: ...
- Out: ...

## Assumptions
- None / ...

## Current Behavior
- ...

## Proposed Behavior
- ...

## Implementation Direction
- ...

## Affected Files
- `path/to/file` (source: route-map / scan / uncertain): impact description

## Risks
- None / ...

## Test Strategy
- ...

## WorkerHelper Impact
- Need worker-sync: yes / no / uncertain
- Affected routes: ...

## Acceptance Criteria
- ...
```

## Output Requirements

- If it becomes clear during requirement confirmation that the coding task is actually a small task, a design summary can be output directly in the response without requiring a file write.
- For medium-to-large tasks or when the user requests `design.md`, write to `docs/workerhelper/yyyy-MM-dd-{taskName}/design.md`.
- In task directory naming, use the current date; `taskName` should be a short kebab-case string; Chinese task names should be converted to a stable English or pinyin summary; if the directory already exists, append a sequence number like `-2`, `-3`, etc.
- After completing the `design.md` write, prompt the user that the next step will load `plan` to generate the execution plan document; only when subsequent implementation has been determined to be a small, clear task, prompt to proceed to `exec-plan` for direct execution.

## Exit Conditions

- Blocking questions have been resolved, or waiting for the user to answer the current single blocking question (Tier A); or the grilling frontier is empty and the user confirmed the shared understanding (Tier B).
- Objectives, scope, non-objectives, and recommended implementation direction have been clarified.
- Key files, risks, acceptance criteria, and verification direction have been explained.
- Next step clearly points to `plan`, `exec-plan` for small clear tasks, or waiting for user confirmation.

## Anti-Patterns

| Excuse | Reality |
|---|---|
| "This is too simple to need a design" | Simple features have edge cases and scope creep risks too. A 2-minute design summary catches them before coding. |
| "I understand what the user wants, let me start coding" | Assumed intent is the #1 source of rework. Confirm scope and behavior first, even briefly. |
| "I'll figure out the design as I implement" | Inline design mixes two activities (designing + coding) that require different mindsets. Separate them for clarity. |
| "The user gave clear requirements, no need to clarify" | Clear requirements can still have hidden scope gaps, platform assumptions, or conflicting expectations. Confirm in-scope and out-of-scope items explicitly. |
| "I'll dump every question I have in one go" | Unstructured question dumps get rushed, incomplete answers. Tier A asks one blocking question at a time; Tier B grilling asks the STRUCTURED frontier per round — numbered, dependency-ordered, each with a recommended answer. |
| "The worker-lookup found the files, I know what to change" | Knowing which files to change is not the same as knowing what to change, why, and what the risks are. Design bridges that gap. |
| "The requirements are fuzzy, but I'll assume something reasonable and note it in Assumptions" | Assumptions are for non-blocking uncertainties. A fuzzy goal or missing impact map is Tier B — grill it in rounds first. Assuming through load-bearing choices is rework bait. |
