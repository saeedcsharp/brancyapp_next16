import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "./timeType.module.css";
import { AdsTimeType } from "brancy/models/enums";
const TimeTypeComp = (props: { timeType: AdsTimeType }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.optiontext}>
      {props.timeType === AdsTimeType.FullDay
        ? t(LanguageKey.advertiseProperties_tariff24hours)
        : t(LanguageKey.advertiseProperties_tariff12hours)}
    </div>
  );
};

export default TimeTypeComp;
