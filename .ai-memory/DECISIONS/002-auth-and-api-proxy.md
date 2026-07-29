# 002 - Auth And API Proxy

## Status

Accepted

## Decision

Keep authentication and API proxy behavior centralized in the Next route handlers and helper layer instead of scattering direct backend calls across UI components.

## Reason

This preserves session handling, route protection, and backend URL normalization in one place.

## Consequences

- Auth and proxy changes can be audited in a small number of files.
- UI components depend on `helper/clientFetchApi.ts` rather than embedding backend URLs.
- Changes to the proxy contract can affect many features at once.

## Related Sources

- `app/api/`
- `helper/clientFetchApi.ts`
- `helper/apiRouteMap.ts`
- `helper/apiBaseUrl.ts`
- `types/next-auth.d.ts`
