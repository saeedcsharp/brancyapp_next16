# System Design

## High-Level Flow

Browser renders Next routes. Route components either render app-native pages or import legacy page implementations. UI components call helper functions. Data requests go through `clientFetchApi`, which normalizes local API paths, resolves backend sub-URLs, attaches session tokens and instagramer IDs, and calls backend services directly or through proxy routes.

## External Systems

- Brancy API services on `api.brancy.ir`, `api.patran.ir`, or internal Docker service `http://api:8080/`.
- Media CDN hosts configured through `helper/apiBaseUrl.ts` and Next image remote patterns.
- SignalR/minisocket URLs configured by host.
- Google Analytics and Tag Manager in root layout.
- Neshan reverse geocoding in `legacy-pages/api/get-address.ts`.

## Source Of Truth

- Authentication and session behavior: `app/api/auth/[...nextauth]/route.ts`, `helper/clientFetchApi.ts`, `types/next-auth.d.ts`.
- Backend route mapping: `helper/apiRouteMap.ts` and `helper/apiBaseUrl.ts`.
- Route compatibility bridge: `app/_compat/` and `legacy-pages/`.
- Translation and direction rules: `i18n.ts`, `i18n/`, `context/directionContext.tsx`.
- Generated PWA assets: `public/sw.js`, `public/sw.js.map`, and Workbox files in `public/`.

## Change Impact

- Auth changes may affect login, redirects, permissions, proxy routes, and session augmentation.
- API mapping changes may affect dashboards, store flows, market flows, and user-panel interactions.
- Localization changes may affect RTL rendering, layout spacing, and route titles.
- PWA changes may affect offline behavior, install prompts, and generated service worker assets.

## System Design Lab

`/dev/systemDesign` includes a bottom `Helperها` section that catalogs every file in `helper/`. Pure helpers have small live examples; helpers that require network, storage, files, DOM, or real-time connections are represented with a description and dependency label so the showcase never triggers production side effects.

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
