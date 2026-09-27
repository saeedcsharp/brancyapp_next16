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

        <span className="title2">
          {selectedCreator?.displayName ?? t("AI Model")}
          {selectedLabel}
        </span>
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
    if (selectedCreatorKey) setActiveCreatorKey(selectedCreatorKey);
  }, [selectedCreatorKey]);

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
          return (
            <section className={`${styles.creatorSection} translate`} key={creator.key}>
              <button
                type="button"
                className={`${styles.creatorButton} ${isActive ? styles.creatorButtonActive : ""}`}
                aria-expanded={isActive}
                aria-controls={`models-${creator.key}`}
                onClick={() => setActiveCreatorKey((current) => (current === creator.key ? "" : creator.key))}>
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
                                sortKey === "features" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                              }>
                              {t("product_Properties")}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {sortModels(creator.inputModels, sortKey, sortDirection, i18n.language || "en").map((model) => {
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
                                <span className={styles.modelTableSelect}>{model.displayName ?? model.name}</span>
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
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.modelList}>
                    {creator.inputModels.map((model) => {
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
                          <div className="headerandinput" style={{ gap: "1px" }}>
                            <div className="headerparent">
                              <span>{model.category}</span>
                              <span
                                className={`${styles.cost} ${styles[`costLevel${costLevel}`]}`}
                                aria-label={t("Cost level {level}", { level: model.expensiveType + 1 })}>
                                {"$".repeat(costLevel)}
                              </span>
                            </div>
                            <div className="headerparent">
                              <span className="explain">{model.displayName ?? model.name}</span>
                              <span className="explain">{model.price.toLocaleString()} </span>
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
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
