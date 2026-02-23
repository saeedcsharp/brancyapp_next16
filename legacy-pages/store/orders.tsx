import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../../components/notOk/loading";
import NotShopper from "../../components/notOk/notShopper";
import { NotifType, notify, ResponseType } from "../../components/notifications/notificationBox";
import Queue from "../../components/store/order/1-Queue";
import InProgress from "../../components/store/order/2-InProgress";
import PickingUp from "../../components/store/order/3-PickingUp";
import Sent from "../../components/store/order/4-Sent";
import Delivered from "../../components/store/order/5-Delivered";
import Failed from "../../components/store/order/6-Failed";
import OrderDelivered from "../../components/store/order/popup/OrderDelieverd";
import OrderDetail from "../../components/store/order/popup/OrderDetail";
import OrderFailed from "../../components/store/order/popup/OrderFailed";
import OrderPickup from "../../components/store/order/popup/OrderPickup";
import OrderSend from "../../components/store/order/popup/OrderSend";
import { packageStatus } from "../../helper/loadingStatus";
import { handleDecompress } from "../../helper/pako";
import { getHubConnection } from "../../helper/pushNotif";
import { LanguageKey } from "../../i18n";
import { MethodType } from "../../helper/api";
import { PushNotif, PushResponseType } from "../../models/push/pushNotif";
import { OrderStep, OrderStepStatus, ShippingRequestType } from "../../models/store/enum";
import { IOrderByStatus, IOrderByStatusItem, IOrderDetail, IOrderPushNotifExtended } from "../../models/store/orders";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./ordernew.module.css";
import { clientFetchApi } from "../../helper/clientFetchApi";

