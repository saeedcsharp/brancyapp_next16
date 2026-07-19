# Services

This frontend consumes external Brancy services rather than implementing backend services locally.

## Service Adapters

- `helper/clientFetchApi.ts`: primary client API service adapter.
- `app/api/_lib/proxy.ts`: Next route proxy for selected user auth routes.
- `helper/apiBaseUrl.ts`: host-aware service URL resolver.
- `helper/apiRouteMap.ts`: local-to-backend route mapping.
- `helper/socket.ts` and `helper/pushNotif.ts`: real-time and notification integration helpers.

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
