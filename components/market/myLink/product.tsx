import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { type KeyboardEvent, type PointerEvent, useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
import styles from "./product.module.css";
import { IProducts } from "brancy/models/interfaces";
import PriceFormater, { PriceFormaterClassName } from "brancy/components/priceFormater";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { t } from "i18next";
const basePictureUrl = getClientMediaBaseUrl();
const promotionCode = "BRANCY20";
const Products = (props: { data: IProducts | null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductDragging, setIsProductDragging] = useState(false);
  const [isPromotionCodeCopied, setIsPromotionCodeCopied] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const productContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ startX: 0, startScrollLeft: 0, moved: false });
  const handleResetSearch = useCallback(() => {
    setSearchTerm("");
  }, []);
  const handleCopyPromotionCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promotionCode);
      setIsPromotionCodeCopied(true);
      window.setTimeout(() => setIsPromotionCodeCopied(false), 1800);
    } catch {
      setIsPromotionCodeCopied(false);
    }
  }, []);
  const handleProductPointerDown = useCallback((e: PointerEvent<HTMLDivElement>): void => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const container = productContainerRef.current;
    if (!container) return;
    dragStateRef.current = {
      startX: e.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false,
    };
    container.setPointerCapture(e.pointerId);
    setIsProductDragging(true);
  }, []);
  const handleProductPointerMove = useCallback((e: PointerEvent<HTMLDivElement>): void => {
    const container = productContainerRef.current;
    if (!container || !container.hasPointerCapture(e.pointerId)) return;
    const distance = e.clientX - dragStateRef.current.startX;
    if (Math.abs(distance) > 5) {
      dragStateRef.current.moved = true;
    }
    container.scrollLeft = dragStateRef.current.startScrollLeft - distance;
  }, []);
  const handleProductPointerUp = useCallback((e: PointerEvent<HTMLDivElement>): void => {
    const container = productContainerRef.current;
    if (container?.hasPointerCapture(e.pointerId)) {
      container.releasePointerCapture(e.pointerId);
    }
    setIsProductDragging((isDragging) => (isDragging ? false : isDragging));
  }, []);
  const handleProductContainerKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const container = productContainerRef.current;
    if (!container) return;
    const scrollAmount = Math.max(container.clientWidth * 0.8, 200);
    const direction = getComputedStyle(container).direction === "rtl" ? -1 : 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const offset = event.key === "ArrowRight" ? scrollAmount * direction : -scrollAmount * direction;
      container.scrollBy({ left: offset, behavior: "smooth" });
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      container.scrollTo({ left: event.key === "Home" ? 0 : container.scrollWidth, behavior: "smooth" });
    }
  }, []);
  const products = useMemo(() => {
    const searchValue = deferredSearchTerm.trim().toLocaleLowerCase();
    return (props.data?.productCards ?? [])
      .map((productCard) => productCard.shortProduct)
      .filter((product) => {
        if (!searchValue) return true;
        return (
          product.title?.toLocaleLowerCase().includes(searchValue) ||
          product.productId.toLocaleLowerCase().includes(searchValue)
        );
      });
  }, [deferredSearchTerm, props.data?.productCards]);
  return (
    <>
      {props.data && (
        <>
          <div id="product" className={styles.all}>
            <div className={styles.header}>
              <div className={styles.couponPromotion}>
                <img
                  className={styles.promotionimg}
                  src="/marketlink/market-promotion.webp"
                  loading="lazy"
                  decoding="async"
                />
                <div className={styles.couponDetails}>
                  <div className={styles.couponCountdown}>
                    <span>
                      <strong>02</strong>
                    </span>
                    <small>:</small>
                    <span>
                      <strong>08</strong>
                    </span>
                    <small>:</small>
                    <span>
                      <strong>24</strong>
                    </span>
                    <small>:</small>
                    <span>
                      <strong>36</strong>
                    </span>
                  </div>

                  <span className={styles.couponCode} onClick={handleCopyPromotionCode}>
                    {isPromotionCodeCopied ? t(LanguageKey.successfulCopy) : promotionCode}
                    <svg fill="none" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        opacity=".4"
                        d="M15.17 5.47A2.8 2.8 0 0 0 12.27 3h-5.2c-1.8 0-2.94 1.29-2.94 3.1v6.7c0 1.65.94 2.87 2.5 3.06"
                        stroke="var(--color-gray)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        clipRule="evenodd"
                        d="M17.34 8.11h-5.2c-1.8 0-2.94 1.28-2.94 3.1v6.7c0 1.8 1.13 3.09 2.95 3.09h5.2c1.81 0 2.94-1.28 2.94-3.1v-6.7c0-1.8-1.13-3.09-2.95-3.09"
                        stroke="var(--color-gray)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <button type="button" className="saveButton" onClick={handleResetSearch}>
                {t(LanguageKey.messagesetting_ViewStoreandproducts)}
              </button>
            </div>
            <div
              ref={productContainerRef}
              className={`${styles.productContainer} ${isProductDragging ? styles.dragging : ""}`}
              tabIndex={0}
              role="region"
              aria-label="Product carousel"
              onKeyDown={handleProductContainerKeyDown}
              onPointerDown={handleProductPointerDown}
              onPointerMove={handleProductPointerMove}
              onPointerUp={handleProductPointerUp}
              onPointerCancel={handleProductPointerUp}
              onLostPointerCapture={handleProductPointerUp}>
              {products.map((product) => {
                const hasDiscount = product.minDiscountPrice !== null && product.minDiscountPrice < product.minPrice;
                const discountPercent =
                  hasDiscount && product.minPrice > 0
                    ? Math.round(((product.minPrice - product.minDiscountPrice!) / product.minPrice) * 100)
                    : 0;
                const productPrice = hasDiscount ? product.minDiscountPrice! : product.minPrice;
                return (
                  <a
                    key={product.productId}
                    className={styles.productitem}
                    href={product.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      if (dragStateRef.current.moved) {
                        e.preventDefault();
                        dragStateRef.current.moved = false;
                      }
                    }}>
                    <img
                      loading="lazy"
                      decoding="async"
                      className={styles.productimage}
                      alt={product.title ?? "Product"}
                      src={`${basePictureUrl}${product.thumbnailMediaUrl}`}
                      width={200}
                      height={200}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/product_draft-gray.svg";
                      }}
                    />
                    <div className={styles.productname} title={product.title ?? undefined}>
                      {product.title || `Product ${product.productId}`}
                    </div>
                    <div className={styles.pricesection}>
                      {hasDiscount && (
                        <div className={styles.price}>
                          <PriceFormater
                            pricetype={product.priceType}
                            fee={product.minPrice}
                            className={PriceFormaterClassName.PostPriceRed}
                          />
                          <div className={styles.discountprice}>{discountPercent}%</div>
                        </div>
                      )}

                      <PriceFormater
                        pricetype={product.priceType}
                        fee={productPrice}
                        className={PriceFormaterClassName.PostPrice}
                      />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Products;
