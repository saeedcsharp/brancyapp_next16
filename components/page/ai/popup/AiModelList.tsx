import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { IMediaCreator } from "brancy/models/interfaces";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./AiModelList.module.css";

const titleByLanguage: Record<
  string,
  "titleEn" | "titleFa" | "titleTr" | "titleAr" | "titleFr" | "titleDe" | "titleAz"
> = {
  en: "titleEn",
  fa: "titleFa",
  tr: "titleTr",
  ar: "titleAr",
  fr: "titleFr",
  de: "titleDe",
  az: "titleAz",
};

const creatorIconByName: Record<string, string> = {
  alibaba: "alibaba.svg",
  bytedance: "ByteDance.svg",
  chatgptimage: "OpenAI.svg",
  claude: "claude.svg",
  copilot: "copilot.svg",
  deepseek: "deepseek.svg",
  flux: "flux.svg",
  gemini: "Gemini.svg",
  google: "google.svg",
  grok: "grok.svg",
  kling: "Kling.svg",
  meta: "meta.svg",
  midjourney: "midjourney.svg",
  minimax: "minimax.svg",
  nanobanana: "nanobanana.svg",
  nvidia: "Nvidia.svg",
  ollama: "ollama.svg",
  openai: "OpenAI.svg",
  perplexity: "perplexity.svg",
  pixverse: "PixVerse.svg",
  qwen: "Qwen.svg",
  runway: "runway.svg",
  vidu: "Vidu.svg",
  kwaivgi: "Kling.svg",
};

function getCreatorIcon(displayName: string): string | undefined {
  const normalizedName = displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const iconName = Object.keys(creatorIconByName).find(
    (name) => normalizedName === name || normalizedName.includes(name) || name.includes(normalizedName),
  );

  return iconName ? `/AIIcons/${creatorIconByName[iconName]}` : undefined;
}

function getModelFeatureLabels(model: IMediaCreator["inputModels"][number] | undefined, language: string): string[] {
  if (!model) return [];
  const languageKey = titleByLanguage[language.split("-")[0]] ?? "titleEn";
  return Array.from(
    new Set(
      model.inputModelTypes
        .map((input) => input[languageKey] || input.titleEn || input.key)
        .map((title) => title.trim())
        .filter(Boolean),
    ),
  );
}

function getModelCategories(models: IMediaCreator["inputModels"]): string[] {
  return Array.from(new Set(models.map((model) => model.category).filter(Boolean)));
}

type ModelModeIcon = "text" | "video" | "image" | "extend" | "editImage" | "editVideo" | "referenceVideo";

function getModelModeIcons(model: IMediaCreator["inputModels"][number]): ModelModeIcon[] {
  const mode = (model.displayName ?? model.name).toLowerCase().replace(/[^a-z0-9]/g, "");
  const category = model.category.toLowerCase();

  if (mode.includes("texttovideo")) return ["text", "video"];
  if (mode.includes("imagetovideo")) return ["image", "video"];
  if (mode.includes("texttoimage")) return ["text", "image"];
  if (mode.includes("referencetovideo") || mode.includes("refrencetovideo")) return ["referenceVideo"];
  if (mode.includes("editimage")) return ["editImage"];
  if (mode.includes("editvideo")) return ["editVideo"];
  if (mode === "edit") return [category.includes("video") ? "editVideo" : "editImage"];
  if (mode.includes("extend")) return ["extend"];

  return [];
}

function ModelModeIcons({ model }: { model: IMediaCreator["inputModels"][number] }) {
  const icons = getModelModeIcons(model);
  const label = model.displayName ?? model.name;

  if (icons.length === 0) return <span className="explain">{label}</span>;

  return (
    <span className={styles.modelModeIcons} aria-label={label} title={label}>
      {icons.map((icon, index) => (
        <span className={styles.modelModeIcon} key={icon}>
          {index > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              color="currentColor"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24">
              <path d="M18.5 12H5m8 6s6-4.4 6-6-6-6-6-6" />
            </svg>
          )}
          <ModelModeIcon icon={icon} />
        </span>
      ))}
    </span>
  );
}

