import { useSession } from "next-auth/react";
import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "../../../notifications/notificationBox";
import Loading from "../../../notOk/loading";
import findSystemLanguage from "../../../../helper/findSystemLanguage";
import { LanguageKey } from "../../../../i18n";
import { MethodType } from "../../../../helper/api";
import { OrderStep } from "../../../../models/store/enum";
import { IFullProduct, IOrderDetail } from "../../../../models/store/orders";
import OrderDetailContent from "./OrderDetail-Content";
import styles from "./OrderDetail.module.css";
import { clientFetchApi } from "../../../../helper/clientFetchApi";
interface OrderDetailProps {
  removeMask: () => void;
  orderDetail: IOrderDetail;
  handleRejectOrder: (orderId: string) => void;
  handleVerifyFromOrderDetail?: (orderId: string, orderStep: OrderStep) => void;
}
const OrderDetail: FC<OrderDetailProps> = ({
  removeMask,
  orderDetail,
  handleRejectOrder,
  handleVerifyFromOrderDetail,
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loaderCount, setLoaderCount] = useState(7);
  const [fullProduct, setFullProduct] = useState<IFullProduct>();
  const [showRejectOrder, setShowRejectOrder] = useState<string | null>(null);
  useEffect(() => {
    const handleResize = () => {
      setLoaderCount(window.innerWidth < 500 ? 5 : 7);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        removeMask();
      }
    },
    [removeMask]
  );
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
      const res = await clientFetchApi<IOrderDetail, IFullProduct>("/api/order/GetFullOrder", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "orderId", value: orderDetail.orderId },
          {
            key: "userId",
            value: orderDetail.userId ? orderDetail.userId.toString() : "",
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
      <div ref={popupRef} className={showRejectOrder ? styles.popupmini : `popup ${styles.popup}`}>
        {loading && <Loading />}
        {!loading && (
          <>
            {!showRejectOrder && (
              <>
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
                  <div className="title" style={{ marginInlineStart: "10px" }}>
                    {t(LanguageKey.Storeorder_orderDetailsStep)}
                  </div>
                  <div className={styles.ordernumber}>{fullProduct?.order.id}</div>
                </div>
                <OrderDetailContent ordersProductInfo={fullProduct!} />
                <div className="ButtonContainer">
                  {orderDetail.userId !== undefined && handleVerifyFromOrderDetail && (
                    <div
                      onClick={() => handleVerifyFromOrderDetail(orderDetail.orderId, fullProduct!.order.status)}
                      className="saveButton">
                      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 11" width="16" height="16">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          fill="#fff"
                          d="M13.6 2.3q.8-1 0-2a1.4 1.4 0 0 0-2 .1L4.9 7.6 2.4 5.2a1.4 1.4 0 0 0-2 0q-.7 1 0 2L4 10.6a1.4 1.4 0 0 0 2 0z"
                        />
                      </svg>

                      {t(LanguageKey.Storeorder_AcceptthisOrder)}
                    </div>
                  )}

                  <div
                    onClick={() => {
                      setShowRejectOrder(orderDetail.orderId);
                    }}
                    className="stopButton"
                    style={{ maxWidth: "35%" }}>
                    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="16" height="16">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        fill="var(--color-dark-red)"
                        d="M11.5.4a1.5 1.5 0 0 1 0 2.2L8.1 6l3.4 3.4a1.5 1.5 0 1 1-2 2.2L6 8l-3.5 3.5a1.5 1.5 0 0 1-2-2.2L3.8 6 .4 2.6A1.5 1.5 0 0 1 2.5.4L6 4 9.4.4a1.5 1.5 0 0 1 2.1 0"
                      />
                    </svg>
                    {t(LanguageKey.reject)}
                  </div>
                </div>
              </>
            )}
            {showRejectOrder && (
              <>
                <div className="headerandinput" style={{ alignItems: "center" }}>
                  <svg fill="none" height="100px" viewBox="0 0 160 116">
                    <path
                      fill="var(--color-dark-blue60)"
                      d="M153.3 38a6.7 6.7 0 1 1 0 13.4H115a6.7 6.7 0 1 1 0 13.4h21a6.7 6.7 0 1 1 0 13.4h-9.7c-4.7 0-8.5 3-8.5 6.7q0 3.7 5.8 6.7a6.7 6.7 0 1 1 0 13.4H44a6.7 6.7 0 1 1 0-13.4H6.7a6.7 6.7 0 1 1 0-13.4H45a6.7 6.7 0 1 0 0-13.4H21a6.7 6.7 0 1 1 0-13.4h38.4a6.7 6.7 0 1 1 0-13.4zm0 26.8a6.7 6.7 0 1 1 0 13.4 6.7 6.7 0 0 1 0-13.4"
                    />
                    <path fill="var(--background-root)" d="M82.5 110a41.5 41.5 0 1 0 0-83 41.5 41.5 0 0 0 0 83" />
                    <path stroke="var(--color-dark-blue60)" strokeWidth="2" d="M111 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path
                      fill="var(--color-dark-blue60)"
                      d="M141 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M39 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
                    />
                    <path
                      fill="var(--color-dark-blue)"
                      d="M122.6 8q2-.1 3.8 1 2 1 2.5 3.3a4 4 0 0 1-1 3.7l-2.4 2.2-.7.6q-.7.7-.7 1.7-.2 1.2-1.4 1.4c-1.3.3-2.4-.5-2.4-1.7q-.1-1.6.7-2.8l1.5-1.7 1.7-1.5q.8-.6.4-1.7-.5-1-1.5-1H122q-.9 0-1.3.9l-.6 1.3q-.2.7-.8 1.2c-.7.5-2 .4-2.6-.2q-1-1-.6-2.4a6 6 0 0 1 3-3.5q1.8-.8 3.5-.8m0 1q-1.8-.1-3.5 1-1.5 1-2 2.6v1q0 .7 1 .7a1 1 0 0 0 .9-.5l.1-.3.5-1.2q.5-1.4 2.2-1.8 1.5-.2 3 .6 1 1 .8 2.6-.3.9-1 1.6l-2.2 1.9q-1.3 1.2-1.2 3 0 .5.5.7 1 .5 1.4-.6.3-1.6 1.6-2.7l2.2-2a3.4 3.4 0 0 0 .8-3.9q-.4-1.2-1.6-1.9-1.5-.9-3.4-.9M124 25a2 2 0 0 1-2 2c-1 0-2-.8-2-2s1-2 2-2a2 2 0 0 1 2 2m-1 0a1 1 0 0 0-1-1.1q-1 .1-1 1 0 1.2 1 1.2t1-1M24.6 25q2-.1 3.8 1 2 1 2.5 3.3a4 4 0 0 1-1 3.7l-2.4 2.2-.7.6q-.7.7-.7 1.7-.3 1.2-1.4 1.5c-1.3.2-2.4-.6-2.4-1.8q-.1-1.5.7-2.8l1.5-1.7 1.7-1.5q.8-.6.4-1.7-.4-1-1.5-1H24q-.9 0-1.3.9l-.6 1.3q-.2.7-.8 1.2c-.7.5-2 .4-2.6-.2q-1-1-.6-2.4a6 6 0 0 1 3-3.5q1.8-.9 3.5-.8m0 1q-1.8-.1-3.5 1-1.5 1-2 2.6v1q0 .6 1 .7a1 1 0 0 0 .9-.5l.1-.3.5-1.2q.5-1.4 2.2-1.8 1.5-.2 3 .6 1 1 .8 2.6-.3.9-1 1.6l-2.2 1.9q-1.3 1.2-1.2 3 0 .5.5.7 1 .5 1.4-.6.3-1.6 1.6-2.7l2.2-2a3.4 3.4 0 0 0 .8-3.9q-.4-1.2-1.6-1.9-1.5-.9-3.4-.9M26 42a2 2 0 0 1-2 2c-1 0-2-.8-2-2s1-2 2-2a2 2 0 0 1 2 2m-1 0a1 1 0 0 0-1-1.1q-1 .1-1 1 0 1.2 1 1.2t1-1M83.8 38q5.2-.1 9.6 2.3 5.2 3 6.4 8.7 1 5.5-2.7 9.5-2.9 3-6.1 5.8l-1.6 1.5C88.2 67 88 68.6 87.6 70q-.6 3.2-3.6 4c-3.3.7-6-1.4-6.2-4.6q-.1-4 1.8-7.1 1.6-2.5 4-4.3 2.2-1.9 4.2-3.9 2-1.9 1-4.3-1-2.5-3.7-2.9h-2.9q-2.2.4-3.3 2.4l-1.5 3.4a7 7 0 0 1-2 3 5.4 5.4 0 0 1-6.6-.2c-2-1.9-2-4-1.4-6.3q1.8-6.2 7.7-9.1a18 18 0 0 1 8.7-2m.1 2.4q-5-.1-9 2.6-4.1 2.5-5.2 7a5 5 0 0 0 0 2.2q.4 1.8 2.4 2 1.6 0 2.4-1.3l.4-.9 1.2-2.9c1.2-2.4 2.8-4.2 5.7-4.7 2.6-.4 5.2-.2 7.3 1.7q3.1 2.6 2.3 6.4a8 8 0 0 1-2.8 4.2l-5.3 4.9a9 9 0 0 0-3 7.7q0 1.3 1.3 2c1.3.5 3.2.4 3.5-1.7a11 11 0 0 1 4-7q2.9-2.4 5.5-4.9a9 9 0 0 0 2.2-10 10 10 0 0 0-4.1-5 16 16 0 0 0-8.8-2.3"
                    />
                    <path
                      fill="var(--color-dark-blue)"
                      d="m127 55.8.1-.3.7 2.5a47 47 0 0 1-9.1 39.8q-.9.9-1.7.3t0-1.7q1.6-2 3-4.2a45 45 0 0 0-1.3-49 44.3 44.3 0 1 0-15.6 64.6l1-.6q1-.3 1.5.6a1 1 0 0 1-.5 1.4q-3 1.8-6.4 2.9l-6 1.8a47 47 0 0 1-48.9-19.6l-2.7-4.8a40 40 0 0 1-5-18.2 48 48 0 0 1 1-13.3 43 43 0 0 1 11.5-21.5 46 46 0 0 1 43-13.6A47 47 0 0 1 127 54.7zM88 85c0 2.9-2.1 5-5 5-2.7 0-5-2-5-5s2.4-5 5-5c2.9 0 5 2 5 5m-2.3 0c0-1.5-1-2.7-2.5-2.7a3 3 0 0 0-3 2.6c0 2 1.4 2.8 2.8 2.8s2.8-.8 2.7-2.6m22.5 22.9q-1 0-1.1-.8t.4-1.4l2.4-2 4.1-4.3q1-1 1.7-.2t0 1.9q-3.1 3.8-7 6.6z"
                    />
                  </svg>
                </div>
                <div className="headerandinput" style={{ alignItems: "center" }}>
                  <div className="title">{t(LanguageKey.areyousure)}</div>
                  <div className="explain">{t(LanguageKey.deleteorderexplain)}</div>
                </div>
                <div className="ButtonContainer">
                  <button
                    onClick={() => {
                      setShowRejectOrder(null);
                    }}
                    className="cancelButton">
                    {t(LanguageKey.back)}
                  </button>
                  <button
                    onClick={() => {
                      removeMask();
                      handleRejectOrder(orderDetail.orderId);
                    }}
                    className="stopButton">
                    {t(LanguageKey.delete)}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};
export default OrderDetail;
