import { getClientMediaBaseUrl, resolvePublicDomain } from "brancy/helper/apiBaseUrl";
import { type KeyboardEvent, type PointerEvent, useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
import styles from "./product.module.css";
import { IProducts } from "brancy/models/interfaces";
import PriceFormater, { PriceFormaterClassName } from "brancy/components/priceFormater";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { t } from "i18next";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
const basePictureUrl = getClientMediaBaseUrl();
const couponDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const Products = (props: { data: IProducts | null; username: string }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductDragging, setIsProductDragging] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState<number | null>(null);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const productContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ startX: 0, startScrollLeft: 0, moved: false });
  const handleResetSearch = useCallback(() => {
    setSearchTerm("");
  }, []);
  const handleViewStoreProducts = useCallback(() => {
    const domain = resolvePublicDomain(process.env.NEXT_PUBLIC_SHORT_LINK, window.location.hostname);
    window.location.assign(`https://${domain}/${encodeURIComponent(props.username)}/product`);
  }, [props.username]);
  const handleCopyCouponCode = useCallback(async (couponId: number, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCouponId(couponId);
      window.setTimeout(() => setCopiedCouponId((current) => (current === couponId ? null : current)), 1800);
    } catch {
      setCopiedCouponId(null);
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
  const coupons = props.data?.productCoupons ?? [];
  const selectedCoupon = coupons.find((coupon) => coupon.couponId === selectedCouponId) ?? coupons[0];
  const selectedCouponIndex = selectedCoupon
    ? coupons.findIndex((coupon) => coupon.couponId === selectedCoupon.couponId)
    : 0;
  const couponOptions = coupons.map((coupon) => (
    <div id={String(coupon.couponId)} key={coupon.couponId} className={styles.couponOption}>
      <span className={styles.couponCode}>{coupon.code}</span>
      <strong className={styles.couponDiscount}>{coupon.discount}%</strong>
      <span className={styles.couponMeta}>
        {coupon.useCount}/{coupon.maxCount} · {couponDateFormatter.format(coupon.expireTime)}
      </span>
    </div>
  ));
  return (
    <>
      {props.data && (
        <>
          <div id="product" className={styles.all}>
            <div className={styles.header}>
              {coupons.length > 0 && (
                <div className={styles.couponSelector} aria-label={t(LanguageKey.storestatistics_couponTitle)}>
                  <DragDrop
                    data={couponOptions}
                    item={selectedCouponIndex}
                    isRefresh={selectedCouponId !== null}
                    handleOptionSelect={(couponId) => setSelectedCouponId(Number(couponId))}
                  />
                  {selectedCoupon && (
                    <button
                      type="button"
                      className={styles.copyCouponButton}
                      onClick={() => handleCopyCouponCode(selectedCoupon.couponId, selectedCoupon.code)}
                      aria-label={`${t(LanguageKey.Storeorder_Coupon)} ${selectedCoupon.code}`}>
                      {copiedCouponId === selectedCoupon.couponId ? (
                        t(LanguageKey.successfulCopy)
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="8" y="8" width="11" height="12" rx="2" />
                          <path d="M16 8V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              )}
              <button type="button" className="saveButton" onClick={handleViewStoreProducts}>
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
