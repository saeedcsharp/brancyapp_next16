# Marketplace

## Priority

High

## Business Impact

High

## AI Reading Priority

2

## Source Of Truth

- `legacy-pages/market/`
- `components/market/`
- `helper/apiRouteMap.ts`
- `helper/clientFetchApi.ts`

## Depends On

- Authentication
- Localization
- Backend market and bio-link responses

## Used By

- Marketplace screens
- Bio-link and market management flows
- User and Instagramer market experiences

## Change Impact

Changing this feature may affect market listing behavior, marketplace navigation, bio-link flows, and backend request mapping.

## Notes

Use this doc when the requested change is described as marketplace behavior rather than a specific route tree.

## Custom Domain Validation

The market domain manager normalizes entered domains to lowercase, removes an optional `http://`/`https://` prefix, `www.`, and trailing slashes, then validates a single registrable domain. Domains are limited to 253 characters, labels to 63 characters, and a two-character-or-longer alphabetic TLD; underscores, hyphens, subdomains, and Brancy-owned domains are rejected. An invalid request attempt triggers the shared input shake animation once. After a request is registered, the form is removed and a three-step progress indicator shows request, DNS verification, and connection status. During DNS verification cooldown, the verification button is disabled and contains the countdown; after expiry it becomes an enabled Connect button.
The request action opens a Persian confirmation dialog explaining publishing responsibility and the expected provider delay of five minutes to twelve hours, and sends the request only after confirmation. Pending domains show their name servers, a cancel action, and a five-minute cooldown before Connect is available. Connect calls the connect and DNS verification endpoints sequentially; unsuccessful verification keeps the pending domain, displays a Persian DNS propagation message, and starts another five-minute cooldown. An active domain is displayed as read-only with guidance to use a Settings ticket for removal or change.

The public destination-links section is shown for the default-domain selection. For the custom-domain selection it is rendered only after the custom domain is active and finalized; in that state every destination link uses the accepted custom-domain URI.

## Market Properties Features

The FeatureBox popup provides Working Hours and Terms & Conditions sections through the shared `ToggleButton`. It calls the canonical `/api/bio/getWorkingHours`, `/api/bio/getTermsAndCondtions`, `/api/bio/updateWorkingHours`, and `/api/bio/updateTermsAndConditions` paths; `apiRouteMap` resolves them to the corresponding `Instagramer/Bio/*` backend URLs. It shows the shared loader during the initial requests, embeds the existing business-hours editor, and provides an Announcement-style editable Terms component with one text area, character counter, cancel, and save actions. Terms use an `{ str: string }` response/request body and the text is limited to 1,500 characters. Working hours use an `IBusinessHour[]` body.
Saving Terms & Conditions refreshes `lastUpdate` with the current Unix timestamp in milliseconds before sending the update and applying it to local state.
The Terms editor displays the stored `lastUpdate` using `initialzedTime()` and `DateObject`, so the configured calendar and locale control the rendered date.

The Products feature card does not render the edit-options three-dot control. Its popup loads the shopper product list with the same thumbnail and cursor-scrolling behavior as the message product picker, loads the selected products from `Shopper/Product/GetBioProductList`, allows at most ten products to be selected, and sends the ordered selected `productId` array (including an empty array) to `Shopper/Product/UpdateShowInBio` when saved. Selected thumbnails are dimmed and display their one-based position in that array as a centered numeric badge. Other movable feature cards retain the edit-options control.

## MyLink Shortcut Links

MyLink shortcut cards are capped at 250px on desktop. On mobile, the links are presented in a free horizontal carousel that supports touch scrolling and mouse/pointer dragging when horizontal overflow exists; collections larger than four links use 200px cards to keep the mobile row usable, while non-overflowing collections preserve ordinary card clicks.

The MyLink FeatureBox cards use a free horizontal carousel with no snap points or page-sized jumps. Native horizontal scrolling remains available for touch and trackpad users, while primary-button mouse dragging uses pointer capture and suppresses accidental tile activation after movement.

MyLink product cards scale down at narrower viewports, keep product thumbnails square at a stable aspect ratio, and clamp product names to two lines with an ellipsis for longer names.

The Products header currently shows a static coupon presentation with `BRANCY20`, a placeholder countdown, and a copy icon. It is display-only timing data until promotion values are provided by the backend; after a successful copy, `Copied` temporarily replaces the coupon code.

MyLink last-video titles and descriptions render backend-provided line breaks as separate visual lines, including when the text contains clickable links.

MyLink online-stream titles and descriptions use the same line-break-preserving, fluid text presentation and safe clickable-link rendering as last-video content.

The MyLink feature menubar is a free horizontal scroller. It does not distribute or compress items, and a stable viewport-anchor check keeps the active item synchronized with the visible page feature during manual or menu-triggered scrolling before centering it in the menubar.

MyLink always prepends a Home shortcut backed by `FeatureType.FeaturesBox`, and the initial active feature is Home. The Contact and Map feature does not move browser focus to its first link on mount, preventing an initial page jump away from the FeatureBox section.

MyLink shortcut expiration timers accept Unix timestamps in seconds. Durations of at least one day display as `DD:HH:MM:SS`; shorter durations retain the `HH:MM:SS` format.
