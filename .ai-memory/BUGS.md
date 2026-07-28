# Bugs

## Known Bugs

No confirmed runtime bugs remain from the chart navigation issue addressed on 2026-07-20 or the AI-route navbar/sidebar logo issues addressed on 2026-07-25.

The shared Tooltip ancestor-clipping issue was fixed on 2026-07-28 by rendering tooltip content through `document.body` and tracking the trigger's viewport position.

The stale-state `clientContext` mismatch in AI image generation was fixed on 2026-07-26 by sending the locally generated value with the request and retaining it for SignalR notification filtering.

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
