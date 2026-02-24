import React from "react";
import styles from "./AIButton.module.css";

interface AIButtonProps {
  onClick: () => void;
  title?: string;
  ariaLabel?: string;
  size?: "small" | "normal" | "large";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const AIButton: React.FC<AIButtonProps> = ({
  onClick,
  title = "AI Assistant",
  ariaLabel = "AI Assistant",
  size = "normal",

  loading = false,
  disabled = false,
  className = "",
  style,
  children,
}) => {
  const buttonClasses = [styles.AIBtn, loading ? styles.loading : "", className].filter(Boolean).join(" ");

  return (
    <button
      className={buttonClasses}
      style={style}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      type="button">
      <div className={styles.wrapper}>
        {loading ? (
          <svg
            className={styles.sparkle}
            width="24px"
            style={{ zIndex: 5, position: "relative" }}
            fill="#FFF"
            stroke="#FFF"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30 30">
            <path d="m16.8 9.8.9-2.8.8 2.8a5 5 0 0 0 3.1 3l2.9.9-2.9.8a5 5 0 0 0-3 3.1l-.9 2.8-.8-2.8a5 5 0 0 0-3.1-3l-2.8-.9 2.8-.8a5 5 0 0 0 3-3.1Z" />
            <path d="m9 17.3-.3 1a3 3 0 0 1-2.4 2.4l-1 .3 1 .3a3 3 0 0 1 2.4 2.4l.3 1 .3-1a3 3 0 0 1 2.4-2.4l1-.3-1-.3a3 3 0 0 1-2.4-2.4z" />
            <path d="m9.5 7-.2.6a1 1 0 0 1-.7.7l-.6.2.6.2a1 1 0 0 1 .7.7l.2.6.2-.6a1 1 0 0 1 .7-.7l.6-.2-.6-.2a1 1 0 0 1-.7-.7z" />
          </svg>
        ) : children ? (
          <span style={{ zIndex: 5, position: "relative" }}>{children}</span>
        ) : (
          <svg
            className="sparkle"
            width="24px"
            style={{ zIndex: 5, position: "relative" }}
            fill="#FFF"
            stroke="#FFF"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30 30">
            <path d="m16.8 9.8.9-2.8.8 2.8a5 5 0 0 0 3.1 3l2.9.9-2.9.8a5 5 0 0 0-3 3.1l-.9 2.8-.8-2.8a5 5 0 0 0-3.1-3l-2.8-.9 2.8-.8a5 5 0 0 0 3-3.1Z" />
            <path d="m9 17.3-.3 1a3 3 0 0 1-2.4 2.4l-1 .3 1 .3a3 3 0 0 1 2.4 2.4l.3 1 .3-1a3 3 0 0 1 2.4-2.4l1-.3-1-.3a3 3 0 0 1-2.4-2.4z" />
            <path d="m9.5 7-.2.6a1 1 0 0 1-.7.7l-.6.2.6.2a1 1 0 0 1 .7.7l.2.6.2-.6a1 1 0 0 1 .7-.7l.6-.2-.6-.2a1 1 0 0 1-.7-.7z" />
          </svg>
        )}

        <div className={`${styles.circle} ${styles.circle4}`}></div>
        <div className={`${styles.circle} ${styles.circle3}`}></div>
        <div className={`${styles.circle} ${styles.circle2}`}></div>
        <div className={`${styles.circle} ${styles.circle1}`}></div>
      </div>
    </button>
  );
};

export default AIButton;
