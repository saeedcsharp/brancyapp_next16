# Permissions

## Session Permission Flags

Session users include `commentPermission`, `insightPermission`, `messagePermission`, and `publishPermission`. Home and feature pages conditionally call APIs based on these flags.

## Partner Roles

`PartnerRole` enum values include Message, Comment, PageView, Transaction, Ads, Orders, Bio, Publish, SystemTicket, Products, and Automatics.

Document every new permission check in the related module doc.

Media auto-reply direct response, Flow, Product, and Connect Product delivery states use `session.user.messagePermission`; when false, the editor presents the localized message-access state and Instagram permission redirect while preserving same-comment configuration.

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
