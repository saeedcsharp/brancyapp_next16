# State Management

## Global Providers

`app/providers.tsx` composes NextAuth `SessionProvider`, `DirectionProvider`, `InstaProvider`, and the notification component.

## Local State

Most page and component state uses React `useState`, `useReducer`, `useRef`, and `useEffect`. Some dependency support exists for Jotai, but no broad centralized atom architecture was discovered in this pass.

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
