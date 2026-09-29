---
name: worker-greenfield
description: Bootstrap a new project from zero - grilling-style requirement clarification, a five-section architecture agenda, then scaffolding via the existing plan/exec-plan chain, closing with a placeholder route map and glossary. Entered from worker-init when no route map exists and the directory is empty or the user intends a new project.
---

# Greenfield Bootstrap

From-zero project bootstrap: clarify what to build, decide architecture and stack, scaffold the initial framework, and leave behind a living route map, glossary, and design trail. This skill covers ONLY the 0→1 segment; everything after 1 reuses the standard chain (`design` → `plan` → `exec-plan` → `worker-sync`).

## Core Principles

- **Ask before generating.** An empty directory is the cheapest moment to be wrong. Never scaffold before Phase 0 and the five-section agenda are settled with the user.
- **Facts are yours, decisions are the user's.** Ecosystem viability, tool maturity, and feasibility checks are agent work — research them, don't ask. What to build, which stack, and MVP boundaries are the user's calls, always presented with your recommendation.
- **Ground the vocabulary from day one.** Terms that emerge during clarification go straight into the glossary; file, module, and variable naming then derives from that shared language.
- **The scaffold must run.** Done means: dependencies install, the entry point starts, the smoke check passes. A scaffold that cannot start is noise, not progress.
- **No empty shells.** Do not pre-generate `utils/`/`services/`/`constants/` layers "for later". Directories appear when a feature needs them.
- **Leave the map alive.** The closing route map is module-level and marked `planned` — the next session's `worker-lookup` finds module entries immediately, and `worker-sync` grows them as features land.

## Entry

This skill is reached from `worker-init`'s three-way branch:

- Directory has source/config files → stock inventory flow (NOT this skill).
- Directory is empty or holds only README/`.git` → worker-init asks once: "Empty directory detected — starting a new project?" On confirmation → this skill.
- The session states new-project intent ("新建项目 / 从零 / new project / scaffold") → this skill directly.

## Phase 0: Requirement Clarification (gate)

Do not open the agenda before this phase closes. Many developers start fuzzy about what they want to build; this phase exists to fix that before anything is decided.

1. **Ask for source material first.** Requirement docs, PRD links, sketches, reference projects — anything that already encodes intent. Read it before asking anything.
2. **Interview in rounds (grilling protocol).** Map the ask as a **design tree**: every decision branches into the decisions that hang off it. Work the **frontier** — every question whose prerequisites are already settled. Ask the whole frontier in one round: number each question, give your recommended answer, then wait. Answers reshape the tree; recompute the frontier and ask the next round.
   - A question whose answer depends on another still-open question belongs to a LATER round, not this one.
   - Finding facts is your job: research ecosystem/tooling questions yourself; never ask the user what you could look up. Don't block a round on research — only questions downstream of it wait.
3. **Cover at minimum:** what the project is; who/what it serves; the large modules; the concrete features inside them; feasibility constraints (team, deadline, ops environment); what is explicitly NOT wanted.
4. **Seed the glossary as terms emerge** — during the phase, not after it (format under Outputs).

**Phase 0 exit:** you can state the project's purpose, modules, and feature list back to the user in one tight paragraph, and the user confirms it. If you cannot, keep asking.

## The Five-Section Agenda

Run as a continued grilling — one section per round, recommended answers included:

1. **Tech stack** — resolve via the stack registry (below).
2. **Project structure** — module boundaries and directory layout. Name modules using glossary terms. Prefer few, deep modules over many shallow ones.
3. **Data & infrastructure** — storage, cache, external services, environments. Record every external dependency: this list is `worker-env`'s input.
4. **Verification strategy** — the green signal: startup command plus a smoke check (a URL that returns 200, a CLI that exits 0, a test that passes). This becomes the scaffold's acceptance gate.
5. **MVP boundary** — the first milestone's in/out list. Anything outside goes to a "Later" list in design.md, not into the scaffold.

## Stack Registry Resolution

Two layers; a user-layer entry replaces the built-in one wholesale on collision:

1. `~/.workerhelper/stacks.md` (user/company layer)
2. `references/stacks.md` in this skill (built-in defaults)

Resolution order: user layer exists → propose from it. No user layer → ask ONCE whether company stack constraints exist. Yes → guide the user to write `~/.workerhelper/stacks.md` (format in the built-in file), then propose from it. No → propose from built-in defaults (official tooling) with reasons.

## Outputs

- **design.md** — `docs/workerhelper/{yyyy-MM-dd}-bootstrap/design.md`, using the `design` skill's concise format (Goal / Scope / Assumptions / Proposed Behavior / Implementation Direction / Risks / Test Strategy / Acceptance Criteria). Current Behavior = "greenfield: nothing exists".
- **ADRs** — `docs/workerhelper/adr/NNN-{slug}.md`, one per load-bearing choice (stack, storage, structure): Status / Context / Decision / Consequences, ≤15 lines each.
- **Glossary** — `docs/workerhelper/glossary.md`:

  ```md
  # Glossary

  ## Language

  - **<term>**: <definition>. _Avoid_: <terms this replaces>

  ## Flagged ambiguities

  - <confusion that was resolved, and how>
  ```

## Handoff: Scaffold

1. Load `plan` — the agenda plus design.md are its input; the plan's steps ARE the scaffold tasks.
2. Load `exec-plan`. The greenfield verification gate, in order:
   - dependencies install cleanly
   - the entry point starts (or builds)
   - the smoke check from agenda section 4 passes

   No empty-shell directories (see Core Principles).
3. After the gate passes, seed the **placeholder route map** at `docs/workerhelper/feature-routes.md` (or directory mode if clearly multi-module):
   - Project Overview recorded for real: type, main entry, core directories, startup command, test entry
   - one entry per scaffolded module: Entry = the known file, description marked `planned: not yet implemented`
   - no fabricated feature entries; follow `worker-init`'s entry field discipline
4. Offer the **worker-env mount**: "External dependencies from agenda section 3 — configure MCP connections now?" On acceptance, load `worker-env`.

## Anti-Patterns

| Excuse | Reality |
|---|---|
| "The user described the app, I can start scaffolding" | A description is not a settled design tree. Unasked frontier questions become wrong scaffolding. |
| "I'll pick a sensible default stack" | A stack chosen without registry + user confirmation is the #1 greenfield rework source. |
| "I'll add this utils layer, it will be needed" | Speculative structure is the mud you refactor out later. Create directories when features need them. |
| "The scaffold compiles, done" | Compiles ≠ runs. The gate is install + start + smoke, not build. |
| "The route map can wait until features exist" | The next session starts blind. The placeholder map takes two minutes now. |
| "Let me ask the user which ORM is popular" | Popularity is a fact — yours to research. Only the CHOICE is the user's. |
