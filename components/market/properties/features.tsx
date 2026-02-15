import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "saeed/components/notOk/loading";
import useHideDiv from "saeed/hook/useHide";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { FeatureType } from "saeed/models/market/enums";
import { IFeatureItem, IOrderFeatures, IUpdateFeatureOrder } from "saeed/models/market/properties";
import CheckBoxButton from "../../design/checkBoxButton";
import styles from "./features.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

const getFeatureClassName = (featureType: FeatureType): string => {
  switch (featureType) {
    case FeatureType.Banner:
      return "banner";
    case FeatureType.FeaturesBox:
      return "featuresbox";
    case FeatureType.Reviews:
      return "reviews";
    case FeatureType.Announcements:
      return "announcements";
    case FeatureType.OnlineStream:
      return "onlinestream";
    case FeatureType.LastVideo:
      return "lastvideo";
    case FeatureType.Products:
      return "products";
    case FeatureType.AdsTimeline:
      return "adstimeline";
    case FeatureType.QandABox:
      return "qandabox";
    case FeatureType.LinkShortcut:
      return "linkshortcut";
    case FeatureType.ContactAndMap:
      return "contactandmap";
    default:
      return "featurebox";
  }
};

const SortableFeatureItem = memo(
  ({
    feature,
    onToggle,
    onEdit,
    handleFeatureTitle,
  }: {
    feature: IFeatureItem;
    onToggle: (featureType: FeatureType, e: ChangeEvent<HTMLInputElement>) => void;
    onEdit: (featureType: FeatureType) => void;
    handleFeatureTitle: (featureType: FeatureType) => string;
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: feature.featureType.toString(),
    });
    const style = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
      }),
      [transform, transition]
    );
    const handleToggleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onToggle(feature.featureType, e);
      },
      [feature.featureType, onToggle]
    );
    const handleEditClick = useCallback(() => {
      onEdit(feature.featureType);
    }, [feature.featureType, onEdit]);
    const handleEditKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(feature.featureType);
        }
      },
      [feature.featureType, onEdit]
    );
    const featureTitle = useMemo(
      () => handleFeatureTitle(feature.featureType),
      [feature.featureType, handleFeatureTitle]
    );
    const className = useMemo(
      () => styles[getFeatureClassName(feature.featureType)] || styles.featurebox,
      [feature.featureType]
    );
    return (
      <div ref={setNodeRef} style={style} className={className}>
        <CheckBoxButton
          handleToggle={handleToggleChange}
          value={feature.isActive}
          title={"ℹ️ Feature name"}
          aria-label="Toggle feature activation"
        />
        <div
          {...attributes}
          {...listeners}
          className={styles.move}
          role="button"
          aria-label="Drag to reorder"
          tabIndex={0}
          title="ℹ️ drag drop to move">
          <svg width="15" height="30" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 27">
            <path
              d="M2.193 1.324a1.5 1.5 0 0 1 2.614 0l1.936 3.44A1.5 1.5 0 0 1 5.435 7h-3.87A1.5 1.5 0 0 1 .257 4.765zm2.614 24.352a1.5 1.5 0 0 1-2.614 0l-1.936-3.44A1.5 1.5 0 0 1 1.565 20h3.87a1.5 1.5 0 0 1 1.308 2.235z"
              fill="var(--color-gray)"
            />
            <circle opacity=".4" cx="3.5" cy="13.5" r="1.5" fill="var(--color-gray)" />
          </svg>
        </div>
        <div className={styles.boxcontent}>
          <h3 className="title2" style={{ paddingInline: "var(--padding-12)" }} title="ℹ️ Feature name">
            {featureTitle}
          </h3>
          <button
            onClick={handleEditClick}
            onKeyDown={handleEditKeyDown}
            className={styles.more}
            title="◰ Edit options"
            aria-label={`Edit ${featureTitle} options`}>
            <svg fill="none" height="5" viewBox="0 0 14 5">
              <path
                fill="var(--color-gray)"
                d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);
