# Architecture

## Runtime Shape

- Next.js 16 application with `next dev --webpack` and `next build --webpack` scripts.
- React 19 UI with TypeScript strict mode and `allowJs` enabled.
- App Router in `app/`, with many routes delegating to legacy implementations in `legacy-pages/`.
- Shared components in `components/`, shared helpers in `helper/`, shared types in `models/` and `types/`.

## Key Patterns

- Root layout initializes theme, manifests, analytics, and providers.
- `app/providers.tsx` wraps SessionProvider, DirectionProvider, InstaProvider, and notifications.
- Legacy `next/router` usage is bridged by `app/_compat/next-router.ts` through a webpack alias.
- API calls route through `clientFetchApi`; `/api/user/*` uses Next API proxy, most other calls resolve to direct backend URLs.

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
