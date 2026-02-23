import React, { ChangeEvent, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import RingLoader from "brancy/components/design/loader/ringLoder";
import { internalNotify, InternalResponseType, NotifType } from "brancy/components/notifications/notificationBox";
import PriceFormater, { PriceFormaterClassName } from "brancy/components/priceFormater";
import initialzedTime from "brancy/helper/manageTimer";
import { specifyLogistic } from "brancy/helper/specifyLogistic";
import { LanguageKey } from "brancy/i18n";
import { OrderStepStatus } from "brancy/models/store/enum";
import { IOrderByStatus, IOrderByStatusItem } from "brancy/models/store/orders";
import styles from "brancy/components/store/order/5-Delivered.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const MemoizedCheckBoxButton = React.memo(CheckBoxButton);
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
  | { type: "SELECT_ALL"; payload?: { orders?: IOrderByStatus } }
  | { type: "DESELECT_ALL" }
  | {
      type: "TOGGLE_SELECT_ONE";
      payload: { id: string; checked: boolean; totalOrders?: number };
    }
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

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case "SELECT_ALL":
      return {
        ...state,
        selectedOrders: new Set(action.payload?.orders?.items.map((o: IOrderByStatusItem) => o.id) || []),
        selectedMenu: true,
        selectAll: true,
      };

    case "DESELECT_ALL":
      return {
        ...state,
        selectedOrders: new Set(),
        selectedMenu: false,
        selectAll: false,
      };

    case "TOGGLE_SELECT_ONE": {
      const newSelectedOrders = new Set(state.selectedOrders);
      action.payload.checked ? newSelectedOrders.add(action.payload.id) : newSelectedOrders.delete(action.payload.id);
      return {
        ...state,
        selectedOrders: newSelectedOrders,
        selectedMenu: !!newSelectedOrders.size,
        selectAll: newSelectedOrders.size === (action.payload.totalOrders || 0),
      };
    }

    case "ROW_CLICK":
      return {
        ...state,
        clickedOrders: new Set(state.clickedOrders).add(action.payload.id),
      };

    case "SET_STATE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export default function Delivered({
  loadingMoreItem,
  orders,
  showOrder,
  handleFetchMoreItem,
}: {
  loadingMoreItem: boolean;
  orders: IOrderByStatus;
  showOrder: (orderId: string, userId: number, trackingId: string | null) => void;

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
  const [state, dispatch] = useReducer(selectionReducer, initialState);
  const [clickedOrder, setClickedOrder] = useState<string | null>(null); // شناسه سفارشی که کلیک شده است
  const [clickedOrders, setClickedOrders] = useState<string[]>([]); // ذخیره سفارشات کلیک شده
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const position = useRef({ startX: 0, scrollLeft: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    position.current.startX = e.pageX - tableContainerRef.current.offsetLeft;
    position.current.scrollLeft = tableContainerRef.current.scrollLeft;
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
  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: e.target.checked ? "SELECT_ALL" : "DESELECT_ALL" });
  };

  const handleToggleOrder = (e: ChangeEvent<HTMLInputElement>, orderId: string) => {
    dispatch({
      type: "TOGGLE_SELECT_ONE",
      payload: { id: orderId, checked: e.target.checked },
    });
  };

  const handleRowClick = (orderId: string, userId: number, trackingId: string | null) => {
    if (!state.clickedOrders.has(orderId)) {
      dispatch({ type: "ROW_CLICK", payload: { id: orderId } });
    }
    showOrder(orderId, userId, trackingId);
  };

  const handleCopyTrackingCode = (trackingCode: string) => {
    navigator.clipboard.writeText(trackingCode).then(() => {
      internalNotify(InternalResponseType.CopyTrackingpost, NotifType.Info);
    });
  };
  const handleScroll = () => {
    const container = tableContainerRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      handleFetchMoreItem(orders.nextMaxId, OrderStepStatus.Pickingup);
    }
  };
  // کنترل نمایش یا عدم نمایش پاپ‌آپ
  const isSomeSelected = state.selectedOrders.size > 0;
  const isAllSelected = state.selectedOrders.size === orders.items.length;

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
              <th style={{ minWidth: "50px" }}>
                {/* <MemoizedCheckBoxButton
                  name={"select-all"}
                  handleToggle={handleSelectAll}
                  value={isAllSelected}
                  textlabel={labels.all}
                  title={"Select all"}
                /> */}
                #
              </th>
              <th style={{ minWidth: "100px" }}>
                {labels.orderId}
                {isSomeSelected && (
                  <div className={styles.selectedmenu}>
                    <p>
                      {t(LanguageKey.messagesetting_selectedwords)} ( <strong>{state.selectedOrders.size}</strong> )
                    </p>
                    <img
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
                      onClick={() => {}}
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
                )}
              </th>
              <th style={{ minWidth: "160px" }}>{labels.customer}</th>
              {/* <th style={{ minWidth: "50px" }}>{labels.items}</th> */}
              <th style={{ minWidth: "100px" }}>{labels.price}</th>
              <th style={{ minWidth: "85px" }}>{labels.orderDate}</th>
              <th style={{ minWidth: "75px" }}>{labels.delivery}</th>
              <th style={{ minWidth: "110px" }}>{labels.destination}</th>
            </tr>
          </thead>
          <tbody>
            {orders.items.map((order, index) => (
              <tr
                onClick={() => handleRowClick(order.id, order.userId, order.trackingId)}
                key={index}
                className={styles.row}>
                <td
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{ minWidth: "50px" }}>
                  {/* <MemoizedCheckBoxButton
                    handleToggle={(e) => handleToggleOrder(e, order.id)}
                    value={state.selectedOrders.has(order.id)}
                    textlabel={`${index + 1}`}
                    name={`order-${order.id}`}
                    title={"Select order"}
                  /> */}
                  {index + 1}
                </td>
                <td
                  style={{ minWidth: "100px" }}
                  className={state.clickedOrders.has(order.id) ? styles.ordernumberviewed : styles.ordernumber}>
                  {order.id}
                  {/* {<span> ✓</span>} */}
                </td>

                <td style={{ minWidth: "160px" }} className={`${styles.customer} translate`}>
                  <img
                    loading="lazy"
                    decoding="async"
                    src={basePictureUrl + order.userInfo!.profileUrl}
                    alt="profile"
                    className="instagramimage"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/no-profile.svg";
                    }}
                  />
                  <div className={`${styles.instagramprofiledetail} translate`}>
                    <div className="instagramusername">
                      {order.userInfo!.fullName ? order.userInfo!.fullName : order.userInfo?.phoneNumber}
                    </div>
                    <div className="instagramid"> {order.userInfo!.username ? "@" + order.userInfo!.username : ""}</div>
                  </div>
                </td>

                {/* <td
                  style={{ minWidth: "205px" }}
                  className={`${styles.status} ${
                    order.status === OrderStatus.TrackingCodeIssued
                      ? styles.TrackingCode
                      : ""
                  }`}
                  onClick={() =>
                    order.status === OrderStatus.TrackingCodeIssued &&
                    handleCopyTrackingCode(order.trackingCode)
                  }
                  onMouseEnter={() => setHoveredOrder(order.id)}
                  onMouseLeave={() => setHoveredOrder(null)}>
                  {order.status === OrderStatus.TrackingCodeIssued &&
                  hoveredOrder === order.id ? (
                    <div className={styles.copytrackingcode}>
                      <img
                        loading="lazy"
                        decoding="async"
                        style={{
                          cursor: "pointer",
                          width: "15px",
                          height: "15px",
                        }}
                        title="ℹ️ copy"
                        src="/copy-blue.svg"
                      />
                      <span>{t(LanguageKey.copytrackingcode)}</span>
                    </div>
                  ) : (
                    <>{order.trackingCode}</>
                  )}
                </td> */}
                {/* <td style={{ minWidth: "50px" }} className={styles.items}>
                  {order.items}
                </td> */}
                <td style={{ minWidth: "100px" }} className={styles.fee}>
                  <PriceFormater
                    fee={order.totalPrice}
                    pricetype={order.priceType}
                    className={PriceFormaterClassName.PostPrice}
                  />
                </td>
                <td style={{ minWidth: "85px" }} className={styles.date}>
                  {new DateObject({
                    date: order.createdTime * 1000,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("YYYY/MM/DD")}
                  <br />
                  {new DateObject({
                    date: order.createdTime * 1000,
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

                {/* <td
                  style={{ minWidth: "75px" }}
                  className={`${styles.delivery} ${
                    styles[order.delivery.toLowerCase()]
                  }`}>
                  {order.delivery}
                </td> */}
                {/* <td
                  style={{ minWidth: "110px" }}
                  className={styles.destination}>
                  {order.city ?? "--"}
                </td> */}

                {/* <td style={{ minWidth: "70px" }} className={styles.comments}>
                  <svg
                    width="20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20">
                    <path
                      d="M10.94 10a.94.94 0 1 1-1.88 0 .94.94 0 0 1 1.88 0m-4.38-.94a.94.94 0 1 0 0 1.88.94.94 0 0 0 0-1.88m6.88 0a.94.94 0 1 0 0 1.88.94.94 0 0 0 0-1.88m4.69.94a8.13 8.13 0 0 1-11.95 7.17l-2.66.9a1.25 1.25 0 0 1-1.58-1.59l.89-2.66A8.12 8.12 0 1 1 18.13 10m-1.25 0a6.88 6.88 0 1 0-12.83 3.44.6.6 0 0 1 .05.51l-.97 2.93 2.92-.98a.6.6 0 0 1 .5.05A6.88 6.88 0 0 0 16.89 10"
                      fill="var(--text-h1)"
                    />
                  </svg>
                  <span>{order.comment}</span>
                </td> */}
                <td
                  style={{ minWidth: "75px" }}
                  className={`${styles.delivery} ${styles[specifyLogistic(order.logesticId)]}`}>
                  {specifyLogistic(order.logesticId)}
                </td>
                <td style={{ minWidth: "110px" }} className={styles.destination}>
                  {order.city ?? "--"}
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
