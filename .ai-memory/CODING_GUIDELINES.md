# Coding Guidelines

- Read the knowledge base before inspecting source code.
- Preserve App Router to legacy-page wrapper patterns unless intentionally migrating a route.
- Keep `/api/user/*` server-proxied unless security design changes.
- Use `clientFetchApi` and `apiRouteMap` for backend calls where existing patterns do.
- Keep secrets out of code and docs.
- Update affected documentation in the same task as implementation.

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
