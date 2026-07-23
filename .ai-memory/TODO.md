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

## Technical Debt Ideas

- Audit hard-coded external keys/secrets.
- Validate `next lint` compatibility with Next 16.
- Add integration coverage for country-gated external redirects when test infrastructure is introduced.
- Consider separating generated PWA artifacts from hand-maintained assets.

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
