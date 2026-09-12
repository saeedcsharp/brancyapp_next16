# Authentication

Authentication uses NextAuth in `app/api/auth/[...nextauth]/route.ts` with JWT sessions.

## Providers

- Google OAuth credentials provider accepting an authorization code.
- Phone verification credentials provider using pre-user token and verification code.
- Direct token provider for externally supplied tokens.

## Session Shape

`types/next-auth.d.ts` augments the session user with access tokens, instagramer IDs, permissions, package expiry, roles, profile information, and feature flags.

## Secret Handling

The auth route tries `/run/secrets/brancyapp_jwt_token`, then `NEXTAUTH_SECRET`, then a fallback string. Prefer real secrets in deployment and avoid documenting secret values.

## Protected Route Enforcement

The Node-runtime `middleware.ts` is the source of truth for protected App Router routes. Instagramer routes redirect to `/user` when no account is selected (`currentIndex === -1`) and redirect to `/upgrade` when a selected account (`currentIndex >= 0`) has a missing or expired package. Package enforcement does not depend on `loginByFb` or `loginByInsta`, since either flag can be false for a selected account.

Middleware must not log the complete JWT or access token.

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
