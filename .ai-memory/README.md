# Brancy AI Knowledge Base

## Purpose

This folder is the permanent AI knowledge base for the Brancy Next application. It captures project architecture, business rules, API behavior, configuration, active state, risks, and module-level documentation so future humans and AI assistants can work with context instead of rediscovering the same facts.

## Folder Structure

- `START_HERE.md`: mandatory entry point.
- `AI_CONTEXT.md`: concise assistant context.
- `CURRENT_STATE.md`: latest known state of the codebase.
- `MODULE_INDEX.md`: catalog of modules with priority and source-of-truth guidance.
- `FEATURES/`: feature-oriented documentation for business capabilities.
- `DECISIONS/`: architecture and workflow decision logs.
- `MODULES/`: module and folder documentation.
- `ARCHIVE/`: retired or historical module documentation.

## Reading Order

Read `START_HERE.md`, then `AI_CONTEXT.md`, then `CURRENT_STATE.md`, then `MODULE_INDEX.md`, then the related feature, decision, topic, and module documents.

## Documentation Philosophy

Keep documents factual, searchable, and close to the implementation. Prefer links to module documents over duplicating details. Update the smallest affected set of documents when code changes.

## Maintenance Rules

Every implementation change must update related module docs, feature docs, decision docs, `CURRENT_STATE.md` when project state changes, `CHANGELOG.md`, and `TODO.md` or `BUGS.md` when applicable.

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
