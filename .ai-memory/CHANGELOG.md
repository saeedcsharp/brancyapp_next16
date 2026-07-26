# Changelog

## 2026-07-26

- Added the `InputType` backend enum and image creator DTO contracts to the centralized models.
- Registered `/api/mediaai/GetImageCreators` and connected the authenticated image creation page to its backend response.
- Added a responsive image creator workspace with provider/model selection, localized dynamic option titles, prompt limits, and controls for text, enum, number, range, boolean, image-array, and video-array inputs.
- Connected reference image and video selection to `UploadFile`, added upload progress, and store only successful response `fileName` values in the dynamic input arrays.
- Added media thumbnails from upload `showUrl` responses and a localized `ExceedPermittedUploadMedia` warning when a selection exceeds the model's `maxArrayLength`.
- Registered `GetImageUsage`, added its typed POST payload with JSON-stringified media arrays, and introduced a two-stage action that shows token usage before offering `Create image`.

## 2026-07-25

- Fixed the Instagramer sidebar Page logo active color on `/page/ai/createImage` and `/page/ai/createVideo` so it stays synchronized with the active indicator.
- Fixed the mobile Page and desktop Content Creator navbar logos on `/page/ai` and its image/video creation subroutes after direct reloads.
- Added desktop and mobile Instagramer navbar search controls for discovering dashboard capabilities.
- Added a multilingual internal route index with Persian/Arabic normalization and aliases such as lottery, winner picker, and قرعه کشی mapped to `/page/tools`.
- Added keyboard support for submitting the first result, closing with Escape, and navigating through focusable results.
- Moved mobile search out of the route tabs and into its own collapsible hamburger-menu section alongside notifications and profile, with results rendered inside that section.
- Extended feature search across all eight configured locales by indexing translated parent-section labels and making Unicode matching accent-insensitive.
- Added multilingual image-creation and video-creation aliases that resolve internal AI capability searches such as `ایجاد عکس` to `/page/ai`.

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

=======

## 2026-07-21

- Added a simple client timer that reloads the blocked IR/AZ-only redirect page every second.
- Connected the wallet statistics `ChartDay` to monthly data from `/api/wallet/getBallanceHistory` and registered its backend route mapping.

## 2026-07-20

- Added a responsive bulk product price and discount modal for selected store products, with shared and individual edit modes, percentage and fixed-amount values, price increase/decrease controls, existing price/discount visibility, localized copy, backend persistence, and list refresh after save.
- Updated both shared and individual bulk-product editors to use isolated percentage/amount radio groups that switch between the percentage stepper and fixed-amount input.
- Updated bulk product editor switching to collapse the inactive editor to zero height and animate the active editor's return to the layout.
- Updated the legacy Instagramer payment page to load wallet bank cards through `clientFetchApi` and display each card as a responsive standalone tile.
- Moved the bank-card add action into a distinct toolbar and responsive form outside the card collection.
- Revised the wallet card layout to remove the enclosing panel and use a centered, card-sized add tile in the bank-card grid.
  > > > > > > > fa1690d501349a13f10de01b52613d1aef728d56

## 2026-07-19

- Initialized `.ai-memory/` AI Knowledge Base.
- Added project, architecture, API, auth, security, localization, configuration, deployment, and module documentation.
- Added `.github/copilot-instructions.md` to require future assistants to load the knowledge base first.
- Added a reusable SVG brush line chart for date/count statistics and used it in the store total sales statistics card.
- Extended the brush chart to auto-switch between year, month, and day aggregation based on zoom range, and refreshed demo store statistics data to show the transitions.
- Fixed hover bucket selection so the mouse guide line and tooltip use the same displayed coordinates as aggregated series.
- Kept the main line path intact while applying the brush selection as the visible x-domain, matching Apex brush chart behavior.
- Added smooth path redraw animations and animated brush selection movement for chart updates.
- Added transparent per-guide hover zones so tooltips activate across each guide's surrounding interval.
- Updated total sales statistics counters to show the latest report month and separate month-over-month income and sales rates with directional icons.
- Updated total sales statistics month labels and month-over-month comparison keys to honor the user's configured Gregorian, Shamsi, Hijri, or Hindi calendar.
- Reworked the store statistics report into a buyer CRM table ranked by aggregated purchase count and amount, with the latest purchase time.
- Fixed brush chart sizing during route navigation by measuring after the initial layout paint, retrying on the next animation frame, and retaining `ResizeObserver` updates for later layout changes.

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
