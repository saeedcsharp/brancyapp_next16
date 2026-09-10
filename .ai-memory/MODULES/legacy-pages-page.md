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

The `/page/ai` landing implementation is an Image/Video segmented workspace. Image mode requests successful image history from `/api/mediaai/GetImages` with `mediaCreationStatus=2`, renders responsive preview cards with shared parsed metadata, opens `GeneratedImageModal` for full details and downloads, and uses `nextMaxId` with `useInfiniteScroll` to append deduplicated pages. Video mode requests successful history from `/api/mediaai/GetVideos`, renders clickable thumbnail cards (media `imageUrl` or `/cover-video.svg` fallback), opens `GeneratedVideoModal` for native playback/details, and uses independent cursor pagination through `useInfiniteScroll`.
The `/page/ai` App Router wrapper reads the optional `type` query with `useSearchParams` and passes valid values into the legacy page: `type=1` selects the image tab and `type=2` selects the video tab. Missing or unsupported values retain the default image tab; the legacy router remains a fallback for direct legacy navigation.
During the initial selected-library request, the page renders the shared `components/notOk/loading` full-page loader until the image or video history API completes. Pagination and creator loading retain their local loading UI instead of replacing the whole page.
The shared creator submit handler sends image requests to `/api/mediaai/CreateImage` and video requests to `/api/mediaai/CreateVideo`, preserving the same serialized inputs and client-context query.

The `/page/tools` legacy page renders the `hashtagManager` card instead of separate saved-hashtag and trend/search-hashtag cards. The manager owns the shared header, its expanded/collapsed state, and `ToggleButton`; it passes the existing list callbacks and data into the selected hashtag view, so only the active view is mounted when the card is open.
When a create request starts, the page returns to the matching image or video library and renders a pending card keyed by `clientContext` before waiting for the API response, preventing fast SignalR results from being missed. Failed API requests roll the card back. SignalR success results are added even after a page remount when no local pending card exists, with duplicate `id`/`clientContext` protection; matching pending cards are replaced, and matching failure notifications remove them. Multiple concurrent generations are supported.
The shared creator component uses media-neutral submit/loading props and switches its empty/error states, model label, prompt guidance, token-check text, and submit label for image or video mode. Video creator retry requests `GetVideoCreators`.

The AI workspace keeps the Image/Video `mediaTabs` visible as the primary navigation inside the creator's model panel. The selected media creator and its model controls are rendered there, followed by the matching image or video library; creator model data is loaded independently for each media type. When no model is available, the model panel retains only the media tabs and the localized empty state is shown in the settings panel. The former header Create button and create-only page mode were removed. The page owns the media-creation loading state, enabling it before feature validation and keeping the creator action disabled until the correlated create-image or create-video SignalR success or failure notification returns.

The `/page/ai` controller localizes its page metadata and generation request/failure notifications through the active i18next locale, while the shared creator and result components provide the remaining AI workspace translations.

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
