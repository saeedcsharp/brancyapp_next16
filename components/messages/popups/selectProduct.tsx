import DotLoaders from "brancy/components/design/loader/dotLoaders";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { LanguageKey } from "brancy/i18n";
import { IStoreOrderShortProduct } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import router from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./selectProduct.module.css";
const basePictureUrl = getClientMediaBaseUrl();
const SelectProduct = (props: {
  removeMask: () => void;
  saveSelectProduct: (product: IStoreOrderShortProduct) => void;
  backToAutoreply: () => void;
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<IStoreOrderShortProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IStoreOrderShortProduct | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const { containerRef, isLoadingMore } = useInfiniteScroll<IStoreOrderShortProduct>({
    hasMore,
    fetchMore: async () => {
      try {
        const result = await clientFetchApi<string, IStoreOrderShortProduct[]>("/api/product/getProductList", {
          methodType: MethodType.get,
          session: session,
          queries: [
            {
              key: "nextMaxId",
              value: products[products.length - 1].productId.toString(),
            },
            {
              key: "excludeProductInstance",
              value: "false",
            },
          ],
        });
        return result.succeeded ? result.value : [];
      } catch (error) {
        console.log("error from loader:", error);
        return [];
      }
    },
    onDataFetched: (newData, hasMoreData) => {
      if (newData.length > 0) {
        setProducts((prev) => [...prev, ...newData]);
      }
      setHasMore(hasMoreData);
    },
    getItemId: (item) => item.productId,
    currentData: products,
    useContainerScroll: true,
  });

  async function getProducts() {
    try {
      var res = await clientFetchApi<string, IStoreOrderShortProduct[]>("/api/product/getProductList", {
        methodType: MethodType.get,
        session: session,
        queries: [
          {
            key: "excludeProductInstance",
            value: "false",
          },
        ],
      });
      if (res.succeeded) {
        setProducts(res.value);
        if (res.value.length > 0) {
          setHasMore(true);
        }
        setLoading(false);
      } else {
        notify(res.info.responseType, NotifType.Error);
      }
    } catch (error) {
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          <div className="title">{t(LanguageKey.pageLottery_SelectaPost)}</div>
          <div className={styles.thumbnailsContainer}>
            <div
              ref={containerRef}
              style={{
                height: 500,
                overflow: "auto",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}>
              {products.map((v) => (
                <div onClick={() => setSelectedProduct(v)} key={v.productId} className={styles.thumbnailMask}>
                  <img
                    className={`${styles.thumbnailImage} ${
                      selectedProduct?.productId === v.productId ? styles.selectedPost : ""
                    }`}
                    src={basePictureUrl + v.thumbnailMediaUrl}
                  />
                </div>
              ))}
              {isLoadingMore && <DotLoaders />}
            </div>
          </div>
          <div className="ButtonContainer">
            <button onClick={props.backToAutoreply} className="cancelButton">
              {t(LanguageKey.cancel)}
            </button>
            <button
              onClick={() => props.saveSelectProduct(selectedProduct ?? ({} as IStoreOrderShortProduct))}
              className={selectedProduct ? "saveButton" : "disableButton"}
              disabled={!selectedProduct}>
              {t(LanguageKey.select)}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default SelectProduct;
