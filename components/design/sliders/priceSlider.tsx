import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Slider from "react-slider";
import { LanguageKey } from "brancy/i18n";
import styles from "./slider.module.css";

function PriceSlider(props: {
  handleChangePrice: (minValue: number, maxValue: number) => void;
  price: {
    min: number;
    max: number;
  };
  maxPrice?: number;
  minPrice?: number;
}) {
  const [minValue, setMinValue] = useState(props.price.min);
  const [maxValue, setMaxValue] = useState(props.price.max);
  const [rangePositionValues, setRangePositionValues] = useState([minValue, maxValue]);

  // Check if RTL direction
  const isRTL = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const maxPriceValue = props.maxPrice !== undefined ? props.maxPrice : 2000;
  const minPriceValue = props.minPrice !== undefined ? props.minPrice : 0;

  const formatNumber = (num: number) => {
    return Number(num.toFixed(2));
  };
  const { t } = useTranslation();

  const handleRangePositionChange = (newValues: number[]) => {
    let actualMin, actualMax;

    if (isRTL) {
      // In RTL, reverse the values
      actualMin = maxPriceValue + minPriceValue - newValues[1];
      actualMax = maxPriceValue + minPriceValue - newValues[0];
    } else {
      actualMin = newValues[0];
      actualMax = newValues[1];
    }

    setRangePositionValues(newValues);
    setMinValue(actualMin);
    setMaxValue(actualMax);
  };

  useEffect(() => {
    const newMin = props.price.min;
    const newMax = props.price.max;

    if (isRTL) {
      // Convert actual values to slider values for RTL
      const sliderMin = maxPriceValue + minPriceValue - newMax;
      const sliderMax = maxPriceValue + minPriceValue - newMin;
      setRangePositionValues([sliderMin, sliderMax]);
    } else {
      setRangePositionValues([newMin, newMax]);
    }

    setMinValue(newMin);
    setMaxValue(newMax);
  }, [props.price, isRTL, maxPriceValue, minPriceValue]);

  return (
    <>
      <Slider
        className={styles.slider2}
        onChange={handleRangePositionChange}
        onAfterChange={() => props.handleChangePrice(minValue, maxValue)}
        value={rangePositionValues}
        minDistance={10}
        step={1}
        max={maxPriceValue}
        min={minPriceValue}
      />
      <div className={styles.fromto}>
        <div className={styles.price}>
          <div className="explain">{t(LanguageKey.from)}</div>
          <div className="title">{formatNumber(minValue)}</div>
        </div>
        <div className={styles.clocks}>-</div>
        <div className={styles.price}>
          <div className="explain">{t(LanguageKey.to)}</div>
          <div className="title">{formatNumber(maxValue)}</div>
        </div>
      </div>
    </>
  );
}

export default PriceSlider;
