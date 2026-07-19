# Performance

## Existing Controls

- Next standalone output for deployment.
- Terser configured to drop console in production browser builds.
- Next image remote patterns, AVIF/WebP formats, device/image sizes, and long cache TTL.
- Cache headers for fonts, optimized images, icons, and well-known files.
- PWA runtime caching for fonts, static assets, and HTML pages; API routes are network-only.

## Risks

Large component and legacy-page surface, generated service workers, direct backend calls, and broad SVG/image assets require ongoing bundle and cache review.

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
