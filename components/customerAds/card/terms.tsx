import styles from "saeed/components/customerAds/customerAds.module.css";
function Terms(props: { terms: string[] }) {
  return (
    <>
      <div className={styles.all}>
        {props.terms.map((v, i) => (
          <div className={styles.terms} key={i}>
            {v}
          </div>
        ))}
      </div>
    </>
  );
}

export default Terms;
