# components/design

## Purpose

Component module for design UI and feature concerns.

## Business Purpose

Supports Brancy design workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/design/.

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

- `components/design/dotMenu/dotMenu.tsx` exports `DotMenu`, an accessible menu button with keyboard navigation, focus restoration, RTL-aware placement, responsive menu bounds, reduced-motion handling, and backwards-compatible legacy props (`data`, `handleClickOnIcon`, and `menuPosition`).
- `components/design/tooltip/tooltip.tsx` exports `Tooltip`, which renders its tooltip content through `document.body` using viewport-fixed coordinates derived from the trigger while preserving directional placement options.
- `components/design/chart/brushLineChart.tsx` exports `BrushLineChart`, a reusable SVG multi-series line chart with a draggable brush range selector, adaptive year/month/day aggregation, count-based vertical axis, legend toggles, and hover tooltips.
- `components/design/phoneInput/` exports a dependency-free two-input phone selector with local SVG flags, country search, recent/preferred countries, formatting, validation, RTL support, and structured E.164/international/national output.
- `components/design/inputText.tsx` supports controlled text input normalization by its consumer and exposes a `shake` prop for replaying the shared invalid-input animation.
- `components/design/textArea/textArea.tsx` exports a standard native-textarea-compatible control with RTL direction detection, controlled/uncontrolled modes, optional bounded auto-resize, keyboard Escape handling, and a 16px minimum computed font size to prevent mobile browser focus zoom. Standard React props are preferred; legacy textarea prop names remain temporarily compatible.
- `components/design/checkBoxButton/checkBoxButton.tsx` exports the legacy-compatible controlled `CheckBoxButton`, with native checkbox accessibility props, keyboard-visible focus, disabled state, a 44px touch target, and forced-colors/reduced-motion fallbacks.
- `components/design/radioButton/radioButton.tsx` exports the legacy-compatible controlled `RadioButton`. It retains `textlabel` and `handleOptionChanged`, while supporting standard `label`, `onChange`, and native radio input props; its native input remains keyboard-focusable and styles include 44px touch targets, disabled, focus-visible, reduced-motion, and forced-colors states.
- `components/design/incrementStepper/incrementStepper.tsx` exports a callback-controlled numeric stepper with semantic buttons, keyboard support, pointer-captured press-and-hold repetition, stale-value-safe decrement handling, optional `onValueChange`, `min`, and `max` props for manual integer entry, optional disabled and accessible-label props, and reduced-motion/forced-colors fallbacks.
- `components/design/switchButton/switchButton.tsx` exports the controlled `SwitchButton` while preserving its existing import path and callback API. It uses a native checkbox input, accepts standard input and ARIA props, filters legacy invalid roles, provides a 44px touch target, and supports visible focus, disabled, RTL, reduced-motion, and forced-colors states.
- `components/design/counterDown/counterDownForLink.tsx` exports `CountdownTimerForLink`, which treats `expireTime` as a Unix timestamp in seconds and displays `DD:HH:MM:SS` when at least one day remains, otherwise `HH:MM:SS`.
- `components/design/counterDown/counterDownForLink.tsx` exports a link countdown that shows `HH:MM:SS` below one day and `Xd HH:MM:SS` when one or more full days remain.

## Internal APIs

Local helpers and non-exported functions stay module-private.

## Classes

No class inventory was generated for this module during initialization unless listed in related files.

## Functions

See related source files for exported functions and local helpers.

## Components

React components are present when the folder contains `.tsx` UI files.

## Recent UI Notes

- `components/design/toggleButton/ToggleButton.tsx` renders native buttons with `aria-pressed`, optional group labeling, disabled support, visible keyboard focus, responsive touch targets, RTL-aware unread positioning and active-indicator translation, reduced-motion handling, and forced-colors fallback. A shared active indicator animates between option columns without changing its controlled `options`, `selectedValue`, and `onChange` API.
- DotMenu now uses native buttons and WAI-ARIA menu semantics. It supports Enter/Space activation, Arrow/Home/End option navigation, Escape/outside-pointer closing, and moves focus between its trigger and active option. Its option styles are applied and its menu is removed after the exit animation.
- Tooltip content is portalled to `document.body` so ancestor overflow and stacking contexts cannot clip it. Its fixed coordinates are refreshed on scroll and resize, and click-outside handling recognizes both the trigger and portalled content.
- The chart design folder now includes a brush-style line chart for date/count series. It keeps the full main line rendered while the selected range controls its visible x-domain, accepts multiple series, auto-aggregates by year/month/day, aligns hover guides/tooltips to displayed buckets, animates path redraws and brush movement, and stays dependency-free.
- Each displayed vertical guide has a transparent hover zone spanning the midpoint to adjacent guides, allowing near-line tooltip activation.
- The brush chart measures its container after the first layout paint and once more on the next animation frame, while `ResizeObserver` continues to handle route/layout changes where the card initially has no usable size.
- TextArea uses the CSS-module `textArea`, `rtl`, `ltr`, `danger`, and `fade` states. It includes keyboard-visible focus, reduced-motion, and forced-colors handling without focus-scale transforms.
- CheckBoxButton keeps its existing import path and controlled `value`/`handleToggle` API while accepting native ARIA and input attributes. Its checkbox input is visually hidden rather than removed from keyboard navigation.
- RadioButton keeps its existing import path and controlled legacy props while accepting standard native radio props. Its CSS-module classes are `input`, `label`, `indicator`, and `labelText`; selection uses a pseudo-element so hover and checked states do not change layout dimensions.
- IncrementStepper uses CSS-module `root`, `control`, `value`, and `isShaking` states. Its existing `data`, `increment`, and `decrement` callback API remains compatible; `disabled`, `className`, `aria-label`, `incrementLabel`, and `decrementLabel` are optional additions.
- SwitchButton uses CSS-module `root`, `input`, and `track` states. The visual thumb is rendered by the track pseudo-element; the native input remains the interactive and accessible control. Its existing `name`, `checked`, and `handleToggle` props remain compatible, while standard input props and an optional wrapper `className` are supported.

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

components/design/.

## Related Modules

Parent module: `components`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-08-07

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
