# Dependencies

## Runtime Dependencies

As of 2026-09-30, `package.json` contains 37 direct runtime dependencies. A dependency usage report is rendered by the `/dev/package` route ([app/dev/package/page.tsx](../app/dev/package/page.tsx)); it is a hand-maintained static source audit (not script-generated) and was synchronized with `package.json` on 2026-09-30.

On 2026-09-30, `jotai`, `lodash.throttle`, `pdf-lib`, `react-leaflet`, `react-select`, and `@types/wavesurfer.js` were removed after confirming no source, config, or type references (`wavesurfer.js` 7 ships its own types). `clsx` and `react-date-object`, which source files import directly but were previously only installed transitively (through `react-draggable`/`react-toastify` and `react-multi-date-picker`), are now declared at their already-installed versions. `braces` and `ws` are intentionally kept as pinned direct dependencies even though source does not import them.

## Development Dependencies

As of 2026-09-30, 8 development dependencies are present: type packages, `eslint`, `eslint-config-next`, and `patch-package`. `@types/react-beautiful-dnd`, `@types/react-i18next` (react-i18next ships its own types), and `next-router-mock` were removed on 2026-09-30 as unused. `patch-package` remains in the manifest because the `postinstall` script still invokes it, although its old Quill patch was removed and no `patches/` directory exists.

On 2026-09-30, `eslint` (^9.39.5) and `eslint-config-next` (16.2.12, matching the installed Next version) were added for `npm run lint`.

## Install Note

Repository memory indicates npm operations may require `--legacy-peer-deps` because some peers expect React 18 while the project uses React 19.

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
