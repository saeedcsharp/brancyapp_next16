# Security

## Sensitive Areas

- `.env` exists locally and must not be copied into documentation or logs.
- Auth tokens are carried in NextAuth JWT/session and `Authorization` headers.
- `redirectInterface` uses an allowlist to prevent arbitrary redirects.
- Next image configuration allows SVG with a restrictive content security policy.
- API proxy deletes session cookies on upstream 401.

## Risks

- Some hard-coded third-party API keys and fallback auth secret patterns require review before public exposure.
- Generated PWA service worker files should match current build output.
- Client-direct backend calls depend on backend CORS and token validation.

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
