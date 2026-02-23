import { ChangeEvent } from "react";
import styles from "brancy/components/design/radioButton.module.css";
const RadioButton = (props: {
  name: string;
  checked: boolean;
  textlabel: string;
  id: string;
  title?: string;
  handleOptionChanged: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <>
      <input
        name={props.name}
        id={props.id}
        className={styles.radioButtonInput}
        type="radio"
        role="radio"
        onChange={props.handleOptionChanged}
        checked={props.checked}
      />
      <label htmlFor={props.id} className={styles.radioButtonLabel}>
        <span className={styles.radioButtonCustom}></span>
        {props.textlabel}
      </label>
    </>
  );
};

export default RadioButton;
