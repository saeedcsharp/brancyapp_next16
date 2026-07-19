import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import RingLoader from "brancy/components/design/loader/ringLoder";
import PriceFormater, { PriceFormaterClassName } from "brancy/components/priceFormater";
import initialzedTime from "brancy/helper/manageTimer";
import { specifyLogistic } from "brancy/helper/specifyLogistic";
import { LanguageKey } from "brancy/i18n";
import styles from "./6-Failed.module.css";
import { OrderStepStatus, OrderStep } from "brancy/models/enums";
import { IOrderByStatus } from "brancy/models/interfaces";
const basePictureUrl = getClientMediaBaseUrl();
const MemoizedCheckBoxButton = React.memo(CheckBoxButton);
type SortField = "orderId" | "customer" | "status" | "price" | "orderDate" | "delivery" | "destination";
type SortDirection = "asc" | "desc";
interface SelectionState {
  selectedOrders: Set<string>;
  clickedOrders: Set<string>;
  selectedMenu: boolean;
  selectAll: boolean;
  isDragging: boolean;
  startX: number;
  scrollLeft: number;
}

type SelectionAction =
  | { type: "SELECT_ALL" }
  | { type: "DESELECT_ALL" }
  | { type: "TOGGLE_SELECT_ONE"; payload: { id: string; checked: boolean } }
  | { type: "ROW_CLICK"; payload: { id: string } }
  | { type: "SET_STATE"; payload: Partial<SelectionState> };

const initialState: SelectionState = {
  selectedOrders: new Set(),
  clickedOrders: new Set(),
  selectedMenu: false,
  selectAll: false,
  isDragging: false,
  startX: 0,
  scrollLeft: 0,
};

// function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
//   switch (action.type) {
//     case "SELECT_ALL":
//       return {
//         ...state,
//         selectedOrders: new Set(orders.map((o) => o.id)),
//         selectedMenu: true,
//         selectAll: true,
//       };

//     case "DESELECT_ALL":
//       return {
//         ...state,
//         selectedOrders: new Set(),
//         selectedMenu: false,
//         selectAll: false,
//       };

//     case "TOGGLE_SELECT_ONE": {
//       const newSelectedOrders = new Set(state.selectedOrders);
//       action.payload.checked ? newSelectedOrders.add(action.payload.id) : newSelectedOrders.delete(action.payload.id);
//       return {
//         ...state,
//         selectedOrders: newSelectedOrders,
//         selectedMenu: !!newSelectedOrders.size,
//         selectAll: newSelectedOrders.size === orders.length,
//       };
//     }

//     case "ROW_CLICK":
//       return {
//         ...state,
//         clickedOrders: new Set(state.clickedOrders).add(action.payload.id),
//       };

//     case "SET_STATE":
//       return { ...state, ...action.payload };

//     default:
//       return state;
//   }
// }

