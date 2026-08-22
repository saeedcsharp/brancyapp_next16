The bulk product individual editors now render as a free horizontal slider using the shared `Slider` and `SliderSlide` components; each product card keeps its existing independent controls and state.

# Current State

Phase-one SEO foundations are implemented: the homepage uses the site-root canonical URL, `app/[locale]/page.tsx` exposes static landing routes for all eight supported locales, and `app/robots.ts` plus `app/sitemap.ts` publish crawl rules and stable public URLs. Each localized landing route has its own canonical, hreflang set, Open Graph metadata, and localized title/description. Authenticated, session-dependent, API, development, payment, and other private routes are excluded from the crawl policy; `/feature` remains intentionally noindex and is excluded from the sitemap. Production verification is still pending in Google Search Console and Bing Webmaster. The current full type-check remains blocked by a pre-existing AI filename-casing error.

Keyword and backlink quality work is documented as an external measurement baseline: locale, intent, topic cluster, target URL, semantic coverage, cannibalization, authority, topical relevance, referring-domain diversity, anchor distribution, editorial placement, and toxic-link risk must be measured before acquisition claims are made.

Phase two adds root and localized Open Graph/Twitter metadata, app icons, `x-default` hreflang, and source-backed JSON-LD for Organization, WebSite, and SoftwareApplication on localized landing routes. FAQ schema, pillar pages, keyword metrics, and backlink acquisition remain pending until reviewed content and external search/link data are available.

Phases three and four add five public topic resource pages across all eight locale URL spaces (40 static URLs), with visible topic introductions, semantic benefits, FAQ answers, FAQPage JSON-LD, breadcrumbs, related-topic internal links, and landing CTAs. The landing hero now preloads only its primary image, uses a keyboard-accessible mobile sign-in button, and removes persistent GPU `will-change` hints. Arabic, French, Russian, Turkish, German-locale, and Azerbaijani topic copy currently uses the reviewed English fallback and must receive native review before being treated as fully localized content.

Phase five adds active public Footer links for solutions, legal, support, FAQ, updates, articles, and follow-up resources, plus a public `llms.txt` containing source-backed URLs and a no-private-data usage note. Local Business structured data, Google Business, Bing Places, and `sameAs` links remain intentionally pending until the business supplies a verified public address/phone policy and official social/profile URLs.

The Iranian/local Footer branch now publishes source-backed LocalBusiness JSON-LD using the existing Isfahan address and phone, exposes the phone as a `tel:` link, and the Articles route is included in the public sitemap. Google Business and Bing Places listing creation/verification still require account ownership and cannot be completed from repository code alone.

## Current Architecture

The former icon-specific toggle control has been removed. Toggle tabs now use the shared `components/design/toggleButton/ToggleButton.tsx` control across wallet, event ideas, follower analysis, and the system-design showcase.

The bulk product popup keeps each value-unit radio beside its corresponding editor and renders both shared and per-product editors inline without changing its API or save behavior.

Bulk product amount editors now use the shared decimal-aware `InputBox`; in-progress decimal drafts remain strings until calculation, amount values are stored separately from percentage stepper values, and inactive editors are disabled with the shared `fadeDiv` treatment.
Bulk product amount inputs now display the product currency through the shared `InputBox` unit slot, using the shared `specifyPriceType` renderer.
The desktop product list now keeps its table header inside the scrollable list, where it stays sticky above the rows; the header and desktop product rows share a fixed six-column grid with a flexible product-details column and dedicated PID, stock, price, last-modified, and status widths.

The repository is a single Next.js 16 application using React 19, TypeScript strict mode, Sass, CSS modules, NextAuth, next-pwa, and a mixed App Router plus legacy-page bridge. App routes in `app/` commonly import pages from `legacy-pages/` while shared components live in `components/`.

The global App Router error boundary displays the received error message. DirectInbox keeps failed initial inbox requests and pagination/API failures local to the inbox, preserving the HTTP status and backend reason in notifications without crashing the whole route.

## Active Features

- General and media auto-reply AI and Flow selectors show their localized create-automation actions while no prompt or flow is selected, including when selectable DragDrop options are available.

- AI Flow connection paths refresh synchronously after canvas zoom and pan transforms commit, keeping SVG lines aligned with Socket DOM positions.

