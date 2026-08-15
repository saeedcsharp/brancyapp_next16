# helper

## Purpose

Shared helper and service adapter functions.

## Metadata

Priority: Critical

Business Impact: High

AI Reading Priority: 1

Source Of Truth: `helper/clientFetchApi.ts`, `helper/apiRouteMap.ts`, `helper/apiBaseUrl.ts`

Depends On: backend API contracts, auth/session helpers, localization helpers

Used By: Most routes, components, and feature flows

Change Impact: API wiring, formatting, media handling, proxy behavior, and shared utility behavior

## Business Purpose

Centralizes API calls, route maps, formatting, media processing, localization detection, timers, drafts, and utility behavior.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

`helper/` contains 45 helper files.

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

- `findDayName` maps a `BusinessDay` value to a typed `LanguageKey`; UI callers must pass that key through `t(...)` before rendering it.
- `helper/counterDownHelper.ts` calculates countdowns with separate days, hours, minutes, and seconds and formats full-day values as `Xd HH:MM:SS`.
- `helper/api.ts` delays successful `UploadFile` results by one second before exposing their media URLs, giving the upload server time to make newly uploaded media fetchable by the browser.
- `helper/textByteLength.ts` provides reusable UTF-8 byte counting and Unicode-safe truncation for text limits.

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

`useInfiniteScroll.ts` stops pagination by calling `onDataFetched([], false)` when a fetch returns no items or only IDs already in `currentData`. It also holds an internal terminal-page guard, so automatic container checks cannot retry an exhausted cursor even if a consumer does not persist that value; consumers should still persist it to keep their visible state synchronized.

## Utilities

Utility functions live in local files where applicable.

`counterDownHelper.ts` calculates link countdowns from Unix timestamps in seconds. It separates durations into days, hours, minutes, and seconds; `formatTime` includes the day segment only when it is non-zero.

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

`helper/` contains 45 helper files.

## Related Modules

See `MODULE_INDEX.md`.

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
