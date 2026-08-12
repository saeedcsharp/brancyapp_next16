# Folder Structure

## Top-Level Inventory

- `.git/`: repository metadata.
- `.next/`: generated Next build/dev output.
- `app/`: Next App Router routes, layouts, route handlers, compatibility helpers, and the direct `/feature` knowledge-base route under `app/feature/`.
- `components/`: reusable and feature UI components.
- `context/`: React context providers.
- `FEATURES/`: business capability documentation.
- `DECISIONS/`: architecture and workflow decision logs.
- `helper/`: API, formatting, media, timers, localization, draft, and utility helpers.
- `hook/`: custom React hooks.
- `i18n/`: translations, language keys, and the nested `/feature` catalog namespace.
- `legacy-pages/`: historical page implementations rendered by app routes.
- `lib/`: currently empty library folder.
- `models/`: shared enums, interfaces, mocks, toggles.
- `node_modules/`: installed third-party packages.
- `patches/`: patch-package location, currently empty.
- `public/`: static assets, fonts, manifests, service worker files.
- `scss/`: shared Sass variables and global style layers.
- `types/`: TypeScript augmentation files.

See `MODULE_INDEX.md` for module documentation links.

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
