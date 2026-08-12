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

`tools/popups/lottery/selectPost.tsx` applies `useInfiniteScroll`'s `hasMore` result for every page response. An empty final post page therefore disables further automatic container fetches while retaining the already rendered thumbnails.

`posts/postContent.tsx` displays a compact, non-interactive, accessible shopping-bag SVG badge beside the top post number when its `shopMediaProductType` is `ShopMediaProductType.Instance`, identifying posts that represent a shop product without changing the card's navigation or overflow-menu behavior.

`components/page/ai/ImageCreator.tsx` renders the image-creation workspace and provides an internal back link to the `/page/ai` creations library. Its hierarchy is `IImageCreator[]` providers, each provider's `inputModels`, and each model's `inputModelTypes`. Multiple providers are presented as responsive logo cards with model counts; selecting one atomically selects its first model, and changing either provider or model resets prompt, dynamic values, and token usage even when different providers reuse the same model name. Providers without models are excluded from selection. The component dynamically renders text, enum, number, range, boolean, image-array, and video-array controls from the selected model contract. Input-type values are normalized with `Number` because backend responses may encode enum values such as Range (`3`) as strings. Range controls normalize invalid backend bounds, clamp their controlled value, and use `step="any"` so fractional backend ranges such as `0` through `0.8` are draggable instead of being locked by HTML's default step of `1`. Media-array controls upload selected files through `UploadFile`; only successful backend `fileName` values are retained in each input's string-array state, while `showUrl` is kept separately for image/video previews. Sequential upload progress is shown, and selections beyond the model's `maxArrayLength` trigger `InternalResponseType.ExceedPermittedUploadMedia`. The primary action first posts the selected creator key, model name, prompt, and serialized option values to `GetImageUsage`; after displaying the returned token count it changes to the pending `Create image` action. Any input change invalidates the previous estimate.

`components/page/ai/GeneratedImageModal.tsx` provides the generated-image result content, including the preview, prompt, metadata, technical details, close action, and image download action. Its exported `parseImageMetadata` converts JSON-object metadata strings into reusable, human-readable key/value items; invalid JSON and non-object values retain the modal's plain-text fallback. The `/page/ai` history cards reuse this parser so summary and detail metadata stay consistent. Downloads use the resolved client media URL and the shared blob-based `DownloadImage` helper. The component does not own the shared modal wrapper or visibility state; page owners render it inside `components/design/modal` following the same page-owned modal pattern as `NotFeature`. Its responsive styles remain in `ImageCreator.module.css`.

`components/page/ai/GeneratedVideoModal.tsx` provides the generated-video result content using the same modal structure and metadata presentation rules as `GeneratedImageModal`. It renders native `video` playback with controls and audio when `videoUrl` exists, falls back to a preview image when it does not, and uses `/cover-video.svg` whenever a media item has no `imageUrl`.

`components/page/ai/VideoList.tsx` now renders clickable thumbnail cards instead of inline playback. Each card uses the media `imageUrl` preview when available, or `/cover-video.svg` as a fallback, and opens the page-owned generated-video modal for playback and details.
`components/page/ai/ImageList.tsx` and `VideoList.tsx` also render non-interactive pending-generation cards with a loader and prompt while the page waits for a matching MediaAi SignalR notification.

The active AI components use direct i18next keys for visible creator, library, modal, upload, accessibility, metadata fallback, and pending-generation text. `parseImageMetadata` accepts an optional translator so shared history cards and result modals render boolean and null metadata values in the active locale.

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
