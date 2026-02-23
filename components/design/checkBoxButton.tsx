import { ChangeEvent, CSSProperties } from "react";
import styles from "brancy/components/design/checkBoxButton.module.css";

const CheckBoxButton = (props: {
  handleToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  value: boolean;
  textlabel?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  checkmarkStyle?: CSSProperties;
  textLabelStyle?: CSSProperties;

  name?: string;
  title: string;
}) => {
  return (
    <>
      <label className={styles.customcheckbox} style={props.labelStyle}>
        <input
          name={props.name}
          role="checkbox"
          className={styles.checkbox}
          type="checkbox"
          checked={props.value}
          onChange={props.handleToggle}
          style={props.style}
        />
        <span className={styles.checkmark} style={props.checkmarkStyle}>
          {" "}
        </span>
        <span className={styles.textLabel} style={props.textLabelStyle}>
          {props.textlabel}
        </span>
      </label>
    </>
  );
};

export default CheckBoxButton;
