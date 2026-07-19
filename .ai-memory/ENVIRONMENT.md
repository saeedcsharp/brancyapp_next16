# Environment

## Node And Build

Docker uses Node 22 Alpine. Local scripts rely on npm.

## Environment Variables

- `NODE_ENV`: controls PWA behavior and production runtime.
- `NEXTAUTH_SECRET`: fallback auth secret source when Docker secret file is absent.
- `NEXT_TELEMETRY_DISABLED`: set in Docker build/runtime.
- `NEXT_SHARP_PATH`: points to installed sharp location in Docker.
- `PORT` and `HOSTNAME`: runner settings.

`.env` exists locally. Do not expose values.

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
