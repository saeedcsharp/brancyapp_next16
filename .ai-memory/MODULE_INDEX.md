# Module Index

Generated on 2026-07-19. Update this file whenever modules are added, removed, or renamed.

## Metadata Guide

The module catalog is the source of truth for reading priority and impact triage.

### Critical Path Modules

| Module           | Priority | Business Impact | AI Reading Priority | Source Of Truth                                                             | Depends On                                    | Used By                                     | Change Impact                                              |
| ---------------- | -------- | --------------- | ------------------- | --------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `authentication` | Critical | High            | 1                   | `app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`               | `helper/`, `app/api/`, backend auth responses | Sign-in, sign-out, redirects, user sessions | Dashboard access, permission checks, API proxy auth        |
| `app-api`        | Critical | High            | 1                   | `app/api/`, `helper/apiRouteMap.ts`, `helper/clientFetchApi.ts`             | `helper/`, backend services                   | App routes, proxy flows, user operations    | Pricing, profile, wallet, order, and panel requests        |
| `helper`         | Critical | High            | 1                   | `helper/clientFetchApi.ts`, `helper/apiRouteMap.ts`, `helper/apiBaseUrl.ts` | backend contracts, auth/session helpers       | Most UI and route handlers                  | API wiring, formatting, upload/media, localization helpers |
| `app`            | High     | High            | 2                   | `app/` route tree and wrappers                                              | `legacy-pages/`, `components/`, `helper/`     | Browser navigation and top-level routing    | Route rendering, redirects, auth guards                    |
| `legacy-pages`   | High     | High            | 2                   | `legacy-pages/` feature implementations                                     | `components/`, `helper/`, `context/`          | App Router wrappers and feature pages       | Feature behavior, UI flows, migration compatibility        |
| `components`     | High     | High            | 2                   | `components/` UI library and feature components                             | `context/`, `helper/`, `models/`              | App routes and legacy pages                 | Shared UI behavior, screen layouts, event handling         |
| `i18n`           | High     | Medium          | 2                   | `i18n.ts`, `i18n/`, `context/directionContext.tsx`                          | layout, routing, translation keys             | Most UI text and RTL handling               | Language coverage, directionality, route labels            |
| `generated-next` | Low      | Medium          | 4                   | `.next/` build output only                                                  | build tooling                                 | local dev/build artifacts                   | Regeneration behavior, not manual source edits             |

## Module Documents

- [api-routing](MODULES/api-routing.md)
- [app-accessibility](MODULES/app-accessibility.md)
- [app-api](MODULES/app-api.md)
- [app-compat](MODULES/app-compat.md)
- [app-instagramer](MODULES/app-instagramer.md)
- [app-user](MODULES/app-user.md)
- [app](MODULES/app.md)
- [authentication](MODULES/authentication.md)
- [components-Accessibility](MODULES/components-Accessibility.md)
- [components-advertise](MODULES/components-advertise.md)
- [components-confirmationStatus](MODULES/components-confirmationStatus.md)
- [components-connectionStatus](MODULES/components-connectionStatus.md)
- [components-customerAds](MODULES/components-customerAds.md)
- [components-dateAndTime](MODULES/components-dateAndTime.md)
- [components-design](MODULES/components-design.md)
- [components-design-phoneInput](MODULES/components-design-phoneInput.md)
- [components-graphs](MODULES/components-graphs.md)
- [components-hambergurMenu](MODULES/components-hambergurMenu.md)
- [components-headerTitle](MODULES/components-headerTitle.md)
- [components-homeIndex](MODULES/components-homeIndex.md)
- [components-market](MODULES/components-market.md)
- [components-messages](MODULES/components-messages.md)
- [components-navbar](MODULES/components-navbar.md)
- [components-notifications](MODULES/components-notifications.md)
- [components-notOk](MODULES/components-notOk.md)
- [components-page](MODULES/components-page.md)
- [components-reload](MODULES/components-reload.md)
- [components-search](MODULES/components-search.md)
- [components-setting](MODULES/components-setting.md)
- [components-sidebar](MODULES/components-sidebar.md)
- [components-signIn](MODULES/components-signIn.md)
- [components-signout](MODULES/components-signout.md)
- [components-store](MODULES/components-store.md)
- [components-switchAccount](MODULES/components-switchAccount.md)
- [components-upgrade](MODULES/components-upgrade.md)
- [components-userPanel](MODULES/components-userPanel.md)
- [components-website](MODULES/components-website.md)
- [components](MODULES/components.md)
- [configuration-files](MODULES/configuration-files.md)
- [context](MODULES/context.md)
- [generated-next](MODULES/generated-next.md)
- [git-metadata](MODULES/git-metadata.md)
- [helper](MODULES/helper.md)
- [hook](MODULES/hook.md)
- [i18n](MODULES/i18n.md)
- [legacy-pages-Accessibility](MODULES/legacy-pages-Accessibility.md)
- [legacy-pages-advertise](MODULES/legacy-pages-advertise.md)
- [legacy-pages-api](MODULES/legacy-pages-api.md)
- [legacy-pages-customerads](MODULES/legacy-pages-customerads.md)
- [legacy-pages-customershop](MODULES/legacy-pages-customershop.md)
- [legacy-pages-home](MODULES/legacy-pages-home.md)
- [legacy-pages-invitation](MODULES/legacy-pages-invitation.md)
- [legacy-pages-market](MODULES/legacy-pages-market.md)
- [legacy-pages-message](MODULES/legacy-pages-message.md)
- [legacy-pages-page](MODULES/legacy-pages-page.md)
- [legacy-pages-password](MODULES/legacy-pages-password.md)
- [legacy-pages-payment](MODULES/legacy-pages-payment.md)
- [legacy-pages-setting](MODULES/legacy-pages-setting.md)
- [legacy-pages-signout](MODULES/legacy-pages-signout.md)
- [legacy-pages-store](MODULES/legacy-pages-store.md)
- [legacy-pages-upgrade](MODULES/legacy-pages-upgrade.md)
- [legacy-pages-user](MODULES/legacy-pages-user.md)
- [legacy-pages-wallet](MODULES/legacy-pages-wallet.md)
- [legacy-pages](MODULES/legacy-pages.md)
- [lib](MODULES/lib.md)
- [localization](MODULES/localization.md)
- [models](MODULES/models.md)
- [patches](MODULES/patches.md)
- [public](MODULES/public.md)
- [root](MODULES/root.md)
- [scss](MODULES/scss.md)
- [text-editor](MODULES/text-editor.md)
- [types](MODULES/types.md)
- [vendor-node-modules](MODULES/vendor-node-modules.md)

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
