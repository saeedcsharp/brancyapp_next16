import { useSession } from "next-auth/react";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import InputText from "brancy/components/design/inputText";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import priceFormatter from "brancy/helper/priceFormater";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import { Language } from "brancy/models/store/enum";
import {
  IDisCount,
  IDiscount_ForClient,
  IProduct_ShortProduct,
  IProduct_Variation,
  IProductInstance,
  ISubProduct_CreateForInstance,
  ITitleVariation_WithVarition,
  ITitleVariationVariation,
} from "brancy/models/store/IProduct";
import Discount from "brancy/components/store/products/productDetail/notInstanceProduct/popups/discount";
import styles from "./Variation.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";

export interface IAddNewVariation {
  val1: INewVariation | null;
  val2: INewVariation | null;
  val3: INewVariation | null;
}
export interface INewVariation {
  variationTitleId: number | null;
  color: boolean;
  customeTitle: string | null;
}
function IntanceVariation({
  subProductInfo,
  productInstance,
  titleVariation,
  upadteCteateFromVariation,
  toggleNext,
  shortProduct,
}: {
  subProductInfo: ISubProduct_CreateForInstance[];
  productInstance: IProductInstance;
  titleVariation: ITitleVariation_WithVarition[];
  toggleNext: { toggle: boolean; isNext: boolean };
  shortProduct: IProduct_ShortProduct;
  upadteCteateFromVariation: (
    deActiveSubProducts: number[],
    subProducts: ISubProduct_CreateForInstance[],
    isNext: boolean,
  ) => void;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [showDisCount, setShowDiscount] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [createSubProducts, setCreateSubProducts] = useState<ISubProduct_CreateForInstance[]>(subProductInfo);
  const [deActiveSubProducts, setDeActiveSubProducts] = useState<number[]>([]);
  const [variation, setVariation] = useState<IProduct_Variation>({
    colorCategories: [],
    variations: [],
  });
  const [refresh, setRefresh] = useState(false);
  const [selectedSubForDiscount, setSelectedSubForDiscount] = useState<IDiscount_ForClient | null>(null);
  const [repeatedSub, setRepeatedSub] = useState<number[][]>([]);
  // Add new state for deletion confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    index: number;
    id: number | null;
  } | null>(null);

  function togglePopup(dis: IDisCount | null, index: number) {
    if (!dis) return;
    console.log("dis", dis);
    setSelectedSubForDiscount({
      index: index,
      maxCount: dis.maxCount,
      maxTime: dis.maxTime,
      value: dis.value,
    });
    setShowDiscount(true);
  }
  function handleSelectDiscout(id: any, index: number) {
    setCreateSubProducts((prev) =>
      prev.map((x) =>
        prev.indexOf(x) !== index
          ? x
          : {
              ...x,
              disCount:
                id == "0"
                  ? null
                  : {
                      maxCount: null,
                      maxTime: null,
                      value: 15,
                    },
            },
      ),
    );
  }
  function handleChangeStock(e: ChangeEvent<HTMLInputElement>, index: number) {
    var stock = e.target.value;
    if (stock === "" || parseInt(stock) < 0) stock = "0";
    setCreateSubProducts((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, stock: parseInt(stock) })));
  }
  const [rawValue, setRawValue] = useState<{ price: string; index: number }[]>(
    subProductInfo.map((x) => ({
      index: subProductInfo.indexOf(x),
      price: priceFormatter(shortProduct.priceType)(x.price),
    })),
  ); // Raw input value
  const handleChangePrice = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^\d.]/g, ""); // Remove non-numeric chars

    if (value === "") {
      // Handle empty input case
      setRawValue((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, price: "" })));
      return;
    }

    const numericValue = parseFloat(value); // Parse to number

    if (!isNaN(numericValue)) {
      setCreateSubProducts((prev) =>
        prev.map((x) =>
          prev.indexOf(x) !== index
            ? x
            : {
                ...x,
                price: numericValue,
              },
        ),
      );
      setRawValue((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, price: value }))); // Update raw value for input
    } else {
      setRawValue((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, price: value }))); // Allow clearing the field
    }
  };
  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value === "") {
      // Keep it empty on blur if it was empty
      setRawValue((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, price: "" })));
      return;
    }
    // Otherwise format the price
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ""));
    if (!isNaN(numericValue)) {
      setCreateSubProducts((prev) =>
        prev.map((x) =>
          prev.indexOf(x) !== index
            ? x
            : {
                ...x,
                price: numericValue,
              },
        ),
      );
      setRawValue((prev) =>
        prev.map((x) =>
          prev.indexOf(x) !== index
            ? x
            : {
                ...x,
                price: priceFormatter(shortProduct.priceType)(numericValue),
              },
        ),
      ); // Format the price on blur
    }
  };
  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawInput = rawValue[index].price; // Changed 'i' to 'index'
    if (rawInput === "") {
      // If empty, keep it empty
      return;
    }
    const value = createSubProducts[index].price;
    setRawValue((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, price: value.toString() }))); // Show raw number on focus
  };
  async function fetchData() {
    try {
      const res = await clientFetchApi<boolean, IProduct_Variation>("shopper" + "" + "/Product/GetVariations", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          { key: "categoryId", value: productInstance.categoryId.toString() },
          { key: "language", value: "1" },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        console.log("ssssssssssssssssssssssssssss", res.value);
        setVariation(res.value);
        setLoading(false);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleSaveDicount(dis: IDiscount_ForClient) {
    setCreateSubProducts((prev) =>
      prev.map((x) =>
        dis.index !== prev.indexOf(x)
          ? x
          : {
              ...x,
              disCount: {
                maxCount: dis.maxCount,
                maxTime: dis.maxTime,
                value: dis.value,
              },
            },
      ),
    );
    setShowDiscount(false);
  }
  function AddNewSubproduct() {
    let newArray = [...createSubProducts];
    newArray.push({
      colorVariation: null,
      customVariation: productInstance.customVariation ? "" : null,
      disCount: null,
      price: 0,
      stock: 0,
      colorId: 0,
      createdTime: 0,
      id: null,
      isActive: true,
      priceType: 0,
      productInId: null,
      variations: titleVariation.map((x) => ({
        categoryId: 0,
        language: Language.English,
        langValue: "",
        variationId: 0,
        variationTitleId: x.variationTitleId,
      })),
    });
    setRawValue((prev) => [
      ...prev,
      {
        index: prev.length,
        price: "0",
      },
    ]);
    setCreateSubProducts(newArray);
  }
  function specifyVariationData(variationTitleId: number) {
    const data = variation.variations
      .find((x) => x.id === variationTitleId)!
      ?.variations.map((svr) => <div id={svr.variationId.toString()}>{svr.langValue}</div>);
    data.unshift(
      // <div id="0">Not Set</div>
      <div className={styles.namesection} id="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>,
    );
    return data;
  }
  function handleSelectVariationIndex(variationId: number, variationTitleId: number) {
    var index = 0;
    const varIndex = variation.variations
      .find((x) => x.id === variationTitleId)
      ?.variations.findIndex((x) => x.variationId === variationId);
    if (varIndex) index = varIndex;
    return index + 1;
  }
  function handleVariationSelect(id: any, index: number, variationTitleId: number) {
    setCreateSubProducts((prev) =>
      prev.map((x) =>
        prev.indexOf(x) !== index
          ? x
          : {
              ...x,
              variations: x.variations.map((c) =>
                c.variationTitleId !== variationTitleId ? c : { ...c, variationId: parseInt(id) },
              ),
            },
      ),
    );
  }
  function handleDeleteSubProduct(index: number, id: number | null) {
    if (createSubProducts.length === 1) {
      internalNotify(InternalResponseType.NeedOneProduct, NotifType.Warning);
      return;
    }
    setRefresh(!refresh);
    setCreateSubProducts((prev) => prev.filter((x) => prev.indexOf(x) !== index));
    setRawValue((prev) => prev.filter((x) => prev.indexOf(x) !== index));
    setRepeatedSub((prev) => prev.map((x) => (!x.find((c) => c === index) ? x : x.filter((m) => m !== index))));
    if (id) setDeActiveSubProducts((prev) => [...prev, id]);

    // Add notification after successful deletion
    internalNotify(InternalResponseType.deleteIceBreaker, NotifType.Success);
  }

  // New function to show confirmation dialog
  function showDeleteConfirmation(index: number, id: number | null) {
    setDeleteConfirmation({ show: true, index, id });
  }

  function handleRedBorder(index: number) {
    let style: CSSProperties = {};
    for (let re of repeatedSub) {
      if (re.includes(index)) style = { border: "1px solid var(--color-dark-red)" };
    }
    return style;
  }
  function handleChangeCustomeVariation(e: ChangeEvent<HTMLInputElement>, index: number) {
    setCreateSubProducts((prev) =>
      prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, customVariation: e.target.value })),
    );
  }
  function specifyColorData() {
    const data = variation.colorCategories.map((c) => <div id={c.colorId.toString()}>{c.langValue}</div>);
    data.unshift(
      // <div id="0">Not Set</div>
      <div className={styles.namesection} id="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>,
    );
    return data;
  }
  function handleSelectColorIndex(colorId: number | null) {
    if (!colorId) return 0;
    const varIndex = variation.colorCategories.findIndex((x) => x.colorId === colorId);
    return varIndex + 1;
  }
  function handleColorSelect(id: any, index: number) {
    setCreateSubProducts((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, colorId: parseInt(id) })));
  }
  function compareVariations(a: ITitleVariationVariation[], b: ITitleVariationVariation[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((variationA, index) => {
      const variationB = b[index];
      return (
        variationA.variationTitleId === variationB.variationTitleId && variationA.variationId === variationB.variationId
      );
    });
  }
  const findGroupedIndices = (arr: ISubProduct_CreateForInstance[]): number[][] => {
    const groupedIndices: number[][] = [];
    const visited: boolean[] = new Array(arr.length).fill(false); // To track visited objects

    for (let i = 0; i < arr.length; i++) {
      if (visited[i]) continue; // Skip if already part of a group

      const currentGroup: number[] = [i]; // Start a new group with the current index
      visited[i] = true;

      for (let j = i + 1; j < arr.length; j++) {
        if (
          arr[i].customVariation === arr[j].customVariation &&
          arr[i].colorId === arr[j].colorId &&
          compareVariations(arr[i].variations, arr[j].variations)
        ) {
          currentGroup.push(j); // Add matching index to the current group
          visited[j] = true; // Mark as visited
        }
      }

      if (currentGroup.length > 1) {
        groupedIndices.push(currentGroup); // Only add if more than one object matches
      }
    }

    return groupedIndices;
  };
  useEffect(() => {
    if (loading) {
      fetchData();
      return;
    }
    upadteCteateFromVariation(deActiveSubProducts, createSubProducts, toggleNext.isNext);
  }, [toggleNext.toggle]);
  useEffect(() => {
    const indc = findGroupedIndices(createSubProducts);
    if (indc.length > 0) {
      setRepeatedSub(indc);
      return;
    } else setRepeatedSub([]);
  }, [createSubProducts]);

  function formatRemainingTime(maxTime: number | null): string {
    if (maxTime === null) {
      return t(LanguageKey.product_UNLIMITEDTIME); // "No time limit"
    }

    const now = Date.now();
    const remainingMilliseconds = maxTime - now;

    if (remainingMilliseconds <= 0) {
      return t(LanguageKey.Expired); // "Expired"
    }

    const seconds = Math.floor(remainingMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;

    let parts: string[] = [];
    if (days > 0) {
      parts.push(`${days} ${t(days > 1 ? LanguageKey.countdown_Days : LanguageKey.pageTools_Day)}`); // "day(s)"
    }
    if (remainingHours > 0) {
      parts.push(
        `${remainingHours} ${t(remainingHours > 1 ? LanguageKey.countdown_Hours : LanguageKey.countdown_Hours)}`,
      ); // "hour(s)"
    }
    if (days === 0 && remainingHours === 0 && remainingMinutes > 0) {
      parts.push(
        `${remainingMinutes} ${t(remainingMinutes > 1 ? LanguageKey.countdown_Minutes : LanguageKey.countdown_Minutes)}`,
      ); // "minute(s)"
    }
    if (days === 0 && remainingHours === 0 && remainingMinutes === 0 && seconds > 0) {
      parts.push(t(LanguageKey.LessThanAMinute)); // "less than a minute"
    }

    if (parts.length === 0) {
      return t(LanguageKey.Expired); // Should ideally not happen if remainingMilliseconds > 0, but as fallback
    }

    return `${t(LanguageKey.ExpiresIn)} ${parts.join(", ")}`; // "Expires in "
  }

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <div className={styles.variation}>
          <div className="headerandinput">
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.product_SetProperties)}</div>
              <div className="explain">{t(LanguageKey.product_SetPropertiesexplain)}</div>
            </div>

            <div className={styles.addmorebtn}>
              {productInstance.customVariation && (
                <div className={styles.exitedproperty}>
                  <div className="frameParent" title="ℹ️ Property">
                    {productInstance.customVariation}
                  </div>
                  <div className={styles.variationexplain}></div>
                </div>
              )}
              {productInstance.isColorVariation && (
                <div className={styles.exitedproperty}>
                  <div className="frameParent" title="ℹ️ Property">
                    color
                  </div>
                  <div className={styles.variationexplain}>
                    {variation.colorCategories.map((x) => x.langValue + ", ")}
                  </div>
                </div>
              )}
              {titleVariation.map((v) => (
                <div key={v.variationTitleId} className={styles.exitedproperty}>
                  <div className="frameParent" title="ℹ️ Property">
                    {v.langValue}
                  </div>
                  <div className={styles.variationexplain}>
                    {variation.variations
                      .find((x) => x.id === v.variationTitleId)!
                      .variations.map((c) => c.langValue + ", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {createSubProducts.map((sub, i) => (
            <div className={styles.variationparent} key={i}>
              <div className="headerandinput">
                <div className="frameParent" style={{ paddingInline: "10px" }}>
                  <div className="title">
                    {t(LanguageKey.product_Variation)} {`${i + 1}`}
                  </div>

                  {createSubProducts.length > 1 && (
                    <img
                      title="delete variation"
                      onClick={() => {
                        showDeleteConfirmation(i, sub.id);
                      }}
                      className={styles.deletebtn}
                      src="/delete-red.svg"
                    />
                  )}
                </div>
                <div key={i} className={styles.variationlist} style={handleRedBorder(i)}>
                  <div className={styles.responsiveitem}>
                    <div className={styles.variationselection}>
                      {sub.customVariation !== null && (
                        <div
                          className="headerandinput"
                          style={{
                            minWidth: "auto",
                            maxWidth: "33%",
                          }}>
                          <div
                            className="headertext"
                            style={{
                              color: "var(--color-light-blue)",
                              width: "auto",
                              maxWidth: "100%",
                              justifyContent:
                                productInstance.customVariation &&
                                /[\u0600-\u06FF\u0750-\u077F]/.test(sub.customVariation)
                                  ? "right"
                                  : "left",
                            }}>
                            {productInstance.customVariation}
                          </div>
                          {!sub.id && (
                            <InputText
                              className={
                                sub.customVariation && sub.customVariation.length > 0 ? "textinputbox" : "danger"
                              }
                              handleInputChange={(e) => handleChangeCustomeVariation(e, i)}
                              value={sub.customVariation}
                            />
                          )}
                          {sub.id && (
                            <InputText
                              style={{
                                cursor: "no-drop",
                                backgroundColor: "var(--color-disable)",
                                pointerEvents: "none",
                              }}
                              className={"textinputbox"}
                              handleInputChange={() => {}}
                              value={sub.customVariation}
                            />
                          )}
                        </div>
                      )}
                      {productInstance.isColorVariation && (
                        <div
                          className="headerandinput"
                          style={{
                            minWidth: "auto",
                            maxWidth: "33%",
                            alignItems: /[\u0600-\u06FF\u0750-\u077F]/.test(t(LanguageKey.color))
                              ? "flex-end"
                              : "center", // بررسی فارسی بودن متن
                          }}>
                          <div
                            className="headertext"
                            style={{
                              color: "var(--color-light-blue)",
                              width: "calc(100% - 20px)",
                              maxWidth: "100%",
                              justifyContent: "start",
                            }}>
                            {t(LanguageKey.color)}
                          </div>
                          {sub.id && (
                            <InputText
                              style={{
                                cursor: "no-drop",
                                backgroundColor: "var(--color-disable)",
                                pointerEvents: "none",
                              }}
                              className={"textinputbox"}
                              handleInputChange={() => {}}
                              value={variation.colorCategories.find((x) => x.colorId === sub.colorId)!.langValue}
                            />
                          )}
                          {!sub.id && (
                            <DragDrop
                              data={specifyColorData()}
                              item={handleSelectColorIndex(sub.colorId)}
                              handleOptionSelect={(id) => handleColorSelect(id, i)}
                              dangerBorder={sub.colorId == 0}
                              isRefresh={refresh}
                            />
                          )}
                        </div>
                      )}
                      {sub.variations.map((vr) => {
                        const isRTL = (text: any) => /[\u0600-\u06FF\u0750-\u077F]/.test(text); // تشخیص حروف فارسی و عربی

                        const variationTitle = variation.variations.find((x) => x.id === vr.variationTitleId)?.title;

                        return (
                          <div
                            className="headerandinput"
                            style={{
                              minWidth: "auto",
                              maxWidth: "33%",
                            }}
                            key={vr.variationTitleId}>
                            <div
                              className="headertext"
                              style={{
                                color: "var(--color-light-blue)",
                                width: "auto",
                                maxWidth: "100%",
                                justifyContent: isRTL(variationTitle) ? "right" : "left",
                              }}>
                              {variationTitle}
                            </div>
                            {sub.id && (
                              <InputText
                                style={{
                                  cursor: "no-drop",
                                  backgroundColor: "var(--color-disable)",
                                  pointerEvents: "none",
                                }}
                                className={"textinputbox"}
                                handleInputChange={() => {}}
                                value={vr.langValue}
                              />
                            )}
                            {!sub.id && (
                              <DragDrop
                                data={specifyVariationData(vr.variationTitleId)}
                                item={handleSelectVariationIndex(vr.variationId, vr.variationTitleId)}
                                dangerBorder={vr.variationId === 0}
                                handleOptionSelect={(id) => handleVariationSelect(id, i, vr.variationTitleId)}
                                isRefresh={refresh}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.variationsetting}>
                      <div className={styles.variationsection}>
                        <div className="headerandinput">
                          <div className="headertext">{t(LanguageKey.Storeproduct_stock)}</div>
                          <InputText
                            name=""
                            className="textinputbox"
                            placeHolder="number"
                            handleInputChange={(e) => handleChangeStock(e, i)}
                            value={sub.stock.toString()}
                            numberType={true}
                          />
                        </div>
                        <div className="headerandinput">
                          <div className="headertext">{t(LanguageKey.Storeproduct_price)}</div>
                          <div className={styles.inputandsub}>
                            {/* <InputText
                              name=""
                              className={
                                sub.price === 0 ? "danger" : "textinputbox"
                              }
                              placeHolder={t(
                                LanguageKey.pageToolspopup_typehere
                              )}
                              handleInputChange={(e) => handleChangePrice(e, i)}
                              value={sub.price.toString()}
                              numberType={true}
                            /> */}
                            <InputText
                              name=""
                              className={sub.price === 0 && rawValue[i].price !== "" ? "danger" : "textinputbox"}
                              placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                              handleInputChange={(e) => handleChangePrice(e, i)}
                              handleInputBlur={(e) => handleBlur(e, i)}
                              handleInputonFocus={(e) => handleFocus(e, i)}
                              value={rawValue[i].price}
                              numberType={false}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={styles.variationsection}>
                        <div className="headerandinput">
                          <div className="headertext">{t(LanguageKey.product_Discount)}</div>
                          <div className={styles.variationsection}>
                            <DragDrop
                              data={[
                                <div id="0">{t(LanguageKey.deactive)}</div>,
                                <div id="1">{t(LanguageKey.active)}</div>,
                              ]}
                              handleOptionSelect={(id) => handleSelectDiscout(id, i)}
                              item={sub.disCount ? 1 : 0}
                              isRefresh={refresh}
                            />
                            <div
                              onClick={() => togglePopup(sub.disCount, i)}
                              className={`${styles.discountbtn} ${!sub.disCount && "fadeDiv"}`}>
                              <img src="/more-blue.svg" style={{ width: "25px" }} />
                              <span>{t(LanguageKey.sidebar_Setting)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.variationsection}>
                        <div className="headerandinput">
                          <div className="headertext">{t(LanguageKey.product_PricewithDiscount)}</div>
                          <div className={styles.variationsection}>
                            {sub.disCount && <span title="ℹ️ Discount Value">{`${sub.disCount.value}%`}</span>}
                            <span style={{ width: "100%" }}>
                              {sub.disCount
                                ? priceFormatter(shortProduct.priceType)((sub.price * (100 - sub.disCount.value)) / 100)
                                : priceFormatter(shortProduct.priceType)(sub.price)}
                            </span>
                            {sub.disCount?.maxTime && (
                              <Tooltip
                                tooltipValue={
                                  <div>
                                    <div>
                                      {sub.disCount.maxCount !== null
                                        ? sub.disCount.maxCount
                                        : t(LanguageKey.product_UNLIMITED)}
                                    </div>
                                    <div>{formatRemainingTime(sub.disCount.maxTime)}</div>
                                  </div>
                                }
                                position="top"
                                onClick={true}>
                                <span style={{ cursor: "pointer" }}>
                                  <svg width="25px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path
                                      d="M10 7.92v3.33l2.08 1.25M10 4.17a7.08 7.08 0 1 0 0 14.16 7.08 7.08 0 0 0 0-14.16m0 0v-2.5m-1.67 0h3.34m5.27 2.99-1.25-1.25.63.63m-13.26.62L4.3 3.41l-.63.63"
                                      stroke="var(--text-h2)"
                                      strokeWidth="1.5"
                                    />
                                  </svg>
                                </span>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className={styles.addnewvariation}>
            <button
              disabled={titleVariation.length === 0}
              onClick={AddNewSubproduct}
              className={`${styles.addnewbtn} ${titleVariation.length === 0 && "fadeDiv"}`}>
              <svg width="25" height="25" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 20">
                <path
                  d="M4.87 7.08a2.7 2.7 0 1 0 0-5.41 2.7 2.7 0 0 0 0 5.41m-.2 11.25a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m11.66 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
                  fill="var(--color-dark-blue)"
                />
                <path
                  opacity="0.6"
                  d="M16.47 13.32a5.8 5.8 0 0 0-5.45-3.88H11l-2.94.01a2.8 2.8 0 0 1-2.74-2.08V5.84a.63.63 0 0 0-.65-.63.63.63 0 0 0-.63.63v9.35c0 .35.28.63.63.63s.65-.28.65-.63V9.67a4 4 0 0 0 2.73 1.05h2.97a4.5 4.5 0 0 1 4.25 3.01.65.65 0 0 0 .81.4.64.64 0 0 0 .4-.81"
                  fill="var(--color-dark-blue)"
                />
              </svg>
              {t(LanguageKey.product_AddNewVariation)}
            </button>
            <span></span>
          </div>
        </div>
      )}
      {showDisCount && (
        <Discount
          data={selectedSubForDiscount!}
          removeMask={() => setShowDiscount(false)}
          saveDicount={handleSaveDicount}
        />
      )}

      {/* Add delete confirmation popup */}
      {deleteConfirmation && deleteConfirmation.show && (
        <div className="dialogBg" onClick={() => setDeleteConfirmation(null)}>
          <div className={styles.popupConfirmation}>
            <div className="headerandinput" style={{ alignItems: "center" }}>
              <svg fill="none" height="100px" viewBox="0 0 160 116">
                <path
                  fill="var(--color-dark-blue60)"
                  d="M153.3 38a6.7 6.7 0 1 1 0 13.4H115a6.7 6.7 0 1 1 0 13.4h21a6.7 6.7 0 1 1 0 13.4h-9.7c-4.7 0-8.5 3-8.5 6.7q0 3.7 5.8 6.7a6.7 6.7 0 1 1 0 13.4H44a6.7 6.7 0 1 1 0-13.4H6.7a6.7 6.7 0 1 1 0-13.4H45a6.7 6.7 0 1 0 0-13.4H21a6.7 6.7 0 1 1 0-13.4h38.4a6.7 6.7 0 1 1 0-13.4zm0 26.8a6.7 6.7 0 1 1 0 13.4 6.7 6.7 0 0 1 0-13.4"
                />
                <path fill="var(--background-root)" d="M82.5 110a41.5 41.5 0 1 0 0-83 41.5 41.5 0 0 0 0 83" />
                <path stroke="var(--color-dark-blue60)" strokeWidth="2" d="M111 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path
                  fill="var(--color-dark-blue60)"
                  d="M141 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M39 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
                />
                <path
                  fill="var(--color-dark-blue)"
                  d="M122.6 8q2-.1 3.8 1 2 1 2.5 3.3a4 4 0 0 1-1 3.7l-2.4 2.2-.7.6q-.7.7-.7 1.7-.2 1.2-1.4 1.4c-1.3.3-2.4-.5-2.4-1.7q-.1-1.6.7-2.8l1.5-1.7 1.7-1.5q.8-.6.4-1.7-.5-1-1.5-1H122q-.9 0-1.3.9l-.6 1.3q-.2.7-.8 1.2c-.7.5-2 .4-2.6-.2q-1-1-.6-2.4a6 6 0 0 1 3-3.5q1.8-.8 3.5-.8m0 1q-1.8-.1-3.5 1-1.5 1-2 2.6v1q0 .7 1 .7a1 1 0 0 0 .9-.5l.1-.3.5-1.2q.5-1.4 2.2-1.8 1.5-.2 3 .6 1 1 .8 2.6-.3.9-1 1.6l-2.2 1.9q-1.3 1.2-1.2 3 0 .5.5.7 1 .5 1.4-.6.3-1.6 1.6-2.7l2.2-2a3.4 3.4 0 0 0 .8-3.9q-.4-1.2-1.6-1.9-1.5-.9-3.4-.9M124 25a2 2 0 0 1-2 2c-1 0-2-.8-2-2s1-2 2-2a2 2 0 0 1 2 2m-1 0a1 1 0 0 0-1-1.1q-1 .1-1 1 0 1.2 1 1.2t1-1M24.6 25q2-.1 3.8 1 2 1 2.5 3.3a4 4 0 0 1-1 3.7l-2.4 2.2-.7.6q-.7.7-.7 1.7-.3 1.2-1.4 1.5c-1.3.2-2.4-.6-2.4-1.8q-.1-1.5.7-2.8l1.5-1.7 1.7-1.5q.8-.6.4-1.7-.4-1-1.5-1H24q-.9 0-1.3.9l-.6 1.3q-.2.7-.8 1.2c-.7.5-2 .4-2.6-.2q-1-1-.6-2.4a6 6 0 0 1 3-3.5q1.8-.9 3.5-.8m0 1q-1.8-.1-3.5 1-1.5 1-2 2.6v1q0 .6 1 .7a1 1 0 0 0 .9-.5l.1-.3.5-1.2q.5-1.4 2.2-1.8 1.5-.2 3 .6 1 1 .8 2.6-.3.9-1 1.6l-2.2 1.9q-1.3 1.2-1.2 3 0 .5.5.7 1 .5 1.4-.6.3-1.6 1.6-2.7l2.2-2a3.4 3.4 0 0 0 .8-3.9q-.4-1.2-1.6-1.9-1.5-.9-3.4-.9M26 42a2 2 0 0 1-2 2c-1 0-2-.8-2-2s1-2 2-2a2 2 0 0 1 2 2m-1 0a1 1 0 0 0-1-1.1q-1 .1-1 1 0 1.2 1 1.2t1-1M83.8 38q5.2-.1 9.6 2.3 5.2 3 6.4 8.7 1 5.5-2.7 9.5-2.9 3-6.1 5.8l-1.6 1.5C88.2 67 88 68.6 87.6 70q-.6 3.2-3.6 4c-3.3.7-6-1.4-6.2-4.6q-.1-4 1.8-7.1 1.6-2.5 4-4.3 2.2-1.9 4.2-3.9 2-1.9 1-4.3-1-2.5-3.7-2.9h-2.9q-2.2.4-3.3 2.4l-1.5 3.4a7 7 0 0 1-2 3 5.4 5.4 0 0 1-6.6-.2c-2-1.9-2-4-1.4-6.3q1.8-6.2 7.7-9.1a18 18 0 0 1 8.7-2m.1 2.4q-5-.1-9 2.6-4.1 2.5-5.2 7a5 5 0 0 0 0 2.2q.4 1.8 2.4 2 1.6 0 2.4-1.3l.4-.9 1.2-2.9c1.2-2.4 2.8-4.2 5.7-4.7 2.6-.4 5.2-.2 7.3 1.7q3.1 2.6 2.3 6.4a8 8 0 0 1-2.8 4.2l-5.3 4.9a9 9 0 0 0-3 7.7q0 1.3 1.3 2c1.3.5 3.2.4 3.5-1.7a11 11 0 0 1 4-7q2.9-2.4 5.5-4.9a9 9 0 0 0 2.2-10 10 10 0 0 0-4.1-5 16 16 0 0 0-8.8-2.3"
                />
                <path
                  fill="var(--color-dark-blue)"
                  d="m127 55.8.1-.3.7 2.5a47 47 0 0 1-9.1 39.8q-.9.9-1.7.3t0-1.7q1.6-2 3-4.2a45 45 0 0 0-1.3-49 44.3 44.3 0 1 0-15.6 64.6l1-.6q1-.3 1.5.6a1 1 0 0 1-.5 1.4q-3 1.8-6.4 2.9l-6 1.8a47 47 0 0 1-48.9-19.6l-2.7-4.8a40 40 0 0 1-5-18.2 48 48 0 0 1 1-13.3 43 43 0 0 1 11.5-21.5 46 46 0 0 1 43-13.6A47 47 0 0 1 127 54.7zM88 85c0 2.9-2.1 5-5 5-2.7 0-5-2-5-5s2.4-5 5-5c2.9 0 5 2 5 5m-2.3 0c0-1.5-1-2.7-2.5-2.7a3 3 0 0 0-3 2.6c0 2 1.4 2.8 2.8 2.8s2.8-.8 2.7-2.6m22.5 22.9q-1 0-1.1-.8t.4-1.4l2.4-2 4.1-4.3q1-1 1.7-.2t0 1.9q-3.1 3.8-7 6.6z"
                />
              </svg>
            </div>

            <div className="headerandinput" style={{ alignItems: "center" }}>
              <div className="title"> {t(LanguageKey.areyousure)}</div>

              <div className={`explain translate`}>{t(LanguageKey.product_deleteproductexplain)}</div>
            </div>

            {/* Removed the checkbox UI element */}
            <div className="ButtonContainer">
              <button
                className="stopButton"
                onClick={() => {
                  if (deleteConfirmation) {
                    handleDeleteSubProduct(deleteConfirmation.index, deleteConfirmation.id);
                    setDeleteConfirmation(null);
                  }
                }}>
                {t(LanguageKey.delete)}
              </button>
              <button className="cancelButton" onClick={() => setDeleteConfirmation(null)}>
                {t(LanguageKey.cancel)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default IntanceVariation;
