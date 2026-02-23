import { useSession } from "next-auth/react";
import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import findSystemLanguage from "brancy/helper/findSystemLanguage";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import { ShippingRequestType } from "brancy/models/store/enum";
import { IFullProduct, IOrderDetail } from "brancy/models/store/orders";
import OrderDetailContent from "brancy/components/store/order/popup/OrderDetail-Content";
import styles from "brancy/components/store/order/popup/orderstep.module.css";

import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import { clientFetchApi } from "brancy/helper/clientFetchApi";

interface OrderDetailProps {
  removeMask: () => void;
  orderDetail: IOrderDetail;
  handleRejectOrder: (orderId: string) => void;
  handleSendCodeByParcelId: (orderId: string, parcelId: string) => void;
  handleSendOrderByNonRequestType: (orderId: string) => void;
}

const OrderPickup: FC<OrderDetailProps> = ({
  removeMask,
  orderDetail,
  handleRejectOrder,
  handleSendCodeByParcelId,
  handleSendOrderByNonRequestType,
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFullProduct, setLoadingFullProduct] = useState(false);
  const [loadingRequset, setLoadingRequest] = useState(false);
  const [loaderCount, setLoaderCount] = useState(7);
  const [fullProduct, setFullProduct] = useState<IFullProduct>();
  const [activeFullProduct, setActiveFullProduct] = useState(false);
  const [parcelId, setParcelId] = useState("");
  const [showRejectOrder, setShowRejectOrder] = useState<string | null>(null);
  useEffect(() => {
    const handleResize = () => {
      setLoaderCount(window.innerWidth < 500 ? 5 : 7);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to handle PDF print
  const handlePrintPDF = () => {
    const pdfUrl = "/waybill.pdf";

    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // For mobile devices, open PDF in new tab and let user print manually
      window.open(pdfUrl, "_blank");
    } else {
      // For desktop, open in new window and trigger print
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Fallback if popup is blocked
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.target = "_blank";
        link.click();
      }
    }
  };

  // Function to handle PDF download/save
  const handleSavePDF = async () => {
    try {
      const pdfUrl = "/waybill.pdf";
      const response = await fetch(pdfUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();

      // Check if browser supports download
      if ("download" in document.createElement("a")) {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `waybill-${orderDetail.orderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback for older browsers
        window.open(pdfUrl, "_blank");
      }

      notify(ResponseType.Ok, NotifType.Success);
    } catch (error) {
      console.error("Error saving PDF:", error);
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  };

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
  const handleGetFullOrder = async () => {
    if (!activeFullProduct) {
      if (fullProduct) {
        setActiveFullProduct(true);
      } else {
        setActiveFullProduct(true);
        setLoadingFullProduct(true);
        try {
          const res = await clientFetchApi<IOrderDetail, IFullProduct>("/api/order/GetFullOrder", { methodType: MethodType.get, session: session, data: null, queries: [
              { key: "orderId", value: orderDetail.orderId },
              {
                key: "userId",
                value: orderDetail.userId ? orderDetail.userId.toString() : "",
              },
              { key: "language", value: findSystemLanguage().toString() },
            ], onUploadProgress: undefined });
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
  };
  // تابع جدید برای نمایش maincontent
  const handleShowMainContent = () => {
    setActiveFullProduct(false);
  };

  useEffect(() => {
    console.log("OrderDetail", orderDetail);
    if (orderDetail.shippingRequestType !== undefined) setLoading(false);
  }, [orderDetail.shippingRequestType]);
  return (
    <>
      <div className="dialogBg" onClick={handleBackdropClick} />
      <div ref={popupRef} className={showRejectOrder ? styles.popupmini : `popup ${styles.popup}`}>
        {loading && <Loading />}
        {!loading && (
          <>
            {!showRejectOrder && (
              <>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div
                      onClick={handleGetFullOrder}
                      className={
                        activeFullProduct ? `${styles.orderStepactive} ${styles.orderstepopen}` : styles.orderStepactive
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
                      <div className={styles.StepPickup_orderprogressStep} title="Order in progress">
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

                      <div
                        onClick={handleShowMainContent}
                        className={
                          !activeFullProduct
                            ? `${styles.StepPickup_orderpickupStep} ${styles.StepPickup_orderprogressStepactive}`
                            : styles.StepPickup_orderpickupStep
                        }
                        title="Order pickup">
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
                          <div key={i} className={styles.loadercircle} style={{ animationDelay: `${i * 0.4}s` }}></div>
                        ))}
                      </div>

                      <div className={styles.StepPickup_ordersendStep} title="Order delivery">
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
                        : t(LanguageKey.Storeproduct_pickingup)}
                    </div>
                    <div className={styles.ordernumber}>{fullProduct?.order.id}</div>
                  </div>
                </div>
                {activeFullProduct && !loadingFullProduct && fullProduct && (
                  <>
                    <OrderDetailContent ordersProductInfo={fullProduct} />
                    <div className="ButtonContainer">
                      <div></div>
                      {/* {orderDetail.userId !== undefined &&
                    handleVerifyFromOrderDetail && (
                      <div
                        onClick={() =>
                          handleVerifyFromOrderDetail(
                            orderDetail.orderId,
                            fullProduct!.order.status
                          )
                        }
                        className="saveButton">
                        {t(LanguageKey.Storeorder_AcceptthisOrder)}
                      </div>
                    )} */}
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
                {!activeFullProduct && orderDetail.shippingRequestType === ShippingRequestType.None && (
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
                    <div className="ButtonContainer">
                      <div
                        onClick={() => {
                          handleSendOrderByNonRequestType(orderDetail.orderId);
                          removeMask();
                        }}
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
                {!activeFullProduct && orderDetail.shippingRequestType === ShippingRequestType.TrackingCode && (
                  <>
                    <div className={styles.maincontent}>
                      <div className={styles.pdfsection}>
                        <div className="headerandinput">
                          <div className="headertext"> {t(LanguageKey.Storeorder_TrackingCode)}</div>
                          <div className="headerparent">
                            <InputText
                              name="TrackingCode"
                              className="textinputbox"
                              placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                              maxLength={100}
                              handleInputChange={(e) => {
                                setParcelId(e.target.value);
                              }}
                              value={parcelId}
                            />
                            <img
                              style={{
                                cursor: "pointer",
                                width: "30px",
                                height: "30px",
                                padding: "5px",
                              }}
                              title="ℹ️ paste"
                              src="/copy.svg"
                              onClick={async () => {
                                try {
                                  const clipboardText = await navigator.clipboard.readText();
                                  // You need to update the InputText value state here
                                  // For example: setTrackingCode(clipboardText);
                                } catch (error) {
                                  console.error("Failed to read clipboard:", error);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

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
                        {t(LanguageKey.Storeorder_ManualTrackingExplain)}
                      </div>
                    </div>
                    <div className="ButtonContainer">
                      <button
                        disabled={parcelId.length === 0}
                        onClick={() => {
                          handleSendCodeByParcelId(orderDetail.orderId, parcelId);
                          removeMask();
                        }}
                        className={parcelId.length === 0 ? "disableButton" : "saveButton"}>
                        {loadingRequset ? (
                          <RingLoader />
                        ) : (
                          <>
                            <svg
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 14 11"
                              width="16"
                              height="16">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                fill="#fff"
                                d="M13.6 2.3q.8-1 0-2a1.4 1.4 0 0 0-2 .1L4.9 7.6 2.4 5.2a1.4 1.4 0 0 0-2 0q-.7 1 0 2L4 10.6a1.4 1.4 0 0 0 2 0z"
                              />
                            </svg>
                            {t(LanguageKey.Storeorder_AcceptthisOrder)}
                          </>
                        )}
                      </button>
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
                {!activeFullProduct && orderDetail.shippingRequestType === ShippingRequestType.Platform && (
                  <>
                    <div className={styles.maincontent}>
                      <div className={styles.pdfsection}>
                        <img style={{ width: "64px", height: "64px" }} title="ℹ️ attachment" src="/pdf.svg" />

                        {t(LanguageKey.Storeorder_Waybill)}
                        <div className={`ButtonContainer translate`} style={{ maxWidth: "80%" }}>
                          <div className="saveButton" onClick={handlePrintPDF}>
                            {t(LanguageKey.Storeorder_PrintWaybill)}
                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.3 7.3h11.4q1 0 1.6.4.9.5 1.4 1.2l.6 1.5.3 2 .1 2.5-.3 1.8q-.5.9-1.4 1.5a4 4 0 0 1-1.8.5h-1.4l.1.7v1.2a3 3 0 0 1-1.5 2q-.5.4-1 .4H8.6q-.6 0-1.1-.3A3 3 0 0 1 6 19.4l.1-.7H4.8a4 4 0 0 1-1.8-.5l-1.4-1.5q-.4-.9-.3-1.8l.1-2.4.3-2.1.6-1.5q.5-.8 1.4-1.2 0-.2 1.6-.4zM9 17l-1 3c0 .4.2 1 .5 1h7q.3-.3.5-1l-1-3zm8-5q0-1 1-1a1 1 0 1 1-1 1"
                                fill="#fff"
                              />
                              <path
                                opacity=".4"
                                d="M13.1 1.2h2.2q1 0 1.6.9.6.7.8 1.6V6H6.3V3.6q0-1 .8-1.6.7-.6 1.6-.8z"
                                fill="#fff"
                              />
                            </svg>
                          </div>
                          <div className="cancelButton" onClick={handleSavePDF}>
                            {t(LanguageKey.save)} 
                            <svg fill="none" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M19.5 19.9a1.5 1.5 0 0 0-3 0v6.7h-1.7a2 2 0 0 0-1.5 1c-.4.9 0 1.6.1 1.8l.5.7 1.7 2 1 .8q.4.4 1.4.5 1-.1 1.5-.5l1-.9 1.5-1.8V30l.6-.7c0-.2.5-.9.1-1.8a2 2 0 0 0-1.5-1h-1.7z"
                                fill=" var(--color-dark-blue)"
                              />
                              <path
                                opacity=".4"
                                d="M1.9 18.8a9 9 0 0 1 6.3-8.3l.5-.3.2-.5A9.4 9.4 0 0 1 27.3 11q0 .5.2.6l.6.3a7.9 7.9 0 0 1-1.9 15.5l-.6-.1q-.2 0-.4-.6a4 4 0 0 0-2.6-2.2l-.8-.3v-4.3a3.8 3.8 0 0 0-7.6 0v4.3l-.9.3a4 4 0 0 0-2.6 2.2q-.1.5-.4.6h-.5a8.6 8.6 0 0 1-8-8.5"
                                fill=" var(--color-dark-blue)"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
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
                        {t(LanguageKey.Storeorder_WaybillExplain)}
                      </div>
                    </div>
                    <div className="ButtonContainer">
                      {
                        <div onClick={() => {}} className="saveButton">
                          <svg
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 14 11"
                            width="16"
                            height="16">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              fill="#fff"
                              d="M13.6 2.3q.8-1 0-2a1.4 1.4 0 0 0-2 .1L4.9 7.6 2.4 5.2a1.4 1.4 0 0 0-2 0q-.7 1 0 2L4 10.6a1.4 1.4 0 0 0 2 0z"
                            />
                          </svg>
                          {t(LanguageKey.Storeorder_AcceptthisOrder)}
                        </div>
                      }
                      {/* <div
                          onClick={() => {
                            setShowRejectOrder(orderDetail.orderId);
                          }}
                          className="stopButton"
                          style={{ maxWidth: "35%" }}>
                          {t(LanguageKey.reject)}
                        </div> */}
                    </div>
                  </>
                )}
                {loadingFullProduct && <Loading />}
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
                  <div className="explain">{t(LanguageKey.deletedraftexplain)}</div>
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

export default OrderPickup;
