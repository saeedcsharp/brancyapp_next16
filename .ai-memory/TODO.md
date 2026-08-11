# TODO

## Pending Documentation Tasks

- Add browser coverage confirming the user wallet item is absent from desktop and mobile user navigation while the direct user wallet route remains available when a UI test harness is introduced.

- Add unit coverage for link countdown formatting below 24 hours, at the 24-hour boundary, and across multiple days when a test harness is introduced.

- Add component/browser coverage for the Market Properties Product popup, including product loading, cursor pagination, ten-item selection limit, empty-array save, API failure handling, and keyboard thumbnail activation when a UI test harness is introduced.

- Add component/browser coverage for SwitchButton keyboard focus and Space activation, controlled checked state, accessible labels, valid/invalid role handling, disabled state, RTL thumb direction, 44px touch target, reduced motion, forced colors, and mobile/desktop viewport sizing when a UI test harness is introduced.
- Add component/browser coverage for IncrementStepper click, keyboard activation, press-and-hold click suppression, direct-entry Enter/blur/Escape behavior, min/max clamping, zero-value decrement feedback, disabled state, forced colors, reduced motion, RTL placement, and mobile/desktop viewport sizing when a UI test harness is introduced.
- Add component/browser coverage for CheckBoxButton keyboard focus and Space activation, controlled checked/disabled states, ARIA labels, touch targets, reduced motion, forced colors, RTL labels, and mobile viewport layouts when a UI test harness is introduced.
- Add component/browser coverage for TextArea controlled and uncontrolled values, RTL/LTR direction, bounded auto-resize, Escape handling, forced colors, reduced motion, and focus behavior at iOS Safari and Android Chrome mobile viewport sizes when a UI test harness is introduced.
- Add component/browser coverage for DotMenu keyboard navigation, focus restoration, Escape/outside-pointer close behavior, long localized labels, RTL placement, reduced motion, forced colors, and narrow viewports when a UI test harness is introduced.
- Add browser coverage for MyLink product carousel touch scrolling, pointer dragging, horizontal-only overflow, and drag-click suppression when a UI test harness is introduced.
- Add browser coverage for MyLink FeatureBox free-mode scrolling, pointer dragging, horizontal-only overflow, responsive sizing, and drag-click suppression when a UI test harness is introduced.
- Add browser coverage for MyLink shortcut-link mobile horizontal scrolling, pointer dragging, conditional 200px sizing for more than four links, and drag-click suppression when a UI test harness is introduced.
- Add browser coverage for MyLink feature-menubar free scrolling and centering the active item after section changes when a UI test harness is introduced.
- Add browser coverage confirming MyLink opens on the Home/FeatureBox section and Contact and Map mounting does not change the initial scroll position when a UI test harness is introduced.
- Add component coverage for MyLink product filtering, search reset, and desktop/mobile product-header layout when a UI test harness is introduced.
- Add component/browser coverage for MyLink coupon countdown rendering, copy-button keyboard activation, Clipboard API success/failure feedback, and responsive coupon layout when a UI test harness is introduced.
- Add browser coverage for MyLink media lifecycle cleanup, instance-isolated player/radio controls, reduced-motion behavior, and carousel Left/Right/Home/End keyboard navigation when a UI test harness is introduced.
- Add component coverage confirming MyLink last-video title and description line breaks remain visible alongside clickable links when a UI test harness is introduced.
- Add visual regression coverage for MyLink fluid typography at desktop, tablet, and mobile viewport widths when a UI test harness is introduced.
- Add Playwright coverage for Chrome, Edge, and Firefox at desktop and mobile viewport sizes, including scrollbar width, horizontal overflow, landing modals, and fixed headers.
- Add browser interaction coverage for landing pricing slider changes, keyboard navigation, plan-card selection, and protection against repeated state updates.
- Add component/browser coverage for FlexibleToggleButton keyboard activation, `aria-pressed`, disabled state, long localized labels, RTL layout, reduced motion, forced colors, and mobile/desktop touch targets when a UI test harness is introduced.
- Replace remaining feature-level `overflow-y: scroll`, `100vw`, and WebKit-only layout rules after visual regression coverage is available.

