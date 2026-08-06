# Changelog

- Market Properties no longer shows the edit-options three-dot control on the Products feature card.

## 2026-08-06

- Fixed Domain Manager default and destination links for usernames containing `.`, `_`, `-`, or Persian kashida (`ـ`) by using the path format `baseShortUrl/username` instead of an invalid username subdomain.
- Removed the unnecessary `www.` prefix from Domain Manager domain displays.
- Prevented duplicate default-domain display for usernames such as `brancy_demo`.

- Fixed the custom-domain Request button remaining on `RingLoader` during React Strict Mode development cleanup/setup cycles.
- Domain Manager now sends valid custom-domain requests directly to `Instagramer/Bio/UpdateCustomDomain`; the initial request no longer waits for or is blocked by a client-side CustomDomain feature check.
- بهینه‌سازی Domain Manager: حذف state و handlerهای بدون مصرف، محاسبه حافظه‌ای اعتبارسنجی و لینک‌ها، پشتیبانی Enter و کنترل‌های native برای دسترسی‌پذیری، لغو درخواست‌های API و cleanup کامل منابع، اصلاح copy دامنه سفارشی و Tariff، حذف consoleهای اضافی، و اصلاح robots/description/zoom صفحه Properties.
- Modal تأیید درخواست دامنه حذف شد و درخواست معتبر مستقیماً ارسال می‌شود.
- قوانین Custom Domain به فهرست HTML تبدیل شدند و نمایش آن‌ها به انتخاب رادیوی Custom Domain محدود شد.

## 2026-08-04

- Added radio controls for choosing the default or custom domain section; inactive panel content is rendered with the shared faded state.
- Gated the public destination-links section by the selected domain type; custom-domain links now appear only after final activation and use the accepted custom-domain URI.
- Unified the pending custom-domain connection and verification UI into one name-server stage; the single Connect action remains responsible for both sequential API calls.
- Added a development-only symbolic `مرحله بعدی (تست)` control to advance custom-domain UI state through DNS completion and activation without backend calls.
- Corrected the pending custom-domain retry UI so the DNS message appears only in the name-server stage and the Connect button shows a loader throughout both sequential API calls before restarting the cooldown on failure.
- Added the Persian custom-domain confirmation and pending workflow: requests now require responsibility and provider-delay acknowledgement, pending domains support cancellation and five-minute DNS retry cooldowns, Connect calls connect and verify sequentially, failed propagation is explained inline, and active domains show Settings ticket guidance.

- Stabilized the user home dashboard responsive layout by removing fixed grid row spans and percentage heights without definite parents, anchoring upgrade decorations to their card, constraining narrow-viewport text, and adding reduced-motion support.
- Replaced user home clickable `div` elements with keyboard-accessible controls, removed nested interactive markup, moved redirects and data loading into effects, and ensured loading ends on API failure or unmount.
- Fixed the landing pricing slider's maximum-update-depth runtime error by removing bidirectional slider synchronization and deriving tooltip placement directly from the controlled slider value.
- Standardized global scrollbar behavior across Chromium and Firefox with native `scrollbar-width`/`scrollbar-color` support and a single WebKit refinement.
- Added stable scrollbar gutter reservation, restored visible keyboard focus outlines, and prevented root-level horizontal overflow from affecting layout.
- Replaced cross-browser-sensitive modal and landing-page `100vw` sizing with container-relative sizing, removed the landing feature modal's fixed 900px minimum width, and added small-viewport height fallbacks.
- Replaced unsupported landing header anchor positioning with fixed centering and added a Browserslist target for Chrome, Edge, and Firefox validation.
- Added a 5px transparent inset around Chromium and Edge scrollbar thumbs; Firefox retains its native thin scrollbar fallback because its standard scrollbar API does not support thumb insets.

## 2026-08-02