- Public landing and pricing flow.
- NextAuth credential, Google OAuth, and direct-token authentication flows.
- Instagramer dashboard with home, page, post, story, message, comment, ads, market, store, wallet, setting, and upgrade areas.
- User/customer dashboard with business, shop, orders, wallet, payment status, settings, and message flows.
- External Brancy backend integration through API route mapping and proxy routes.
- Localization for eight language files.
- PWA manifests and generated Workbox service worker assets.
- Public noindex `/feature` knowledge-base route with a source-audited, localized feature catalog for content teams.
- Persian `/feature` copy uses plain Persian equivalents or Persian transliteration for unavoidable brand names; technical route and identifier values remain unchanged.
- Persian `/feature` copy is also intentionally conversational and non-technical, with short explanations suitable for general and younger audiences.
- The feature catalog is a mandatory synchronization point: every added, changed, completed, renamed, or removed user-facing option or capability must update the active or audit-only list before the task is considered complete.
- Market Properties Terms editors use stable row keys, preventing controlled textareas from remounting and losing focus while users type.
- MyLink products and coupons come from the required backend `shopperInfo` object; every item in its display-ready `productCoupons` list renders beside products with code, discount, usage, expiry, and copy details.
- The MyLink coupon list now uses the shared DragDrop selector, with a separate copy action for the selected coupon.
- Expanded feature details show the usage instruction and route on separate lines, with safe wrapping for narrow viewports.
- On mobile, feature cards place the expand control in the top corner and keep role and access cells side by side.

## Completed Features

- App Router tree contains 104 page files, including the direct `/feature` knowledge-base route.
- 9 route handler files exist, including auth, pricing, user proxy endpoints, IP country detection, and a text-file route.
- API map contains 331 mapped backend entries.
- Docker standalone build path exists.
- IIS `web.config` exists for server.js hosting.

## Incomplete Features

- No complete database schema or migration files are present in this frontend repository.
- No comprehensive automated test suite was discovered.
- Some docs and generated PWA files are newly initialized and require future refinement as modules change.

## Current Priorities

- Keep the knowledge base synchronized.
- Preserve App Router and legacy page compatibility.
- Keep API route map aligned with backend endpoints.

## Documentation Layers

- `MODULE_INDEX.md` is the module catalog and priority guide.
- `FEATURES/` is the business capability layer.
- `DECISIONS/` is the architecture and workflow decision log.
- Protect auth/session and redirect flows.

The shared `helper/textByteLength.ts` utility now owns UTF-8 byte counting and Unicode-safe truncation used by AI flow text input.
The direct-message composer applies the same 1,000-byte UTF-8 limit to drafts, typing, emoji insertion, and outgoing messages.

AI tool parameter placeholders now select the localized `completeDescription*` model field for the active locale, with German used for `gr` and English fallback for French or missing values.
AI prompt tool options now select each tool's localized `displayName*` field from the active i18next locale, with German used for `gr` and English/name fallbacks.
AI tools without parameters now display an enabled `addTools` action and are added with an empty parameter list.
Prompt Analysis in the AI flow is always selectable. `FlowAndAIInBox` owns the shared confirmation modal and controlled textarea; text must exceed 20 characters before Accept updates the child prompt and calls `GetPromptAnalysis`, while Close leaves the existing prompt unchanged.
Prompt Analysis now checks `/api/ai/HasPageAnalysis` before opening. The shared modal opens only when the page analysis exists; otherwise the localized `InternalNotify_PageAnalysisNotCompleted` warning is shown.
Creating a new automation flow now opens a settings modal before mounting the editor. Continue validates the title, carries follower, snap-grid, and panning-boundary settings into the new editor, and can import a JSON editor state before editing begins.
After Continue, the new flow appears in the flow list as a local Draft record. Manual Save creates the backend flow, replaces the draft list item with the returned flow, and enables the normal saved-flow state.
The sender-username mention is excluded from selected AI tools and inserts `[SENDER_USERNAME]` directly into the prompt textbox in manual mode; it is visible but disabled in prompt-analysis mode.
Selected AI tools are highlighted directly in the existing clickable tool-options row below the prompt editor in both manual and analysis modes. Their plus icon becomes an accessible remove button, and no separate selected-tool list is rendered.

## Current Risks

- `.env` exists locally and must not be copied into documentation.
- `node_modules/` and `.next/` are present in the workspace and are generated/vendor directories.
- `public/sw.js` and Workbox files are generated and should be regenerated by build tooling, not hand-edited casually.
- Route and permission behavior depends heavily on external backend responses.
- Cross-browser visual regression coverage is not yet automated; feature-level overflow and viewport rules remain candidates for incremental audit.

## Recent Changes

<<<<<<< HEAD

