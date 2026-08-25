# Utilities

Utilities live mostly in `helper/`. They include API helpers, number/price/time formatting, media conversion, RTL detection, locale detection, timers, draft storage, emoji detection, SVG helpers, URL/base64 conversion, upload/download helpers, UTF-8 text byte counting/truncation, and infinite scroll/mouse hooks. The infinite-scroll hook treats empty and duplicate-only pages as terminal, reports `hasMore: false`, and applies an internal terminal guard to prevent automatic retry loops.

Keep utility functions pure where possible and document side effects such as localStorage, network requests, file conversion, or DOM access.

The `/dev/systemDesign` helper section is the visual reference for all helper files. It intentionally executes only pure examples (`textByteLength`, `emojiDetector`, and `convertFirstLetterToLowerCase`); API, upload, storage, file, DOM, SignalR, and hook helpers are documented without invocation.

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