const Orders = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => router.push("/"),
  });
  const { t } = useTranslation();
  const [firstLoading, setFirstLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<OrderStepStatus>(0);
  const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
  const [orderDetailIdForPickingUp, setOrderDetailIdForPickingUp] = useState<IOrderDetail | null>(null);
  const [orderDetailForSend, setOrderDetailForSend] = useState<IOrderDetail | null>(null);
  const [orderDetailForDelivered, setOrderDetailForDelivered] = useState<IOrderDetail | null>(null);
  const [orderDetailForFailed, setOrderDetailForFailed] = useState<IOrderDetail | null>(null);
  const [progressStepId, setProgressStepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMoreItem, setLoadingMoreItem] = useState<{
    pending: boolean;
    inprogresses: boolean;
    pickingups: boolean;
    sents: boolean;
    delivereds: boolean;
    faileds: boolean;
  }>({
    pending: false,
    delivereds: false,
    faileds: false,
    inprogresses: false,
    pickingups: false,
    sents: false,
  });
  const [orders, setOrders] = useState<{
    pending: IOrderByStatus;
    inprogresses: IOrderByStatus;
    pickingups: IOrderByStatus;
    sents: IOrderByStatus;
    delivereds: IOrderByStatus;
    faileds: IOrderByStatus;
  }>({
    pending: { items: [], nextMaxId: "" },
    inprogresses: { items: [], nextMaxId: "" },
    pickingups: { items: [], nextMaxId: "" },
    sents: { items: [], nextMaxId: "" },
    delivereds: { items: [], nextMaxId: "" },
    faileds: { items: [], nextMaxId: "" },
  });
  const [ordersInProcess, setOrdersInprocess] = useState<string[]>([]);

  const getSteps = () => [
    {
      icon: (
        <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <path d="M18 34.5h-4.5A6.3 6.3 0 0 1 7 28.3V13.7c0-3.4 2.9-6.2 6.5-6.2m11.5 0c3.9 0 7 2.9 7 6.4v7.6M31 35a6 6 0 0 1-10-4.5m2-4.5a6 6 0 0 1 10 4.5m-10-20h-7c-1 0-2-1.1-2-2.5V7c0-1.4 1-2.5 2-2.5h7c1 0 2 1.1 2 2.5v1c0 1.4-1 2.5-2 2.5" />
        </svg>
      ),
      label: LanguageKey.Storeproduct_inQueue,
      title: "ℹ️ in Queue",
      counter: orders.pending.items.length.toString(),
    },
    {
      icon: (
        <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <path d="M21.67 16h8m-8 10h8M10 25.5l1.59 1.5L15 24m-5-8.5 1.59 1.5L15 14m.2 23h9.6c8 0 11.2-3.3 11.2-11.55v-9.9C36 7.3 32.8 4 24.8 4h-9.6C7.2 4 4 7.3 4 15.55v9.9C4 33.7 7.2 37 15.2 37" />
        </svg>
      ),
      label: LanguageKey.Storeproduct_inprogress,
      title: "ℹ️ In Progress",
      counter: orders.inprogresses.items.length.toString(),
    },
    {
      icon: (
        <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <path d="M10.441 28.107h5M5 13h29M22.5 5l1.5 8.309V22l-4.51-1.607L15 22v-8.691L16.5 5M6.257 7.925 4.8 11.458a10.3 10.3 0 0 0-.777 3.897L4 28.203c-.01 3.96 1.845 6.761 5.936 6.77L29.068 35c4.089.01 5.9-2.78 5.91-6.74L35 15.388a10.2 10.2 0 0 0-.788-3.959l-1.46-3.516C32.02 6.154 30.256 5 28.298 5H10.713C8.751 5 6.985 6.158 6.257 7.925" />
        </svg>
      ),
      label: LanguageKey.Storeproduct_pickingup,
      title: "ℹ️ Picking Up",
      counter: orders.pickingups.items.length.toString(),
    },
    {
      icon: (
        <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <path d="M20 23h1.6c1.9 0 3.4-1.5 3.4-3.3V3H9.9C7.3 3 4 4 3 7m0 21c0 2.8 2.5 5.3 5.3 5.3h1.6c0-1.8 1.8-3.3 3.6-3.3s3.5 1.5 3.5 3.3h6c0-1.8 1.6-3.3 3.4-3.3 1.9 0 3.6 1.5 3.6 3.3h1.4c2.7 0 4.6-2.2 4.6-5v-5h-4.6q-1.6-.1-1.7-1.6v-5Q30 15 31.4 15h2.1m0 0-2.8-5.3Q29.7 8 27.8 8H25m8.5 7h-2q-1.4.1-1.5 1.6v4.8q.1 1.5 1.5 1.6H36v-3.2zM3 13h9m-9 5h6m-6 5h3m11 10.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m13 0a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
        </svg>
      ),
      label: LanguageKey.Storeproduct_sent,
      title: "ℹ️ Sent",
      counter: orders.sents.items.length.toString(),
    },
    {
      icon: (
        <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <path d="M5 33.49c1.98 0 3.79.02 5.75.4 5.07 1 9.7 1.94 14.71 0 3.6-1.38 5.95-3.84 8.61-6.5a3.14 3.14 0 0 0 0-4.45 3.2 3.2 0 0 0-4.13-.29c-2.46 1.84-5.26 4.27-8.5 4.35-1.39.03-2.58 0-4 0h2.62c1.87 0 3.39-1.29 3.39-3.08 0-1.49-1.06-2.68-2.56-3.04-2.16-.52-4.3-.93-6.56-.88-3.56.09-6.06 2-8.88 3.8M32.2 22l-.02-10.85c0-3.96-1.92-6.16-5.84-6.15l-12.4.03c-3.91 0-5.74 2.22-5.74 6.18v9.77M23.43 5l.02 8.98-3.49-1.09-3.5 1.11-.01-8.97" />
        </svg>
      ),
      label: LanguageKey.Storeproduct_delivered,
      title: "ℹ️ Delivered",
      counter: orders.delivereds.items.length.toString(),
    },
    {
      icon: (
        <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 41">
          <path d="m22.3 29.4-4.6-4.6m4.6.1-4.6 4.6m-3-25.7-6 6m16.6-6 6 6m-28 3.8c0-3.1 1.7-3.3 3.7-3.3h26c2 0 3.7.2 3.7 3.3 0 3.6-1.7 3.3-3.7 3.3H7c-2 0-3.7.3-3.7-3.3Zm4.9 18c.5 3.2 1.8 5.6 6.6 5.6h10c5.2 0 6-2.3 6.6-5.4l2.8-14.6m-28.4 0 1.2 7" />
        </svg>
      ),
      label: LanguageKey.Storeproduct_failed,
      title: "ℹ️ Failed",
      counter: orders.faileds.items.length.toString(),
    },
    // {
    //   icon: (
    //     <svg
    //       className={styles.menuicon}
    //       xmlns="http://www.w3.org/2000/svg"
    //       viewBox="0 0 40 41">
    //       <path d="M26.52 13.33c0 1.77-.68 3.47-1.9 4.72a6.45 6.45 0 0 1-9.23 0 6.7 6.7 0 0 1-1.91-4.72m-7.12-1-1.15 14c-.24 3.01-.36 4.52.13 5.68A5 5 0 0 0 7.5 34.4c1.09.6 2.56.6 5.51.6H27c2.95 0 4.43 0 5.51-.6a5 5 0 0 0 2.16-2.4c.5-1.15.37-2.66.13-5.66l-1.15-14c-.2-2.6-.31-3.89-.87-4.87a5 5 0 0 0-2.11-1.98C29.66 5 28.38 5 25.84 5H14.16c-2.54 0-3.82 0-4.82.49a5 5 0 0 0-2.1 1.98c-.57.98-.67 2.28-.88 4.87" />{" "}
    //     </svg>
    //   ),
    //   label: LanguageKey.Storeproduct_incart,
    //   title: "ℹ️ In Cart",
    //   counter: "0",
    // },
  ];
  const steps = getSteps();
  async function fetchMoreItemForFailed(nextMaxId: string | null, orderStep: OrderStepStatus) {
    console.log("fetchMoreItemForFailed nextMaxId", nextMaxId);
    if (nextMaxId === null) return;
    if (loadingMoreItem.faileds && orderStep === OrderStepStatus.Failed) return;
    setLoadingMoreItem((prev) => ({ ...prev, faileds: true }));
    try {
      const res = await clientFetchApi<number[], IOrderByStatus>("/api/order/GetOrdersByStatuses", { methodType: MethodType.post, session: session, data: [OrderStep.UserCanceled, OrderStep.InstagramerCanceled, OrderStep.ShippingFailed, OrderStep.Failed], queries: [{ key: "nextMaxId", value: nextMaxId?.toString() || "" }], onUploadProgress: undefined });
      if (res.succeeded) {
        setOrders((prev) => ({
          ...prev,
          faileds: {
            items: [...prev.faileds.items, ...res.value.items],
            nextMaxId: res.value.nextMaxId,
          },
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingMoreItem((prev) => ({ ...prev, faileds: false }));
    }
  }
  async function fetchMoreItem(nextMaxId: string | null, orderStep: OrderStepStatus) {
    console.log("orderStep", nextMaxId);
    if (nextMaxId === null) return;
    if (
      (loadingMoreItem.pending && orderStep === OrderStepStatus.Pending) ||
      (loadingMoreItem.inprogresses && orderStep === OrderStepStatus.Inprogress) ||
      (loadingMoreItem.pickingups && orderStep === OrderStepStatus.Pickingup) ||
      (loadingMoreItem.sents && orderStep === OrderStepStatus.Sent) ||
      (loadingMoreItem.delivereds && orderStep === OrderStepStatus.Delivered)
    )
      return;
    switch (orderStep) {
      case OrderStepStatus.Pending:
        setLoadingMoreItem((prev) => ({ ...prev, pending: true }));
        break;
      case OrderStepStatus.Inprogress:
        setLoadingMoreItem((prev) => ({ ...prev, inprogresses: true }));
        break;
      case OrderStepStatus.Delivered:
        setLoadingMoreItem((prev) => ({ ...prev, delivereds: true }));
        break;
      case OrderStepStatus.Sent:
        setLoadingMoreItem((prev) => ({ ...prev, sents: true }));
        break;
      case OrderStepStatus.Pickingup:
        setLoadingMoreItem((prev) => ({ ...prev, pickingups: true }));
        break;
    }
    try {
      const res = await clientFetchApi<boolean, IOrderByStatus>("/api/order/GetOrdersByStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "status", value: orderStep.toString() },
          { key: "nextMaxId", value: nextMaxId.toString() },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        switch (orderStep) {
          case OrderStepStatus.Pending:
            setOrders((prev) => ({
              ...prev,
              pending: {
                items: [...prev.pending.items, ...res.value.items],
                nextMaxId: res.value.nextMaxId,
              },
            }));
            break;
          case OrderStepStatus.Inprogress:
            setOrders((prev) => ({
              ...prev,
              inprogresses: {
                items: [...prev.inprogresses.items, ...res.value.items],
                nextMaxId: res.value.nextMaxId,
              },
            }));
            break;
          case OrderStepStatus.Delivered:
            setOrders((prev) => ({
              ...prev,
              delivereds: {
                items: [...prev.delivereds.items, ...res.value.items],
                nextMaxId: res.value.nextMaxId,
              },
            }));
            break;
          case OrderStepStatus.Sent:
            setOrders((prev) => ({
              ...prev,
              sents: {
                items: [...prev.sents.items, ...res.value.items],
                nextMaxId: res.value.nextMaxId,
              },
            }));
            break;
          case OrderStepStatus.Pickingup:
            setOrders((prev) => ({
              ...prev,
              pickingups: {
                items: [...prev.pickingups.items, ...res.value.items],
                nextMaxId: res.value.nextMaxId,
              },
            }));
            break;
        }
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      switch (orderStep) {
        case OrderStepStatus.Pending:
          setLoadingMoreItem((prev) => ({ ...prev, pending: false }));
          break;
        case OrderStepStatus.Inprogress:
          setLoadingMoreItem((prev) => ({ ...prev, inprogresses: false }));
          break;
        case OrderStepStatus.Delivered:
          setLoadingMoreItem((prev) => ({ ...prev, delivereds: false }));
          break;
        case OrderStepStatus.Sent:
          setLoadingMoreItem((prev) => ({ ...prev, sents: false }));
          break;
        case OrderStepStatus.Pickingup:
          setLoadingMoreItem((prev) => ({ ...prev, pickingups: false }));
          break;
      }
    }
  }
  async function fetchData() {
    setFirstLoading(false);
    try {
      const [pending, inprogress, pickingup, sent, delivered, failed] = await Promise.all([
        clientFetchApi<number[], IOrderByStatus>("/api/order/GetOrdersByStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "status", value: OrderStep.Paid.toString() },
        ], onUploadProgress: undefined }),
        clientFetchApi<number[], IOrderByStatus>("/api/order/GetOrdersByStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "status", value: OrderStep.InstagramerAccepted.toString() },
        ], onUploadProgress: undefined }),
        clientFetchApi<boolean, IOrderByStatus>("/api/order/GetOrdersByStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "status", value: OrderStep.ShippingRequest.toString() },
        ], onUploadProgress: undefined }),
        clientFetchApi<boolean, IOrderByStatus>("/api/order/GetOrdersByStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "status", value: OrderStep.InShipping.toString() },
        ], onUploadProgress: undefined }),
        clientFetchApi<boolean, IOrderByStatus>("/api/order/GetOrdersByStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "status", value: OrderStep.Delivered.toString() },
        ], onUploadProgress: undefined }),
        clientFetchApi<boolean, IOrderByStatus>("/api/order/GetOrdersByStatuses", { methodType: MethodType.post, session: session, data: [
          OrderStep.UserCanceled,
          OrderStep.InstagramerCanceled,
          OrderStep.ShippingFailed,
          OrderStep.Failed,
        ], queries: undefined, onUploadProgress: undefined }),
      ]);
      console.log("inprogresssssssss", inprogress);
      console.log("faileddddddd", failed);
      if (inprogress.succeeded) {
        console.log("pending.value", inprogress.value);
        setOrders((prev) => ({
          ...prev,
          pending: {
            items: [...prev.pending.items, ...pending.value.items],
            nextMaxId: pending.value.nextMaxId,
          },
          delivereds: {
            items: [...prev.delivereds.items, ...delivered.value.items],
            nextMaxId: delivered.value.nextMaxId,
          },
          faileds: {
            items: [...prev.faileds.items, ...failed.value.items],
            nextMaxId: failed.value.nextMaxId,
          },
          inprogresses: {
            items: [...prev.inprogresses.items, ...inprogress.value.items],
            nextMaxId: inprogress.value.nextMaxId,
          },
          pickingups: {
            items: [...prev.pickingups.items, ...pickingup.value.items],
            nextMaxId: pickingup.value.nextMaxId,
          },
          sents: {
            items: [...prev.sents.items, ...sent.value.items],
            nextMaxId: sent.value.nextMaxId,
          },
        }));
      } else notify(inprogress.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  async function handleAcceptOrder(orderIds: Set<string>) {
    try {
      setOrdersInprocess((prev) => [...prev, ...Array.from(orderIds)]);
      const results = await Promise.all(
        Array.from(orderIds).map((orderId) =>
          clientFetchApi<boolean, boolean>("/api/order/AcceptOrder", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "orderId", value: orderId },
          ], onUploadProgress: undefined })
        )
      );

      // Check if all requests succeeded
      // Process each result individually
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

      // Update state for successful orders
      // if (successfulOrderIds.size > 0) {
      //   setOrderDetailId(null); // Close any open order detail popup
      //   setOrders((prevOrders) => {
      //     // Find orders that were successfully accepted
      //     const ordersToMove = prevOrders.pendings.filter((order) =>
      //       successfulOrderIds.has(order.id)
      //     );

      //     return {
      //       ...prevOrders,
      //       pendings: prevOrders.pendings.filter(
      //         (order) => !successfulOrderIds.has(order.id)
      //       ),
      //       inprogresses: [...prevOrders.inprogresses, ...ordersToMove],
      //     };
      //   });
      // }

      // Show notifications for failed orders
      if (failedResults.length > 0) {
        notify(failedResults[0].info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setOrdersInprocess((prev) => prev.filter((id) => !orderIds.has(id)));
    }
  }
  async function handleReadyForShipping(orderIds: Set<string>) {
    try {
      setOrdersInprocess((prev) => [...prev, ...Array.from(orderIds)]);
      const results = await Promise.all(
        Array.from(orderIds).map((orderId) =>
          clientFetchApi<boolean, boolean>("/api/order/ReadyOrderForShipping", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "orderId", value: orderId },
          ], onUploadProgress: undefined })
        )
      );

      // Check if all requests succeeded
      // Process each result individually
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

      // Update state for successful orders
      // if (successfulOrderIds.size > 0) {
      //   setOrderDetailId(null); // Close any open order detail popup
      //   setOrders((prevOrders) => {
      //     // Find orders that were successfully accepted
      //     const ordersToMove = prevOrders.pendings.filter((order) =>
      //       successfulOrderIds.has(order.id)
      //     );

      //     return {
      //       ...prevOrders,
      //       inprogresses: prevOrders.inprogresses.filter(
      //         (order) => !successfulOrderIds.has(order.id)
      //       ),
      //       pickingups: [...prevOrders.pickingups, ...ordersToMove],
      //     };
      //   });
      // }

      // Show notifications for failed orders
      if (failedResults.length > 0) {
        notify(failedResults[0].info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setOrdersInprocess((prev) => prev.filter((id) => !orderIds.has(id)));
    }
  }
  async function handleGetShippingRequestType(orderId: string, userId: number) {
    if (ordersInProcess.find((x) => x === orderId)) return;
    try {
      setOrderDetailIdForPickingUp({
        orderId: orderId,
        userId: userId,
        shippingRequestType: undefined,
      });
      const res = await clientFetchApi<boolean, ShippingRequestType>("/api/order/GetShippingRequestType", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "orderId", value: orderId }], onUploadProgress: undefined });
      if (res.succeeded) {
        setOrderDetailIdForPickingUp((prev) => ({
          ...prev!,
          shippingRequestType: res.value,
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleManageOrderBySocket(order: IOrderPushNotifExtended) {
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
      shortShop: null,
      status: order.NewStatus,
      statusUpdateTime: order.ShortOrder.StatusUpdateTime,
      totalPrice: order.ShortOrder.TotalPrice,
      userInfo: order.ShortOrder.UserInfo
        ? {
            fullName: order.ShortOrder.UserInfo.FullName,
            phoneNumber: order.ShortOrder.UserInfo.PhoneNumber,
            profileUrl: order.ShortOrder.UserInfo.ProfileUrl,
            username: order.ShortOrder.UserInfo.Username,
          }
        : null,
    };

    console.log("Order initialized", order.ShortOrder);
    if (order.NewStatus === OrderStep.Paid) {
      setOrders((prev) => ({
        ...prev,
        pending: {
          items: [orderStatus, ...prev.pending.items],
          nextMaxId: prev.pending.nextMaxId,
        },
      }));
    } else if (order.NewStatus === OrderStep.InstagramerAccepted) {
      setOrders((prev) => ({
        ...prev,
        inprogresses: {
          items: [orderStatus, ...prev.inprogresses.items],
          nextMaxId: prev.inprogresses.nextMaxId,
        },
        pending: {
          items: prev.pending.items.filter((o) => o.id !== orderStatus.id),
          nextMaxId: prev.pending.nextMaxId,
        },
      }));
    } else if (order.NewStatus === OrderStep.ShippingRequest) {
      setOrders((prev) => ({
        ...prev,
        pickingups: {
          items: [orderStatus, ...prev.pickingups.items],
          nextMaxId: prev.pickingups.nextMaxId,
        },
        inprogresses: {
          items: prev.inprogresses.items.filter((o) => o.id !== orderStatus.id),
          nextMaxId: prev.inprogresses.nextMaxId,
        },
      }));
    } else if (order.NewStatus === OrderStep.InShipping) {
      setOrders((prev) => ({
        ...prev,
        sents: {
          items: [orderStatus, ...prev.sents.items],
          nextMaxId: prev.sents.nextMaxId,
        },
        pickingups: {
          items: prev.pickingups.items.filter((o) => o.id !== orderStatus.id),
          nextMaxId: prev.pickingups.nextMaxId,
        },
      }));
    } else if (order.NewStatus === OrderStep.Delivered) {
      setOrders((prev) => ({
        ...prev,
        delivereds: {
          items: [orderStatus, ...prev.delivereds.items],
          nextMaxId: prev.delivereds.nextMaxId,
        },
        sents: {
          items: prev.sents.items.filter((o) => o.id !== orderStatus.id),
          nextMaxId: prev.sents.nextMaxId,
        },
      }));
    } else if (
      order.NewStatus === OrderStep.Failed ||
      order.NewStatus === OrderStep.UserCanceled ||
      order.NewStatus === OrderStep.InstagramerCanceled ||
      order.NewStatus === OrderStep.ShippingFailed
    ) {
      setOrders((prev) => ({
        ...prev,
        faileds: {
          items: [orderStatus, ...prev.faileds.items],
          nextMaxId: prev.faileds.nextMaxId,
        },
        inprogresses: {
          items: prev.inprogresses.items.filter((o) => o.id !== orderStatus.id),
          nextMaxId: prev.inprogresses.nextMaxId,
        },
        pickingups: {
          items: prev.pickingups.items.filter((o) => o.id !== orderStatus.id),
          nextMaxId: prev.pickingups.nextMaxId,
        },
        sents: {
          items: prev.sents.items.filter((o) => o.id !== orderStatus.id),
          nextMaxId: prev.sents.nextMaxId,
        },
      }));
    }
    // setOrders((prev) => ({
    //   ...prev,
    //   inprogresses:
    //     order.NewStatus === OrderStep.InstagramerAccepted
    //       ? [orderStatus, ...prev.inprogresses]
    //       : prev.inprogresses,
    //   pendings:
    // setOrders((prev) => ({
    //   ...prev,
    //   pendings: {
    //     items: prev.pendings.items.filter((order) => order.id !== orderId),
    //     nextMaxId: prev.pendings.nextMaxId,
    //   },
    // }));
    //     order.NewStatus === OrderStep.ShippingRequest
    //       ? [orderStatus, ...prev.pickingups]
    //       : prev.pickingups,
    //   sents:
    //     order.NewStatus === OrderStep.InShipping
    //       ? [orderStatus, ...prev.sents]
    //       : prev.sents,
    //   delivereds:
    //     order.NewStatus === OrderStep.Delivered
    //       ? [orderStatus, ...prev.delivereds]
    //       : prev.delivereds,
    // }));
  }
  // async function handleRejectOrder(orderId: string, orderStep: OrderStep) {
  //   try {
  //     const res = await GetServerResult<boolean, boolean>(
  //       MethodType.get,
  //       session,
  //       "Shopper/Order/RejectOrder",
  //       null,
  //       [{ key: "orderId", value: orderId }]
  //     );
  //     if (res.succeeded) {
  //       if (orderStep === OrderStep.InstagramerAccepted) {
  //         setOrders((prev) => ({
  //           ...prev,
  //           inprogresses: {
  //             items: prev.inprogresses.items.filter(
  //               (order) => order.id !== orderId
  //             ),
  //             nextMaxId: prev.inprogresses.nextMaxId,
  //           },
  //         }));
  //       } else if (orderStep === OrderStep.ShippingRequest) {
  //         setOrders((prev) => ({
  //           ...prev,
  //           pickingups: {
  //             items: prev.pickingups.items.filter(
  //               (order) => order.id !== orderId
  //             ),
  //             nextMaxId: prev.pickingups.nextMaxId,
  //           },
  //         }));
  //       }
  //     } else {
  //       notify(res.info.responseType, NotifType.Warning);
  //     }
  //   } catch (error) {
  //     notify(ResponseType.Unexpected, NotifType.Error);
  //   }
  // }
  function handleGetNotif(notif: string) {
    try {
      const decombNotif = handleDecompress(notif);
      console.log("decombNotif in order", decombNotif);
      const notifObj = JSON.parse(decombNotif!) as PushNotif;
      if (notifObj.ResponseType === PushResponseType.ChangeOrderStatus && notifObj.Message) {
        console.log("notifObj.Message", notifObj);
        const orderMessage = JSON.parse(notifObj.Message) as IOrderPushNotifExtended;
        console.log("orderMessage", orderMessage);
        handleManageOrderBySocket(orderMessage);
      }
    } catch (error) {
      console.error("Error parsing notification:", error);
    }
  }
  function handleVerifyFromOrderDetail(arg0: Set<string>, orderStep: OrderStep) {
    switch (orderStep) {
      case OrderStep.Paid:
        handleAcceptOrder(arg0);
        break;
      case OrderStep.InstagramerAccepted:
        handleReadyForShipping(arg0);
        break;
      default:
        break;
    }
    setOrderDetail(null); // Close the order detail popup after action
  }
  async function handleSendCodeByParcelId(orderId: string, parcelId: string) {
    setOrdersInprocess((prev) => [...prev, orderId]);
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/order/SentOrderByParcelId", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "orderId", value: orderId },
          { key: "parcelId", value: parcelId },
        ], onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setOrdersInprocess((prev) => prev.filter((x) => x !== orderId));
    }
  }
  async function handleSendOrderByNonRequestType(orderId: string) {
    setOrdersInprocess((prev) => [...prev, orderId]);
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/order/SentOrderByNonRequestType", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "orderId", value: orderId }], onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setOrdersInprocess((prev) => prev.filter((x) => x !== orderId));
    }
  }
  async function handleSendOrderByNonTrackingIdOrderDeliverd(orderId: string) {
    setOrdersInprocess((prev) => [...prev, orderId]);
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/order/SetNonTrackingIdOrderDelivered", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "orderId", value: orderId }], onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setOrdersInprocess((prev) => prev.filter((x) => x !== orderId));
    }
  }
  async function handleRejectOrder(orderId: string) {
    setOrdersInprocess((prev) => [...prev, orderId]);
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/order/RejectOrder", { methodType: MethodType.get, session: session, data: null, queries: [
        { key: "orderId", value: orderId },
      ], onUploadProgress: undefined });
      if (res.succeeded) {
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setOrdersInprocess((prev) => prev.filter((x) => x !== orderId));
    }
  }
  useEffect(() => {
    if (session && firstLoading) fetchData();
  }, [session]);

  useEffect(() => {
    if (session?.user.currentIndex === -1) {
      router.push("/user");
    }
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session?.user.currentIndex, router]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      const hubConnection = getHubConnection();
      if (hubConnection) {
        console.log("hubConnection in order");
        hubConnection.off("Instagramer", handleGetNotif);
        hubConnection.on("Instagramer", handleGetNotif);
        clearInterval(intervalId);
      }
    }, 500);
  }, []);
  if (!session?.user.isShopper) return <NotShopper />;

  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Orders)}</title>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
          <meta name="description" content="Manage and track your Bran.cy store orders" />
          <meta name="theme-color" />
          <meta name="keywords" content="order management, store orders, Brancy orders, order tracking, order status" />
          <meta name="author" content="Bran.cy Team" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.brancy.app/store/orders" aria-label="Canonical link" />
          {/* Open Graph / Social Media Meta Tags */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Bran.cy Orders" />
          <meta property="og:description" content="Manage and track your Bran.cy store orders" />
          <meta property="og:site_name" content="Bran.cy" />
          <meta property="og:url" content="https://www.brancy.app/store/orders" />
        </Head>
        {/* <Soon /> */}
        {loading && <Loading />}
        {!loading && (
          <section className={styles.pincontainer} role="main" aria-label="Orders Management">
            <Swiper freeMode slidesPerView="auto" modules={[FreeMode]} className={styles.orderstep}>
              {steps.map((step, index) => (
                <SwiperSlide
                  key={index}
                  className={`${styles.step} ${
                    selectedStep === index ? `${styles.activeStep} ${styles[`activeStep${index}`]}` : ""
                  }`}
                  onClick={() => setSelectedStep(index)}
                  title={step.title}
                  role="tab"
                  aria-selected={selectedStep === index}
                  aria-controls={`panel-${index}`}>
                  {typeof step.icon === "string" ? (
                    <img
                      className={styles.menuicon}
                      src={`/${step.icon}`}
                      alt={t(step.label)}
                      loading="lazy"
                      decoding="async"
                      aria-label={t(step.label)}
                    />
                  ) : (
                    step.icon
                  )}
                  <div className={styles.menudetail}>
                    <span>{t(step.label)}</span>
                    <span className={styles.menucounter}>{step.counter}</span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className={styles.orderstepcontent}>
              {selectedStep === OrderStepStatus.Pending && (
                <Queue
                  loadingMoreItem={loadingMoreItem.pending}
                  orders={orders.pending}
                  orderInProcess={ordersInProcess}
                  showOrder={(orderId, userId) => setOrderDetail({ orderId: orderId, userId: userId })}
                  handleFetchMoreItem={fetchMoreItem}
                  handleAcceptOrder={handleAcceptOrder}
                />
              )}
              {selectedStep === OrderStepStatus.Inprogress && (
                <InProgress
                  loadingMoreItem={loadingMoreItem.inprogresses}
                  orderInProcess={ordersInProcess}
                  orders={orders.inprogresses}
                  showOrder={(orderId, userId) => {
                    if (ordersInProcess.find((x) => x === orderId)) return;
                    setOrderDetail({ orderId: orderId, userId: userId });
                  }}
                  handleReadyForShipping={handleReadyForShipping}
                  handleFetchMoreItem={fetchMoreItem}
                />
              )}
              {selectedStep === OrderStepStatus.Pickingup && (
                <PickingUp
                  orders={orders.pickingups}
                  orderInProcess={ordersInProcess}
                  loadingMoreItem={loadingMoreItem.pickingups}
                  handleGetShippingRequestType={handleGetShippingRequestType}
                  handleFetchMoreItem={fetchMoreItem}
                />
              )}
              {selectedStep === OrderStepStatus.Sent && (
                <Sent
                  orders={orders.sents}
                  orderInProcess={ordersInProcess}
                  loadingMoreItem={loadingMoreItem.sents}
                  showOrder={(orderId, userId, trackingId) => {
                    if (ordersInProcess.find((x) => x === orderId)) return;
                    setOrderDetailForSend({
                      orderId: orderId,
                      userId: userId,
                      trackingId: trackingId,
                    });
                  }}
                  handleFetchMoreItem={fetchMoreItem}
                />
              )}
              {selectedStep === OrderStepStatus.Delivered && (
                <Delivered
                  orders={orders.delivereds}
                  loadingMoreItem={loadingMoreItem.delivereds}
                  showOrder={(orderId, userId, trackingId) =>
                    setOrderDetailForDelivered({
                      orderId: orderId,
                      userId: userId,
                      trackingId: trackingId,
                    })
                  }
                  handleFetchMoreItem={fetchMoreItem}
                />
              )}
              {selectedStep === OrderStepStatus.Failed && (
                <Failed
                  orders={orders.faileds}
                  loadingMoreItem={loadingMoreItem.faileds}
                  showOrder={(orderId, userId) => {
                    setOrderDetailForFailed({
                      orderId: orderId,
                      userId: userId,
                    });
                  }}
                  // handleMoveToFailed={function (): void {
                  //   throw new Error("Function not implemented.");
                  // }}
                  handleFetchMoreItem={fetchMoreItemForFailed}
                />
              )}
              {/* {selectedStep === OrderStep.InChart && (
              <InCart
                showOrder={() => {}}
                handleMoveToInCart={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            )} */}
            </div>
          </section>
        )}

        {orderDetail && (
          <OrderDetail
            removeMask={() => setOrderDetail(null)}
            orderDetail={orderDetail!}
            handleRejectOrder={handleRejectOrder}
            handleVerifyFromOrderDetail={(orderId: string, orderStep: OrderStep) =>
              handleVerifyFromOrderDetail(new Set([orderId]), orderStep)
            }
          />
        )}
        {orderDetailIdForPickingUp && (
          <OrderPickup
            removeMask={() => setOrderDetailIdForPickingUp(null)}
            orderDetail={orderDetailIdForPickingUp}
            handleRejectOrder={handleRejectOrder}
            handleSendCodeByParcelId={handleSendCodeByParcelId}
            handleSendOrderByNonRequestType={handleSendOrderByNonRequestType}
          />
        )}
        {orderDetailForSend && (
          <OrderSend
            removeMask={() => setOrderDetailForSend(null)}
            orderDetail={orderDetailForSend}
            handleSendOrderByNonTrackingIdOrderDeliverd={handleSendOrderByNonTrackingIdOrderDeliverd}
          />
        )}
        {orderDetailForDelivered && (
          <OrderDelivered removeMask={() => setOrderDetailForDelivered(null)} orderDetail={orderDetailForDelivered} />
        )}
        {orderDetailForFailed && (
          <OrderFailed removeMask={() => setOrderDetailForFailed(null)} orderDetail={orderDetailForFailed} />
        )}

        {/* {progressStepId && (
          <ProgressStep
            removeMask={() => setProgressStepId(null)}
            orderId={progressStepId!}
          />
        )} */}
      </>
    )
  );
};

export default Orders;