- Fixed the Instagramer hamburger menu BioLink active state by using the actual slash-free market route values, so Home, Statistics, MyLink, and Properties all select the BioLink logo.

- # Fixed Instagramer mobile navbar market-route detection by aligning the BioLink enum values with the actual slash-free `/market`, `/market/statistics`, `/market/mylink`, and `/market/properties` paths, so all market views display the BioLink logo.
- AI Flow web-link inputs now apply the shared `InputBox` danger status after invalid non-empty URLs and replay the shake animation once per invalid blur; editing the URL clears the error state.
- AI Flow web-link validation now requires HTTP(S) hostnames to end with a non-empty dot suffix such as `.com` or `.ir`, while allowing any suffix value.

  > > > > > > > sepehr

- The `/page/tools` `hashtagManager` now owns the card collapse interaction. Activating its shared header hides the manager content and reduces the masonry row span from `82` to `10`; Enter and Space provide the same keyboard behavior.

- Home PageDetail demographic titles now show a localized `(Last 30 Days)`-equivalent label for gender, age, and location sections across all eight supported locales.

- Unified the `/page/tools` saved-hashtag and trend/search-hashtag cards into one `hashtagManager` card with the shared `ToggleButton`; only the selected hashtag view mounts, while existing hashtag callbacks and data behavior remain unchanged.

- Added a prioritized home profile status slideshow. It shows all currently active statuses, ordered from priority `1` through `10`, with previous/next controls when more than one status applies. The first-login 24-hour synchronization countdown, subscription renewal warning below seven remaining days with a remaining-day count, shopper/influencer role content, and role-upgrade actions remain supported and localized across all eight supported locales.

- Fixed the main subscription remaining-time calculation so expired subscriptions display `0 days` instead of the expiry timestamp interpreted as a duration.

- The Instagram account switcher now highlights the account selected by `session.user.currentIndex` with a blue-tinted border/background treatment and exposes the selection through `aria-pressed`.
- The account switcher's Instagram redirect now uses full browser navigation with a runtime host check, preventing external redirect URLs from reopening the current site.
- The upgrade page now skips its session-dependent package-data reload when account switching starts, preventing duplicate `GetPackageFeatureDetails`, `GetReserveFeaturePrices`, and `GetPackagePrices` requests before navigation.

- Fixed the Meta direct-login loading-screen hydration mismatch by keeping its initial phrase order deterministic across server and client rendering, then shuffling after mount.

- Prevented React Strict Mode effect replays from sending the Meta direct-login verification API request twice by guarding the request with a component ref.

- The Meta direct-login flow waits 10 seconds after successful verification, then opens a localized AI-analysis notice; navigation to `/directlogin` occurs only when the user confirms the modal.

- Removed the Store Properties entry from the Instagramer desktop navbar and mobile hamburger menu while keeping `/store/properties` directly accessible.

- Fixed the AI page runtime crash caused by passing the removed `onCreateImage` callback name to `MediaCreator`; the page now passes its existing media-neutral `onCreateMedia` handler.

- The shared TextArea supports line-based `minRows`/`maxRows` auto-resize bounds. The AI media prompt grows with its content from five lines up to ten lines, then scrolls internally.

- Restructured the AI workspace so Image/Video tabs remain visible while the matching media creator is rendered above the corresponding generated-media library. Creator requests now load for the selected media type without using the removed header Create button.
- AI creator provider and model selection now share one tree-like panel: each provider branch expands to show its models underneath, replacing the separate provider panel.
- Removed unused legacy AI creator styles for the old standalone header, back link, section heading, and provider-panel layout while preserving selectors shared by generated-media modals.
- AI provider branches now use the public down-arrow asset with a 180-degree open-state rotation, and nested model lists animate open/closed with reduced-motion support.
- AI media tabs now render inside the creator model panel. If the selected media type has no creator/model, the model panel retains only the tabs and the localized empty/error state is rendered in the settings panel.
- AI creator enum inputs now use the shared button-based `optionGrid` presentation for both enum input variants instead of a native select.
- AI creator multiple range inputs now render as one fixed `250px` square with a centered fixed `100px` inner square; mouse/touch handles define one shared hatched frame, including its corners, while each backend range key remains separate in submitted requests.
- AI creator footers now show separate, independent token-usage and media-creation buttons on opposite sides; creation only requires a valid prompt and required inputs, and uses zero for the parent feature check when no estimate exists.
- AI media tabs now use the shared `ToggleButton`; the former dedicated content-creator header component and stylesheet were removed.
- Generated image and video result modal styles now live in `components/page/ai/Modal_Generated.module.css`; `mediaCreator.module.css` is limited to `mediaCreator.tsx` styles.

