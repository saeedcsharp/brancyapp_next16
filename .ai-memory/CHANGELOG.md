- Refined the store statistics coupon manager presentation with elevated coupon cards, clearer status badges, metadata chips, responsive mobile stacking, and reduced-motion support.
- Fixed create and update coupon cancel buttons submitting their forms by explicitly marking them as non-submit buttons.
- Added memoized create-coupon validation for code, discount percentage, and maximum uses, plus an internal `TimeExpire` notification when expiry is missing or less than one hour ahead.
- Added coupon edit mode: the three-dot action opens the shared modal with existing values, keeps code/discount/phone/max-discount read-only, and saves expiry, max uses, and bio visibility through `Shopper/Coupon/UpdateCoupon` with `couponId`.
- Coupon bio visibility toggles now activate through `Shopper/Coupon/ActivateCoupon` or remove through `Shopper/Coupon/DeleteCoupon`, sending only `couponId`.
- Fixed the coupon edit action bubbling into the collapsible card header, which prevented the edit modal from opening reliably.
- Separated coupon editing into `UpdateCouponModal`; `CreateCouponModal` is create-only, and the Statistics page mounts the update form inside its own shared `Modal`.
- Aligned the coupon manager card width and horizontal spacing with the other cards in the shared statistics grid on desktop and mobile.

- Fixed brush line chart hydration mismatches by using an explicit `en-US` locale for count labels rendered in SVG axes and tooltips.

# Changelog

- Clarified the coupon expiration label in all eight locales to state that the expiration must be at least one hour from the current time.

- Anchored the shared InputBox clear button inside a full-width relative wrapper so it remains centered at the physical right edge in both LTR and RTL layouts.

- Removed the extra InputBox wrapper element. The clear button remains visually overlaid as an accessible sibling because native HTML `input` elements cannot contain children.

- Fixed the shared InputBox empty-danger state so `dangerOnEmpty` activates the existing shake animation in addition to the invalid border.

- Added strict digit-only handling for InputBox numeric modes, Unicode decimal-digit normalization to English digits, and an extensible styled `unit`/`unitStyle` option for values such as `Kg`, `CM`, `MM`, and `$` without adding a wrapper element.

- Extended `/dev/systemDesign` with interactive numeric samples using Persian digits and unit samples for `gram`, `Kg`, `CM`, `MM`, `$`, and `%`, including a custom unit style.

- Updated InputBox so a displayed `unit` occupies the trailing control area and suppresses the clear button.

- Matched the `unitLabel` width to the InputBox unit padding with `clamp(40px, 30%, 60px)` so both regions remain identical responsively.

- Standardized the shared `InputBox` with a responsive fluid base, logical RTL/LTR layout, 16px mobile-safe typography, localized-digit normalization, native disabled/read-only/required behavior, forwarded refs, semantic `variant`/`status` props, keyboard-accessible clear control, and reduced-motion/forced-colors fallbacks while retaining all legacy CSS models.

- Added a password-protected dev-panel choice between the dependency report and a new `/dev/systemDesign` mock component laboratory. The lab uses a responsive bento grid and interactive local samples, including every `InputBox` CSS model and grouped design controls, charts, loaders, menus, drag/drop, modal, AI button, phone input, and text editor.

- Fixed the General settings language radio hydration mismatch by deferring the stored `localStorage` language state until after the English SSR/client-first render.

- چیدمان کارت قابلیت‌ها در موبایل اصلاح شد: دکمه بازکردن در گوشه بالای کارت قرار گرفت و نقش و وضعیت دسترسی روبه‌روی هم نمایش داده می‌شوند.

- مسیر هر قابلیت در پنل جزئیات اکنون همیشه در خطی جدا، داخل بلوک خوانا و با شکست امن متن نمایش داده می‌شود.

- توضیح فارسی قابلیت «انتخاب برنده و قرعه‌کشی» کامل‌تر شد و انتخاب محتوا، تعیین شرط‌ها و زمان، انتشار قوانین یا بنر و پیگیری وضعیت قرعه‌کشی و برنده را روشن می‌کند.

