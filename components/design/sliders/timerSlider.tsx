import { useState } from "react";
import Slider from "react-slider";
import { numbTo24HourTime, numbToAmAndPmTime } from "brancy/helper/numberFormater";
import styles from "./slider.module.css";
import { IBusinessHour } from "brancy/models/interfaces";

const TimerSlider = (props: {
  info: IBusinessHour;
  activeTimer: boolean;
  changeSliderValue: (info: IBusinessHour) => void;
}) => {
  const [minValue, setMinValue] = useState(numbTo24HourTime(props.activeTimer ? props.info.beginTime : 0));
  const [maxValue, setMaxValue] = useState(numbTo24HourTime(props.activeTimer ? props.info.endTime : 84600));
  const [rangePositionValues, setRangePositionValues] = useState([minValue, maxValue]);
  const handleRangePositionChange = (newValues: number[]) => {
    if (!props.activeTimer) return;
    setRangePositionValues(newValues);
    setMinValue(newValues[0]);
    setMaxValue(newValues[1]);
    props.changeSliderValue({
      weekday: props.info.weekday,
      endTime: newValues[1] * 3600,
      beginTime: newValues[0] * 3600,
      instagramerId: props.info.instagramerId,
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