- Added a permanent design-system rule for AI-assisted implementation: before writing new UI code, inspect and reuse the shared `scss/` styles and `components/design/` components, preserving the existing visual, responsive, RTL/LTR, and accessibility conventions.
- Fixed advertise and customer-ad business-hour displays to translate the `LanguageKey` returned by `findDayName`, so localized weekday labels render instead of raw key names. The MyLink popup also normalizes its backend `weekDay` field before mapping it, preventing all rows from falling back to Monday.

- Successful browser uploads now wait one second before their returned media URL is made available to UI consumers. This gives the upload server time to publish newly uploaded images, videos, and other media before the browser fetches them. Direct-message image and video popups now use the same shared `UploadFile` path instead of local XMLHttpRequests.

- Added the Market Properties FeatureBox popup with shared Working Hours and Terms & Conditions tabs. It uses canonical `/api/bio/*` paths registered in `helper/apiRouteMap.ts`, which resolve to the `Instagramer/Bio/*` backend endpoints, and includes embedded `EditBusinessHours`, Announcement-style `{ str: string }` Terms editing with a fixed 200px textarea, a 1,500-character counter, persistence, and the shared initial `Loading` state.

- Fixed brush line chart hydration mismatches by formatting count labels with an explicit `en-US` locale instead of the runtime default locale.

- Fixed `InputBox` so an empty field with `dangerOnEmpty` receives the shared `.shake` animation class and replays the animation when it enters the invalid empty state.

- Standardized the shared `InputBox` while preserving its legacy class models and controlled callback API. It now has responsive fluid sizing, RTL/LTR logical spacing, mobile-safe 16px text, localized-digit normalization, native read-only/disabled/required behavior, forwarded refs, semantic `variant`/`status` options, and an accessible native clear button. Existing full-project typecheck still reports unrelated wallet import and duplicate locale-key errors.
- Fixed the shared `InputBox` clear button positioning by anchoring it inside a full-width relative wrapper at the physical right edge for both LTR and RTL layouts.

- Added a second authenticated `/dev` destination for `/dev/systemDesign`. The system design lab uses only mock data, groups design components in a responsive bento-style grid, and exposes interactive states for the shared input, form, loading, chart, navigation, drag/drop, modal, AI, and text-editor components. The existing package report remains available at `/dev/package`.

- Fixed the General settings language-control hydration mismatch by keeping its initial render English and applying the stored browser language after mount, matching the global i18n initialization contract.

- Added `/feature`, an evidence-backed Brancy feature knowledge base for content teams. Its static catalog has 41 active source-backed records across Instagramer, Shopper, and Advertiser filters; it exposes search, category/access filters, sorting, expandable detail, source-kind evidence, RTL, dark mode, and mobile layout. Routes whose workflows are seeded, local-only, unmapped, incomplete, download-only, or shell-only are separated into an audit-only section rather than represented as active capabilities. The catalog has reviewed Persian copy, English fallback for the other configured locales, no backend fetches, and no sensitive account data. TypeScript and browser checks passed for interaction and 390px RTL dark mode without horizontal overflow.

- Synchronized all eight locale files to the same 2,970 direct string translation keys. Missing entries use English fallback text where available and key-name placeholders otherwise; nested translation objects remain outside the flat `LanguageKey` enum.
- Added a dedicated store statistics coupon section. The Statistics page owns `Shopper/Coupon/GetCoupon`, including `isActive`/`isPrivate` filters and `nextMaxId` query pagination based on the last coupon ID through `useInfiniteScroll`, the documented `CreateCoupon` POST request, `Shopper/Coupon/UpdateCoupon`, and related server state; `CouponManager` and `CreateCouponModal` are data/callback-driven UI components. Labels, placeholders, statuses, and interpolated values are localized across all eight supported languages.
- Store statistic coupon cards show a present phone number, including `0`, with a localized `Private` tag; missing phone numbers show a localized `Public` tag.
- Store statistic coupons now support API-backed search using the `query` parameter. Search displays a loading state for each request, restores the regular paginated list when cleared, and does not request additional pages while active.
- Coupon search requests are debounced by 400 milliseconds after the last typed character.
- Normal coupon results are cached per filter combination and restored when search is cleared, avoiding an extra API request when leaving search.

- AI image and video creation now returns to the matching library immediately after request submission, shows one loading card per pending `clientContext`, and replaces or removes each card when its correlated SignalR success or failure notification arrives. Concurrent generations remain independently tracked.

