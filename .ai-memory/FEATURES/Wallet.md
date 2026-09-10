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

The Instagramer payment page obtains registered bank cards with `/api/wallet/getInstagramerBankCards` and passes them to `BankCard`. `BankCard` owns the shared horizontal slider, card mapping, each card's matching general-balance status totals/date filter, and the first add-card slide. Default cards are sorted to the first real-card position and the slider starts there through `initialIndex`; changing the default remounts the slider on the new default while preserving normal user navigation afterward. The add-card slide opens the one 16-digit card-number form inline beneath its tile instead of using a modal; `BankCard` owns the form state, validation, API request to `/api/wallet/addCardNumber` mapped to `/Business/Wallet/AddCardNumber`, notifications, and card-collection refresh after success.

The Instagramer payment page retrieves invoice history from `/api/wallet/getInvoices` and passes its `IGetInvoice` response to `components/wallet/invoices.tsx`. It uses the response `nextMaxId` cursor with `useInfiniteScroll` to retrieve and append later pages while filtering duplicate invoice IDs. The component renders responsive financial cards with localized type/status labels, status-colored card accents, formatted creation times, amount, price unit, and dedicated initial/loading-more/empty states.

Selecting an invoice opens its sub-invoice history in `components/wallet/modal/invoicePopup.tsx`. The popup header provides an accessible SVG action that calls the parent page's `/api/wallet/getInvoice` request with the selected invoice ID, plus an icon-only close action. On success, it opens `components/wallet/modal/orderDetailPopup.tsx`, which requests `/api/order/GetFullOrder` with its `invoiceId`, `orderInvoice.userId`, and the current system language, then displays the same read-only order-detail header, progress indicator, and item content used by the store order detail. It intentionally omits store-side accept and reject actions, while providing icon-only close and back actions; back closes only the order-detail modal to reveal the existing invoice popup.

Selecting a bank card opens `components/wallet/modal/subInvoicePopup.tsx`. Its toggle separates sub-invoice history from card settings. The history requests `/api/wallet/getSubInvoices` for the selected card and uses the response `nextMaxId` cursor with `useInfiniteScroll` to append unique sub-invoice pages. The settings tab calls `/api/wallet/setDefaultCard` with only the selected `cardNumber` query, mapped to `/Business/Wallet/SetDefaultCard`, to make that card the default. `payment.tsx` retains each card's loaded pages and cursor, so reopening the same popup does not repeat its initial request; it also unmounts the child before the modal's close animation can render it with an empty card number. Its header provides an icon-only close action. The shared popup stylesheet uses fluid grid columns on desktop and preserves a horizontally scrollable table below 680px, rather than using the global masonry-card class; its container is a normal flex layout so card height follows table content.

The Instagramer wallet statistics page obtains monthly balance history with `/api/wallet/getBallanceHistory`. The response `statistics` array is normalized to the `IMonthGraph` series contract and rendered by `ChartDay`.

The wallet balance summary totals `totalPrice` across every general-balance entry whose `SubInvoiceStatus` is `None`; an empty matching set is displayed as zero.

Each bank-card balance section uses a Persian `react-multi-date-picker` start-date filter. Selecting or clearing the date requests `/api/wallet/getGenerallBallance` again with `from` set to the selected day's start, or zero when cleared, and `end` set to the current timestamp. Results are matched by card number and each card displays totals for `None`, `AwaitingSettled`, `Settled`, and `Failed` statuses, including zero-value statuses. The former standalone `generalBallance` component and stylesheet no longer exist.

Instagramer wallet navigation has one tab at `/wallet/payment`. The payment page includes the wallet balance summary and per-card financial status previously shown under `/wallet/statistics`; `/wallet` and the legacy statistics/title routes redirect to this canonical route.
