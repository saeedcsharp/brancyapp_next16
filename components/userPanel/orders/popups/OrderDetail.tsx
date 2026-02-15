import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import OrderDetailContent from "saeed/components/store/order/popup/OrderDetail-Content";
import findSystemLanguage from "saeed/helper/findSystemLanguage";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { OrderStep } from "saeed/models/store/enum";
import { IFullProduct, IOrderDetail } from "saeed/models/store/orders";
import styles from "./OrderDetail.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

interface OrderDetailProps {
  removeMask: () => void;
  orderDetail: IOrderDetail;
  handleRejectOrder?: (orderId: string) => void;
}

const OrderDetail: FC<OrderDetailProps> = ({ removeMask, orderDetail, handleRejectOrder }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loaderCount, setLoaderCount] = useState(7);
  const [fullProduct, setFullProduct] = useState<IFullProduct>();
  useEffect(() => {
    const handleResize = () => {
      setLoaderCount(window.innerWidth < 500 ? 5 : 7);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAcceptOrder = useCallback(async () => {
    try {
      const res = await clientFetchApi<string, string>("/api/order/GetOrderPaymentLink", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "orderId", value: orderDetail.orderId }], onUploadProgress: undefined });
      if (res.succeeded) router.replace(res.value);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
    // removeMask();
  }, [removeMask]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        removeMask();
      }
    },
    [removeMask]
  );
  function handleCancel() {
    if (!handleRejectOrder) return;
    if (fullProduct?.order.status === OrderStep.Paid || fullProduct?.order.status === OrderStep.InstagramerAccepted) {
      handleRejectOrder(fullProduct?.order.id);
    } else removeMask();
  }
  useLayoutEffect(() => {
    if (popupRef.current) {
      popupRef.current.style.opacity = "0";
      setTimeout(() => {
        if (popupRef.current) {
          popupRef.current.style.opacity = "1";
        }
      }, 0);
    }
  }, []);
  async function fetchData() {
    try {
      const res = await clientFetchApi<IOrderDetail, IFullProduct>(orderDetail.instagramerId !== undefined ? "User/Order/GetFullOrder" : "", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "orderId", value: orderDetail.orderId },
          {
            key: "instagramerId",
            value: orderDetail.instagramerId !== undefined ? orderDetail.instagramerId!.toString() : "",
          },
          { key: "language", value: findSystemLanguage().toString() },
        ], onUploadProgress: undefined });
      if (res.succeeded) setFullProduct(res.value);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);
  return (
    <>
      <div className="dialogBg" onClick={handleBackdropClick} />
      <div ref={popupRef} className={`popup ${styles.popup}`}>
        {loading && <Loading />}
        {!loading && (
          <div className="headerandinput">
            <div className="headerparent">
              <div className={styles.orderStepactive} title="Order information">
                <svg
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  role="img"
                  aria-label="Order information">
                  <path
                    d="M19 8.4h-6.2q-1.7-.2-1.8-1.8v-.8q.2-1.7 1.8-1.8H19q1.7.1 1.8 1.8v.8q-.2 1.7-1.8 1.8M14.5 28H11a5 5 0 0 1-5-5V11.1a5 5 0 0 1 5-5m9.8 0a5 5 0 0 1 5 5v6M24.9 28q-1.3 1.1-3 1.2c-2.6 0-4.7-2-4.7-4.6m1.6-3.5q1.3-1 3-1.1c2.6 0 4.6 2 4.6 4.6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={styles.orderStep}>
                <div className={styles.orderprogressStep} title="Order in progress">
                  <svg
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 28 28"
                    role="img"
                    aria-label="Order in progress">
                    <path
                      d="M15.3 10.1h6.5m-6.5 7.8h6.5m-15.6-.03 1.29 1.3 2.77-2.57M6.2 10.07l1.29 1.3 2.77-2.57M10.1 27h7.8c6.5 0 9.1-2.6 9.1-9.1v-7.8C27 3.6 24.4 1 17.9 1h-7.8C3.6 1 1 3.6 1 10.1v7.8c0 6.5 2.6 9.1 9.1 9.1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className={styles.loader}>
                  {[...Array(loaderCount)].map((_, i) => (
                    <div key={i} className={styles.loadercircle} style={{ animationDelay: `${i * 0.4}s` }}></div>
                  ))}
                </div>

                <div className={styles.orderpickupStep} title="Order pickup">
                  <svg
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 26 26"
                    role="img"
                    aria-label="Order pickup">
                    <path
                      d="M5.82 19.486h3.995M1.182 7.676h23.634M15.278 1.02l1.14 6.656v6.963l-3.424-1.287-3.41 1.287V7.676l1.14-6.656M2.747 3.356l-1.13 2.822c-.395.99-.6 2.047-.601 3.112L1 19.552c-.008 3.163 1.428 5.401 4.595 5.41l14.812.02c3.166.008 4.568-2.221 4.576-5.384L25 9.318a8.4 8.4 0 0 0-.61-3.162l-1.13-2.809a3.715 3.715 0 0 0-3.447-2.327H6.197a3.72 3.72 0 0 0-3.45 2.336"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className={styles.loader}>
                  {[...Array(loaderCount)].map((_, i) => (
                    <div key={i} className={styles.loadercircle} style={{ animationDelay: `${i * 0.4}s` }}></div>
                  ))}
                </div>

                <div className={styles.ordersendStep} title="Order delivery">
                  <svg
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 29 29"
                    role="img"
                    aria-label="Order delivery">
                    <path
                      d="M14.335 17h1.333c1.467 0 2.667-1.2 2.667-2.667V1h-12c-2 0-3.747 1.107-4.653 2.733M1 21c0 2.213 1.787 4 4 4h1.333m0 0c0-1.467 1.2-2.667 2.667-2.667M6.333 25a2.667 2.667 0 0 0 5.334 0m-5.334 0A2.667 2.667 0 0 1 9 22.333m0 0c1.467 0 2.667 1.2 2.667 2.667M9 22.333A2.667 2.667 0 0 1 11.667 25m0 0H17m0 0c0-1.467 1.2-2.667 2.667-2.667M17 25a2.666 2.666 0 0 0 5.333 0M17 25a2.667 2.667 0 0 1 2.667-2.667m0 0c1.466 0 2.666 1.2 2.666 2.667m-2.666-2.667A2.667 2.667 0 0 1 22.333 25m0 0h1.334c2.213 0 4-1.787 4-4v-4m0 0h-4c-.734 0-1.334-.6-1.334-1.333v-4c0-.734.6-1.334 1.334-1.334h1.72M27.667 17v-2.667l-2.28-4m0 0-2.28-3.986A2.69 2.69 0 0 0 20.787 5h-2.454v9.333c0 1.467-1.2 2.667-2.666 2.667h-1.334M1 9h8m-8 4h5.333M1 17h2.667"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className={styles.closeButton} onClick={removeMask} title="Close">
                <svg
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  role="button"
                  aria-label="Close dialog">
                  <path
                    d="M16 29.3c7.3 0 13.3-6 13.3-13.3S23.3 2.7 16 2.7 2.7 8.7 2.7 16s6 13.3 13.3 13.3m-3.8-9.5 7.6-7.6m0 7.6-7.6-7.6"
                    stroke="var(--text-h1)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className={styles.headerStyle}>
              <div className="title">{t(LanguageKey.Storeorder_orderDetailsStep)}</div>
              <div className={styles.ordernumber}>{fullProduct?.order.id}</div>
            </div>
            <OrderDetailContent ordersProductInfo={fullProduct!} />

            <div className={`ButtonContainer translate`}>
              {fullProduct?.order.status === OrderStep.Intialized && (
                <div onClick={handleAcceptOrder} className="saveButton">
                  {t(LanguageKey.Storeorder_AcceptthisOrder)}
                </div>
              )}
              {(fullProduct?.order.status === OrderStep.InstagramerAccepted ||
                fullProduct?.order.status === OrderStep.Paid ||
                fullProduct?.order.status === OrderStep.Intialized) && (
                <div onClick={handleCancel} className="stopButton" style={{ maxWidth: "35%" }}>
                  {t(LanguageKey.reject)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderDetail;