- Keep `app/dev/test.tsx` package counts and classifications synchronized with `package.json` after dependency changes; verify removal candidates with `npm ls`, `npm audit`, and a production build.
- Enrich module docs when touching each feature area.
- Add endpoint-specific request and response examples from backend contracts.
- Document exact environment variable names from deployment manifests without exposing secret values.
- Add testing strategy once test tooling exists.
- Add component coverage for customer shop product cards with null titles and discount prices when a UI test harness is introduced.
- Add integration coverage for wallet balance-history loading and unsuccessful backend responses when test infrastructure is introduced.
- Add unit coverage for wallet summary aggregation across multiple `SubInvoiceStatus.None` entries when test infrastructure is introduced.
- Add integration coverage for general-balance date filtering and per-card status aggregation when test infrastructure is introduced.
- Add integration coverage for successful and rejected bank-card registration responses when test infrastructure is introduced.
- Add component coverage for invoice-history loading, successful invoice-card rendering, and empty/error responses when a UI test harness is introduced.
- Add component coverage for wallet invoice order details, including `invoiceId`/`userId` query construction, successful full-order rendering, and failed detail responses when a UI test harness is introduced.
- Add component coverage confirming the sub-invoice popup header action calls `/api/wallet/getInvoice` with the selected invoice ID and opens order details on success when a UI test harness is introduced.
- Add integration coverage for invoice-history cursor pagination, duplicate invoice IDs, and exhausted `nextMaxId` responses when test infrastructure is introduced.
- Add integration coverage for sub-invoice popup cursor pagination, duplicate IDs, exhausted `nextMaxId`, and the mobile table overflow behavior when test infrastructure is introduced.
- Add component coverage confirming that reopening a cached bank-card sub-invoice popup makes no initial API request when a UI test harness is introduced.
- Add component coverage for switching bank-card sub-invoice History/Setting tabs and successful or rejected default-card requests when a UI test harness is introduced.
- Add component coverage confirming that a sub-invoice popup close animation cannot send a request with an empty card number when a UI test harness is introduced.
- Add an automated locale-alignment check for `LanguageKey.Notify_*` response notification keys when test infrastructure is introduced.
- Add unit coverage for feature-search normalization, all-locale keyword groups, translated-key enrichment, and route matching, plus browser coverage for desktop/mobile popup interaction, when test infrastructure is introduced.
- Add integration coverage for image-generation payloads, upload limits, `clientContext` notification correlation, and successful result-modal rendering when test infrastructure is introduced.
- Add integration coverage for `GetImages` status filtering, `nextMaxId` pagination, duplicate prevention, empty responses, and failed history requests when test infrastructure is introduced.
- Add integration coverage for `GetVideos` status filtering, `nextMaxId` pagination, duplicate prevention, empty responses, and failed history requests when test infrastructure is introduced.
- Add component/browser coverage for AI video-library thumbnail behavior, including `imageUrl` fallback to `/cover-video.svg`, card-click modal opening, and in-modal video playback controls/audio when a UI test harness is introduced.
- Add component coverage for country search, dial-code selection, controlled E.164 values, formatting, and keyboard navigation when a UI test harness is introduced.
- Add component coverage for the PhoneInput portalled dropdown, including viewport positioning, scroll/resize updates, and option clicks outside the component root when a UI test harness is introduced.
- Add component coverage for the Tooltip portal, directional viewport positioning, scroll/resize updates, and click-outside behavior when a UI test harness is introduced.
- Add component/browser coverage for OTP verification, including one-request submission under WebOTP/manual overlap, repeated Enter/click protection, Persian/Arabic-Indic paste, incorrect-code shake and reset, timer expiry, and unmount cleanup when a UI test harness is introduced.
- Add component coverage for custom-domain normalization, RFC-style label/length validation, reserved-domain rejection, and one-shot invalid-input shake when a UI test harness is introduced.
- Add component coverage for direct custom-domain submission, cancellation, sequential connect/verify calls, DNS retry cooldown, and active-domain guidance when a UI test harness is introduced.
- Add focused coverage for multi-digit autofill, select-on-focus behavior, first-input focus after errors, ARIA timer/error relationships, and history replacement after successful verification when a UI test harness is introduced.
- Add component coverage confirming Comment Inbox hover renders do not re-fetch Auto Reply prompts or flows while the selected media configuration is unchanged when a UI test harness is introduced.
- Add component coverage for the Page post-grid product badge when `shopMediaProductType` is `ShopMediaProductType.Instance` once a UI test harness is introduced.
- Add component coverage for Domain Manager request cancellation, unmount cleanup, Enter submission, custom-domain copy URLs, destination-link mapping, and keyboard-accessible controls when a UI test harness is introduced.

## Technical Debt Ideas

- Audit hard-coded external keys/secrets.
- Validate `next lint` compatibility with Next 16.
- Add integration coverage for country-gated external redirects when test infrastructure is introduced.
- Consider separating generated PWA artifacts from hand-maintained assets.

## Recent Review Notes

-- Verified after desktop reloads that the sidebar Page SVG uses the active dark-blue color and inactive items remain gray on `/page/ai`.
-- Verified the mobile Page logo at 390x844 and desktop Content Creator logo at 1440x900 after direct reloads of `/page/ai`; no follow-up task remains for this issue.

- Validate bulk product price and discount saves against the live backend, including products with multiple active/inactive variants and discount expiry/count limits; the frontend uses the existing `/api/product/CreateSubProducts` update contract because no atomic bulk-update endpoint is mapped.
- No new follow-up TODOs were identified for the brush line chart implementation on 2026-07-19.
- The brush line chart navigation-rendering fix was validated at the component/type level on 2026-07-20; browser coverage for route transitions remains desirable once UI test tooling is available.
- Validate the total sales statistics month comparison against a live API response, especially when the response contains multiple daily records per month and a non-Gregorian configured calendar.
- Confirm the live store statistics endpoint returns `IBuyerPurchaseReport` rows, or update the adapter when the backend CRM response is available.

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
