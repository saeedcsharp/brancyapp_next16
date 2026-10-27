# State Management

## Global Providers

`app/providers.tsx` composes NextAuth `SessionProvider`, `DirectionProvider`, `InstaProvider`, and the notification component.

## Local State

Most page and component state uses React `useState`, `useReducer`, `useRef`, and `useEffect`. No centralized atom/store library is installed (the unused `jotai` dependency was removed on 2026-09-30).

## Browser State

Theme and language use localStorage. The custom text editor uses localStorage autosave in its module.

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
