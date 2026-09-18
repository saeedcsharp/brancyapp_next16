# legacy-pages/wallet

## Purpose

Legacy page module for wallet routes and workflows.

## Business Purpose

Preserves existing Brancy wallet feature behavior during App Router migration.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

legacy-pages/wallet/.

## Execution Flow

Execution starts from imports, route rendering, or helper calls depending on the module.

## Data Flow

Data enters through props, Next route params, session state, browser state, or backend API responses.

## Dependencies

See imports in related files and dependency docs.

## Reverse Dependencies

Used by routes, components, helpers, or build tooling where imported.

## Public APIs

Exports are defined by source files in the module.

## Internal APIs

Local helpers and non-exported functions stay module-private.

## Classes

No class inventory was generated for this module during initialization unless listed in related files.

## Functions

See related source files for exported functions and local helpers.

## Components

React components are present when the folder contains `.tsx` UI files.

`payment.tsx` composes the wallet components and owns modal/session orchestration. `components/wallet/bankCard.tsx` loads and normalizes `/api/wallet/getInstagramerBankCards`, owns the horizontal slider, card mapping, latest general-balance status display, and inline add-card form. The add-card submit enables at 16 digits, reports an invalid backend response below the input, and refreshes the collection after success. `components/wallet/invoices.tsx` retrieves `/api/wallet/getInvoices` and owns its `nextMaxId` cursor and `useInfiniteScroll` pagination. `components/wallet/settle.tsx` renders settlement-related sub-invoices from the same paginated invoice response in invoice-style cards.

Selecting an invoice opens its sub-invoice history. Selecting the `Order` tab in `components/wallet/modal/invoicePopup.tsx` automatically calls `payment.tsx`'s `/api/wallet/getInvoice` request with the selected invoice ID. On success, the returned invoice is rendered inline by `components/wallet/modal/orderDetailPopup.tsx` inside the existing invoice popup, where it retrieves `/api/order/GetFullOrder` using the invoice's order ID and user ID, then renders the shared read-only store order-detail content with Back and Close actions returning to the invoice summary; no second modal or manual order-details button is exposed from the wallet view.

Selecting a bank-card tile opens `components/wallet/modal/subInvoicePopup.tsx`, which now contains only history; default-card and settlement actions are rendered inline beneath the card by `components/wallet/bankCard.tsx`. The default-card action uses the shared `SwitchButton`, calls `/api/wallet/setDefaultCard` with its `cardNumber` query, and settlement calls `/api/wallet/settleRequest`. Its header close action closes the parent modal. `payment.tsx` caches sub-invoice responses by card number, preventing a repeated initial `/api/wallet/getSubInvoices` request when the same popup is reopened, and conditionally unmounts the child before modal close animation so no empty-card request occurs. The popup appends unique later pages through its `nextMaxId` cursor and `useInfiniteScroll`.
The inline settlement control uses the shared `saveButton` and `disableButton` styles according to availability, and renders `RingLoader` while `/api/wallet/settleRequest` is pending.

The former standalone wallet statistics implementation and demo variants were removed after the payment page became the canonical wallet surface; `/wallet/statistics` remains a compatibility redirect.

The App Router exposes `/wallet/payment` as the single Instagramer wallet tab. The payment page renders the balance summary and a free horizontal bank-card slider; each `BankCard` item renders its own latest general-balance status totals below the card, while card selection still opens the sub-invoice popup. The first slider item is the add-card variant, which owns and expands the registration form inline below its tile and refreshes cards after success. `/wallet`, `/wallet/statistics`, and `/wallet/title` redirect to `/wallet/payment` for backward compatibility.

## Hooks

React hooks are present when named `use*` functions/files exist.

## Utilities

Utility functions live in local files where applicable.

## Services

Service integration happens through helper APIs or route handlers when applicable.

## Providers

Providers are documented where the module defines React providers.

## Repositories

No repository pattern implementation was discovered in this module.

## Types

Types are in local files or shared `models/` and `types/`.

## Interfaces

Interfaces are in local files or shared `models/interfaces.ts`.

## Enums

Enums are in local files or shared `models/enums.ts`.

## Configuration

Configuration is local to the folder unless documented in `CONFIGURATIONS.md`.

## Database Usage

No local database objects were discovered. Data persists through external backend APIs where applicable.

## State Management

Mostly React local state, context, NextAuth session, or external state from backend APIs.

## External Integrations

External services are accessed through Brancy backend APIs unless this module documents another integration.

## Security

Do not expose tokens, secrets, or user data. Follow auth and redirect rules.

## Permission Rules

Use `RoleAccess`, session permission flags, and backend authorization where relevant.

## Performance

Keep renders and network calls scoped; avoid unnecessary broad fetches.

## Caching

PWA, Next, browser, or backend caching applies only where configured.

## Environment Variables

No module-specific env vars documented unless related files read them.

## Related Files

legacy-pages/wallet/.

## Related Modules

Parent module: `legacy-pages`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-07-23

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
