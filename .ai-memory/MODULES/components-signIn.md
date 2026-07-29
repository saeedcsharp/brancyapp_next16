# components/signIn

## Purpose

Component module for signIn UI and feature concerns.

## Business Purpose

Supports Brancy signIn workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/signIn/.

## Execution Flow

Execution starts from imports, route rendering, or helper calls depending on the module.

## Data Flow

Data enters through props, Next route params, session state, browser state, or backend API responses.

Phone sign-in requests send the phone number in E.164 format (`+<dialCode><nationalNumber>`), for example `+989138664066`.

The verification form uses the Web OTP API when available. Its request is aborted on unmount, and expected `AbortError` cancellations are ignored instead of being logged as application errors. WebOTP only populates the six inputs; the shared complete-code effect performs the guarded submit so WebOTP and manual input cannot create duplicate Login requests.

The verification form normalizes Persian and Arabic-Indic digits, manages all input focus through refs, supports Backspace and arrow-key navigation, focuses the last input after a valid paste, and exposes per-input accessible labels and invalid state. Verification uses a single in-flight guard, validates a complete numeric six-digit code before calling NextAuth, clears loading in `finally`, and cleans up shake/error timers on unmount. Incorrect codes still clear the inputs, trigger the existing shake/error styling, and show the backend notification.

The form uses functional state updates for digit editing, a memoized joined code/completion check, stable regex and duration constants, typed WebOTP credentials, multi-digit autofill support, select-on-focus behavior, and `router.replace("/home")` after success. The timer is referenced by `aria-describedby`, while the input group announces error state through `aria-live`. `verificationCode` and `removeMask` are not part of the form props because the form does not use them.
related files and dependency docs.

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

components/signIn/.

## Related Modules

Parent module: `components`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

The landing sign-in phone input defaults to Iran for local Iranian mobile entry; the country selector remains available for international users.

The sign-in phone wrapper keeps the local phone input state and forwards normalized phone changes to `SignIn`; it does not feed the E.164 callback back through the input's `value` prop on every keystroke.

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
