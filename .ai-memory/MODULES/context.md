# context

## Purpose

React context providers and shared context helpers.

## Business Purpose

Provides cross-cutting direction and Instagram account context.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

`context/directionContext.tsx`, `context/instaInfoContext.tsx`, `context/LinkifyText.tsx`.

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

`InstaProvider` uses the stable `next/navigation` router. The legacy compatibility router creates a new object on every render, which previously invalidated `refreshToken`, `GetAccountInfo`, and the account effect when notification state changed. Notification-only updates must not trigger account/session requests; session changes still drive the existing expiry and account checks.

On each provider mount (including a document reload), a selected Instagram account requests `GetInfo` even when the persisted session `lastUpdate` is recent. A mount-local request timestamp and the in-flight guard suppress immediate repeats; subsequent session-driven checks retain the 20-second throttle. This is not interval polling. Token renewal returns the updated session and the effect explicitly chains account or customer title loading with it, without navigating to `/` for routine renewal. `PartnerNotExist` releases the account guard before invoking the existing refresh-and-redirect flow.

After a successful account response is persisted with `update()`, an expired package redirects protected Instagramer paths to `/upgrade`. Public, customer, payment, and upgrade paths are excluded, avoiding an upgrade redirect loop. The provider does not change middleware policy. Validation uses a mocked-hook harness against the transpiled provider; authenticated browser/backend verification remains pending.

Protected Instagramer paths and `/upgrade` now withhold their children behind the existing `Loading` component until selected-account `GetInfo` succeeds and `update()` resolves. Readiness is keyed by user ID, selected index, and Instagramer ID, so switching accounts requires fresh initialization. Expired or missing package data keeps protected children unmounted while navigating to `/upgrade`, where initialized content is allowed. Failed initialization renders the existing error view with a document-reload retry instead of mounting stale content. Unauthenticated protected visitors navigate to `/`; a customer-only session on an Instagramer path navigates to `/user`. Public and customer routes are not gated. This is a client mount barrier, not a pre-middleware/server-render session refresh.

## External Integrations

External services are accessed through Brancy backend APIs unless this module documents another integration.

## Security

Do not expose tokens, secrets, or user data. Follow auth and redirect rules.

## Permission Rules

Use `RoleAccess`, session permission flags, and backend authorization where relevant.

## Performance

Keep renders and network calls scoped; avoid unnecessary broad fetches.

Every committed `usePathname()` transition now triggers selected-account `GetInfo` regardless of the 20-second same-navigation throttle, including returning to a previously visited path. A navigation identity keys both request deduplication and readiness, so protected/upgrade children wait for their own navigation's session persistence. In-flight requests remain serialized; completion retriggers the latest pending navigation check. Older navigation responses cannot release the current gate or issue package redirects; the navigation-aware effect owns those redirects. Query-only and hash-only changes are not navigation triggers. Requests still require a selected Instagram account.

## Caching

PWA, Next, browser, or backend caching applies only where configured.

## Environment Variables

No module-specific env vars documented unless related files read them.

## Related Files

`context/directionContext.tsx`, `context/instaInfoContext.tsx`, `context/LinkifyText.tsx`.

## Related Modules

See `MODULE_INDEX.md`.

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
