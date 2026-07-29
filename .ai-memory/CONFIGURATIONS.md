# Configurations

## Files

- `package.json`: scripts, dependencies, package metadata.
- `package-lock.json`: npm lockfile, lockfileVersion 3.
- `tsconfig.json`: strict TypeScript, `brancy/*` alias, Next plugin, JS allowed.
- `next.config.js`: PWA, standalone output, Sass include paths, image domains, cache headers, rewrites, webpack alias, Terser minification.
- `postcss.config.js`: autoprefixer.
- `.gitignore`: excludes dependencies, build outputs, env locals, editor/runtime files.
- `.dockerignore`: excludes node_modules, .next, git metadata, markdown files, Docker files, iisnode.
- `Dockerfile`: multi-stage Node 22 Alpine standalone build.
- `web.config`: IIS/iisnode rewrite to `server.js`.
- `.env`: local environment file, values intentionally undocumented.

## Modification Guidelines

Update this document whenever config semantics, scripts, deployment targets, aliases, or build/runtime effects change.

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
