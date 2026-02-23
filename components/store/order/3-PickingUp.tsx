import React, { useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CheckBoxButton from "../../design/checkBoxButton";
import RingLoader from "../../design/loader/ringLoder";
import PriceFormater, { PriceFormaterClassName, PriceType } from "../../priceFormater";
import initialzedTime from "../../../helper/manageTimer";
import { specifyLogistic } from "../../../helper/specifyLogistic";
import { LanguageKey } from "../../../i18n";
import { OrderStepStatus } from "../../../models/store/enum";
import { IOrderByStatus, IOrderByStatusItem } from "../../../models/store/orders";
import styles from "./3-PickingUp.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const MemoizedCheckBoxButton = React.memo(CheckBoxButton);
interface SelectionState {
  selectedOrders: Set<string>;
  clickedOrders: Set<string>;
  selectedmenu: boolean;
  selectAll: boolean;
  isDragging: boolean;
  startX: number;
  scrollLeft: number;
}

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
  selectedmenu: false,
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

export default function PickingUp({
  orderInProcess,
  loadingMoreItem,
  orders,
  handleGetShippingRequestType,
  handleFetchMoreItem,
}: {
  orderInProcess: string[];
  loadingMoreItem: boolean;
  orders: IOrderByStatus;
  handleGetShippingRequestType: (orderId: string, userId: number) => void;
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
  // const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
  //   dispatch({
  //     type: e.target.checked ? "SELECT_ALL" : "DESELECT_ALL",
  //     payload: e.target.checked ? { orders } : undefined,
  //   });
  // };

  // const handleToggleOrder = (
  //   e: ChangeEvent<HTMLInputElement>,
  //   orderId: string
  // ) => {
  //   dispatch({
  //     type: "TOGGLE_SELECT_ONE",
  //     payload: { id: orderId, checked: e.target.checked },
  //   });
  // };

  const handleRowClick = (orderId: string, userId: number) => {
    if (!state.clickedOrders.has(orderId)) {
      dispatch({ type: "ROW_CLICK", payload: { id: orderId } });
    }
    handleGetShippingRequestType(orderId, userId);
  };
  const handleScroll = () => {
    const container = tableContainerRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      handleFetchMoreItem(orders.nextMaxId, OrderStepStatus.Pickingup);
    }
  };
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
                {/* {isSomeSelected && (
                  <div className={styles.selectedmenu}>
                    <p>
                      {t(LanguageKey.messagesetting_selectedwords)} ({" "}
                      <strong>{state.selectedOrders.size}</strong> )
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
                      onClick={() => {
                        dispatch({ type: "DESELECT_ALL" });
                        handleGetShippingRequestType(state.selectedOrders);
                      }}
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
              <th style={{ minWidth: "160px" }}>{labels.customer}</th>
              <th style={{ minWidth: "50px" }}>{labels.items}</th>
              <th style={{ minWidth: "100px" }}>{labels.price}</th>
              <th style={{ minWidth: "85px" }}>{labels.orderDate}</th>
              <th style={{ minWidth: "75px" }}>{labels.delivery}</th>
              <th style={{ minWidth: "110px" }}>{labels.destination}</th>
            </tr>
          </thead>
          <tbody>
            {orders.items.map((order, index) => (
              <tr onClick={() => handleRowClick(order.id, order.userId)} key={index} className={styles.row}>
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
                  {orderInProcess.find((x) => x === order.id) ? "InProcess" : index + 1}
                </td>
                <td
                  style={{ minWidth: "100px" }}
                  className={state.clickedOrders.has(order.id) ? styles.ordernumberviewed : styles.ordernumber}>
                  {order.id}
                  {/* {clickedOrders.has(order.id) && <span> ✓</span>} */}
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
                  style={{ minWidth: "150px" }}
                  className={`${styles.status} ${
                    order.status === OrderStatus.RequestedPickup
                      ? styles.requestsent
                      : order.status === OrderStatus.PickedUp
                      ? styles.pickedup
                      : ""
                  }`}>
                  {order.status === OrderStatus.RequestedPickup && (
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 21 20">
                      <path
                        d="m3.74 5.62 1.74.5 3.77 9.33m1.48.56 6.66-2.66m-6.58 3.04a1.1 1.1 0 0 0-1.12-1.05 1.08 1.08 0 1 0 1.12 1.05m3.87-3.98-2.24.87c-.78.3-1.5-.06-1.8-.84l-.53-1.4c-.3-.78-.03-1.51.76-1.82l2.24-.86c.78-.3 1.48.06 1.78.84l.54 1.4c.3.78.03 1.5-.75 1.8m-2.33-5.75-2.24.87c-.78.3-1.5-.06-1.8-.84l-.52-1.4c-.3-.78-.04-1.52.75-1.82l2.24-.86c.78-.3 1.48.06 1.79.83l.53 1.4c.3.78.03 1.52-.75 1.82"
                        stroke="var(--color-gray)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {order.status === OrderStatus.PickedUp && (
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 21 20">
                      <path
                        d="m6.78 4.7 6.48 3.75v2.28m-9.98-4 6.48 3.74 6.47-3.75M9.76 18v-7.54m6.76-2.7v5.46c0 .73-.39 1.4-1.01 1.76l-4.74 2.73c-.62.36-1.4.36-2.02 0L4 14.98a2 2 0 0 1-1-1.76V7.76c0-.73.39-1.4 1.01-1.76l4.74-2.73c.62-.36 1.4-.36 2.02 0L15.51 6a2 2 0 0 1 1.01 1.76"
                        stroke="var(--color-firoze)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <span>
                    {order.status === OrderStatus.RequestedPickup
                      ? t(LanguageKey.Storeorder_requestedpickup)
                      : order.status === OrderStatus.PickedUp
                      ? t(LanguageKey.Storeorder_Pickedup)
                      : ""}
                  </span>
                </td> */}
                <td style={{ minWidth: "50px" }} className={styles.items}>
                  {order.itemCount}
                </td>

                <td style={{ minWidth: "100px" }} className={styles.fee}>
                  <PriceFormater
                    fee={order.totalPrice}
                    pricetype={PriceType.Toman}
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
