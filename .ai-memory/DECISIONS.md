# Decisions

## Index

Decision logs have moved to the `DECISIONS/` folder for better separation by topic.

- [001-nextjs-app-router](DECISIONS/001-nextjs-app-router.md)
- [002-auth-and-api-proxy](DECISIONS/002-auth-and-api-proxy.md)
- [003-feature-and-module-indexing](DECISIONS/003-feature-and-module-indexing.md)

## Legacy Notes

- App Router wraps legacy page implementations instead of immediately rewriting all pages.
- `next/router` imports are aliased to an App Router compatibility shim.
- Client API calls prefer direct backend calls except selected user/auth proxy routes.
- Docker uses standalone Next output.

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
