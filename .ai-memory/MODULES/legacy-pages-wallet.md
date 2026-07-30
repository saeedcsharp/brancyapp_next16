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

`payment.tsx` renders Instagramer bank cards as independent responsive tiles. It loads cards through `clientFetchApi` from `/api/wallet/getInstagramerBankCards`, normalizes supported backend response shapes to an array, and keeps a card-sized add-card tile in the centered collection grid. The tile opens a 16-digit card-number form that posts `{ cardNumber }` to `/api/wallet/addCardNumber`; after success, the page reloads the complete card collection from the backend. It independently retrieves `/api/wallet/getInvoices`, then uses its `nextMaxId` cursor with `useInfiniteScroll` to append unique subsequent invoice pages after the card collection through `components/wallet/invoices.tsx`.

Selecting an invoice fetches its full order using `/api/order/GetFullOrder` with the selected invoice ID and its `orderInvoice.userId`. `components/wallet/orderDetailPopup.tsx` renders that response with the shared read-only store order-detail content; no order accept/reject controls are exposed from the wallet view.

Selecting a bank-card tile opens `components/wallet/subInvoicePopup.tsx`. `payment.tsx` caches sub-invoice responses by card number, preventing a repeated initial `/api/wallet/getSubInvoices` request when the same popup is reopened, and conditionally unmounts the child before modal close animation so no empty-card request occurs. The popup appends unique later pages through its `nextMaxId` cursor and `useInfiniteScroll`.

`statistics.tsx` loads `/api/wallet/getBallanceHistory` after the Instagramer session is ready. It maps the response `statistics` months to one wallet-balance `ChartDay` series. It also owns the `/api/wallet/getGenerallBallance` date-range request and reloads general balances when the child card summary changes its start-date filter.

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
