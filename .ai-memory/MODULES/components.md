# components

## Purpose

Reusable and feature-specific React components.

## Metadata

Priority: High

Business Impact: High

AI Reading Priority: 2

Source Of Truth: `components/`

Depends On: `context/`, `helper/`, `models/`

Used By: App routes, legacy pages, and shared UI flows

Change Impact: Shared UI behavior, screen layouts, interaction patterns, and cross-feature consistency

## Business Purpose

Implements most visible Brancy UI and workflows.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

`components/` contains 712 files across UI and domain folders.

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

`components/wallet/inboxContainer.tsx` displays the wallet summary balance by summing `totalPrice` for all general-balance entries with `SubInvoiceStatus.None`.

`components/wallet/generalBallance.tsx` renders a responsive card grid for wallet balances. It groups balances by card number, totals all four `SubInvoiceStatus` values independently, and exposes a Persian start-date picker that asks the parent page to refresh general-balance data.

`components/wallet/invoices.tsx` renders an `IGetInvoice` response as responsive invoice cards, including type, status, amount, identifier, creation time, and initial/loading-more/empty states. It receives the parent-owned infinite-scroll section ref and pagination state.

`components/wallet/invoicePopup.tsx` shows the selected invoice's sub-invoice history. Its header SVG action calls the parent-provided invoice-detail callback with that invoice ID so the wallet page can load and display the linked order details, and it exposes a parent-owned close action.

`components/wallet/subInvoicePopup.tsx` renders one bank card's sub-invoice history in a responsive table. Its header exposes a parent-owned close action. The shared popup stylesheet uses fluid desktop grid columns and retains horizontal scrolling for narrow screens. Its flex container lets the local card grow to the table's content height. Its parent retains cache entries by card number, so reopening an already loaded popup does not request its initial page again. It loads later `/api/wallet/getSubInvoices` pages with `useInfiniteScroll`, using `nextMaxId` and duplicate-safe sub-invoice IDs.

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

`components/` contains 712 files across UI and domain folders.

## Related Modules

See `MODULE_INDEX.md`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-07-19

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
