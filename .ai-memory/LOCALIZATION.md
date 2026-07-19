# Localization

## Languages

Translations exist for `en`, `fa`, `ar`, `fr`, `ru`, `tr`, `gr`, and `az`.

## Initialization

`i18n.ts` initializes i18next with English as default and fallback. `app/providers.tsx` switches to stored language after hydration. Root layout sets document direction before hydration based on localStorage language for `fa` and `ar`.

## Rules

Add keys to `i18n/languageKeys.ts` only when enum-based usage is needed. Keep translation objects aligned across languages.

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
