# TODO

## Pending Documentation Tasks

- Enrich module docs when touching each feature area.
- Add endpoint-specific request and response examples from backend contracts.
- Document exact environment variable names from deployment manifests without exposing secret values.
- Add testing strategy once test tooling exists.
- Add integration coverage for wallet balance-history loading and unsuccessful backend responses when test infrastructure is introduced.
- Add unit coverage for wallet summary aggregation across multiple `SubInvoiceStatus.None` entries when test infrastructure is introduced.
- Add integration coverage for general-balance date filtering and per-card status aggregation when test infrastructure is introduced.
- Add integration coverage for successful and rejected bank-card registration responses when test infrastructure is introduced.
- Add an automated locale-alignment check for `LanguageKey.Notify_*` response notification keys when test infrastructure is introduced.
- Add unit coverage for feature-search normalization and route matching, plus browser coverage for desktop/mobile popup interaction, when test infrastructure is introduced.
- Connect the image creator form to the MediaAi generation endpoint when its request and response contract is available, then add integration coverage for generated payloads and upload limits.

## Technical Debt Ideas

- Audit hard-coded external keys/secrets.
- Validate `next lint` compatibility with Next 16.
- Add integration coverage for country-gated external redirects when test infrastructure is introduced.
- Consider separating generated PWA artifacts from hand-maintained assets.

## Recent Review Notes

- Verified after desktop reloads that the sidebar Page SVG uses the active dark-blue color and inactive items remain gray on both AI creation routes.
- Verified the mobile Page logo at 390x844 and desktop Content Creator logo at 1440x900 after direct reloads of `/page/ai`, `/page/ai/createImage`, and `/page/ai/createVideo`; no follow-up task remains for this issue.
- Validate bulk product price and discount saves against the live backend, including products with multiple active/inactive variants and discount expiry/count limits; the frontend uses the existing `/api/product/CreateSubProducts` update contract because no atomic bulk-update endpoint is mapped.
- No new follow-up TODOs were identified for the brush line chart implementation on 2026-07-19.
- The brush line chart navigation-rendering fix was validated at the component/type level on 2026-07-20; browser coverage for route transitions remains desirable once UI test tooling is available.
- Validate the total sales statistics month comparison against a live API response, especially when the response contains multiple daily records per month and a non-Gregorian configured calendar.
- Confirm the live store statistics endpoint returns `IBuyerPurchaseReport` rows, or update the adapter when the backend CRM response is available.

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
