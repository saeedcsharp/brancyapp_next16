# Naming Conventions

## Routes

App Router folders define public route paths. Route groups `(instagramer)` and `(user)` organize panels without affecting URLs.

## API Paths

`clientFetchApi` normalizes local paths to lowercase scope plus lower-first action, for example `/api/post/GetPostCards` becomes `/api/post/getPostCards`.

## Imports

The `brancy/*` TypeScript path alias maps to repository root.

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
