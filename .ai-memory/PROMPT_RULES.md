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
