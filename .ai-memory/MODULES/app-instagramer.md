# app/(instagramer)

## Purpose

Route group for Instagramer dashboard pages.

## Business Purpose

Supports Instagram account management, content, ads, market, messaging, store, wallet, settings, and upgrade flows.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

`app/(instagramer)/` route wrappers and layouts.

## Execution Flow

Execution starts from imports, route rendering, or helper calls depending on the module. The Instagramer group layout waits for NextAuth `status === "authenticated"` before rendering its sidebar, navbar, children, or session-dependent overlays. The root Node-runtime middleware is the single source of truth for authentication across protected App Router routes. It handles authentication for Instagramer, `/customershop/*`, and `/user/*`, while account selection and package expiry are applied only to Instagramer paths.

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

`app/(instagramer)/` route wrappers and layouts.

## Related Modules

See `MODULE_INDEX.md`.

## Known Issues

The store product-detail wrapper is a client component because it uses `useSession` and the legacy page uses `next/router`; its `useSearchParams` consumer must remain beneath a Suspense boundary for Next.js production builds.

Instagramer page wrappers do not import or use `packageStatus` and contain no `onUnauthenticated` callbacks. They wait for an authenticated client session only when the legacy page needs session data, while preserving role restrictions, account redirects, query handling, Suspense boundaries, intercepted routes, and feature navigation. Package expiry and protected-route authentication belong to the root middleware; user routes are authentication-only to avoid a `/user` `currentIndex` redirect loop.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-09-03

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
