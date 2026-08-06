# Marketplace

## Priority

High

## Business Impact

High

## AI Reading Priority

2

## Source Of Truth

- `legacy-pages/market/`
- `components/market/`
- `helper/apiRouteMap.ts`
- `helper/clientFetchApi.ts`

## Depends On

- Authentication
- Localization
- Backend market and bio-link responses

## Used By

- Marketplace screens
- Bio-link and market management flows
- User and Instagramer market experiences

## Change Impact

Changing this feature may affect market listing behavior, marketplace navigation, bio-link flows, and backend request mapping.

## Notes

Use this doc when the requested change is described as marketplace behavior rather than a specific route tree.

## Custom Domain Validation

The market domain manager normalizes entered domains to lowercase, removes an optional `http://`/`https://` prefix, `www.`, and trailing slashes, then validates a single registrable domain. Domains are limited to 253 characters, labels to 63 characters, and a two-character-or-longer alphabetic TLD; underscores, hyphens, subdomains, and Brancy-owned domains are rejected. An invalid request attempt triggers the shared input shake animation once. After a request is registered, the form is removed and a three-step progress indicator shows request, DNS verification, and connection status. During DNS verification cooldown, the verification button is disabled and contains the countdown; after expiry it becomes an enabled Connect button.
The request action opens a Persian confirmation dialog explaining publishing responsibility and the expected provider delay of five minutes to twelve hours, and sends the request only after confirmation. Pending domains show their name servers, a cancel action, and a five-minute cooldown before Connect is available. Connect calls the connect and DNS verification endpoints sequentially; unsuccessful verification keeps the pending domain, displays a Persian DNS propagation message, and starts another five-minute cooldown. An active domain is displayed as read-only with guidance to use a Settings ticket for removal or change.

The public destination-links section is shown for the default-domain selection. For the custom-domain selection it is rendered only after the custom domain is active and finalized; in that state every destination link uses the accepted custom-domain URI.
