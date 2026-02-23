import styles from "brancy/components/advertise/popups/adPopupStyle.module.css";
export default function AdvertisingTermsPopup(props: { removeMask: () => void; data: string[] }) {
  return (
    <>
      <div className="headerandinput">
        <div className="title">AD Terms</div>
      </div>

      <div className={styles.all}>
        {props.data.map((v, i) => (
          <div style={{ color: "black" }} key={i}>
            {v}
          </div>
        ))}
      </div>
    </>
  );
}