- Added a permanent AI Knowledge Base rule requiring every added, changed, completed, renamed, or removed user-facing option or capability to be synchronized with the active or audit-only `/feature` catalog before implementation work is considered complete.

- ساده‌سازی دوبارهٔ متن فارسی `/feature` با لحن خودمانی و قابل‌فهم برای مخاطب عمومی و نسل زد؛ جمله‌ها کوتاه‌تر شدند و اصطلاحات فنی با توضیح‌های روزمره جایگزین شدند، بدون تغییر در داده یا شناسه‌های فنی.

- بازبینی کامل متن فارسی صفحه `/feature`: واژه‌های انگلیسی غیرضروری در نقش‌ها، دسته‌ها، دسترسی، پیش‌نیازها، محدودیت‌ها، عنوان و شرح قابلیت‌ها، ایده‌های محتوا، شواهد و موارد ممیزی با معادل فارسی یا نوشتار فارسی جایگزین شدند؛ نام‌های برند مانند مای‌لینک، تلگرام و واتساپ به شکل فارسی نمایش داده می‌شوند.

- Added `/feature`, a localized noindex feature knowledge base for the content team. It contains 41 evidence-backed records with role tabs, deferred search, category/access filters, local sorting, expandable source/dependency/access details, responsive RTL/dark-mode presentation, and a separate audit-only section for seeded, local-only, incomplete, or unmapped workflows. Added the structured catalog, nested i18n namespace, and synchronized AI knowledge-base documentation.

- Fixed MyLink shortcut countdown formatting so durations over 24 hours display days, hours, minutes, and seconds instead of an inflated total-hour value.

- Synchronized the eight locale files and `LanguageKey` to 2,970 direct string translation keys. Missing locale entries now exist in every language, using English fallback text or a key-name placeholder when no source translation exists.

## 2026-08-12

- Added store coupon management to the statistics page: shopper coupons load from the backend, a shared project popup creates new codes with expiry selected through the shared date-and-time picker, limits, phone assignment, bio visibility, and an optional discount cap, and existing coupons can update bio visibility. The complete coupon list and form are localized through typed keys in all eight supported languages.
- Added the shared collapsible statistics-card behavior to the coupon manager; the header toggles its content and grid span, while the Add Coupon button opens the popup without collapsing the card.
- Moved all coupon API orchestration and server state from `CouponManager` and `CreateCouponModal` into the store Statistics page; child components now receive data and action callbacks only.
- Added `isActive` and `isPrivate` coupon filters plus duplicate-safe `nextMaxId` query pagination from the last coupon ID through `useInfiniteScroll`; changing filters resets the coupon list and cursor.
- Replaced coupon infinite-scroll rendering with the shared slider; each slide displays two coupons and loads the next cursor page through the slider's `onReachEnd` callback.
- Adjusted coupon slides to display one information-dense coupon per slide for improved readability.

- Limited AI creator range sliders to two decimal places for both displayed and submitted values, including fractional controls such as Kling Out Painting.
- Updated the AI page's initial library load to show the shared full-page `Loading` component until the selected image or video history API completes; the initial request now follows the deep-linked library type.
- Added optional `/page/ai?type=1|2` deep-linking: `type=1` opens the image library and `type=2` opens the video library after the legacy router is ready.
- Completed localization of the active AI image/video workspace across all eight supported locales, including creator states, prompts, usage messages, result metadata values, notifications, and page metadata.
- Hardened generated-video thumbnail fallback so null, empty, or whitespace `imageUrl` values use `/cover-video.svg` in both library cards and the video detail modal.
- Added pending image/video generation cards to `/page/ai`: successful create requests return to the matching library immediately, and each loading card is replaced or removed by its correlated SignalR result.

## 2026-08-10

- Fixed the customer shop reload flash by keeping the shop page on its loading state while NextAuth restores the session, rendering the sign-in landing only after an unauthenticated result, and moving the current-index redirect into an effect.

## 2026-08-11

