# Authentication

Authentication uses NextAuth in `app/api/auth/[...nextauth]/route.ts` with JWT sessions.

## Providers

- Google OAuth credentials provider accepting an authorization code.
- Phone verification credentials provider using pre-user token and verification code.
- Direct token provider for externally supplied tokens.

## Session Shape

`types/next-auth.d.ts` augments the session user with access tokens, instagramer IDs, permissions, package expiry, roles, profile information, and feature flags.

## Secret Handling

The auth route and Instagramer middleware use `/run/secrets/brancyapp_jwt_token` when available, then `NEXTAUTH_SECRET`, and finally the existing development fallback. Middleware runs in the Node.js runtime so it can read the Docker secret file while processing requests.

## Route Enforcement

The root `middleware.ts` is the single source of truth for authentication on all protected App Router routes. It protects Instagramer paths (`/advertise`, `/customerads`, `/home`, `/market`, `/message`, `/page`, `/search`, `/setting`, `/store`, and `/wallet`) plus `/customershop/:path*` and `/user/:path*`; missing tokens redirect to `/`.

Only Instagramer paths apply selected-account (`currentIndex`) and package-expiry redirects. User paths perform authentication only, so `/user` can safely handle `currentIndex === -1` without a middleware loop. Public paths such as `/`, `/upgrade`, `/directlogin`, and `/googleoauth` are not matched. App Router page wrappers may wait for the client session or preserve route-specific role/account/query behavior, but they do not duplicate authentication callbacks or `packageStatus` checks.

App Router wrappers call `useSession()` without `required: true` or `onUnauthenticated`. This prevents NextAuth from redirecting a user who has just logged out to `/api/auth/signin?error=SessionRequired`; wrappers retain their existing `session` and `status` checks, while middleware remains responsible for unauthenticated route access.

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
