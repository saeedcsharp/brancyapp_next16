import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import RadioButton from "brancy/components/design/radioButton/radioButton";
import { LanguageKey } from "brancy/i18n";
import styles from "./product.module.css";

export default function ProductPopup({ removeMask }: { removeMask: () => void }) {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState<"last10" | "bestSelling">("last10");

  const handleOptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedMode(event.target.value as "last10" | "bestSelling");
  };

  return (
    <div className={styles.container}>
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.marketPropertiesProducts)}</div>
        <div className="explain">{t(LanguageKey.marketPropertiesProduct)}</div>
      </div>

      <div className={styles.options} role="radiogroup" aria-label={t(LanguageKey.marketPropertiesProducts)}>
        <RadioButton
          id="product-last-10"
          name="product-sort-mode"
          value="last10"
          checked={selectedMode === "last10"}
          onChange={handleOptionChange}
          className={`${styles.option}${selectedMode === "last10" ? ` ${styles.optionActive}` : ""}`}
          label={t(LanguageKey.marketProperties_showLast10Products)}
        />

        <RadioButton
          id="product-best-selling"
          name="product-sort-mode"
          value="bestSelling"
          checked={selectedMode === "bestSelling"}
          onChange={handleOptionChange}
          className={`${styles.option}${selectedMode === "bestSelling" ? ` ${styles.optionActive}` : ""}`}
          label={t(LanguageKey.marketProperties_showBestSellingProducts)}
        />
      </div>

      <div className="ButtonContainer">
        <button type="button" className="saveButton" onClick={removeMask}>
          {t(LanguageKey.save)}
        </button>
      </div>
    </div>
  );
}
