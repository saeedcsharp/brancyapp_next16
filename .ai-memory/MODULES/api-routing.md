# API Routing And Backend Map

## Purpose

Documents backend route mapping and API client behavior.

## Business Purpose

Connects frontend features to Brancy backend domains.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

`helper/apiRouteMap.ts`, `helper/clientFetchApi.ts`, `app/api/_lib/proxy.ts`.

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

Wallet mappings include `/api/wallet/getBallanceHistory` to `Business/Wallet/GetBallanceHistory`; the backend contract intentionally uses the `Ballance` spelling. `/api/wallet/setDefaultCard` maps to `Business/Wallet/SetDefaultCard` and accepts the selected card number as a query parameter.

Product bio visibility maps `/api/product/updateShowInBio` to `Shopper/Product/UpdateShowInBio` and accepts a POST body containing the selected product ID array, including an empty array when no products are selected.

Image history maps `/api/mediaai/getImages` to `Instagramer/MediaAi/GetImages`. The AI landing page calls it with `mediaCreationStatus=2` for successful creations and an initially empty `nextMaxId`; subsequent infinite-scroll requests send the cursor returned by the previous response. Image creator discovery maps `/api/mediaai/getImageCreators` to `Instagramer/MediaAi/GetImageCreators` and is called directly by `clientFetchApi` with the active Instagramer session headers. Token estimation maps `/api/mediaai/getImageUsage` to `Instagramer/MediaAi/GetImageUsage` and uses a POST body with `creatorKey`, model `version`, serialized dynamic `inputs`, and `prompt`; its successful value is the numeric token usage.
Video history maps `/api/mediaai/getVideos` to `Instagramer/MediaAi/GetVideos`. The AI landing page uses the same successful-status filter and cursor pagination contract as image history, returning `items` with `videoUrl` media paths.
Media creation submits the shared creator payload to `/api/mediaai/createImage` or `/api/mediaai/createVideo` based on the active creation tab, with the generated `clientContext` query used for notification correlation.

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

`helper/apiRouteMap.ts`, `helper/clientFetchApi.ts`, `app/api/_lib/proxy.ts`.

## Related Modules

See `MODULE_INDEX.md`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-07-26

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
