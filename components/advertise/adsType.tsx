import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { AdsType } from "brancy/models/advertise/AdEnums";
import styles from "./adsType.module.css";
const AdsTypeComp = (props: { adType: AdsType }) => {
  const { t } = useTranslation();
  return (
    <>
      {props.adType === AdsType.CampaignAd && (
        <div className={styles.campaign}>{t(LanguageKey.advertiseProperties_Campaign)}</div>
      )}
      {props.adType === AdsType.PostAd && <div className={styles.post}>{t(LanguageKey.navbar_Post)}</div>}
      {props.adType === AdsType.StoryAd && <div className={styles.story}>{t(LanguageKey.navbar_Story)}</div>}
    </>
  );
};

export default AdsTypeComp;