- Replaced the Market Properties Product popup's selected-thumbnail checkmarks with numeric badges showing the products' one-based saved order.
- Removed the user wallet item from the desktop sidebar and mobile hamburger menu while preserving the user wallet route and feature.
- Repositioned the user sidebar active indicator so ticket and setting align with their menu items after wallet removal.

## 2026-08-09

- Updated the link countdown to show full days for durations longer than 24 hours, using the format `Xd HH:MM:SS` while preserving `HH:MM:SS` for shorter durations.

- Fixed the Instagramer product-detail App Router wrapper by making it a client component, reading `tempId` with `useSearchParams`, and placing the client route content beneath Suspense. This prevents the server build from evaluating client-only session/context code and preserves legacy-page query handling.

- Fixed MyLink shortcut mouse clicks being intercepted by the carousel pointer handler when the shortcut row has no horizontal overflow; pointer dragging now starts only for scrollable rows.

- Fixed Market Properties shortcut actions always receiving `linkId` `1000`: menu options pass their link ID directly, and link-card clicks no longer bubble to the surrounding `pinContainer` handler that resets the selected link.

- Added a styled Market Properties Product popup selector with two radio options: showing the latest 10 products or showing best-selling products.
- Added two localization keys for this Product popup option selector and translated them across all supported locales (`en`, `fa`, `ar`, `fr`, `ru`, `tr`, `gr`, `az`).
- Replaced the Market Properties Product popup radio options with the `SelectProduct`-style thumbnail picker; it loads products with cursor scrolling, caps selection at ten IDs, and posts the selected ID array to `Shopper/Product/UpdateShowInBio`, including an empty array.
- Updated the Market Properties Product popup to load selected products from `Shopper/Product/GetBioProductList` and display selected thumbnails with a large centered check indicator.

- Updated the AI video library cards to render image thumbnails instead of inline playback, using each media `imageUrl` when available and a default `/cover-video.svg` fallback when it is missing.
- Added a generated-video detail modal that mirrors the generated-image modal structure; clicking a video card now opens the popup and plays the video with native controls (including audio) inside the modal.

- Updated the MyLink coupon feedback so `Copied` replaces the coupon code after a successful copy instead of appearing as a separate message.

- Added a static MyLink Products coupon header with a placeholder countdown, `BRANCY20` code, accessible copy action, and temporary copied feedback while the promotion backend contract is pending.

- Updated the MyLink feature menubar for free horizontal scrolling and active-item centering as the visible feature changes.
- Converted MyLink FeatureBox to a free horizontal carousel with native scrolling, mouse/pointer dragging, touch support, no snap points, and drag-click suppression.
- MyLink menubar activation now continues tracking the visible feature during manual page scrolling and smooth menu navigation.
- Stabilized MyLink active-feature detection around a viewport anchor to prevent menu activation from jumping between nearby sections.
- Added a permanent Home item for the MyLink menubar, initialized the page on `FeatureType.FeaturesBox`, and removed Contact's mount-time autofocus that could scroll the page away from the top.

- Preserved line breaks in MyLink last-video titles and descriptions, including text segments rendered alongside clickable links.
- Applied the MyLink last-video text presentation to online-stream titles and descriptions, including preserved line breaks, clickable title links, and consistent responsive line-height.

- Added a free horizontal MyLink shortcut carousel with native touch scrolling and mouse/pointer dragging. Desktop shortcut cards remain capped at 250px, while mobile collections with more than four shortcuts use 200px cards and suppress accidental redirects after dragging.

- Standardized MyLink typography across its CSS modules with shared fluid `clamp()` font tokens, replacing raw pixel sizes and reducing breakpoint-driven jumps between desktop, tablet, and mobile widths.

- Hardened MyLink lifecycle behavior: redirects now run from effects, asynchronous page loading ignores unmounted results, and the mutually exclusive terms, tariff, and business-hours dialogs now use one modal state.
- Optimized MyLink rendering and media controls: feature rendering uses a memoized lookup map, product search/filter/sort work is deferred and memoized, keyboard carousel navigation is RTL-aware, and live-stream global listeners are lifecycle-cleaned.
- Improved authenticated MyLink metadata and accessibility by restoring browser zoom, applying `noindex, nofollow`, adding keyboard focus styles, and honoring reduced-motion preferences for product and live-stream movement.

