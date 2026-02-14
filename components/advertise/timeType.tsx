import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import { AdsTimeType } from "saeed/models/advertise/AdEnums";
import styles from "./timeType.module.css";
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
