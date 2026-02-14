import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "saeed/components/design/inputText";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { IProductInstance } from "saeed/models/store/IProduct";
import styles from "./general.module.css";
function GeneralInstance({
  productInstance,
  upadteCteateFromgeneral,
  toggleNext,
}: {
  productInstance: IProductInstance;
  upadteCteateFromgeneral: () => void;
  toggleNext: boolean;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();
  useEffect(() => {
    setLoading(false);
  }, [session]);
  useEffect(() => {
    if (loading) return;
    upadteCteateFromgeneral();
  }, [toggleNext]);
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          {/* ___left card___*/}
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
                    className="textinputbox"
                    placeHolder="Product id"
                    handleInputChange={() => {}}
                    value={productInstance.productId.toString()}
                  />
                </div>
                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.product_Producttitle)} *</div>
                  <div className="headerparent">
                    <InputText
                      style={{
                        cursor: "no-drop",
                        backgroundColor: "var(--color-disable)",
                        pointerEvents: "none",
                      }}
                      className={"textinputbox"}
                      handleInputChange={() => {}}
                      value={productInstance.title}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.product_Categories)}</div>

              <div className={styles.Category}>
                {/* {titleVariation.map((v, i) => {
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
                      }}
                    >

                      <div className="headertext">{categoryName}</div>
                      <div className="headerparent">
                        <InputText
                          style={{
                            cursor: "no-drop",
                            backgroundColor: "var(--color-disable)",
                            pointerEvents: "none",
                          }}
                          className={"textinputbox"}
                          handleInputChange={() => {}}
                          value={v.langValue}
                        />
                      </div>
                    </div>
                  );
                })} */}
                <div
                  className="headerandinput"
                  style={{
                    maxWidth: "calc(50% - 11px)",
                    minWidth: "200px",
                  }}>
                  <div className="headertext">{t(LanguageKey.product_MainCategory)}</div>
                  <InputText
                    style={{
                      cursor: "no-drop",
                      backgroundColor: "var(--color-disable)",
                      pointerEvents: "none",
                    }}
                    className={"textinputbox"}
                    handleInputChange={() => {}}
                    value={productInstance.categoryLangValue}
                  />
                </div>
                {productInstance.subCategoryLangValue && (
                  <div
                    className="headerandinput"
                    style={{
                      maxWidth: "calc(50% - 11px)",
                      minWidth: "200px",
                    }}>
                    <div className="headertext">{t(LanguageKey.product_Dependency)}</div>
                    <InputText
                      style={{
                        cursor: "no-drop",
                        backgroundColor: "var(--color-disable)",
                        pointerEvents: "none",
                      }}
                      className={"textinputbox"}
                      handleInputChange={() => {}}
                      value={productInstance.subCategoryLangValue}
                    />
                  </div>
                )}
              </div>
              <div className={styles.brand}>
                {productInstance.brandLangValue && (
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.product_Brand)}</div>
                    <InputText
                      style={{
                        cursor: "no-drop",
                        backgroundColor: "var(--color-disable)",
                        pointerEvents: "none",
                      }}
                      className={"textinputbox"}
                      handleInputChange={() => {}}
                      value={productInstance.brandLangValue}
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

export default GeneralInstance;
