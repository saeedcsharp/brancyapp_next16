import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { ChangeEvent, useRef, useState } from "react";
import InputText from "brancy/components/design/inputText";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import styles from "./product.module.css";
import { IProducts } from "brancy/models/interfaces";
import PriceFormater, { PriceFormaterClassName } from "brancy/components/priceFormater";

const basePictureUrl = getClientMediaBaseUrl();
type ProductFilter = "bestSellers" | "bestDiscounts";
const Products = (props: { data: IProducts | null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState<ProductFilter>("bestSellers");
  const [isProductDragging, setIsProductDragging] = useState(false);
  const productContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ startX: 0, startScrollLeft: 0, moved: false });
  function handleSearchPeopleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    setSearchTerm(e.target.value);
  }
  function handleProductPointerDown(e: React.PointerEvent<HTMLDivElement>): void {
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
  }
  function handleProductPointerMove(e: React.PointerEvent<HTMLDivElement>): void {
    const container = productContainerRef.current;
    if (!container || !container.hasPointerCapture(e.pointerId)) return;

    const distance = e.clientX - dragStateRef.current.startX;
    if (Math.abs(distance) > 5) {
      dragStateRef.current.moved = true;
    }
    container.scrollLeft = dragStateRef.current.startScrollLeft - distance;
  }
  function handleProductPointerUp(e: React.PointerEvent<HTMLDivElement>): void {
    const container = productContainerRef.current;
    if (container?.hasPointerCapture(e.pointerId)) {
      container.releasePointerCapture(e.pointerId);
    }
    setIsProductDragging(false);
  }
  const products = (props.data?.productCards ?? [])
    .map((productCard) => productCard.shortProduct)
    .filter((product) => {
      const searchValue = searchTerm.trim().toLocaleLowerCase();
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
  return (
    <>
      {props.data && (
        <div id="product" className={styles.all}>
          <div className={styles.header}>
            <div className={styles.filterToggle}>
              <FlexibleToggleButton
                options={[
                  { id: 1, label: "Best Sellers" },
                  { id: 2, label: "Best Discounts" },
                ]}
                selectedValue={productFilter === "bestSellers" ? 1 : 2}
                onChange={(value) => setProductFilter(value === 1 ? "bestSellers" : "bestDiscounts")}
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
            <button
              type="button"
              className="saveButton"
              onClick={() => {
                setProductFilter("bestSellers");
                setSearchTerm("");
              }}>
              Show All Products
            </button>
          </div>

          <div
            ref={productContainerRef}
            className={`${styles.productContainer} ${isProductDragging ? styles.dragging : ""}`}
            onPointerDown={handleProductPointerDown}
            onPointerMove={handleProductPointerMove}
            onPointerUp={handleProductPointerUp}
            onPointerCancel={handleProductPointerUp}>
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
                    onError={(event) => {
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