- Standardized the shared SwitchButton while preserving its existing import path and controlled API: the native checkbox remains keyboard-accessible, accepts standard input and ARIA props, provides a 44px touch target, supports valid switch semantics, RTL thumb direction, disabled/focus-visible states, reduced motion, and forced colors.

- Standardized the shared IncrementStepper while preserving its `data`, `increment`, and `decrement` callback API: it now uses semantic buttons with keyboard support, pointer-captured press-and-hold repetition, stale-value-safe decrement handling, click suppression after a long press, 44px touch targets, fluid sizing, and reduced-motion/forced-colors fallbacks. Optional `disabled`, `className`, accessible-label, and per-direction label props are available.
- Added manual integer entry to IncrementStepper. The new optional `onValueChange`, `min`, and `max` props commit validated values on blur or Enter; all current quantity, lottery, and discount consumers now preserve their existing limits during direct entry.

- Standardized the shared CheckBoxButton while retaining its existing controlled API and import path: the native checkbox is now keyboard-focusable through visual hiding, accepts native ARIA/input attributes, honors `className` and `title`, provides a 44px touch target, and supports visible focus, disabled, reduced-motion, and forced-colors states.

- Standardized the shared TextArea with native textarea props and backward-compatible legacy aliases, reliable RTL/LTR direction, bounded auto-resize, responsive accessible focus styles, reduced-motion/forced-colors support, and a 16px mobile font-size floor that prevents focus zoom.

- Standardized the shared DotMenu with native button/menu semantics, keyboard navigation, focus restoration, Escape and outside-pointer close behavior, responsive touch targets and viewport-bounded menu sizing, RTL-aware placement, reduced-motion/forced-colors support, stable option keys, and option-style rendering. The existing `data`, `handleClickOnIcon`, and `menuPosition` props remain backward compatible alongside `options`, `onOptionSelect`, and `placement`.

- Fixed customer shop, product-detail, and saved-product cards for nullable product titles and discount prices, including safe regular-price fallbacks and string product ID comparison.
- Added missing CSS-module state selectors used by the customer shop filters and navigation.

- Market Properties no longer shows the edit-options three-dot control on the Products feature card.

## 2026-08-06

- Cleaned the MyLink product module by removing unused visibility state, legacy markup styles, and obsolete search/coupon CSS.
- Converted MyLink product cards to a free horizontal carousel with touch scrolling, mouse/pointer drag support, no wrapping or snap points, and protection against opening a product link after dragging.
- Made MyLink product cards responsive with smaller mobile widths, square thumbnails, and two-line ellipsis truncation for long product names.
- Added responsive MyLink product controls: Best Sellers and Best Discounts sorting toggles, a flex-growing product/PID search field, and a Show All Products reset button that stacks on small screens.
- Fixed AI media-creator range inputs by allowing fractional steps; backend ranges such as `0` through `0.8` no longer lock at zero because of HTML's default step of `1`. Input types and bounds remain normalized before rendering.

## 2026-08-07

- Improved the shared FlexibleToggleButton with native button semantics, `aria-pressed`, optional group labeling, disabled support, keyboard focus styling, responsive touch targets, RTL-aware unread indicators, reduced-motion support, and forced-colors fallback.
- Added a shared animated active indicator to FlexibleToggleButton that glides to the selected option while preserving the existing controlled API.
- Standardized FlexibleToggleButton CSS module class names and removed the render-time warning/empty render restriction for option counts outside the former 2-to-4 range; an empty options list still renders nothing.

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
- Registered `Instagramer/MediaAi/GetVideos` and added a paginated video library with native playback, metadata cards, loading/empty states, and cursor-based infinite scrolling.
- Connected video creation submissions to `Instagramer/MediaAi/CreateVideo` while retaining the shared creator payload and client-context query.
- Updated `MediaCreator` for media-neutral submit props, video-specific labels and states, and correct video creator retry behavior.
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
