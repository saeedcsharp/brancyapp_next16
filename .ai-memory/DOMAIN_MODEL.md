# Domain Model

## Core Domains

- User: authenticated person/customer with access token and profile/session metadata.
- Instagramer: managed Instagram account selected by `currentIndex` from `instagramerIds`.
- Partner: delegated sub-admin with `PartnerRole` permissions.
- Page/Post/Story: Instagram content and analytics entities.
- Message/Comment/Ticket: conversation and support workflows.
- Advertise/CustomerAds/Market/Bio: promotional and public business surfaces.
- Store/Product/Order/Shipping: commerce and fulfillment workflows.
- Wallet/Payment: billing, packages, transactions, and payment redirects.

Detailed TypeScript interfaces are centralized mainly in `models/interfaces.ts`; enums are in `models/enums.ts`.

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
