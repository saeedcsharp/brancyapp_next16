# Localization

## Languages

Translations exist for `en`, `fa`, `ar`, `fr`, `ru`, `tr`, `gr`, and `az`.

## Initialization

`i18n.ts` initializes i18next with English as default and fallback. `app/providers.tsx` switches to stored language after hydration. Root layout sets document direction before hydration based on localStorage language for `fa` and `ar`.

## Rules

Add keys to `i18n/languageKeys.ts` only when enum-based usage is needed. Keep translation objects aligned across languages.
Backend `ResponseType` notifications are mapped to `Notify_*` language keys in `components/notifications/notificationBox.tsx`; every mapped key must exist in all eight locale files.
Every key used through `t(LanguageKey...)` must exist in all eight locale files. The eight locale files currently share 2,971 direct string translation keys. The synchronization utility at `scripts/sync-i18n-keys.cjs` aligns locale keys, preserves nested translation objects, and uses the key name as a placeholder when no English value exists.

`i18n/featureKnowledge.ts` is a nested namespace composed into every i18n resource by `i18n.ts`. It provides reviewed Persian and English feature-knowledge-base content; Persian `/feature` copy prefers plain Persian equivalents, Persian transliteration for unavoidable brand names, and a short conversational tone for general audiences, while technical route and identifier values remain unchanged. The remaining six locale resources deliberately use English fallback values until reviewed translations are supplied. It does not need entries in `LanguageKey` because the page uses string namespace keys.

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
