import Link from "next/link";
import React, { ChangeEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import DragDrop from "saeed/components/design/dragDrop/dragDrop";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { AvailabilityStatus } from "saeed/models/store/enum";
import { IProduct_ShortProduct } from "saeed/models/store/IProduct";
import styles from "./productListDesktop.module.css";

interface ProductListDesktopProps {
  products: IProduct_ShortProduct[];
  productIds: number[];
  basePictureUrl: string | undefined;
  availableStatus: React.JSX.Element[];
  handleSelectProduct: (e: ChangeEvent<HTMLInputElement>, productId: number, productInId: number | null) => void;
  handleChangeActiveProduct: (productId: number, productInId: number | null, statusId: any) => Promise<void>;
  getStockClass: (stock: number, productInId: number | null) => string;
}

const ProductListDesktop: React.FC<ProductListDesktopProps> = ({
  products,
  productIds,
  basePictureUrl,
  availableStatus,
  handleSelectProduct,
  handleChangeActiveProduct,
  getStockClass,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {products.map((v) => (
        <Link key={v.productId} className={styles.product} href={`/store/products/productDetail?tempId=${v.tempId}`}>
          <div className={styles.productbody}>
            <div style={{ opacity: v.productInId ? 1 : 0.3 }} onClick={(e) => e.stopPropagation()}>
              <CheckBoxButton
                handleToggle={(e) => handleSelectProduct(e, v.productId, v.productInId)}
                value={productIds.includes(v.productId)}
                title={"Select product"}
              />
            </div>
            <img
              className={styles.productimage}
              style={{
                opacity: v.productInId ? 1 : 0.8,
                filter: v.productInId ? "none" : "grayscale(1)",
              }}
              alt="product image"
              src={`${basePictureUrl}${v.thumbnailMediaUrl}`}
            />
            <div className={styles.name}>
              <div className={styles.productname} style={{ display: "flex" }}>
                {v.title || "--"}
              </div>
              <div className="explain" style={{ display: "flex" }}>
                {v.productId}
              </div>
              <div className={styles.productidlite} style={{ filter: v.productInId ? "none" : "grayscale(1)" }}>
                <div className="explain">PID:</div>#{v.tempId}
              </div>
            </div>
          </div>
          <div className={styles.productid} style={{ filter: v.productInId ? "none" : "grayscale(1)" }}>
            #{v.tempId}
          </div>
          <div className={`${styles.stock} ${getStockClass(v.minStock, v.productInId)}`}>
            {v.productInId ? v.minStock : "--"}
          </div>
          <div className={styles.price}>
            {v.productInId && (
              <PriceFormater fee={v.minPrice} pricetype={v.priceType} className={PriceFormaterClassName.PostPrice} />
            )}
            {!v.productInId && "--"}
          </div>
          <div className={styles.lastmodified}>
            {v.productInId ? (
              <>
                <div className={styles.date}>
                  <span className={styles.day}>
                    {new DateObject({
                      date: v.lastUpdate * 1000,
                      calendar: initialzedTime().calendar,
                      locale: initialzedTime().locale,
                    }).format("YYYY")}
                  </span>
                  /
                  <span className={styles.day}>
                    {new DateObject({
                      date: v.lastUpdate * 1000,
                      calendar: initialzedTime().calendar,
                      locale: initialzedTime().locale,
                    }).format("MM")}
                  </span>
                  /
                  <span className={styles.day}>
                    {new DateObject({
                      date: v.lastUpdate * 1000,
                      calendar: initialzedTime().calendar,
                      locale: initialzedTime().locale,
                    }).format("DD")}
                  </span>
                </div>
                <div className={styles.date}>
                  <span className={styles.hour}>
                    {new DateObject({
                      date: v.lastUpdate * 1000,
                      calendar: initialzedTime().calendar,
                      locale: initialzedTime().locale,
                    }).format("hh")}
                  </span>
                  :
                  <span className={styles.hour}>
                    {new DateObject({
                      date: v.lastUpdate * 1000,
                      calendar: initialzedTime().calendar,
                      locale: initialzedTime().locale,
                    }).format("mm a")}
                  </span>
                </div>
              </>
            ) : (
              "--"
            )}
          </div>
          <div
            className={styles.Status}
            onClick={(e: MouseEvent) => {
              e.preventDefault();
            }}
            style={v.productInId ? {} : { opacity: 1 }}>
            {v.productInId ? (
              <>
                {v.availabilityStatus !== AvailabilityStatus.OutOfStock && (
                  <DragDrop
                    data={availableStatus}
                    item={v.availabilityStatus}
                    handleOptionSelect={(id) => handleChangeActiveProduct(v.productId, v.productInId, id)}
                  />
                )}
                {v.availabilityStatus === AvailabilityStatus.OutOfStock && (
                  <div className={styles.status_child}>
                    <div className={styles.status_outofstock}>
                      <img width="20" alt="Out Of Stock" title="ℹ️ Out Of Stock" src="/product_OutOfStock.svg" />
                      <span>{t(LanguageKey.product_OutOfStock)}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.status_child}>
                <div className={styles.status_draft}>
                  <img width="20" alt="draft sale" title="ℹ️ draft sale" src="/product_draft.svg" />
                  <span>{t(LanguageKey.product_draft)}</span>
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </>
  );
};

export default ProductListDesktop;
