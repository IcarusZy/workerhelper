---
name: worker-env
description: Discover project environment connections (.env, application.yml/.properties), wire matching MCP tools via a two-layer registry, verify connectivity, and record an environment map. Triggered after greenfield bootstrap or worker-init, on request, or from worker-debug when server-side signals are needed.
---

# Environment Setup

Discover connection info in project config files, wire matching MCP tools into the current harness, verify, and persist what was learned to `docs/workerhelper/env.md`.

## Core Principles

- **Ask before wiring.** Every MCP configuration is proposed, then confirmed. Nothing is installed or written silently.
- **Credentials never multiply.** Passwords are referenced from environment variables, never copied into new files. Source config files (`.env`, `application.yml`) are read locally and never quoted into any artifact — mask credentials when showing what was found.
- **One registry, two layers.** Built-in defaults ship with the skill; the user layer (`~/.workerhelper/mcp-registry.md`) replaces entries wholesale, so any default tool can be swapped for a preferred one.
- **npx-first acquisition.** Prefer servers that run via npx/uvx — writing the config IS the installation. `npm -g` is the fallback; binary downloads are out of scope.
- **Verify or it didn't happen.** Every configured connection runs its registry entry's verification once before being recorded as working.

## Workflow

1. **Discover.** Scan the project root for:
   - `.env`, `.env.*` (Python-style projects)
   - `application.yml` / `application.properties` / `application-*.yml|properties` (Java-style projects)

   Multiple environment profiles found (e.g. `application-dev.yml` vs `application-prod.yml`) → ask which one is CURRENT before extracting anything.
2. **Extract.** For each registry entry, apply its `discover` rules (file patterns + key names) to pull host/port/user/password/database. Values stay in memory; never echo passwords back; never write them anywhere new.
3. **Match the registry.** Two layers; a user entry with the same `<type>` replaces the built-in one wholesale:
   - user layer: `~/.workerhelper/mcp-registry.md`
   - built-in: `references/mcp-registry.md` in this skill

   A connection type found in config but absent from both layers → say so and offer to add an entry to the user registry (format at the bottom of the built-in file). Do not guess tools.
4. **Check what is already configured.** Read the current harness's project-level MCP config before proposing. Already present → offer to verify or update, never duplicate.
5. **Propose per connection:** what was found (host, port, masked credentials), which tool, what will be written where. Confirm each before writing.
6. **Wire.** Write ONLY to the current harness's project-level config:
   - Claude Code → `.mcp.json` in the project root (`mcpServers` entry)
   - OpenCode → `opencode.json` (`mcp` section)
   - Codex → the harness's project MCP config

   Passwords: pass them as env entries sourced from the original variables when the harness supports expansion; when it does not, ask the user where the secret may live rather than writing plaintext. The `ssh` type writes a `Host` entry to `~/.ssh/config` (if missing) instead — the MCP reads it from there and needs no credentials.
7. **Acquire when missing.** If the user has no working MCP for the type and confirms they want one: npx/uvx entries — the config write from step 6 is the installation. `npm -g` entries — show the install command, run it on confirmation. Never download binaries.
8. **Verify.** Run each entry's `verify` step (mysql → `SELECT 1`; redis → `ping`; ssh → `checkConnectivity`; http → curl the base URL). Report results; record failures as `unverified`, do not retry silently.
9. **Record.** Write or update `docs/workerhelper/env.md` — the environment map read by `worker-debug`'s remote log probe:

   ```md
   # Environment Map

   ## Servers
   - <alias>: <host> (<purpose>) — logs: <path>

   ## Connections
   - <type> → <tool>, configured in <harness>, verified <date> | unverified

   ## Not configured
   - <type>: <reason declined / pending>
   ```

10. **gitignore check.** If a config file containing secrets was created (`.mcp.json` or equivalent) and the repo is shared, check `.gitignore` and propose adding it.

## ssh Type Specifics

Server info usually lives nowhere in the repo, so discovery reads `docs/workerhelper/env.md`; when absent, ask: host, user, auth (key path or password), purpose, and **log file paths** (they feed `worker-debug`'s log probe). SSH grants remote execution — acceptable for test servers; for production, suggest overriding the registry entry with a security-first server (see notes in the built-in registry).

## Mount Points

This skill runs: (a) after `worker-greenfield` scaffolding passes its gate, (b) when `worker-init` completes on an existing project (offer once), (c) on explicit request, (d) when `worker-debug` needs server-side signals. Never on SessionStart — per-session automatic scanning is noise, not help.

## Anti-Patterns

| Excuse | Reality |
|---|---|
| "I'll just add the MCP config" | Silent config changes are invisible until they break. Propose → confirm → write. |
| "I'll put the password in .mcp.json for now" | Plaintext secrets multiply. Use env references; check gitignore. |
| "The tool exists on npm, it'll work" | Unverified wiring is wishful. Run the verify step or record `unverified`. |
| "Let me scan all config files every session" | Discovery runs at the mount points and on request — not SessionStart. |
| "Two registries is confusing, I'll hardcode the tool" | Hardcoded tools break the moment a user prefers another. The registry IS the feature. |
