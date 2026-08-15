# AI Context

## Project Overview

Brancy is a production Next.js application for Instagram-centered business management. It includes landing pages, authentication, Instagramer dashboards, customer/user panels, messaging, comments, posts, stories, ads, market/bio-link tools, store/order flows, wallet/payment flows, localization, and PWA assets.

## Architecture

The app uses Next.js 16 with React 19, TypeScript, App Router routes under `app/`, and legacy implementation pages under `legacy-pages/`. Most app routes are thin wrappers that render legacy pages. Authentication uses NextAuth credentials providers. Client data access uses `helper/clientFetchApi.ts`, `helper/apiRouteMap.ts`, and `helper/apiBaseUrl.ts` to map local `/api/...` paths to Brancy backend services.

## Main Modules

- `app/`: route tree, layouts, API handlers, auth, redirects, errors.
- `components/`: reusable UI and feature components.
- `legacy-pages/`: migrated page implementations used by App Router wrappers.
- `helper/`: API clients, URL resolution, formatting, timers, media, drafts, localization helpers.
- `models/`: shared enums, interfaces, mock data, toggle helpers.
- `i18n/`: translations for en, fa, ar, fr, ru, tr, gr, az.
- `public/`: images, icons, fonts, manifests, generated PWA service worker files.

## Documentation Layers

- `MODULE_INDEX.md`: module catalog with priority, source of truth, and change impact guidance.
- `FEATURES/`: business capability docs for tasks that are usually requested by behavior, not by folder.
- `DECISIONS/`: architecture decisions and workflow choices that should not be lost in generic module docs.

## Coding Rules

Preserve existing path alias `brancy/*`. Keep `/api/user/*` calls server-proxied. Avoid leaking `.env` or secret values. Update documentation with every code change.

## Current Priorities And Risks

The main risks are mixed App Router/legacy-router compatibility, external backend contract drift, broad API map maintenance, generated PWA artifacts in `public/`, and limited visible test coverage.

## Terminology

Instagramer means an Instagram account owner/operator. Shopper means a seller/store role. Partner roles gate sub-admin capabilities. User panel means buyer/customer-facing workflows.

Reusable UTF-8 byte counting and Unicode-safe truncation are provided by `helper/textByteLength.ts`; the AI flow `TextNode` uses these exports for its text limit and counter.
The direct-message composer also uses the shared utility to limit drafts and outgoing text to 1,000 UTF-8 bytes.

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
