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
- Bulk product fixed amounts use the shared decimal-aware `InputBox`. Percentage stepper values and amount values are independent, and each inactive editor is disabled and receives the shared `fadeDiv` treatment while its radio alternative remains selectable.
- Bulk product amount inputs display each product's `PriceType` currency through the shared `InputBox` unit slot and `specifyPriceType` renderer; the shared editor uses the first selected product's currency.
- The bulk product editor keeps the percentage radio and its stepper together, the amount radio and its numeric input together, and renders the complete shared and individual editor controls inline in the popup file.
- The bulk product modal collapses the inactive shared or individual editor to zero height, removing its padding and border while animating the active editor back into the layout.
- The individual bulk-product cards render through the shared `Slider` in free horizontal mode. Each `productCard` remains an independently editable card inside a `SliderSlide`, preserving its adjustment state while adding touch, trackpad, and pointer-drag navigation.
- The order send popup now includes a collapsible shipment details section that renders `parcelInfo.logs` as a vertical timeline beneath the tracking code row.
- The store total sales statistics card now renders a brush-style multi-line chart from `ISaleShortMonth` data, with adaptive year/month/day grouping driven by the selected range, and derives total sales/income counters from the same data instead of placeholder values.
- The total sales statistics counters show the latest available report month, use the latest daily record from the previous month in the user's configured calendar for comparison, and render separate month-over-month rates with directional inline SVG icons. Calendar changes from `localStorage["calendar"]`, the `brancy:calendar-changed` event, or the browser `storage` event update the month label and comparison grouping. Missing or zero comparison values render `--`.
- The total sales report card is a buyer CRM table. Its `IBuyerPurchaseReport` rows are aggregated by buyer and contain buyer profile details, total purchase count, total purchase amount, and the latest purchase timestamp. Rows no longer open an individual sale detail popup.
- The store Statistics page owns all coupon API calls and server state: loading through `Shopper/Coupon/GetCoupon`, creation through `Shopper/Coupon/CreateCoupon`, visibility activation through `Shopper/Coupon/ActivateCoupon`, visibility removal through `Shopper/Coupon/DeleteCoupon`, and expiry/max-use updates through `Shopper/Coupon/UpdateCoupon`. The activation and removal requests send only `couponId` as a query parameter. Coupon loading sends `isActive`, `isPrivate`, and `nextMaxId` as query parameters; the endpoint returns the existing `IUserCoupon[]` array, and the last coupon ID becomes the next cursor. Pages append unique results through the shared slider's `onReachEnd` callback; changing either filter resets the loaded list and cursor. `CouponManager` is presentation-only and renders one information-dense coupon per slider slide through `itemsPerSlide={1}`. It receives coupon data, loading/updating state, filter state, the reach-end callback, and action callbacks. The separate `CreateCouponModal` owns only its local form and shared `Modal`, submitting its request model through an `onCreate` callback. Coupon expiry uses the shared `components/dateAndTime/SetTimeAndDate` calendar and time picker.
- The coupon three-dot action opens a separate `UpdateCouponModal` through the page-level shared `Modal`. Code, discount, phone number, and max discount are read-only; expiry, max uses, and bio visibility remain editable. Save calls `Shopper/Coupon/UpdateCoupon` with `couponId`, `expireTime`, `maxCount`, and `showInBio` query parameters, then reloads the coupon list.
- The coupon edit action stops click and keyboard-event propagation so it does not also toggle the collapsible statistics-card header. `CreateCouponModal` remains create-only.
- Cancel buttons in the create and update coupon forms explicitly use `type="button"`, so closing or returning from the form does not trigger coupon API submission.
- The create coupon form memoizes required-field validation for the coupon code, discount percentage, and maximum uses. Its Add Coupon action remains available when expiry is missing or too soon so submission can show `InternalResponseType.TimeExpire`; API creation is blocked until expiry is at least one hour in the future.
- Create and update coupon forms use the structured settings-page layout: each field has a `headertext` label and `headerparent` input wrapper, while submit actions are grouped in `ButtonContainer`.
- `CouponManager` uses the shared `useHideDiv` statistics-card behavior: clicking its header collapses or expands loading, empty, coupon-list content, and actions while updating the grid row span. The header has no coupon-count badge; while collapsed only its title remains visible. The Add Coupon action stops header click propagation while expanded, so opening the modal does not collapse the card.
- `CouponManager` uses layered card styling for coupon entries, status badges, metadata chips, responsive mobile stacking, and reduced-motion support while preserving the existing data and callback API.
- `CouponManager` fills its statistics-grid cell at `100%` width without the extra horizontal margins used by its previous standalone layout, matching the sibling statistics cards on desktop and mobile.
- Coupon cards show a present phone number, including `0`, with a `Private` tag; coupons without a phone number show a `Public` tag.
- Coupon statistics support API-backed search through the `query` parameter on `Shopper/Coupon/GetCoupon`. Search changes clear the current results and show the loading state until the response arrives; clearing the query restores normal results and pagination, while pagination is disabled during search.
- Coupon search input is debounced by 400 milliseconds, so rapid typing does not issue one API request per character.
- The previously loaded normal coupon list is cached per active/private filter combination, so leaving search restores it without an extra API request; coupon mutations invalidate or update the cached state.

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
