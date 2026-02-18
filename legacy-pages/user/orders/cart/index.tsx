import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RingLoader from "saeed/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import OrderDetail from "saeed/components/userPanel/orders/popups/OrderDetail";
import { InstaInfoContext } from "saeed/context/instaInfoContext";
import findSystemLanguage from "saeed/helper/findSystemLanguage";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/api";
import { IOrderByStatus, IOrderDetail } from "saeed/models/store/orders";
import { IUserOrder } from "saeed/models/userPanel/orders";
import styles from "./cart.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
export default function Card() {
  const { value, setValue } = React.useContext(InstaInfoContext) ?? {};
  const { data: session } = useSession();
  const router = useRouter();
  const userRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState<number[]>([]);
  const [stores, setStores] = useState<IUserOrder>({
    nextMaxId: "",
    shopCards: [],
  });
  const [orders, setOrders] = useState<IOrderByStatus[]>([]);
  const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
  const handleScroll = () => {
    const container = userRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      //   fetchStorewData("");
    }
  };
  async function fetchShopProducts(instagramerId: number) {
    if (loadingProducts.includes(instagramerId)) return;

    setLoadingProducts((prev) => [...prev, instagramerId]);
    try {
      const res = await clientFetchApi<boolean, any[]>("/api/shop/GetInstagramerCard", { methodType: MethodType.get, session: session, data: null, queries: [
        { key: "instagramerId", value: instagramerId.toString() },
        { key: "language", value: findSystemLanguage().toString() },
      ], onUploadProgress: undefined });

      if (res.succeeded && res.value.length > 0) {
        setStores((prevStores) => ({
          ...prevStores,
          shopCards: prevStores.shopCards.map((shop) =>
            shop.instagramerId === instagramerId ? { ...shop, products: res.value } : shop
          ),
        }));
      }
    } catch (error) {
      console.error("Error fetching shop products:", error);
    } finally {
      setLoadingProducts((prev) => prev.filter((id) => id !== instagramerId));
    }
  }

  async function fetchData() {
    try {
      const res = await clientFetchApi<boolean, IUserOrder>("/api/shop/GetAllCard", { methodType: MethodType.get, session: session, data: null, queries: [
        { key: "nextMaxId", value: "" },
        { key: "language", value: findSystemLanguage().toString() },
      ], onUploadProgress: undefined });

      if (res.succeeded) {
        console.log("Cart data received:", res.value);
        console.log("First shop card:", res.value.shopCards[0]);
        setStores(res.value);

        // بارگذاری محصولات برای همه فروشگاه‌ها
        if (res.value.shopCards && res.value.shopCards.length > 0) {
          res.value.shopCards.forEach((shop) => {
            fetchShopProducts(shop.instagramerId);
          });
        }

        setLoading(false);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);
  return (
    session?.user.currentIndex === -1 && (
      <>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
        <div ref={userRef} onScroll={handleScroll} className={styles.all}>
          {loading && <Loading />}
          {!loading &&
            stores.shopCards.length > 0 &&
            stores.shopCards
              .filter((v) => v.cardCount > 0)
              .map((v) => (
                <Link
                  className={styles.cartfrompage}
                  href={`/user/orders/cart/${v.instagramerId}`}
                  key={v.instagramerId}>
                  <div className={styles.header}>
                    <div className="instagramprofile">
                      <img
                        className="instagramimage"
                        src={baseMediaUrl + v.profileUrl}
                        alt=" instagram profile picture"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/no-profile.svg";
                        }}
                      />
                      <div className="instagramprofiledetail">
                        {v.fullName && (
                          <div className="instagramusername" style={{ textAlign: "start" }}>
                            {v.fullName}
                          </div>
                        )}
                        <div className="instagramid" style={{ textAlign: "start" }}>
                          {v.username}
                        </div>
                      </div>
                    </div>
                    <div className={styles.summarydataparent}>
                      <div className={styles.summarydata}>
                        <span>{v.cardCount}</span>
                        {t(LanguageKey.Storeorder_ITEM)} {t(LanguageKey.incartcount)}
                      </div>
                      <div className={styles.price}>
                        <PriceFormater
                          pricetype={v.priceType}
                          fee={v.totalDiscountPrice}
                          className={PriceFormaterClassName.PostPrice}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.content}>
                    {v.products && v.products.length > 0 ? (
                      v.products.slice(0, 5).map((product, index) => (
                        <img
                          key={`${product.productId}-${index}`}
                          className={styles.products}
                          loading="lazy"
                          decoding="async"
                          title="ℹ️ product"
                          src={baseMediaUrl + product.shortProduct.thumbnailMediaUrl}
                          alt={`${product.shortProduct.title} image`}
                          onClick={() => {
                            router.push(
                              `/user/shop/${product.shortProduct.instagramerId}/product/${product.productId}`
                            );
                          }}
                        />
                      ))
                    ) : loadingProducts.includes(v.instagramerId) ? (
                      <div className={styles.products}>
                        <RingLoader />
                      </div>
                    ) : (
                      <div className={styles.products}>
                        {v.cardCount}
                        <br />
                        {t(LanguageKey.marketPropertiesProduct)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
          {!loading && stores.shopCards.filter((v) => v.cardCount > 0).length === 0 && orders.length === 0 && (
            <div className={styles.emptycart}>
              <svg xmlns="http://www.w3.org/2000/svg" width="150px" fill="var(--color-gray)" viewBox="0 0 36 36">
                <path d="M35.5 24.4a1.5 1.5 0 0 1 0 2.2L32.1 30l3.4 3.4a1.5 1.5 0 1 1-2 2.2L30 32l-3.5 3.5a1.5 1.5 0 0 1-2-2.2l3.4-3.4-3.5-3.4a1.5 1.5 0 0 1 2.1-2.2L30 28l3.4-3.5a1.5 1.5 0 0 1 2.1 0M23.8 4a1.5 1.5 0 0 0-2.6 1.4L24 11h3.4zm-8.2-.7a1.5 1.5 0 0 1 .8 2l-5.3 12A1.5 1.5 0 0 1 8.4 16l5.2-12a1.5 1.5 0 0 1 2-.8m-1.7 14.9q.1-1 1.1-1.1h6a1.1 1.1 0 0 1 0 2.2h-6a1 1 0 0 1-1.1-1.1" />
                <path
                  opacity=".4"
                  d="M31.5 11h-27l-1 .3A3 3 0 0 0 1.9 14l.2 1.3.2 1a2 2 0 0 0 1 1.2q1 .5 1 1.3l1 6.1.6 2.8A7 7 0 0 0 8 31.4a6 6 0 0 0 3.4 1.3l4.8.1h7.4l2.8-2.8-2.8-2.7a2.5 2.5 0 0 1 3.6-3.6l2.7 2.8.4-.4.2-1.3 1-6.1q.2-.8 1.1-1.3a2 2 0 0 0 1-1.3l.3-1L34 14q0-.7-.3-1.4a3 3 0 0 0-1.3-1.2z"
                />
              </svg>

              <span className="title">{t(LanguageKey.Storeproduct_yourcartisempty)}</span>
              <span className="explain">{t(LanguageKey.Storeproduct_noitemfounded)}</span>
              <button
                style={{ maxWidth: "300px" }}
                className="saveButton"
                onClick={() => {
                  router.push("/user/shop");
                }}>
                {t(LanguageKey.Startshoping)}
              </button>
            </div>
          )}
        </div>
        {orderDetail && <OrderDetail removeMask={() => setOrderDetail(null)} orderDetail={orderDetail} />}
      </>
    )
  );
}
