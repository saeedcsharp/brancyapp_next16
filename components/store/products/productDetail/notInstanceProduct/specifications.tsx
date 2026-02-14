import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "saeed/components/design/dragDrop/dragDrop";
import InputText from "saeed/components/design/inputText";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import {
  ICreateInstance_ForSpecification,
  ICustomSpecificationItem,
  IProduct_LastSpecification,
  IProduct_Variation,
  ISpecificationItem,
} from "saeed/models/store/IProduct";
import styles from "./specifications.module.css";

function SortableItem({
  item,
  index,
  handleDeleteSpecItem,
  refresh,
  handleSelectPredefineTitle,
  handleSelectSpecKeyIndex,
  handleSelectPredefineValue,
  handleSelectSpecValueIndex,
  specifySpecValue,
  handleChangeKeyCustom,
  handleChangeValueCustom,
  defaultSpecTitles,
  t,
}: {
  item: {
    customSpecification: ICustomSpecificationItem | null;
    defaultSpecification: ISpecificationItem | null;
  };
  index: number;
  handleDeleteSpecItem: (index: number) => void;
  refresh: boolean;
  handleSelectPredefineTitle: (id: any, index: number) => void;
  handleSelectSpecKeyIndex: (variationTitleId: number) => number;
  handleSelectPredefineValue: (id: any, index: number) => void;
  handleSelectSpecValueIndex: (variationId: number, variationTitleId: number) => number;
  specifySpecValue: (id: any) => JSX.Element[];
  handleChangeKeyCustom: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  handleChangeValueCustom: (e: ChangeEvent<HTMLTextAreaElement>, index: number) => void;
  defaultSpecTitles: JSX.Element[];
  t: (key: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: index.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className={styles.specitem} ref={setNodeRef} style={style}>
      <img
        className={styles.move}
        title="ℹ️ drag and drop to move"
        src="/dragblock.svg"
        {...attributes}
        {...listeners}
      />

      <div className={styles.speccontent}>
        <>
          {item.defaultSpecification && (
            <>
              <div className={styles.speccontent}>
                <div className={styles.headerandinput}>
                  <div className={styles.headertext}>{t(LanguageKey.SettingGeneral_Title)}</div>
                  <DragDrop
                    data={defaultSpecTitles}
                    handleOptionSelect={(id) => handleSelectPredefineTitle(id, index)}
                    item={handleSelectSpecKeyIndex(item.defaultSpecification.variationTitle)}
                    isRefresh={refresh}
                    dangerBorder={item.defaultSpecification.variationTitle === 0}
                  />
                </div>
                <div
                  className={`${styles.headerandinput} ${
                    item.defaultSpecification.variationTitle === 0 ? "fadeDiv" : ""
                  }`}>
                  <div className={styles.headertext}>{t(LanguageKey.Value)}</div>
                  <DragDrop
                    data={
                      item.defaultSpecification.variationTitle === 0
                        ? [
                            <div className={`${styles.namesection} translate`} id={"0"} key="0">
                              <div>{t(LanguageKey.Pleaseselect)}</div>
                            </div>,
                          ]
                        : specifySpecValue(item.defaultSpecification.variationTitle)
                    }
                    handleOptionSelect={(id) => handleSelectPredefineValue(id, index)}
                    item={handleSelectSpecValueIndex(
                      item.defaultSpecification.value,
                      item.defaultSpecification.variationTitle
                    )}
                    isRefresh={refresh}
                    dangerBorder={item.defaultSpecification.value === 0}
                  />
                </div>
              </div>
              <img
                className={styles.deletebtndesktop}
                onClick={() => handleDeleteSpecItem(index)}
                title="delete variation"
                src="/delete.svg"
              />
              <img
                className={styles.deletebtnmobile}
                onClick={() => handleDeleteSpecItem(index)}
                title="delete variation"
                src="/delete.svg"
              />
            </>
          )}
        </>
        <>
          {item.customSpecification && (
            <>
              <div className={styles.speccontent}>
                <div className={styles.headerandinput}>
                  <div className={styles.headertext}>{t(LanguageKey.SettingGeneral_Title)}</div>
                  <InputText
                    name=""
                    className={item.customSpecification.key.length > 0 ? "textinputbox" : "danger"}
                    placeHolder={t(LanguageKey.SettingGeneral_Title)}
                    handleInputChange={(e) => handleChangeKeyCustom(e, index)}
                    value={item.customSpecification.key}
                    maxLength={200}
                  />
                </div>
                <div className={styles.headerandinput}>
                  <div className={styles.headertext}>{t(LanguageKey.Value)}</div>
                  <textarea
                    value={item.customSpecification.value}
                    className={item.customSpecification.value.length > 0 ? styles.message : styles.dangermessage}
                    maxLength={1000}
                    placeholder={t(LanguageKey.Value)}
                    onChange={(e) => handleChangeValueCustom(e, index)}
                  />
                </div>
              </div>
              <img
                className={styles.deletebtndesktop}
                onClick={() => handleDeleteSpecItem(index)}
                title="delete variation"
                src="/delete.svg"
              />
              <img
                className={styles.deletebtnmobile}
                onClick={() => handleDeleteSpecItem(index)}
                title="delete variation"
                src="/delete.svg"
              />
            </>
          )}
        </>
      </div>
    </div>
  );
}

function Specifications({
  categoryId,
  variation,
  createInstanceInfo,
  upadteCteateFromSpecifications,
  toggleNext,
}: {
  categoryId: number;
  variation: IProduct_Variation;
  createInstanceInfo: ICreateInstance_ForSpecification;
  toggleNext: { toggle: boolean; isNext: boolean };
  upadteCteateFromSpecifications: (
    isNext: boolean,
    specificationItems: {
      customSpecification: ICustomSpecificationItem | null;
      defaultSpecification: ISpecificationItem | null;
    }[]
  ) => void;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const defaultSpecTitles: JSX.Element[] = initialzedDefaultSpecTitles();
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState(false);
  const [specificationItems, setSpecificationItems] = useState(createInstanceInfo.specificationItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function initialzedDefaultSpecTitles() {
    let defaultSpecTitles: JSX.Element[] = [
      <div className={styles.namesection} id={"0"} key="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>,
    ];
    for (let vari of variation.variations) {
      if (!createInstanceInfo.variationTitles.find((x) => x === vari.id)) {
        defaultSpecTitles.push(
          <div id={vari.id.toString()} key={vari.id}>
            {vari.langValue}
          </div>
        );
      }
    }
    return defaultSpecTitles;
  }

  function handleSelectPredefineTitle(id: any, index: number) {
    setSpecificationItems((prev) =>
      prev.map((x) =>
        prev.indexOf(x) !== index
          ? x
          : {
              ...x,
              defaultSpecification: {
                variationTitle: Number(id),
                value: 0,
              },
            }
      )
    );
    setRefresh(!refresh);
  }

  function handleSelectPredefineValue(id: any, index: number) {
    setSpecificationItems((prev) =>
      prev.map((x) =>
        prev.indexOf(x) !== index
          ? x
          : {
              ...x,
              defaultSpecification: {
                ...x.defaultSpecification!,
                value: Number(id),
              },
            }
      )
    );
  }

  function handleDeleteSpecItem(index: number) {
    setSpecificationItems((prev) => prev.filter((x) => prev.indexOf(x) !== index));
    setRefresh(!refresh);
  }

  function handleAddPredefine() {
    setSpecificationItems((prev) => [
      {
        customSpecification: null,
        defaultSpecification: { value: 0, variationTitle: 0 },
      },
      ...prev,
    ]);
    setRefresh(!refresh);
  }

  function handleAddCustome() {
    setSpecificationItems((prev) => [
      {
        customSpecification: { key: "", value: "" },
        defaultSpecification: null,
      },
      ...prev,
    ]);
  }

  function specifySpecValue(id: any) {
    let newArray = [
      <div className={styles.namesection} id={"0"} key="0">
        <div>{t(LanguageKey.Pleaseselect)}</div>
      </div>,
    ];
    if (id == "0") return newArray;
    else {
      const values = variation.variations.find((x) => x.id == id)?.variations;
      for (let val of values!) {
        newArray.push(
          <div id={val.variationId.toString()} key={val.variationId}>
            {val.langValue}
          </div>
        );
      }
    }
    return newArray;
  }

  function handleSelectSpecKeyIndex(variationTitleId: number) {
    var index = 0;
    const varIndex = defaultSpecTitles.indexOf(defaultSpecTitles.find((x) => x.props.id == variationTitleId)!);
    if (varIndex) index = varIndex;
    return index;
  }

  function handleSelectSpecValueIndex(variationId: number, variationTitleId: number) {
    var index = 0;
    if (variationTitleId === 0) return index;
    const varIndex = variation.variations
      .find((x) => x.id === variationTitleId)
      ?.variations.findIndex((x) => x.variationId === variationId);
    if (varIndex) index = varIndex;
    return index + 1;
  }

  function handleChangeKeyCustom(e: ChangeEvent<HTMLInputElement>, index: number) {
    setSpecificationItems((prev) =>
      prev.map((x) =>
        prev.indexOf(x) !== index
          ? x
          : {
              ...x,
              customSpecification: {
                ...x.customSpecification!,
                key: e.target.value,
              },
            }
      )
    );
  }

  function handleChangeValueCustom(e: ChangeEvent<HTMLTextAreaElement>, index: number) {
    setSpecificationItems((prev) =>
      prev.map((x) =>
        prev.indexOf(x) !== index
          ? x
          : {
              ...x,
              customSpecification: {
                ...x.customSpecification!,
                value: e.target.value,
              },
            }
      )
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSpecificationItems((items) => {
        const oldIndex = parseInt(active.id.toString());
        const newIndex = parseInt(over.id.toString());

        return arrayMove(items, oldIndex, newIndex);
      });
      setRefresh(!refresh);
    }
  }

  async function handleGetLastSpecification() {
    try {
      const res = await GetServerResult<boolean, IProduct_LastSpecification>(
        MethodType.get,
        session,
        "shopper" + "" + "/Product/GetLastProductSpecification",
        null,
        [
          { key: "categoryId", value: categoryId.toString() },
          { key: "language", value: "1" },
        ]
      );
      if (res.succeeded) {
        let newSpecItems: {
          customSpecification: ICustomSpecificationItem | null;
          defaultSpecification: ISpecificationItem | null;
        }[] = [];
        for (let spec of res.value.specifications) {
          newSpecItems.push({
            customSpecification: null,
            defaultSpecification: {
              value: spec.variationId,
              variationTitle: spec.variationTitleId,
            },
          });
        }
        for (let customSpec of res.value.customSpecifications) {
          newSpecItems.push({
            defaultSpecification: null,
            customSpecification: {
              key: customSpec.key,
              value: customSpec.value,
            },
          });
        }
        setSpecificationItems(newSpecItems);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  useEffect(() => {
    if (loading) {
      setLoading(false);
      return;
    }
    upadteCteateFromSpecifications(toggleNext.isNext, specificationItems);
  }, [toggleNext.toggle]);

  return (
    <>
      <div className={styles.specification}>
        <div className="headerandinput">
          <div className="title">{t(LanguageKey.product_productspecifications)}</div>
          <div className={styles.addmore}>
            <button onClick={handleAddPredefine} className={styles.addbtn} title="ℹ️ Add new Pre Define">
              <svg width="60px" height="60px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <path
                  d="M30 53.1C12.7 53.1 6.9 47.3 6.9 30S12.7 6.9 30 6.9 53.1 12.7 53.1 30m-9.9 12.8 5.6 5.8M33 33l6.8 18.7 3.4-9 9-3.3zm-7.2-11.1a2.9 2.9 0 1 0-3 2.9h0a3 3 0 0 0 3-2.9"
                  stroke="var(--text-h1)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className={styles.addbtninfo}>
                {t(LanguageKey.product_choosesystemlist)}

                <div className="explain">{t(LanguageKey.product_choosesystemlistexplain)}</div>
              </div>
            </button>
            <button onClick={handleAddCustome} className={styles.addbtn} title="ℹ️ Add new custom">
              <svg width="60px" height="60px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <path
                  d="M33 53.1C12.5 53.1 6.9 47.3 6.9 30S12.7 6.9 30 6.9 53.1 12.7 53.1 30M38 44h14m-7 7V37M26.8 22.9a2.9 2.9 0 1 0-3 2.9h0a3 3 0 0 0 3-2.9"
                  stroke="var(--text-h1)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className={styles.addbtninfo}>
                {t(LanguageKey.product_Definenew)}
                <div className="explain">{t(LanguageKey.product_Definenewexplain)}</div>
              </div>
            </button>
            <button
              onClick={handleGetLastSpecification}
              className={styles.addbtn}
              title="ℹ️ import from previous product">
              <svg width="60px" height="60px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <path
                  d="M30 53.13C12.66 53.13 6.88 47.34 6.88 30S12.66 6.88 30 6.88 53.12 12.66 53.12 30M40 45h14m-7 7V38M21 28h.02M21 21h.02M21 35h.02M37.9 21H31m6.9 7H31m6.9 7H31"
                  stroke="var(--text-h1)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className={styles.addbtninfo}>
                {t(LanguageKey.product_importbatch)}

                <div className="explain">{t(LanguageKey.product_importbatchexplain)}</div>
              </div>
            </button>
          </div>
          {specificationItems.length > 0 && (
            <div className={styles.headerdesktop}>
              <div className={styles.headerdesktoptext} style={{ paddingInline: "55px" }}>
                {t(LanguageKey.SettingGeneral_Title)}
              </div>
              <div className={styles.headerdesktoptext}>{t(LanguageKey.Value)}</div>
            </div>
          )}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={specificationItems.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}>
            <div style={{ width: "100%" }}>
              {specificationItems.map((item, index) => (
                <SortableItem
                  key={index}
                  item={item}
                  index={index}
                  handleDeleteSpecItem={handleDeleteSpecItem}
                  refresh={refresh}
                  handleSelectPredefineTitle={handleSelectPredefineTitle}
                  handleSelectSpecKeyIndex={handleSelectSpecKeyIndex}
                  handleSelectPredefineValue={handleSelectPredefineValue}
                  handleSelectSpecValueIndex={handleSelectSpecValueIndex}
                  specifySpecValue={specifySpecValue}
                  handleChangeKeyCustom={handleChangeKeyCustom}
                  handleChangeValueCustom={handleChangeValueCustom}
                  defaultSpecTitles={defaultSpecTitles}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </>
  );
}

export default Specifications;
