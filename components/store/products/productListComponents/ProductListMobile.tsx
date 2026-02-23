import Link from "next/link";
import React, { ChangeEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CheckBoxButton from "../../../design/checkBoxButton";
import DragDrop from "../../../design/dragDrop/dragDrop";
import PriceFormater, { PriceFormaterClassName } from "../../../priceFormater";
import initialzedTime from "../../../../helper/manageTimer";
import { LanguageKey } from "../../../../i18n";
import { AvailabilityStatus } from "../../../../models/store/enum";
import { IProduct_ShortProduct } from "../../../../models/store/IProduct";
import styles from "./productListMobile.module.css";

interface ProductListMobileProps {
  products: IProduct_ShortProduct[];
  productIds: number[];
  basePictureUrl: string | undefined;
  availableStatus: React.JSX.Element[];
  handleSelectProduct: (e: ChangeEvent<HTMLInputElement>, productId: number, productInId: number | null) => void;
  handleChangeActiveProduct: (productId: number, productInId: number | null, statusId: any) => Promise<void>;
  getStockClass: (stock: number, productInId: number | null) => string;
}

const ProductListMobile: React.FC<ProductListMobileProps> = ({
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
        <Link
          key={v.productId}
          className={styles.productmobile}
          href={`/store/products/productDetail?tempId=${v.tempId}`}>
          <div className={styles.productbodymobile}>
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
            <div className={styles.namemobile}>
              <div className={styles.productname}>{v.title || "--"}</div>
              <div className={styles.productpidstock}>
                <div className={styles.productidlitemobile} style={{ filter: v.productInId ? "none" : "grayscale(1)" }}>
                  <div className="explain">PID:</div>#{v.tempId}
                </div>
                <div className={`${styles.Stockparent} translate`}>
                  <img width="20px" title="ℹ️ search products" alt="search products" src="/stock.svg" />

                  <div className={`${styles.stockmobile} ${getStockClass(v.minStock, v.productInId)}`}>
                    {v.productInId ? v.minStock : "--"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.productbottommobile} translate`}>
            <div className={styles.productbottomleftmobile}>
              <div className={styles.pricemobile}>
                {v.productInId && (
                  <PriceFormater
                    fee={v.minPrice}
                    pricetype={v.priceType}
                    className={PriceFormaterClassName.PostPrice}
                  />
                )}
                {!v.productInId && "--"}
              </div>
              <div className={styles.lastmodifiedmobile}>
                {v.productInId ? (
                  <>
                    <div className={styles.datemobile}>
                      <span className={styles.daymobile}>
                        {new DateObject({
                          date: v.lastUpdate * 1000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY")}
                      </span>
                      /
                      <span className={styles.daymobile}>
                        {new DateObject({
                          date: v.lastUpdate * 1000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("MM")}
                      </span>
                      /
                      <span className={styles.daymobile}>
                        {new DateObject({
                          date: v.lastUpdate * 1000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("DD")}
                      </span>
                      -
                      <span className={styles.hourmobile}>
                        {new DateObject({
                          date: v.lastUpdate * 1000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("hh")}
                      </span>
                      :
                      <span className={styles.hourmobile}>
                        {new DateObject({
                          date: v.lastUpdate * 1000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("mm A")}
                      </span>
                    </div>
                  </>
                ) : (
                  "--"
                )}
              </div>
            </div>
            <div className={styles.productbottomrightmobile}>
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
                    <img alt="draft sale" title="ℹ️ draft sale" src="/product_draft.svg" />
                    <div className={styles.status_draft}>{t(LanguageKey.product_draft)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
};

export default ProductListMobile;