- The active AI workspace is localized across all eight supported locales. Creator states, model guidance, prompt validation, token usage actions, result metadata fallback values, request notifications, and the page description use the active i18next locale.

- The AI library supports optional deep links: the App Router wrapper reads `/page/ai?type=1` or `/page/ai?type=2` with `useSearchParams` and passes the selected tab into the legacy page. Missing or unsupported values preserve the default image tab.

- The AI page displays the shared full-page `Loading` component during the initial selected-library request. `type=2` starts with the video history request, while `type=1` and the default start with the image history request; the loader is not used for pagination or creator interactions.

- Replaced Market Properties selected-product check indicators with numeric badges that show each product's one-based position in the ordered array sent to the bio-product update endpoint.

- Corrected the user sidebar active indicator positions after removing wallet: ticket now aligns with the messaging item and setting aligns with the setting item.

- Removed the user wallet entry from both the desktop user sidebar and mobile user hamburger menu; the user wallet route and feature remain available outside those navigation lists.

- Fixed the `/store/products/productDetail` App Router wrapper's mixed server/client boundary. The wrapper now runs on the client, obtains `tempId` through `useSearchParams`, and renders the legacy product-detail page below Suspense so React context and `useSession` are not evaluated during server page-data collection.

- Replaced the Market Properties Product popup radio selector with a product thumbnail picker that loads the shopper product list, loads selected products through `Shopper/Product/GetBioProductList`, supports up to ten selected product IDs, shows selected items with a large check indicator, and saves the selection (including an empty array) through `Shopper/Product/UpdateShowInBio`.

