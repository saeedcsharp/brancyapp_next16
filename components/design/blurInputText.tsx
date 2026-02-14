import { ChangeEvent } from "react";
import styles from "./inputBox.module.css";

const BlurInputText = (props: {
  className: string;
  placeHolder: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  value: string;
  maxLength: number | undefined;
  name?: string; // Add optional name prop
}) => {
  return (
    <>
      <input
        maxLength={props.maxLength !== undefined ? props.maxLength : 100000}
        type="text"
        onChange={props.handleInputChange}
        onBlur={props.handleBlur}
        placeholder={props.placeHolder}
        className={styles[props.className]}
        value={props.value}
        name={props.name} // Add name attribute
      />
    </>
  );
};

export default BlurInputText;
