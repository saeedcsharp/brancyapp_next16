# Business Rules

## Auth And Account Selection

A valid working Instagramer session generally requires `session.user.currentIndex !== -1` and `session.user.loginByInsta`. Some routes redirect users with no Instagramer account to `/user` or `/user/instagramerLogin`.

## Package Status

`helper/loadingStatus.ts` treats a package as active when `session.user.packageExpireTime * 1000 > Date.now()`.

## Partner Roles

Partner accounts are restricted by `PartnerRole`; non-partner users are broadly allowed by `RoleAccess` unless a specific partner role check applies.

## Country And Payments

Pricing and redirect behavior use country headers. Iranian-only payment domains are blocked for non-IR/AZ visitors in `app/redirectInterface/page.tsx`.

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