export default function Failed({
  loadingMoreItem,
  orders,
  showOrder,
  // handleMoveToFailed,
  handleFetchMoreItem,
}: {
  loadingMoreItem: boolean;
  orders: IOrderByStatus;
  showOrder: (orderId: string, userId: number) => void;
  // handleMoveToFailed: () => void;
  handleFetchMoreItem: (nextMaxId: string | null, orderStep: OrderStepStatus) => void;
}) {
  const { t } = useTranslation();
  const labels = {
    all: t(LanguageKey.Storeorder_all),
    orderId: t(LanguageKey.Storeorder_ORDERID),
    customer: t(LanguageKey.Storeorder_CUSTOMER),
    items: t(LanguageKey.Storeorder_ITEMS),
    price: t(LanguageKey.Storeorder_PRICE),
    orderDate: t(LanguageKey.Storeorder_OrderDATE),
    delivery: t(LanguageKey.Storeorder_DELIVERY),
    destination: t(LanguageKey.Storeorder_Destination),
    status: t(LanguageKey.Storeorder_STATUS),
    sentdate: t(LanguageKey.Storeorder_SentDATE),
    deliverdate: t(LanguageKey.Storeorder_deliverdate),
    comment: t(LanguageKey.comments),
  };
  // const [state, dispatch] = useReducer(selectionReducer, initialState);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [clickedOrder, setClickedOrder] = useState<string | null>(null); // شناسه سفارشی که کلیک شده است
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const position = useRef({ startX: 0, scrollLeft: 0 });
  const handleCopyMobileNumber = (phoneNumber?: string | null) => {
    if (!phoneNumber) return;
    navigator.clipboard.writeText(phoneNumber);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    position.current.startX = e.pageX - tableContainerRef.current.offsetLeft;
    position.current.scrollLeft = tableContainerRef.current.scrollLeft;
  };
  const handleScroll = () => {
    const container = tableContainerRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      handleFetchMoreItem(orders.nextMaxId, OrderStepStatus.Failed);
    }
  };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !tableContainerRef.current) return;
      e.preventDefault();
      const x = e.pageX - tableContainerRef.current.offsetLeft;
      tableContainerRef.current.scrollLeft = position.current.scrollLeft - (x - position.current.startX);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);
  // const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
  //   dispatch({ type: e.target.checked ? "SELECT_ALL" : "DESELECT_ALL" });
  // };

  // const handleToggleOrder = (e: ChangeEvent<HTMLInputElement>, orderId: string) => {
  //   dispatch({
  //     type: "TOGGLE_SELECT_ONE",
  //     payload: { id: orderId, checked: e.target.checked },
  //   });
  // };

  const handleRowClick = (orderId: string, userId: number) => {
    // if (!state.clickedOrders.has(orderId)) {
    //   dispatch({ type: "ROW_CLICK", payload: { id: orderId } });
    // }
    showOrder(orderId, userId);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const sortedOrders = useMemo(() => {
    if (!sortField) return orders.items;

    const sorted = [...orders.items];
    sorted.sort((leftOrder, rightOrder) => {
      let compareValue = 0;

      switch (sortField) {
        case "orderId":
          compareValue = (leftOrder.order.id || "").localeCompare(rightOrder.order.id || "", undefined, {
            numeric: true,
            sensitivity: "base",
          });
          break;
        case "customer":
          compareValue = (
            leftOrder.userProfile?.fullName ||
            leftOrder.userProfile?.username ||
            leftOrder.userProfile?.phoneNumber ||
            ""
          ).localeCompare(
            rightOrder.userProfile?.fullName ||
              rightOrder.userProfile?.username ||
              rightOrder.userProfile?.phoneNumber ||
              "",
            undefined,
            { sensitivity: "base" },
          );
          break;
        case "status":
          compareValue = String(leftOrder.order.status || "").localeCompare(
            String(rightOrder.order.status || ""),
            undefined,
            { sensitivity: "base" },
          );
          break;
        case "price":
          compareValue = (leftOrder.order.totalPrice || 0) - (rightOrder.order.totalPrice || 0);
          break;
        case "orderDate":
          compareValue = (leftOrder.order.createdTime || 0) - (rightOrder.order.createdTime || 0);
          break;
        case "delivery":
          compareValue = specifyLogistic(leftOrder.order.logesticId).localeCompare(
            specifyLogistic(rightOrder.order.logesticId),
            undefined,
            { sensitivity: "base" },
          );
          break;
        case "destination":
          compareValue = (leftOrder.order.city || "").localeCompare(rightOrder.order.city || "", undefined, {
            sensitivity: "base",
          });
          break;
      }

      return sortDirection === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [orders.items, sortDirection, sortField]);

  const renderSortIndicator = (field: SortField) =>
    sortField === field ? <span style={{ marginInlineStart: 4 }}>{sortDirection === "asc" ? "↑" : "↓"}</span> : null;

  // کنترل نمایش یا عدم نمایش پاپ‌آپ
  // const isSomeSelected = state.selectedOrders.size > 0;
  // const isAllSelected = state.selectedOrders.size === orders.length;

  return (
    <>
      <div
        onScroll={handleScroll}
        className={styles.tableContainer}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={() => setIsDragging(false)}
        ref={tableContainerRef}>
        {/* نمایش پاپ‌آپ در صورت انتخاب شدن یک یا چند چک‌باکس */}

        <table className={styles.table}>
          <thead className={styles.headertable}>
            <tr>
              <th style={{ minWidth: "50px", maxWidth: "50px" }}>
                {/* <MemoizedCheckBoxButton
                  name={"select-all"}
                  handleToggle={handleSelectAll}
                  value={isAllSelected}
                  textlabel={labels.all}
                  title={"Select all"}
                /> */}
                #
              </th>
              <th
                onClick={() => handleSort("orderId")}
                aria-sort={sortField === "orderId" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                style={{ minWidth: "100px", maxWidth: "100px", cursor: "pointer", userSelect: "none" }}>
                {labels.orderId} {renderSortIndicator("orderId")}
                {/* {isSomeSelected && (
                  <div className={styles.selectedmenu}>
                    <p>
                      {t(LanguageKey.messagesetting_selectedwords)} ( <strong>{state.selectedOrders.size}</strong> )
                    </p>
                    <img
                      loading="lazy"
                      decoding="async"
                      onClick={() => dispatch({ type: "DESELECT_ALL" })}
                      style={{
                        cursor: "pointer",
                        width: "30px",
                        height: "30px",
                        padding: "var(--padding-5)",
                      }}
                      title="ℹ️ close"
                      src="/deleteHashtag.svg"
                    />
                    <img
                      loading="lazy"
                      decoding="async"
                      onClick={() => handleMoveToFailed()}
                      style={{
                        cursor: "pointer",
                        width: "30px",
                        height: "30px",
                        padding: "var(--padding-5)",
                      }}
                      title="ℹ️ approve"
                      src="/click-hashtag.svg"
                    />
                  </div>
                )} */}
              </th>
              <th
                onClick={() => handleSort("customer")}
                aria-sort={sortField === "customer" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                style={{ minWidth: "210px", maxWidth: "210px", cursor: "pointer", userSelect: "none" }}>
                {labels.customer} {renderSortIndicator("customer")}
              </th>
              <th
                onClick={() => handleSort("status")}
                aria-sort={sortField === "status" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                style={{ minWidth: "150px", maxWidth: "150px", cursor: "pointer", userSelect: "none" }}>
                {labels.status} {renderSortIndicator("status")}
              </th>
              {/* <th style={{ minWidth: "50px" }}>
                {labels.items}
              </th> */}
              <th
                onClick={() => handleSort("price")}
                aria-sort={sortField === "price" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                style={{ minWidth: "100px", maxWidth: "100px", cursor: "pointer", userSelect: "none" }}>
                {labels.price} {renderSortIndicator("price")}
              </th>
              <th
                onClick={() => handleSort("orderDate")}
                aria-sort={sortField === "orderDate" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                style={{ minWidth: "85px", maxWidth: "85px", cursor: "pointer", userSelect: "none" }}>
                {labels.orderDate} {renderSortIndicator("orderDate")}
              </th>

              <th
                onClick={() => handleSort("delivery")}
                aria-sort={sortField === "delivery" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                style={{ minWidth: "75px", maxWidth: "75px", cursor: "pointer", userSelect: "none" }}>
                {labels.delivery} {renderSortIndicator("delivery")}
              </th>
              <th
                onClick={() => handleSort("destination")}
                aria-sort={
                  sortField === "destination" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                }
                style={{ minWidth: "110px", maxWidth: "110px", cursor: "pointer", userSelect: "none" }}>
                {labels.destination} {renderSortIndicator("destination")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, index) => (
              <tr onClick={() => handleRowClick(order.order.id, order.order.userId)} key={index} className={styles.row}>
                <td
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{ minWidth: "50px", maxWidth: "50px" }}>
                  {/* <MemoizedCheckBoxButton
                    handleToggle={(e) => handleToggleOrder(e, order.id)}
                    value={state.selectedOrders.has(order.id)}
                    textlabel={`${index + 1}`}
                    name={`order-${order.id}`}
                    title={"Select order"}
                  /> */}
                  {index + 1}
                </td>
                <td style={{ minWidth: "100px", maxWidth: "100px" }} className={styles.ordernumberviewed}>
                  {order.order.id}
                  {/* {clickedOrders.has(order.id) && <span> ✓</span>} */}
                </td>

                <td style={{ minWidth: "210px", maxWidth: "210px" }} className={styles.customer}>
                  <img
                    loading="lazy"
                    decoding="async"
                    src={basePictureUrl + order.userProfile!.profileUrl}
                    alt="profile"
                    className="instagramimage"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/no-profile.svg";
                    }}
                  />
                  <div className="instagramprofiledetail">
                    {order.userProfile!.fullName ? (
                      <>
                        <div className="instagramusername">{order.userProfile!.fullName}</div>
                        <div className="instagramid">
                          {order.userProfile!.username
                            ? "@" + order.userProfile!.username
                            : order.userProfile?.phoneNumber}
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="instagramusername"
                          style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{t(LanguageKey.userpanel_MobileNumber)}</span>
                        </div>
                        <div className="instagramid">
                          {order.userProfile?.phoneNumber ? `+${order.userProfile.phoneNumber}` : "--"}
                          <img
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyMobileNumber(order.userProfile?.phoneNumber || null);
                            }}
                            style={{ cursor: "pointer", width: "15px", height: "15px" }}
                            title="ℹ️ copy mobile number"
                            src="/copy.svg"
                            alt="copy mobile number"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </td>
                <td
                  style={{ minWidth: "150px", maxWidth: "150px" }}
                  className={`${styles.status} ${
                    order.order.status === OrderStep.Failed
                      ? styles.failed
                      : order.order.status === OrderStep.InstagramerCanceled
                        ? styles.canceled
                        : order.order.status === OrderStep.UserCanceled
                          ? styles.usercanceled
                          : order.order.status === OrderStep.ShippingFailed
                            ? styles.returned
                            : ""
                  }`}>
                  {order.order.status === OrderStep.Failed ? (
                    <span>{t(LanguageKey.Storeproduct_failed)}</span>
                  ) : order.order.status === OrderStep.InstagramerCanceled ? (
                    <span>{t(LanguageKey.Storeproduct_canceledbyadmin)}</span>
                  ) : order.order.status === OrderStep.UserCanceled ? (
                    <span>{t(LanguageKey.Storeproduct_canceledbyuser)}</span>
                  ) : order.order.status === OrderStep.ShippingRequest ? (
                    <span>{t(LanguageKey.Storeproduct_returned)}</span>
                  ) : null}
                </td>
                {/* <td style={{ minWidth: "50px" }} className={styles.items}>
                  {order.items}
                </td> */}

                <td style={{ minWidth: "100px", maxWidth: "100px" }} className={styles.items}>
                  <PriceFormater
                    fee={order.order.totalPrice}
                    pricetype={order.order.priceType}
                    className={PriceFormaterClassName.PostPrice}
                  />
                </td>
                <td style={{ minWidth: "85px", maxWidth: "85px" }} className={styles.date}>
                  {new DateObject({
                    date: order.order.createdTime * 1000,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("YYYY/MM/DD")}
                  <br />
                  {new DateObject({
                    date: order.order.createdTime * 1000,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("HH:mm:ss")}
                  {/* <span className={styles.day}>
                    {new DateObject(v.date).format("YYYY")}
                  </span>
                  /
                  <span className={styles.day}>
                    {new DateObject(v.date).format("MM")}
                  </span>
                  /
                  <span className={styles.day}>
                    {new DateObject(v.date).format("DD")}
                  </span>
                  <br></br>
                  <span className={styles.hour}>
                    {new DateObject(v.date).format("hh")}
                  </span>
                  :
                  <span className={styles.hour}>
                    {new DateObject(v.date).format("mm A")}
                  </span> */}
                </td>

                <td
                  style={{ minWidth: "75px", maxWidth: "75px" }}
                  className={`${styles.delivery} ${styles[specifyLogistic(order.order.logesticId)]}`}>
                  {specifyLogistic(order.order.logesticId)}
                </td>
                <td style={{ minWidth: "110px", maxWidth: "110px" }} className={styles.destination}>
                  {order.order.city ?? "--"}
                </td>
              </tr>
            ))}
            {loadingMoreItem && <RingLoader />}
          </tbody>
        </table>
      </div>
      {/* پاپ‌آپ */}
    </>
  );
}
