import { useEffect, useState } from "react";
import styles from "./counterDown.module.css";
import SVGCircle from "./svgCircle";

export enum ShowRings {
  Days = 0,
  Hours = 1,
  Minutes = 2,
}

interface IDaily {
  intDays: number;
  intHours: number;
  intMinutes: number;
  intSeconds: number;
}

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

const MultipleColorCounterDown = (prob: {
  itemId: number;
  upingTime: number;
  isDead: (itemId: number) => void;
  classNamewrapper: string;
}) => {
  let interval: number = 0;
  var upingTime = identifyUpingTimeType(prob.upingTime);

  const convertUpingTimeToDailyTimes = (): IDaily => {
    const diffTime = Math.abs(upingTime - Date.now() / 1000);
    const intdays = (diffTime - (diffTime % 86400)) / 86400;
    const intHoures = ((diffTime % 86400) - (diffTime % 3600)) / 3600;
    const intMinutes = ((diffTime % 3600) - (diffTime % 60)) / 60;
    const intSecons = Math.floor(((diffTime % 60) / 60) * 100);
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

  const colors = [
    "#2977ff",
    "#3a73fc",
    "#4b6ff9",
    "#5c6bf6",
    "#6d67f3",
    "#7e63f0",
    "#8f5fed",
    "#a05be9",
    "#b157e6",
    "#c253e3",
    "#d34fe0",
    "#e44bdc",
    "#f547d9",
    "#ff43d6",
    "#ff43c8",
    "#ff43ba",
    "#ff43ac",
    "#ff439e",
    "#ff4390",
    "#ff4382",
    "#ff4374",
    "#ff4366",
    "#ff4358",
    "#ff434a",
    "#ff433c",
    "#ff432e",
    "#ff4320",
    "#ff4312",
    "#ff4304",
    "#ff4200",
  ];

  const handleSvgColor = (): string => {
    return colors[Math.max(0, Math.min(30 - minutes, 29))];
  };

  const handleRing = () => {
    if (upingTime < Date.now() / 1000 && seconds === 0) {
      prob.isDead(prob.itemId);
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
      setMinutes(minutes - 1);
      setRevMinutes(61 - minutes);
    }
    if (minutes === -1) {
      setMinutes(60);
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
      {minutes > 0 && (
        <>
          <div
            className={styles.test}
            style={{
              color: handleSvgColor(),
            }}></div>
          <div className={styles.countdownItem}>
            <SVGCircle radius={minutesRadius} constRadius={359.99999} color={handleSvgColor()} />
            <div className={styles.timeValue} style={{ color: `${handleSvgColor()}` }}>
              {minutes}
            </div>
            <div className={styles.timeTitle} style={{ color: `${handleSvgColor()}` }}></div>
          </div>
        </>
      )}
      {minutes === 0 && (
        <>
          <div
            className={styles.fast}
            style={{
              color: handleSvgColor(),
            }}></div>
          <div className={styles.countdownItem}>
            <SVGCircle radius={secondsRadius} constRadius={359.99999} color={handleSvgColor()} />
            <div className={styles.timeValue} style={{ color: `${handleSvgColor()}` }}>
              {seconds}
            </div>
            <div className={styles.timeTitle} style={{ color: `${handleSvgColor()}` }}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default MultipleColorCounterDown;
