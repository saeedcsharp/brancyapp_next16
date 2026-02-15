import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useReducer, useRef, useState } from "react";
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
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import { PushNotif, PushResponseType } from "saeed/models/push/pushNotif";
import { LogisticType, OrderStep } from "saeed/models/store/enum";
import { IOrderByStatus, IOrderByStatusItem, IOrderDetail, IOrderPushNotifExtended } from "saeed/models/store/orders";
import styles from "./inprogress.module.css";
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
function specifyLogistic(id: number | null): string {
  switch (id) {
    case LogisticType.IRPost_Pishtaz:
      return "pishtaz";
    case LogisticType.IRPost_Special:
      return "post";
    case LogisticType.IRPost_Tipax:
      return "tipax";
    default:
      return "--";
  }
}
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
const InProgress = () => {
  //  return <Soon />;
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderDetailId, setOrderDetailId] = useState<IOrderDetail | null>(null);
  const [ticketTitle, setTicketTitle] = useState<string | null>(null);
  const [state, dispatch] = useReducer(selectionReducer, initialState);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const position = useRef({ startX: 0, scrollLeft: 0 });
  const [orders, setOrders] = useState<IOrderByStatus>({
    items: [],
    nextMaxId: "",
  });
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
    dispatch({
      type: e.target.checked ? "SELECT_ALL" : "DESELECT_ALL",
      payload: e.target.checked ? { orders } : undefined,
    });
  };

  const handleToggleOrder = (e: ChangeEvent<HTMLInputElement>, orderId: string) => {
    dispatch({
      type: "TOGGLE_SELECT_ONE",
      payload: {
        id: orderId,
        checked: e.target.checked,
        totalOrders: orders.items.length,
      },
    });
  };

  const handleRowClick = (orderId: string, instagramerId: number) => {
    // if (!state.clickedOrders.has(orderId)) {
    //   dispatch({ type: "ROW_CLICK", payload: { id: orderId } });
    // }
    console.log("handleRowClick", orderId, instagramerId);
    setOrderDetailId({
      orderId: orderId,
      instagramerId: instagramerId,
    });
  };

  const isSomeSelected = state.selectedOrders.size > 0;
  const isAllSelected = state.selectedOrders.size === orders.items.length;
  async function handleRejectOrder(orderIds: Set<string>) {
    console.log("handleRejectOrder", orderIds);
    setOrderDetailId(null);
    if (orderIds.size === 0) return;
    const results = await Promise.all(
      Array.from(orderIds).map((orderId) =>
        GetServerResult<boolean, boolean>(MethodType.get, session, "User/Order/RejectOrder", null, [
          { key: "orderId", value: orderId },
        ])
      )
    );
    const successfulOrderIds = new Set<string>();
    const failedResults: any[] = [];
    results.forEach((result, index) => {
      const orderId = Array.from(orderIds)[index];
      if (result.succeeded) {
        successfulOrderIds.add(orderId);
      } else {
        failedResults.push(result);
      }
    });
    if (successfulOrderIds.size > 0) {
      setOrders((prevOrders) => {
        // Find orders that were successfully accepted
        const ordersToMove = prevOrders.items.filter((order) => !successfulOrderIds.has(order.id));

        return { items: ordersToMove, nextMaxId: prevOrders.nextMaxId };
      });
    }
    if (failedResults.length > 0) {
    }
  }
  async function fetchMoreItem() {
    console.log("nextmaxId", orders.nextMaxId);
    if (orders.nextMaxId === null) return;
    setLoadingMore(true);
    try {
      const res = await GetServerResult<boolean, IOrderByStatus>(
        MethodType.post,
        session,
        "User/Order/GetOrdersByStatuses",
        [OrderStep.Paid, OrderStep.InstagramerAccepted],
        [{ key: "nextMaxId", value: orders.nextMaxId }]
      );
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
      const res = await GetServerResult<boolean, IOrderByStatus>(
        MethodType.post,
        session,
        "User/Order/GetOrdersByStatuses",
        [OrderStep.Paid, OrderStep.InstagramerAccepted]
      );
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
  function handleManageOrderBySocket(order: IOrderPushNotifExtended) {
    if (
      order.NewStatus === OrderStep.UserCanceled ||
      order.NewStatus === OrderStep.InstagramerCanceled ||
      order.NewStatus === OrderStep.Failed ||
      order.NewStatus === OrderStep.Expired ||
      order.NewStatus === OrderStep.ShippingFailed
    ) {
      setOrders((prevOrders) => {
        const updatedItems = prevOrders.items.filter((item) => item.id !== order.ShortOrder.Id);
        return { ...prevOrders, items: updatedItems };
      });
      return;
    } else if (order.NewStatus === OrderStep.Paid || order.NewStatus === OrderStep.InstagramerAccepted) {
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
      console.log("Order initialized in inprogress in user", order.ShortOrder);
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
          <div className={styles.orderstepcontent}>
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
                    <th style={{ minWidth: "50px" }}>#</th>
                    <th style={{ minWidth: "95px" }}>
                      {labels.orderId}
                      {isSomeSelected && (
                        <div className={styles.selectedmenu}>
                          <p>
                            {t(LanguageKey.messagesetting_selectedwords)} ( <strong>{state.selectedOrders.size}</strong>{" "}
                            )
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
                            onClick={() => {
                              handleRejectOrder(state.selectedOrders);
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
                      )}
                    </th>
                    <th style={{ minWidth: "160px" }}>{labels.customer}</th>
                    <th style={{ minWidth: "100px" }}>{labels.status}</th>
                    <th style={{ minWidth: "50px" }}>{labels.items}</th>
                    <th style={{ minWidth: "100px" }}>{labels.price}</th>
                    <th style={{ minWidth: "85px" }}>{labels.orderDate}</th>
                    <th style={{ minWidth: "75px" }}>{labels.delivery}</th>
                    <th style={{ minWidth: "110px" }}>{labels.destination}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.items.map((order, index) => (
                    <tr
                      onClick={() => handleRowClick(order.id, order.shortShop!.instagramerId)}
                      key={index}
                      className={styles.row}>
                      <td style={{ minWidth: "50px" }} title={`order-${order.id}`}>{`${index + 1}`}</td>
                      <td
                        style={{ minWidth: "90px" }}
                        className={state.clickedOrders.has(order.id) ? styles.ordernumberviewed : styles.ordernumber}>
                        {order.id}
                        {/* {clickedOrders.has(order.id) && <span> ✓</span>} */}
                      </td>

                      <td style={{ minWidth: "160px" }} className={styles.customer}>
                        <img
                          loading="lazy"
                          decoding="async"
                          src={order.shortShop ? basePictureUrl + order.shortShop!.profileUrl : ""}
                          alt="profile"
                          className="instagramimage"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/no-profile.svg";
                          }}
                        />
                        <div className="instagramprofiledetail">
                          <div className="instagramusername">{order.shortShop ? order.shortShop!.fullName : ""}</div>
                          <div className="instagramid translate">
                            {order.shortShop ? "@" + order.shortShop!.username : ""}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{ minWidth: "150px" }}
                        className={`${styles.status} ${
                          order.status === OrderStep.Paid
                            ? styles.pickupRequest
                            : order.status === OrderStep.InstagramerAccepted
                            ? styles.pickedup
                            : ""
                        }`}>
                        {order.status === OrderStep.Paid && (
                          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 25">
                            <path
                              d="m9 8.94 3-3.01m0 0 3 3m-3-3v8.02m-6 2a19 19 0 0 0 12 0M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7"
                              stroke="var(--color-purple)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {order.status === OrderStep.InstagramerAccepted && (
                          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 20">
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
                          {order.status === OrderStep.Paid
                            ? t(LanguageKey.Storeorder_requestedpickup)
                            : order.status === OrderStep.InstagramerAccepted
                            ? t(LanguageKey.Storeorder_Pickedup)
                            : ""}
                        </span>
                      </td>
                      <td style={{ minWidth: "50px" }} className={styles.items}>
                        {order.itemCount}
                      </td>

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
                        }).format("MM/DD/YYYY ")}
                        <br />
                        {new DateObject({
                          date: order.createdTime * 1000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format(" hh:mm A")}
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
                        {order.city ? order.city : "--"}
                      </td>
                    </tr>
                  ))}
                  {loadingMore && <RingLoader />}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {orderDetailId && (
          <OrderDetail
            removeMask={() => setOrderDetailId(null)}
            orderDetail={orderDetailId!}
            handleRejectOrder={(orderId: string) => handleRejectOrder(new Set([orderId]))}
          />
        )}
        {ticketTitle && <TicketTitle removeMask={() => setTicketTitle(null)} orderId={ticketTitle} />}
      </>
    )
  );
};

export default InProgress;