function ModelModeIcon({ icon }: { icon: ModelModeIcon }) {
  const commonProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    color: "currentColor",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (icon === "text") {
    return (
      <svg {...commonProps}>
        <path d="M7 9.5c-.2-2 1-2.4 5-2.5m0 0c4.1.1 5.3.6 5 2.5M12 7v10m-2 0h4" />
        <path d="M3.9 3.9C2.5 5.3 2.5 7.5 2.5 12s0 6.7 1.4 8.1 3.6 1.4 8.1 1.4 6.7 0 8.1-1.4 1.4-3.6 1.4-8.1 0-6.7-1.4-8.1-3.6-1.4-8.1-1.4-6.7 0-8.1 1.4Z" />
      </svg>
    );
  }

  if (icon === "video") {
    return (
      <svg {...commonProps}>
        <path d="M2.5 7.5h19m-4.5-5-3 5m-4-5-3 5" />
        <path d="M2.5 12c0-4.48 0-6.72 1.4-8.1C5.27 2.5 7.51 2.5 12 2.5s6.72 0 8.1 1.4c1.4 1.38 1.4 3.62 1.4 8.1s0 6.72-1.4 8.1c-1.38 1.4-3.62 1.4-8.1 1.4s-6.72 0-8.1-1.4c-1.4-1.38-1.4-3.62-1.4-8.1Z" />
        <path d="M14.95 14.9c-.15.62-.86 1.06-2.3 1.95-1.38.86-2.07 1.28-2.63 1.11q-.35-.1-.61-.39C9 17.12 9 16.25 9 14.5s0-2.62.41-3.07q.26-.28.61-.4c.56-.16 1.25.26 2.63 1.12 1.44.89 2.15 1.33 2.3 1.96q.1.39 0 .78Z" />
      </svg>
    );
  }

  if (icon === "image") {
    return (
      <svg {...commonProps}>
        <path d="m3 16 4.47-4.47a1.8 1.8 0 0 1 2.56 0L14 15.5m1.5 1.5L14 15.5m7 .5-2.47-2.47a1.8 1.8 0 0 0-2.56 0L14 15.5M15.5 8a.5.5 0 0 0 0-1m0 1a.5.5 0 0 1 0-1m0 1V7" />
        <path d="M3.7 19.75c-1.2-1.4-1.2-3.52-1.2-7.75s0-6.34 1.2-7.75a5 5 0 0 1 .55-.55C5.65 2.5 7.77 2.5 12 2.5s6.34 2.5 7.75 1.2a5 5 0 0 1 .55.55c1.2 1.4 1.2 3.52 1.2 7.75s0 6.34-1.2 7.75a5 5 0 0 1-.55.55c-1.4 1.2-3.52 1.2-7.75 1.2s-6.34 0-7.75-1.2a5 5 0 0 1-.55-.55Z" />
      </svg>
    );
  }

  if (icon === "extend") {
    return (
      <svg {...commonProps}>
        <path d="M2.5 12c0-4.5 0-6.7 1.4-8.1S7.5 2.5 12 2.5s6.7 0 8.1 1.4 1.4 3.6 1.4 8.1 0 6.7-1.4 8.1-3.6 1.4-8.1 1.4-6.7 0-8.1-1.4-1.4-3.6-1.4-8.1Z M6 12h12M6 12c0-.7 2-2 2.5-2.5M6 12c0 .7 2 2 2.5 2.5M18 12c0-.7-2-2-2.5-2.5M18 12c0 .7-2 2-2.5 2.5" />
      </svg>
    );
  }

  if (icon === "referenceVideo") {
    return (
      <svg {...commonProps}>
        <path d="M3 5h11a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3z" />
        <path d="m17 10 4-2v8l-4-2M7 12h5m-2.5-2.5v5" />
      </svg>
    );
  }

  if (icon === "editVideo") {
    return (
      <svg {...commonProps}>
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m10 10 2 2m5 5-2.5-2.5M10 14l2-2m5-5-5 5" />
        <circle cx="8.5" cy="15.5" r="1.5" />
        <path d="M14 21.5q.81 0 1.5-.03m-5.5.03q-.81 0-1.5-.03m10.5-.6q.64-.28 1.1-.76c1.4-1.39 1.4-3.63 1.4-8.1 0-4.49 0-6.73-1.4-8.12C18.73 2.5 16.49 2.5 12 2.5s-6.72 0-8.1 1.4C2.5 5.27 2.5 7.51 2.5 12s0 6.72 1.4 8.11q.46.48 1.1.76" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M3 16 7.47 11.53a1.8 1.8 0 0 1 2.56 0L13 14.5M3 10v3.5c0 3.29 0 4.93.9 6.04a4 4 0 0 0 .56.55c1.1.91 2.75.91 6.04.91M10 3h4.5c2.33 0 3.5 0 4.39.47a4 4 0 0 1 1.64 1.64C21 6 21 7.17 21 9.5M4.5 2.94V6.06m0-1.56H3.25m1.25 0h1.25M7 4.5l-1.08-.36c-.5-.17-.9-.56-1.06-1.06L4.5 2l-.36 1.08c-.17.5-.56.9-1.06 1.06L2 4.5l1.08.36c.5.17.9.56 1.06 1.06L4.5 7l.36-1.08c.17-.5.56-.9 1.06-1.06zM16.5 8a.5.5 0 0 0 0-1m0 1a.5.5 0 0 1 0-1m0 1V7m2 8 1.5 1.5m1.43-3.07.14.14a1.5 1.5 0 0 1 0 2.08l-4.76 4.76a2 2 0 0 1-1.42.59h-.89a.5.5 0 0 1-.5-.5v-.9a2 2 0 0 1 .59-1.4l4.76-4.77a1.5 1.5 0 0 1 2.08 0Z" />
    </svg>
  );
}

type ModelSortKey = "category" | "name" | "price" | "expensiveType" | "features";
type SortDirection = "asc" | "desc";

function sortModels(
  models: IMediaCreator["inputModels"],
  sortKey: ModelSortKey,
  sortDirection: SortDirection,
  language: string,
) {
  return [...models].sort((firstModel, secondModel) => {
    const firstValue =
      sortKey === "features"
        ? getModelFeatureLabels(firstModel, language).join(", ")
        : sortKey === "name"
          ? (firstModel.displayName ?? firstModel.name)
          : firstModel[sortKey];
    const secondValue =
      sortKey === "features"
        ? getModelFeatureLabels(secondModel, language).join(", ")
        : sortKey === "name"
          ? (secondModel.displayName ?? secondModel.name)
          : secondModel[sortKey];

    const comparison =
      typeof firstValue === "number" && typeof secondValue === "number"
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue), language, { numeric: true, sensitivity: "base" });

    return sortDirection === "asc" ? comparison : -comparison;
  });
}

