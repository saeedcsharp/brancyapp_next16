import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "saeed/components/design/dragDrop/dragDrop";
import InputText from "saeed/components/design/inputText";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import {
  IGeneralInfo,
  ILastCategory,
  IProduct_MainCategory,
  IProduct_SecondaryCategory,
  ISuggestedPrice,
} from "saeed/models/store/IProduct";
import styles from "./general.module.css";
function General({
  productId,
  suggestedPrice,
  info,
  toggleNext,
  upadteCteateFromgeneral,
}: {
  productId: number;
  suggestedPrice: ISuggestedPrice[];
  info: IGeneralInfo | null;
  toggleNext: boolean;
  upadteCteateFromgeneral: (general: IGeneralInfo) => void;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();
  const initialMainCategoryElements = useMemo(
    () => [
      <div id="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>,
    ],
    [t]
  );
  const [mainCategoryElements, setmainCategoryElements] = useState([
    { element: initialMainCategoryElements, selectIndex: 0 },
  ]);
  const initialBrandCategoryElement = useMemo(
    () => (
      <div id="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>
    ),
    [t]
  );
  const [brandCategoryElements, setBrandCategoryElements] = useState({
    element: [initialBrandCategoryElement],
    selectIndex: 0,
  });
  const initialDependentElement = useMemo(
    () => (
      <div id="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>
    ),
    [t]
  );
  const [dependentCategoryElements, setDependentCategoryElemets] = useState({
    element: [initialDependentElement],
    selectIndex: 0,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enableNext, setEnableNext] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);
  const [generalInfo, setGeneralInfo] = useState<IGeneralInfo>({
    createInstance: {
      brandId: null,
      productId: productId,
      subcategoryId: 0,
      title: suggestedPrice.length > 0 ? suggestedPrice[0].title : "",
      categoryId: 0,
    },
    mainCategory: [],
    secondaryCategory: { brandCategories: [], dependentCategories: [] },
    suggestionKey: suggestedPrice.length > 0 ? suggestedPrice[0].key : null,
  });
  const [showCustomTitleTooltip, setShowCustomTitleTooltip] = useState(false);
  const customTitleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customTitleRef.current && !customTitleRef.current.contains(event.target as Node)) {
        setShowCustomTitleTooltip(false);
      }
    }
    if (showCustomTitleTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomTitleTooltip]);
  const handlecategoryselect = useCallback(
    (id: any, index: number) => {
      setEnableNext(false);
      setCurrentIndex(index);
      const category = findCategoryById(generalInfo.mainCategory, id);
      if (!category && index < mainCategoryElements.length - 1) {
        setmainCategoryElements((prev) => prev.slice(0, index + 1));
      } else if (!category && index === mainCategoryElements.length - 1) {
      } else if (index === mainCategoryElements.length - 1 && category && category.children.length === 0) {
        getSecondaryCategory(category.id);
      } else if (index < mainCategoryElements.length - 1 && category?.children.length === 0) {
        setmainCategoryElements((prev) => prev.slice(0, index + 1));
        getSecondaryCategory(category.id);
      } else if (index === mainCategoryElements.length - 1 && category && category.children.length !== 0) {
        const tempArray = [
          <div className={styles.namesection} id={`notfind${index}`}>
            <div>{t(LanguageKey.Pleaseselect)}</div>
          </div>,
        ];
        for (var cat of category!.children) {
          tempArray.push(
            <div className={`${styles.namesection} translate`} id={cat.id.toString()}>
              <div className={styles.nameenglish}>{cat.name}</div>
              <div className={styles.namepersian}>{cat.langValue}</div>
            </div>
          );
        }
        setmainCategoryElements((prev) => {
          const newArrayState = [...prev];
          newArrayState.push({ element: tempArray, selectIndex: 0 });
          return newArrayState;
        });
      } else if (index < mainCategoryElements.length - 1) {
        setmainCategoryElements((prev) => {
          const newArrayState = prev.slice(0, index + 2);
          newArrayState[index + 1].element = newArrayState[index + 1].element.slice(0, 1);
          for (var cat of category!.children) {
            newArrayState[index + 1].element.push(
              <div className={`${styles.namesection} translate`} id={cat.id.toString()}>
                <div className={styles.nameenglish}> {cat.name}</div>
                <div className={styles.namepersian}> {cat.langValue}</div>
              </div>
            );
            newArrayState[index + 1].selectIndex = 0;
          }

          return newArrayState;
        });
      }
    },
    [generalInfo.mainCategory, mainCategoryElements, t]
  );
  const handleBrandselect = useCallback((id: any) => {
    setGeneralInfo((prev) => ({
      ...prev,
      createInstance: {
        ...prev.createInstance,
        brandId: id == "0" ? null : parseInt(id),
      },
    }));
  }, []);
  const handleDependencySelect = useCallback((id: any) => {
    setGeneralInfo((prev) => ({
      ...prev,
      createInstance: {
        ...prev.createInstance,
        subcategoryId: id == "0" ? null : parseInt(id),
      },
    }));
  }, []);

  const suggestedPriceMap = useMemo(() => {
    const map = new Map();
    suggestedPrice.forEach((item) => map.set(item.key, item.title));
    return map;
  }, [suggestedPrice]);
  const handleSelectTitle = useCallback(
    (id: any) => {
      const selectedTitle = suggestedPriceMap.get(id);
      setGeneralInfo((prev) => ({
        ...prev,
        suggestionKey: id === "custom" ? null : id,
        createInstance: {
          ...prev.createInstance,
          title: id === "custom" ? prev.createInstance.title : selectedTitle,
        },
      }));
    },
    [suggestedPriceMap]
  );

  function findCategoryById(mainCat: IProduct_MainCategory[], targetId: number): IProduct_MainCategory | undefined {
    for (const category of mainCat) {
      if (category.id == targetId) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const foundCategory = findCategoryById(category.children, targetId);
        if (foundCategory) {
          return foundCategory;
        }
      }
    }
    return undefined;
  }
  function findIdPathWithIndexAndSiblingsInArray(
    categories: IProduct_MainCategory[],
    targetId: number
  ): { id: number; index: number; siblings: IProduct_MainCategory[] }[] | null {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      if (category.id === targetId) {
        return [{ id: category.id, index: i, siblings: categories }];
      }
      const path = findIdPathWithIndexAndSiblingsInCategory(category, targetId);
      if (path) {
        return [{ id: category.id, index: i, siblings: categories }, ...path];
      }
    }
    return null;
  }
  function findIdPathWithIndexAndSiblingsInCategory(
    category: IProduct_MainCategory,
    targetId: number
  ): { id: number; index: number; siblings: IProduct_MainCategory[] }[] | null {
    if (category.id === targetId) {
      return [{ id: category.id, index: -1, siblings: [] }];
    }
    for (let i = 0; i < category.children.length; i++) {
      const child = category.children[i];
      if (child.id === targetId) {
        return [{ id: child.id, index: i, siblings: category.children }];
      }
      const path = findIdPathWithIndexAndSiblingsInCategory(child, targetId);
      if (path) {
        return [{ id: category.id, index: i, siblings: category.children }, ...path];
      }
    }
    return null;
  }
  async function getSecondaryCategory(categoryId: number, dependId?: number, brandId?: number) {
    try {
      const res = await GetServerResult<boolean, IProduct_SecondaryCategory>(
        MethodType.get,
        session,
        "shopper" + "" + "/Product/GetSeconderyCategoryList",
        null,
        [
          { key: "language", value: "1" },
          { key: "categoryId", value: categoryId.toString() },
        ]
      );
      if (res.succeeded) {
        setDependentCategoryElemets({ element: [], selectIndex: 0 });
        setBrandCategoryElements({ element: [], selectIndex: 0 });
        // setSecondaryCategory(res.value);
        setGeneralInfo((prev) => ({
          ...prev,
          secondaryCategory: res.value,
          createInstance: {
            ...prev.createInstance,
            brandId: null,
            subcategoryId: null,
            categoryId: categoryId,
          },
        }));
        if (res.value.brandCategories.length > 0)
          setBrandCategoryElements((prev) => {
            let newBrand = prev;
            newBrand = {
              element: [
                <div className={styles.namesection} id={"0"}>
                  <div>{t(LanguageKey.Pleaseselect)}</div>
                </div>,
              ],
              selectIndex: 0,
            };
            if (brandId) {
              newBrand.selectIndex = res.value.brandCategories.findIndex((x) => x.brandId == brandId) + 1;
            }
            for (let brand of res.value.brandCategories) {
              newBrand.element.push(
                <div className={`${styles.namesection} translate`} id={brand.brandId.toString()}>
                  <div className={styles.nameenglish}>{brand.name}</div>
                  <div className={styles.namepersian}> {brand.langValue}</div>
                </div>
              );
            }
            return newBrand;
          });
        if (res.value.dependentCategories.length > 0)
          setDependentCategoryElemets((prev) => {
            let newDepend = prev;
            newDepend = {
              element: [
                <div className={styles.namesection} id={"0"}>
                  <div>{t(LanguageKey.Pleaseselect)}</div>
                </div>,
              ],
              selectIndex: 0,
            };
            if (dependId) {
              newDepend.selectIndex = res.value.dependentCategories.findIndex((x) => x.id === dependId) + 1;
            }
            for (let depend of res.value.dependentCategories) {
              newDepend.element.push(
                <div className={`${styles.namesection} translate`} id={depend.id.toString()}>
                  <div className={styles.nameenglish}>{depend.name}</div>
                  <div className={styles.namepersian}>{depend.langValue} </div>
                </div>
              );
            }
            return newDepend;
          });
        setEnableNext(true);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  const handleExistedGeneralInfo = useCallback(
    (generalInfoParam: IGeneralInfo) => {
      setGeneralInfo(generalInfoParam);
      setmainCategoryElements((prev) => {
        let newArrayState = [...prev];
        if (generalInfoParam.createInstance.categoryId) {
          setGeneralInfo((prev) => ({
            ...prev,
            createInstance: {
              ...prev.createInstance,
              brandId: generalInfoParam.createInstance.brandId,
              categoryId: generalInfoParam.createInstance.categoryId!,
              subcategoryId: generalInfoParam.createInstance.subcategoryId!,
            },
          }));
          getSecondaryCategory(
            generalInfoParam.createInstance.categoryId,
            generalInfoParam.createInstance.subcategoryId!,
            generalInfoParam.createInstance.brandId!
          );
          newArrayState = [];
          const catInfos = findIdPathWithIndexAndSiblingsInArray(
            generalInfoParam.mainCategory,
            generalInfoParam.createInstance.categoryId
          );
          if (!catInfos) return newArrayState;
          setCurrentIndex(catInfos.length - 1);
          for (let info of catInfos) {
            const tempArray = [
              <div className={styles.namesection} id={`notfind${info.id}`}>
                <div>{t(LanguageKey.Pleaseselect)}</div>
              </div>,
            ];
            for (let sibling of info.siblings) {
              tempArray.push(
                <div className={`${styles.namesection} translate`} id={sibling.id.toString()}>
                  <div className={styles.nameenglish}>{sibling.name}</div>
                  <div className={styles.namepersian}>{sibling.langValue}</div>
                </div>
              );
            }
            newArrayState.push({
              element: tempArray,
              selectIndex: info.index + 1,
            });
          }
        }
        return newArrayState;
      });
    },
    [t]
  );
  const fetchData = useCallback(async () => {
    if (info) {
      handleExistedGeneralInfo(info);
      setLoading(false);
      return;
    }
    try {
      const [mainCat, lastCat] = await Promise.all([
        GetServerResult<boolean, IProduct_MainCategory[]>(
          MethodType.get,
          session,
          "shopper" + "" + "/Product/GetMainCategoryList",
          null,
          [{ key: "language", value: "1" }]
        ),
        GetServerResult<boolean, ILastCategory>(MethodType.get, session, "shopper" + "" + "/Product/GetLastCategory"),
      ]);
      if (mainCat.succeeded && lastCat.succeeded) {
        setGeneralInfo((prev) => ({ ...prev, mainCategory: mainCat.value }));
        setmainCategoryElements((prev) => {
          let newArrayState = [...prev];
          if (!lastCat.value) {
            for (var cat of mainCat.value) {
              newArrayState[0].element.push(
                <div className={`${styles.namesection} translate`} id={cat.id.toString()}>
                  <div className={styles.nameenglish}>{cat.name}</div>
                  <div className={styles.namepersian}>{cat.langValue} </div>
                </div>
              );
            }
          } else if (lastCat.value.categoryId) {
            setGeneralInfo((prev) => ({
              ...prev,
              createInstance: {
                ...prev.createInstance,
                brandId: lastCat.value.brandId,
                categoryId: lastCat.value.categoryId!,
                subcategoryId: lastCat.value.subCategoryId!,
              },
            }));
            getSecondaryCategory(lastCat.value.categoryId, lastCat.value.subCategoryId!, lastCat.value.brandId!);
            newArrayState = [];
            const catInfos = findIdPathWithIndexAndSiblingsInArray(mainCat.value, lastCat.value.categoryId);
            if (!catInfos) return newArrayState;
            setCurrentIndex(catInfos.length - 1);
            for (let info of catInfos) {
              const tempArray = [
                <div className={styles.namesection} id={`notfind${info.id}`}>
                  <div>{t(LanguageKey.Pleaseselect)}</div>
                </div>,
              ];
              for (let sibling of info.siblings) {
                tempArray.push(
                  <div className={`${styles.namesection} translate`} id={sibling.id.toString()}>
                    <div className={styles.nameenglish}>{sibling.name}</div>
                    <div className={styles.namepersian}>{sibling.langValue}</div>
                  </div>
                );
              }
              newArrayState.push({
                element: tempArray,
                selectIndex: info.index + 1,
              });
            }
          }
          return newArrayState;
        });
        setLoading(false);
      } else notify(mainCat.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, info, handleExistedGeneralInfo, t]);
  useEffect(() => {
    fetchData();
  }, [session, fetchData]);
  const titleList = useMemo(() => {
    return suggestedPrice.map((p) => (
      <div key={p.key} id={p.key}>
        {p.title}
      </div>
    ));
  }, [suggestedPrice]);
  const handleInputChange = useCallback((e: { target: { value: any } }) => {
    const value = e.target.value;
    setGeneralInfo((prev) => ({
      ...prev,
      createInstance: { ...prev.createInstance, title: value },
    }));
  }, []);
  function handleSelectFirstTitleIndex() {
    const index = suggestedPrice.findIndex((x) => x.title === generalInfo.createInstance.title);
    if (index !== -1) return index + 1;
    else if (index === -1 && generalInfo.createInstance.title) return 0;
    else if (index === -1 && !generalInfo.createInstance.title) return 1;
  }
  useEffect(() => {
    fetchData();
  }, [session]);
  useEffect(() => {
    if (loading) return;
    if (enableNext && generalInfo.createInstance.title) {
      upadteCteateFromgeneral(generalInfo);
    } else {
      setHasNotif(true);
      internalNotify(InternalResponseType.FillRedBorderFields, NotifType.Warning);
    }
  }, [toggleNext]);
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          <div className={styles.general}>
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.product_BasicDetail)}</div>
              <div className="headerparent">
                <div className="headerandinput" style={{ maxWidth: "150px", minWidth: "100px" }}>
                  <div className="headertext">{t(LanguageKey.product_ProductID)} (PID) </div>
                  <InputText
                    style={{
                      cursor: "no-drop",
                      backgroundColor: "var(--color-disable)",
                      pointerEvents: "none",
                    }}
                    name=""
                    className="textinputbox"
                    placeHolder="Product id"
                    handleInputChange={() => {}}
                    value={productId.toString()}
                  />
                </div>
                <div className="headerandinput">
                  <div className="headertext">
                    {t(LanguageKey.product_Producttitle)}
                    <Tooltip tooltipValue={t(LanguageKey.Product_titleExplain)} position="bottom" onClick={true}>
                      <img
                        style={{
                          marginInline: "5px",
                          cursor: "pointer",
                          width: "15px",
                          height: "15px",
                        }}
                        title="ℹ️ tooltip"
                        src="/tooltip.svg"
                      />
                    </Tooltip>
                  </div>
                  <div className="headerparent">
                    <div
                      ref={customTitleRef}
                      className={styles.customtitle}
                      onClick={() => setShowCustomTitleTooltip(true)}>
                      <InputText
                        name=""
                        className={
                          generalInfo.createInstance.title.length === 0 && hasNotif ? "danger" : "textinputbox"
                        }
                        placeHolder="Product Title"
                        handleInputChange={handleInputChange}
                        value={generalInfo.createInstance.title}
                        maxLength={200}
                      />
                      {showCustomTitleTooltip && (
                        <div className={styles.customtitletooltip}>
                          {titleList.map((item, idx) => (
                            <div
                              className={styles.customtitleitem}
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTitle(item.props.id);
                                setShowCustomTitleTooltip(false);
                              }}>
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <img
                      style={{
                        cursor: "pointer",
                        width: "30px",
                        height: "30px",
                        padding: "var(--padding-5)",
                      }}
                      title="ℹ️ paste"
                      src="/copy.svg"
                      onClick={async () => {
                        try {
                          const clipboardText = await navigator.clipboard.readText();
                          setGeneralInfo((prev) => ({
                            ...prev,
                            createInstance: {
                              ...prev.createInstance,
                              title: clipboardText,
                            },
                          }));
                        } catch (error) {
                          console.error("Error reading clipboard: ", error);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.product_Categories)}</div>
              <div className={styles.Category}>
                {mainCategoryElements.map((v, i) => {
                  const categoryLevels = [
                    t(LanguageKey.product_MainCategory),
                    t(LanguageKey.product_Subcategory),
                    t(LanguageKey.product_Subset),
                    t(LanguageKey.product_Group),
                    t(LanguageKey.product_Branch),
                    t(LanguageKey.product_Subbranch),
                  ];
                  const categoryName = categoryLevels[i] || `Level ${i + 1}`;
                  return (
                    <div
                      key={i}
                      className="headerandinput"
                      style={{
                        maxWidth: "calc(50% - 11px)",
                        minWidth: "200px",
                      }}>
                      <div className="headertext">{categoryName}</div>

                      {/* Using the appropriate name for each depth level */}
                      <DragDrop
                        data={v.element}
                        handleOptionSelect={(id) => handlecategoryselect(id, i)}
                        item={v.selectIndex}
                        resetItemValue={currentIndex < i}
                        dangerBorder={hasNotif}
                      />
                    </div>
                  );
                })}
                {enableNext && <div style={{ display: "none" }}></div>}
                {dependentCategoryElements.element.length > 1 && enableNext && (
                  <div
                    className="headerandinput"
                    style={{
                      maxWidth: "calc(50% - 11px)",
                      minWidth: "200px",
                    }}>
                    <div className="headertext">{t(LanguageKey.product_Dependency)}</div>
                    <DragDrop
                      data={dependentCategoryElements.element}
                      handleOptionSelect={handleDependencySelect}
                      item={dependentCategoryElements.selectIndex}
                    />
                  </div>
                )}
              </div>
              <div className={styles.brand}>
                {brandCategoryElements.element.length > 1 && enableNext && (
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.product_Brand)}</div>
                    <DragDrop
                      data={brandCategoryElements.element}
                      searchMod={true}
                      handleOptionSelect={handleBrandselect}
                      item={brandCategoryElements.selectIndex}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default General;
