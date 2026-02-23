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
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import Loading from "brancy/components/notOk/loading";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { ILink, IUpdateOrderLink } from "brancy/models/market/properties";
import styles from "brancy/components/market/properties/link.module.css";

const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

// Sortable item component
function SortableItem({
  id,
  link,
  handleClickOnIcon,
  isMenuOpen,
  onToggleMenu,
  t,
}: {
  id: string;
  link: ILink;
  handleClickOnIcon: (e: MouseEvent) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  t: (key: string) => string;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggleMenu();
      } else if (e.key === "Escape" && isMenuOpen) {
        e.preventDefault();
        onToggleMenu();
      }
    },
    [isMenuOpen, onToggleMenu]
  );

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/attention.svg";
  }, []);

  return (
    <div ref={setNodeRef} style={style} key={link.id}>
      <div
        className={styles.shortcutlink}
        role="listitem"
        aria-label={`Link: ${link.title}, ${link.clickCount} clicks`}>
        <div
          {...attributes}
          {...listeners}
          className={styles.move}
          title="ℹ️ drag drop to move"
          aria-label="Drag handle to reorder"
          role="button"
          tabIndex={0}>
          <svg
            width="15"
            height="30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 7 27"
            aria-hidden="true">
            <path
              d="M2.193 1.324a1.5 1.5 0 0 1 2.614 0l1.936 3.44A1.5 1.5 0 0 1 5.435 7h-3.87A1.5 1.5 0 0 1 .257 4.765zm2.614 24.352a1.5 1.5 0 0 1-2.614 0l-1.936-3.44A1.5 1.5 0 0 1 1.565 20h3.87a1.5 1.5 0 0 1 1.308 2.235z"
              fill="var(--color-gray)"
            />
            <circle opacity=".4" cx="3.5" cy="13.5" r="1.5" fill="var(--color-gray)" />
          </svg>
        </div>
        <div
          ref={itemRef}
          role="button"
          className={styles.linkcontent}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-expanded={isMenuOpen}>
          <div className={styles.linkicon}>
            <img
              loading="lazy"
              decoding="async"
              className={styles.linksvg}
              src={baseMediaUrl + link.iconUrl}
              alt={`${link.title} icon`}
              width="24"
              height="24"
              onError={handleImageError}
            />
          </div>
          <div className={styles.linkchild}>
            <div className={styles.linkname} title="ℹ️ Link name">
              {link.title}
            </div>
            <div className={styles.linkclick} title="ℹ️ click count" aria-label={`${link.clickCount} clicks`}>
              <svg fill="none" height="16" viewBox="0 0 12 16" aria-hidden="true">
                <path
                  d="m6.7 1.8.5-1q.2-.6.8-.4.5.3.3.8L8 2.4a.6.6 0 0 1-.9.3zm-3 .2q.2.5.7.5h.1q.6-.3.5-.8L4.6.5a.6.6 0 0 0-1.2.3zm6.5 9.4Q9 15 7 15.7q-.7.3-1.4.3-1.2 0-2.3-.6a5 5 0 0 1-2.9-2.3q-.9-2 .6-5.5 1.4-3.4 3.4-4.3 1.9-.6 3.7.3Q10 4.1 11 6q.8 2-.7 5.4M2.6 7q1.5.1 3 .7l1.3-3-1.2-.3-1 .2q-1.5.8-2 2.4M9 11a12 12 0 0 0-6.9-2.8q-1.3 3-.6 4.5.7 1.2 2.1 1.7 1.4.8 2.8.3Q8 13.9 9 11m.7-4.4A3 3 0 0 0 8.1 5L6.8 8q1.5.7 2.7 1.7.7-1.6.2-3.2m-8.2-3a.6.6 0 0 0 1-.9l-1-1H.7q-.4.4 0 .9z"
                  fill="var(--color-gray)"
                />
              </svg>
              <div className={styles.clickcounter} aria-hidden="true">
                {link.clickCount.toLocaleString()}
              </div>
            </div>
          </div>

          <Dotmenu
            showSetting={isMenuOpen}
            onToggle={onToggleMenu}
            data={useMemo(
              () => [
                {
                  icon: "/icon-view.svg",
                  value: t(LanguageKey.navbar_Statistics),
                  onClick: () => {
                    const fakeEvent = {
                      stopPropagation: () => {},
                      preventDefault: () => {},
                      currentTarget: { id: t(LanguageKey.navbar_Statistics) },
                    } as unknown as MouseEvent;
                    handleClickOnIcon(fakeEvent);
                    onToggleMenu();
                  },
                },
                {
                  icon: "/edit-1.svg",
                  value: t(LanguageKey.edit),
                  onClick: () => {
                    const fakeEvent = {
                      stopPropagation: () => {},
                      preventDefault: () => {},
                      currentTarget: { id: t(LanguageKey.edit) },
                    } as unknown as MouseEvent;
                    handleClickOnIcon(fakeEvent);
                    onToggleMenu();
                  },
                },
                {
                  icon: "/delete.svg",
                  value: t(LanguageKey.delete),
                  onClick: () => {
                    const fakeEvent = {
                      stopPropagation: () => {},
                      preventDefault: () => {},
                      currentTarget: { id: t(LanguageKey.delete) },
                    } as unknown as MouseEvent;
                    handleClickOnIcon(fakeEvent);
                    onToggleMenu();
                  },
                },
              ],
              [t, handleClickOnIcon, onToggleMenu]
            )}
          />
        </div>
      </div>
    </div>
  );
}

