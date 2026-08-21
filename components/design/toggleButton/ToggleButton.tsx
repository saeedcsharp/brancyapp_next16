import styles from "./ToggleButton.module.css";
import { ToggleButtonProps, ToggleOption } from "brancy/components/design/toggleButton/types";
import { DirectionContext } from "brancy/context/directionContext";
import { useContext } from "react";

const ToggleButton = ({
  options,
  selectedValue,
  onChange,
  className = "",
  ariaLabel,
  disabled = false,
  data,
  values,
  toggleValue,
  setChangeToggle,
}: ToggleButtonProps) => {
  const direction = useContext(DirectionContext);
  const resolvedOptions: ToggleOption[] =
    options ??
    [
      { id: 0, label: values?.firstToggle ?? data?.firstToggle ?? "" },
      { id: 1, label: values?.secondToggle ?? data?.secondToggle ?? "" },
    ].filter((option) => option.label.length > 0);
  const resolvedSelectedValue = selectedValue ?? toggleValue ?? 0;
  const resolvedOnChange = onChange ?? setChangeToggle;

  if (resolvedOptions.length === 0) {
    return null;
  }
  const selectedOptionIndex = resolvedOptions.findIndex((option) => option.id === resolvedSelectedValue);
  const activeOptionIndex = selectedOptionIndex === -1 ? 0 : selectedOptionIndex;
  const indicatorGapOffset = activeOptionIndex * 2;
  const handleToggleClick = (value: number) => {
    if (value !== resolvedSelectedValue) {
      resolvedOnChange?.(value);
    }
  };
  return (
    <div
      className={`translate ${styles.toggleGroup} ${className}`}
      role="group"
      aria-label={ariaLabel}
      style={{ gridTemplateColumns: `repeat(${resolvedOptions.length}, minmax(0, 1fr))` }}>
      <span
        className={styles.activeIndicator}
        aria-hidden="true"
        style={{
          width: `calc((100% - 10px - ${Math.max(resolvedOptions.length - 1, 0) * 2}px) / ${resolvedOptions.length})`,
          transform: `translateX(calc(${
            activeOptionIndex *
            // direction === "rtl" ? -100 :
            100
          }% + ${indicatorGapOffset}px))`,
        }}
      />
      {resolvedOptions.map((option) => (
        <button
          type="button"
          key={option.id}
          onClick={() => handleToggleClick(option.id)}
          className={resolvedSelectedValue === option.id ? styles.toggleOptionActive : styles.toggleOptionInactive}
          aria-pressed={resolvedSelectedValue === option.id}
          disabled={disabled}
          title={option.label}>
          <span className={styles.toggleOptionLabel}>
            {option.label}
            {(option.unreadCount ?? 0) > 0 && <span className={styles.toggleOptionBadge} aria-hidden="true" />}
          </span>
        </button>
      ))}
    </div>
  );
};
export default ToggleButton;
