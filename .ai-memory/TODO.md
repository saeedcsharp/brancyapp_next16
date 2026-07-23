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

## Technical Debt Ideas

- Audit hard-coded external keys/secrets.
- Validate `next lint` compatibility with Next 16.
- Add integration coverage for country-gated external redirects when test infrastructure is introduced.
- Consider separating generated PWA artifacts from hand-maintained assets.

## Recent Review Notes

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
