# components/store

## Purpose

Component module for store UI and feature concerns.

## Business Purpose

Supports Brancy store workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/store/.

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

## Recent UI Notes

- The selected-products edit action opens a bulk price and discount manager. It loads full products through `/api/product/GetFullProductList`, displays selected counts, product thumbnails, PID values, current price ranges, and existing discount ranges, and supports shared or per-product adjustments in percentage or fixed-amount modes. Both scopes use percentage/amount radio controls; the percentage option shows `IncrementStepper`, while the amount option shows a numeric input. Price adjustments support increase/decrease. Saving maps every product variant back to `IProduct_CreateSubProduct`, preserves stock, variation values, discount limits, and inactive variant IDs, then posts each product to `/api/product/CreateSubProducts` and refreshes the list.
- The bulk product modal collapses the inactive shared or individual editor to zero height, removing its padding and border while animating the active editor back into the layout.
- The order send popup now includes a collapsible shipment details section that renders `parcelInfo.logs` as a vertical timeline beneath the tracking code row.
- The store total sales statistics card now renders a brush-style multi-line chart from `ISaleShortMonth` data, with adaptive year/month/day grouping driven by the selected range, and derives total sales/income counters from the same data instead of placeholder values.
- The total sales statistics counters show the latest available report month, use the latest daily record from the previous month in the user's configured calendar for comparison, and render separate month-over-month rates with directional inline SVG icons. Calendar changes from `localStorage["calendar"]`, the `brancy:calendar-changed` event, or the browser `storage` event update the month label and comparison grouping. Missing or zero comparison values render `--`.
- The total sales report card is a buyer CRM table. Its `IBuyerPurchaseReport` rows are aggregated by buyer and contain buyer profile details, total purchase count, total purchase amount, and the latest purchase timestamp. Rows no longer open an individual sale detail popup.
- The store Statistics page owns all coupon API calls and server state: loading through `Shopper/Coupon/GetCoupon`, creation through `Shopper/Coupon/CreateCoupon`, and `showInBio` updates through `Shopper/Coupon/UpdateCoupon`. `CouponManager` is presentation-only and receives coupon data, loading/updating state, and action callbacks. The separate `CreateCouponModal` owns only its local form and shared `Modal`, submitting its request model through an `onCreate` callback. Coupon expiry uses the shared `components/dateAndTime/SetTimeAndDate` calendar and time picker.
- `CouponManager` uses the shared `useHideDiv` statistics-card behavior: clicking its header collapses or expands loading, empty, coupon-list content, and actions while updating the grid row span. The header has no coupon-count badge; while collapsed only its title remains visible. The Add Coupon action stops header click propagation while expanded, so opening the modal does not collapse the card.
- `CouponManager` uses layered card styling for coupon entries, status badges, metadata chips, responsive mobile stacking, and reduced-motion support while preserving the existing data and callback API.

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

components/store/.

## Related Modules

Parent module: `components`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-07-20

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
