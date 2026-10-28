# Configurations

## Files

- `package.json`: scripts, dependencies, package metadata.
- `package-lock.json`: npm lockfile, lockfileVersion 3.
- `tsconfig.json`: strict TypeScript, `brancy/*` alias, Next plugin, JS allowed.
- `next.config.js`: PWA, standalone output, Sass include paths, image domains, cache headers, rewrites, webpack alias, Terser minification.
- `postcss.config.js`: autoprefixer.
- `eslint.config.mjs`: ESLint 9 flat config extending `eslint-config-next` core-web-vitals and TypeScript presets with every rule downgraded to `warn`; used by `npm run lint` (`eslint .`).
- `.gitignore`: excludes dependencies, build outputs, env locals, editor/runtime files.
- `.dockerignore`: excludes node_modules, .next, git metadata, markdown files, Docker files, iisnode.
- `Dockerfile`: multi-stage Node 24 Alpine standalone build.
- `web.config`: IIS/iisnode rewrite to `server.js`.
- `.env`: local environment file, values intentionally undocumented.
- `.vscode/mcp.json`: team-shared, documentation-only Patran Swagger MCP configuration.

## Modification Guidelines

Update this document whenever config semantics, scripts, deployment targets, aliases, or build/runtime effects change.

## Patran Swagger MCP

The workspace server `patran-swagger` launches the community-maintained
[`@emreyc/swagger-mcp`](https://github.com/emreycolakoglu/swagger-mcp) package,
pinned to `0.2.1`, through `npx --yes --ignore-scripts`. It uses local MCP stdio
and reads `https://api.patran.ir/swagger/v1/swagger.json` through `API_DOCS_URL`.
It is developer tooling, not a Next.js dependency, route, or runtime service.
Node.js 18+ and npm are required; Node.js 24 was available during setup.
The first launch needs access to npm and the Swagger host.

### Selection And Security

- The repository, MIT license, entrypoint, tool handlers, loader, npm publisher/
  repository metadata, and published tarball SHA512 were reviewed before execution.
  The package uses the official MCP SDK and has no install/postinstall hooks;
  `--ignore-scripts` also disables dependency lifecycle scripts.
- SmartBear's official [`@smartbear/mcp`](https://github.com/SmartBear/smartbear-mcp)
  was considered but its documented Swagger integration targets authenticated
  SwaggerHub/SmartBear services and includes write/testing tools. Arbitrary
  public OpenAPI URL ingestion was not documented for that integration.
- The selected server only navigates specifications; it exposes no API-operation
  execution tool. It can accept alternate specification URLs/local paths and
  resolve external references, so use only the configured trusted Patran source.
  MCP read-only annotations are hints, not an operating-system sandbox.
- No Patran token, API key, account session, or `.env` value is required or stored.
  Do not add credentials to committed configuration or send private specifications
  to unrelated services. Review source and dependency changes before version upgrades.
- `.gitignore` makes only `.vscode/mcp.json` shareable; other editor files remain
  ignored. No application package or lockfile change is needed.

### Starting In VS Code

1. Open the repository as a trusted workspace with GitHub Copilot agent support.
2. Run **MCP: List Servers**, select `patran-swagger`, and start it (or use the
   Start action in `.vscode/mcp.json`). Review the server trust prompt.
3. Ensure its tools are enabled in the chat's tool selector/customization UI.
   The available tools are `get_api_overview`, `list_tags`, `list_endpoints`,
   `search_endpoints`, `list_schemas`, `search_schemas`, `get_endpoint`,
   `get_schema`, and `get_auth`.
4. Ask Copilot to use `patran-swagger` explicitly, then inspect the actual MCP
   tool call and result. A saved configuration or a separate protocol-client
   test alone does not prove that the current Copilot session has these tools.

The committed configuration persists across VS Code restarts; it does not keep
a standalone background service running. Startup, trust, tool permissions,
network access, and host discovery must still succeed. Some Copilot SDK/CLI
hosts use a separate portable `mcpServers` configuration instead of VS Code's
`servers` format. If the current host does not discover this workspace server,
use that host's documented MCP setup rather than assuming it is connected.
Do not silently change a teammate's user/global configuration.

### Verification And Contract Limits

Verified on 2026-10-27 using the exact workspace launch configuration: a fresh
stdio client completed MCP initialization, discovered all nine read-only tools,
searched and inspected three real operations, resolved `CreatePartnerInfo` and
its `PartnerRole` enum, and exited cleanly. The same tools then became available
in the active Copilot session and were called successfully there, proving host
discovery in addition to standalone protocol operation.

Successful actual Copilot MCP calls included:

| Tool | Input | Observed result |
| --- | --- | --- |
| `get_api_overview` | Configured default source | `Mad_NetCore`, OpenAPI `3.0.1`, 409 operations, 189 schemas |
| `search_endpoints` | `/Instagramer/Account/GetInfo` | Matching GET operation |
| `search_endpoints` | `/Instagramer/Account/BlockUserId` | Matching GET operation |
| `search_endpoints` | `/Instagramer/Account/CreatePartner` | Matching POST operation definition only |
| `get_endpoint` | GET `/Instagramer/Account/BlockUserId` | `userId` integer and `reason` string query parameters |
| `get_endpoint` | POST `/Instagramer/Account/CreatePartner` | Resolved JSON request fields and `200 Success` without a response schema |
| `get_schema` | `CreatePartnerInfo`, then `PartnerRole` | Request properties and the referenced integer enum |
| `search_schemas` | `CreatePartnerInfo` | Matching named schema |

No described API operation was executed, including the displayed POST and
potentially mutating GET operation. There were no application dependency,
business-logic, authentication, user/global MCP, or secret changes. The test
process stopped; VS Code manages its own MCP process. A subsequent fresh-process
test used the cached pinned package successfully. A full VS Code close/reopen
was not performed; startup after reopening remains subject to the documented
trust, host discovery, runtime, network, and tool-permission requirements.

The backend document previously contained OpenAPI `3.0.1`, 408 paths, 409
operations, and 189 named schemas; these counts can change. Most responses have
only a success description, not a response schema. Report missing response
contracts explicitly rather than generating unsupported models.

Specifications are cached for the MCP process lifetime. Restart `patran-swagger`
after backend changes to fetch the latest contract; reopening a chat alone may
reuse the same server process. Do not cache a downloaded copy as the source of truth.

Official client guidance: [VS Code MCP documentation](https://code.visualstudio.com/docs/agent-customization/mcp-servers).

---

# AI Maintenance Policy

This document is part of the project knowledge base.

Before modifying related code:

- Read this document.
- Understand the documented architecture and rules.

After modifying related code:

- Update this document if information changed.

Keep documentation synchronized with the implementation.

---
