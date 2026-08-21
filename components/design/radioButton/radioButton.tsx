import { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import styles from "./radioButton.module.css";
interface RadioButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "className" | "onChange" | "type"
> {
  name: string;
  checked: boolean;
  id: string;
  label?: ReactNode;
  textlabel?: ReactNode;
  title?: string;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleOptionChanged?: (event: ChangeEvent<HTMLInputElement>) => void;
}
const RadioButton = ({
  checked,
  className,
  handleOptionChanged,
  label,
  onChange,
  textlabel,
  title,
  ...inputProps
}: RadioButtonProps) => {
  const labelContent = label ?? textlabel;
  return (
    <label className={`${styles.label}${className ? ` ${className}` : ""}`} title={title}>
      <input
        {...inputProps}
        className={styles.input}
        type="radio"
        checked={checked}
        onChange={onChange ?? handleOptionChanged}
        title={title}
      />
      <span className={styles.indicator} aria-hidden="true" />
      {labelContent && <span className={styles.labelText}>{labelContent}</span>}
    </label>
  );
};
export default RadioButton;
