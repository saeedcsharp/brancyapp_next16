import { useSession } from "next-auth/react";
import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "brancy/components/priceFormater";
import findSystemLanguage from "brancy/helper/findSystemLanguage";
import initialzedTime from "brancy/helper/manageTimer";
import { specifyLogistic } from "brancy/helper/specifyLogistic";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import { IFullProduct, IOrderDetail, IParcelInfo } from "brancy/models/store/orders";
import OrderDetailContent from "brancy/components/store/order/popup/OrderDetail-Content";
import styles from "./orderstep.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
interface OrderDetailProps {
  removeMask: () => void;
  orderDetail: IOrderDetail;
}

const OrderDelivered: FC<OrderDetailProps> = ({ removeMask, orderDetail }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFullProduct, setLoadingFullProduct] = useState(false);
  const [loadingRequset, setLoadingRequest] = useState(false);
  const [loaderCount, setLoaderCount] = useState(7);
  const [fullProduct, setFullProduct] = useState<IFullProduct>();
  const [activeFullProduct, setActiveFullProduct] = useState(false);
  const [parcelInfo, setParcelInfo] = useState<IParcelInfo>();
  const [activeTab, setActiveTab] = useState<"content" | "maincontent">("maincontent");

  useEffect(() => {
    const handleResize = () => {
      setLoaderCount(window.innerWidth < 500 ? 5 : 7);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        removeMask();
      }
    },
    [removeMask],
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
  async function handleGetFullOrder() {
    if (activeFullProduct) setActiveFullProduct(false);
    else if (!activeFullProduct && fullProduct) setActiveFullProduct(true);
    else {
      setActiveFullProduct(true);
      setLoadingFullProduct(true);
      try {
        const res = await clientFetchApi<IOrderDetail, IFullProduct>("/api/order/GetFullOrder", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            { key: "orderId", value: orderDetail.orderId },
            {
              key: "userId",
              value: orderDetail.userId ? orderDetail.userId.toString() : "",
            },
            { key: "language", value: findSystemLanguage().toString() },
          ],
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          setFullProduct(res.value);
          setActiveFullProduct(true);
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setLoadingFullProduct(false);
      }
    }
  }
  async function handleGetParcelInfo() {
    setLoading(true);
    try {
      const res = await clientFetchApi<boolean, IParcelInfo>("/api/order/GetParcelInfo", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "orderId", value: orderDetail.orderId }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setParcelInfo(res.value);
        setLoading(false);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (!session || orderDetail.trackingId === null) return;
    handleGetParcelInfo();
  }, [session]);
  const handleShowContent = useCallback(() => {
    if (!activeFullProduct && !fullProduct) {
      handleGetFullOrder();
    } else {
      setActiveFullProduct(true);
    }
    setActiveTab("content");
  }, [activeFullProduct, fullProduct, handleGetFullOrder]);

  const handleShowMainContent = useCallback(() => {
    setActiveFullProduct(false);
    setActiveTab("maincontent");
  }, []);
  return (
    <>
      <div className="dialogBg" onClick={handleBackdropClick} />
      <div ref={popupRef} className={`popup ${styles.popup}`}>
        {loading && <Loading />}
        {!loading && (
          <>
            <div className="headerandinput">
              <div className="headerparent">
                <div
                  onClick={handleShowContent}
                  className={
                    activeTab === "content"
                      ? `${styles.orderStepactive} ${styles.orderstepopen}`
                      : styles.orderStepactive
                  }
                  title="Order information">
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
                  <div className={styles.Stepdelivered_orderprogressStep} title="Order in progress">
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 28 28"
                      role="img"
                      aria-label="Order in progress">
                      <path
                        d="M15.3 10.1h6.5m-6.5 7.8h6.5m-15.6 0 1.3 1.3 2.8-2.6m-4.1-6.5 1.3 1.3 2.8-2.6M10 27h7.8c6.5 0 9.1-2.6 9.1-9.1v-7.8c.1-6.5-2.5-9.1-9-9.1h-7.8C3.6 1 1 3.6 1 10.1v7.8c0 6.5 2.6 9.1 9.1 9.1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className={styles.loader}>
                    {[...Array(loaderCount)].map((_, i) => (
                      <div key={i} className={styles.loadercircle}></div>
                    ))}
                  </div>

                  <div className={styles.Stepdelivered_orderpickupStep} title="Order pickup">
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 26 26"
                      role="img"
                      aria-label="Order pickup">
                      <path
                        d="M5.8 19.5h4M1.2 7.7h23.6M15.3 1l1.1 6.7v7L13 13.3l-3.4 1.2v-7L10.7 1m-8 2.4-1 2.8Q1 7.7 1 9.2v10.4C1 22.7 2.4 25 5.6 25h14.8c3.2 0 4.6-2.2 4.6-5.4V9.3a8 8 0 0 0-.6-3.1l-1.1-2.9A4 4 0 0 0 19.8 1H6.2a4 4 0 0 0-3.5 2.4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className={styles.loader}>
                    {[...Array(loaderCount)].map((_, i) => (
                      <div key={i} className={styles.loadercircle}></div>
                    ))}
                  </div>

                  <div
                    onClick={handleShowMainContent}
                    className={
                      !activeFullProduct
                        ? `${styles.Stepdelivered_ordersendStep} ${styles.Stepdelivered_orderprogressStepactive}`
                        : styles.Stepdelivered_ordersendStep
                    }
                    title="Order delivery">
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 29 29"
                      role="img"
                      aria-label="Order delivery">
                      <path
                        d="M14.3 17h1.4c1.4 0 2.6-1.2 2.6-2.7V1h-12q-3.1.2-4.6 2.7M1 21a4 4 0 0 0 4 4h1.3m0 0c0-1.5 1.2-2.7 2.7-2.7M6.3 25a2.7 2.7 0 0 0 5.4 0m-5.4 0A2.7 2.7 0 0 1 9 22.3m0 0c1.5 0 2.7 1.2 2.7 2.7M9 22.3a2.7 2.7 0 0 1 2.7 2.7m0 0H17m0 0c0-1.5 1.2-2.7 2.7-2.7M17 25a2.7 2.7 0 0 0 5.3 0M17 25a2.7 2.7 0 0 1 2.7-2.7m0 0c1.4 0 2.6 1.2 2.6 2.7m-2.6-2.7a3 3 0 0 1 2.6 2.7m0 0h1.4a4 4 0 0 0 4-4v-4m0 0h-4q-1.3-.1-1.4-1.3v-4q.1-1.3 1.4-1.4h1.7m2.3 6.7v-2.7l-2.3-4m0 0-2.3-4A3 3 0 0 0 20.8 5h-2.5v9.3c0 1.5-1.2 2.7-2.6 2.7h-1.4M1 9h8m-8 4h5.3M1 17h2.7"
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
                <div className="title">
                  {activeFullProduct
                    ? t(LanguageKey.Storeorder_orderDetailsStep)
                    : t(LanguageKey.Storeproduct_delivered)}
                </div>
                <div className={styles.ordernumber}>{fullProduct?.order.id}</div>
              </div>
            </div>
            {activeFullProduct && !loadingFullProduct && fullProduct && (
              <OrderDetailContent ordersProductInfo={fullProduct} />
            )}
            {!activeFullProduct && orderDetail.trackingId !== null && parcelInfo && (
              <div className={styles.maincontent}>
                <table className={styles.infoTable}>
                  <tbody>
                    {parcelInfo.logs[parcelInfo.logs.length - 1].postMan !== null && (
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_PostMan)}</th>
                        <td className={styles.tablecontent}>
                          <div className="instagramprofile">
                            <img
                              className="instagramimage"
                              title="ℹ️ Profile image"
                              alt="profile image"
                              src={basePictureUrl + parcelInfo.logs[parcelInfo.logs.length - 1].postMan!.profileUrl}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/no-profile.svg";
                              }}
                            />
                            <div className="instagramprofiledetail" style={{ maxWidth: "100%" }}>
                              <div className="instagramusername">
                                {parcelInfo.logs[parcelInfo.logs.length - 1].postMan!.name || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_TrackingCode)}</th>
                      <td className={styles.tablecontent}>
                        <div
                          className={styles.mobileparent}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (parcelInfo.id) {
                              navigator.clipboard.writeText(parcelInfo.id.toString());
                            }
                          }}>
                          <strong>{parcelInfo.id}</strong>
                          <img style={{ width: "16px", height: "16px" }} title="ℹ️ Copy" src="/copy.svg" alt="Copy" />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_from)}</th>
                      <td className={styles.tablecontent}>{parcelInfo.from}</td>
                    </tr>
                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_Destination)}</th>
                      <td className={styles.tablecontent}>{parcelInfo.to}</td>
                    </tr>
                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_currentLocation)}</th>
                      <td className={styles.tablecontent}>{parcelInfo.logs[parcelInfo.logs.length - 1].location}</td>
                    </tr>
                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_DELIVERY)}</th>
                      <td className={styles.tablecontent}>{specifyLogistic(parcelInfo.logesticType)}</td>
                    </tr>
                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.totalprice)}</th>
                      <td className={styles.tablecontent}>
                        <PriceFormater
                          pricetype={parcelInfo.priceType}
                          fee={parcelInfo.price}
                          className={PriceFormaterClassName.PostPrice}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_AcceptthisOrder)}</th>
                      <td className={styles.tablecontent}>
                        {new DateObject({
                          date: parcelInfo.acceptTime * 1000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY/MM/DD - HH:mm:ss")}
                      </td>
                    </tr>
                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_lastUpdateTime)}</th>
                      <td className={styles.tablecontent}>
                        {new DateObject({
                          date: parcelInfo.lastUpdateTime * 1000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY/MM/DD - HH:mm:ss")}
                      </td>
                    </tr>

                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_sender)}</th>
                      <td className={styles.tablecontent}>{parcelInfo.sender}</td>
                    </tr>
                    <tr>
                      <th className={styles.tableheader}>{t(LanguageKey.Storeorder_receiver)}</th>
                      <td className={styles.tablecontent}>{parcelInfo.receiver}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {!activeFullProduct && orderDetail.trackingId === null && (
              <>
                <div className={styles.maincontent}>
                  <div className={styles.attention}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        minWidth: "35px",
                        width: "35px",
                        height: "35px",
                        minHeight: "35px",
                      }}
                      fill="none"
                      viewBox="0 0 24 24">
                      <path
                        opacity=".4"
                        d="M12 1C4 1 1 3.8 1 12c0 8 3 11 11 11s11-3 11-11c0-8.2-3-11-11-11"
                        stroke="var(--color-dark-yellow)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-2-8a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0z"
                        fill="var(--color-dark-yellow)"
                      />
                    </svg>
                    {t(LanguageKey.Storeorder_noneSendExplain)}
                  </div>
                </div>
                {/* <div className={`ButtonContainer translate`}>
                  <div
                    onClick={() => {
                      handleSendOrderByNonTrackingIdOrderDeliverd(
                        orderDetail.orderId
                      );
                      removeMask();
                    }}
                    className="saveButton">
                    {t(LanguageKey.Storeorder_AcceptthisOrder)}
                  </div>
                </div> */}
              </>
            )}
            {loadingFullProduct && <Loading />}
          </>
        )}
      </div>
    </>
  );
};

export default OrderDelivered;
