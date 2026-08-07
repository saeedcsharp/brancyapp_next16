import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";
import InputText from "brancy/components/design/inputText";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import styles from "./product.module.css";
import { IProducts } from "brancy/models/interfaces";
import PriceFormater, { PriceFormaterClassName } from "brancy/components/priceFormater";

const basePictureUrl = getClientMediaBaseUrl();
type ProductFilter = "bestSellers" | "bestDiscounts";
const Products = (props: { data: IProducts | null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState<ProductFilter>("bestSellers");
  const [isProductDragging, setIsProductDragging] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const productContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ startX: 0, startScrollLeft: 0, moved: false });
  const handleSearchPeopleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  }, []);

  const handleProductFilterChange = useCallback((value: number) => {
    setProductFilter(value === 1 ? "bestSellers" : "bestDiscounts");
  }, []);

  const handleResetFilters = useCallback(() => {
    setProductFilter("bestSellers");
    setSearchTerm("");
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
      })
      .sort((firstProduct, secondProduct) => {
        if (productFilter === "bestSellers") {
          return secondProduct.inCardCount - firstProduct.inCardCount;
        }
        if (productFilter === "bestDiscounts") {
          const firstDiscount =
            firstProduct.minDiscountPrice !== null && firstProduct.minPrice > 0
              ? (firstProduct.minPrice - firstProduct.minDiscountPrice) / firstProduct.minPrice
              : 0;
          const secondDiscount =
            secondProduct.minDiscountPrice !== null && secondProduct.minPrice > 0
              ? (secondProduct.minPrice - secondProduct.minDiscountPrice) / secondProduct.minPrice
              : 0;
          return secondDiscount - firstDiscount;
        }
        return 0;
      });
  }, [deferredSearchTerm, productFilter, props.data?.productCards]);

  return (
    <>
      {props.data && (
        <div id="product" className={styles.all}>
          <div className={styles.header}>
            <div className={styles.filterToggle}>
              <ToggleButton
                options={[
                  { id: 1, label: "Best Sellers" },
                  { id: 2, label: "Best Discounts" },
                ]}
                selectedValue={productFilter === "bestSellers" ? 1 : 2}
                onChange={handleProductFilterChange}
              />
            </div>
            <div className={styles.headerSearch}>
              <InputText
                style={{ width: "100%" }}
                className="textinputbox"
                handleInputChange={handleSearchPeopleInputChange}
                placeHolder="Search product or PID"
                value={searchTerm}
                name="product-search"
                type="search"
                autoComplete="off"
              />
            </div>
            <button type="button" className="saveButton" onClick={handleResetFilters}>
              Show All Products
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
                    <div className={styles.price}>
                      <PriceFormater
                        pricetype={product.priceType}
                        fee={productPrice}
                        className={PriceFormaterClassName.PostPriceBlue}
                      />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
