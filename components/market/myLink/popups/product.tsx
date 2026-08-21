import DotLoaders from "brancy/components/design/loader/dotLoaders";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import router from "next/router";
import { useEffect, useState } from "react";
import { LanguageKey } from "brancy/i18n";
import { IProduct_ShortProduct } from "brancy/models/interfaces";
import styles from "./product.module.css";

const basePictureUrl = getClientMediaBaseUrl();
type ProductWithBioState = IProduct_ShortProduct & { showInBio?: boolean };

export default function ProductPopup({ removeMask }: { removeMask: () => void }) {
  const { t } = useTranslation();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithBioState[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [saving, setSaving] = useState(false);

  const { containerRef, isLoadingMore } = useInfiniteScroll<ProductWithBioState>({
    hasMore,
    fetchMore: async () => {
      const result = await clientFetchApi<string, ProductWithBioState[]>("/api/product/getProductList", {
        methodType: MethodType.get,
        session,
        queries: [
          { key: "nextMaxId", value: products[products.length - 1].productId },
          { key: "excludeNonProductInstance", value: "true" },
        ],
      });
      return result.succeeded ? result.value : [];
    },
    onDataFetched: (newData, hasMoreData) => {
      if (newData.length > 0) setProducts((prev) => [...prev, ...newData]);
      setHasMore(hasMoreData);
    },
    getItemId: (item) => item.productId,
    currentData: products,
    useContainerScroll: true,
  });

  async function getProducts() {
    try {
      const [productsResult, bioProductsResult] = await Promise.all([
        clientFetchApi<string, ProductWithBioState[]>("/api/product/getProductList", {
          methodType: MethodType.get,
          session,
          queries: [{ key: "excludeNonProductInstance", value: "true" }],
        }),
        clientFetchApi<string, IProduct_ShortProduct[]>("/api/product/getBioProductList", {
          methodType: MethodType.get,
          session,
        }),
      ]);
      if (!productsResult.succeeded) {
        notify(productsResult.info.responseType, NotifType.Error);
        return;
      }
      if (!bioProductsResult.succeeded) {
        notify(bioProductsResult.info.responseType, NotifType.Error);
      }
      setProducts(productsResult.value);
      setSelectedProductIds(
        bioProductsResult.succeeded ? bioProductsResult.value.slice(0, 10).map((product) => product.productId) : [],
      );
      setHasMore(productsResult.value.length > 0);
    } catch {
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }

  function toggleProduct(productId: string) {
    setSelectedProductIds((current) => {
      if (current.includes(productId)) return current.filter((id) => id !== productId);
      if (current.length >= 10) return current;
      return [...current, productId];
    });
  }

  async function saveProducts() {
    try {
      setSaving(true);
      const result = await clientFetchApi<string[], boolean>("/api/product/updateShowInBio", {
        methodType: MethodType.post,
        session,
        data: selectedProductIds,
      });
      setSaving(false);
      if (result.succeeded) removeMask();
      else notify(result.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  useEffect(() => {
    if (session) getProducts();
  }, [session]);

  return (
    <div className={styles.container}>
      {loading && <Loading />}
      {!loading && (
        <>
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.biolinkPropertiesProducts)}</div>
            <div className="explain">{t(LanguageKey.biolinkPropertiesProduct)}</div>
          </div>

          <div className={styles.selectionSummary} aria-live="polite">
            {selectedProductIds.length}/10
          </div>
          <div className={styles.thumbnailsContainer}>
            <div ref={containerRef} className={styles.productsScroll}>
              {products.map((product) => {
                const selectedIndex = selectedProductIds.indexOf(product.productId);
                const isSelected = selectedIndex !== -1;
                return (
                  <button
                    type="button"
                    onClick={() => toggleProduct(product.productId)}
                    key={product.productId}
                    className={`${styles.thumbnailMask} ${isSelected ? styles.selected : ""}`}
                    aria-pressed={isSelected}
                    aria-label={product.title ?? product.productId}>
                    <img
                      className={styles.thumbnailImage}
                      src={basePictureUrl + product.thumbnailMediaUrl}
                      alt={product.title ?? ""}
                    />
                    {isSelected && (
                      <span className={styles.selectedIndicator} aria-hidden="true">
                        {selectedIndex + 1}
                      </span>
                    )}
                  </button>
                );
              })}
              {isLoadingMore && <DotLoaders />}
            </div>
          </div>

          <div className="ButtonContainer">
            <button
              type="button"
              className={saving ? "disableButton" : "saveButton"}
              onClick={saveProducts}
              disabled={saving}>
              {t(LanguageKey.save)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
