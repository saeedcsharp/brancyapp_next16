# Style Guide

## UI Style

The app uses SCSS, CSS modules, global theme variables, icon/image assets, Montserrat/Lahzeh/Yekanbakh fonts, RTL/LTR direction support, and feature-specific CSS files.

## Design System Consistency

Before implementing new UI, first inspect `scss/` for shared variables, typography, layout, buttons, icons, animations, and other style layers, then inspect `components/design/` for reusable controls and interaction patterns. New code must reuse these sources and follow their spacing, colors, typography, responsive behavior, RTL/LTR behavior, accessibility states, and naming conventions. Avoid parallel tokens, duplicate controls, or unrelated visual styles unless an exception is necessary and documented.

## Code Style

Use TypeScript where possible, preserve existing import alias style (`brancy/*`), keep CSS module naming consistent with nearby files, and avoid unrelated formatting churn.

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
