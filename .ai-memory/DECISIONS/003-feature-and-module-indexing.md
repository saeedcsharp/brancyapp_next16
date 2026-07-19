# 003 - Feature And Module Indexing

## Status

Accepted

## Decision

Use a layered documentation model with module docs, feature docs, and decision docs instead of one markdown file per source file.

## Reason

The repository is large, and file-by-file markdown would create excessive noise and high token cost without adding meaningful navigation value.

## Consequences

- Module docs stay focused on folder behavior and source-of-truth mapping.
- Feature docs capture user-facing capabilities and request language.
- Decision docs preserve architecture choices without duplication.

## Related Sources

- `.ai-memory/MODULE_INDEX.md`
- `.ai-memory/FEATURES/`
- `.ai-memory/DECISIONS/`
- `.ai-memory/PROMPT_RULES.md`
