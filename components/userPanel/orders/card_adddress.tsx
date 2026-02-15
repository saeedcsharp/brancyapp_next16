import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";

import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import RadioButton from "saeed/components/design/radioButton";
import TextArea from "saeed/components/design/textArea/textArea";
import Loading from "saeed/components/notOk/loading";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import IUserCoupon, {
  IAddress,
  ICompleteProduct,
  ICreateOrder,
  ILogistic,
  InputTypeAddress,
} from "saeed/models/userPanel/orders";

import styles from "./card_address.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const MOBILE_BREAKPOINT = 1024;

type OrderState = {
  couponCode: string;
  coupon?: IUserCoupon;
  loadingCoupon: boolean;
  note: string;
  activeButton: boolean;
  loadingCreateOrder: boolean;
  isMobile: boolean;
};

type OrderAction =
  | { type: "SET_COUPON_CODE"; payload: string }
  | { type: "SET_COUPON"; payload?: IUserCoupon }
  | { type: "SET_LOADING_COUPON"; payload: boolean }
  | { type: "SET_NOTE"; payload: string }
  | { type: "SET_ACTIVE_BUTTON"; payload: boolean }
  | { type: "SET_LOADING_CREATE_ORDER"; payload: boolean }
  | { type: "SET_IS_MOBILE"; payload: boolean };

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case "SET_COUPON_CODE":
      return { ...state, couponCode: action.payload };
    case "SET_COUPON":
      return { ...state, coupon: action.payload };
    case "SET_LOADING_COUPON":
      return { ...state, loadingCoupon: action.payload };
    case "SET_NOTE":
      return { ...state, note: action.payload };
    case "SET_ACTIVE_BUTTON":
      return { ...state, activeButton: action.payload };
    case "SET_LOADING_CREATE_ORDER":
      return { ...state, loadingCreateOrder: action.payload };
    case "SET_IS_MOBILE":
      return { ...state, isMobile: action.payload };
    default:
      return state;
  }
};

