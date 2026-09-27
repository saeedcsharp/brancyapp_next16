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
        <span className="explain">{selectedCreator?.displayName ?? t("AI Model")}</span>
        <span className="title2">{selectedLabel}</span>
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
  const [activeCreatorKey, setActiveCreatorKey] = useState(selectedCreatorKey);

  useEffect(() => {
    if (selectedCreatorKey) setActiveCreatorKey(selectedCreatorKey);
  }, [selectedCreatorKey]);

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h2 id="modal-title">{t("AI Model")}</h2>
        <div className={styles.modalHeaderActions}>
          <button
            type="button"
            className={styles.featuresButton}
            onClick={() => setShowFeatures((current) => !current)}
            aria-expanded={showFeatures}
            aria-label={showFeatures ? t("Hide model features") : t("Show model features")}>
            {t("Features")}
          </button>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label={t("Close")}>
            ×
          </button>
        </div>
      </div>
      <div className={styles.creatorList}>
        {creators.map((creator) => {
          const isActive = creator.key === activeCreatorKey;
          return (
            <section className={styles.creatorSection} key={creator.key}>
              <button
                type="button"
                className={`${styles.creatorButton} ${isActive ? styles.creatorButtonActive : ""}`}
                aria-expanded={isActive}
                aria-controls={`models-${creator.key}`}
                onClick={() => setActiveCreatorKey((current) => (current === creator.key ? "" : creator.key))}>
                <div className={styles.creatorHeading}>
                  <span className={styles.creatorLogo}>
                    {creator.logo ? (
                      <img src={getClientMediaBaseUrl() + creator.logo} alt="" />
                    ) : (
                      creator.displayName.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <div>
                    <strong>{creator.displayName}</strong>
                    <span>
                      {creator.inputModels.length} {creator.inputModels.length === 1 ? t("model") : t("models")}
                    </span>
                  </div>
                </div>
                <span className={styles.creatorArrow} aria-hidden="true">
                  <img src="/forwardSliderStatistics.svg" alt="" />
                </span>
              </button>
              <div
                className={`${styles.modelListWrapper} ${isActive ? styles.modelListWrapperOpen : ""}`}
                id={`models-${creator.key}`}
                aria-hidden={!isActive}>
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
                        <div className="headerandinput">
                          <span>{model.displayName ?? model.name}</span>
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
                        <span
                          className={`${styles.cost} ${styles[`costLevel${costLevel}`]}`}
                          aria-label={t("Cost level {level}", { level: model.expensiveType + 1 })}>
                          {"$".repeat(costLevel)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
