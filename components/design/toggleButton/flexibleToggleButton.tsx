import React from "react";
import styles from "./flexibleToggleButton.module.css";
import { FlexibleToggleButtonProps } from "./types";

const FlexibleToggleButton: React.FC<FlexibleToggleButtonProps> = ({
  options,
  selectedValue,
  onChange,
  className = "",
}) => {
  // Validate options length
  if (options.length < 2 || options.length > 4) {
    console.warn("FlexibleToggleButton: options length should be between 2 and 4");
    return null;
  }

  const handleToggleClick = (value: number) => {
    if (value !== selectedValue) {
      onChange(value);
    }
  };

  return (
    <div
      className={`${styles.switchTab2x} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        display: "grid",
      }}>
      {options.map((option) => (
        <div
          key={option.id}
          onClick={() => handleToggleClick(option.id)}
          className={selectedValue === option.id ? styles.active : styles.deactive}>
          <span className={styles.title}>
            {option.label}
            {(option.unreadCount ?? 0) > 0 && <span className={styles.unread} />}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FlexibleToggleButton;
