import styles from "./emptyPopupState.module.css";

export default function EmptyPopupState({ icon = "/no-data.svg", label }: { icon?: string; label: string }) {
  return (
    <div className={styles.emptyState} role="status">
      <img src={icon} alt="" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
