# components/search

## Purpose

Component module for search UI and feature concerns.

## Business Purpose

Supports Brancy search workflows, including fast navigation to Instagramer dashboard capabilities.

## Responsibilities

Owns the internal feature-search popup, query normalization, keyword matching, and the centralized route index used to discover dashboard capabilities.

## Architecture

`featureSearchIndex.ts` is a static client-side index of route, translated label key, translated parent-section context keys, optional translated synonym keys, curated aliases, and reusable semantic keyword groups. Every route declares at least one semantic group, and each group is type-checked to contain aliases for all eight configured locales. At module initialization, every entry's keyword list is enriched with its translated labels and grouped aliases. `featureSearch.tsx` filters that index locally and navigates with the App Router. Page `Head` metadata is not used as the search source because metadata for routes that are not currently rendered is unavailable in the browser DOM.

## Folder Structure

components/search/.

## Execution Flow

The Instagramer desktop navbar opens `FeatureSearch` as a header popup. Mobile renders the same component in embedded mode inside a collapsible `LeftHamMenue` section alongside notification and profile. Opening either presentation focuses its input. Searchable text combines the active locale's feature title and parent-section title, so all eight configured locales are covered without duplicating every translation in the route index. Queries are normalized for case, Unicode accents/diacritics, Persian/Arabic character variants, and zero-width non-joiners. Matching results show a translated title and route; click or Enter navigates to the selected route, while Escape closes the active search presentation.

## Data Flow

The query remains in local component state. Labels and locale-derived keywords come from existing i18n resources, while curated aliases and routes come from `featureSearchIndex`; no backend request is required.

## Dependencies

See imports in related files and dependency docs.

## Reverse Dependencies

Used by routes, components, helpers, or build tooling where imported.

## Public APIs

- `FeatureSearch`: internal dashboard capability search UI.
- `featureSearchIndex`: searchable route definitions.
- `normalizeFeatureSearch` and `filterFeatureSearch`: reusable matching helpers.

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

Filtering is synchronous over the small static feature index and has no network or route-prefetch cost.

## Caching

PWA, Next, browser, or backend caching applies only where configured.

## Environment Variables

No module-specific env vars documented unless related files read them.

## Related Files

- `components/search/featureSearch.tsx`
- `components/search/featureSearch.module.css`
- `components/search/featureSearchIndex.ts`

## Related Modules

Parent module: `components`.

## Known Issues

Search aliases and semantic keyword groups are curated manually, while official feature, section, and configured synonym labels are indexed automatically from every locale. New dashboard capabilities must still be added to `featureSearchIndex.ts` with at least one relevant keyword group.

The `/page/ai` entry includes multilingual aliases for its image-creation and video-creation capabilities while intentionally returning the parent AI route.

The `/page/tools` Event Ideas entry uses the translated `page1_artificial_intelligence` synonym key, so queries such as French `Intelligence artificielle` resolve to the tools route alongside the curated `ai` and Persian aliases.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-07-28

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
