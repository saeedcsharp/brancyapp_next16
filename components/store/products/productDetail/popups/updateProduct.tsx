import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import IncrementStepper from "brancy/components/design/incrementStepper/incrementStepper";
import RadioButton from "brancy/components/design/radioButton/radioButton";
import InputBox from "brancy/components/design/inputBox/inputBox";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import priceFormatter from "brancy/helper/priceFormater";
import { specifyPriceType } from "brancy/components/priceFormater";
import { IProduct_CreateSubProduct, IProduct_FullProduct, ISubProduct_Info } from "brancy/models/interfaces";
import styles from "./updateProduct.module.css";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
const basePictureUrl = getClientMediaBaseUrl();
const MAX_DISCOUNT_PERCENT = 80;
type Tab = "discount" | "price";
type ApplyScope = "all" | "individual";
type ValueUnit = "percent" | "amount";
type PriceDirection = "increase" | "decrease";
interface Adjustment {
  unit: ValueUnit;
  direction: PriceDirection;
  value: number;
  amount: string;
}
const emptyAdjustment = (): Adjustment => ({ unit: "percent", direction: "increase", value: 0, amount: "" });
const getAdjustmentValue = (adjustment: Adjustment): number =>
  adjustment.unit === "percent" ? adjustment.value : Number(adjustment.amount) || 0;
