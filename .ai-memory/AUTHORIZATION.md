# Authorization

Authorization is primarily frontend gating plus backend enforcement.

## Rules

- `RoleAccess(session, partnerRole)` grants all access to non-partner users and checks `session.user.roles` for partners.
- `LoginStatus(session)` requires a selected Instagramer and `loginByInsta`.
- Feature availability can be checked through helper and backend package/feature APIs.

Backend APIs remain the final authority for sensitive actions.

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
