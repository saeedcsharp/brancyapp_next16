# Testing

## Current Finding

No dedicated test script was discovered. `package.json` includes `lint`, but in modern Next.js versions `next lint` may require migration depending on installed tooling.

## Recommended Checks

- `npm run build` for production compile validation.
- `npx tsc --noEmit` for type-only validation when needed.
- Targeted runtime checks for authentication, route redirects, API calls, and PWA behavior.

Document new tests here when test infrastructure is added.

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
