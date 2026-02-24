import { t } from "i18next";
import { useState } from "react";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import { LanguageKey } from "brancy/i18n";
import styles from "./termsandcondition.module.css";

export default function TermsAndCondition({ onAccept }: { onAccept: (accepted: boolean) => void }) {
  const [isAccepted, setIsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAccepted(e.target.checked);
    onAccept(e.target.checked);
    if (e.target.checked) {
      setShowTerms(false);
    }
  };

  // تعیین کلاس برای موفقیت
  const stepClass = isAccepted ? `${styles.progressStep} ${styles.progressStepSuccess}` : styles.progressStep;

  return (
    <div className={stepClass}>
      <div className="headerparent">
        <div className="instagramprofile">
          <img width="25px" height="25px" src={isAccepted ? "/click-hashtag.svg" : "/attention.svg"} />
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.Storeproduct_TermsAndCondition)}</div>
            <div className="explain">
              {isAccepted
                ? t(LanguageKey.Storeproduct_TermsAndConditionesuccess)
                : t(LanguageKey.Storeproduct_TermsAndConditionExplain)}
            </div>
          </div>
        </div>
        {/* دکمه فقط زمانی که تایید نشده نمایش داده شود */}
        {!isAccepted && (
          <button className={`${styles.btn} cancelButton`} onClick={() => setShowTerms((prev) => !prev)}>
            {showTerms ? t(LanguageKey.close) : t(LanguageKey.accept)}
          </button>
        )}
      </div>
      {/* فقط زمانی که تایید نشده و showTerms باز است نمایش داده شود */}
      <div className={`${styles.UploadContainer} ${showTerms && !isAccepted ? styles.show : styles.hide}`}>
        <div className={styles.termsContainer}>
          <CheckBoxButton
            value={isAccepted}
            handleToggle={handleCheckboxChange}
            title=""
            textlabel={t(LanguageKey.Storeproduct_AcceptTermsAndCondition)}
          />
          <div className={styles.downloadterms}>
            <img
              style={{ cursor: "pointer", width: "60px", height: "60px", padding: "5px" }}
              title="ℹ️ temrs and conditions attachment"
              src="/attachment.svg"
            />
            {t(LanguageKey.download)}
          </div>
        </div>
      </div>
    </div>
  );
}