- Hardened custom-domain normalization and validation in the market domain manager, including lowercase URL cleanup, domain/label length limits, label/TLD checks, reserved-domain blocking, and a one-shot shake on invalid request attempts; pending requests now replace the form with a three-step progress indicator and DNS cooldown is displayed inside the disabled verification button until Connect becomes available.
- Added a shopping-bag SVG badge beside the Page post number when `shopMediaProductType` is `ShopMediaProductType.Instance`.
- Prevented hover-driven Comment Inbox settings-modal renders from repeating the Auto Reply prompt and flow API requests by memoizing the selected media auto-reply configuration.

## 2026-08-01

- Fixed `useInfiniteScroll` retry loops after empty or duplicate-only pages; product and lottery-post picker callbacks now retain the terminal `hasMore` state.

## 2026-07-30

- Replaced the unused order-detail status icon with an accessible back action that closes the detail modal and returns to the invoice popup.
- Added accessible icon-only close controls to the wallet invoice, bank-card sub-invoice, and order-detail popup headers.
- Made the shared wallet sub-invoice table fluid on desktop modal widths and retained its horizontal-scroll layout below 680px.
- Added an accessible SVG order-details action to the sub-invoice popup header; it retrieves the selected invoice through `/api/wallet/getInvoice` and opens its read-only order-detail modal.
- Added a read-only wallet invoice order-detail popup that requests `/api/order/GetFullOrder` with `invoiceId`, `userId`, and the current language, then renders the shared store order-detail presentation without order actions.
- Replaced the bank-card sub-invoice popup's global masonry-card dependency with a local responsive card and horizontally scrollable transaction table.
- Fixed the sub-invoice popup's collapsed content by replacing its inherited 10px-row masonry container with a flex wrapper that grows with the table.
- Added duplicate-safe cursor pagination to sub-invoice history through `/api/wallet/getSubInvoices`, `nextMaxId`, and `useInfiniteScroll`.
- Cached sub-invoice history by bank-card number in the payment page so reopening a popup reuses its loaded pages without repeating the initial API request.
- Prevented a redundant `GetSubInvoices` call on popup close by unmounting its child before the modal exit animation receives an empty card number.
- Connected the Instagramer payment page invoice-history request to a responsive invoice card section after the bank-card collection, with status/type labels and loading/empty states.
- Added `useInfiniteScroll` pagination to the invoice-history section, loading later `/api/wallet/getInvoices` pages from the backend cursor and preserving unique invoice IDs.
- Refined invoice history into responsive financial cards with status accents, a prominent amount, and a structured invoice-details footer.

## 2026-07-29

- Moved all `InstallPrompt` inline presentation styles, including Share/Add Home Screen SVG styles and RTL-specific layout rules, into `components/website/installPrompt.module.css`.
- Updated the dependency audit page at `app/dev/test.tsx` to cover all 50 direct packages from `package.json` (41 runtime and 9 development dependencies).
- Added the missing `@next/third-parties` and `emoji-picker-react` entries, refreshed package counts and the report date, and corrected stale Quill/pako recommendations.

## 2026-07-28

- Removed the duplicate local content-size tooltip from the legacy create-post page and cleaned up its unused reducer state and CSS.
- Hardened phone verification against duplicate Login requests by routing WebOTP and manual completion through one in-flight-guarded submit path.
- Normalized Persian and Arabic-Indic OTP digits across typing, paste, and WebOTP; added ref-based focus navigation, arrow keys, paste focus, accessible input state, `finally` loading cleanup, and animation cleanup on unmount while preserving incorrect-code shake and input reset behavior.
- Refined OTP state updates with functional setters and memoized validation, added typed WebOTP/autofill handling, select-on-focus, first-input focus after errors, timer/error ARIA links, stable duration constants, and `router.replace` success navigation; removed unused verification props.
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
- Migrated landing sign-in, sign-in verification, and partner creation away from the legacy phone-input dependency.
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

- Fixed the Instagramer sidebar Page logo active color on `/page/ai` so it stays synchronized with the active indicator.
- Fixed the mobile Page and desktop Content Creator navbar logos on `/page/ai` after direct reloads.
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
