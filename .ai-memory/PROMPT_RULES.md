# Prompt Rules

## Required Workflow

1. Read `START_HERE.md`.
2. Read `AI_CONTEXT.md`.
3. Read `CURRENT_STATE.md`.
4. Read relevant topic and module docs.
5. Inspect source only after loading documentation context.
6. Implement narrowly.
7. Validate.
8. Update affected documentation.

## Feature Catalog Synchronization Rule

Whenever an option, feature, workflow, permission, role, integration, or user-facing capability is added, changed, completed, renamed, or removed anywhere in the application:

1. Check `app/feature/featureCatalog.ts` and add or update the matching feature record.
2. Update the matching text in `i18n/featureKnowledge.ts` for every reviewed locale, especially Persian.
3. If the capability is incomplete, local-only, mocked, unmapped, or removed, move it to or update the audit-only records instead of presenting it as active.
4. Update the related `.ai-memory/FEATURES/Feature Knowledge Base.md`, `CURRENT_STATE.md`, `CHANGELOG.md`, and any affected module or domain documentation.
5. Before finishing, verify that `/feature` still reflects the current source, access rules, and visible behavior.

The `/feature` page must remain the up-to-date, source-backed list of Brancy capabilities. A feature implementation task is incomplete until this synchronization check is done.

## Response Quality Rules

Be factual, concise, and explicit about validation. Do not invent backend/database details that are not present. Preserve user changes.

## Update Policy

Documentation must change in the same task as affected code. New modules require new module docs and `MODULE_INDEX.md` updates.

## Documentation Layers

- `MODULE_INDEX.md`: module catalog with priority and source-of-truth guidance.
- `FEATURES/`: feature-focused documents for business capabilities.
- `DECISIONS/`: architecture and workflow decision logs.
- `MODULES/`: module and folder documentation.
- `ARCHIVE/`: retired or historical documentation.
