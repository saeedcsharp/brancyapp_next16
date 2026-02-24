import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "./counterDown.module.css";
import SVGCircle from "brancy/components/design/counterDown/svgCircle";
// Stackoverflow: https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
function mapNumber(number: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return ((number - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

function convertUnixtimeToDHM(unixTime: number) {
  let unixNow = Date.now();
  const diffTime = Math.abs(unixTime - unixNow);
  const desDays = diffTime / (1000 * 60 * 60 * 24);
  const intdays = Math.floor(desDays);
  const desHoures = (desDays - intdays) * 24;
  const intHoures = Math.floor(desHoures);
  const desMinutes = (desHoures - intHoures) * 60;
  const intMinutes = Math.floor(desMinutes);
  return { intdays, intHoures, intMinutes };
}

const ConstantCounterDown = (prob: {
  unixTime: number;
  classNamewrapper: string;
  colorSvg: string;
  colorTimeTitle: string;
}) => {
  const days = convertUnixtimeToDHM(prob.unixTime).intdays;
  const minutes = convertUnixtimeToDHM(prob.unixTime).intMinutes;
  const hours = convertUnixtimeToDHM(prob.unixTime).intHoures;
  const [revMinutes, setRevMinutes] = useState<number>(0);
  const [revHours, setRevHours] = useState<number>(0);
  const [revDays, setRevDays] = useState<number>(0);

  const daysRadius = mapNumber(revDays, 30, 0, 0, 360);
  const hoursRadius = mapNumber(revHours, 24, 0, 0, 360);
  const minutesRadius = mapNumber(revMinutes, 60, 0, 0, 360);

  const initialzingRing = () => {
    if (minutes > -1) {
      setRevMinutes(60 - minutes);
    }
    if (hours > -1) {
      setRevHours(24 - hours);
    }
    if (days > -1) {
      setRevDays(30 - days);
    }
  };

  useEffect(() => {
    initialzingRing();
  }, []);
  const { t } = useTranslation();
  return (
    <div className={styles[prob.classNamewrapper]}>
      {days > -1 && (
        <div className={styles.countdownItem}>
          <SVGCircle radius={daysRadius} constRadius={359.99999} color={prob.colorSvg} />
          <div className={styles.timeValue} style={{ color: `${prob.colorTimeTitle}` }}>
            {days}
          </div>
          <div className={styles.timeTitle} style={{ color: `${prob.colorTimeTitle}` }}>
            {t(LanguageKey.countdown_Days)}
          </div>
        </div>
      )}
      {hours > -1 && (
        <div className={styles.countdownItem}>
          <SVGCircle radius={hoursRadius} constRadius={359.99999} color={prob.colorSvg} />
          <div className={styles.timeValue} style={{ color: `${prob.colorTimeTitle}` }}>
            {hours}
          </div>
          <div className={styles.timeTitle} style={{ color: `${prob.colorTimeTitle}` }}>
            {t(LanguageKey.countdown_Hours)}
          </div>
        </div>
      )}
      {minutes > -1 && (
        <div className={styles.countdownItem}>
          <SVGCircle radius={minutesRadius} constRadius={359.99999} color={prob.colorSvg} />
          <div className={styles.timeValue} style={{ color: `${prob.colorTimeTitle}` }}>
            {minutes}
          </div>
          <div className={styles.timeTitle} style={{ color: `${prob.colorTimeTitle}` }}>
            {t(LanguageKey.countdown_Minutes)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstantCounterDown;
