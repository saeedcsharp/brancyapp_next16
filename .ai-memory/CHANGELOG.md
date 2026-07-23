# Changelog

## 2026-07-23

- Added 16 new backend `ResponseType` notification mappings and localized their messages in all eight supported languages.
- Updated the wallet summary balance to total every general-balance entry with `SubInvoiceStatus.None` instead of using only the first match.
- Added a Persian start-date filter that refreshes `/api/wallet/getGenerallBallance` through the current time.
- Replaced the general-balance transaction table with responsive per-card summaries for unsettled, awaiting settlement, settled, and failed totals.
- Connected the bank-card registration form to `/Business/Wallet/AddCardNumber` and reloads all registered cards after a successful response.

## 2026-07-21

- Added a simple client timer that reloads the blocked IR/AZ-only redirect page every second.
- Connected the wallet statistics `ChartDay` to monthly data from `/api/wallet/getBallanceHistory` and registered its backend route mapping.

## 2026-07-20

- Updated the legacy Instagramer payment page to load wallet bank cards through `clientFetchApi` and display each card as a responsive standalone tile.
- Moved the bank-card add action into a distinct toolbar and responsive form outside the card collection.
- Revised the wallet card layout to remove the enclosing panel and use a centered, card-sized add tile in the bank-card grid.

## 2026-07-19

- Initialized `.ai-memory/` AI Knowledge Base.
- Added project, architecture, API, auth, security, localization, configuration, deployment, and module documentation.
- Added `.github/copilot-instructions.md` to require future assistants to load the knowledge base first.

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
