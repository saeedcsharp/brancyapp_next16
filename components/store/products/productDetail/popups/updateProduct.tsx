import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import IncrementStepper from "brancy/components/design/incrementStepper";
import RadioButton from "brancy/components/design/radioButton";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import priceFormatter from "brancy/helper/priceFormater";
import { IProduct_CreateSubProduct, IProduct_FullProduct, ISubProduct_Info } from "brancy/models/interfaces";

import styles from "./updateProduct.module.css";

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
}

const emptyAdjustment = (): Adjustment => ({ unit: "percent", direction: "increase", value: 0 });

const UpdateProduct = (props: { data: number[]; removeMask: () => void; onSaved?: () => void }) => {
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
        const res = await clientFetchApi<{ productIds: number[] }, IProduct_FullProduct[]>(
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
    if (scope === "all") return allAdjustment.value > 0;
    return fullProducts.some((product) => (productAdjustments[product.shortProduct.productId]?.value ?? 0) > 0);
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
          ? (adjustment.value / subProduct.price) * 100
          : 0;
    return Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, Number(percent.toFixed(2))));
  }

  function resolvePrice(price: number, adjustment: Adjustment) {
    const change = adjustment.unit === "percent" ? (price * adjustment.value) / 100 : adjustment.value;
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
      const productsToUpdate = fullProducts.filter(
        (product) => scope === "all" || (productAdjustments[product.shortProduct.productId]?.value ?? 0) > 0,
      );
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

  function renderUnitControl(adjustment: Adjustment, update: (patch: Partial<Adjustment>) => void) {
    return (
      <div className={styles.unitControl} aria-label={t("bulkProduct.valueType")}>
        <button
          type="button"
          className={adjustment.unit === "percent" ? styles.unitActive : ""}
          onClick={() => update({ unit: "percent" })}>
          %
        </button>
        <button
          type="button"
          className={adjustment.unit === "amount" ? styles.unitActive : ""}
          onClick={() => update({ unit: "amount" })}>
          {t("bulkProduct.amount")}
        </button>
      </div>
    );
  }

  function renderUnitRadioControl(
    adjustment: Adjustment,
    update: (patch: Partial<Adjustment>) => void,
    radioGroupId: string,
  ) {
    return (
      <div className="headerandinput">
        <RadioButton
          name={`bulk-product-value-type-${radioGroupId}`}
          id={`bulk-product-percent-${radioGroupId}`}
          checked={adjustment.unit === "percent"}
          handleOptionChanged={() => update({ unit: "percent" })}
          textlabel="%"
        />
        <RadioButton
          name={`bulk-product-value-type-${radioGroupId}`}
          id={`bulk-product-amount-${radioGroupId}`}
          checked={adjustment.unit === "amount"}
          handleOptionChanged={() => update({ unit: "amount" })}
          textlabel={t("bulkProduct.amount")}
        />
      </div>
    );
  }

  function renderDirectionControl(adjustment: Adjustment, update: (patch: Partial<Adjustment>) => void) {
    if (activeTab !== "price") return null;
    return (
      <div className={styles.directionControl}>
        <button
          type="button"
          className={adjustment.direction === "increase" ? styles.directionActive : ""}
          onClick={() => update({ direction: "increase" })}>
          + {t("bulkProduct.increase")}
        </button>
        <button
          type="button"
          className={adjustment.direction === "decrease" ? styles.directionActive : ""}
          onClick={() => update({ direction: "decrease" })}>
          - {t("bulkProduct.decrease")}
        </button>
      </div>
    );
  }

  function renderValueControl(adjustment: Adjustment, update: (patch: Partial<Adjustment>) => void) {
    if (adjustment.unit === "percent") {
      const maximum = activeTab === "discount" ? MAX_DISCOUNT_PERCENT : 100;
      return (
        <div className={styles.stepperWrap}>
          <IncrementStepper
            id="bulk-product-value"
            data={adjustment.value}
            increment={() => update({ value: Math.min(maximum, adjustment.value + 1) })}
            decrement={() => update({ value: Math.max(0, adjustment.value - 1) })}
          />
          <span>%</span>
        </div>
      );
    }
    return (
      <input
        className={styles.amountInput}
        type="number"
        min={0}
        inputMode="decimal"
        value={adjustment.value || ""}
        placeholder="0"
        onChange={(event) => update({ value: Math.max(0, Number(event.target.value)) })}
      />
    );
  }

  function renderEditor(
    adjustment: Adjustment,
    update: (patch: Partial<Adjustment>) => void,
    useRadioUnit = false,
    radioGroupId = "all",
  ) {
    return (
      <div className={styles.editor}>
        {renderDirectionControl(adjustment, update)}
        <div className={styles.valueRow}>
          {useRadioUnit
            ? renderUnitRadioControl(adjustment, update, radioGroupId)
            : renderUnitControl(adjustment, update)}
          {renderValueControl(adjustment, update)}
        </div>
      </div>
    );
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
            <FlexibleToggleButton
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
            <div className="headerandinput">
              <RadioButton
                name="bulk-product-scope"
                id="bulk-product-all"
                checked={scope === "all"}
                handleOptionChanged={() => setScope("all")}
                textlabel={t("bulkProduct.applyAll")}
              />
              <div className="explain">
                {activeTab === "discount" ? t("bulkProduct.discountAllHint") : t("bulkProduct.priceAllHint")}
              </div>
              <section
                className={`${styles.allEditor} ${scope === "all" ? styles.allEditorExpanded : styles.allEditorCollapsed}`}>
                {renderEditor(allAdjustment, updateAllAdjustment, true)}
              </section>
            </div>
            <div className="headerandinput">
              <RadioButton
                name="bulk-product-scope"
                id="bulk-product-individual"
                checked={scope === "individual"}
                handleOptionChanged={() => setScope("individual")}
                textlabel={t("bulkProduct.applyIndividual")}
              />
              <div className="explain">
                {activeTab === "discount" ? t("bulkProduct.discountAllHint") : t("bulkProduct.priceAllHint")}
              </div>
              <main className={styles.content}>
                <section
                  className={`${styles.individualEditor} ${
                    scope === "individual" ? styles.individualEditorExpanded : styles.individualEditorCollapsed
                  }`}>
                  <div className={styles.productList}>
                    {fullProducts.map((product) => {
                      const productId = product.shortProduct.productId;
                      const adjustment = productAdjustments[productId] ?? emptyAdjustment();
                      const discountRange = getDiscountRange(product);
                      return (
                        <article className={styles.productCard} key={productId}>
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
                          {renderEditor(
                            adjustment,
                            (patch) => updateProductAdjustment(productId, patch),
                            true,
                            productId.toString(),
                          )}
                        </article>
                      );
                    })}
                  </div>
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
