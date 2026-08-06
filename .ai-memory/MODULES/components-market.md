# components/market

## Purpose

Component module for market UI and feature concerns.

## Business Purpose

Supports Brancy market workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/market/.

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

components/market/.

## Related Modules

Parent module: `components`.

## Known Issues

Products is enabled in the market properties feature list. Reviews and AdsTimeline remain visually disabled by the feature-properties stylesheet.

## Domain Manager

`components/market/properties/domainManager.tsx` owns custom-domain normalization and validation. It lowercases values, removes supported URL decoration and trailing slashes, rejects malformed labels, unsupported characters, subdomains, overlong domains, and reserved Brancy domains, and signals invalid request attempts through `InputText`'s one-shot shake prop. Once a pending domain exists, the request form is not rendered and a three-step progress indicator reflects DNS verification and connection state. The DNS verification cooldown is rendered inside the disabled verification button and the button returns to the enabled Connect action after expiry.
Requests require a Persian responsibility/delay confirmation. Pending domains use one shared name-server stage with cancellation and a five-minute cooldown; its single Connect action calls connect and verify consecutively, failed DNS propagation remains pending with a Persian retry message, and active domains show Settings ticket guidance for changes.

The Domain Manager uses a native request form for Enter submission. A valid request sends `Instagramer/Bio/UpdateCustomDomain` directly without a confirmation modal or client-side feature gate; duplicate in-flight submissions remain blocked. Its mounted guard is re-enabled when the component effect starts so React Strict Mode's development cleanup/setup cycle cannot leave the Request button stuck in its loading state. It renders custom-domain rules as a semantic list only when the Custom Domain radio is selected, memoized domain/link calculations, native anchors and buttons for keyboard access, and cancellable API requests with unmount/session cleanup. Authenticated Properties metadata is marked noindex and does not expose a public canonical URL.

The default and custom domain sections are presented as mutually exclusive radio choices. The selected panel remains fully visible while the inactive panel content receives the shared `fadeDiv` treatment.

The shared destination-links section is gated by the selected domain type. It is visible for the default option, while the custom option requires `isCustomDomainActive`; its destination URLs use the accepted custom-domain URI only in that selected active state.

When `isDevMode` is enabled, the Domain Manager also exposes a local-only `مرحله بعدی (تست)` control. It advances a pending domain from the name-server step to the completed-DNS step and then to an active accepted-domain state without sending an API request; the existing Delete control remains the backend cleanup action.

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