export default function CardAddress({
  products,
  addresses,
  inputTypeAddress,
  loadingCard,
  logisticPrice,
  selectedLogisticId,
  setShowAddress,
  handleShowAddresses,
  handleShowCreateAddress,
  handleSelectLogistic,
}: {
  products: ICompleteProduct[];
  addresses: IAddress[];
  inputTypeAddress: InputTypeAddress | null;
  loadingCard: boolean;
  selectedLogisticId: number | null;
  logisticPrice: ILogistic[];
  setShowAddress: (show: boolean) => void;
  handleShowAddresses: (show: boolean) => void;
  handleShowCreateAddress: (inputType: InputTypeAddress) => void;
  handleSelectLogistic: (id: number) => void;
}) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const couponInputRef = useRef<HTMLInputElement>(null);
  const noteTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const uniqueId = useId();
  const couponId = `${uniqueId}-coupon`;
  const noteId = `${uniqueId}-note`;

  const [state, dispatch] = useReducer(orderReducer, {
    couponCode: "",
    coupon: undefined,
    loadingCoupon: false,
    note: "",
    activeButton: addresses.length === 0,
    loadingCreateOrder: false,
    isMobile: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const totalPrice = useMemo(() => {
    return products.reduce(
      (total, product) => total + product.subProducts.reduce((sum, sub) => sum + sub.mainPrice * sub.cardCount, 0),
      0
    );
  }, [products]);

  const totalDiscount = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total + product.subProducts.reduce((sum, sub) => sum + (sub.mainPrice - sub.price) * sub.cardCount, 0),
      0
    );
  }, [products]);

  const deliveryAmount = useMemo(() => {
    const logisticCard = logisticPrice.find((x) => x.id === selectedLogisticId);
    return logisticCard?.price || 0;
  }, [logisticPrice, selectedLogisticId]);

  const couponDiscount = useMemo(() => {
    if (!state.coupon) return 0;
    const percentageCoupon = state.coupon.discount * 0.01 * totalPrice;
    const fixedCoupon = state.coupon.maxDiscount;
    if (fixedCoupon !== null) return Math.round(Math.min(percentageCoupon, fixedCoupon));
    else return Math.round(percentageCoupon);
  }, [state.coupon, totalPrice]);

  const finalTotal = useMemo(() => {
    return totalPrice + deliveryAmount - totalDiscount - couponDiscount;
  }, [totalPrice, deliveryAmount, totalDiscount, couponDiscount]);

  const calculateTotalPrice = useCallback(() => totalPrice, [totalPrice]);
  const calculateDeliveryAmount = useCallback(() => deliveryAmount, [deliveryAmount]);
  const calculateTotalDiscount = useCallback(() => totalDiscount, [totalDiscount]);

  function calculateCoupon() {
    return couponDiscount;
  }

  const handleGetCoupon = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    dispatch({ type: "SET_LOADING_COUPON", payload: true });

    try {
      const res = await clientFetchApi<boolean, IUserCoupon>("/api/shop/GetProductCoupon", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "code", value: state.couponCode },
          {
            key: "instagramerId",
            value: products[0].shortProduct.instagramerId.toString(),
          },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        dispatch({ type: "SET_COUPON", payload: res.value });
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        dispatch({ type: "SET_LOADING_COUPON", payload: false });
      }
    }
  }, [session, state.couponCode, products]);

  const handleGetOrderPaymentLink = useCallback(
    async (id: string) => {
      try {
        const res = await clientFetchApi<string, string>("/api/order/GetOrderPaymentLink", { methodType: MethodType.get, session: session, data: null, queries: [
            {
              key: "orderId",
              value: id,
            },
          ], onUploadProgress: undefined });
        if (res.succeeded) router.replace(res.value);
        else {
          notify(res.info.responseType, NotifType.Warning);
          dispatch({ type: "SET_LOADING_CREATE_ORDER", payload: false });
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
        dispatch({ type: "SET_LOADING_CREATE_ORDER", payload: false });
      }
    },
    [session, router]
  );

  const handleCreateOrder = useCallback(async () => {
    dispatch({ type: "SET_LOADING_CREATE_ORDER", payload: true });
    const items: ICreateOrder["items"] = products.flatMap((product) =>
      product.subProducts.map((sub) => ({
        subProductId: sub.subProductId,
        cardCount: sub.cardCount,
      }))
    );
    const order: ICreateOrder = {
      addressId: addresses.find((x) => x.isDefault)!.id,
      couponCode: state.couponCode,
      items: items,
      logesticType: selectedLogisticId,
    };

    try {
      const res = await clientFetchApi<ICreateOrder, string>("/api/order/CreateOrder", { methodType: MethodType.post, session: session, data: order, queries: [
          {
            key: "instagramerId",
            value: products[0].shortProduct.instagramerId.toString(),
          },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        handleGetOrderPaymentLink(res.value);
        return;
      } else if (
        res.info.responseType === ResponseType.CardIsEmpty ||
        res.info.responseType === ResponseType.NotMatchedCart
      ) {
        router.reload();
      } else if (res.info.responseType === ResponseType.InvalidCouponCode)
        dispatch({ type: "SET_COUPON_CODE", payload: "" });
      else if (res.info.responseType === ResponseType.ThisParcelNotSupportedByAnySelectedAvailableLogestic)
        dispatch({ type: "SET_ACTIVE_BUTTON", payload: true });
      notify(res.info.responseType, NotifType.Warning);
      handleShowAddresses(true);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      dispatch({ type: "SET_LOADING_CREATE_ORDER", payload: false });
    }
  }, [
    session,
    products,
    addresses,
    state.couponCode,
    selectedLogisticId,
    handleGetOrderPaymentLink,
    handleShowAddresses,
    router,
  ]);

  const handleResize = useCallback(() => {
    dispatch({
      type: "SET_IS_MOBILE",
      payload: window.innerWidth <= MOBILE_BREAKPOINT,
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddress(false);
      }
    },
    [setShowAddress]
  );

  useLayoutEffect(() => {
    dispatch({
      type: "SET_IS_MOBILE",
      payload: window.innerWidth <= MOBILE_BREAKPOINT,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [handleResize, handleKeyDown]);

  const handleCouponInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_COUPON_CODE", payload: e.target.value });
  }, []);

  const handleNoteChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "SET_NOTE", payload: e.target.value });
  }, []);

  const handleRemoveCoupon = useCallback(() => {
    dispatch({ type: "SET_COUPON", payload: undefined });
  }, []);

  return (
    <>
      <div className={styles.cart}>
        {loadingCard && <Loading />}
        {!loadingCard && (
          <>
            <div className={styles.backtocart} onClick={() => setShowAddress(false)}>
              <img style={{ width: "20px", height: "20px" }} title="ℹ️ back to cart" src="/back-forward.svg" />
              {t(LanguageKey.Backtocart)}
            </div>
            <div className={styles.addresssection}>
              <div className={styles.boxheader}> {t(LanguageKey.Storeorder_SendtotheAddress)}</div>

              {addresses.length === 0 && inputTypeAddress !== null && (
                <>
                  <button onClick={() => handleShowCreateAddress(inputTypeAddress!)} className="saveButton">
                    {t(LanguageKey.userpanel_AddNewAddress)}
                  </button>
                </>
              )}
              {addresses.length > 0 && (
                <>
                  <div className="frameParent" style={{ height: "fit-content" }}>
                    <div className="title">
                      <img
                        style={{
                          width: "20px",
                          height: "20px",
                          padding: "5px",
                          backgroundColor: "var(--color-dark-blue)",
                          borderRadius: "var(--br15)",
                        }}
                        src="/tickff.svg"
                      />
                      {addresses.find((x) => x.isDefault)!.subject}
                    </div>
                    <div className={styles.changeaddress} onClick={() => handleShowAddresses(true)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 22 22"
                        stroke="var(--color-dark-blue)"
                        strokeWidth="2"
                        width="20">
                        <path d="m15 2-7.8 8q-.5.6-.7 1.3l-.4 3Q6 16 7.8 16l3-.4q.7-.1 1.3-.7L20 7c1.3-1.4 2-3 0-5S16.4.7 15 2 M14 3.2A7 7 0 0 0 18.8 8 M10 1H8C3 1 1 3 1 8v6c0 5 2 7 7 7h6c5 0 7-2 7-7v-2" />
                      </svg>
                      {t(LanguageKey.Storeorder_changeofaddress)}
                    </div>
                  </div>
                  <div className={styles.addressContent}>
                    <div className={styles.addressContentsection}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="var(--text-h2)"
                        width="24"
                        strokeWidth="1.5">
                        <ellipse cx="12" cy="17.5" rx="7" ry="3.5" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {addresses.find((x) => x.isDefault)!.receiver}
                    </div>
                    <div className={styles.addressContentsection}>
                      <img style={{ width: "20px", height: "20px" }} title="ℹ️ location" src="/order_location.svg" />
                      {addresses.find((x) => x.isDefault)!.postalCode}
                    </div>

                    {/* <div className={styles.addressContentsection}>
                      <img style={{ width: "20px", height: "20px" }} title="ℹ️ call" src="/order_call.svg" />
                      {addresses.find((x) => x.isDefault)!.phone}???????????
                    </div> */}

                    <div className={styles.addressContentsection}>
                      <img style={{ width: "20px", height: "20px" }} title="ℹ️ address" src="/order_address.svg" />
                      {addresses.find((x) => x.isDefault)!.address}
                    </div>

                    {addresses.find((x) => x.isDefault)!.note.length > 0 && (
                      <div className={styles.addressContentsection}>
                        <img style={{ width: "20px", height: "20px" }} title="ℹ️ note" src="/order_note.svg" />
                        {addresses.find((x) => x.isDefault)!.note}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="headerandinput">
              <div className="title">
                <span>{t(LanguageKey.note)}</span>
              </div>
              <TextArea
                className={"message"}
                value={state.note}
                role={""}
                title={""}
                id={noteId}
                handleInputChange={handleNoteChange}
              />
            </div>
            <div className={styles.productContainer}>
              <div className="title" style={{ marginBottom: "10px" }}>
                {t(LanguageKey.Storeorder_Productsinyourshoppingcart)}
                <span className={styles.itemsCount}>
                  {products.length} {t(LanguageKey.Storeorder_ITEM)}
                </span>
              </div>
              <div className={styles.scrollableProductList}>
                {products.map((item, idx) => (
                  <div key={`product-${item.shortProduct.instagramerId}-${idx}`} className={styles.card}>
                    <img
                      loading="lazy"
                      decoding="async"
                      className={styles.img}
                      src={basePictureUrl + item.shortProduct.thumbnailMediaUrl}
                      alt={`Product ${idx + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.svg";
                      }}
                    />
                    <div className={styles.info}>
                      {t(LanguageKey.filter_price)}{" "}
                      <PriceFormater
                        pricetype={item.shortProduct.priceType}
                        fee={item.subProducts.reduce((total, subItem) => total + subItem.price * subItem.cardCount, 0)}
                        className={PriceFormaterClassName.PostPrice}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {state.isMobile && (
          <div className={styles.ordersummary}>
            {selectedLogisticId !== null && (
              <div className="headerandinput">
                <div className={styles.boxheader}>
                  <span>{t(LanguageKey.Storeorder_DELIVERY)}</span>
                </div>
                {logisticPrice.map((v) => (
                  <div key={v.id} className={styles.Deliveryoption}>
                    <RadioButton
                      name={v.langName}
                      id=""
                      checked={selectedLogisticId === v.id ? true : false}
                      handleOptionChanged={() => handleSelectLogistic(v.id)}
                      textlabel={"orderType"}
                      title={"orderType"}
                    />
                    <img width="20" height="20" src={basePictureUrl + v.logo} />
                    {v.langName}
                  </div>
                ))}
              </div>
            )}
            <div className="headerandinput">
              <div className={styles.boxheader}>
                <span>{t(LanguageKey.navbar_Payment)}</span>
              </div>

              <div className="frameParent" style={{ gap: "10px" }}>
                <InputText
                  style={{ width: "100%" }}
                  placeHolder={t(LanguageKey.Storeorder_Coupon)}
                  className="textinputbox"
                  id={couponId}
                  handleInputChange={handleCouponInputChange}
                  value={state.couponCode}
                />
                <button
                  style={{ height: "40px" }}
                  onClick={handleGetCoupon}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleGetCoupon();
                    }
                  }}
                  disabled={state.couponCode.length === 0 || state.loadingCoupon}
                  className={state.couponCode.length > 0 ? "saveButton" : "disableButton"}
                  aria-label={t(LanguageKey.Apply)}
                  tabIndex={0}>
                  {state.loadingCoupon ? (
                    <div className={styles.loadingContainer}>
                      <RingLoader />
                    </div>
                  ) : (
                    t(LanguageKey.Apply)
                  )}
                </button>
              </div>
            </div>
            <div className={styles.summarycontent}>
              <div className="frameParent">
                {t(LanguageKey.navbar_totalOrders)}
                <PriceFormater
                  pricetype={products[0].shortProduct.priceType}
                  fee={calculateTotalPrice()}
                  className={PriceFormaterClassName.PostPrice}
                />
              </div>

              <div className="frameParent">
                {t(LanguageKey.product_Discount)}
                <PriceFormater
                  pricetype={products[0].shortProduct.priceType}
                  fee={calculateTotalDiscount()}
                  className={PriceFormaterClassName.PostPrice}
                />
              </div>

              <div className="frameParent">
                {t(LanguageKey.Storeorder_DeliveryAmount)}
                <PriceFormater
                  pricetype={products[0].shortProduct.priceType}
                  fee={calculateDeliveryAmount()}
                  className={PriceFormaterClassName.PostPrice}
                />
              </div>

              <div className="frameParent">
                {t(LanguageKey.Storeorder_InsuranceAmount)}
                <PriceFormater
                  pricetype={products[0].shortProduct.priceType}
                  fee={0}
                  className={PriceFormaterClassName.PostPrice}
                />
              </div>

              {state.coupon && (
                <div className={styles.summarycontent}>
                  <div className="frameParent">
                    {t(LanguageKey.Storeorder_Coupon)}
                    <PriceFormater
                      pricetype={products[0].shortProduct.priceType}
                      fee={calculateCoupon()}
                      className={PriceFormaterClassName.PostPrice}
                    />
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="stopButton"
                    aria-label={t(LanguageKey.Storeorder_RemoveCoupon)}
                    tabIndex={0}>
                    {t(LanguageKey.Storeorder_RemoveCoupon)}
                  </button>
                </div>
              )}
              <div className={styles.boxheader}>
                {t(LanguageKey.total)}
                {!state.coupon && (
                  <PriceFormater
                    pricetype={products[0].shortProduct.priceType}
                    fee={finalTotal}
                    className={PriceFormaterClassName.PostPrice}
                  />
                )}
                {state.coupon && (
                  <PriceFormater
                    pricetype={products[0].shortProduct.priceType}
                    fee={finalTotal}
                    className={PriceFormaterClassName.PostPrice}
                  />
                )}
              </div>
            </div>
            <button
              style={{
                borderRadius: "var(--br25)",
                height: "40px",
              }}
              className={state.activeButton ? "disableButton" : "saveButton"}
              disabled={state.activeButton || state.loadingCreateOrder}
              onClick={handleCreateOrder}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCreateOrder();
                }
              }}
              aria-label={t(LanguageKey.Continue)}
              tabIndex={0}>
              {state.loadingCreateOrder ? (
                <div className={styles.loadingContainer}>
                  <RingLoader />
                </div>
              ) : (
                t(LanguageKey.Continue)
              )}
            </button>
          </div>
        )}
      </div>
      {!state.isMobile && (
        <div className={styles.summary}>
          {selectedLogisticId !== null && (
            <div className="headerandinput">
              <div className={styles.boxheader}>{t(LanguageKey.Storeorder_DELIVERY)} </div>

              {logisticPrice.map((v) => (
                <div key={v.id} className={styles.Deliveryoption}>
                  <RadioButton
                    name={v.langName}
                    id=""
                    checked={selectedLogisticId === v.id ? true : false}
                    handleOptionChanged={() => handleSelectLogistic(v.id)}
                    textlabel={"orderType"}
                    title={"orderType"}
                  />
                  <img
                    width="20px"
                    height="20px"
                    src={basePictureUrl + v.logo}
                    onError={(e) => {
                      e.currentTarget.src = "/sent.svg";
                    }}
                  />
                  {v.langName}
                </div>
              ))}
            </div>
          )}
          <div className="headerandinput">
            <div className={styles.boxheader}>{t(LanguageKey.navbar_Payment)}</div>

            <div className="frameParent" style={{ gap: "10px" }}>
              <InputText
                placeHolder={t(LanguageKey.Storeorder_Coupon)}
                className="textinputbox"
                handleInputChange={handleCouponInputChange}
                value={state.couponCode}
              />
              <button
                style={{ height: "40px" }}
                onClick={handleGetCoupon}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleGetCoupon();
                  }
                }}
                disabled={state.couponCode.length === 0 || state.loadingCoupon}
                className={state.couponCode.length > 0 ? "saveButton" : "disableButton"}
                aria-label={t(LanguageKey.Apply)}
                tabIndex={0}>
                {state.loadingCoupon ? (
                  <div className={styles.loadingContainer}>
                    <RingLoader />
                  </div>
                ) : (
                  t(LanguageKey.Apply)
                )}
              </button>
            </div>

            <div className={styles.summarycontent}>
              <div className="frameParent">
                {t(LanguageKey.navbar_totalOrders)}
                <PriceFormater
                  pricetype={products[0].shortProduct.priceType}
                  fee={calculateTotalPrice()}
                  className={PriceFormaterClassName.PostPrice}
                />
              </div>

              <div className="frameParent">
                {t(LanguageKey.product_Discount)}
                <PriceFormater
                  pricetype={products[0].shortProduct.priceType}
                  fee={calculateTotalDiscount()}
                  className={PriceFormaterClassName.PostPrice}
                />
              </div>

              <div className="frameParent">
                {t(LanguageKey.Storeorder_DeliveryAmount)}
                <PriceFormater
                  pricetype={products[0].shortProduct.priceType}
                  fee={calculateDeliveryAmount()}
                  className={PriceFormaterClassName.PostPrice}
                />
              </div>

              <div className="frameParent">
                {t(LanguageKey.Storeorder_InsuranceAmount)}
                <PriceFormater
                  pricetype={products[0].shortProduct.priceType}
                  fee={0}
                  className={PriceFormaterClassName.PostPrice}
                />
              </div>

              {state.coupon && (
                <div className={styles.summarycontent}>
                  <div className="frameParent">
                    {t(LanguageKey.Storeorder_Coupon)}
                    <PriceFormater
                      pricetype={products[0].shortProduct.priceType}
                      fee={calculateCoupon()}
                      className={PriceFormaterClassName.PostPrice}
                    />
                  </div>
                  <button onClick={handleRemoveCoupon} className="stopButton">
                    {t(LanguageKey.Storeorder_RemoveCoupon)}
                  </button>
                </div>
              )}
              <div className={styles.boxheader}>
                {t(LanguageKey.total)}
                {!state.coupon && (
                  <PriceFormater
                    pricetype={products[0].shortProduct.priceType}
                    fee={calculateTotalPrice() + calculateDeliveryAmount() - calculateTotalDiscount()}
                    className={PriceFormaterClassName.PostPrice}
                  />
                )}
                {state.coupon && (
                  <PriceFormater
                    pricetype={products[0].shortProduct.priceType}
                    fee={
                      calculateTotalPrice() + calculateDeliveryAmount() - calculateTotalDiscount() - calculateCoupon()
                    }
                    className={PriceFormaterClassName.PostPrice}
                  />
                )}
              </div>
            </div>
          </div>
          <button
            style={{
              borderRadius: "var(--br25)",
              height: "40px",
            }}
            className={state.activeButton ? "disableButton" : "saveButton"}
            disabled={state.activeButton || state.loadingCreateOrder}
            onClick={handleCreateOrder}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCreateOrder();
              }
            }}
            aria-label={t(LanguageKey.Continue)}
            tabIndex={0}>
            {state.loadingCreateOrder ? (
              <div className={styles.loadingContainer}>
                <RingLoader />
              </div>
            ) : (
              t(LanguageKey.Continue)
            )}
          </button>
        </div>
      )}
    </>
  );
}
