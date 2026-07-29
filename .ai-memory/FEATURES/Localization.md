# Localization

## Priority

High

## Business Impact

Medium

## AI Reading Priority

2

## Source Of Truth

- `i18n.ts`
- `i18n/`
- `context/directionContext.tsx`
- `helper/checkRtl.ts`

## Depends On

- App layout
- Routing labels
- User language selection

## Used By

- All UI text
- RTL/LTR direction handling
- Route titles and localized screen content

## Change Impact

Changing this feature may affect directionality, translations, menu labels, page titles, and layout spacing.

## Notes

Keep language files and direction handling aligned so AI does not treat translation keys as isolated text.
Notification response keys use the same `Notify_*` identifier in `LanguageKey` and every locale object.
Internal feature search indexes each capability's translated feature, parent-section, and configured synonym keys, then adds reusable semantic alias groups that TypeScript requires to cover all eight locales for every route.
