import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "saeed/components/design/dragDrop/dragDrop";
import InputText from "saeed/components/design/inputText";
import RadioButton from "saeed/components/design/radioButton";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { ICreateInstance_ForVariation, IProduct_Variation } from "saeed/models/store/IProduct";
import { IAddNewVariation, INewVariation } from "../Variation";
import styles from "./newVariation.module.css";
const NewVariation = (props: {
  createInstance: ICreateInstance_ForVariation;
  variation: IProduct_Variation;
  addNewObj: IAddNewVariation;
  addNewId: number;
  removeMask: () => void;
  saveNewVariation: (addNewObj: INewVariation, index: number) => void;
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [checkBox, setCheckBox] = useState({ custom: false, default: true });
  const [addNewValue, setAddNewValue] = useState<INewVariation>();
  const [customeTitle, setcustomeTitle] = useState("");
  // const [addNewObj, setAddNewObj] = useState(props.addNewObj);
  const [defaultVariationTitle, setDefaultVariationTitle] = useState<React.JSX.Element[]>([
    <div className={styles.namesection} id={"0"}>
      <div>{t(LanguageKey.Pleaseselect)}</div>
    </div>,
  ]);
  const [defaultVariationValue, setDefaultVariationValue] = useState<string[]>([]);
  function handleChangeCastomeTitle(e: ChangeEvent<HTMLInputElement>) {
    let title = e.target.value;
    setcustomeTitle(title);
    setAddNewValue({
      color: false,
      customeTitle: title,
      variationTitleId: null,
    });
  }
  function handleOptionChanged(e: ChangeEvent<HTMLInputElement>) {
    if (props.createInstance.customTitleVariation && !addNewValue!.customeTitle) return;
    if (e.target.name === "custom") {
      setCheckBox({ custom: true, default: false });
    } else {
      setCheckBox({ custom: false, default: true });
    }
  }
  function fetchData() {
    var obj: INewVariation | null = null;
    if (props.addNewId === 1) {
      obj = props.addNewObj.val1!;
    } else if (props.addNewId === 2) {
      obj = props.addNewObj.val2!;
    } else if (props.addNewId === 3) {
      obj = props.addNewObj.val3!;
    }
    if (obj && obj.customeTitle) {
      setCheckBox({ custom: true, default: false });
    } else setCheckBox({ custom: false, default: true });
    setAddNewValue(obj!);
    setDefaultVariationTitle((prev) => {
      let newArray = [];
      newArray.push(
        <div className={styles.namesection} id={"0"}>
          <div>{t(LanguageKey.Pleaseselect)}</div>
        </div>,
      );
      if (props.variation.colorCategories.length > 0 && !props.createInstance.isColorVariation) {
        newArray.push(
          <div className={styles.namesection} id="color">
            <div>{t(LanguageKey.color)}</div>
          </div>,
        );
      }
      const newVariations = props.variation.variations.filter(
        (x) => props.createInstance.variationTitles.find((v) => v === x.id) !== x.id,
      );
      console.log("newVariations", newVariations);
      for (let variation of newVariations) {
        newArray.push(<div id={variation.id.toString()}> {variation.langValue} </div>);
      }
      return newArray;
    });
    setLoading(false);
  }
  function handleVariationSelect(id: any) {
    if (id == "color") {
      setDefaultVariationValue(props.variation.colorCategories.map((x) => x.langValue));
      setAddNewValue({
        color: true,
        customeTitle: null,
        variationTitleId: null,
      });
    } else if (id == "0") {
      setDefaultVariationValue([]);
      setAddNewValue({
        color: false,
        customeTitle: null,
        variationTitleId: null,
      });
    } else {
      setDefaultVariationValue(props.variation.variations.find((v) => v.id == id)!.variations.map((x) => x.langValue));
      setAddNewValue({
        color: false,
        customeTitle: null,
        variationTitleId: parseInt(id),
      });
    }
  }
  function checkCondition() {
    const check = [
      checkBox.custom,
      addNewValue?.customeTitle,
      checkBox.default,
      addNewValue?.variationTitleId,
      addNewValue?.color,
    ];

    if ((check[0] && check[1]) || (check[2] && (check[3] || check[4]))) return true;
    else return false;
  }
  function handleSaveNewVariation() {
    const check = [
      checkBox.custom,
      addNewValue?.customeTitle,
      checkBox.default,
      addNewValue?.variationTitleId,
      addNewValue?.color,
    ];
    if (checkCondition()) props.saveNewVariation(addNewValue!, props.addNewId);
  }

  useEffect(() => {
    console.log(props.addNewObj);
    fetchData();
  }, []);
  return (
    <>
      <div
        onClick={props.removeMask}
        className="dialogBg"
        style={{ borderRadius: "var(--br25) var(--br25) 0px 0px" }}></div>
      {loading && <Loading />}
      {!loading && (
        <>
          <div className="popup">
            <div className="title">{t(LanguageKey.product_AddNewproperty)}</div>
            <div className={styles.content}>
              <div
                className={`headerandinput ${
                  props.createInstance.customTitleVariation && !addNewValue?.customeTitle && "fadeDiv"
                }`}>
                <RadioButton
                  name={"custom"}
                  id={t(LanguageKey.product_Definenew)}
                  checked={checkBox.custom}
                  handleOptionChanged={handleOptionChanged}
                  textlabel={t(LanguageKey.product_Definenew)}
                  title={t(LanguageKey.product_Definenew)}
                />
                <div className={`headerandinput ${checkBox.default && "fadeDiv"}`}>
                  <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
                  <InputText
                    className={"textinputbox"}
                    handleInputChange={handleChangeCastomeTitle}
                    value={customeTitle}
                    placeHolder={t(LanguageKey.product_AddNewproperty)}
                    fadeTextArea={checkBox.default}
                  />
                </div>
              </div>

              <div className="headerandinput">
                <RadioButton
                  name={"default"}
                  id={t(LanguageKey.product_systemlist)}
                  checked={checkBox.default}
                  handleOptionChanged={handleOptionChanged}
                  textlabel={t(LanguageKey.product_systemlist)}
                  title={t(LanguageKey.product_systemlist)}
                />
                <div className={`headerandinput ${checkBox.custom && "fadeDiv"}`}>
                  <DragDrop data={defaultVariationTitle} handleOptionSelect={handleVariationSelect} />
                </div>
              </div>

              <div className={`headerandinput ${checkBox.custom && "fadeDiv"}`} style={{ height: "100%" }}>
                <div className="headerparent">
                  <div className="headertext">{t(LanguageKey.product_itemlist)}</div>
                  <div className="counter">
                    ( <strong>{defaultVariationValue.length}</strong> )
                  </div>
                </div>
                <div className={styles.tagsContainer}>
                  {defaultVariationValue.map((tag, index) => (
                    <div key={index} className={styles.tag}>
                      {tag}
                      {addNewValue?.color && (
                        <div
                          className={styles.tagcolor}
                          style={{
                            backgroundColor: props.variation.colorCategories[index].hexCode,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="ButtonContainer">
              <button onClick={props.removeMask} className="cancelButton">
                {t(LanguageKey.cancel)}
              </button>
              <button
                disabled={!checkCondition()}
                onClick={handleSaveNewVariation}
                className={!checkCondition() ? "disableButton" : "saveButton"}>
                {t(LanguageKey.save)}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NewVariation;
