# components/messages

## Purpose

Component module for messages UI and feature concerns.

## Business Purpose

Supports Brancy messages workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/messages/.

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

`popups/selectProduct.tsx` loads product thumbnails through `useInfiniteScroll`. Its pagination callback always applies the hook's `hasMore` result, including an empty terminal page, so a short product grid cannot repeatedly request an exhausted product cursor.

`comment/commentInbox.tsx` memoizes the selected media's auto-reply configuration before passing it to `popups/editAutoReplyForMedia.tsx`. Hover-driven parent renders therefore preserve the child fetch effect dependencies and do not repeat prompt or flow API requests; a media, search-mode, or inbox-data change still supplies updated configuration.

`aiflow/flowNode/TextNode.tsx` enforces a 1,000-byte UTF-8 limit for text input, paste, and existing node data. The counter reports bytes rather than JavaScript string length, and truncation preserves complete Unicode characters.

`direct/directChatBox.tsx` applies the same 1,000-byte UTF-8 limit to loaded drafts, typed text, emoji insertion, and outgoing text; truncation preserves complete Unicode characters.

`aiflow/popup/AIToolsSettings.tsx` selects each tool parameter's `completeDescription*` field from the active i18next locale. The model's German description serves the `gr` locale, while French and unknown locales fall back to English and then the legacy `description` field.

`aiflow/flow.tsx` reports successful toolbar saves to `FlowAndAIInbox` only for `newFlow`. The parent adopts the returned master-flow record and selects its ID, causing the editor to reload through `GetMasterFlow`; existing-flow toolbar saves do not request an additional reload.

`popups/sendFile.tsx` and `popups/sendVideoFile.tsx` use the shared `UploadFile` helper for progress-aware uploads, so direct-message image and video URLs are released only after the global one-second media-availability delay.

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

components/messages/.

## Related Modules

Parent module: `components`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-08-02

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