const Features = (props: {
  showMask: (featureId: number) => void;
  features: IOrderFeatures | null;
  handleUpdateFeature: (updateFeatures: IUpdateFeatureOrder) => void;
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { gridSpan, hidePage, toggle } = useHideDiv(true, 82);
  const [loading, setLoading] = useState(true);
  const [checkbox, setCheckbox] = useState(true);
  const [featuresItem, setFeaturesItem] = useState<IFeatureItem[]>([]);
  const isMountedRef = useRef(true);
  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleFeatureTitle = useCallback(
    (featureType: FeatureType): string => {
      switch (featureType) {
        case FeatureType.Reviews:
          return t(LanguageKey.marketPropertiesReviews);
        case FeatureType.AdsTimeline:
          return t(LanguageKey.marketPropertiesAdsTimeline);
        case FeatureType.ContactAndMap:
          return t(LanguageKey.marketPropertiesContactAndMap);
        case FeatureType.LastVideo:
          return t(LanguageKey.marketPropertiesLastVideo);
        case FeatureType.LinkShortcut:
          return t(LanguageKey.marketPropertiesLinkShortcut);
        case FeatureType.OnlineStream:
          return t(LanguageKey.marketPropertiesOnlineStream);
        case FeatureType.Announcements:
          return t(LanguageKey.marketPropertiesAnnouncements);
        case FeatureType.Products:
          return t(LanguageKey.marketPropertiesProducts);
        case FeatureType.QandABox:
          return t(LanguageKey.marketPropertiesQandABox);
        default:
          return t(LanguageKey.marketPropertiesFeaturebox);
      }
    },
    [t]
  );
  const handleToggleCheckBox = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setCheckbox(checked);
      const instagramerId = session?.user?.instagramerIds?.[session.user.currentIndex];
      if (!instagramerId) return;
      try {
        await clientFetchApi<string, boolean>("/api/bio/ToggleFeatureBox", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "enabled", value: checked.toString() },
        ], onUploadProgress: undefined });
      } catch (error) {
        if (isMountedRef.current) {
          setCheckbox(!checked);
        }
      }
    },
    [session]
  );
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setFeaturesItem((items) => {
        const oldIndex = items.findIndex((item) => item.featureType.toString() === active.id);
        const newIndex = items.findIndex((item) => item.featureType.toString() === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        const reordered = arrayMove(items, oldIndex, newIndex);
        const updateFeatures: IUpdateFeatureOrder = { orderItems: reordered };
        props.handleUpdateFeature(updateFeatures);
        return reordered;
      });
    },
    [props]
  );
  const handleCheckBox = useCallback(
    (id: number, e: ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      setFeaturesItem((prev) => {
        const updated = prev.map((x) => (x.featureType === id ? { ...x, isActive: isChecked } : x));
        const updateFeatures: IUpdateFeatureOrder = { orderItems: updated };
        props.handleUpdateFeature(updateFeatures);
        return updated;
      });
    },
    [props]
  );
  const filteredFeatures = useMemo(
    () =>
      featuresItem.filter(
        (x) =>
          x.featureType === FeatureType.Announcements ||
          x.featureType === FeatureType.QandABox ||
          x.featureType === FeatureType.OnlineStream ||
          x.featureType === FeatureType.LinkShortcut ||
          x.featureType === FeatureType.LastVideo ||
          x.featureType === FeatureType.ContactAndMap ||
          x.featureType === FeatureType.AdsTimeline ||
          x.featureType === FeatureType.Reviews ||
          x.featureType === FeatureType.Products
      ),
    [featuresItem]
  );
  const sortableIds = useMemo(() => filteredFeatures.map((item) => item.featureType.toString()), [filteredFeatures]);
  const handleBannerEdit = useCallback(
    (featureId: number) => {
      props.showMask(featureId);
    },
    [props]
  );
  const handleBannerKeyDown = useCallback(
    (e: React.KeyboardEvent, featureId: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        props.showMask(featureId);
      }
    },
    [props]
  );
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (props.features) {
      setFeaturesItem(props.features.orderItems);
      setCheckbox(props.features.isActiveFeatureBox);
      setLoading(false);
    }
  }, [props.features]);
  return (
    <section className="tooBigCard" style={gridSpan}>
      <div
        onClick={toggle}
        className="headerChild"
        title="↕ Resize the Card"
        aria-label="Toggle card size"
        aria-expanded={hidePage}>
        <div className="circle"></div>
        <h2 className="Title">{t(LanguageKey.marketPropertiesfeatures)}</h2>
      </div>
      {hidePage && (
        <>
          {loading && <Loading />}
          {!loading && (
            <div className={styles.Features}>
              <article className={styles[getFeatureClassName(FeatureType.Banner)] || styles.banner}>
                <div className="fadeDiv">
                  <CheckBoxButton handleToggle={() => {}} value={true} title={"ℹ️ Feature name"} />
                </div>
                <img className={styles.lock} title="ℹ️ can't move" aria-hidden="true" src="/lock.svg" />
                <div className={styles.boxcontent}>
                  <h3 className="title2" style={{ paddingInline: "var(--padding-12)" }} title="ℹ️ Feature name">
                    {t(LanguageKey.marketPropertiesProfileInfoBanner)}
                  </h3>
                  <button
                    onClick={() => handleBannerEdit(10)}
                    onKeyDown={(e) => handleBannerKeyDown(e, 10)}
                    className={styles.more}
                    title="◰ Edit options"
                    aria-label={`Edit ${t(LanguageKey.marketPropertiesProfileInfoBanner)} options`}>
                    <svg fill="none" height="5" viewBox="0 0 14 5" aria-hidden="true">
                      <path
                        fill="#8F9BB3"
                        d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
                      />
                    </svg>
                  </button>
                </div>
              </article>
              <article className={styles[getFeatureClassName(FeatureType.FeaturesBox)] || styles.featuresbox}>
                <CheckBoxButton handleToggle={handleToggleCheckBox} value={checkbox} title={"ℹ️ Feature name"} />
                <img className={styles.lock} title="ℹ️ can't move" aria-hidden="true" src="/lock.svg" />
                <div className={styles.boxcontent}>
                  <h3 className="title2" style={{ paddingInline: "var(--padding-12)" }} title="ℹ️ Feature name">
                    {t(LanguageKey.marketPropertiesFeaturebox)}
                  </h3>
                  <button
                    onClick={() => handleBannerEdit(0)}
                    onKeyDown={(e) => handleBannerKeyDown(e, 0)}
                    className={styles.more}
                    title="◰ Edit options"
                    aria-label={`Edit ${t(LanguageKey.marketPropertiesFeaturebox)} options`}>
                    <svg fill="none" height="5" viewBox="0 0 14 5" aria-hidden="true">
                      <path
                        fill="var(--color-gray)"
                        d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
                      />
                    </svg>
                  </button>
                </div>
              </article>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  {filteredFeatures.map((feature) => (
                    <SortableFeatureItem
                      key={feature.featureType}
                      feature={feature}
                      onToggle={handleCheckBox}
                      onEdit={handleBannerEdit}
                      handleFeatureTitle={handleFeatureTitle}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Features;
