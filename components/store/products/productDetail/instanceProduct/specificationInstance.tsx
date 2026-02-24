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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import { LanguageKey } from "brancy/i18n";
import { ISpecification } from "brancy/models/store/IProduct";
import styles from "./specifications.module.css";

function SortableItem({ item, index }: { item: ISpecification; index: number }) {
  const { t } = useTranslation();
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
        {...attributes}
        {...listeners}
        className={styles.move}
        title="ℹ️ drag and drop to move"
        src="/dragblock.svg"
      />

      <div className={styles.speccontent}>
        <>
          {item.defaultSpecification && (
            <>
              <div className="headerandinput">
                <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>

                <InputText
                  style={{
                    cursor: "no-drop",
                    backgroundColor: "var(--color-disable)",
                    pointerEvents: "none",
                  }}
                  className={"textinputbox"}
                  placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                  handleInputChange={() => {}}
                  value={item.defaultSpecification.key}
                />
              </div>
              <div className="headerandinput">
                <div className="headertext">{t(LanguageKey.Value)}</div>

                <InputText
                  style={{
                    cursor: "no-drop",
                    backgroundColor: "var(--color-disable)",
                    pointerEvents: "none",
                  }}
                  className={"textinputbox"}
                  placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                  handleInputChange={() => {}}
                  value={item.defaultSpecification.value}
                />
              </div>
            </>
          )}
        </>
        <>
          {item.customSpecification && (
            <>
              <div className="headerandinput">
                <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
                <InputText
                  style={{
                    cursor: "no-drop",
                    backgroundColor: "var(--color-disable)",
                    pointerEvents: "none",
                  }}
                  className={"textinputbox"}
                  placeHolder={t(LanguageKey.SettingGeneral_Title)}
                  handleInputChange={() => {}}
                  value={item.customSpecification.key}
                />
              </div>
              <div className="headerandinput">
                <div className="headertext">{t(LanguageKey.Value)}</div>
                <textarea
                  style={{
                    cursor: "no-drop",
                    backgroundColor: "var(--color-disable)",
                    pointerEvents: "none",
                  }}
                  value={item.customSpecification.value}
                  className={item.customSpecification.value.length > 0 ? styles.message : styles.dangermessage}
                  placeholder={t(LanguageKey.Value)}
                />
              </div>
            </>
          )}
        </>
      </div>
    </div>
  );
}

function SpecificationsInstance({
  specificationInfo,
  upadteCteateFromSpecifications,
  toggleNext,
}: {
  specificationInfo: ISpecification[];
  toggleNext: { toggle: boolean; isNext: boolean };
  upadteCteateFromSpecifications: (isNext: boolean, specificationInfo: ISpecification[]) => void;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState(false);
  const [specificationItems, setSpecificationItems] = useState(specificationInfo);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
          {specificationItems.length > 0 && (
            <div className={styles.headerdesktop}>
              <div className={styles.headerdesktoptext} style={{ paddingInline: "35px" }}>
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
                <SortableItem key={index} item={item} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </>
  );
}

export default SpecificationsInstance;
