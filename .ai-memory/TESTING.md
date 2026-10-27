# Testing

## Current Finding

No dedicated test script was discovered.

## Linting

`npm run lint` runs ESLint 9 (`eslint .`) with the flat config in `eslint.config.mjs`, extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Every rule is downgraded to `warn`, so lint reports existing issues without failing; do not run `--fix` across the codebase. `types/next-auth.d.ts` is ignored because the ESLint parser rejects its `extends DefaultSession["user"]` declaration, which `tsc` skips through `skipLibCheck`. Next 16 no longer runs lint during `next build`.

## Recommended Checks

- `npm run build` for production compile validation.
- `npx tsc --noEmit` for type-only validation when needed. Stale `.next/types` entries for removed routes can fail this check until `npm run build` regenerates them.
- `npm run lint` for warning-level lint findings.
- `npm run build` rewrites tracked generated files (`next-env.d.ts`, `public/sw.js`, `public/sw.js.map`); `tsc` rewrites `tsconfig.tsbuildinfo`. Do not commit those changes unless intended.
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
