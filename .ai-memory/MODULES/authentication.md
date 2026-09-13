# Authentication Module

## Purpose

NextAuth route, session augmentation, sign-in/sign-out components, direct login, Google OAuth.

## Metadata

Priority: Critical

Business Impact: High

AI Reading Priority: 1

Source Of Truth: `app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`, `helper/clientFetchApi.ts`

Depends On: `helper/`, `app/api/`, backend auth responses

Used By: Login, logout, route guards, redirects, dashboard access

Change Impact: Session shape, permission checks, proxy auth, redirect behavior, and user context

## Business Purpose

Lets users authenticate and select Instagramer context.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

`app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`, `components/signIn/`, `components/signout/`, `app/directlogin/page.tsx`, `legacy-pages/googleoauth.tsx`.

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

The provider's account request and ready state are now keyed by navigation identity as well as account. Every pathname transition revalidates selected-account session data before gated client children mount, including rapid navigation and returning to a previous pathname. In-flight requests serialize, and the latest pending navigation is retried when the request lock is released.

Mostly React local state, context, NextAuth session, or external state from backend APIs.

The account provider now uses a mount-local timestamp to force the first selected-account fetch after each reload independently of persisted session freshness. Token refresh returns the updated NextAuth session for the follow-up account/title request. Account package expiry redirects run after `update()` completes on protected Instagramer routes. See `context.md` for the request guard and throttling contract.

Dashboard and upgrade client children wait for selected-account initialization and persisted session readiness in `InstaProvider`. Failures keep stale children unmounted and expose retry; expired protected accounts stay behind the loader during upgrade navigation. Middleware still runs earlier using its existing JWT cookie.

## External Integrations

External services are accessed through Brancy backend APIs unless this module documents another integration.

## Security

Do not expose tokens, secrets, or user data. Follow auth and redirect rules.

The API client's forced-401 logout disables NextAuth automatic navigation and, after logout resolves, uses `window.location.replace("/")`. Production logout therefore stays on the active public origin even if NextAuth returns a localhost URL. Deployment `NEXTAUTH_URL` should still match the public authentication origin for other NextAuth flows; this change does not alter deployment configuration.

## Permission Rules

Use `RoleAccess`, session permission flags, and backend authorization where relevant.

## Performance

Keep renders and network calls scoped; avoid unnecessary broad fetches.

## Caching

PWA, Next, browser, or backend caching applies only where configured.

## Environment Variables

No module-specific env vars documented unless related files read them.

## Related Files

`app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`, `components/signIn/`, `components/signout/`, `app/directlogin/page.tsx`, `legacy-pages/googleoauth.tsx`.

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
