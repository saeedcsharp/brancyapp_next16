# components/page

## Purpose

Component module for page UI and feature concerns.

## Business Purpose

Supports Brancy page workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/page/.

## Execution Flow

Execution starts from imports, route rendering, or helper calls depending on the module.

## Data Flow

Data enters through props, Next route params, session state, browser state, or backend API responses.

The lottery `TermsAndConditionWinnerPicker` generates both uploaded Terms image files at the verified Instagram Story canvas size of `1080x1920`. The selected background preview is constrained separately in CSS to thumbnail dimensions, so the UI preview does not affect upload resolution.

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

`tools/hashtagManager/hashtagManager.tsx` owns the single `hashtagManager` card on `/page/tools`. It uses the shared `ToggleButton` to switch between the saved `Hashtags` view and the `TrendHashtags` view, and owns the card's expanded/collapsed state. The shared header exposes the expanded state through `aria-expanded`, hides the manager content, and changes the masonry row span from `82` to `10` while collapsed. The two hashtag views render their content directly inside this standard manager structure and do not own a card-collapse state.

`tools/popups/lottery/selectPost.tsx` applies `useInfiniteScroll`'s `hasMore` result for every page response. An empty final post page therefore disables further automatic container fetches while retaining the already rendered thumbnails.

`posts/postContent.tsx` displays a compact, non-interactive, accessible shopping-bag SVG badge beside the top post number when its `shopMediaProductType` is `ShopMediaProductType.Instance`, identifying posts that represent a shop product without changing the card's navigation or overflow-menu behavior.

`components/page/ai/ImageCreator.tsx` renders the image-creation workspace and provides an internal back link to the `/page/ai` creations library. Its hierarchy is `IImageCreator[]` providers, each provider's `inputModels`, and each model's `inputModelTypes`. Multiple providers are presented as responsive logo cards with model counts; selecting one atomically selects its first model, and changing either provider or model resets prompt, dynamic values, and token usage even when different providers reuse the same model name. Providers without models are excluded from selection. The component dynamically renders text, enum, number, range, boolean, image-array, and video-array controls from the selected model contract. Input-type values are normalized with `Number` because backend responses may encode enum values such as Range (`3`) as strings. Range controls normalize invalid backend bounds, clamp their controlled value, and use `step="any"` so fractional backend ranges such as `0` through `0.8` are draggable instead of being locked by HTML's default step of `1`. Media-array controls upload selected files through `UploadFile`; only successful backend `fileName` values are retained in each input's string-array state, while `showUrl` is kept separately for image/video previews. Sequential upload progress is shown, and selections beyond the model's `maxArrayLength` trigger the localized `InternalResponseType.ExceedPermittedUploadMedia` warning that the media count exceeds the permitted limit. The primary action first posts the selected creator key, model name, prompt, and serialized option values to `GetImageUsage`; after displaying the returned token count it changes to the pending `Create image` action. Any input change invalidates the previous estimate.
`components/page/ai/mediaCreator.tsx` renders fractional range values with two decimal places and rounds submitted range changes to the same precision. When a selected model exposes multiple Range inputs, those inputs are presented as one `250px` square expansion control with a fixed centered `100px` inner square. The top, right, bottom, and left edge handles support mouse and touch pointer dragging from the moving outer edge of one shared hatched frame; the frame is drawn from all four edge values, including its corners, while the rest of the outer square remains plain. The UI combines the controls only visually; each original input key and value is still serialized separately for usage estimation and creation requests.
The media creator prompt includes an accessible paste button that reads plain text from the browser Clipboard API, updates the controlled `TextArea`, and clears any previous token-usage estimate.
The square expansion control is used only when the model exposes Range inputs whose keys include `topExpantionRatio`, `buttonExpantionRatio`, `rightExpantionRatio`, and `leftExpantionRatio` (case-insensitive). A model with an incomplete or differently named range combination renders each Range input as the standard single-axis slider.
The current value for each side is displayed inside the fixed inner square beside its corresponding side, rather than in the control header.
Each edge handle uses a directional two-second outward shadow pulse to indicate that it can be dragged away from the fixed inner square; the pulse is disabled for reduced-motion users.

