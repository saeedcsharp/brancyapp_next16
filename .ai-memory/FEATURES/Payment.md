# Payment

## Priority

Critical

## Business Impact

High

## AI Reading Priority

1

## Source Of Truth

- `legacy-pages/payment/`
- `app/payment/`
- `components/`
- `helper/apiRouteMap.ts`

## Depends On

- Authentication
- User/session state
- Backend payment responses

## Used By

- Wallet and order flows
- Success/failure payment screens
- Customer and user panel payment status

## Change Impact

Changing this feature may affect order status, payment confirmation, payment redirects, wallet balances, and related user-panel screens.

## Notes

Treat payment-related changes as high-risk because they often couple UI, redirects, backend payloads, and status handling.
