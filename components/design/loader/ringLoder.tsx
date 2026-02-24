import { CSSProperties } from "react";
import style from "./ringLoder.module.css";

interface RingLoaderProps {
  style?: CSSProperties;
  color?: "white" | "blue";
  width?: number | string;
  height?: number | string;
}

const RingLoader = ({ style: customStyle, color = "blue", width = 35, height = 35 }: RingLoaderProps) => {
  const strokeColor = color === "white" ? "#ffffff" : "var(--color-dark-blue)";

  return (
    <div className={style.loader} style={customStyle}>
      <svg
        className={style.svg}
        viewBox="25 25 50 50"
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        }}>
        <circle r="20" cy="50" cx="50" style={{ stroke: strokeColor }}></circle>
      </svg>
    </div>
  );
};

export default RingLoader;
