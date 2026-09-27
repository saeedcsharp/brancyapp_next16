import Modal from "brancy/components/design/modal";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { IMediaCreator } from "brancy/models/interfaces";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./AiModelList.module.css";

interface AiModelListProps {
  creators: IMediaCreator[];
  selectedCreatorKey: string;
  selectedModelName: string;
  onSelect: (creatorKey: string, modelName: string) => void;
}

export default function AiModelList({ creators, selectedCreatorKey, selectedModelName, onSelect }: AiModelListProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCreatorKey, setActiveCreatorKey] = useState(selectedCreatorKey);
  const selectedCreator = creators.find((creator) => creator.key === selectedCreatorKey) ?? creators[0];
  const selectedModel = selectedCreator?.inputModels.find((model) => model.name === selectedModelName);
  const selectedLabel = selectedModel?.displayName ?? selectedModel?.name ?? t("Select a model");

  useEffect(() => {
    if (selectedCreatorKey) setActiveCreatorKey(selectedCreatorKey);
  }, [selectedCreatorKey]);

  const handleSelect = (creatorKey: string, modelName: string) => {
    onSelect(creatorKey, modelName);
    setIsOpen(false);
  };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setIsOpen(true)} aria-haspopup="dialog">
        <span className={styles.triggerInfo}>
          <span className={styles.triggerLabel}>{selectedCreator?.displayName ?? t("AI Model")}</span>
          <strong>{selectedLabel}</strong>
        </span>
        <svg
          className={styles.foldingicon}
          width="21"
          height="21"
          viewBox="0 0 22 22"
          fill="none"
          role="button"
          tabIndex={0}
          style={{
            transform: `rotate(90deg)`,
          }}>
          <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5"></path>
          <path
            fill="var(--text-h1)"
            d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"></path>
        </svg>
      </button>
      <Modal closePopup={() => setIsOpen(false)} classNamePopup="popupLarge" showContent={isOpen}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 id="modal-title">{t("AI Model")}</h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label={t("Close")}>
              ×
            </button>
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
                    onClick={() => setActiveCreatorKey(creator.key)}>
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
                        return (
                          <button
                            type="button"
                            className={isSelected ? styles.modelSelected : styles.model}
                            key={model.name}
                            onClick={() => handleSelect(creator.key, model.name)}
                            aria-pressed={isSelected}>
                            <span>{model.displayName ?? model.name}</span>
                            <span
                              className={styles.cost}
                              aria-label={t("Cost level {level}", { level: model.expensiveType + 1 })}>
                              {"$".repeat(model.expensiveType + 1)}
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
      </Modal>
    </>
  );
}
