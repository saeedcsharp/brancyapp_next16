# Error Handling

## UI Error Pages

`app/error.tsx`, `app/not-found.tsx`, `app/forbidden.tsx`, and `app/unauthorized.tsx` render styled error states.

## API Errors

`proxyToBrancy` normalizes unexpected proxy errors into an `IResult`-like object and handles 401 by deleting NextAuth cookies. Pricing returns JSON errors for upstream failure or internal exceptions.

## Client Errors

`clientFetchApi` normalizes fetch failures and JSON parse failures into `IResult` objects.

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
