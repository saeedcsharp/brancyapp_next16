# components/website

## Purpose

Component module for website UI and feature concerns.

## Business Purpose

Supports Brancy website workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions. Website component styling is kept in feature-local CSS Modules; `InstallPrompt` uses `installPrompt.module.css` for both banner and iOS fallback presentation. `SeoJsonLd` provides structured data for public pages, while `content/TopicPage.tsx` renders static topic resources with visible FAQs and internal links. The local Footer branch provides source-backed LocalBusiness JSON-LD for the verified address and phone already present in the UI.

## Folder Structure

components/website/.

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

Mostly React local state, context, NextAuth session, or external state from backend APIs. The landing pricing slider keeps the controlled slider value as the single source of truth; its tooltip position is derived directly from that value to avoid reducer synchronization loops.

## External Integrations

External services are accessed through Brancy backend APIs unless this module documents another integration.

## Security

Do not expose tokens, secrets, or user data. Follow auth and redirect rules.

## Permission Rules

Use `RoleAccess`, session permission flags, and backend authorization where relevant.

## Performance

Keep renders and network calls scoped; avoid unnecessary broad fetches.

Landing hero preloads only its primary image, avoids persistent `will-change` hints, and keeps the mobile sign-in CTA keyboard-accessible. Topic resources are static and do not fetch backend data.

## Caching

PWA, Next, browser, or backend caching applies only where configured.

## Environment Variables

No module-specific env vars documented unless related files read them.

## Related Files

components/website/.

## Related Modules

Parent module: `components`.

## Known Issues

The pricing slider's runtime maximum-update-depth issue was fixed on 2026-08-04 by removing redundant tooltip state and the selected-follower-to-slider synchronization effect. Browser interaction coverage is still pending.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add native-reviewed translations for all topic resources, field Core Web Vitals measurement, user-flow tests, and approved content examples when this module is changed.

## Last Updated

2026-07-29

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
