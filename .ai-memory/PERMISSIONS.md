# Permissions

## Session Permission Flags

Session users include `commentPermission`, `insightPermission`, `messagePermission`, and `publishPermission`. Home and feature pages conditionally call APIs based on these flags.

## Partner Roles

`PartnerRole` enum values include Message, Comment, PageView, Transaction, Ads, Orders, Bio, Publish, SystemTicket, Products, and Automatics.

Document every new permission check in the related module doc.

Media auto-reply direct response, Flow, Product, and Connect Product delivery states use `session.user.messagePermission`; when false, the editor presents the localized message-access state and Instagram permission redirect while preserving same-comment configuration.

The message Properties page also gates its initial settings fetches on `session.user.messagePermission`, so users without message access do not call `GetGeneralAutoReplies` or trigger the shared 401 sign-out behavior.

The App Router wrappers for message Direct, Comments, AI and Flow, and Properties now perform the corresponding whole-page permission checks after the authenticated session is ready. The page Statistics wrapper likewise checks `insightPermission` before mounting the legacy page. Legacy checks remain as defensive guards for alternate mounts.

The App Router wrappers for Post creation and Story creation also check `publishPermission` before mounting their legacy editors. This prevents draft, publish-limit, and pre-content requests from running for users who can see the permission state but cannot publish.

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
