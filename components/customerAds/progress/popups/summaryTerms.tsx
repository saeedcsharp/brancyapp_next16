import styles from "brancy/components/customerAds/progress/popups/summaryTerms.module.css";
const SummaryTerms = (props: { terms: string; removeMask: () => void }) => {
  return (
    <>
      <div
        onClick={props.removeMask}
        className="dialogBg"
        style={{
          backgroundColor: "transparent",
          backdropFilter: "blur(5px)",
        }}
      />
      <div className={styles.taskpopup2}>
        <div className="title">Terms and Condition</div>

        <div className={styles.terms}>{props.terms}</div>

        <button onClick={props.removeMask} className="cancelButton">
          close
        </button>
      </div>
    </>
  );
};

export default SummaryTerms;
