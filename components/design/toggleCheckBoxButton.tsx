import { ChangeEvent } from "react";
import styles from "./toggleCheckBoxButton.module.css";
const ToggleCheckBoxButton = (props: {
  handleToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
  name: string;
  title: string;
  role: string;
}) => {
  return (
    <>
      <label className={styles.lableToggle} aria-label="On or OFF toggle">
        <input
          name={props.name}
          className={styles.inputToggle}
          type="checkbox"
          checked={props.checked}
          onChange={props.handleToggle}
        />
        <span className={styles.spanToggle}></span>
      </label>
    </>
  );
};

export default ToggleCheckBoxButton;
