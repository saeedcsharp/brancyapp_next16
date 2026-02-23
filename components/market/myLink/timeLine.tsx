import { useState } from "react";
import { ITimeline } from "../../../models/market/myLink";
import styles from "./mylink.module.css";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const Timeline = (props: { data: ITimeline | null }) => {
  const [isContentVisible, setIsContentVisible] = useState(true);

  const toggleContentVisibility = () => {
    setIsContentVisible((prev) => !prev);
  };
  return (
    <>
      {props.data && (
        <div
          key={"timeline"}
          id="timeline"
          className={styles.all}
          style={{ backgroundColor: "var(--color-dark-blue10)" }}>
          <div className={styles.header} onClick={toggleContentVisibility}>
            <div className={`${styles.squre} ${!isContentVisible ? styles.closed : ""}`}></div>
            <div className={styles.headertext}>
              our
              <div className={styles.headertextblue}>timeline</div>
            </div>
            <div className={styles.line}></div>
          </div>

          <div className={`${styles.content} ${isContentVisible ? styles.show : ""}`}>
            <div className={styles.timelinecontnet}></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Timeline;
