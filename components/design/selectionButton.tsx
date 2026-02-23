import styles from "brancy/components/design/selectionButton.module.css";
const SelectionButton = (prop: { addAlternativePage: () => void; activeSelection: boolean }) => {
  return (
    <>
      <div
        onClick={prop.addAlternativePage}
        className={!prop.activeSelection ? styles.outerSelection : styles.deactice}>
        <div className={styles.innerSelection}>+</div>
      </div>
    </>
  );
};

export default SelectionButton;
