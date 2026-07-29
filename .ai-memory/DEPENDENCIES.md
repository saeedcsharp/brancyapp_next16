# Dependencies

## Runtime Dependencies

As of 2026-07-29, `package.json` contains 41 direct runtime dependencies. The complete package inventory and current usage classification are maintained in [app/dev/test.tsx](../app/dev/test.tsx), including the recently added `@next/third-parties` and `emoji-picker-react` packages.

The report currently identifies 34 runtime dependencies as used and 7 as unused or requiring final verification. These classifications are source-audit findings, not automated dependency metadata; confirm candidates with `npm ls`, `npm audit`, and a production build before removal.

## Development Dependencies

As of 2026-07-29, 9 development dependencies are present: type packages, `next-router-mock`, and `patch-package`. `@types/react-beautiful-dnd` is currently orphaned because the application uses `@dnd-kit`; `patch-package` remains in the manifest because the `postinstall` script still invokes it, although its old Quill patch was removed.

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