`components/page/ai/popup/generatedMediaHelpers.ts` owns shared generated-media timestamp formatting, JSON-object metadata parsing, and the complete reusable prompt code-block renderer. It exports `PromptCodeBlock`, `renderPromptLine`, layout style objects, and inline token styles for JSON keys, strings, primitives, punctuation, bold markdown, and bracket placeholders, so prompt rendering does not depend on the image-suggestions CSS module. Invalid JSON and non-object metadata retain each modal's plain-text fallback, while null and boolean values use the current translator. `GeneratedImageModal.tsx` owns only generated-image preview, prompt, technical details, and download rendering; `GeneratedVideoModal.tsx` owns the video equivalent with native playback. Both are rendered inside page-owned `components/design/modal` wrappers, so visibility and close state remain in `PageAI`. Their responsive styles are shared in `Modal_Generated.module.css`.

`components/page/ai/GeneratedVideoModal.tsx` provides the generated-video result content using the same modal structure and metadata presentation rules as `GeneratedImageModal`. It renders native `video` playback with controls and audio when `videoUrl` exists, falls back to a preview image when it does not, and uses `/cover-video.svg` whenever a media item has no `imageUrl`.

`components/page/ai/VideoList.tsx` now renders clickable thumbnail cards instead of inline playback. Each card uses the media `imageUrl` preview when available, or `/cover-video.svg` as a fallback, and opens the page-owned generated-video modal for playback and details.
`components/page/ai/ImageList.tsx` and `VideoList.tsx` also render non-interactive pending-generation cards with a loader and prompt while the page waits for a matching MediaAi SignalR notification.

`List_Image.tsx` and `List_Video.tsx` share a focused `List.module.css` stylesheet containing only generated-media grid, card, pending, empty-state, and pagination-loader styles; legacy profile-card, creator-header, tab, and unused metadata rules are removed.

The active AI components use direct i18next keys for visible creator, library, modal, upload, accessibility, metadata fallback, and pending-generation text. `parseImageMetadata` accepts an optional translator so shared history cards and result modals render boolean and null metadata values in the active locale.

`MediaCreator` renders the AI Images and Videos tablist with the shared `ToggleButton` at the top of its single settings panel. The page renders `MediaCreator` and the matching library for image/video modes, so the tab control no longer exposes a separate Create button. When no creator/model is available, the settings panel retains the media tabs and renders the localized state message below them.

`components/page/ai/CharacterSheet.tsx`, rendered by `app/dev/characterSheet/page.tsx`, owns the independent Character Sheet Visual Identity UI. It reuses the media creator's outer container and action-bar structure while keeping its own responsive CSS module and local state. Advanced mode has eight steps for type, identity references, structure, details, views, style, consistency, and review; Auto mode reduces this to type, identity, style, and review. Identity-specific field schemas cover Human, Product, Object, Animal, and Custom subjects. Browser-selected references use object URLs only and are revoked on removal or unmount.

The Character Sheet surface is deliberately a frontend prototype. Auto-Define only reveals the proposed analysis fields, Generate sheet only reveals a local presentation preview, and consistency scores are fixed display data. There are no imports from API helpers, no upload call, no session dependency, no persistence, and no real analysis, generation, regeneration, publishing, versioning, or billing behavior.

When the AI feature check reports that generation is unavailable, `MediaCreator` renders the shared `NotFeature` upgrade state directly inside that empty state panel; the page no longer opens a separate feature-unavailable modal. A normal creator request still renders the shared `Loading` component until data arrives.