- Fixed the shared ToggleButton active indicator translation for RTL layouts by reversing its horizontal percentage offset through the shared DirectionContext while preserving the LTR behavior and controlled API.
- Hardened the MyLink market page: redirects no longer run during render, unmounted async loads cannot update state, feature dialogs share one exclusive modal state, feature rendering uses memoized map lookup, and authenticated metadata now allows zoom and is `noindex, nofollow`.
- Optimized MyLink media and product interactions: live-stream controls no longer add global listeners per render, product search/filtering is deferred and memoized, carousel keyboard navigation is RTL-aware, and product/live motion respects user reduced-motion preferences.
- Standardized MyLink typography with shared fluid `clamp()` tokens, replacing raw pixel font sizes across its CSS modules so text scales within readable bounds across desktop, tablet, and mobile viewports.
- MyLink last-video titles and descriptions now preserve backend-provided line breaks while retaining safe clickable links.
- MyLink online-stream titles and descriptions now use the same line-break preservation, safe clickable links, and responsive line-height as last-video content.
- MyLink shortcut countdowns now convert durations over 24 hours into days plus remaining hours instead of showing an inflated total-hour value.
- Added a free horizontal MyLink shortcut carousel with native touch scrolling and mouse/pointer dragging. Shortcut cards remain capped at 250px on desktop; mobile collections with more than four links use 200px cards.
- Enabled horizontal touch panning on MyLink shortcut, FeatureBox, and product carousel containers while preserving vertical page panning, so mobile horizontal scrolling works with native gestures.
- Updated the MyLink feature menubar to use free horizontal scrolling and automatically center the active feature button whenever the visible feature changes.
- MyLink FeatureBox cards now use free horizontal scrolling with native touch/trackpad support, pointer dragging, no snap points, and protection against accidental activation after dragging.
- MyLink now always starts with a Home menu item targeting `FeatureType.FeaturesBox`; Contact and Map no longer autofocuses a link on mount, preventing an initial scroll jump away from the top section.
- Standardized the shared SwitchButton while preserving its existing import path and controlled API. The native checkbox remains keyboard-accessible, supports standard input/ARIA props and valid switch semantics, provides a 44px touch target, handles RTL thumb direction, and includes disabled, focus-visible, reduced-motion, and forced-colors states.
- Standardized the shared RadioButton with a keyboard-focusable native input, backward-compatible legacy props plus standard native radio props, stable no-layout-shift selection visuals, 44px touch targets, disabled/focus-visible states, and reduced-motion/forced-colors fallbacks.
- Standardized the shared IncrementStepper with native keyboard-accessible buttons, pointer-captured press-and-hold repetition, current-value decrement guards, click suppression after a hold, 44px touch targets, fluid sizing, reduced-motion/forced-colors fallbacks, and compatible callback props. It additionally accepts `disabled`, `className`, `aria-label`, `incrementLabel`, and `decrementLabel`.
- IncrementStepper values can now be manually edited: digit-only drafts commit on Enter or blur through `onValueChange`, are clamped by optional `min`/`max` props, and Escape restores the current value. All existing consumers provide a compatible callback with their own active quantity limits.
- Standardized the shared CheckBoxButton while preserving its existing import path and controlled API. The native input remains keyboard-focusable through visual hiding, native accessibility attributes are accepted, `className` and `title` now work, touch targets are at least 44px, and the visual indicator supports focus, disabled, reduced-motion, and forced-colors states.
- Standardized the shared TextArea around native textarea props while retaining legacy prop aliases for existing consumers. It now applies RTL/LTR direction reliably, supports bounded auto-resize without timer races, uses responsive focus/forced-colors/reduced-motion styles, and enforces a 16px minimum font size to prevent mobile focus zoom.
- Standardized the shared DotMenu with native button/menu semantics, keyboard navigation, focus restoration, escape and outside-pointer close behavior, responsive touch targets and viewport bounds, RTL-aware `placement`, body-level portal rendering with fixed viewport coordinates, and reduced-motion and forced-colors support. `placement` is now the single menu-position prop; data/action compatibility props and standard `options`/`onOptionSelect` remain available.
- DotMenu trigger clicks stop propagation, so opening a menu inside a clickable post or card does not trigger the parent navigation action.
- Removed unused MyLink product visibility state, root key, legacy markup styles, and obsolete search/coupon CSS while retaining the active carousel and card styles.
- Added a static MyLink Products coupon presentation with placeholder countdown values, code `BRANCY20`, and an accessible Clipboard API copy action with temporary confirmation; backend promotion data is still pending.
- Converted the MyLink product cards into a free horizontal carousel with native touch scrolling, mouse/pointer dragging, no wrapping or scroll snap, and drag-click protection for product links.
- Made MyLink product cards responsive with smaller mobile widths, square fixed-aspect thumbnails, and two-line ellipsis truncation for product names.
- # Added responsive MyLink product controls with Best Sellers/Best Discounts sorting toggles, a flex-growing product search, and a Show All Products reset action that stacks cleanly on mobile.
- Domain Manager now uses `baseShortUrl/username` instead of `username.baseShortUrl` for default and destination links only when the username contains `.`, while `_` and `-` continue to use the subdomain form.
- Domain Manager domain displays no longer add a `www.` prefix.
- Domain Manager hides the duplicate default link when an invalid subdomain username already resolves to the path-style URL.
- Fixed the Domain Manager loading state under React Strict Mode by re-enabling its mounted guard during effect setup, allowing the custom-domain Request button to leave `RingLoader` after the request completes.
- Domain Manager now submits a valid custom-domain request directly to `Instagramer/Bio/UpdateCustomDomain` when Request is clicked; the client-side CustomDomain feature check no longer blocks this initial request, while duplicate-submit protection remains.
- بهینه‌سازی Domain Manager با حذف state مشتق‌شده، memoization اعتبارسنجی و لینک‌های مقصد، فرم native برای submit با Enter، کنترل‌های keyboard-accessible، لینک‌های خارجی امن، کپی صحیح دامنه سفارشی، لغو درخواست‌های fetch هنگام unmount یا تغییر session، cleanup تایمر و animation frame، حذف consoleهای اضافی و متادیتای noindex برای صفحه احراز هویت‌شده.
- تأییدیه Modal درخواست دامنه حذف شد و درخواست معتبر اکنون مستقیماً پس از submit فرم ارسال می‌شود.
- قوانین دامنه سفارشی به‌صورت فهرست معنایی نمایش داده می‌شوند و فقط هنگام فعال‌بودن گزینه Custom Domain رندر می‌شوند.
- Strengthened custom-domain input handling in the market domain manager: values are lowercased and normalized by removing URL decoration and trailing slashes, validation enforces domain/label length and label/TLD rules, reserved Brancy domains remain blocked, invalid request attempts replay the shared input shake once, pending requests replace the form with a three-step progress indicator, and DNS cooldown is shown inside the disabled verification button until it becomes Connect again.
- Completed the custom-domain workflow in the market domain manager: values are normalized and validated, requests require a Persian responsibility/delay confirmation, pending domains show name servers with cancel and five-minute cooldown actions, Connect shows a loader across both sequential API calls, failed propagation retains the pending state with a Persian retry message in the name-server stage, and active domains show Settings ticket guidance for changes.
- The market domain manager now shows public destination links for the default-domain selection, or for the custom-domain selection only after the custom domain is active and finalized; custom-selected links use the accepted custom-domain URI.

