# Architecture

Reviewed legacy Instagramer route pages now rely on middleware for package-expiry enforcement while retaining local account, role, shopper, session-rendering, and fetch behavior. Home, story index/detail, market, message, and Instagramer navbar package code remains deferred pending ownership clarification.

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

- All protected App Router paths are enforced by `middleware.ts` in the Node.js runtime. It reads the Docker JWT secret at `/run/secrets/brancyapp_jwt_token` with `NEXTAUTH_SECRET` as the deployment fallback, validates the NextAuth token, and redirects missing tokens to `/`. Instagramer paths additionally use current-account and package-expiry redirects; `/customershop/*` and `/user/*` receive authentication only. Client route wrappers retain session readiness and route-specific behavior without `onUnauthenticated` callbacks.

- App Router wrappers use the non-required `useSession()` form. They preserve existing `session` and `status` handling but do not enable NextAuth's automatic `SessionRequired` redirect; middleware continues to own authentication enforcement.

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