`MediaCreator` renders the media tabs, provider selection, and model selection at the top of one settings panel. Each provider is an expandable branch with its models nested below it; selecting a provider opens its branch and selects its first model. Empty or error states keep the same single-panel layout, with the media tabs above the localized state content.
The AI model section now uses `components/page/ai/popup/AiModelList.tsx`: the settings panel shows the selected creator/model as one trigger, while `PageAI` owns the shared full-screen `Modal` and renders the exported `AiModelListContent`. Only the active creator branch reveals its models; selecting a model updates the page-owned creator/model state and closes the modal.

Each model row in `AiModelList` also displays the localized, de-duplicated titles of that model's `inputModelTypes` inside the existing `IDgray` metadata label; long lists are truncated visually while remaining available through the label tooltip and accessible name. Known operation labels such as text-to-video, image-to-video, text-to-image, edit, extend, and reference-to-video use compact inline SVG icons in both card and table views, while their original labels remain available as accessible names and tooltips.

The AI model modal header includes a Features toggle. It reveals or hides all model feature-label groups with an opacity, visibility, and height animation, and disables hidden labels for pointer and assistive interaction.

The AI model modal header also includes a Table toggle. It switches the active creator's model list between the existing card grid and a horizontally scrollable semantic table without changing selection behavior.

The semantic model table supports ascending and descending sorting by category, model name, price, cost level, and visible feature labels through clickable and keyboard-accessible headers.

Each expanded AI creator branch in card view now shows a horizontal row of unique category buttons. Selecting a category filters the cards below it; the table view keeps its full model list and existing sorting behavior. Opening a creator selects its current model category or the first available category for card view.

Model cost indicators use the existing design tokens by level: one dollar is light green, two are light yellow, three are light red, and four are dark red.

`MediaCreator` removes duplicate models returned for the same provider by model name before rendering, keeping the model selector and its React keys unique while preserving the existing name-based selection and request contract.

`imagePromptSuggestions.module.css` contains only the selectors consumed by `imagePromptSuggestions.tsx` for prompt suggestion cards, category filtering, and prompt details; copied media-creator, model, upload, range, and token styles were removed without changing component behavior.

`imagePromptSuggestions.tsx` renders its category filter as adjacent accessible tag buttons; the first button represents all categories and shows the sum of returned category counts, each backend category shows its own count, the row supports touch and mouse-drag horizontal scrolling without swallowing normal button clicks, and selecting a category clears the prior list while stale prompt responses are ignored.

The image prompt suggestion thumbnails use a responsive CSS-column masonry layout; each image keeps its natural aspect ratio instead of being cropped to a fixed height.

`ImagePromptDetail` presents the selected prompt in a responsive two-column top section with the preview image on the left and title, description, and metadata on the right. The copyable prompt body is rendered as a separate full-width section below those columns and stacks responsively on narrow screens.

`ImagePromptDetail` opens its preview image in a body-portal fullscreen overlay on click. The overlay can be dismissed with its close button, backdrop click, or Escape key, while the parent prompt modal remains open.

`ImagePromptDetail` exposes an `onBack` callback rendered as a localized back icon button; the AI page clears the selected prompt through that callback to return to the suggestions list.

`ImagePromptDetail` also exposes a localized Use in prompt action. The AI page sends the selected prompt body to `MediaCreator` through a keyed `promptToUse` value, where the controlled prompt textarea updates and clears any previous token estimate before the detail modal closes.

`ImagePromptDetail` initially shows the first ten non-empty newline-delimited lines of the selected prompt and omits blank lines from the code block. When more lines exist, localized Show more/Show less controls toggle the complete prompt while preserving the copy and Use in prompt actions. The image prompt list and detail share one modal; clearing the selected prompt through the back action returns to the list without closing the modal.

`ImagePromptDetail` renders the visible prompt inside a numbered, scrollable code block. JSON keys, strings, primitives, punctuation, markdown bold labels, and complete `[xxx]` bracket placeholders receive distinct design-token styles, including when a placeholder is inside a JSON string, without changing the raw prompt used by copy or Use in prompt.

