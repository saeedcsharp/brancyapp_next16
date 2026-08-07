import styles from "./ToggleButton.module.css";
import { ToggleButtonProps } from "brancy/components/design/toggleButton/types";
const ToggleButton = ({
  options,
  selectedValue,
  onChange,
  className = "",
  ariaLabel,
  disabled = false,
}: ToggleButtonProps) => {
  if (options.length === 0) {
    return null;
  }
  const selectedOptionIndex = options.findIndex((option) => option.id === selectedValue);
  const activeOptionIndex = selectedOptionIndex === -1 ? 0 : selectedOptionIndex;
  const indicatorGapOffset = activeOptionIndex * 2;
  const handleToggleClick = (value: number) => {
    if (value !== selectedValue) {
      onChange(value);
    }
  };
  return (
    <div
      className={`${styles.toggleGroup} ${className}`}
      role="group"
      aria-label={ariaLabel}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      <span
        className={styles.activeIndicator}
        aria-hidden="true"
        style={{
          width: `calc((100% - 10px - ${Math.max(options.length - 1, 0) * 2}px) / ${options.length})`,
          transform: `translateX(calc(${activeOptionIndex * 100}% + ${indicatorGapOffset}px))`,
        }}
      />
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          onClick={() => handleToggleClick(option.id)}
          className={selectedValue === option.id ? styles.toggleOptionActive : styles.toggleOptionInactive}
          aria-pressed={selectedValue === option.id}
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
