import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/page/tools/popups/lottery/shareWinnerPickerTerms.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const ShareTermsAndCondition = (props: {
  // data: ITermsAndConditionProps;
  shareTermsInfo: { lotteryId: string; backgroundUrl: string };
  removeMask: () => void;
  backButton: () => void;
  shareStory: (lotteryId: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.header}>{t(LanguageKey.ShareTermsAndCondition)}</div>
      <img
        style={{
          position: "relative",
          width: "max-content",
          height: "70%",
          alignSelf: "center",
          borderRadius: "15px",
        }}
        src={basePictureUrl + props.shareTermsInfo.backgroundUrl}
      />
      <div className="ButtonContainer">
        <button onClick={props.backButton} className="cancelButton">
          {t(LanguageKey.close)}
        </button>
        <button onClick={() => props.shareStory(props.shareTermsInfo.lotteryId)} className="saveButton">
          {t(LanguageKey.shareStory)}
        </button>
      </div>
    </>
  );
};

export default ShareTermsAndCondition;
