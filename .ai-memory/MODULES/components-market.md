# components/market

## MyLink Typography

MyLink CSS modules use the shared fluid typography tokens from `scss/_variables.scss` (`--font-fluid-xs` through `--font-fluid-2xl`). These tokens keep labels, body text, controls, and section headings within readable minimum and maximum sizes across viewport widths, so individual MyLink styles do not use raw pixel `font-size` values or abrupt mobile overrides.

## Purpose

Component module for market UI and feature concerns.

## Business Purpose

Supports Brancy market workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/market/.

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

components/market/.

## Related Modules

Parent module: `components`.

## Known Issues

Products is enabled in the market properties feature list. Reviews and AdsTimeline remain visually disabled by the feature-properties stylesheet.

## MyLink Products

`components/market/myLink/product.tsx` renders the product-card section with a responsive header. The header keeps Best Sellers and Best Discounts toggles beside a flex-growing product/PID search input on desktop, then stacks the controls below 720px. Best Sellers sorts by the available `inCardCount` signal, Best Discounts sorts by calculated discount percentage, and Show All Products clears both filters and search text.

Product search uses a deferred query and a memoized filter/sort result to keep input responsive for large card collections. The horizontal carousel supports pointer dragging plus focused keyboard navigation with Left/Right, Home, and End keys, including RTL-aware scroll direction. Product and live-stream motion honors `prefers-reduced-motion`.

The product cards render in a free horizontal carousel. The container never wraps, supports native horizontal touch scrolling and pointer drag scrolling with the mouse or touch, and does not use scroll snapping. A drag gesture suppresses the card link click that would otherwise open an Instagram URL.

Product cards use a responsive fixed-width range, becoming slightly narrower on tablet and mobile screens. Their thumbnails keep a stable square aspect ratio, while product names reserve two lines and truncate longer text with an ellipsis.

The Products header includes a static presentation coupon with a days/hours/minutes/seconds countdown, the code `BRANCY20`, and a copy interaction. The countdown and code are placeholders until the backend promotion contract is connected; after a successful copy, `Copied` replaces the code temporarily while the browser Clipboard API confirmation is active.

## MyLink Lifecycle And Metadata

The authenticated MyLink page redirects only from effects, ignores asynchronous results after unmount, presents its three feature dialogs through one exclusive modal state, derives rendered feature nodes from one memoized feature map, and marks its authenticated metadata `noindex, nofollow`. The live-stream and last-video interaction listeners are registered from effects and removed during cleanup.

Last-video titles and descriptions preserve backend newline characters in the rendered text while keeping embedded links as safe React anchors.

Online-stream titles and descriptions follow the same text rules: backend newline characters remain visible, titles can contain safe clickable links, and the responsive text sizing and line-height remain consistent with last-video content.

# The product module keeps styles for its current header, static presentation coupon, carousel, and product cards; the former collapsible-section state and obsolete legacy header styles were removed.

The Products card intentionally omits the edit-options three-dot control; other movable feature cards continue to expose it.

## MyLink Shortcut Links

`components/market/myLink/featureBox.tsx` renders FeatureBox cards in free mode: the section has native horizontal overflow without scroll snapping, supports touch/trackpad scrolling and primary-button pointer dragging across browsers, and prevents a drag gesture from triggering a tile click. The layout starts at the logical inline start on every viewport and keeps keyboard focus and reduced-motion styles available.

`components/market/myLink/link.tsx` renders shortcut cards with a desktop maximum width of 250px. On mobile, the shortcut section becomes a free horizontal carousel with native touch scrolling and pointer dragging; when more than four links exist, each mobile card is reduced to 200px. Dragging suppresses the click that would otherwise redirect to a shortcut URL.

Shortcut expiration values are Unix timestamps in seconds. `CountdownTimerForLink` displays days before the remaining hours when the duration reaches 24 hours, using `DD:HH:MM:SS`; shorter durations remain `HH:MM:SS`.

`components/market/myLink/menubar.tsx` keeps feature navigation in free horizontal mode. The intersection observer uses a stable viewport anchor and the rendered feature list to update the active menu item during manual page scrolling and smooth feature navigation; the active button is then centered inside the menubar. Reduced-motion users receive an instant reposition instead of smooth scrolling.

The MyLink page prepends a permanent Home menu item for `FeatureType.FeaturesBox` and initializes the menubar on that item. `ContactAndMap` does not autofocus a contact link during mount, so rendering the section cannot pull the browser viewport away from the top FeatureBox section.

## Domain Manager

`components/market/properties/domainManager.tsx` owns custom-domain normalization and validation. It lowercases values, removes supported URL decoration and trailing slashes, rejects malformed labels, unsupported characters, subdomains, overlong domains, and reserved Brancy domains, and signals invalid request attempts through `InputText`'s one-shot shake prop. Once a pending domain exists, the request form is not rendered and a three-step progress indicator reflects DNS verification and connection state. The DNS verification cooldown is rendered inside the disabled verification button and the button returns to the enabled Connect action after expiry.
Requests require a Persian responsibility/delay confirmation. Pending domains use one shared name-server stage with cancellation and a five-minute cooldown; its single Connect action calls connect and verify consecutively, failed DNS propagation remains pending with a Persian retry message, and active domains show Settings ticket guidance for changes.

The Domain Manager uses a native request form for Enter submission. A valid request sends `Instagramer/Bio/UpdateCustomDomain` directly without a confirmation modal or client-side feature gate; duplicate in-flight submissions remain blocked. Its mounted guard is re-enabled when the component effect starts so React Strict Mode's development cleanup/setup cycle cannot leave the Request button stuck in its loading state. It renders custom-domain rules as a semantic list only when the Custom Domain radio is selected, memoized domain/link calculations, native anchors and buttons for keyboard access, and cancellable API requests with unmount/session cleanup. Authenticated Properties metadata is marked noindex and does not expose a public canonical URL.

The default and custom domain sections are presented as mutually exclusive radio choices. The selected panel remains fully visible while the inactive panel content receives the shared `fadeDiv` treatment.

The shared destination-links section is gated by the selected domain type. It is visible for the default option, while the custom option requires `isCustomDomainActive`; its destination URLs use the accepted custom-domain URI only in that selected active state.

Default username-based links use the subdomain form only when the username contains no `.`, `_`, `-`, or Persian kashida (`ـ`). Usernames containing any of those characters use the path form `baseShortUrl/username`, including the default-domain display and destination links; accepted custom-domain links continue to use the custom domain itself. Domain displays do not add a `www.` prefix, and the alternate default link is hidden when it resolves to the same path.

When `isDevMode` is enabled, the Domain Manager also exposes a local-only `مرحله بعدی (تست)` control. It advances a pending domain from the name-server step to the completed-DNS step and then to an active accepted-domain state without sending an API request; the existing Delete control remains the backend cleanup action.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-08-07

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
