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
The shared creator submit handler sends image requests to `/api/mediaai/CreateImage` and video requests to `/api/mediaai/CreateVideo`, preserving the same serialized inputs and client-context query.
When a create request starts, the page returns to the matching image or video library and renders a pending card keyed by `clientContext` before waiting for the API response, preventing fast SignalR results from being missed. Failed API requests roll the card back. The pending card is replaced by the matching SignalR success result, or removed when a matching failure notification arrives; multiple concurrent generations are supported.
The shared creator component uses media-neutral submit/loading props and switches its empty/error states, model label, prompt guidance, token-check text, and submit label for image or video mode. Video creator retry requests `GetVideoCreators`.

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
