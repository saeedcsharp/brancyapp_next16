import styles from "brancy/components/design/loader/typing.module.css";
const Typing = () => {
  return (
    <div className={styles.dotContainer}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  );
};

export default Typing;
