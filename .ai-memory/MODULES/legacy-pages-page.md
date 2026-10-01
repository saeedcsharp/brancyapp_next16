# legacy-pages/page

## Purpose

Legacy page module for page routes and workflows.

## Business Purpose

Preserves existing Brancy page feature behavior during App Router migration.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

legacy-pages/page/.

## Execution Flow

Execution starts from imports, route rendering, or helper calls depending on the module.

## Data Flow

Data enters through props, Next route params, session state, browser state, or backend API responses.

The image creation implementation loads available image creators from `/api/mediaai/GetImageCreators` after the NextAuth session is ready, then passes the response to the shared image creator component. Failed requests expose a retry state. Generation requests create and send a stable `clientContext`; matching successful SignalR notifications open the page-owned shared `Modal` with `GeneratedImageModal` as its content, while matching failures use the notification system.

The `/page/ai` landing implementation is an Image/Video segmented workspace. Image mode requests successful image history from `/api/mediaai/GetImages` with `mediaCreationStatus=2`, renders responsive preview cards, opens `GeneratedImageModal` for full details and downloads, and uses `nextMaxId` with container-based `useInfiniteScroll` to append deduplicated pages when the history list reaches its end. Video mode requests successful history from `/api/mediaai/GetVideos`, renders clickable thumbnail cards (media `imageUrl` or `/cover-video.svg` fallback), opens `GeneratedVideoModal` for native playback/details, and uses independent container-based cursor pagination through `useInfiniteScroll`. `PageAI` owns all modal close state, and the result modals share neutral timestamp/metadata formatting through `generatedMediaHelpers.ts`.
The `/page/ai` landing implementation is an Image/Video segmented workspace. Image mode requests successful image history from `/api/mediaai/GetImages` with `mediaCreationStatus=2`, renders responsive preview cards with shared parsed metadata, opens `GeneratedImageModal` for full details and downloads, and uses `nextMaxId` with `useInfiniteScroll` to append deduplicated pages. Video mode requests successful history from `/api/mediaai/GetVideos`, renders clickable thumbnail cards (media `imageUrl` or `/cover-video.svg` fallback), opens `GeneratedVideoModal` for native playback/details, and uses independent cursor pagination through `useInfiniteScroll`; the video hook shares the mounted workspace ref so short result sets can automatically request the next cursor page.
The `/page/ai` App Router wrapper reads the optional `type` query with `useSearchParams` and passes valid values into the legacy page: `type=1` selects the image tab and `type=2` selects the video tab. Missing or unsupported values retain the default image tab; the legacy router remains a fallback for direct legacy navigation.
During the initial library request, the page returns the shared `components/notOk/loading` full-page loader until the selected history is available. `PageAI` owns the Images/Videos library filter: `/api/mediaai/GetImages` is requested and paginated only for Images, and `/api/mediaai/GetVideos` only for Videos. Each history loads once, when its filter is first selected. Pagination and creator loading retain their local loading UI instead of replacing the whole page.
The shared creator submit handler sends image requests to `/api/mediaai/CreateImage` and video requests to `/api/mediaai/CreateVideo`, preserving the same serialized inputs and client-context query.

The `/page/tools` legacy page renders the `hashtagManager` card instead of separate saved-hashtag and trend/search-hashtag cards. The manager owns the shared header, its expanded/collapsed state, and `ToggleButton`; it passes the existing list callbacks and data into the selected hashtag view, so only the active view is mounted when the card is open.
When a create request starts, the page returns to the matching image or video library and renders a pending card keyed by `clientContext` before waiting for the API response, preventing fast SignalR results from being missed. Failed API requests roll the card back. After the create API accepts the request, the creator form resets and its submit action is available for another generation while the pending card remains. SignalR success results are added even after a page remount when no local pending card exists, with duplicate `id`/`clientContext` protection; matching pending cards are replaced, and matching failure notifications remove them. Multiple concurrent generations are supported.
The shared creator component uses media-neutral submit/loading props and switches its empty/error states, model label, prompt guidance, token-check text, and submit label for image or video mode. Video creator retry requests `GetVideoCreators`.
The `/page/ai` controller caches the AI entitlement result from `/api/feature/hasFeature` in `sessionStorage` per account and selected Instagramer index, so a browser reload does not repeat the `hasFeature` request. An in-flight promise ref also deduplicates concurrent checks during the initial creator mount.
The creator's primary action is backed by a real form submit, allowing the page-owned `onCreateMedia` callback to run for valid image and video requests.

The AI workspace keeps only the Images/Videos `mediaTabs` visible as the primary Create navigation. Both modes retain the selected creator, model controls, matching media library, independent creator loading, and existing request lifecycle. The local-only `CharacterSheet` Visual Identity prototype is no longer rendered by this page; it is available independently at `/dev/characterSheet`.

The AI workspace uses a two-column layout above `840px`: the history panel stays at or below `400px` and the creator panel takes the remaining width. At `840px` and below, the creator panel moves above the history panel and both panels use the available page width.

When the AI feature entitlement check fails, the page passes that state to `MediaCreator`, which renders `NotFeature` inline in the creator panel instead of mounting the former feature-unavailable modal. Other page-owned modals for prompts and generated media remain unchanged.

The `/page/ai` controller localizes its page metadata and generation request/failure notifications through the active i18next locale, while the shared creator and result components provide the remaining AI workspace translations.

The `/page/ai` controller owns the AI model-picker modal and the image/video model selections. `MediaCreator` renders the trigger and receives the page-owned selection callbacks, allowing the picker to use the page's full-screen modal presentation.

The model picker content provides category tabs within each expanded creator branch in card view. Category selection only changes the visible card subset; table view remains unfiltered, while model selection continues to update the page-owned selection and close the modal.

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

legacy-pages/page/.

## Related Modules

Parent module: `legacy-pages`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

The create-post page no longer includes the duplicate local content-size tooltip; the shared `Tooltip` component remains the source for that information.

The create-story image upload path sends the original (or HEIC-converted) `File` directly to `UploadFile`, using `FileReader` only for preview. It does not compress, crop, or resize image dimensions, which keeps the upload compatible with iOS Safari and preserves the selected media dimensions.

New stories expose the same date/time picker and recommended publish-time choices as create-post. The controls are available while `preStoryId <= 0`; existing pre-stories remain read-only.

Story video validation now uses a dedicated localized warning when duration is below the three-second minimum; the existing duration-limit warning remains for videos longer than 60 seconds.

Create-story and create-post data loading tracks a query-derived key instead of locking after the first render. Draft and pre-item queries that arrive after the router becomes ready now trigger their corresponding API request without requiring a reload.

The create-post single-video cover upload converts HEIC selections before image validation, preview generation, and `UploadFile`. It reads dimensions after the converted preview loads, preserves the selected dimensions without compression or cropping, and resets the upload loading state when the request completes or fails.

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
