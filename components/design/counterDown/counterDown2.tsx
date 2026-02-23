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

interface IDaily {
  intDays: number;
  intHours: number;
  intMinutes: number;
  intSeconds: number;
}
// Stackoverflow: https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
function mapNumber(number: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return ((number - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
function identifyUpingTimeType(timestamp: number): number {
  const timestampString = timestamp.toString();

  if (timestampString.length === 10) {
    return timestamp;
  } else if (timestampString.length === 13) {
    return timestamp / 1e3;
  } else if (timestampString.length === 16) {
    return timestamp / 1e6;
  } else {
    return 0;
  }
}

const CounterDown2 = (prob: {
  // itemId: string;
  upingTime: number;
  isDead: () => void;
  classNamewrapper: string;
  colorSvg: string;
  colorTimeTitle: string;
  showRings: ShowRings;
}) => {
  let interval: number = 0;
  var upingTime = identifyUpingTimeType(prob.upingTime);
  const convertUpingTimeToDailyTimes = (): IDaily => {
    const diffTime = Math.abs(upingTime - Date.now() / 1000);
    const intdays = (diffTime - (diffTime % 86400)) / 86400;
    const intHoures = ((diffTime % 86400) - (diffTime % 3600)) / 3600;
    const intMinutes = ((diffTime % 3600) - (diffTime % 60)) / 60;
    const intSecons = (diffTime % 60) % 60;
    return {
      intDays: intdays,
      intHours: intHoures,
      intMinutes: intMinutes,
      intSeconds: intSecons,
    };
  };

  const [days, setDays] = useState<number>(convertUpingTimeToDailyTimes().intDays);
  const [minutes, setMinutes] = useState<number>(convertUpingTimeToDailyTimes().intMinutes);
  const [hours, setHour] = useState<number>(convertUpingTimeToDailyTimes().intHours);
  const [seconds, setSeconds] = useState<number>(convertUpingTimeToDailyTimes().intSeconds);
  const [revSecond, setRevSecond] = useState<number>(0);
  const [revMinutes, setRevMinutes] = useState<number>(0);
  const [revHours, setRevHours] = useState<number>(0);
  const [revDays, setRevDays] = useState<number>(0);

  const daysRadius = mapNumber(revDays, 30, 0, 0, 360);
  const hoursRadius = mapNumber(revHours, 24, 0, 0, 360);
  const minutesRadius = mapNumber(revMinutes, 60, 0, 0, 360);
  const secondsRadius = mapNumber(revSecond, 60, 0, 0, 360);

  const handleRing = () => {
    if (upingTime < Date.now() / 1000) {
      console.log("upingTimeeeeeeeeee", upingTime);
      console.log("nowwwwwwwww", Date.now() / 1000);
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
    convertUpingTimeToDailyTimes();
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
  const { t } = useTranslation();
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

export default CounterDown2;
