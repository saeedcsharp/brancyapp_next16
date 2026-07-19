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
