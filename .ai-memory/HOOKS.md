# Hooks

## Discovered Hooks

- `hook/useHide.tsx`: custom UI hiding behavior.
- `helper/useInfiniteScroll.ts`: infinite scroll utility hook with optional container scrolling. Empty or duplicate-only result pages invoke `onDataFetched([], false)` and engage an internal terminal guard to prevent retry loops; consumers should still store that terminal `hasMore` value.
- `helper/useMousePosition.ts`: mouse position tracking hook with isomorphic layout effect.

Future hooks should be documented here and in module docs.

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