interface AiModelListProps {
  creators: IMediaCreator[];
  selectedCreatorKey: string;
  selectedModelName: string;
  onOpen: () => void;
}

export default function AiModelList({ creators, selectedCreatorKey, selectedModelName, onOpen }: AiModelListProps) {
  const { t } = useTranslation();
  const selectedCreator = creators.find((creator) => creator.key === selectedCreatorKey) ?? creators[0];
  const selectedModel = selectedCreator?.inputModels.find((model) => model.name === selectedModelName);
  const selectedLabel = selectedModel?.displayName ?? selectedModel?.name ?? t("Select a model");

  return (
    <button type="button" className={`${styles.trigger} translate`} onClick={onOpen} aria-haspopup="dialog">
      <div className={styles.triggerInfo}>
        <span className={styles.creatorLogo}>
          {getCreatorIcon(selectedCreator.displayName) ? (
            <img src={getCreatorIcon(selectedCreator.displayName)} alt={selectedCreator.displayName} />
          ) : selectedCreator.logo ? (
            <img src={getClientMediaBaseUrl() + selectedCreator.logo} alt={selectedCreator.displayName} />
          ) : (
            selectedCreator.displayName.slice(0, 1).toUpperCase()
          )}
        </span>
        <div className="headerandinput" style={{ gap: "1px" }}>
          <span className="title2">{selectedCreator?.displayName ?? t("AI Model")}</span>
          {selectedModel ? (
            <span className={styles.modelModeIcons} style={{ gap: "5px" }}>
              <ModelModeIcons model={selectedModel} />
              {selectedModel.displayName ?? selectedModel.name}
            </span>
          ) : (
            <span className="explain">{selectedLabel}</span>
          )}
        </div>
      </div>
      <svg
        className={styles.foldingicon}
        width="21"
        height="21"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
        style={{
          transform: `rotate(90deg)`,
        }}>
        <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5"></path>
        <path
          fill="var(--text-h1)"
          d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"></path>
      </svg>
    </button>
  );
}

