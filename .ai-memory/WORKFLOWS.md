# Workflows

## Development

Use `npm run dev` to run Next with webpack. Use `npm run build` for production build validation. Use `npm run start` after build for standalone Next runtime.

## API Change Workflow

1. Add or update local API usage.
2. Update `helper/apiRouteMap.ts` when mapped direct backend calls are needed.
3. Verify `/api/user/*` proxy behavior if auth/user routes are involved.
4. Update `API.md` and related module docs.

## Documentation Workflow

Every code change updates related `.ai-memory` files before completion.

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
