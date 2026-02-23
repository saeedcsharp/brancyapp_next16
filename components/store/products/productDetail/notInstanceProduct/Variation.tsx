import { useSession } from "next-auth/react";
import { ChangeEvent, CSSProperties, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import InputText from "brancy/components/design/inputText";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import priceFormatter from "brancy/helper/priceFormater";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import {
  ICreateInstance_ForVariation,
  IDisCount,
  IDiscount_ForClient,
  IGetSuggestedPrice,
  IProduct_ShortProduct,
  IProduct_Variation,
  ISubProduct_Create,
  IVariation_Create,
} from "brancy/models/store/IProduct";
import Discount from "brancy/components/store/products/productDetail/notInstanceProduct/popups/discount";
import NewVariation from "brancy/components/store/products/productDetail/notInstanceProduct/popups/newVariation";
import styles from "brancy/components/store/products/productDetail/notInstanceProduct/Variation.module.css";
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
function Variation({
  createInstanceInfo,
  subProductsCreate,
  categoryId,
  upadteCteateFromVariation,
  toggleNext,
  shortProduct,
}: {
  createInstanceInfo: ICreateInstance_ForVariation;
  subProductsCreate: ISubProduct_Create[];
  categoryId: number;
  toggleNext: { toggle: boolean; isNext: boolean };
  upadteCteateFromVariation: (
    createInstanceForVariation: ICreateInstance_ForVariation,
    variation: IProduct_Variation,
    subProducts: ISubProduct_Create[],
    isNext: boolean
  ) => void;
  shortProduct: IProduct_ShortProduct;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [createInstance, setCreateInstance] = useState(createInstanceInfo);
  const [showDisCount, setShowDiscount] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [addnew, setAddnew] = useState<IAddNewVariation>({
    val1: null,
    val2: null,
    val3: null,
  });
  const [subProducts, setSubProducts] = useState<ISubProduct_Create[]>(
    subProductsCreate.length > 0
      ? subProductsCreate
      : [
          {
            colorVariation: null,
            customVariation: null,
            disCount: null,
            price: 0,
            stock: 0,
            variations: createInstance.variationTitles.map((x) => ({
              variationId: 0,
              variationTitleId: x,
            })),
          },
        ]
  );
  const [customeTitleVar, setCustomeTitleVar] = useState<string | null>(createInstance.customTitleVariation);
  const [variation, setVariation] = useState<IProduct_Variation>({
    colorCategories: [],
    variations: [],
  });
  const [addNewId, setAddNewId] = useState(4);
  const [ShowAddNew, setShowAddNew] = useState(false);
  const [hasVariation, setHasVariation] = useState(false);
  const [hasColor, setHasColor] = useState(false);
  const [hasCustome, setHasCustome] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [repeatedSub, setRepeatedSub] = useState<number[][]>([]);
  const [selectedSubForDiscount, setSelectedSubForDiscount] = useState<IDiscount_ForClient | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestedPriceV2, setSuggestedPriceV2] = useState<IGetSuggestedPrice | null>(null);
  const [pricePopupStates, setPricePopupStates] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    setPricePopupStates((prev) => {
      const newState = { ...prev };
      subProducts.forEach((_, i) => {
        if (newState[i] === undefined) newState[i] = false;
      });
      return newState;
    });
  }, [subProducts]);

  function togglePricePopup(index: number) {
    setPricePopupStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-price-popup]")) {
        setPricePopupStates({});
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function InitilaizedAddNew() {
    console.log("subProducts", subProducts);
    if (
      !createInstance.customTitleVariation &&
      !createInstance.isColorVariation &&
      createInstance.variationTitles.length === 0
    )
      return;
    if (createInstance.variationTitles.length >= 1) setHasVariation(true);
    if (createInstance.customTitleVariation && createInstance.isColorVariation) {
      setAddnew({
        val1: {
          variationTitleId: null,
          color: false,
          customeTitle: createInstance.customTitleVariation,
        },
        val2: {
          color: true,
          customeTitle: null,
          variationTitleId: null,
        },
        val3:
          createInstance.variationTitles.length === 1
            ? {
                color: false,
                customeTitle: null,
                variationTitleId: createInstance.variationTitles[0],
              }
            : null,
      });
      setHasColor(true);
      setHasCustome(true);
    } else if (createInstance.customTitleVariation && !createInstance.isColorVariation) {
      setAddnew({
        val1: {
          variationTitleId: null,
          color: false,
          customeTitle: createInstance.customTitleVariation,
        },
        val2:
          createInstance.variationTitles.length >= 1
            ? {
                color: false,
                customeTitle: null,
                variationTitleId: createInstance.variationTitles[0],
              }
            : null,
        val3:
          createInstance.variationTitles.length === 2
            ? {
                color: false,
                customeTitle: null,
                variationTitleId: createInstance.variationTitles[1],
              }
            : null,
      });
      setHasCustome(true);
    } else if (!createInstance.customTitleVariation && createInstance.isColorVariation) {
      setAddnew({
        val1: {
          variationTitleId: null,
          color: true,
          customeTitle: null,
        },
        val2:
          createInstance.variationTitles.length >= 1
            ? {
                color: false,
                customeTitle: null,
                variationTitleId: createInstance.variationTitles[0],
              }
            : null,
        val3:
          createInstance.variationTitles.length === 2
            ? {
                color: false,
                customeTitle: null,
                variationTitleId: createInstance.variationTitles[1],
              }
            : null,
      });
      setHasColor(true);
    } else if (!createInstance.customTitleVariation && !createInstance.isColorVariation) {
      setAddnew({
        val1:
          createInstance.variationTitles.length >= 1
            ? {
                color: false,
                customeTitle: null,
                variationTitleId: createInstance.variationTitles[0],
              }
            : null,
        val2:
          createInstance.variationTitles.length >= 2
            ? {
                color: false,
                customeTitle: null,
                variationTitleId: createInstance.variationTitles[1],
              }
            : null,
        val3:
          createInstance.variationTitles.length === 3
            ? {
                color: false,
                customeTitle: null,
                variationTitleId: createInstance.variationTitles[2],
              }
            : null,
      });
    }
  }
  function specifyTitle(val: INewVariation) {
    var title = "";
    if (val.variationTitleId) {
      title = variation.variations.find((x) => x.id === val.variationTitleId)!.title;
    } else if (val.customeTitle) {
      title = val.customeTitle;
    } else if (val.color) title = t(LanguageKey.color);
    return title;
  }
  function specifyTitleList(val: INewVariation) {
    var list: string[] = [];
    if (val.variationTitleId) {
      list = variation.variations.find((x) => x.id === val.variationTitleId)!.variations.map((c) => c.langValue + ", ");
    } else if (val.color) list = variation.colorCategories.map((x) => x.langValue + ", ");
    return list;
  }
  function togglePopup(dis: IDisCount | null, index: number) {
    if (!dis) return;
    setSelectedSubForDiscount({
      index: index,
      maxCount: dis.maxCount,
      maxTime: dis.maxTime,
      value: dis.value,
    });
    setSelectedIndex(index);
    setShowDiscount(true);
  }
  function handleColorSelect(id: any, index: number) {
    setSubProducts((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, colorVariation: parseInt(id) })));
  }
  function handleVariationSelect(id: any, index: number, variationTitleId: number) {
    setSubProducts((prev) =>
      prev.map((x) =>
        prev.indexOf(x) !== index
          ? x
          : {
              ...x,
              variations: x.variations.map((c) =>
                c.variationTitleId !== variationTitleId ? c : { ...c, variationId: parseInt(id) }
              ),
            }
      )
    );
  }
  function handleSelectDiscout(id: any, index: number) {
    setSubProducts((prev) =>
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
            }
      )
    );
  }
  const compareVariations = (a: IVariation_Create[], b: IVariation_Create[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((variationA, index) => {
      const variationB = b[index];
      return (
        variationA.variationTitleId === variationB.variationTitleId && variationA.variationId === variationB.variationId
      );
    });
  };
  const findGroupedIndices = (arr: ISubProduct_Create[]): number[][] => {
    const groupedIndices: number[][] = [];
    const visited: boolean[] = new Array(arr.length).fill(false); // To track visited objects

    for (let i = 0; i < arr.length; i++) {
      if (visited[i]) continue; // Skip if already part of a group

      const currentGroup: number[] = [i]; // Start a new group with the current index
      visited[i] = true;

      for (let j = i + 1; j < arr.length; j++) {
        if (
          arr[i].customVariation === arr[j].customVariation &&
          arr[i].colorVariation === arr[j].colorVariation &&
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
  function handleChangeCustomeVariation(e: ChangeEvent<HTMLInputElement>, index: number) {
    setSubProducts((prev) =>
      prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, customVariation: e.target.value }))
    );
  }
  function handleChangeStock(e: ChangeEvent<HTMLInputElement>, index: number) {
    var stock = e.target.value;
    if (stock === "" || parseInt(stock) < 0) stock = "0";
    setSubProducts((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, stock: parseInt(stock) })));
  }
  // const formatter = new Intl.NumberFormat(
  //   shortProduct.priceType === PriceType.Dollar ? "en-US" : "en-IR",
  //   {
  //     // style: "currency",
  //     // currency: type === "USD" ? "USD" : "IRR",
  //     minimumFractionDigits:
  //       shortProduct.priceType === PriceType.Dollar ? 2 : 0,
  //     maximumFractionDigits:
  //       shortProduct.priceType === PriceType.Dollar ? 2 : 0,
  //   }
  // );
  const [rawValue, setRawValue] = useState<{ price: string; index: number }[]>(
    subProductsCreate.length > 0
      ? subProductsCreate.map((x) => ({
          index: subProductsCreate.indexOf(x),
          price: priceFormatter(shortProduct.priceType)(x.price),
        }))
      : [
          {
            price: "0",
            index: 0,
          },
        ]
  ); // Raw input value
  const handleChangePrice = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^\d.]/g, ""); // Remove non-numeric chars

    // Update rawValue even if the input is empty
    setRawValue((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, price: value })));

    if (value === "") {
      // If input is empty, set price to 0 but don't format it yet
      setSubProducts((prev) =>
        prev.map((x) =>
          prev.indexOf(x) !== index
            ? x
            : {
                ...x,
                price: 0,
              }
        )
      );
    } else {
      const numericValue = parseFloat(value); // Parse to number
      if (!isNaN(numericValue)) {
        setSubProducts((prev) =>
          prev.map((x) =>
            prev.indexOf(x) !== index
              ? x
              : {
                  ...x,
                  price: numericValue,
                }
          )
        );
      }
    }
  };
  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = subProducts[index].price;
    setRawValue((prev) =>
      prev.map((x) =>
        prev.indexOf(x) !== index
          ? x
          : {
              ...x,
              price: priceFormatter(shortProduct.priceType)(value),
            }
      )
    ); // Format the price on blur
  };
  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = subProducts[index].price;
    setRawValue((prev) => prev.map((x) => (prev.indexOf(x) !== index ? x : { ...x, price: value.toString() }))); // Show raw number on focus
  };
  async function fetchData() {
    try {
      const res = await clientFetchApi<boolean, IProduct_Variation>("shopper" + "" + "/Product/GetVariations", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "categoryId", value: categoryId.toString() },
          { key: "language", value: "1" },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setVariation(res.value);
        InitilaizedAddNew();
        setLoading(false);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
    try {
      const res = await clientFetchApi<boolean, IGetSuggestedPrice>("shopper" + "" + "/Product/GetSuggestedPriceV2", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "productId", value: shortProduct.productId.toString() }], onUploadProgress: undefined });
      if (res.succeeded) {
        setSuggestedPriceV2(res.value);
        console.log("suggestedPriceV2", res.value);
      } else if (res.info.responseType === ResponseType.NotSavedSuggestions) {
        setSuggestedPriceV2(null);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleClickAddNew(id: number) {
    setAddNewId(id);
    setShowAddNew(true);
  }
  function saveNewVariation(addNewObj: INewVariation, index: number) {
    setAddnew((prev) => ({ ...prev, [`val${index}`]: addNewObj }));
    if (addNewObj.color) setHasColor(true);
    if (addNewObj.customeTitle) setHasCustome(true);

    if (addNewObj.variationTitleId) setHasVariation(true);
    setCreateInstance((prev) => {
      let newObj = prev;
      if (addNewObj.color) {
        newObj.isColorVariation = true;
      } else if (addNewObj.customeTitle) {
        newObj.customTitleVariation = addNewObj.customeTitle;
        setCustomeTitleVar(addNewObj.customeTitle);
      } else if (addNewObj.variationTitleId) {
        newObj.variationTitles.push(addNewObj.variationTitleId);
        let uniqueNumbers = newObj.variationTitles.filter((value, index, arr) => arr.indexOf(value) === index);
        newObj.variationTitles = uniqueNumbers;
      }
      return newObj;
    });
    let newArray = [...subProducts];
    for (let p of newArray) {
      if (addNewObj.variationTitleId) {
        p.variations.push({
          variationId: 0,
          variationTitleId: addNewObj.variationTitleId,
        });
      } else if (addNewObj.color) {
        p.colorVariation = null;
      } else if (addNewObj.customeTitle) {
        p.customVariation = null;
      }
    }
    setSubProducts(newArray);
    setShowAddNew(false);
  }
  function specifyVariationData(variationTitleId: number) {
    const data = variation.variations
      .find((x) => x.id === variationTitleId)!
      ?.variations.map((svr) => <div id={svr.variationId.toString()}>{svr.langValue}</div>);
    data.unshift(
      // <div id="0">Not Set</div>
      <div className={styles.namesection} id="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>
    );
    return data;
  }
  function specifyColorData() {
    const data = variation.colorCategories.map((c) => <div id={c.colorId.toString()}>{c.langValue}</div>);
    data.unshift(
      // <div id="0">Not Set</div>
      <div className={styles.namesection} id="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>
    );
    return data;
  }
  function AddNewSubproduct() {
    let newArray = [...subProducts];
    newArray.push({
      colorVariation: null,
      customVariation: null,
      disCount: null,
      price: 0,
      stock: 0,
      variations: createInstance.variationTitles.map((x) => ({
        variationId: 0,
        variationTitleId: x,
      })),
    });
    setRawValue((prev) => [
      ...prev,
      {
        index: prev.length,
        price: "0",
      },
    ]);
    setSubProducts(newArray);
  }
  function handleSelectVariationIndex(variationId: number, variationTitleId: number) {
    var index = 0;
    const varIndex = variation.variations
      .find((x) => x.id === variationTitleId)
      ?.variations.findIndex((x) => x.variationId === variationId);
    if (varIndex) index = varIndex;
    return index + 1;
  }
  function handleSelectColorIndex(colorId: number | null) {
    if (!colorId) return 0;
    const varIndex = variation.colorCategories.findIndex((x) => x.colorId === colorId);
    return varIndex + 1;
  }
  function handleDeleteSubProduct(index: number) {
    // if (subProducts.length === 2)
    //   setSubProducts([
    //     {
    //       colorVariation: null,
    //       customVariation: null,
    //       disCount: null,
    //       price: 0,
    //       stock: 0,
    //       variations: createInstance.variationTitles.map((x) => ({
    //         variationId: 0,
    //         variationTitleId: x,
    //       })),
    //     },
    //   ]);
    // setRefresh(!refresh);
    setSubProducts((prev) => prev.filter((x) => prev.indexOf(x) !== index));
    setRawValue((prev) => prev.filter((x) => prev.indexOf(x) !== index));
    setRepeatedSub((prev) => prev.map((x) => (!x.find((c) => c === index) ? x : x.filter((m) => m !== index))));
  }
  function handleDeleteVariation(newVariation: INewVariation, val: string) {
    setAddnew((prev) => ({ ...prev, [val]: null }));
    const array = [addnew.val1 && addnew.val2, addnew.val1 && addnew.val3, addnew.val2 && addnew.val3];

    if (newVariation.color) {
      setSubProducts((prev) => prev.map((x) => ({ ...x, colorVariation: null })));
      setCreateInstance((prev) => ({ ...prev, isColorVariation: null }));
      setHasColor(false);
    } else if (newVariation.variationTitleId) {
      if (createInstance.variationTitles.length === 1) setHasVariation(false);
      setSubProducts((prev) =>
        prev.map((x) => ({
          ...x,
          variations: x.variations.filter((c) => c.variationTitleId !== newVariation.variationTitleId),
        }))
      );
      setCreateInstance((prev) => ({
        ...prev,
        variationTitles: prev.variationTitles.filter((x) => x !== newVariation.variationTitleId),
      }));
    } else if (newVariation.customeTitle) {
      setSubProducts((prev) => prev.map((x) => ({ ...x, customVariation: null })));
      setCreateInstance((prev) => ({ ...prev, customTitleVariation: null }));
      setHasCustome(false);
    }
    if (!array[0] && !array[2] && !array[3]) {
      setRefresh(!refresh);
      setSubProducts((prev) => prev.splice(0, 1));
    }
  }
  function handleRedBorder(index: number) {
    let style: CSSProperties = {};
    for (let re of repeatedSub) {
      if (re.includes(index)) style = { border: "1px solid var(--color-dark-red)" };
    }
    return style;
  }
  function handleSaveDicount(dis: IDiscount_ForClient) {
    setSubProducts((prev) =>
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
            }
      )
    );
    setShowDiscount(false);
  }
  useEffect(() => {
    if (loading) {
      fetchData();
      return;
    }
    upadteCteateFromVariation(createInstance, variation, subProducts, toggleNext.isNext);
  }, [toggleNext.toggle]);
  useEffect(() => {
    const indc = findGroupedIndices(subProducts);
    if (indc.length > 0) {
      setRepeatedSub(indc);
      return;
    } else setRepeatedSub([]);
  }, [subProducts]);

  const [showPricePopup, setShowPricePopup] = useState<boolean>(false);
  const [openDiscountTooltip, setOpenDiscountTooltip] = useState<number | null>(null);
  const discountTooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (discountTooltipRef.current && !discountTooltipRef.current.contains(event.target as Node)) {
        setOpenDiscountTooltip(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        `${remainingHours} ${t(remainingHours > 1 ? LanguageKey.countdown_Hours : LanguageKey.countdown_Hours)}`
      ); // "hour(s)"
    }
    if (days === 0 && remainingHours === 0 && remainingMinutes > 0) {
      parts.push(
        `${remainingMinutes} ${t(remainingMinutes > 1 ? LanguageKey.countdown_Minutes : LanguageKey.countdown_Minutes)}`
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
              {addnew.val1 ? (
                <>
                  <button onClick={() => handleDeleteVariation(addnew.val1!, "val1")} className={styles.exitedproperty}>
                    <div className="frameParent" title="ℹ️ Delete Property">
                      {specifyTitle(addnew.val1)}
                      <img
                        style={{
                          cursor: "pointer",
                          width: "20px",
                          height: "20px",
                        }}
                        title="ℹ️ delete Variation"
                        src="/delete.svg"
                      />
                    </div>
                    <div className={styles.variationexplain}>{specifyTitleList(addnew.val1)}</div>
                  </button>
                </>
              ) : (
                <button onClick={() => handleClickAddNew(1)} className={styles.addnewproperty}>
                  <div className="frameParent">
                    {t(LanguageKey.product_AddNewproperty)}
                    <img
                      style={{
                        cursor: "pointer",
                        width: "25px",
                        height: "25px",
                      }}
                      title="ℹ️ Add new Variation"
                      src="/icon-plus2.svg"
                    />
                  </div>
                  <div className="explain">{t(LanguageKey.product_Nopropertyisset)}</div>
                </button>
              )}
              {addnew.val2 ? (
                <>
                  <button onClick={() => handleDeleteVariation(addnew.val2!, "val2")} className={styles.exitedproperty}>
                    <div className="frameParent" title="ℹ️ Delete Property">
                      {specifyTitle(addnew.val2)}
                      <img
                        style={{
                          cursor: "pointer",
                          width: "20px",
                          height: "20px",
                        }}
                        title="ℹ️ delete Variation"
                        src="/delete.svg"
                      />
                    </div>
                    <div className={styles.variationexplain}>{specifyTitleList(addnew.val2)}</div>
                  </button>
                </>
              ) : (
                <button onClick={() => handleClickAddNew(2)} className={styles.addnewproperty}>
                  <div className="frameParent">
                    {t(LanguageKey.product_AddNewproperty)}
                    <img
                      style={{
                        cursor: "pointer",
                        width: "25px",
                        height: "25px",
                      }}
                      title="ℹ️ Add new Variation"
                      src="/icon-plus2.svg"
                    />
                  </div>
                  <div className="explain">{t(LanguageKey.product_Nopropertyisset)}</div>
                </button>
              )}
              {addnew.val3 ? (
                <>
                  <button onClick={() => handleDeleteVariation(addnew.val3!, "val3")} className={styles.exitedproperty}>
                    <div className="frameParent" title="ℹ️ Delete Property">
                      {specifyTitle(addnew.val3)}
                      <img
                        style={{
                          cursor: "pointer",
                          width: "20px",
                          height: "20px",
                        }}
                        title="ℹ️ delete Variation"
                        src="/delete.svg"
                      />
                    </div>
                    <div className={styles.variationexplain}>{specifyTitleList(addnew.val3)}</div>
                  </button>
                </>
              ) : (
                <button onClick={() => handleClickAddNew(3)} className={styles.addnewproperty}>
                  <div className="frameParent">
                    {t(LanguageKey.product_AddNewproperty)}
                    <img
                      style={{
                        cursor: "pointer",
                        width: "25px",
                        height: "25px",
                      }}
                      title="ℹ️ Add new Variation"
                      src="/icon-plus2.svg"
                    />
                  </div>
                  <div className="explain">{t(LanguageKey.product_Nopropertyisset)}</div>
                </button>
              )}
            </div>
          </div>
          {subProducts.map((sub, i) => (
            <div className={styles.variationparent} key={i}>
              <div className="headerandinput">
                <div className="frameParent" style={{ paddingInline: "10px" }}>
                  <div className="title">
                    {t(LanguageKey.product_Variation)} {`${i + 1}`}
                  </div>
                  {i > 0 && ( // شرط برای نمایش حذف از آیتم دوم به بعد
                    <img
                      title="delete variation"
                      onClick={() => handleDeleteSubProduct(i)}
                      className={styles.deletebtn}
                      src="/delete-red.svg"
                    />
                  )}
                </div>
                <div key={i} className={styles.variationlist} style={handleRedBorder(i)}>
                  <div className={styles.responsiveitem}>
                    <div className={styles.variationselection}>
                      {hasCustome && (
                        <div className="headerandinput">
                          <div
                            className="headertext"
                            style={{
                              color: "var(--color-light-blue)",
                              width: "auto",
                              maxWidth: "100%",
                              justifyContent:
                                customeTitleVar && /[\u0600-\u06FF\u0750-\u077F]/.test(customeTitleVar)
                                  ? "right"
                                  : "left",
                            }}>
                            {customeTitleVar}
                          </div>
                          <InputText
                            className={
                              sub.customVariation && sub.customVariation.length > 0 ? "textinputbox" : "danger"
                            }
                            handleInputChange={(e) => handleChangeCustomeVariation(e, i)}
                            value={sub.customVariation ? sub.customVariation : ""}
                          />
                        </div>
                      )}
                      {hasColor && (
                        <div className="headerandinput">
                          <div
                            className="headertext"
                            style={{
                              color: "var(--color-light-blue)",
                              width: "auto",
                              maxWidth: "100%",
                            }}>
                            {t(LanguageKey.color)}
                          </div>
                          <DragDrop
                            data={specifyColorData()}
                            item={handleSelectColorIndex(sub.colorVariation)}
                            handleOptionSelect={(id) => handleColorSelect(id, i)}
                            dangerBorder={!sub.colorVariation}
                            isRefresh={refresh}
                          />
                        </div>
                      )}

                      {hasVariation &&
                        sub.variations.map((vr) => {
                          const isRTL = (text: any) => /[\u0600-\u06FF\u0750-\u077F]/.test(text); // تشخیص حروف فارسی و عربی

                          const variationTitle = variation.variations.find((x) => x.id === vr.variationTitleId)?.title;

                          return (
                            <div className="headerandinput" key={vr.variationTitleId}>
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
                              <DragDrop
                                data={specifyVariationData(vr.variationTitleId)}
                                item={handleSelectVariationIndex(vr.variationId, vr.variationTitleId)}
                                dangerBorder={vr.variationId === 0}
                                handleOptionSelect={(id) => handleVariationSelect(id, i, vr.variationTitleId)}
                                isRefresh={refresh}
                              />
                            </div>
                          );
                        })}
                    </div>
                    <div className={styles.variationsetting}>
                      <div className={styles.variationarea}>
                        <div className={styles.stockheaderandinput}>
                          <div className="headertext">{t(LanguageKey.Storeproduct_stock)}</div>
                          <div className={styles.stocksection}>
                            <InputText
                              name=""
                              className="textinputbox"
                              placeHolder="number"
                              handleInputChange={(e) => handleChangeStock(e, i)}
                              value={sub.stock.toString()}
                              numberType={true}
                            />
                            <button
                              title="add 5 to stock"
                              className={styles.stockplus}
                              onClick={() =>
                                setSubProducts((prev) =>
                                  prev.map((x, idx) => (idx === i ? { ...x, stock: x.stock + 5 } : x))
                                )
                              }>
                              +5
                            </button>
                            <button
                              title="add 10 to stock"
                              className={styles.stockplus}
                              onClick={() =>
                                setSubProducts((prev) =>
                                  prev.map((x, idx) => (idx === i ? { ...x, stock: x.stock + 10 } : x))
                                )
                              }>
                              +10
                            </button>
                            <button
                              title="add 50 to stock"
                              className={styles.stockplus}
                              onClick={() =>
                                setSubProducts((prev) =>
                                  prev.map((x, idx) => (idx === i ? { ...x, stock: x.stock + 50 } : x))
                                )
                              }>
                              +50
                            </button>
                          </div>
                        </div>

                        <div className={styles.priceheaderandinput}>
                          <div className="headertext">{t(LanguageKey.Storeproduct_price)}</div>

                          <div className={`${styles.pricesection} translate`}>
                            <div
                              className={`${styles.searchprice} ${pricePopupStates[i] ? styles.active : ""}`}
                              title="ℹ️ search price for today"
                              role="button"
                              aria-label="search price for today"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePricePopup(i);
                              }}
                              data-price-popup>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24">
                                <path
                                  opacity=".6"
                                  fill="var(--color-dark-blue)"
                                  d="M3.25 11.53c0-4.3 3.48-7.78 7.78-7.78a.97.97 0 0 1 0 1.94 5.83 5.83 0 1 0 5.83 5.84.97.97 0 0 1 1.95 0c0 1.8-.61 3.45-1.64 4.77l3.3 3.29a.97.97 0 0 1-1.38 1.38l-3.3-3.3a7.78 7.78 0 0 1-12.55-6.14"
                                />
                                <path
                                  fill="var(--color-dark-blue)"
                                  d="M15.5 2.75c.31 0 .6.2.7.49l.26.7c.36.98.48 1.24.67 1.43.19.2.45.3 1.43.67l.7.26a.75.75 0 0 1 0 1.4l-.7.26c-.98.36-1.24.48-1.43.67-.2.19-.3.45-.67 1.43l-.26.7a.75.75 0 0 1-1.4 0l-.26-.7c-.36-.98-.48-1.24-.67-1.43-.19-.2-.45-.3-1.43-.67l-.7-.26a.75.75 0 0 1 0-1.4l.7-.26c.98-.36 1.24-.48 1.43-.67.2-.19.3-.45.67-1.43l.26-.7c.1-.3.39-.49.7-.49"
                                />
                              </svg>
                              {pricePopupStates[i] && (
                                <div className={styles.pricePopup} data-price-popup>
                                  <div className="headerandinput">
                                    <div className="title">{t(LanguageKey.product_SuggestedPrice)}</div>
                                    <div className={styles.suggestedprice}>
                                      <div className={styles.pricePopupdetail}>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          color="#000"
                                          width="20"
                                          viewBox="0 0 24 24">
                                          <path
                                            d="M2.5 12c0-4.5 0-6.7 1.4-8.1S7.5 2.5 12 2.5s6.7 0 8.1 1.4 1.4 3.6 1.4 8.1 0 6.7-1.4 8.1-3.6 1.4-8.1 1.4-6.7 0-8.1-1.4-1.4-3.6-1.4-8.1Z"
                                            stroke="var(--color-gray)"
                                            strokeWidth="1.5"
                                            strokeLinejoin="round"
                                          />
                                          <path
                                            d="M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 0V7m3 8-2-2"
                                            stroke="var(--text-h2)"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        {t(LanguageKey.update)}
                                      </div>
                                      <span>{t(LanguageKey.advertisecalendar_TODAY)}</span>
                                    </div>
                                    <div className="explain"></div>
                                  </div>
                                  <div className="headerandinput">
                                    <div
                                      className={styles.suggestedprice}
                                      onClick={() => {
                                        setRawValue((prev) =>
                                          prev.map((x, idx) =>
                                            idx === i
                                              ? {
                                                  ...x,
                                                  price: priceFormatter(shortProduct.priceType)(
                                                    suggestedPriceV2?.minPrice || 0
                                                  ),
                                                }
                                              : x
                                          )
                                        );
                                        setSubProducts((prev) =>
                                          prev.map((x, idx) =>
                                            idx === i
                                              ? {
                                                  ...x,
                                                  price: suggestedPriceV2?.minPrice || 0,
                                                }
                                              : x
                                          )
                                        );
                                      }}>
                                      <div className={styles.pricePopupdetail}>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          color="#000"
                                          width="20"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          viewBox="0 0 24 24">
                                          <path
                                            d="M8 3c0 6.075 2.686 11 6 11s6-4.925 6-11 M21 21H10c-3.3 0-4.95 0-5.975-1.025S3 17.3 3 14V3"
                                            stroke="var(--color-gray)"
                                            strokeWidth="1.5"
                                          />
                                          <path
                                            d="M6 17h.009m2.99 0h.008m2.99 0h.008m2.99 0h.009m2.989 0h.009m2.989 0H21"
                                            stroke="var(--text-h1)"
                                            strokeWidth="2"
                                          />
                                        </svg>
                                        {t(LanguageKey.product_MinimumPrice)}
                                      </div>
                                      <span>
                                        {priceFormatter(shortProduct.priceType)(suggestedPriceV2?.minPrice || 0)}
                                      </span>
                                    </div>

                                    <div
                                      className={styles.suggestedprice}
                                      onClick={() => {
                                        setRawValue((prev) =>
                                          prev.map((x, idx) =>
                                            idx === i
                                              ? {
                                                  ...x,
                                                  price: priceFormatter(shortProduct.priceType)(
                                                    suggestedPriceV2?.averagePrice || 0
                                                  ),
                                                }
                                              : x
                                          )
                                        );
                                        setSubProducts((prev) =>
                                          prev.map((x, idx) =>
                                            idx === i
                                              ? {
                                                  ...x,
                                                  price: suggestedPriceV2?.averagePrice || 0,
                                                }
                                              : x
                                          )
                                        );
                                      }}>
                                      <div className={styles.pricePopupdetail}>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          color="#000"
                                          width="20"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          viewBox="0 0 24 24">
                                          <path
                                            d="M6 7c.673-1.122 1.587-2 2.993-2 5.943 0 2.602 12 8.989 12 1.416 0 2.324-.884 3.018-2 M21 21H10c-3.3 0-4.95 0-5.975-1.025S3 17.3 3 14V3"
                                            stroke="var(--color-gray)"
                                            strokeWidth="1.5"
                                          />
                                          <path
                                            d="M6 12h.009m2.99 0h.008m2.99 0h.008m2.99 0h.009m2.989 0h.009m2.989 0H21"
                                            stroke="var(--text-h1)"
                                            strokeWidth="2"
                                          />
                                        </svg>
                                        {t(LanguageKey.product_AveragePrice)}
                                      </div>
                                      <span>
                                        {priceFormatter(shortProduct.priceType)(suggestedPriceV2?.averagePrice || 0)}
                                      </span>
                                    </div>

                                    <div
                                      className={styles.suggestedprice}
                                      onClick={() => {
                                        setRawValue((prev) =>
                                          prev.map((x, idx) =>
                                            idx === i
                                              ? {
                                                  ...x,
                                                  price: priceFormatter(shortProduct.priceType)(
                                                    suggestedPriceV2?.maxPrice || 0
                                                  ),
                                                }
                                              : x
                                          )
                                        );
                                        setSubProducts((prev) =>
                                          prev.map((x, idx) =>
                                            idx === i
                                              ? {
                                                  ...x,
                                                  price: suggestedPriceV2?.maxPrice || 0,
                                                }
                                              : x
                                          )
                                        );
                                      }}>
                                      <div className={styles.pricePopupdetail}>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          color="#000"
                                          width="20"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          viewBox="0 0 24 24">
                                          <path
                                            d="M19 21c0-6.627-2.686-12-6-12s-6 5.373-6 12 M21 21H10c-3.3 0-4.95 0-5.975-1.025S3 17.3 3 14V3"
                                            stroke="var(--color-gray)"
                                            strokeWidth="1.5"
                                          />
                                          <path
                                            d="M6 6h.009m2.99 0h.008m2.99 0h.008m2.99 0h.009m2.989 0h.009m2.989 0H21"
                                            stroke="var(--text-h1)"
                                            strokeWidth="2"
                                          />
                                        </svg>
                                        {t(LanguageKey.product_MaximumPrice)}
                                      </div>
                                      <span>
                                        {priceFormatter(shortProduct.priceType)(suggestedPriceV2?.maxPrice || 0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
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
                      <div className={styles.variationarea}>
                        <div className={styles.discountheaderandinput}>
                          <div className="headertext">{t(LanguageKey.product_Discount)}</div>
                          <div className={styles.discountsection}>
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
                              <img title="setting" alt="setting" src="/more-blue.svg" style={{ width: "25px" }} />
                              <span>{t(LanguageKey.sidebar_Setting)}</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.variationheaderandinput}>
                          <div className="headertext">{t(LanguageKey.product_PricewithDiscount)}</div>
                          <div className={styles.variationsection}>
                            {sub.disCount && <span title="ℹ️ Discount Value">{`${sub.disCount.value}%`}</span>}
                            <div className={styles.pricewithdiscount}>
                              {sub.disCount
                                ? priceFormatter(shortProduct.priceType)((sub.price * (100 - sub.disCount.value)) / 100)
                                : priceFormatter(shortProduct.priceType)(sub.price)}
                            </div>
                            {sub.disCount?.maxTime && (
                              <span
                                style={{ cursor: "pointer" }}
                                ref={discountTooltipRef}
                                onClick={() => setOpenDiscountTooltip(openDiscountTooltip === i ? null : i)}>
                                <svg width="25px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                  <path
                                    d="M10 7.92v3.33l2.08 1.25M10 4.17a7.08 7.08 0 1 0 0 14.16 7.08 7.08 0 0 0 0-14.16m0 0v-2.5m-1.67 0h3.34m5.27 2.99-1.25-1.25.63.63m-13.26.62L4.3 3.41l-.63.63"
                                    stroke="var(--text-h2)"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                                {openDiscountTooltip === i && (
                                  <div className={styles.tooltip}>
                                    <div>
                                      {sub.disCount.maxCount !== null
                                        ? sub.disCount.maxCount
                                        : t(LanguageKey.product_UNLIMITED)}
                                    </div>
                                    <div>{formatRemainingTime(sub.disCount.maxTime)}</div>
                                  </div>
                                )}
                              </span>
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
              disabled={!addnew.val1 && !addnew.val2 && !addnew.val3}
              onClick={AddNewSubproduct}
              className={`${styles.addnewbtn} ${!addnew.val1 && !addnew.val2 && !addnew.val3 && "fadeDiv"}`}>
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
      {ShowAddNew && (
        <NewVariation
          createInstance={createInstance}
          addNewObj={addnew}
          variation={variation}
          addNewId={addNewId}
          removeMask={() => setShowAddNew(false)}
          saveNewVariation={saveNewVariation}
        />
      )}
      {showDisCount && (
        <Discount
          data={selectedSubForDiscount!}
          removeMask={() => setShowDiscount(false)}
          saveDicount={handleSaveDicount}
        />
      )}
    </>
  );
}

export default Variation;
