# Bugs

## Known Bugs

The global browser-compatibility layout issues reported on 2026-08-04 were reduced by standardizing root scrollbars, reserving scrollbar space, replacing vulnerable viewport sizing in shared landing modals, and removing unsupported landing-header anchor positioning. Remaining feature-level overflow rules require browser visual regression coverage before they can be safely migrated in bulk.

No confirmed runtime bugs remain from the chart navigation issue addressed on 2026-07-20 or the AI-route navbar/sidebar logo issues addressed on 2026-07-25. The market mobile navbar logo mismatch was fixed on 2026-08-22 by aligning route enum values with the actual App Router paths.

The shared Tooltip ancestor-clipping issue was fixed on 2026-07-28 by rendering tooltip content through `document.body` and tracking the trigger's viewport position.

The shared DotMenu ancestor-clipping issue was fixed on 2026-08-20 by rendering the open menu through `document.body` and tracking fixed viewport coordinates instead of relying on a parent stacking context or component-level `z-index`.

The stale-state `clientContext` mismatch in AI image generation was fixed on 2026-07-26 by sending the locally generated value with the request and retaining it for SignalR notification filtering.

The customer shop sign-in flash on reload was fixed on 2026-08-10 by handling the NextAuth `loading` status separately from an unauthenticated session and moving the role redirect out of render.

The General settings language radio hydration mismatch was fixed on 2026-08-12 by keeping the initial language state aligned with English-first i18n initialization and applying `localStorage` after mount.

The brush line chart numeric-label hydration mismatch was fixed on 2026-08-13 by making count formatting use an explicit `en-US` locale instead of the runtime default locale.

The main subscription remaining-time display was fixed on 2026-08-17 by calculating the duration from the expiry timestamp to the current time and clamping expired values to zero.

The AI-flow sender-username mention was fixed on 2026-08-17 so it inserts `[SENDER_USERNAME]` into the manual prompt instead of being added as a selected tool, cannot inherit another tool's selected state, and is disabled in prompt-analysis mode.

<<<<<<< HEAD
The direct inbox pagination stop bug was fixed on 2026-08-21. The general and business `fetchMore` callbacks now return the threads fetched from `/api/message/GetDirectInbox` instead of returning an empty array, which previously caused `useInfiniteScroll` to mark the cursor exhausted immediately. The inbox cursor is documented as nullable because the backend returns `null` for the final page.

The direct inbox terminal-page render crash was fixed on 2026-08-21. Threads returned with an empty `items` array no longer cause `sentByOwner`, `text`, or `createdTime` access on an undefined first item.

The direct inbox category-request crash was fixed on 2026-08-22. Failed initial or pagination requests no longer rethrow `inboxError` during render, so a 500 from one category does not replace the entire inbox with the global error page.

# The comment inbox pagination stop bug was fixed on 2026-08-21. Post and Story `fetchMore` callbacks now return the media fetched from `/api/Comment/GetInbox` instead of returning an empty array, and `ICommetInbox.oldestCursor` is nullable for the final page. Story page appends also ignore duplicate media IDs.

The AI-flow connection lag and misalignment during zoom was fixed on 2026-08-21 by refreshing measured Socket positions in `useLayoutEffect` after the canvas transform commits and removing delayed zoom refresh timers.

> > > > > > > sepehr

## Watchlist

- Bulk product saves issue one `/api/product/CreateSubProducts` request per selected product. The backend map exposes no atomic bulk-update endpoint, so a later request can fail after earlier products have already been updated; the UI reports the failed response and refreshes only after complete success.
- Mixed legacy router and App Router behavior can regress redirects or query handling.
- API map casing or missing entries can break direct backend calls.
- Generated PWA service worker files can become stale if not regenerated after build changes.
- Chart containers whose parent remains hidden or has zero size until a later interaction should continue to be monitored; the brush chart now ignores zero-size measurements and relies on `ResizeObserver` for the transition to a usable size.

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
