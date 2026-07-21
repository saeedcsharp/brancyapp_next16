# Wallet

## Priority

High

## Business Impact

High

## AI Reading Priority

2

## Source Of Truth

- `legacy-pages/user/wallet/`
- `legacy-pages/wallet/`
- `components/userPanel/`
- `components/navbar/userPanelNavbar/`

## Depends On

- Authentication
- Payment flows
- Backend wallet responses

## Used By

- User wallet views
- Instagramer wallet views
- Payment status and balance display

## Change Impact

Changing this feature may affect balance presentation, payment results, user-panel navigation, and cached wallet state.

## Notes

Wallet behavior often overlaps with payment and user-panel identity flows.

The Instagramer payment page obtains registered bank cards with `/api/wallet/getInstagramerBankCards`. It presents each card as an individual responsive grid tile; a card-sized add-card tile remains in the collection and is centered when no bank card exists.

The Instagramer wallet statistics page obtains monthly balance history with `/api/wallet/getBallanceHistory`. The response `statistics` array is normalized to the `IMonthGraph` series contract and rendered by `ChartDay`.
