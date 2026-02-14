import { useSession } from "next-auth/react";
import React, { ChangeEvent, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import OrderDetail from "saeed/components/userPanel/orders/popups/OrderDetail";
import initialzedTime from "saeed/helper/manageTimer";
import { handleDecompress } from "saeed/helper/pako";
import { getHubConnection } from "saeed/helper/pushNotif";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { PushNotif, PushResponseType } from "saeed/models/push/pushNotif";
import { LogisticType, OrderStep } from "saeed/models/store/enum";
import { IOrderByStatus, IOrderByStatusItem, IOrderDetail, IOrderPushNotifExtended } from "saeed/models/store/orders";
import styles from "./inqueue.module.css";
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
const InQueue = () => {
  //  return <Soon />;
  const { t } = useTranslation();
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
  const [loading, setLoading] = useState(true);
  const [orderDetailId, setOrderDetailId] = useState<IOrderDetail | null>(null);
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
    // showOrder(orderId);
    console.log("handleRowClick", orderId, instagramerId);
    setOrderDetailId({
      orderId: orderId,
      instagramerId: instagramerId,
    });
  };

  const isSomeSelected = state.selectedOrders.size > 0;
  const isAllSelected = state.selectedOrders.size === orders.items.length;
  async function fetchData() {
    try {
      const res = await GetServerResult<boolean, IOrderByStatus>(
        MethodType.get,
        session,
        "User/Order/GetOrdersByStatus",
        null,
        [{ key: "status", value: OrderStep.Intialized.toString() }]
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
  function handleManageOrderBySocket(order: IOrderPushNotifExtended) {
    if (order.NewStatus === OrderStep.Intialized) {
      const orderStatus: IOrderByStatusItem = {
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
        systemTicketId: null,
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
                          // onClick={() => {handleMoveToInProgress()}}
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
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      style={{ minWidth: "50px" }}
                      title={`order-${order.id}`}>
                      {`${index + 1}`}
                    </td>
                    <td
                      style={{ minWidth: "90px" }}
                      className={state.clickedOrders.has(order.id) ? styles.ordernumberviewed : styles.ordernumber}>
                      {order.id}
                      {/* {clickedOrders.has(order.id) && <span> ✓</span>} */}
                    </td>

                    <td style={{ minWidth: "160px" }} className={styles.customer}>
                      <img
                        src={order.shortShop ? basePictureUrl + order.shortShop!.profileUrl : ""}
                        alt="profile"
                        className="instagramimage"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/no-profile.svg";
                        }}
                      />
                      <div className="instagramprofiledetail">
                        <div className="instagramusername">
                          {order.shortShop ? (order.shortShop!.fullName ? order.shortShop!.fullName : "") : ""}
                        </div>
                        <div className="instagramid translate">
                          {order.shortShop ? "@" + order.shortShop!.username : ""}
                        </div>
                      </div>
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
              </tbody>
            </table>
          </div>
        )}
        {orderDetailId && <OrderDetail removeMask={() => setOrderDetailId(null)} orderDetail={orderDetailId!} />}
      </>
    )
  );
};

export default InQueue;