interface AiModelListContentProps extends Omit<AiModelListProps, "onOpen"> {
  onSelect: (creatorKey: string, modelName: string) => void;
  onClose: () => void;
}

export function AiModelListContent({
  creators,
  selectedCreatorKey,
  selectedModelName,
  onSelect,
  onClose,
}: AiModelListContentProps) {
  const { t, i18n } = useTranslation();
  const [showFeatures, setShowFeatures] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [activeCreatorKey, setActiveCreatorKey] = useState(selectedCreatorKey);
  const [activeCategory, setActiveCategory] = useState("");
  const [sortKey, setSortKey] = useState<ModelSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (nextSortKey: ModelSortKey) => {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextSortKey);
    setSortDirection("asc");
  };

  const handleSortKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>, nextSortKey: ModelSortKey) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSort(nextSortKey);
    }
  };

  useEffect(() => {
    if (!selectedCreatorKey) return;

    setActiveCreatorKey(selectedCreatorKey);
    const creator = creators.find((item) => item.key === selectedCreatorKey);
    const selectedModel = creator?.inputModels.find((model) => model.name === selectedModelName);
    setActiveCategory(selectedModel?.category ?? getModelCategories(creator?.inputModels ?? [])[0] ?? "");
  }, [creators, selectedCreatorKey, selectedModelName]);

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <div className="title" id="modal-title">
          {t("SettingGeneralAiModelsTitle")}
        </div>
        <div className={styles.modalHeaderActions}>
          <button
            type="button"
            className={styles.featuresButton}
            onClick={() => setShowFeatures((current) => !current)}
            aria-expanded={showFeatures}
            aria-label={showFeatures ? t("Hide model features") : t("Show model features")}>
            {t("product_Properties")}
          </button>
          <button
            type="button"
            className={styles.viewButton}
            onClick={() => setShowTable((current) => !current)}
            aria-pressed={showTable}
            aria-label={t("product_PreviewTable")}
            title={t("product_PreviewTable")}>
            {showTable ? (
              <svg
                className={styles.showTableButton}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true">
                <path d="M2 18c0-1.54 0-2.31.35-2.88q.3-.48.77-.77C3.7 14 4.46 14 6 14s2.31 0 2.88.35q.48.3.77.77c.35.57.35 1.34.35 2.88s0 2.31-.35 2.88q-.3.47-.77.77C8.3 22 7.54 22 6 22s-2.31 0-2.88-.35q-.48-.3-.77-.77C2 20.3 2 19.54 2 18Zm12 0c0-1.54 0-2.31.35-2.88q.3-.48.77-.77C15.7 14 16.46 14 18 14s2.31 0 2.88.35q.47.3.77.77c.35.57.35 1.34.35 2.88s0 2.31-.35 2.88q-.3.47-.77.77C20.3 22 19.54 22 18 22s-2.31 0-2.88-.35q-.48-.3-.77-.77C14 20.3 14 19.54 14 18ZM2 6c0-1.54 0-2.31.35-2.88q.3-.48.77-.77C3.7 2 4.46 2 6 2s2.31 0 2.88.35q.48.3.77.77C10 3.7 10 4.46 10 6s0 2.31-.35 2.88q-.3.48-.77.77C8.3 10 7.54 10 6 10s-2.31 0-2.88-.35q-.48-.3-.77-.77C2 8.3 2 7.54 2 6Zm12 0c0-1.54 0-2.31.35-2.88q.3-.48.77-.77C15.7 2 16.46 2 18 2s2.31 0 2.88.35q.47.3.77.77C22 3.7 22 4.46 22 6s0 2.31-.35 2.88q-.3.48-.77.77C20.3 10 19.54 10 18 10s-2.31-.35-2.88-.77q-.48-.3-.77-.77C14 8.3 14 7.54 14 6Z" />
              </svg>
            ) : (
              <svg
                className={styles.showTableButton}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true">
                <path d="M3.9 20.1c-1.4-1.4-1.4-3.6-1.4-8.1s0-6.7 1.4-8.1S7.5 2.5 12 2.5s6.7 0 8.1 1.4 1.4 3.6 1.4 8.1 0 6.7-1.4 8.1-3.6 1.4-8.1 1.4-6.7 0-8.1-1.4 M2.5 9h19m-19 4h19m-19 4h19 M12 21.5V9" />
              </svg>
            )}
          </button>
          <img
            style={{ cursor: "pointer", width: "38px", height: "38px" }}
            src="/close-box.svg"
            onClick={onClose}
            aria-label={t("Close")}
          />
        </div>
      </div>
      <div className={`${styles.creatorList} translate`}>
        {creators.map((creator) => {
          const isActive = creator.key === activeCreatorKey;
          const categories = getModelCategories(creator.inputModels);
          const selectedCategory = categories.includes(activeCategory) ? activeCategory : (categories[0] ?? "");
          const visibleModels = creator.inputModels.filter((model) => model.category === selectedCategory);
          return (
            <section className={`${styles.creatorSection} translate`} key={creator.key}>
              <button
                type="button"
                className={`${styles.creatorButton} ${isActive ? styles.creatorButtonActive : ""}`}
                aria-expanded={isActive}
                aria-controls={`models-${creator.key}`}
                onClick={() => {
                  setActiveCreatorKey((current) => (current === creator.key ? "" : creator.key));
                  setActiveCategory(
                    creator.inputModels.find((model) => model.name === selectedModelName)?.category ??
                      categories[0] ??
                      "",
                  );
                }}>
                <div className={styles.creatorHeading}>
                  <span className={styles.creatorLogo}>
                    {getCreatorIcon(creator.displayName) ? (
                      <img src={getCreatorIcon(creator.displayName)} alt={creator.displayName} />
                    ) : creator.logo ? (
                      <img src={getClientMediaBaseUrl() + creator.logo} alt={creator.displayName} />
                    ) : (
                      creator.displayName.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <div className="headerandinput">
                    <div className="title2">
                      {creator.displayName}{" "}
                      <span className="IDgray">
                        {creator.inputModels.length}
                        {/* {creator.inputModels.length === 1 ? t("model") : t("models")} */}
                      </span>
                    </div>
                  </div>
                </div>
                <svg
                  className={styles.creatorArrow}
                  width="21"
                  height="21"
                  viewBox="0 0 22 22"
                  fill="none"
                  aria-hidden="true">
                  <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5"></path>
                  <path
                    fill="var(--text-h1)"
                    d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"></path>
                </svg>
              </button>
              <div
                className={`${styles.modelListWrapper} ${isActive ? styles.modelListWrapperOpen : ""}`}
                id={`models-${creator.key}`}
                aria-hidden={!isActive}>
                <div className={styles.modelListWrapperContent}>
                  {showTable ? (
                    <div className={styles.modelTableWrapper}>
                      <table className={styles.modelTable}>
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className={styles.sortableHeader}
                              onClick={() => handleSort("category")}
                              onKeyDown={(event) => handleSortKeyDown(event, "category")}
                              tabIndex={0}
                              role="button"
                              aria-sort={
                                sortKey === "category" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                              }>
                              {t("SettingGeneralAiModelsTitle")}
                            </th>
                            <th
                              scope="col"
                              className={styles.sortableHeader}
                              onClick={() => handleSort("name")}
                              onKeyDown={(event) => handleSortKeyDown(event, "name")}
                              tabIndex={0}
                              role="button"
                              aria-sort={
                                sortKey === "name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                              }>
                              {t("product_Properties")}
                            </th>
                            <th
                              scope="col"
                              className={styles.sortableHeader}
                              onClick={() => handleSort("price")}
                              onKeyDown={(event) => handleSortKeyDown(event, "price")}
                              tabIndex={0}
                              role="button"
                              aria-sort={
                                sortKey === "price" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                              }>
                              {t("TokenUsage")}
                            </th>
                            <th
                              scope="col"
                              className={styles.sortableHeader}
                              onClick={() => handleSort("expensiveType")}
                              onKeyDown={(event) => handleSortKeyDown(event, "expensiveType")}
                              tabIndex={0}
                              role="button"
                              aria-sort={
                                sortKey === "expensiveType"
                                  ? sortDirection === "asc"
                                    ? "ascending"
                                    : "descending"
                                  : "none"
                              }>
                              {t("pricing")}
                            </th>
                            {showFeatures && (
                              <th
                                scope="col"
                                className={styles.sortableHeader}
                                onClick={() => handleSort("features")}
                                onKeyDown={(event) => handleSortKeyDown(event, "features")}
                                tabIndex={0}
                                role="button"
                                aria-sort={
                                  sortKey === "features"
                                    ? sortDirection === "asc"
                                      ? "ascending"
                                      : "descending"
                                    : "none"
                                }>
                                {t("product_Properties")}
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {sortModels(creator.inputModels, sortKey, sortDirection, i18n.language || "en").map(
                            (model) => {
                              const isSelected = creator.key === selectedCreatorKey && model.name === selectedModelName;
                              const featureLabels = getModelFeatureLabels(model, i18n.language || "en");
                              const costLevel = Math.min(Math.max(model.expensiveType + 1, 1), 4);
                              return (
                                <tr
                                  className={isSelected ? styles.modelTableRowSelected : ""}
                                  key={model.name}
                                  onClick={() => {
                                    onSelect(creator.key, model.name);
                                    onClose();
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      event.preventDefault();
                                      onSelect(creator.key, model.name);
                                      onClose();
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  aria-pressed={isSelected}>
                                  <td>{model.category}</td>
                                  <td>
                                    <span className={styles.modelModeIcons} style={{ gap: "5px" }}>
                                      <ModelModeIcons model={model} />
                                      {model.displayName ?? model.name}
                                    </span>
                                  </td>

                                  <td>
                                    <span className="explain">{model.price.toLocaleString()} </span>
                                  </td>

                                  <td>
                                    <span
                                      className={`${styles.cost} ${styles[`costLevel${costLevel}`]}`}
                                      aria-label={t("Cost level {level}", { level: model.expensiveType + 1 })}>
                                      {"$".repeat(costLevel)}
                                    </span>
                                  </td>

                                  {showFeatures && (
                                    <td className={styles.tableFeatures}>
                                      {featureLabels.length > 0 ? (
                                        <div className={styles.tableFeatureList}>
                                          {featureLabels.map((featureLabel) => (
                                            <span
                                              className={`IDgray ${styles.modelFeatures}`}
                                              key={featureLabel}
                                              title={featureLabel}>
                                              {featureLabel}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                  )}
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      <div className={styles.categoryList} role="tablist" aria-label={t("AI model categories")}>
                        {categories.map((category) => (
                          <button
                            type="button"
                            className={`${styles.categoryButton} ${selectedCategory === category ? styles.categoryButtonActive : ""}`}
                            key={category}
                            role="tab"
                            aria-selected={selectedCategory === category}
                            onClick={() => setActiveCategory(category)}>
                            {category}
                          </button>
                        ))}
                      </div>
                      <div className={styles.modelList}>
                        {visibleModels.map((model) => {
                          const isSelected = creator.key === selectedCreatorKey && model.name === selectedModelName;
                          const featureLabels = getModelFeatureLabels(model, i18n.language || "en");
                          const costLevel = Math.min(Math.max(model.expensiveType + 1, 1), 4);
                          return (
                            <button
                              type="button"
                              className={isSelected ? styles.modelSelected : styles.model}
                              key={model.name}
                              onClick={() => {
                                onSelect(creator.key, model.name);
                                onClose();
                              }}
                              aria-pressed={isSelected}>
                              <div className={styles.headerandinput} style={{ gap: "1px" }}>
                                <div className="headerparent">
                                  <span>{model.displayName ?? model.name}</span>
                                  <span
                                    className={`${styles.cost} ${styles[`costLevel${costLevel}`]}`}
                                    aria-label={t("Cost level {level}", { level: model.expensiveType + 1 })}>
                                    {"$".repeat(costLevel)}
                                  </span>
                                </div>
                                <div className="headerparent">
                                  <span className={styles.modelModeIcons} style={{ gap: "5px" }}>
                                    <ModelModeIcons model={model} />
                                  </span>
                                  <span className="explain">{model.price.toLocaleString()} </span>
                                </div>
                              </div>
                              <div
                                className={`${styles.modelFeatureList} ${showFeatures ? styles.modelFeatureListOpen : ""}`}
                                aria-hidden={!showFeatures}>
                                {featureLabels.map((featureLabel) => (
                                  <span
                                    className={`IDgray ${styles.modelFeatures}`}
                                    key={featureLabel}
                                    title={featureLabel}>
                                    {featureLabel}
                                  </span>
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
