import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { FC, useCallback, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { internalNotify, InternalResponseType, NotifType } from "brancy/components/notifications/notificationBox";
import PriceFormater, { PriceFormaterClassName } from "brancy/components/priceFormater";
import initialzedTime from "brancy/helper/manageTimer";
import { specifyLogistic } from "brancy/helper/specifyLogistic";
import { LanguageKey } from "brancy/i18n";
import styles from "./OrderDetail-Content.module.css";
import { IOrderFullProduct } from "brancy/models/interfaces";
import { AvailabilityStatus, ColorStr } from "brancy/models/enums";
const basePictureUrl = getClientMediaBaseUrl();
const toggleReducer = (state: boolean) => !state;

interface OrderDetailContentProps {
  ordersProductInfo: IOrderFullProduct;
}

const OrderDetailContent: FC<OrderDetailContentProps> = ({ ordersProductInfo }) => {
  const { t } = useTranslation();
  const [isExpanded, dispatchToggle] = useReducer(toggleReducer, false);
  const [isExpandedproduct, setIsExpandedProduct] = useState(false);

  const handleToggleExpansion = useCallback(() => {
    dispatchToggle();
  }, []);

  const handleToggleProductExpansion = useCallback(() => {
    setIsExpandedProduct((prev) => !prev);
  }, []);

  const getAvailabilityLabel = (status: AvailabilityStatus) => {
    const availabilityLabels = {
      [AvailabilityStatus.Available]: LanguageKey.product_Available,
      [AvailabilityStatus.Restocking]: LanguageKey.product_supplying,
      [AvailabilityStatus.OutOfStock]: LanguageKey.product_OutOfStock,
      [AvailabilityStatus.Stopped]: LanguageKey.product_Stoppedsale,
    };

    return t(availabilityLabels[status]);
  };

  const getProductOrderTotal = (product: IOrderFullProduct["orderItems"][number]) =>
    product.items.reduce((total, item) => {
      const subProduct = product.completeProduct.subProducts.find((candidate) => candidate.id == item.subProductId);

      if (!subProduct) return total;

      const discount = subProduct.disCount?.isActive ? Math.min(Math.max(subProduct.disCount.value, 0), 100) : 0;
      const discountedPrice = subProduct.price * (1 - discount / 100);

      return total + discountedPrice * item.count;
    }, 0);

  if (!ordersProductInfo) {
    return null;
  }

  return (
    <div className={styles.content}>
      <div className="headerandinput">
        <div className="headerparent">
          <div className="headertext" style={{ fontSize: "var(--font-14)" }}>
            {ordersProductInfo.orderItems.length === 1 ? (
              t(LanguageKey.Storeorder_singleorder)
            ) : (
              <>
                {t(LanguageKey.Storeorder_orderlist)}
                <strong> ( {ordersProductInfo.orderItems.length} )</strong>
              </>
            )}
          </div>
          <div className={styles.loadmore} onClick={handleToggleProductExpansion}>
            <svg
              className={styles.loadmoreIcon}
              style={{
                transform: `rotate(${isExpandedproduct ? "90deg" : "-90deg"})`,
              }}
              width="21"
              height="21"
              viewBox="0 0 22 22"
              fill="none">
              <path stroke="var(--color-dark-blue60)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" strokeWidth="1.5" />
              <path
                fill="var(--color-dark-blue)"
                d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
              />
            </svg>
            {isExpandedproduct ? <span>{t(LanguageKey.close)}</span> : <span>{t(LanguageKey.Showmore)}</span>}
          </div>
        </div>

        <div
          className={
            styles.productinfo + " " + (isExpandedproduct ? styles.productinfoOpen : styles.productinfoClosed)
          }>
          {ordersProductInfo.orderItems.map((product, index) => (
            <div key={`${product.completeProduct.shortProduct.productId}-${index}`} className={styles.productlist}>
              <div className={styles.productcontent}>
                <div className={styles.productcounter}>
                  <span>{("0" + (index + 1)).slice(-2)}</span>
                </div>
                <div className={styles.productdetails}>
                  <div className={styles.productContainer}>
                    <img
                      loading="lazy"
                      decoding="async"
                      className={styles.productimage}
                      title="ℹ️ Profile image"
                      alt="profile image"
                      src={basePictureUrl + product.completeProduct.shortProduct.thumbnailMediaUrl}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className="instagramprofiledetail" style={{ maxWidth: "100%" }}>
                      <div className="instagramusername">{product.completeProduct.shortProduct.title}</div>
                      <PriceFormater
                        pricetype={product.completeProduct.shortProduct.priceType}
                        fee={getProductOrderTotal(product)}
                        className={PriceFormaterClassName.PostPrice}
                      />
                      <div className={styles.quantitytag}>
                        <span>{t(LanguageKey.Storeorder_quantityorder)}</span>:{" "}
                        {product.items.reduce((total, item) => total + item.count, 0)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.subproductlist}>
                    {product.completeProduct.subProducts.map((subProduct) => {
                      const orderLine = product.items.find((item) => item.subProductId == subProduct.id);

                      return (
                        <div className={styles.subproduct} key={subProduct.id}>
                          <div className={styles.subproductHeader}>
                            <PriceFormater
                              pricetype={subProduct.priceType}
                              fee={subProduct.price}
                              className={PriceFormaterClassName.PostPrice}
                            />
                            <div className={styles.productquantity}>
                              <span>{t(LanguageKey.Storeorder_quantityorder)}</span>
                              <strong>× {orderLine?.count ?? 0}</strong>
                            </div>
                          </div>
                          <div className={styles.producttaglist}>
                            {subProduct.variations.map((variation) => (
                              <div className={styles.producttag} key={variation.id}>
                                <span>{variation.titleVariation.langValue}:</span>
                                <strong>{variation.variation.langValue}</strong>
                              </div>
                            ))}
                            {subProduct.colorId != null && (
                              <div className={styles.producttag}>
                                <span>{t(LanguageKey.color)}:</span>
                                <div
                                  className={styles.tagcolor}
                                  style={{ backgroundColor: ColorStr[subProduct.colorId] }}
                                />
                              </div>
                            )}
                            {product.completeProduct.productInstance.customVariation && subProduct.customVariation && (
                              <div className={styles.producttag}>
                                <span>{product.completeProduct.productInstance.customVariation}:</span>
                                <strong>{subProduct.customVariation}</strong>
                              </div>
                            )}
                            <div className={styles.producttag}>
                              <span>{t(LanguageKey.Storeproduct_stock)}:</span>
                              <strong>{subProduct.stock}</strong>
                            </div>
                            <div className={styles.producttag}>
                              <span>{t(LanguageKey.Product_Availablity)}:</span>
                              <strong>
                                {getAvailabilityLabel(product.completeProduct.shortProduct.availabilityStatus)}
                              </strong>
                            </div>
                            {subProduct.disCount?.isActive && subProduct.disCount.value > 0 && (
                              <div className={styles.discounttag}>
                                <span>{t(LanguageKey.product_Discount)}:</span>
                                <strong>{subProduct.disCount.value}%</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.productmetagrid}>
                    {product.completeProduct.productInstance.categoryLangValue && (
                      <div className={styles.productmeta}>
                        <span>{t(LanguageKey.product_MainCategory)}</span>
                        <strong>{product.completeProduct.productInstance.categoryLangValue}</strong>
                      </div>
                    )}
                    {product.completeProduct.productInstance.subCategoryLangValue && (
                      <div className={styles.productmeta}>
                        <span>{t(LanguageKey.product_Subcategory)}</span>
                        <strong>{product.completeProduct.productInstance.subCategoryLangValue}</strong>
                      </div>
                    )}
                    {product.completeProduct.productInstance.brandLangValue && (
                      <div className={styles.productmeta}>
                        <span>{t(LanguageKey.product_Brand)}</span>
                        <strong>{product.completeProduct.productInstance.brandLangValue}</strong>
                      </div>
                    )}
                    {product.completeProduct.secondaryInfo.weight != null && (
                      <div className={styles.productmeta}>
                        <span>{t(LanguageKey.Storeproduct_weight)}</span>
                        <strong>
                          {product.completeProduct.secondaryInfo.weight} {t(LanguageKey.Storeproduct_gram)}
                        </strong>
                      </div>
                    )}
                    {product.completeProduct.secondaryInfo.readyForShipDays > 0 && (
                      <div className={styles.productmeta}>
                        <span>{t(LanguageKey.Product_preperingforship)}</span>
                        <strong>{product.completeProduct.secondaryInfo.readyForShipDays}</strong>
                      </div>
                    )}
                    {product.completeProduct.secondaryInfo.isBreakable && (
                      <div className={styles.productmeta}>
                        <span>{t(LanguageKey.Product_Breakable)}</span>
                        <strong>{t(LanguageKey.Yes)}</strong>
                      </div>
                    )}
                    {product.completeProduct.secondaryInfo.isLiquid && (
                      <div className={styles.productmeta}>
                        <span>{t(LanguageKey.Product_Luquid)}</span>
                        <strong>{t(LanguageKey.Yes)}</strong>
                      </div>
                    )}
                  </div>
                  {product.completeProduct.specifications.some((item) => item.customSpecification) && (
                    <div className={styles.specificationsection}>
                      <span className={styles.sectiontitle}>{t(LanguageKey.product_Specifications)}</span>
                      <div className={styles.producttaglist}>
                        {product.completeProduct.specifications.map(
                          (specification) =>
                            specification.customSpecification && (
                              <div className={styles.producttag} key={specification.id}>
                                <span>{specification.customSpecification.key}:</span>
                                <strong>{specification.customSpecification.value}</strong>
                              </div>
                            ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* userInfo */}
      {ordersProductInfo.order.userInfo && (
        <div className="headerandinput">
          <div className="headerparent">
            <div className="headertext" style={{ fontSize: "var(--font-14)" }}>
              {t(LanguageKey.Storeorder_DETAILS)}
            </div>
            <div className={styles.loadmore} onClick={handleToggleExpansion}>
              <svg
                className={styles.loadmoreIcon}
                style={{
                  transform: `rotate(${isExpanded ? "90deg" : "-90deg"})`,
                }}
                width="21"
                height="21"
                viewBox="0 0 22 22"
                fill="none">
                <path
                  stroke="var(--color-dark-blue60)"
                  d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                  strokeWidth="1.5"
                />
                <path
                  fill="var(--color-dark-blue)"
                  d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                />
              </svg>
              {isExpanded ? <span>{t(LanguageKey.close)}</span> : <span>{t(LanguageKey.Showmore)}</span>}
            </div>
          </div>
          <div className={styles.buyerparent}>
            <>
              <div className={styles.buyerinfo}>
                <div className={`headerparent translate`}>
                  <div className={`instagramprofile translate`}>
                    <img
                      loading="lazy"
                      decoding="async"
                      className="instagramimage"
                      title="ℹ️ Profile image"
                      alt="profile image"
                      src={ordersProductInfo.order.userInfo?.profileUrl || "/no-profile.svg"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className="instagramprofiledetail" style={{ maxWidth: "100%" }}>
                      <div className="instagramusername">
                        {ordersProductInfo.order.userInfo?.fullName || ordersProductInfo.order.userInfo?.phoneNumber}
                      </div>
                      <div className="instagramid">{"@" + (ordersProductInfo.order.userInfo?.username || "")}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.quickinfoparent} style={{ display: isExpanded ? "none" : "flex" }}>
                  <div className={styles.quickinfo}>
                    {ordersProductInfo.order.city}
                    <svg
                      height="14"
                      fill="none"
                      stroke="var(--text-h2)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 14 16">
                      <path d="M1.17 5.54c1.37-6.06 10.3-6.05 11.66.01.8 3.56-1.4 6.57-3.32 8.43a3.6 3.6 0 0 1-5.02 0C2.57 12.12.37 9.1 1.17 5.54Z M7 9a2.18 2.18 0 0 0 0-4.37c-1.2 0-2.17.98-2.17 2.19C4.83 8.02 5.8 9 7 9Z" />
                    </svg>
                  </div>
                  <div className={styles.quickinfo}>
                    {ordersProductInfo.order.totalPrice}
                    <svg
                      height="16"
                      fill="none"
                      stroke="var(--text-h2)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16">
                      <path
                        d="M6 9.5c0 .83.6 1.5 1.33 1.5h1.5c.65 0 1.17-.59 1.17-1.3 0-.8-.32-1.07-.8-1.25l-2.4-.9C6.31 7.37 6 7.09 6 6.3 6 5.59 6.52 5 7.16 5h1.5C9.42 5 10 5.67 10 6.5M8 4v8M2.4 3.8a7 7 0 1 0 2.78-2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div
                className={
                  styles.buyerinfomore + " " + (isExpanded ? styles.buyerinfomoreOpen : styles.buyerinfomoreClosed)
                }>
                <div className={styles.buyerinfomoreinfo}>
                  <table className={styles.infoTable}>
                    <tbody>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_ORDERID)}</th>
                        <td className={styles.tablecontent}>
                          <strong>{ordersProductInfo.order.id}</strong>
                        </td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_Destination)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.state}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_DELIVERY)}</th>
                        <td className={styles.tablecontent}>{specifyLogistic(ordersProductInfo.order.logesticId)}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.totalprice)}</th>
                        <td className={styles.tablecontent}>
                          {
                            <PriceFormater
                              pricetype={ordersProductInfo.order.priceType}
                              fee={ordersProductInfo.order.totalPrice}
                              className={PriceFormaterClassName.PostPrice}
                            />
                          }
                        </td>
                      </tr>

                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.note)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.note || ""}</td>
                      </tr>

                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_OrderDATE)}</th>
                        <td className={styles.tablecontent}>
                          {new DateObject({
                            date: ordersProductInfo.order.createdTime * 1000,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("YYYY/MM/DD - hh:mm:ss A")}
                        </td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.navbar_PaymentNumber)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.invoice.id}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.userpanel_MobileNumber)}</th>
                        <td className={styles.tablecontent}>
                          <div className={styles.mobileparent}>
                            {"+" + (ordersProductInfo.order.userInfo?.phoneNumber || "")}
                            <img
                              onClick={() => {
                                const tempEl = document.createElement("textarea");
                                tempEl.value = ordersProductInfo.order.userInfo?.phoneNumber || "";
                                document.body.appendChild(tempEl);
                                tempEl.select();
                                document.execCommand("copy");
                                document.body.removeChild(tempEl);
                                internalNotify(
                                  InternalResponseType.Success,
                                  NotifType.Success,
                                  "Your data is copied successfully",
                                );
                              }}
                              style={{
                                cursor: "pointer",
                                width: "15px",
                                height: "15px",
                              }}
                              title="ℹ️ copy phone number"
                              src="/copy.svg"
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.userpanel_ZipCode)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.postalCode}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.userpanel_ZipCode)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.postalCode}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_receiver)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.receiver}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Address)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.address}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          </div>
        </div>
      )}
      {/* shortShop */}
      {ordersProductInfo.order.shortShop && (
        <div className="headerandinput">
          <div className="headerparent">
            <div className="headertext" style={{ fontSize: "var(--font-14)" }}>
              {t(LanguageKey.Storeorder_DETAILS)}
            </div>
            <div className={styles.loadmore} onClick={handleToggleExpansion}>
              <svg
                className={styles.loadmoreIcon}
                style={{
                  transform: `rotate(${isExpanded ? "90deg" : "-90deg"})`,
                }}
                width="21"
                height="21"
                viewBox="0 0 22 22"
                fill="none">
                <path
                  stroke="var(--color-dark-blue60)"
                  d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                  strokeWidth="1.5"
                />
                <path
                  fill="var(--color-dark-blue)"
                  d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                />
              </svg>
              {isExpanded ? <span>{t(LanguageKey.close)}</span> : <span>{t(LanguageKey.Showmore)}</span>}
            </div>
          </div>
          <div className={styles.buyerparent}>
            <>
              <div className={styles.buyerinfo}>
                <div className={`headerparent translate`}>
                  <div className={`instagramprofile translate`}>
                    <img
                      loading="lazy"
                      decoding="async"
                      className="instagramimage"
                      title="ℹ️ Profile image"
                      alt="profile image"
                      src={basePictureUrl + ordersProductInfo.order.shortShop.profileUrl}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className="instagramprofiledetail" style={{ maxWidth: "100%" }}>
                      <div className="instagramusername">{ordersProductInfo.order.shortShop.fullName || ""}</div>
                      <div className="instagramid">{"@" + (ordersProductInfo.order.shortShop.username || "")}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.quickinfoparent} style={{ display: isExpanded ? "none" : "flex" }}>
                  <div className={styles.quickinfo}>
                    {ordersProductInfo.order.city}
                    <svg
                      height="14"
                      fill="none"
                      stroke="var(--text-h2)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 14 16">
                      <path d="M1.17 5.54c1.37-6.06 10.3-6.05 11.66.01.8 3.56-1.4 6.57-3.32 8.43a3.6 3.6 0 0 1-5.02 0C2.57 12.12.37 9.1 1.17 5.54Z M7 9a2.18 2.18 0 0 0 0-4.37c-1.2 0-2.17.98-2.17 2.19C4.83 8.02 5.8 9 7 9Z" />
                    </svg>
                  </div>
                  <div className={styles.quickinfo}>
                    {ordersProductInfo.order.totalPrice}
                    <svg
                      height="16"
                      fill="none"
                      stroke="var(--text-h2)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16">
                      <path
                        d="M6 9.5c0 .83.6 1.5 1.33 1.5h1.5c.65 0 1.17-.59 1.17-1.3 0-.8-.32-1.07-.8-1.25l-2.4-.9C6.31 7.37 6 7.09 6 6.3 6 5.59 6.52 5 7.16 5h1.5C9.42 5 10 5.67 10 6.5M8 4v8M2.4 3.8a7 7 0 1 0 2.78-2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div
                className={
                  styles.buyerinfomore + " " + (isExpanded ? styles.buyerinfomoreOpen : styles.buyerinfomoreClosed)
                }>
                <div className={styles.buyerinfomoreinfo}>
                  <table className={styles.infoTable}>
                    <tbody>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_ORDERID)}</th>
                        <td className={styles.tablecontent}>
                          <strong>{ordersProductInfo.order.id}</strong>
                        </td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_Destination)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.state}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_DELIVERY)}</th>
                        <td className={styles.tablecontent}>{specifyLogistic(ordersProductInfo.order.logesticId)}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.totalprice)}</th>
                        <td className={styles.tablecontent}>
                          {
                            <PriceFormater
                              pricetype={ordersProductInfo.order.priceType}
                              fee={ordersProductInfo.order.totalPrice}
                              className={PriceFormaterClassName.PostPrice}
                            />
                          }
                        </td>
                      </tr>

                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.note)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.note || ""}</td>
                      </tr>

                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_OrderDATE)}</th>
                        <td className={styles.tablecontent}>
                          {new DateObject({
                            date: ordersProductInfo.order.createdTime * 1000,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("YYYY/MM/DD - hh:mm:ss A")}
                        </td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.navbar_PaymentNumber)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.invoice.id}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.userpanel_ZipCode)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.postalCode}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Storeorder_receiver)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.receiver}</td>
                      </tr>
                      <tr>
                        <th className={styles.tableheader}>{t(LanguageKey.Address)}</th>
                        <td className={styles.tablecontent}>{ordersProductInfo.address.address}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailContent;
