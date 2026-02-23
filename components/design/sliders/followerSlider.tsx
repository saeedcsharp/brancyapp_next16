import { useEffect, useState } from "react";
import Slider from "react-slider";
import { calculateSummary } from "brancy/helper/numberFormater";
import styles from "brancy/components/design/sliders/slider.module.css";

function FollowerSlider(props: {
  handleChangePrice: (minValue: number, maxValue: number) => void;
  follower: {
    min: number;
    max: number;
  };
}) {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1000000);
  const [rangePositionValues, setRangePositionValues] = useState([minValue, maxValue]);
  const handleRangePositionChange = (newValues: number[]) => {
    setRangePositionValues(newValues);
    setMinValue(newValues[0]);
    setMaxValue(newValues[1]);
  };
  useEffect(() => {
    setMinValue(props.follower.min);
    setMaxValue(props.follower.max);
    setRangePositionValues([props.follower.min, props.follower.max]);
  }, [props.follower]);
  return (
    <>
      <Slider
        className={styles.slider2}
        onChange={handleRangePositionChange}
        onAfterChange={() => props.handleChangePrice(minValue, maxValue)}
        value={rangePositionValues}
        minDistance={10000}
        step={10000}
        max={1000000}
      />
      <div className={styles.fromto}>
        <div className={styles.clocks}>{calculateSummary(minValue)}</div>
        <div className={styles.clocks}>{calculateSummary(maxValue)}</div>
      </div>
    </>
  );
}

export default FollowerSlider;
