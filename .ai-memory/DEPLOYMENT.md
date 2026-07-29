# Deployment

## Docker

The Dockerfile builds a standalone Next application using Node 22 Alpine, installs dependencies with `npm ci --legacy-peer-deps`, runs `npm run build`, copies standalone output and static assets, installs `sharp`, and runs `node server.js` as non-root `nextjs` on port 3000.

## IIS

`web.config` configures `iisnode` and rewrites requests to `/server.js` when no physical file matches.

## PWA

`next-pwa` outputs service worker assets to `public/`; PWA is disabled in development.

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
