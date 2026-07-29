"use client";

import Link from "next/link";
import styles from "./error.module.css";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className={styles.room}>
      <div className={styles.cuboid}>
        <div className={styles.side}></div>
        <div className={styles.side}></div>
        <div className={styles.side}></div>
      </div>

      <div className={styles.oops}>
        <h2>Internal Server Error!</h2>
        <p>Something went wrong on our server. Please try again Again! </p>
      </div>

      <div className={styles.centerLine}>
        <div className={styles.hole}>
          <div className={styles.ladderShadow}></div>

          <div className={styles.ladder}></div>
        </div>

        <div className={styles.four}>5</div>

        <div className={styles.four}>0</div>

        <div className={styles.btn} onClick={reset}>
          Try Again
        </div>
      </div>
    </div>
  );
}
