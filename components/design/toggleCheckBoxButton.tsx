import { ChangeEvent } from "react";
import styles from "brancy/components/design/toggleCheckBoxButton.module.css";
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
        <span className={styles.spanToggle}>
          {props.checked ? (
            <svg fill="none" viewBox="0 0 80 70" className={styles.enableCheckBox}>
              <path
                d="M70 15 28.7 60 10 39.5"
                stroke="var(--color-ffffff)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="20"
              />
            </svg>
          ) : (
            <svg fill="none" viewBox="0 0 170 180" className={styles.disablCheckBox}>
              <path
                d="m100 85 66-67c2-2 3-5 3-8 0-5-5-10-10-10a10 10 0 0 0-8 3L84 70 18 3a10 10 0 0 0-8-3A10 10 0 0 0 0 10c0 3 1 6 3 8l67 67-4 3-63 65a10 10 0 0 0 7 17c3 0 6-1 8-3l12-13 54-54 67 67c4 5 10 5 15 0 4-4 4-10 0-15L99 85Z"
                fill="var(--color-ffffff)"
              />
            </svg>
          )}
        </span>
      </label>
    </>
  );
};

export default ToggleCheckBoxButton;
