# app/feature

## Purpose

Owns the `/feature` App Router page: an evidence-backed capability knowledge base for the Brancy content team.

## Source Of Truth

- `app/feature/page.tsx`: metadata and route entry.
- `app/feature/FeatureKnowledgeBase.tsx`: interactive catalog UI.
- `app/feature/featureCatalog.ts`: structured, non-localized feature and audit data.
- `app/feature/page.module.css`: responsive, RTL-safe, theme-variable-driven presentation.
- `i18n/featureKnowledge.ts`: localized catalog text.

## Architecture

The route is a direct App Router page rather than a legacy-page wrapper. It is intentionally unauthenticated and `noindex, nofollow`, because it is a team reference and reads no session or backend data. A client component uses `useDeferredValue` for search and memoized local filtering/sorting to keep rendering bounded by the static catalog size.

## Data Rules

Each catalog record includes a stable ID, category, roles, access classification, prerequisites, known limitation, content-production angle, routes, and source kinds. Display text stays in the i18n namespace rather than JSX. Audit-only records are separate from the active feature array.

## Dependencies

- `context/directionContext.tsx` for RTL/LTR.
- `i18n.ts` and `i18n/featureKnowledge.ts` for localized text.
- Global theme variables from `scss/_variables.scss`.

## Validation

Type-check with `npx tsc --noEmit`. Browser checks should cover search, role/category/access filters, expand/collapse, desktop, mobile, RTL, and dark mode.

## Related Documentation

- `FEATURES/Feature Knowledge Base.md`
- `MODULES/app.md`
- `MODULES/i18n.md`
