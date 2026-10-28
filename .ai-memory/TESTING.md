# Testing

## Current Finding

No dedicated test script was discovered.

## Linting

`npm run lint` runs ESLint 9 (`eslint .`) with the flat config in `eslint.config.mjs`, extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Every rule is downgraded to `warn`, so lint reports existing issues without failing; do not run `--fix` across the codebase. `types/next-auth.d.ts` is ignored because the ESLint parser rejects its `extends DefaultSession["user"]` declaration, which `tsc` skips through `skipLibCheck`. Next 16 no longer runs lint during `next build`.

## Flow/AI Dashboard Redesign

On 2026-10-27, `tsc --noEmit --incremental false`, locale AST checks (28 dashboard keys, 224 translations, no missing/duplicate entries), and focused ESLint completed without errors. An isolated browser fixture bundled the actual dashboard, inbox controller, connection popup, post-index hook, shared controls and styles using the installed Next webpack/TypeScript/Sass packages. Authentication, API responses, editor bodies and unrelated dialogs were replaced with synthetic fixtures; this does not verify a real account, backend contracts or the actual Flow/AI editor runtime.

Browser checks covered:

- 320/390/768/1024/1235px layouts: no horizontal document overflow; history cards consistently 224px high; desktop four-column and narrow single-column grids.
- Persian RTL dark mode, template navigation in RTL, explicitly non-actionable sample templates and white template headings.
- Tab switching, loaded-item sorting, card opening/return callbacks, matching/unmatched flow deep links, new-flow settings, draft persistence, disabled draft connection and save replacement.
- Debounced search, cancellation of an earlier slow response, normal-list restoration, cursor pagination of searched and normal lists, and duplicate-free results.
- Actual association mapping by payload type, post scanning capped at four concurrent detail calls, denied-comment states without post API reads, Flow message-permission gating and AI availability without it.
- List/index retry states without false Not connected labels, thumbnail movement between old/new automations after a save, preserved keyword/matching payloads, duplicate-save blocking and activation-only retry.
- Bottom-row three-dot menus stay within the viewport and support keyboard Escape; source AST checks confirm both real editor Back controls are localized native 44px buttons.

Authenticated browser/backend verification, account-switch races and a dedicated backend connection-list endpoint remain follow-up work. The temporary fixture is session-only and adds no repository dependencies or production route.

## Recommended Checks

The 2026-10-28 title-initial avatar restoration passed TypeScript, focused lint (existing thumbnail image warning only), and a session-only rendered-JSX harness with 90 scenarios/540 assertions. The harness used the actual `getThumbnailStyle` and dashboard rendering with mocked hooks/shared components to verify Latin/Persian, mixed-case, numeric, single-character and empty titles; normal/search/draft views; newest/oldest/title sorting; original title-derived gradients/text colors; decorative initials without SVGs; and unchanged template SVG icons. It was removed after validation; live RTL/dark-mode visual verification remains pending.

### Direct Post-Connection Controls (2026-10-28)

TypeScript and focused ESLint passed for the direct text/tile connection entry points (only the existing thumbnail `<img>` lint warning remains). A session-only rendered-JSX harness ran 30 scenarios and 118 assertions against the actual dashboard component and event handlers with mocked hooks/shared components: Flow/AI, normal/searched items, enabled empty actions, draft/save-first restrictions, denied access, loading/error/read-denied states, thumbnail preservation, a single additional connection tile, exact automation callback arguments, click propagation isolation, slider mouse-down isolation, sorting-menu retention and CSS pointer/focus/44px targets. The temporary harness was removed after validation. Native Enter/Space activation and the authenticated popup still require browser verification; backend behavior was not changed.

- `npm run build` for production compile validation.
- `npx tsc --noEmit` for type-only validation when needed. Stale `.next/types` entries for removed routes can fail this check until `npm run build` regenerates them.
- `npm run lint` for warning-level lint findings.
- `npm run build` rewrites tracked generated files (`next-env.d.ts`, `public/sw.js`, `public/sw.js.map`); `tsc` rewrites `tsconfig.tsbuildinfo`. Do not commit those changes unless intended.
- Targeted runtime checks for authentication, route redirects, API calls, and PWA behavior.

Document new tests here when test infrastructure is added.

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
