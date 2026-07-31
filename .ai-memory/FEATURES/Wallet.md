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

The Instagramer payment page retrieves invoice history from `/api/wallet/getInvoices` and passes its `IGetInvoice` response to `components/wallet/invoices.tsx`. It uses the response `nextMaxId` cursor with `useInfiniteScroll` to retrieve and append later pages while filtering duplicate invoice IDs. The component renders responsive financial cards with localized type/status labels, status-colored card accents, formatted creation times, amount, price unit, and dedicated initial/loading-more/empty states.

Selecting an invoice opens its sub-invoice history in `components/wallet/invoicePopup.tsx`. The popup header provides an accessible SVG action that calls the parent page's `/api/wallet/getInvoice` request with the selected invoice ID, plus an icon-only close action. On success, it opens `components/wallet/orderDetailPopup.tsx`, which requests `/api/order/GetFullOrder` with its `invoiceId`, `orderInvoice.userId`, and the current system language, then displays the same read-only order-detail header, progress indicator, and item content used by the store order detail. It intentionally omits store-side accept and reject actions, while providing icon-only close and back actions; back closes only the order-detail modal to reveal the existing invoice popup.

Selecting a bank card opens `components/wallet/subInvoicePopup.tsx`. It requests `/api/wallet/getSubInvoices` for the selected card and uses the response `nextMaxId` cursor with `useInfiniteScroll` to append unique sub-invoice pages. `payment.tsx` retains each card's loaded pages and cursor, so reopening the same popup does not repeat its initial request; it also unmounts the child before the modal's close animation can render it with an empty card number. Its header provides an icon-only close action. The shared popup stylesheet uses fluid grid columns on desktop and preserves a horizontally scrollable table below 680px, rather than using the global masonry-card class; its container is a normal flex layout so card height follows table content.

The Instagramer wallet statistics page obtains monthly balance history with `/api/wallet/getBallanceHistory`. The response `statistics` array is normalized to the `IMonthGraph` series contract and rendered by `ChartDay`.

The wallet balance summary totals `totalPrice` across every general-balance entry whose `SubInvoiceStatus` is `None`; an empty matching set is displayed as zero.

The general-balance section uses a Persian `react-multi-date-picker` start-date filter. Selecting or clearing the date requests `/api/wallet/getGenerallBallance` again with `from` set to the selected day's start, or zero when cleared, and `end` set to the current timestamp. Results are grouped by card number and each card displays totals for `None`, `AwaitingSettled`, `Settled`, and `Failed` statuses, including zero-value statuses.