`MediaCreator` renders both backend enum input variants (`EnumV1` and `EnumV2`) as the shared `optionGrid` button selector, with the selected value represented by `optionActive`; required values remain guarded by the existing form validation. `InputType.IntRange` renders as a standard slider with integer values and `step="1"`, and is not included in the four-direction square expansion control. `InputType.AudioArray` uses the shared sequential file-upload flow, accepts audio files, and renders uploaded previews with native audio controls.

When an enum input is identified as Aspect Ratio, option values in the `width:height` format also show a proportional inline SVG outline beside the text. The icon is scaled so neither dimension exceeds 15 pixels; other enum options and invalid ratio labels remain text-only.

`MediaCreator` keeps the dynamic input JSX inside its main settings-panel `return`. Upload previews, upload progress, and square-range dragging are owned by `MediaCreator`, so media, boolean, enum, range, number, and text controls render inline without separate child renderer components.

`MediaLibrary` combines successful image and video history into one `createdTime`-descending grid with a shared `DragDrop` All, Images, and Videos filter. Image and video cursor pagination remain independent, and pending generations follow the selected filter.
The media history `DragDrop` uses the existing localized `toggleShowAll` key for its All option.

The shared history list owns the `useInfiniteScroll` container ref and uses container scrolling for both image and video pagination, so reaching the end of the constrained list requests the next non-null backend cursor.

`MediaLibrary.module.css` contains only styles used by `MediaLibrary.tsx` for its loading state, history rows, pending-generation preview, pagination loader, and empty state; obsolete layout selectors and duplicate declarations were removed.

Media creator inputs use a non-null backend `defaultValue` as their initial controlled value after normalization for the declared `inputType`; null values retain the existing type-specific defaults, and all initialized values remain editable through the existing controls.

The AI creator usage control uses the `tokenBalance` and `tokenBalanceDisable` CSS-module states. After a successful estimate, the control is replaced by the token progress panel, which includes an accessible refresh icon that calls the usage endpoint again and rotates only while that request is loading; changing prompt or dynamic inputs clears the estimate and restores the button.

The AI creator loads the account's total AI feature count from `Instagramer/Feature/GetTotalFeatureCount` through the shared `getTotalFeatureCount` helper with `PsgFeatureType.AI`, and renders the requested usage as a hatched progress-bar fill with numeric total/requested labels. The usage button calculates the estimate, uses the shared `saveButton` style while available, and switches to `cancelButton` while its existing disabled conditions apply. The usage button and progress panel sit side by side on larger screens and stack vertically on mobile. Dynamic input fields use responsive `auto-fit` columns with a controlled minimum width, allowing additional fields per row on wide screens. The create button is independent of usage estimation: it only requires a valid prompt and required inputs, and passes the existing estimate when available or zero otherwise to the parent feature check before submitting the unchanged backend create request. The creator controls are hosted by an actual form so the primary submit button reaches the existing submit handler. It uses `saveButton` when enabled and `cancelButton` when disabled; while a creation request is pending, it is disabled and the form submit guard ignores duplicate submissions.

Provider branches use `public/down-arrow.svg`; the arrow rotates 180 degrees for the open provider. Model lists stay mounted to animate open/closed with opacity, visibility, and max-height transitions, while closed model buttons are removed from keyboard tab order. Reduced-motion users receive an immediate state change.

Removed obsolete `MediaCreator` CSS for the former standalone page header, back link, section heading, creator-panel layout, copied prompt suggestions, provider/model list, generic fields, and upload label. Result modal selectors are isolated in `Modal_Generated.module.css`; `mediaCreator.module.css` now contains only styles consumed by `mediaCreator.tsx`.

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

components/page/.

## Related Modules

Parent module: `components`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-08-12

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