const Link = (props: {
  data: ILink[] | null;
  addNewLink: () => void;
  handleShowDotIcons: (e: MouseEvent) => void;
  handleClickOnIcon: (e: MouseEvent) => void;
  handleUpdateOrderLinks: (orderLinks: IUpdateOrderLink) => void;
  dotIconIndex: number;
}) => {
  const { t } = useTranslation();
  const { gridSpan, hidePage, toggle } = useHideDiv(true, 82);
  const [loading, setLoading] = useState(true);
  const [linkInfo, setLinkInfo] = useState<ILink[]>([]);
  const [openMenuLinkId, setOpenMenuLinkId] = useState<number | null>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setLinkInfo((items) => {
          const oldIndex = items.findIndex((_, i) => i.toString() === active.id);
          const newIndex = items.findIndex((_, i) => i.toString() === over.id);

          const reorderedItems = arrayMove(items, oldIndex, newIndex);

          const updatedLinks: IUpdateOrderLink = {
            items: reorderedItems.map((item) => item.id),
          };
          props.handleUpdateOrderLinks(updatedLinks);

          return reorderedItems;
        });
      }
    },
    [props.handleUpdateOrderLinks]
  );

  useEffect(() => {
    if (props.data) {
      setLinkInfo(props.data);
      setLoading(false);
    }
  }, [props.data]);

  useEffect(() => {
    return () => {
      setOpenMenuLinkId(null);
    };
  }, []);

  const handleToggleMenu = useCallback(
    (linkId: number) => {
      setOpenMenuLinkId((prev) => (prev === linkId ? null : linkId));
      if (openMenuLinkId !== linkId) {
        const fakeEvent = {
          stopPropagation: () => {},
          currentTarget: { id: linkId.toString() },
        } as unknown as MouseEvent;
        props.handleShowDotIcons(fakeEvent);
      }
    },
    [openMenuLinkId, props.handleShowDotIcons]
  );

  const handleAddNewLinkKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        props.addNewLink();
      }
    },
    [props.addNewLink]
  );

  const sortableItems = useMemo(() => linkInfo.map((_, i) => i.toString()), [linkInfo]);

  return (
    <div className="tooBigCard" style={gridSpan}>
      <div
        onClick={toggle}
        className="headerChild"
        title="↕ Resize the Card"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        aria-expanded={hidePage}
        aria-label={t(LanguageKey.marketPropertieslinks)}>
        <div className="circle" aria-hidden="true"></div>
        <div className="Title">{t(LanguageKey.marketPropertieslinks)}</div>
      </div>
      {hidePage && (
        <>
          {loading && <Loading />}
          {!loading && (
            <>
              <div
                ref={addButtonRef}
                onClick={props.addNewLink}
                className={styles.addnewlink}
                title="◰ add new shortcut to your market"
                role="button"
                tabIndex={0}
                onKeyDown={handleAddNewLinkKeyDown}
                aria-label={t(LanguageKey.marketPropertiesaddnew)}>
                <div className={styles.addnewicon} aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                    <path
                      d="M22 11q-.1 1.5-1.6 1.6h-7.8v7.8a1.6 1.6 0 1 1-3.2 0v-7.8H1.6a1.6 1.6 0 1 1 0-3.2h7.8V1.6a1.6 1.6 0 1 1 3.2 0v7.8h7.8q1.5.1 1.6 1.6"
                      fill="var(--color-dark-blue)"
                    />
                  </svg>
                </div>
                <div className={styles.addnewcontent}>
                  <div className={styles.addnewheader}>{t(LanguageKey.marketPropertiesaddnew)}</div>
                </div>
              </div>

              <div className={styles.list} role="list" aria-label={t(LanguageKey.marketPropertieslinks)}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                    {linkInfo.map((link, index) => (
                      <SortableItem
                        key={link.id}
                        id={index.toString()}
                        link={link}
                        handleClickOnIcon={props.handleClickOnIcon}
                        isMenuOpen={openMenuLinkId === link.id}
                        onToggleMenu={() => handleToggleMenu(link.id)}
                        t={t}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Link;
