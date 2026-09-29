# Built-in Stack Registry (read-only defaults)

Greenfield agenda section 1 (Tech stack) resolves from here when no user/company layer
exists. The USER layer at `~/.workerhelper/stacks.md` overrides this file wholesale on
stack-name collision — companies should record their constraints there once, and every
future project proposes from them.

Entry schema:

```md
## <stack name>
- use when: <the situation this stack fits>
- init: <official scaffold command>
- defaults: <language version, key libraries worth proposing>
- notes: <conventions, gotchas>
```

The built-in layer deliberately stays generic (official tooling, no private templates).
If it proposes nothing for the user's situation, research current official tooling and
recommend with reasons — and offer to record the result in the user layer.

---

## node-web-ts
- use when: browser frontend or full-stack web app, TypeScript preferred
- init: `npm create vite@latest <name> -- --template <vue|react>-ts` (frontend) / `npx nest new <name>` (API server)
- defaults: Node 20 LTS, Vitest for tests
- notes: keep frontend and API as separate packages from day one if both are planned.

## python-service
- use when: services, automation, data/agent backends
- init: `uv init --package <name>` (add `--app` for app layout)
- defaults: Python 3.12+, `uv` for deps/run, pytest
- notes: pin the Python version in `.python-version`; put credentials in `.env` only.

## java-spring
- use when: enterprise services on the JVM
- init: Spring Initializr (start.spring.io) — web, validation, and the driver of the chosen storage as starting dependencies
- defaults: Java 21 LTS, Spring Boot 3.x, Maven
- notes: generate `.env`-equivalent config as `application-dev.yml` and keep `application-prod.yml` out of VCS.

## go-service
- use when: single-binary services / CLIs where deployment simplicity dominates
- init: `go mod init <module-path>` (scaffold by hand — the stdlib is the framework)
- defaults: Go latest stable, stdlib `net/http`, `testing`
- notes: resist web frameworks until a need is concrete.
