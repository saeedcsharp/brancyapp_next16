# 001 - Next.js App Router Bridge

## Status

Accepted

## Decision

Keep the App Router as the top-level route system while using legacy page implementations for mature feature screens.

## Reason

The codebase already contains a large amount of stable feature logic in `legacy-pages/`, and the bridge keeps the migration surface smaller than a full rewrite.

## Consequences

- App routes stay thin and predictable.
- Feature behavior remains centralized in legacy implementations until migration is justified.
- Documentation must distinguish wrapper routes from feature implementations.

## Related Sources

- `app/`
- `legacy-pages/`
- `app/_compat/`
