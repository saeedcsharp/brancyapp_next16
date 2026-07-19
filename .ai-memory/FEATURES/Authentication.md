# Authentication

## Priority

Critical

## Business Impact

High

## AI Reading Priority

1

## Source Of Truth

- `app/api/auth/[...nextauth]/route.ts`
- `types/next-auth.d.ts`
- `helper/clientFetchApi.ts`

## Depends On

- `helper/`
- `app/api/`
- backend auth responses

## Used By

- Login and logout flows
- Route guards and redirects
- User and Instagramer dashboards

## Change Impact

Changing this feature may affect sign-in, sign-out, session shape, permission checks, proxy auth, and redirect behavior.

## Notes

Keep this doc aligned with session handling, provider configuration, and backend auth contract changes.
