import { ChangeEvent, InputHTMLAttributes } from "react";
import styles from "./switchButton.module.css";
interface SwitchButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "className" | "onChange" | "type"
> {
  handleToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
  name: string;
  className?: string;
}
const SwitchButton = ({ checked, className, handleToggle, role, title, ...inputProps }: SwitchButtonProps) => {
  const accessibleRole = role?.trim();
  const normalizedRole = accessibleRole === "switch" || accessibleRole === "checkbox" ? accessibleRole : undefined;
  return (
    <label className={`${styles.root}${className ? ` ${className}` : ""}`}>
      <input
        {...inputProps}
        className={styles.input}
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
        role={normalizedRole}
        aria-checked={normalizedRole === "switch" ? checked : undefined}
        title={title}
      />
      <span className={styles.track} aria-hidden="true" />
    </label>
  );
};
export default SwitchButton;
