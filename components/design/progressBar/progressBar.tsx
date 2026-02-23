import styles from "brancy/components/design/progressBar/progressBar.module.css";

interface ProgressBarProps {
  width: number;
  color?: "default" | "orange" | "red";
  role?: string;
  "aria-valuenow"?: number;
  "aria-valuemin"?: number;
  "aria-valuemax"?: number;
  "aria-label"?: string;
}

const ProgressBar = (props: ProgressBarProps) => {
  const getInnerClassName = () => {
    switch (props.color) {
      case "orange":
        return `${styles.inner} ${styles.orange}`;
      case "red":
        return `${styles.inner} ${styles.red}`;
      case "default":
      default:
        return `${styles.inner} ${styles.default}`;
    }
  };

  return (
    <>
      <div
        className={styles.outer}
        role={props.role}
        aria-valuenow={props["aria-valuenow"]}
        aria-valuemin={props["aria-valuemin"]}
        aria-valuemax={props["aria-valuemax"]}
        aria-label={props["aria-label"]}>
        <div className={getInnerClassName()} style={{ width: `${props.width}%` }} />
      </div>
    </>
  );
};

export default ProgressBar;
