import { ChangeEvent, CSSProperties, InputHTMLAttributes } from "react";
import styles from "./checkBoxButton.module.css";

interface CheckBoxButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "onChange" | "type" | "value" | "className" | "style"
> {
  handleToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  value: boolean;
  textlabel?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  checkmarkStyle?: CSSProperties;
  textLabelStyle?: CSSProperties;
  className?: string;
  title?: string;
}

const CheckBoxButton = ({
  handleToggle,
  value,
  textlabel,
  style,
  labelStyle,
  checkmarkStyle,
  textLabelStyle,
  className,
  title,
  ...inputProps
}: CheckBoxButtonProps) => {
  return (
    <label className={`${styles.CheckBox}${className ? ` ${className}` : ""}`} style={labelStyle}>
      <input
        {...inputProps}
        className={styles.input}
        type="checkbox"
        checked={value}
        onChange={handleToggle}
        style={style}
        title={title}
      />
      <span className={styles.indicator} aria-hidden="true" style={checkmarkStyle} />
      {textlabel && (
        <span className={styles.label} style={textLabelStyle}>
          {textlabel}
        </span>
      )}
    </label>
  );
};

export default CheckBoxButton;
