# components/navbar

## Purpose

Component module for navbar UI and feature concerns.

## Business Purpose

Supports Brancy navbar workflows or shared UI.

## Responsibilities

Owns dashboard header navigation, profile and notification controls, fullscreen behavior, and desktop/mobile entry points for internal feature search.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/navbar/.

## Execution Flow

The Instagramer layout owns desktop popup visibility. Desktop uses a search button in the header. Mobile search is a locally controlled accordion section inside `LeftHamMenue`, positioned with the notification and profile sections rather than beside the route tabs. Opening search closes notification and profile accordions; selecting a result closes the complete mobile menu before navigation.

`NavbarMobile` and desktop `NavbarTabs` derive their active sections directly from App Router `usePathname()`. The `/page/ai` route family, including image and video creation subroutes, maps to the Page section on mobile and the Content Creator tab on desktop so both navigation logos are available on client navigation and direct reload. Market navigation uses the actual slash-free route values `market`, `marketstatistics`, `marketmylink`, and `marketproperties`, so all market mobile routes resolve to the BioLink logo. Store navigation exposes Products, Orders, and Statistics; the Store Properties route remains directly addressable but is omitted from desktop and mobile navigation.

Instagramer notification surfaces recognize `AIVideoSuccess` and `AIVideoFailed` as AI video-generation success and failure notifications, with dedicated localized titles, explanations, icons, and messages. Dynamic notification content uses i18next interpolation for sender, model version, and failure metadata; malformed payloads fall back to the localized unexpected-error message.

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

- `components/navbar/instagramerNavbar/navbarHeader.tsx`
- `components/navbar/instagramerNavbar/navbarTabs.tsx`
- `components/navbar/instagramerNavbar/navbar_mobile.tsx`
- `components/navbar/instagramerNavbar/navbarheader.module.css`

## Related Modules

Parent module: `components`.

## Known Issues

No confirmed module-specific issue remains after fixing the missing mobile Page and desktop Content Creator logos on direct reloads of AI routes and aligning market route enum values with their App Router paths.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-08-22

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
