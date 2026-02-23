import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/design/counterDown/counterDown.module.css";
import SVGCircle from "brancy/components/design/counterDown/svgCircle";
export enum ShowRings {
  All = 0,
  MinutesAndHours = 1,
  Minutes = 2,
}
// Stackoverflow: https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
function mapNumber(number: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return ((number - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

const CounterDown = (prob: {
  expireTime: number;
  second: number;
  minute: number;
  hour: number;
  day: number;
  isDead: () => void;
  classNamewrapper: string;
  colorSvg: string;
  colorTimeTitle: string;
  showRings: ShowRings;
}) => {
  let interval: number = 0;
  const { t } = useTranslation();
  const [days, setDays] = useState<number>(prob.day);
  const [minutes, setMinutes] = useState<number>(prob.minute);
  const [hours, setHour] = useState<number>(prob.hour);
  const [seconds, setSeconds] = useState<number>(prob.second);
  const [revSecond, setRevSecond] = useState<number>(0);
  const [revMinutes, setRevMinutes] = useState<number>(0);
  const [revHours, setRevHours] = useState<number>(0);
  const [revDays, setRevDays] = useState<number>(0);

  const daysRadius = mapNumber(revDays, 30, 0, 0, 360);
  const hoursRadius = mapNumber(revHours, 24, 0, 0, 360);
  const minutesRadius = mapNumber(revMinutes, 60, 0, 0, 360);
  const secondsRadius = mapNumber(revSecond, 60, 0, 0, 360);

  const handleRing = () => {
    if (prob.expireTime < Date.now() / 1000) {
      prob.isDead();
    }
    if (seconds === 60) {
      setRevSecond(1);
      setSeconds(seconds - 1);
    }
    if (minutes === 60) {
      setRevMinutes(1);
      setMinutes(minutes - 1);
    }
    if (hours === 24) {
      setRevHours(1);
      setHour(hours - 1);
    }
    if (days === 30) {
      setRevDays(1);
      setDays(days - 1);
    }
    if (Math.floor(seconds) === -1) {
      setSeconds(59);
      // setRevSecond(1);
      setMinutes(minutes - 1);
      setRevMinutes(61 - minutes);
    }
    if (minutes === -1) {
      setMinutes(60);
      //setRevSecond(1);
      setHour(hours - 1);
      setRevHours(25 - hours);
    }
    if (hours === -1) {
      setHour(24);
      setDays(days - 1);
      setRevDays(31 - days);
    }
    if (days === 0 && hours === 0 && minutes === 0) {
      setDays(0);
      setHour(0);
      setMinutes(0);
    }
  };

  const initialzingRing = () => {
    //handleRing();
    if (seconds > -1) {
      setRevSecond(60 - seconds);
    }
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
    handleRing();
    initialzingRing();
  }, []);

  useEffect(() => {
    handleRing();
    interval = window.setInterval(() => {
      if (Math.round(seconds) > -1) {
        setSeconds(seconds - 1);
        setRevSecond(60 - seconds);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  });

  return (
    <div className={styles[prob.classNamewrapper]}>
      {days > -1 && prob.showRings === ShowRings.All && (
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
      {hours > -1 && (prob.showRings === ShowRings.MinutesAndHours || prob.showRings === ShowRings.All) && (
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
      {minutes > -1 && prob.showRings === ShowRings.Minutes && (
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

export default CounterDown;
