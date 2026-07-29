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

The Instagramer payment page obtains registered bank cards with `/api/wallet/getInstagramerBankCards`. It presents each card as an individual responsive grid tile; a card-sized add-card tile remains in the collection and is centered when no bank card exists. The add-card form accepts one 16-digit card number and posts `{ cardNumber }` to `/api/wallet/addCardNumber`, mapped to `/Business/Wallet/AddCardNumber`. A successful response triggers a fresh `/api/wallet/getInstagramerBankCards` request instead of modifying the card list optimistically.

The Instagramer wallet statistics page obtains monthly balance history with `/api/wallet/getBallanceHistory`. The response `statistics` array is normalized to the `IMonthGraph` series contract and rendered by `ChartDay`.

The wallet balance summary totals `totalPrice` across every general-balance entry whose `SubInvoiceStatus` is `None`; an empty matching set is displayed as zero.

The general-balance section uses a Persian `react-multi-date-picker` start-date filter. Selecting or clearing the date requests `/api/wallet/getGenerallBallance` again with `from` set to the selected day's start, or zero when cleared, and `end` set to the current timestamp. Results are grouped by card number and each card displays totals for `None`, `AwaitingSettled`, `Settled`, and `Failed` statuses, including zero-value statuses.