- Hardened `legacy-pages/user/home` responsive behavior by replacing fixed masonry-style grid spans and indefinite percentage heights, making the upgrade card positioning local and fluid, constraining narrow text, and adding reduced-motion support. The page now uses native keyboard-accessible controls instead of clickable `div` elements, avoids nested `Link`/`button` markup, and cleans up cancellable data-loading and redirect effects.

- Fixed the landing pricing slider's React maximum-update-depth runtime error by making the slider value the single source of truth and deriving tooltip placement directly from it; TypeScript validation passes.

- Added an accessible compact shopping-bag SVG badge beside the Page post number for `shopMediaProductType` `ShopMediaProductType.Instance`, so shop-product posts are identifiable from the post grid.

- Prevented Comment Inbox settings-popup hover renders from repeatedly loading Auto Reply prompts and flows. The selected media's auto-reply prop is now memoized and only changes when the selected thread, source inbox, search mode, or relevant inbox data changes.

- Fixed shared infinite-scroll termination: empty or duplicate-only pages now report `hasMore: false`, and the product and lottery-post thumbnail pickers persist that state to prevent repeated exhausted-cursor API calls.

- Added accessible icon-only close controls to the wallet invoice, bank-card sub-invoice, and order-detail popup headers.

- Made both wallet sub-invoice popups fit desktop modal widths with fluid table-grid columns, while retaining horizontal scrolling for narrow screens.

- Added an accessible SVG order-details action to the selected invoice's sub-invoice popup header. It calls `/api/wallet/getInvoice` through the wallet page and opens the existing read-only order-detail modal on success.

- Added a read-only invoice order-detail popup to the Instagramer payment page. It loads `/api/order/GetFullOrder` from the selected invoice ID and invoice user ID, then reuses the store order-detail content and presentation without accept/reject actions.

- Updated the bank-card sub-invoice popup to own a responsive card/table layout instead of using the global masonry `tooBigCard` style; the table scrolls horizontally on narrow screens.
- Corrected the sub-invoice popup container from the legacy 10px-row masonry grid to flex, so the local card expands to its table content instead of being visually collapsed.
- Added cursor-based infinite scrolling to the bank-card sub-invoice popup, appending unique `/api/wallet/getSubInvoices` pages from `nextMaxId` with initial, additional-loading, and empty states.
- Cached loaded sub-invoice pages by card number in the wallet payment page, preventing another initial `GetSubInvoices` request after reopening the same popup.
- Prevented the sub-invoice modal close animation from rendering the child with an empty card number, which had triggered an unnecessary `GetSubInvoices` request.

- Migrated `components/website/installPrompt.tsx` presentation styles, including SVG icon styling and RTL layout variants, into `installPrompt.module.css` without changing install-prompt behavior.

- Hardened the sign-in verification form so WebOTP only fills the code and a single guarded submit path prevents duplicate credentials requests from WebOTP, code completion, or repeated Enter/click actions. Added shared Persian/Arabic-Indic digit normalization, ref-based focus navigation, paste focus, accessibility state, `finally` loading cleanup, and unmount cleanup for WebOTP/animation resources without changing the incorrect-code shake and input-reset behavior.
- Refined the verification form with functional digit updates, memoized code validation, stable regex/duration constants, typed WebOTP data, multi-digit autofill, select-on-focus, first-input focus after errors, timer/error ARIA relationships, and history-replacing success navigation. Removed unused verification props from the form and its only call site.

- Updated setting activity-history cards and partner phone details to render country-code SVG flags from `public/Flag` instead of Unicode flag emojis.
- Rendered the shared Tooltip through `document.body` with viewport-fixed positioning derived from its trigger, while preserving top/bottom/left/right/LTR/RTL placement and updating on scroll/resize so ancestor clipping and stacking contexts cannot hide it.

- Added the dependency-free local phone input package at `components/design/phoneInput/`, migrated landing sign-in, sign-in verification, and partner creation consumers, and removed runtime usage of the legacy phone-input dependency from application source.
- Phone country masks now use `_` for digit positions, and phone values are normalized before formatting and validation so typed and pasted numbers behave consistently.
- Phone country auto-detection now prioritizes the centralized timezone mapping and keeps the dial code synchronized when an IP response selects a country.
- PhoneInput renders its country dropdown through `document.body` with viewport-fixed positioning, preventing ancestor stacking contexts from clipping the list.
- PhoneInput uses the internal `/api/user/ip` endpoint for client-side IP detection by default, with timezone and `defaultCountry` as immediate fallbacks.
- PhoneInput shows the warning icon instead of a flag whenever the dial code is empty, unknown, or incomplete.

