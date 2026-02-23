import { useEffect, useState } from "react";
import styles from "brancy/components/design/counterDown/counterDownNotRing.module.css";
interface IDaily {
  intDays: number;
  intHours: number;
  intMinutes: number;
  intSeconds: number;
}
export enum CounterDownColor {
  Blue = 0,
  Red = 1,
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
function handleColor(timerColor: CounterDownColor) {
  let className = "timerblue";
  switch (timerColor) {
    case CounterDownColor.Blue:
      className = "timerblue";
      break;
    case CounterDownColor.Red:
      className = "timered";
      break;
  }
  return className;
}
function CounterDownNotRing(props: {
  unixTime: number;
  timerColor: CounterDownColor;
  isDead: () => void;
  messageAfterTimer?: string;
}) {
  let interval: number = 0;
  var upingTime = identifyUpingTimeType(props.unixTime);
  const convertUpingTimeToDailyTimes = (): IDaily => {
    const diffTime = Math.abs(upingTime - Date.now() / 1000);
    const intdays = (diffTime - (diffTime % 86400)) / 86400;
    const intHoures = ((diffTime % 86400) - (diffTime % 3600)) / 3600;
    const intMinutes = ((diffTime % 3600) - (diffTime % 60)) / 60;
    const intSecons = Math.floor(diffTime % 60);
    // console.log("intMinutes", intMinutes);
    // console.log("intSecons", intSecons);
    return {
      intDays: intdays,
      intHours: intHoures,
      intMinutes: intMinutes,
      intSeconds: intSecons > 59 ? 59 : intSecons,
    };
  };
  const [days, setDays] = useState<number>(convertUpingTimeToDailyTimes().intDays);
  const [minutes, setMinutes] = useState<number>(convertUpingTimeToDailyTimes().intMinutes);
  const [hours, setHour] = useState<number>(convertUpingTimeToDailyTimes().intHours);
  const [seconds, setSeconds] = useState<number>(convertUpingTimeToDailyTimes().intSeconds);

  const handleRing = () => {
    if (upingTime < Date.now() / 1000) {
      props.isDead();
    }
    if (seconds === 60) {
      setSeconds(seconds - 1);
    }
    if (minutes === 60) {
      setMinutes(minutes - 1);
    }
    if (hours === 24) {
      setHour(hours - 1);
    }
    if (days === 30) {
      setDays(days - 1);
    }
    if (Math.floor(seconds) === -1) {
      setSeconds(59);
      // setRevSecond(1);
      setMinutes(minutes - 1);
    }
    if (minutes === -1) {
      setMinutes(60);
      //setRevSecond(1);
      setHour(hours - 1);
    }
    if (hours === -1) {
      setHour(24);
      setDays(days - 1);
    }
    if (days === 0 && hours === 0 && minutes === 0) {
      setDays(0);
      setHour(0);
      setMinutes(0);
    }
  };
  useEffect(() => {
    handleRing();
    interval = window.setInterval(() => {
      if (Math.round(seconds) > -1) {
        setSeconds(seconds - 1);
        // setRevSecond(60 - seconds);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  });

  return (
    <div className={styles[handleColor(props.timerColor)]}>
      {minutes}:{seconds} {props.messageAfterTimer}
    </div>
  );
}

export default CounterDownNotRing;