const UpdateProduct = (props: { data: string[]; removeMask: () => void; onSaved?: () => void }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullProducts, setFullProducts] = useState<IProduct_FullProduct[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("discount");
  const [scope, setScope] = useState<ApplyScope>("all");
  const [allAdjustment, setAllAdjustment] = useState<Adjustment>(emptyAdjustment);
  const [productAdjustments, setProductAdjustments] = useState<Record<string, Adjustment>>({});
  useEffect(() => {
    if (!session || props.data.length === 0) return;
    let isActive = true;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await clientFetchApi<{ productIds: string[] }, IProduct_FullProduct[]>(
          "/api/product/GetFullProductList",
          {
            methodType: MethodType.post,
            session,
            data: { productIds: props.data },
            queries: [{ key: "language", value: "1" }],
            onUploadProgress: undefined,
          },
        );
        if (!isActive) return;
        if (res.succeeded) {
          setFullProducts(res.value);
          setProductAdjustments(
            Object.fromEntries(
              res.value.map((product) => {
                const discounts = product.subProducts
                  .map((subProduct) => subProduct.disCount?.value)
                  .filter((value): value is number => value !== undefined);
                const commonDiscount = discounts.length > 0 && discounts.every((value) => value === discounts[0]);
                return [
                  product.shortProduct.productId,
                  { ...emptyAdjustment(), value: commonDiscount ? discounts[0] : 0 },
                ];
              }),
            ),
          );
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch {
        if (isActive) notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        if (isActive) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isActive = false;
    };
  }, [session, props.data]);
  const adjustmentHasValue = useMemo(() => {
    const hasValue = (adjustment: Adjustment) => getAdjustmentValue(adjustment) > 0;
    if (scope === "all") return hasValue(allAdjustment);
    return fullProducts.some((product) =>
      hasValue(productAdjustments[product.shortProduct.productId] ?? emptyAdjustment()),
    );
  }, [allAdjustment.value, fullProducts, productAdjustments, scope]);
  function updateAllAdjustment(patch: Partial<Adjustment>) {
    setAllAdjustment((current) => ({ ...current, ...patch }));
  }
  function updateProductAdjustment(productId: string, patch: Partial<Adjustment>) {
    setProductAdjustments((current) => ({
      ...current,
      [productId]: { ...(current[productId] ?? emptyAdjustment()), ...patch },
    }));
  }
  function getDiscountRange(product: IProduct_FullProduct) {
    const values = product.subProducts
      .map((subProduct) => subProduct.disCount?.value)
      .filter((value): value is number => value !== undefined);
    if (values.length === 0) return null;
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    return minimum === maximum ? `${minimum}%` : `${minimum}% - ${maximum}%`;
  }
  function getPriceRange(product: IProduct_FullProduct) {
    const prices = product.subProducts.map((subProduct) => subProduct.price);
    if (prices.length === 0) return "--";
    const minimum = Math.min(...prices);
    const maximum = Math.max(...prices);
    const format = priceFormatter(product.shortProduct.priceType);
    return minimum === maximum ? format(minimum) : `${format(minimum)} - ${format(maximum)}`;
  }
  function resolveDiscount(subProduct: ISubProduct_Info, adjustment: Adjustment) {
    const percent =
      adjustment.unit === "percent"
        ? adjustment.value
        : subProduct.price > 0
          ? (getAdjustmentValue(adjustment) / subProduct.price) * 100
          : 0;
    return Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, Number(percent.toFixed(2))));
  }
  function resolvePrice(price: number, adjustment: Adjustment) {
    const change = adjustment.unit === "percent" ? (price * adjustment.value) / 100 : getAdjustmentValue(adjustment);
    const nextPrice = adjustment.direction === "increase" ? price + change : price - change;
    return Math.max(1, Number(nextPrice.toFixed(2)));
  }
  function buildPayload(product: IProduct_FullProduct, adjustment: Adjustment): IProduct_CreateSubProduct {
    return {
      productId: product.shortProduct.productId,
      deActiveSubProducts: product.subProducts
        .filter((subProduct) => !subProduct.isActive)
        .map((subProduct) => subProduct.id),
      subProducts: product.subProducts.map((subProduct) => ({
        customVariation: subProduct.customVariation,
        colorVariation: subProduct.colorId,
        stock: subProduct.stock,
        price: activeTab === "price" ? resolvePrice(subProduct.price, adjustment) : subProduct.price,
        disCount:
          activeTab === "discount"
            ? {
                value: resolveDiscount(subProduct, adjustment),
                maxCount: subProduct.disCount?.maxUseCount ?? null,
                maxTime: subProduct.disCount?.maxTime ?? null,
              }
            : subProduct.disCount
              ? {
                  value: subProduct.disCount.value,
                  maxCount: subProduct.disCount.maxUseCount,
                  maxTime: subProduct.disCount.maxTime,
                }
              : null,
        variations: subProduct.variations.map((variation) => ({
          variationId: variation.variation.variationId,
          variationTitleId: variation.variation.variationTitleId,
        })),
      })),
    };
  }
  async function handleSave() {
    if (!session || saving || !adjustmentHasValue) return;
    setSaving(true);
    try {
      const productsToUpdate = fullProducts.filter((product) => {
        const adjustment = productAdjustments[product.shortProduct.productId] ?? emptyAdjustment();
        return scope === "all" || getAdjustmentValue(adjustment) > 0;
      });
      const responses = await Promise.all(
        productsToUpdate.map((product) => {
          const adjustment = scope === "all" ? allAdjustment : productAdjustments[product.shortProduct.productId];
          const payload = buildPayload(product, adjustment);
          return clientFetchApi<IProduct_CreateSubProduct, boolean>("/api/product/CreateSubProducts", {
            methodType: MethodType.post,
            session,
            data: payload,
            queries: [{ key: "productId", value: product.shortProduct.productId.toString() }],
            onUploadProgress: undefined,
          });
        }),
      );
      const failedResponse = responses.find((response) => !response.succeeded);
      if (failedResponse) {
        notify(failedResponse.info.responseType, NotifType.Warning);
        return;
      }
      notify(ResponseType.Ok, NotifType.Success);
      props.onSaved?.();
      props.removeMask();
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className={styles.update}>
      {loading && <Loading />}
      {!loading && (
        <>
          <header className="headerandinput">
            <div className="headerparent">
              <div className="headerandinput">
                <div className="title" id="modal-title">
                  {t("bulkProduct.title")}
                </div>
                <span className="explain">{t("bulkProduct.selectedCount", { count: fullProducts.length })}</span>
              </div>
              <button type="button" className={styles.closeButton} onClick={props.removeMask} aria-label={t("close")}>
                <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="m4 4 12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ToggleButton
              options={[
                { id: 0, label: t("product_Discount") },
                { id: 1, label: t("bulkProduct.priceChange") },
              ]}
              selectedValue={activeTab === "discount" ? 0 : 1}
              onChange={(value) => {
                setActiveTab(value === 0 ? "discount" : "price");
                setAllAdjustment(emptyAdjustment());
                setProductAdjustments((current) =>
                  Object.fromEntries(Object.keys(current).map((productId) => [productId, emptyAdjustment()])),
                );
              }}
            />
          </header>
          <div className={styles.contentParent}>
            {/* all product */}
            <div className="headerandinput">
              <div className="headertext">
                <RadioButton
                  name="bulk-product-scope"
                  id="bulk-product-all"
                  checked={scope === "all"}
                  handleOptionChanged={() => setScope("all")}
                  textlabel={t("bulkProduct.applyAll")}
                />
                <Tooltip
                  triggerType="tooltip"
                  tooltipValue={
                    activeTab === "discount" ? t("bulkProduct.discountAllHint") : t("bulkProduct.priceAllHint")
                  }
                  position="bottom"
                  onClick></Tooltip>
              </div>
              <section
                className={`${styles.allEditor} ${scope === "all" ? styles.allEditorExpanded : styles.allEditorCollapsed}`}>
                {activeTab === "price" && (
                  <div className={styles.directionControl}>
                    <button
                      type="button"
                      className={allAdjustment.direction === "increase" ? styles.directionActive : ""}
                      onClick={() => updateAllAdjustment({ direction: "increase" })}>
                      + {t("bulkProduct.increase")}
                    </button>
                    <button
                      type="button"
                      className={allAdjustment.direction === "decrease" ? styles.directionActive : ""}
                      onClick={() => updateAllAdjustment({ direction: "decrease" })}>
                      - {t("bulkProduct.decrease")}
                    </button>
                  </div>
                )}
                <div className={styles.valueRow}>
                  <div className="headerparent">
                    <RadioButton
                      name="bulk-product-value-type-all"
                      id="bulk-product-percent-all"
                      checked={allAdjustment.unit === "percent"}
                      handleOptionChanged={() => updateAllAdjustment({ unit: "percent" })}
                      textlabel="%"
                    />
                    <IncrementStepper
                      id="bulk-product-value-all"
                      data={allAdjustment.value}
                      increment={() =>
                        updateAllAdjustment({
                          value: Math.min(
                            activeTab === "discount" ? MAX_DISCOUNT_PERCENT : 100,
                            allAdjustment.value + 1,
                          ),
                        })
                      }
                      decrement={() => updateAllAdjustment({ value: Math.max(0, allAdjustment.value - 1) })}
                      onValueChange={(value) => updateAllAdjustment({ value })}
                      max={activeTab === "discount" ? MAX_DISCOUNT_PERCENT : 100}
                      disabled={allAdjustment.unit !== "percent"}
                      className={allAdjustment.unit !== "percent" ? "fadeDiv" : ""}
                    />
                  </div>

                  <div className="headerparent">
                    <RadioButton
                      name="bulk-product-value-type-all"
                      id="bulk-product-amount-all"
                      checked={allAdjustment.unit === "amount"}
                      handleOptionChanged={() => updateAllAdjustment({ unit: "amount" })}
                      textlabel={t("bulkProduct.amount")}
                    />
                    <div style={{ display: "flex", alignItems: "flex-end", width: "110px" }}>
                      <InputBox
                        className="textinputbox"
                        value={allAdjustment.amount}
                        handleInputChange={(event) => updateAllAdjustment({ amount: event.target.value })}
                        inputMode="decimal"
                        decimal
                        unit={fullProducts[0] ? specifyPriceType(fullProducts[0].shortProduct.priceType) : undefined}
                        disabled={allAdjustment.unit !== "amount"}
                        fadeTextArea={allAdjustment.unit !== "amount"}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {/* {allAdjustment.unit === "percent" ? (
                    <div className={styles.stepperWrap}>
                      <IncrementStepper
                        id="bulk-product-value-all"
                        data={allAdjustment.value}
                        increment={() =>
                          updateAllAdjustment({
                            value: Math.min(
                              activeTab === "discount" ? MAX_DISCOUNT_PERCENT : 100,
                              allAdjustment.value + 1,
                            ),
                          })
                        }
                        decrement={() => updateAllAdjustment({ value: Math.max(0, allAdjustment.value - 1) })}
                        onValueChange={(value) => updateAllAdjustment({ value })}
                        max={activeTab === "discount" ? MAX_DISCOUNT_PERCENT : 100}
                      />
                      <span>%</span>
                    </div>
                  ) : (
                    <input
                      className={styles.amountInput}
                      type="number"
                      min={0}
                      inputMode="decimal"
                      value={allAdjustment.value || ""}
                      placeholder="0"
                      onChange={(event) => updateAllAdjustment({ value: Math.max(0, Number(event.target.value)) })}
                    />
                  )} */}
                </div>
              </section>
            </div>

            {/* each product */}
            <div className="headerandinput">
              <div className="headertext">
                <RadioButton
                  name="bulk-product-scope"
                  id="bulk-product-individual"
                  checked={scope === "individual"}
                  handleOptionChanged={() => setScope("individual")}
                  textlabel={t("bulkProduct.applyIndividual")}
                />
                <Tooltip
                  triggerType="tooltip"
                  tooltipValue={
                    activeTab === "discount" ? t("bulkProduct.discountAllHint") : t("bulkProduct.priceAllHint")
                  }
                  position="bottom"
                  onClick></Tooltip>
              </div>

              <main className={styles.content}>
                <section
                  className={`${styles.individualEditor} ${
                    scope === "individual" ? styles.individualEditorExpanded : styles.individualEditorCollapsed
                  }`}>
                  {fullProducts.map((product) => {
                    const productId = product.shortProduct.productId;
                    const adjustment = productAdjustments[productId] ?? emptyAdjustment();
                    const discountRange = getDiscountRange(product);
                    return (
                      <article className={styles.productCard}>
                        <div className={styles.productSummary}>
                          <img
                            src={`${basePictureUrl}${product.shortProduct.thumbnailMediaUrl}`}
                            alt={product.shortProduct.title ?? t("Storeproduct_name")}
                          />
                          <div className={styles.productMeta}>
                            <strong>{product.shortProduct.title || t("Storeproduct_name")}</strong>
                            <span>PID {product.shortProduct.tempId}</span>
                            <span>{getPriceRange(product)}</span>
                          </div>
                          {discountRange && (
                            <div className={styles.discountBadge}>
                              {t("bulkProduct.currentDiscount")} {discountRange}
                            </div>
                          )}
                        </div>
                        {activeTab === "price" && (
                          <div className={styles.directionControl}>
                            <button
                              type="button"
                              className={adjustment.direction === "increase" ? styles.directionActive : ""}
                              onClick={() => updateProductAdjustment(productId, { direction: "increase" })}>
                              + {t("bulkProduct.increase")}
                            </button>
                            <button
                              type="button"
                              className={adjustment.direction === "decrease" ? styles.directionActive : ""}
                              onClick={() => updateProductAdjustment(productId, { direction: "decrease" })}>
                              - {t("bulkProduct.decrease")}
                            </button>
                          </div>
                        )}
                        <div className={styles.valueRow}>
                          <div className="headerparent">
                            <RadioButton
                              name={`bulk-product-value-type-${productId}`}
                              id={`bulk-product-percent-${productId}`}
                              checked={adjustment.unit === "percent"}
                              handleOptionChanged={() => updateProductAdjustment(productId, { unit: "percent" })}
                              textlabel="%"
                            />
                            <IncrementStepper
                              id={`bulk-product-value-${productId}`}
                              data={adjustment.value}
                              increment={() =>
                                updateProductAdjustment(productId, {
                                  value: Math.min(
                                    activeTab === "discount" ? MAX_DISCOUNT_PERCENT : 100,
                                    adjustment.value + 1,
                                  ),
                                })
                              }
                              decrement={() =>
                                updateProductAdjustment(productId, { value: Math.max(0, adjustment.value - 1) })
                              }
                              onValueChange={(value) => updateProductAdjustment(productId, { value })}
                              max={activeTab === "discount" ? MAX_DISCOUNT_PERCENT : 100}
                              disabled={adjustment.unit !== "percent"}
                              className={adjustment.unit !== "percent" ? "fadeDiv" : ""}
                            />
                          </div>
                          <div className="headerparent">
                            <RadioButton
                              name={`bulk-product-value-type-${productId}`}
                              id={`bulk-product-amount-${productId}`}
                              checked={adjustment.unit === "amount"}
                              handleOptionChanged={() => updateProductAdjustment(productId, { unit: "amount" })}
                              textlabel={t("bulkProduct.amount")}
                            />
                            <div style={{ display: "flex", alignItems: "flex-end", width: "110px" }}>
                              <InputBox
                                className="textinputbox"
                                value={adjustment.amount}
                                handleInputChange={(event) =>
                                  updateProductAdjustment(productId, { amount: event.target.value })
                                }
                                inputMode="decimal"
                                decimal
                                unit={specifyPriceType(product.shortProduct.priceType)}
                                disabled={adjustment.unit !== "amount"}
                                fadeTextArea={adjustment.unit !== "amount"}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </section>
              </main>
            </div>
          </div>
          <footer className="ButtonContainer">
            <button type="button" className="cancelButton" onClick={props.removeMask} disabled={saving}>
              {t("cancel")}
            </button>
            <button
              type="button"
              className={adjustmentHasValue && !saving ? "saveButton" : "disableButton"}
              onClick={handleSave}
              disabled={!adjustmentHasValue || saving}>
              {saving ? t("bulkProduct.saving") : t("save")}
            </button>
          </footer>
        </>
      )}
    </div>
  );
};
export default UpdateProduct;