- Added a styled internal back link from the image creation workspace to `/page/ai`.
- Rebuilt `/page/ai` as a segmented Image/Video media workspace; Image mode loads successful generated images from `GetImages`, while Video mode loads successful generated videos from `GetVideos`. Both modes render responsive metadata cards and append cursor-based pages on infinite scroll; image results open shared detail modals and video results use native playback controls.
- Updated the `/page/ai` video history UX: cards now show a thumbnail image (`imageUrl`) or the default `/cover-video.svg` fallback when the image is missing, and clicking a video card opens a dedicated generated-video modal where playback (with audio) happens.
- Parsed generated-image JSON metadata strings into a responsive labeled value grid while preserving a plain-text fallback for malformed metadata.
- Made AI image provider selection explicitly support multiple provider families and their model collections with responsive logo cards, atomic provider/model switching, and provider-aware form resets.
- Replaced the generated-image modal's full-image link with a direct download action that uses the resolved media URL.
- Added a responsive generated-image result modal that opens after a matching successful MediaAi SignalR notification and displays the image, prompt, metadata, creator, version, status, image ID, and job ID.
- Fixed image-generation notification correlation by sending the newly generated `clientContext` directly with the `CreateImage` request instead of reading stale React state.
- Connected image creation settings to `GetImageUsage`, displaying the returned token estimate before changing the primary action to `Create image`.
- Added `showUrl` previews for uploaded image-creator references and a localized warning when selection exceeds the active model's media limit.
- Connected image-creator reference media controls to the shared upload service and now retain successful server `fileName` values as input arrays.
- Added the authenticated image-creator workspace with backend-driven provider/model selection and dynamic controls for all eight MediaAi input types.
- Synchronized the Instagramer sidebar Page indicator and SVG active color for AI-related pages by using prefix matching for both states.
- Fixed the Instagramer mobile Page and desktop Content Creator logos on `/page/ai`, including direct reloads, by deriving active navbar sections from the App Router pathname.
- Added responsive internal feature search to the Instagramer navbar using translated feature/section labels for all eight configured locales; searches such as Persian lottery terms resolve to `/page/tools`.
- Added localized notification mappings for 16 new backend response types across all eight supported languages.
- Connected Instagramer bank-card registration to `/Business/Wallet/AddCardNumber` and refreshes the complete backend card list after successful registration.
- Connected the Instagramer payment page invoice-history request to a responsive invoice card section after the bank-card collection, with status/type labels and loading/empty states.
- Added cursor-based infinite scrolling to Instagramer invoice history, using each `/api/wallet/getInvoices` response's `nextMaxId` to append unique subsequent pages.
- Added a Persian start-date filter to the Instagramer general-balance request and redesigned its results as per-card totals across all four sub-invoice statuses.
- Connected the Instagramer wallet statistics chart to `/api/wallet/getBallanceHistory` and its monthly balance-history response.
- Updated `legacy-pages/wallet/payment.tsx` to load and render Instagramer bank cards as responsive standalone tiles, with a separate add-card toolbar and form.
- AI Knowledge Base initialized on 2026-07-19.
- Added a collapsible vertical shipment-details timeline to the store order popup (`components/store/order/popup/OrderSend.tsx`) using `parcelInfo.logs` from `/api/order/GetParcelInfo`.
- Added a reusable multi-series brush line chart in `components/design/chart/brushLineChart.tsx` and wired it into total store sales statistics.
- The brush line chart now switches its visible aggregation between year, month, and day based on the selected range.
- Hover selection, vertical guide lines, and tooltips now share the same aggregated bucket coordinates.
- The main brush chart line remains rendered for the full timeline while the selected range controls the visible x-domain; the overview brush still shows all data.
- Chart paths now replay a smooth draw animation when the data, selected range, or displayed granularity changes, and the brush selection animates between ranges.
- Brush chart sizing now measures after navigation layout settles and ignores zero-size measurements, preventing an incorrectly sized SVG when entering the statistics page from another route.
- Hover zones now cover the full interval around each vertical guide line, so tooltips activate before the pointer reaches the exact line.
- The store statistics report table now uses an aggregated buyer CRM contract (`IBuyerPurchaseReport`) and displays buyer details, total purchases, total purchase amount, and last purchase time.

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
