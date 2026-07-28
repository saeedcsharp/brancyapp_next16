# Changelog

## 2026-07-28

- Replaced Unicode country flag emojis in setting activity-history cards and partner phone details with the matching SVG assets from `public/Flag`.
- Rendered the shared Tooltip through `document.body` with viewport-fixed trigger-relative positioning and scroll/resize tracking so ancestor stacking contexts cannot clip it.
- Rendered the PhoneInput country dropdown through `document.body` with viewport-fixed positioning and scroll/resize tracking so ancestor stacking contexts cannot clip it.
- Kept portalled dropdown option clicks from being mistaken for outside clicks.

## 2026-07-27

- Added a dependency-free local phone input package with local SVG flags, two-input country/number layout, search, preferred/recent suggestions, digit normalization, formatting, validation, RTL, accessibility, and structured phone outputs.
- Updated phone input consumers to use each selected country's `placeholder` metadata instead of hard-coded phone-number placeholder text.
- Replaced country phone masks' dot placeholders with underscores and normalized phone values before validation so typed numbers are handled like pasted numbers.
- Fixed phone country auto-detection priority and synchronized the dial code after IP-based country detection.
- Enabled the application-owned `/api/user/ip` endpoint as the default client-side IP detection source for PhoneInput.
- Updated the phone country selector to replace the flag with a warning icon for empty, unknown, or incomplete dial codes.
- Migrated landing sign-in, sign-in verification, and partner creation away from `react-phone-input-2`.
- Added an RTL-aware `Back to creations` link from the image creator to `/page/ai`.
- Replaced the AI landing cards with a responsive Image/Video segmented workspace and feature-aware create actions.
- Registered `Instagramer/MediaAi/GetImages`, added its typed `items`/`nextMaxId` response, and load successful image history with `mediaCreationStatus=2`.
- Added cursor-based infinite scrolling, deduplication, shared metadata summaries, and full generated-image detail modals to the AI image library.
- Rendered generated-image JSON metadata as a responsive key/value grid with readable camel-case labels and a safe plain-text fallback.
- Reworked image creator selection around the full provider/model hierarchy with responsive provider cards, logos, model counts, atomic model selection, and provider-aware form resets.
- Excluded providers with no available models from the image creator picker so an unusable provider cannot replace the workspace with an empty state.
- Replaced the generated-image modal's full-image link with a blob-backed `Download image` action using the resolved media URL.

## 2026-07-26

- Added responsive `GeneratedImageModal` content for successful AI image generation notifications with image preview, prompt, metadata, creator/model details, identifiers, and a full-image link; the creation page owns its shared `Modal` wrapper and visibility state.
- Fixed `CreateImage` request/notification matching by passing the newly generated `clientContext` directly to the request and using it for SignalR response correlation.
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
