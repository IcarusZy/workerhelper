---
name: worker-debug
description: Systematic debugging workflow that leverages the feature route map for targeted root cause analysis. Triggered when users report bugs, test failures, unexpected behavior, crashes, or regressions. Load after worker-lookup has located relevant code.
---

# Route Debug

Systematic debugging that leverages worker-lookup results to trace bugs to their root cause before proposing fixes.

## Core Principles

- No fix without root cause investigation first.
- Route-lookup results determine priority files to examine; don't redo code location.
- Each phase must be completed before proceeding to the next.
- Test hypotheses with minimal, single-variable changes; never batch multiple unverified assumptions.
- When 3+ attempted fixes fail, question the architecture, not the hypothesis. After 2 failed fixes, return to Phase 2 for a deeper root cause re-analysis; if the new fix also fails on the third attempt, the architecture itself may be wrong rather than the hypothesis.

## Workflow

### Phase 1: Reproduce and Scope

1. Read the `worker-lookup` results and related code from Priority Files.
2. Reproduce the issue: identify exact steps, inputs, or conditions that trigger it.
3. Determine scope:
   - What is the actual behavior vs. expected behavior?
   - Is it a regression (was it working before)?
   - What inputs, states, or environments reproduce it?
   - What is the blast radius (affected features, modules, data)?
4. If unable to reproduce: halt this phase — gather more information from the user, recent changes, logs, or error traces. Do not proceed without reproduction.

### Phase 2: Trace the Data Flow

1. From the reproduction point, trace backward through the call stack to find where behavior diverges from expectation.
2. Identify the narrowest code path that produces the bug: which function, at which point, with what state.
3. Compare against any working code path that does similar work but doesn't exhibit the bug (skip if no parallel path exists).
4. Document the divergence point — the exact file, function, and condition where the bug manifests.

### Phase 3: Hypothesize, Test, Confirm

1. Form a single root-cause hypothesis supported by evidence from Phase 2.
2. Test the hypothesis with a minimal diagnostic change or logging:
   - Add targeted logging or assertions to confirm the hypothesis.
   - If the hypothesis is wrong, return to Phase 2 with the new evidence.
3. Once the root cause is confirmed, document the minimal correct change — do not implement the fix here; hand off to `exec-plan` for implementation (see Execution Handoff below).
4. Ensure the reproduction case from Phase 1 is clearly documented for exec-plan to validate after implementation.

## Execution Handoff to exec-plan

Before handing off, a fix has been identified but NOT implemented. The debug summary below serves as the execution note for exec-plan.

When the root cause is understood and the fix is clear:

- Small, localized fixes → the `Fix Direction` section of this skill's Output Format serves as a brief execution note; hand off to `exec-plan`.
- Fixes requiring multi-file changes, new tests, or behavioral adjustments → record findings in `docs/workerhelper/yyyy-MM-dd-{bug-name}/design.md` (if the fix scope warrants design clarification) and optionally `plan.md`, then hand off to `exec-plan`.
- If root cause is identified but fix approach is uncertain → load `design` to evaluate approaches.

## When to Escalate

- Reproduction cannot be achieved after thorough investigation → output what is known and recommend user steps.
- Root cause points to third-party dependency or external system → document evidence and recommend mitigation options.
- Root cause reveals a design flaw broader than the immediate bug → recommend loading `design` for a broader solution.

## Anti-Patterns

| Excuse | Reality |
|---|---|
| "The error message is clear, I know what to fix" | Error messages describe symptoms, not root causes. Fix the symptom without understanding root cause = whack-a-mole. |
| "This is a simple bug, no need for process" | Simple bugs have simple root causes, but guessing still wastes time. A 3-minute trace is faster than iterating 5 wrong fixes. |
| "I'll just add a null check there" | Null checks without understanding why something is null hide the real bug and create new ones. Trace first. |
| "I can reproduce it in my head" | Mental reproduction is unreliable. Actually run the reproduction case. |
| "I'll fix it as I trace it" | Mixing investigation and fixing muddies the evidence. Understand first, fix second. |
| "Let me try a few things to narrow it down" | "A few things" = changing multiple variables simultaneously. Change one thing at a time and observe the result. |

## Red Flags — Stop and Return to Phase 2

- You're about to write a fix without being able to reproduce the bug.
- You've tried 2 different fixes and neither resolved the issue. Return to Phase 2 for deeper analysis; if the next hypothesis also fails, question the architecture.
- Your fix introduces new test failures.
- You can't explain why your fix works — you only know that it "seems to work."
- You're adding guards (null checks, try-catch) without understanding the data flow.
- You're modifying code outside the files identified in worker-lookup without understanding the connection.

## Internal Decision Checklist

Before handing off to exec-plan, confirm:

- [ ] Bug is reproduced.
- [ ] Data flow is traced to a specific divergence point (file, function, condition).
- [ ] A single root-cause hypothesis is supported by evidence and confirmed.
- [ ] The minimal correct change is identified and documented (in Fix Direction).
- [ ] Reproduction case is prepared for exec-plan to validate the fix.
- [ ] Next step: hand off to `exec-plan` with the debug summary.

## Output Format

```md
# Debug Summary

## Bug
- Observed behavior: ...
- Expected behavior: ...
- Reproduced: yes / no (steps)

## Root Cause
- Divergence point: `path/to/file:line` — function/condition
- Explanation: ...

## Fix Direction
- Minimal change: ...
- Affected files: ...
- Verification: ...
- Next step: exec-plan / design / escalate
```
