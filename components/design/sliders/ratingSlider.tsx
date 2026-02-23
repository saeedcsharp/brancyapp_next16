import { useEffect, useState } from "react";
import Slider from "react-slider";
import styles from "brancy/components/design/sliders/slider.module.css";

function RatingSlider(props: {
  handleChangeRate: (minValue: number, maxValue: number) => void;
  rating: {
    min: number;
    max: number;
  };
}) {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(5);
  const [rangePositionValues, setRangePositionValues] = useState([minValue, maxValue]);
  const handleRangePositionChange = (newValues: number[]) => {
    setRangePositionValues(newValues);
    setMinValue(newValues[0]);
    setMaxValue(newValues[1]);
  };
  useEffect(() => {
    setMinValue(props.rating.min);
    setMaxValue(props.rating.max);
    setRangePositionValues([props.rating.min, props.rating.max]);
  }, [props.rating]);
  return (
    <>
      <Slider
        className={styles.slider2}
        onChange={handleRangePositionChange}
        onAfterChange={() => props.handleChangeRate(minValue, maxValue)}
        value={rangePositionValues}
        minDistance={0.5}
        step={0.5}
        max={5}
      />
      <div className={styles.fromto}>
        <div className={styles.clocks}>{minValue}</div>
        <div className={styles.clocks}>{maxValue}</div>
      </div>
    </>
  );
}

export default RatingSlider;
