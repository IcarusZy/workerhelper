# Built-in MCP Registry (read-only defaults)

Connection-type → MCP tool defaults. The USER layer at `~/.workerhelper/mcp-registry.md`
overrides this file: copy this file there and edit — an entry with the same `<type>`
heading replaces the built-in one wholesale.

Entry schema:

```md
## <type>
- display: <human name>
- discover: <file patterns + key names, or "env.md / ask">
- acquire: npx | npm-g
- tool: <command + args template>
- env: <VAR>=<placeholder mapping>
- write: <what gets written where, if more than the harness MCP config>
- verify: <tool call or command proving connectivity>
- notes: <alternatives, caveats>
```

---

## mysql
- display: MySQL
- discover: `.env` / `.env.*` keys `DB_HOST|MYSQL_HOST`, `DB_PORT|MYSQL_PORT`, `DB_USER|MYSQL_USER`, `DB_PASSWORD|MYSQL_PASS|MYSQL_PASSWORD`, `DB_NAME|MYSQL_DB|MYSQL_DATABASE`; `application*.yml|properties` at `spring.datasource.*` (`url` jdbc:mysql://host:port/db, `username`, `password`)
- acquire: npx
- tool: `npx -y @benborla29/mcp-server-mysql`
- env: `MYSQL_HOST` `<host>`, `MYSQL_PORT` `<port>`, `MYSQL_USER` `<user>`, `MYSQL_PASS` `<password>`, `MYSQL_DB` `<database>`, `ALLOW_INSERT_OPERATION` `false`, `ALLOW_UPDATE_OPERATION` `false`, `ALLOW_DELETE_OPERATION` `false`
- verify: query `SELECT 1` through the MCP
- notes: write permissions default OFF — flip the `ALLOW_*` flags only on explicit request.

## redis
- display: Redis
- discover: `.env` / `.env.*` keys `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`; `application*.yml` at `spring.data.redis.*` or `spring.redis.*`
- acquire: npx
- tool: `npx -y @wenit/redis-mcp-server`
- env: `REDIS_HOST` `<host>`, `REDIS_PORT` `<port>`, `REDIS_PASSWORD` `<password>`, `REDIS_DB` `<db>`
- verify: MCP `ping({})` → PONG
- notes: supports `REDIS_READONLY=true` (analysis-safe), cluster/sentinel/TLS via extra vars. Official alternative: `redis/mcp-redis` (uvx, Python) — override this entry if preferred.

## http
- display: HTTP API
- discover: `.env` / `.env.*` keys `*BASE_URL*`, `*API_URL*`; base URLs in `application*.yml` custom properties
- acquire: none
- tool: none required — record the base URL and auth scheme in `docs/workerhelper/env.md`; if the user wants an MCP, propose a fetch-type server as a user-registry entry
- verify: `curl -sS -o /dev/null -w '%{http_code}' <base-url-or-health-path>` → any 2xx/3xx
- notes: most debugging needs only curl; keep this entry as the "recorded endpoint" bookkeeping type.

## ssh
- display: SSH server
- discover: env.md / ask — server info lives in `docs/workerhelper/env.md` or the user's head, not in repo config files
- acquire: npx
- tool: `npx -y @aiondadotcom/mcp-ssh` (reads standard `~/.ssh/config`; also needs `ssh`/`scp` on PATH)
- env: none
- write: a `Host <alias>` entry in `~/.ssh/config` (HostName/User/Port/IdentityFile) when missing — the MCP discovers it from there; passwords only via the `# @password:` ssh-config comment convention, never in MCP config
- verify: MCP `checkConnectivity(<alias>)`
- notes: tools include `runRemoteCommand`, `runCommandBatch`, `uploadFile`/`downloadFile`. Log probing (`tail`/`grep` with time window) is driven by `worker-debug`. SSH = remote execution rights: fine for test servers; for production override this entry with a security-first server such as `tufantunc/ssh-mcp` (command classification, role matrix, approvals — installed via `npm install -g ssh-mcp`, config in its TOML).
