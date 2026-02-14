import { useState } from "react";
import Slider from "react-slider";
import { numbTo24HourTime, numbToAmAndPmTime } from "saeed/helper/numberFormater";
import { IBusinessHour } from "saeed/models/advertise/peoperties";
import styles from "./slider.module.css";

const TimerSlider = (props: {
  info: IBusinessHour;
  activeTimer: boolean;
  changeSliderValue: (info: IBusinessHour) => void;
}) => {
  const [minValue, setMinValue] = useState(numbTo24HourTime(props.activeTimer ? props.info.timerInfo?.startTime : 0));
  const [maxValue, setMaxValue] = useState(numbTo24HourTime(props.activeTimer ? props.info.timerInfo?.endTime : 84600));
  const [rangePositionValues, setRangePositionValues] = useState([minValue, maxValue]);
  const handleRangePositionChange = (newValues: number[]) => {
    if (!props.activeTimer) return;
    setRangePositionValues(newValues);
    setMinValue(newValues[0]);
    setMaxValue(newValues[1]);
    props.changeSliderValue({
      dayName: props.info.dayName,
      timerInfo: {
        endTime: newValues[1] * 3600,
        startTime: newValues[0] * 3600,
      },
    });
  };
  return (
    <>
      <Slider
        className={styles.slider2}
        onChange={handleRangePositionChange}
        value={rangePositionValues}
        minDistance={1}
        step={0.5}
        max={23.5}
      />
      <div className={styles.fromto}>
        <div className={styles.clocks}>{numbToAmAndPmTime(minValue * 3600)}</div>
        {"  "} - {"  "}
        <div className={styles.clocks}>{numbToAmAndPmTime(maxValue * 3600)}</div>
      </div>
    </>
  );
};
export default TimerSlider;
