import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import RingLoader from "saeed/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import OrderDetail from "saeed/components/userPanel/orders/popups/OrderDetail";
import TicketTitle from "saeed/components/userPanel/orders/popups/ticketSubject";
import initialzedTime from "saeed/helper/manageTimer";
import { handleDecompress } from "saeed/helper/pako";
import { getHubConnection } from "saeed/helper/pushNotif";
import { specifyLogistic } from "saeed/helper/specifyLogistic";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/api";
import { PushNotif, PushResponseType } from "saeed/models/push/pushNotif";
import { OrderStep } from "saeed/models/store/enum";
import { IOrderByStatus, IOrderByStatusItem, IOrderDetail, IOrderPushNotifExtended } from "saeed/models/store/orders";
import styles from "./failed.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
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

export default function Failed() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const labels = {
    all: t(LanguageKey.Storeorder_all),
    orderId: t(LanguageKey.Storeorder_ORDERID),
    customer: t(LanguageKey.shopper),
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
  const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clickedOrder, setClickedOrder] = useState<string | null>(null); // شناسه سفارشی که کلیک شده است
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const position = useRef({ startX: 0, scrollLeft: 0 });
  const [orders, setOrders] = useState<IOrderByStatus>({
    items: [],
    nextMaxId: "",
  });
  const [ticketTitle, setTicketTitle] = useState<string | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    position.current.startX = e.pageX - tableContainerRef.current.offsetLeft;
    position.current.scrollLeft = tableContainerRef.current.scrollLeft;
  };
  async function fetchMoreItem() {
    console.log("nextmaxId", orders.nextMaxId);
    if (orders.nextMaxId === null) return;
    setLoadingMore(true);
    try {
      const res = await clientFetchApi<boolean, IOrderByStatus>("/api/order/GetOrdersByStatuses", { methodType: MethodType.post, session: session, data: [
          OrderStep.UserCanceled,
          OrderStep.InstagramerCanceled,
          OrderStep.Failed,
          OrderStep.ShippingFailed,
          OrderStep.Expired,
        ], queries: [{ key: "nextMaxId", value: orders.nextMaxId }], onUploadProgress: undefined });
      if (res.succeeded) {
        console.log("GetOrdersByStatus more item res", res.value);
        setOrders((prev) => ({
          items: [...prev.items, ...res.value.items],
          nextMaxId: res.value.nextMaxId,
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingMore(false);
    }
  }
  async function fetchData() {
    try {
      const res = await clientFetchApi<boolean, IOrderByStatus>("/api/order/GetOrdersByStatuses", { methodType: MethodType.post, session: session, data: [
          OrderStep.UserCanceled,
          OrderStep.InstagramerCanceled,
          OrderStep.Failed,
          OrderStep.ShippingFailed,
          OrderStep.Expired,
        ], queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        console.log("GetOrdersByStatus res", res.value);
        setOrders(res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  const handleScroll = () => {
    const container = tableContainerRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      fetchMoreItem();
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

  const handleRowClick = (orderId: string, instagramerId: number) => {
    setOrderDetail({ orderId: orderId, instagramerId: instagramerId });
  };

  // کنترل نمایش یا عدم نمایش پاپ‌آپ
  // const isSomeSelected = state.selectedOrders.size > 0;
  // const isAllSelected = state.selectedOrders.size === orders.length;
  function handleManageOrderBySocket(order: IOrderPushNotifExtended) {
    if (
      order.NewStatus === OrderStep.UserCanceled ||
      order.NewStatus === OrderStep.InstagramerCanceled ||
      order.NewStatus === OrderStep.Failed ||
      order.NewStatus === OrderStep.Expired ||
      order.NewStatus === OrderStep.ShippingFailed
    ) {
      const orderStatus: IOrderByStatusItem = {
        systemTicketId: order.ShortOrder.SystemTicketId,
        trackingId: order.ShortOrder.TrackingId,
        city: order.ShortOrder.City,
        createdTime: order.ShortOrder.CreatedTime,
        deliveryType: order.ShortOrder.DeliveryType,
        id: order.ShortOrder.Id,
        instagramerId: order.ShortOrder.InstagramerId,
        invoiceId: order.ShortOrder.InvoiceId,
        itemCount: order.ShortOrder.ItemCount,
        logesticId: order.ShortOrder.LogesticId,
        priceType: order.ShortOrder.PriceType,
        state: order.ShortOrder.State,
        userId: order.ShortOrder.UserId,
        shortShop: {
          bannerUrl: order.ShortOrder.ShortShop!.BannerUrl,
          followerCount: order.ShortOrder.ShortShop!.FollowerCount,
          fullName: order.ShortOrder.ShortShop!.FullName,
          instagramerId: order.ShortOrder.ShortShop!.InstagramerId,
          profileUrl: order.ShortOrder.ShortShop!.ProfileUrl,
          username: order.ShortOrder.ShortShop!.Username,
          priceType: order.ShortOrder.ShortShop!.PriceType,
          productCount: order.ShortOrder.ShortShop!.ProductCount,
        },
        status: order.NewStatus,
        statusUpdateTime: order.ShortOrder.StatusUpdateTime,
        totalPrice: order.ShortOrder.TotalPrice,
        userInfo: null,
      };
      console.log("Order initialized in picking up in user", order.ShortOrder);
      setOrders((prevOrders) => ({
        ...prevOrders,
        items: [orderStatus, ...prevOrders.items],
      }));
    }
  }
  function handleGetNotif(notif: string) {
    try {
      const decombNotif = handleDecompress(notif);
      console.log("decombNotif in order", decombNotif);
      const notifObj = JSON.parse(decombNotif!) as PushNotif;
      if (notifObj.ResponseType === PushResponseType.ChangeOrderStatus && notifObj.Message) {
        console.log("notifObj.Message in picking up in user", notifObj);
        const orderMessage = JSON.parse(notifObj.Message) as IOrderPushNotifExtended;
        console.log("orderMessage", orderMessage);
        handleManageOrderBySocket(orderMessage);
      }
    } catch (error) {
      console.error("Error parsing notification:", error);
    }
  }
  function handleClickOnTicket(order: IOrderByStatusItem): void {
    if (order.systemTicketId) router.push(`/user/message?id=${order.systemTicketId}`);
    else setTicketTitle(order.id);
  }
  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      const hubConnection = getHubConnection();
      if (hubConnection) {
        console.log("hubConnection in order");
        hubConnection.off("User", handleGetNotif);
        hubConnection.on("User", handleGetNotif);
        clearInterval(intervalId);
      }
    }, 500);
  }, []);
  return (
    session?.user.currentIndex === -1 && (
      <>
        {loading && <Loading />}
        {!loading && (
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
                  <th style={{ minWidth: "160px" }}>{labels.customer}</th>
                  <th style={{ minWidth: "100px" }}>{labels.status}</th>
                  {/* <th style={{ minWidth: "50px" }}>
                {labels.items}
              </th> */}
                  <th style={{ minWidth: "100px" }}>{labels.price}</th>
                  <th style={{ minWidth: "85px" }}>{labels.orderDate}</th>

                  <th style={{ minWidth: "75px" }}>{labels.delivery}</th>
                  <th style={{ minWidth: "110px" }}>{labels.destination}</th>
                </tr>
              </thead>
              <tbody>
                {orders.items.map((order, index) => (
                  <tr onClick={() => handleRowClick(order.id, order.instagramerId)} key={index} className={styles.row}>
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
                    <td style={{ minWidth: "100px" }} className={styles.ordernumberviewed}>
                      {order.id}
                      {/* {clickedOrders.has(order.id) && <span> ✓</span>} */}
                    </td>

                    <td style={{ minWidth: "160px" }} className={styles.customer}>
                      <img
                        loading="lazy"
                        decoding="async"
                        src={basePictureUrl + order.shortShop!.profileUrl}
                        alt="profile"
                        className="instagramimage"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/no-profile.svg";
                        }}
                      />
                      <div className="instagramprofiledetail">
                        <div className="instagramusername">
                          {order.shortShop!.fullName ? order.shortShop!.fullName : ""}
                        </div>
                        <div className="instagramid translate">
                          {order.shortShop!.username ? "@" + order.shortShop!.username : ""}
                        </div>
                      </div>
                    </td>
                    <td
                      style={{ minWidth: "100px" }}
                      className={`${styles.status} ${
                        order.status === OrderStep.Failed
                          ? styles.failed
                          : order.status === OrderStep.InstagramerCanceled
                          ? styles.canceled
                          : order.status === OrderStep.UserCanceled
                          ? styles.usercanceled
                          : order.status === OrderStep.ShippingFailed
                          ? styles.returned
                          : order.status === OrderStep.Expired
                          ? styles.expired
                          : ""
                      }`}>
                      {order.status === OrderStep.Failed ? (
                        <>
                          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 20">
                            <path
                              d="M12.5 11.5 9 8m0 3.5L12.5 8m2 8.5 1 .85c.5.41 1.5-.18 1.5-.97V5.48C17 3.35 15.8 2 13.7 2H7.3C5.17 2 4.02 3.34 4.02 5.49L4 16.38c0 .79 1.08 1.38 1.51.97l.99-.85q.75-.75 1.5 0l1.32 1.26c.68.74 1.68.74 2.36 0L13 16.5q.75-.75 1.5 0"
                              stroke="var(--color-dark-red)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span>{t(LanguageKey.Storeproduct_failed)}</span>
                        </>
                      ) : order.status === OrderStep.InstagramerCanceled ? (
                        <>
                          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path
                              d="M17.5 13.46v1.32a3.24 3.24 0 0 1-3.24 3.24h-1.08M2.5 13.46v1.32a3.24 3.24 0 0 0 3.24 3.24H6.8M2.5 7.58V6.26a3.24 3.24 0 0 1 3.24-3.24h1.08M17.5 7.58V6.26a3.24 3.24 0 0 0-3.25-3.24h-1.04M7.13 6.87v.5m5.73-.5v.5m-5.73 6.8c1.93-1.59 3.84-1.62 5.73 0M10.4 7.96v1.65a1 1 0 0 1-.52.94l-.25.16"
                              stroke="var(--color-dark-yellow)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span>{"Instagramer cancelded"}</span>
                        </>
                      ) : order.status === OrderStep.UserCanceled ? (
                        <>
                          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path
                              d="M17.5 13.46v1.32a3.24 3.24 0 0 1-3.24 3.24h-1.08M2.5 13.46v1.32a3.24 3.24 0 0 0 3.24 3.24H6.8M2.5 7.58V6.26a3.24 3.24 0 0 1 3.24-3.24h1.08M17.5 7.58V6.26a3.24 3.24 0 0 0-3.25-3.24h-1.04M7.13 6.87v.5m5.73-.5v.5m-5.73 6.8c1.93-1.59 3.84-1.62 5.73 0M10.4 7.96v1.65a1 1 0 0 1-.52.94l-.25.16"
                              stroke="var(--color-dark-green)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span>{"User canceled"}</span>
                        </>
                      ) : order.status === OrderStep.ShippingRequest ? (
                        <>
                          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path
                              d="m16.5 15.63 2.25-2.25-.88-.88-2.25 2.24-2.24-2.24-.88.88 2.24 2.24-2.24 2.25.88.88 2.24-2.24 2.25 2.24.88-.88zM11.26 1.24a7.5 7.5 0 0 0-7.5 7.5v3.88L1.5 10.37l-.87.88L4.38 15l3.75-3.75-.88-.87L5 12.62V8.75a6.25 6.25 0 0 1 12.5 0v1.88h1.25V8.75a7.5 7.5 0 0 0-7.5-7.5"
                              fill="var(--color-purple)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span>{t(LanguageKey.Storeproduct_returned)}</span>
                        </>
                      ) : order.status === OrderStep.Expired ? (
                        <>
                          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path
                              d="m16.5 15.63 2.25-2.25-.88-.88-2.25 2.24-2.24-2.24-.88.88 2.24 2.24-2.24 2.25.88.88 2.24-2.24 2.25 2.24.88-.88zM11.26 1.24a7.5 7.5 0 0 0-7.5 7.5v3.88L1.5 10.37l-.87.88L4.38 15l3.75-3.75-.88-.87L5 12.62V8.75a6.25 6.25 0 0 1 12.5 0v1.88h1.25V8.75a7.5 7.5 0 0 0-7.5-7.5"
                              fill="var(--color-blue)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span>{t(LanguageKey.Storeproduct_returned)}</span>
                        </>
                      ) : null}
                    </td>
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
                      }).format("MM/DD/YYYY")}
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
                {loadingMore && <RingLoader />}
              </tbody>
            </table>
          </div>
        )}

        {/* پاپ‌آپ */}
        {orderDetail && <OrderDetail removeMask={() => setOrderDetail(null)} orderDetail={orderDetail!} />}
        {ticketTitle && <TicketTitle removeMask={() => setTicketTitle(null)} orderId={ticketTitle} />}
      </>
    )
  );
}
