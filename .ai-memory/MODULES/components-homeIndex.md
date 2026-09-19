# components/homeIndex

## Purpose

Component module for homeIndex UI and feature concerns.

## Business Purpose

Supports Brancy homeIndex workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/homeIndex/.

## Execution Flow

Execution starts from imports, route rendering, or helper calls depending on the module.

## Data Flow

Data enters through props, Next route params, session state, browser state, or backend API responses.

The `IngageInfo` profile tile renders its `status` area from an ordered status map. Active entries are sorted by an explicit priority where `1` is highest and `10` is lowest: the 24-hour first-login synchronization notice, the subscription warning when `packageExpireTime` has fewer than seven days remaining, shopper, influencer, and finally the role-upgrade prompt. The warning also displays the rounded-up number of remaining subscription days. When multiple entries are active, the tile displays manual previous/next slideshow controls and resets to the highest-priority entry whenever the active set changes. The first-login timestamp is retained in the existing `first-login-date` localStorage key and the synchronization state exposes a live countdown and progress bar.

The PageDetail demographic section titles display the localized `home_Last30Days` label in parentheses, indicating that gender, age, and location insights cover the last 30 days.

The home page owns the shared smart page-analysis modal and renders it at page level with the current `pageSummary` through `AccountSummary`. `IngageInfo` exposes the tile click and keyboard activation through a callback and displays the localized relative summary time from `pageSummary.createdTime`; the modal can be closed with its close button or the shared backdrop behavior.

`IngageInfo` loads the current AI feature details for the authenticated session and displays the remaining AI token total by combining the unused counts from the regular and reserve AI features.

The home upgrade tile is a two-slide accessible slideshow. Its first slide shows remaining AI tokens with the light-yellow backdrop and active pagination color; its second slide shows remaining subscription days using the live package expiry countdown with the dark-yellow backdrop and active pagination color. Pagination buttons switch the icon, description, and value without triggering the tile's upgrade action, while clicking or keyboard-activating the tile body still opens the upgrade route.

The home total-tile area uses separate accessible slideshows: the upgrade tile contains reserve tokens and remaining subscription days, while a separate statistics tile contains active stories, last likes, reach, and unread comments. Both slideshows advance automatically every 10 seconds while retaining manual pagination. The story, like, reach, and comment slides use purple, light green, firoze, and light red respectively, and story links stop propagation so opening a story does not trigger the statistics tile action.

`IngageInfo` derives its loading state from whether home tile data has arrived. It must not use `LoginStatus(session)` as a persistent loading flag, because an authenticated session returns `true` and would keep the full-page loader visible indefinitely.

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

components/homeIndex/.

## Related Modules

Parent module: `components`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-07-19

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
